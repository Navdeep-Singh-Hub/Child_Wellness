/**
 * Web version of hand detection using MediaPipe Hand Landmarker
 * Tracks finger tip positions for tracing games
 */

import { useEffect, useRef, useState } from 'react';

export interface HandLandmarks {
  indexFingerTip: { x: number; y: number } | null;
  middleFingerTip: { x: number; y: number } | null;
  ringFingerTip: { x: number; y: number } | null;
  pinkyFingerTip: { x: number; y: number } | null;
  thumbTip: { x: number; y: number } | null;
  allLandmarks?: Array<{ 
    index: number; 
    name: string; 
    x: number; 
    y: number; 
    z: number;
  }>; // All 21 landmarks with names and coordinates (x, y, z)
}

export interface HandDetectionResult {
  handPosition: { x: number; y: number } | null; // Screen coordinates of finger tip
  isDetecting: boolean;
  hasCamera: boolean;
  error?: string;
  previewContainerId?: string;
  landmarks?: HandLandmarks | null;
}

// Constants for hand detection
const EMA_ALPHA = 0.3; // Smoothing factor for hand position
const THROTTLE_MS = 80; // ~12 fps

/**
 * Get human-readable name for landmark index
 * MediaPipe Hand Landmarks has 21 landmarks per hand
 */
function getLandmarkName(index: number): string {
  const names: { [key: number]: string } = {
    0: 'WRIST',
    1: 'THUMB_CMC', // Thumb carpometacarpal joint
    2: 'THUMB_MCP', // Thumb metacarpophalangeal joint
    3: 'THUMB_IP',  // Thumb interphalangeal joint
    4: 'THUMB_TIP',
    5: 'INDEX_FINGER_MCP', // Index finger metacarpophalangeal joint
    6: 'INDEX_FINGER_PIP', // Index finger proximal interphalangeal joint
    7: 'INDEX_FINGER_DIP', // Index finger distal interphalangeal joint
    8: 'INDEX_FINGER_TIP',
    9: 'MIDDLE_FINGER_MCP',
    10: 'MIDDLE_FINGER_PIP',
    11: 'MIDDLE_FINGER_DIP',
    12: 'MIDDLE_FINGER_TIP',
    13: 'RING_FINGER_MCP',
    14: 'RING_FINGER_PIP',
    15: 'RING_FINGER_DIP',
    16: 'RING_FINGER_TIP',
    17: 'PINKY_MCP',
    18: 'PINKY_PIP',
    19: 'PINKY_DIP',
    20: 'PINKY_TIP',
  };
  return names[index] || `UNKNOWN_${index}`;
}

// MediaPipe types - dynamic import to avoid issues in non-web environments
let HandLandmarker: any = null;
let FilesetResolver: any = null;

let handLandmarker: any = null;
let isInitialized = false;

/**
 * Load MediaPipe library dynamically
 */
async function loadMediaPipeLibrary(): Promise<boolean> {
  if (HandLandmarker && FilesetResolver) {
    return true;
  }

  try {
    if (typeof window === 'undefined') {
      return false;
    }

    // Dynamic import for web only
    const mediapipeModule = await import('@mediapipe/tasks-vision');
    HandLandmarker = mediapipeModule.HandLandmarker;
    FilesetResolver = mediapipeModule.FilesetResolver;

    if (!HandLandmarker || !FilesetResolver) {
      console.error('MediaPipe modules not found in package');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to load MediaPipe library:', error);
    return false;
  }
}

/**
 * Initialize MediaPipe Hand Landmarker
 */
async function initializeHandLandmarker(): Promise<boolean> {
  if (isInitialized && handLandmarker) {
    return true;
  }

  try {
    if (typeof window === 'undefined') {
      console.warn('Hand detection only works in browser environment');
      return false;
    }

    // Load MediaPipe library first
    const libraryLoaded = await loadMediaPipeLibrary();
    if (!libraryLoaded) {
      console.error('Failed to load MediaPipe library');
      return false;
    }

    // Initialize MediaPipe FilesetResolver
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
    );

    // Create Hand Landmarker
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 1, // Track one hand for simplicity
      minHandDetectionConfidence: 0.3, // Lower threshold for easier detection
      minHandPresenceConfidence: 0.3, // Lower threshold for easier detection
      minTrackingConfidence: 0.3, // Lower threshold for easier detection
    });

    isInitialized = true;
    console.log('✅ Hand Landmarker initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize hand landmarker:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return false;
  }
}

/**
 * Process video frame and detect hand landmarks
 */
async function processFrame(
  videoElement: HTMLVideoElement | HTMLCanvasElement,
  emaX: React.MutableRefObject<number>,
  emaY: React.MutableRefObject<number>
): Promise<{ 
  handPosition: { x: number; y: number } | null;
  landmarks?: HandLandmarks;
} | null> {
  if (!handLandmarker || !videoElement) {
    return null;
  }

  try {
    // Check if video is ready
    if (videoElement instanceof HTMLVideoElement) {
      if (videoElement.readyState < 2) {
        return null;
      }
      // Ensure video has valid dimensions
      if (!videoElement.videoWidth || !videoElement.videoHeight) {
        console.warn('⚠️ Video element has no dimensions:', {
          videoWidth: videoElement.videoWidth,
          videoHeight: videoElement.videoHeight,
          readyState: videoElement.readyState
        });
        return null;
      }
    }

    const timestamp = performance.now();
    
    // Create ImageData from video frame
    let imageData: ImageData;
    let width: number;
    let height: number;
    
    if (videoElement instanceof HTMLVideoElement) {
      width = videoElement.videoWidth;
      height = videoElement.videoHeight;
      
      // Create canvas to extract frame
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(videoElement, 0, 0, width, height);
      imageData = ctx.getImageData(0, 0, width, height);
    } else {
      width = videoElement.width;
      height = videoElement.height;
      const ctx = videoElement.getContext('2d');
      if (!ctx) return null;
      imageData = ctx.getImageData(0, 0, width, height);
    }

    // Validate imageData before processing
    if (!imageData || imageData.width === 0 || imageData.height === 0 || !imageData.data) {
      console.warn('⚠️ Invalid imageData:', {
        hasImageData: !!imageData,
        width: imageData?.width,
        height: imageData?.height,
        hasData: !!imageData?.data
      });
      return null;
    }
    
    // Validate MediaPipe is ready
    if (!handLandmarker || typeof handLandmarker.detectForVideo !== 'function') {
      console.warn('⚠️ HandLandmarker not ready:', {
        hasHandLandmarker: !!handLandmarker,
        hasDetectForVideo: handLandmarker && typeof handLandmarker.detectForVideo === 'function'
      });
      return null;
    }
    
    let result;
    try {
      // MediaPipe HandLandmarker.detectForVideo accepts ImageData directly (same as FaceLandmarker)
      console.log('🔍 Calling detectForVideo with ImageData, timestamp:', timestamp, 'dimensions:', width, 'x', height);
      result = handLandmarker.detectForVideo(imageData, timestamp);
      console.log('📊 Detection result:', {
        hasResult: !!result,
        hasLandmarks: !!(result && result.landmarks),
        landmarksCount: result?.landmarks?.length || 0
      });
    } catch (detectError) {
      // MediaPipe can throw errors during processing - handle gracefully
      console.error('❌ MediaPipe detection error:', detectError);
      if (detectError instanceof Error) {
        console.error('Error message:', detectError.message);
        console.error('Error stack:', detectError.stack);
      }
      return null;
    }
    
    if (!result) {
      console.warn('⚠️ No detection result returned');
      return null;
    }
    
    if (!result.landmarks) {
      console.warn('⚠️ Result has no landmarks property:', Object.keys(result));
      return null;
    }
    
    if (result.landmarks.length === 0) {
      console.warn('⚠️ No landmarks detected in result');
      return null;
    }
    
    console.log('✅ Landmarks detected! Count:', result.landmarks.length);

    const landmarks = result.landmarks[0];
    
    // Log all 21 landmarks with their indices
    console.log('👋 All 21 Hand Landmarks:');
    landmarks.forEach((landmark: any, index: number) => {
      console.log(`  Landmark ${index}:`, {
        x: landmark.x,
        y: landmark.y,
        z: landmark.z || 'N/A', // z coordinate (depth)
        name: getLandmarkName(index)
      });
    });
    
    // Also log as a complete array for easy access
    const allLandmarksArray = landmarks.map((lm: any, idx: number) => ({
      index: idx,
      name: getLandmarkName(idx),
      x: lm.x,
      y: lm.y,
      z: lm.z || 0
    }));
    console.log('📋 Complete landmarks array:', allLandmarksArray);
    
    // MediaPipe Hand Landmarks has 21 landmarks per hand
    // Key finger tip landmarks:
    // - Landmark 4: Thumb tip
    // - Landmark 8: Index finger tip (primary)
    // - Landmark 12: Middle finger tip
    // - Landmark 16: Ring finger tip
    // - Landmark 20: Pinky finger tip
    
    // Extract finger tip positions (normalized coordinates 0-1)
    const indexFingerTip = landmarks[8] ? { x: landmarks[8].x, y: landmarks[8].y } : null;
    const middleFingerTip = landmarks[12] ? { x: landmarks[12].x, y: landmarks[12].y } : null;
    const ringFingerTip = landmarks[16] ? { x: landmarks[16].x, y: landmarks[16].y } : null;
    const pinkyFingerTip = landmarks[20] ? { x: landmarks[20].x, y: landmarks[20].y } : null;
    const thumbTip = landmarks[4] ? { x: landmarks[4].x, y: landmarks[4].y } : null;

    console.log('🖐️ Finger tip positions:', {
      indexFingerTip,
      middleFingerTip,
      ringFingerTip,
      pinkyFingerTip,
      thumbTip,
      landmark8: landmarks[8],
      landmark12: landmarks[12],
      landmark16: landmarks[16],
      landmark20: landmarks[20],
      landmark4: landmarks[4]
    });

    // Prioritize index finger, fallback to any detected finger tip
    const fingerTip = indexFingerTip || middleFingerTip || ringFingerTip || pinkyFingerTip || thumbTip;

    if (!fingerTip) {
      console.warn('⚠️ No finger tip found in landmarks');
      return null;
    }
    
    console.log('✅ Using finger tip:', fingerTip);

    // Apply EMA smoothing to reduce jitter
    const smoothedX = emaX.current === 0 
      ? fingerTip.x 
      : EMA_ALPHA * fingerTip.x + (1 - EMA_ALPHA) * emaX.current;
    const smoothedY = emaY.current === 0 
      ? fingerTip.y 
      : EMA_ALPHA * fingerTip.y + (1 - EMA_ALPHA) * emaY.current;
    
    emaX.current = smoothedX;
    emaY.current = smoothedY;

    // Map all 21 landmarks with x, y, z coordinates
    const allLandmarksMapped = landmarks.map((lm: any, idx: number) => ({
      index: idx,
      name: getLandmarkName(idx),
      x: lm.x,
      y: lm.y,
      z: lm.z || 0, // Include z coordinate (depth)
    }));

    return {
      handPosition: { x: smoothedX, y: smoothedY }, // Normalized coordinates (0-1)
      landmarks: {
        indexFingerTip,
        middleFingerTip,
        ringFingerTip,
        pinkyFingerTip,
        thumbTip,
        allLandmarks: allLandmarksMapped, // All 21 landmarks with names and coordinates
      },
    };
  } catch (error) {
    console.warn('Frame processing error (non-critical):', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Web version of hand detection hook using MediaPipe
 */
export function useHandDetectionWeb(
  isActive: boolean = true
): HandDetectionResult {
  const [handPosition, setHandPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [hasCamera, setHasCamera] = useState(false);
  const [landmarks, setLandmarks] = useState<HandLandmarks | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const emaX = useRef(0);
  const emaY = useRef(0);
  const lastTimestamp = useRef(0);
  const processingIntervalRef = useRef<number | null>(null);
  const previewContainerId = 'hand-preview-container';

  // Initialize MediaPipe - always initialize on web, not dependent on isActive
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🚀 Initializing Hand Landmarker...');
      initializeHandLandmarker()
        .then((success) => {
          if (success) {
            console.log('✅ Hand Landmarker initialization complete');
          } else {
            console.error('❌ Hand Landmarker initialization failed');
            setError('Failed to initialize hand detection');
          }
        })
        .catch((err) => {
          console.error('❌ Failed to initialize hand landmarker:', err);
          setError('Failed to initialize hand detection');
        });
    }
  }, []); // Run once on mount

  // Setup webcam - always setup on web, not dependent on isActive
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const setupCamera = async () => {
      try {
        // First, stop any existing camera streams to prevent "device in use" error
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
          });
          streamRef.current = null;
        }
        
        // Also check for any video elements that might have active streams
        const existingVideos = document.querySelectorAll('video');
        existingVideos.forEach(video => {
          if (video.srcObject) {
            const stream = video.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
          }
        });

        // Request camera permission
        console.log('📹 Requesting camera access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 }
        });
        streamRef.current = stream;
        setHasCamera(true);
        setError(undefined); // Clear any previous errors
        console.log('✅ Camera access granted, stream:', stream);

        // Create video element for processing (hidden)
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true; // Mute to avoid feedback
        video.style.display = 'none';
        video.style.position = 'absolute';
        video.style.opacity = '0';
        video.style.width = '1px';
        video.style.height = '1px';
        video.style.pointerEvents = 'none';
        document.body.appendChild(video);
        
        // Set videoRef immediately so frame processing can find it
        videoRef.current = video;
        console.log('📹 Video element created and assigned to videoRef');

        video.addEventListener('loadedmetadata', () => {
          console.log('📹 Video metadata loaded, starting playback...');
          video.play().catch(err => {
            console.warn('Failed to play processing video:', err);
          });
        });

        // Also wait for video to start playing
        video.addEventListener('playing', () => {
          console.log('✅ Processing video is playing, ready for hand detection');
        });

        // Check if preview video already exists to avoid duplicates
        let previewVideo = document.querySelector(`video[data-hand-preview-video]`) as HTMLVideoElement;
        
        if (!previewVideo) {
          // Create preview video element and inject into container
          previewVideo = document.createElement('video');
          previewVideo.setAttribute('data-hand-preview-video', 'true');
        }
        
        previewVideo.srcObject = stream;
        previewVideo.autoplay = true;
        previewVideo.playsInline = true;
        previewVideo.muted = true;
        previewVideo.style.width = '100%';
        previewVideo.style.height = '100%';
        previewVideo.style.objectFit = 'cover';

        // Find or create preview container
        let container = document.getElementById(previewContainerId) as HTMLElement;
        if (!container) {
          // Try to find by data attribute
          container = document.querySelector(`[data-native-id="${previewContainerId}"]`) as HTMLElement;
        }
        if (!container) {
          // Try backup ID
          container = document.querySelector(`[data-native-id-backup="${previewContainerId}"]`) as HTMLElement;
        }

        if (container) {
          // Check if video already exists in container to avoid duplicates
          const existingVideo = container.querySelector('video[data-hand-preview-video]') as HTMLVideoElement;
          if (existingVideo) {
            // Reuse existing video element
            existingVideo.srcObject = stream;
            existingVideo.style.display = 'block';
            existingVideo.style.visibility = 'visible';
            existingVideo.style.opacity = '1';
          } else {
            // Append video without clearing container (to avoid React conflicts)
            container.appendChild(previewVideo);
          }
          
          // Wait for video to be ready
          previewVideo.addEventListener('loadedmetadata', () => {
            previewVideo.play().catch(err => {
              console.warn('Failed to play preview video:', err);
            });
          });
        } else {
          // Container not found yet, wait a bit and try again
          setTimeout(() => {
            let retryContainer = document.getElementById(previewContainerId) as HTMLElement;
            if (!retryContainer) {
              retryContainer = document.querySelector(`[data-native-id="${previewContainerId}"]`) as HTMLElement;
            }
            if (!retryContainer) {
              retryContainer = document.querySelector(`[data-native-id-backup="${previewContainerId}"]`) as HTMLElement;
            }
            if (retryContainer) {
              // Check if video already exists
              const existingVideo = retryContainer.querySelector('video[data-hand-preview-video]') as HTMLVideoElement;
              if (existingVideo) {
                // Reuse existing video element
                existingVideo.srcObject = stream;
                existingVideo.style.display = 'block';
                existingVideo.style.visibility = 'visible';
                existingVideo.style.opacity = '1';
              } else {
                // Append video without clearing container
                retryContainer.appendChild(previewVideo);
              }
              previewVideo.addEventListener('loadedmetadata', () => {
                previewVideo.play().catch(err => {
                  console.warn('Failed to play preview video:', err);
                });
              });
            }
          }, 100);
        }

      } catch (err) {
        console.error('Camera setup error:', err);
        setHasCamera(false);
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setError('Camera permission denied. Please allow camera access to play this game.');
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            setError('No camera found. Please connect a camera to play this game.');
          } else {
            setError(`Camera error: ${err.message}`);
          }
        } else {
          setError('Failed to access camera');
        }
      }
    };

    setupCamera();

    // Cleanup on unmount
    return () => {
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
        processingIntervalRef.current = null;
      }
      
      // Stop all tracks from the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
      
      // Clean up processing video element
      if (videoRef.current) {
        if (videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;
        // Use remove() instead of removeChild to avoid errors
        videoRef.current.remove();
        videoRef.current = null;
      }

      // Clean up preview video - stop streams but let React handle DOM cleanup
      const container = document.querySelector(`[data-native-id="${previewContainerId}"]`) as HTMLElement;
      if (container) {
        const videos = container.querySelectorAll('video');
        videos.forEach(video => {
          if (video.srcObject) {
            const stream = video.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
          }
          // Hide video instead of removing to avoid React conflicts
          (video as HTMLElement).style.display = 'none';
        });
      }
      
      // Also check for any preview videos by data attribute
      const previewVideo = document.querySelector(`video[data-hand-preview-video]`) as HTMLVideoElement;
      if (previewVideo && previewVideo.srcObject) {
        const stream = previewVideo.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        previewVideo.srcObject = null;
        // Hide instead of removing
        previewVideo.style.display = 'none';
      }
      
      setHasCamera(false);
    };
  }, []); // Run once on mount

  // Process frames when active
  useEffect(() => {
    console.log('🔄 Frame processing useEffect triggered:', {
      isActive,
      hasVideoRef: !!videoRef.current,
      isInitialized,
      hasCamera,
      videoReadyState: videoRef.current instanceof HTMLVideoElement ? videoRef.current.readyState : 'N/A',
      videoWidth: videoRef.current instanceof HTMLVideoElement ? videoRef.current.videoWidth : 'N/A',
      videoHeight: videoRef.current instanceof HTMLVideoElement ? videoRef.current.videoHeight : 'N/A'
    });
    
    if (!isActive) {
      console.log('⏸️ Frame processing paused: isActive is false');
      return;
    }
    
    if (!hasCamera) {
      console.log('⏸️ Frame processing paused: hasCamera is false');
      return;
    }
    
    if (!videoRef.current) {
      console.log('⏸️ Frame processing paused: videoRef.current is null - waiting for video element...');
      // Retry after a short delay
      const retryTimeout = setTimeout(() => {
        if (videoRef.current) {
          console.log('✅ Video element found after retry');
        }
      }, 1000);
      return () => clearTimeout(retryTimeout);
    }

    const processFrames = async () => {
      try {
        if (!videoRef.current) {
          console.warn('⚠️ processFrames: videoRef.current is null');
          return;
        }
        
        if (!isActive) {
          return;
        }
        
        if (!isInitialized) {
          console.warn('⚠️ processFrames: MediaPipe not initialized yet');
          return;
        }

        // Check video readiness
        if (videoRef.current instanceof HTMLVideoElement) {
          if (videoRef.current.readyState < 2) {
            if (Math.random() < 0.05) { // Log occasionally
              console.warn('⚠️ Video not ready, readyState:', videoRef.current.readyState);
            }
            return;
          }
          if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
            if (Math.random() < 0.05) { // Log occasionally
              console.warn('⚠️ Video has no dimensions');
            }
            return;
          }
        }

        const now = Date.now();
        if (now - lastTimestamp.current < THROTTLE_MS) {
          return;
        }
        lastTimestamp.current = now;

        console.log('🎬 Processing frame...', {
          timestamp: now,
          videoWidth: videoRef.current instanceof HTMLVideoElement ? videoRef.current.videoWidth : 'N/A',
          videoHeight: videoRef.current instanceof HTMLVideoElement ? videoRef.current.videoHeight : 'N/A',
          readyState: videoRef.current instanceof HTMLVideoElement ? videoRef.current.readyState : 'N/A'
        });
        
        const result = await processFrame(videoRef.current, emaX, emaY);
        
        if (result && result.handPosition) {
          console.log('✅ Hand detected! Position:', result.handPosition, 'Landmarks:', result.landmarks);
          setIsDetecting(true);
          setHandPosition(result.handPosition);
          if (result.landmarks) {
            setLandmarks(result.landmarks);
          }
        } else {
          // Only log occasionally to avoid spam
          if (Math.random() < 0.1) { // Log ~10% of the time
            console.log('⏳ No hand detected in this frame');
          }
          setIsDetecting(false);
          setHandPosition(null);
          setLandmarks(null);
          // Reset EMA when hand is lost
          emaX.current = 0;
          emaY.current = 0;
        }
      } catch (error) {
        // Log frame processing errors
        console.error('❌ Frame processing error:', error instanceof Error ? error.message : 'Unknown error', error);
        setIsDetecting(false);
        setHandPosition(null);
        setLandmarks(null);
      }
    };

    // Start processing frames
    const startProcessing = () => {
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
        processingIntervalRef.current = null;
      }
      console.log('▶️ Starting frame processing interval, THROTTLE_MS:', THROTTLE_MS);
      processingIntervalRef.current = window.setInterval(processFrames, THROTTLE_MS);
      // Also try processing immediately
      console.log('🚀 Calling processFrames immediately...');
      processFrames();
    };
    startProcessing();

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up frame processing interval');
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
        processingIntervalRef.current = null;
      }
    };
  }, [isActive, isInitialized, hasCamera]);

  return {
    handPosition,
    isDetecting,
    hasCamera,
    error,
    previewContainerId,
    landmarks,
  };
}

