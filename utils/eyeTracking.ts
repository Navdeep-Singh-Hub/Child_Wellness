/**
 * Eye Tracking Utilities
 * Uses MediaPipe Face Landmarker for gaze detection
 * All processing happens locally on device for privacy
 * 
 * Note: Uses @mediapipe/tasks-vision which works in browser environments
 * For React Native, would need native bridge or web view
 */

// Dynamic import to avoid issues in non-web environments
let FaceLandmarker: any = null;
let FilesetResolver: any = null;

export interface GazePoint {
  x: number; // 0-1 normalized screen coordinates
  y: number; // 0-1 normalized screen coordinates
  confidence: number; // 0-1
}

export interface EyeTrackingResult {
  gazePoint: GazePoint | null;
  isFaceDetected: boolean;
  attentionScore: number; // 0-100 based on gaze-ball alignment
  timestamp: number;
}

export interface BallPosition {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  radius: number; // pixels or percentage
}

let faceLandmarker: FaceLandmarker | null = null;
let isInitialized = false;

/**
 * Load MediaPipe library dynamically
 */
async function loadMediaPipeLibrary(): Promise<boolean> {
  if (FaceLandmarker && FilesetResolver) {
    return true;
  }

  try {
    if (typeof window === 'undefined') {
      return false;
    }

    // Dynamic import for web only
    const mediapipeModule = await import('@mediapipe/tasks-vision');
    FaceLandmarker = mediapipeModule.FaceLandmarker;
    FilesetResolver = mediapipeModule.FilesetResolver;

    if (!FaceLandmarker || !FilesetResolver) {
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
 * Initialize MediaPipe Face Landmarker detector
 */
export async function initializeEyeTracking(): Promise<boolean> {
  if (isInitialized && faceLandmarker) {
    return true;
  }

  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.warn('Eye tracking only works in browser environment');
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

    // Create Face Landmarker
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: 'GPU',
      },
      outputFaceBlendshapes: false,
      runningMode: 'VIDEO',
      numFaces: 1,
    });

    isInitialized = true;
    console.log('Eye tracking initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize eye tracking:', error);
    // Provide more detailed error information
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return false;
  }
}

/**
 * Process a video frame and detect gaze direction
 */
export async function detectGaze(
  videoElement: HTMLVideoElement | HTMLCanvasElement,
  ballPosition?: BallPosition
): Promise<EyeTrackingResult | null> {
  if (!faceLandmarker || !isInitialized) {
    return null;
  }

  try {
    const timestamp = performance.now();
    
    // Get image data from video element
    let imageData: ImageData;
    let width: number;
    let height: number;
    
    if (videoElement instanceof HTMLVideoElement) {
      width = videoElement.videoWidth || 640;
      height = videoElement.videoHeight || 480;
      
      // Create canvas to extract frame
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      ctx.drawImage(videoElement, 0, 0, width, height);
      imageData = ctx.getImageData(0, 0, width, height);
    } else {
      width = videoElement.width || 640;
      height = videoElement.height || 480;
      const ctx = videoElement.getContext('2d');
      if (!ctx) return null;
      imageData = ctx.getImageData(0, 0, width, height);
    }

    // Detect face landmarks
    const result = faceLandmarker.detectForVideo(imageData, timestamp);

    if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
      return {
        gazePoint: null,
        isFaceDetected: false,
        attentionScore: 0,
        timestamp,
      };
    }

    const landmarks = result.faceLandmarks[0];
    
    // Calculate gaze point from eye landmarks
    const gazePoint = calculateGazePoint(landmarks, width, height);
    
    // Calculate attention score if ball position is provided
    let attentionScore = 0;
    if (gazePoint && ballPosition) {
      attentionScore = calculateAttentionScore(gazePoint, ballPosition);
    }

    return {
      gazePoint,
      isFaceDetected: true,
      attentionScore,
      timestamp,
    };
  } catch (error) {
    console.error('Error detecting gaze:', error);
    return null;
  }
}

/**
 * Calculate gaze point from face landmarks
 * Uses eye corner and iris positions to estimate gaze direction
 */
function calculateGazePoint(
  landmarks: any[],
  imageWidth: number,
  imageHeight: number
): GazePoint | null {
  try {
    // MediaPipe face landmark indices for eyes
    // Left eye: 33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246
    // Right eye: 362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398
    
    const leftEyeInnerCorner = landmarks[133]; // Left eye inner corner
    const leftEyeOuterCorner = landmarks[33];  // Left eye outer corner
    const rightEyeInnerCorner = landmarks[362]; // Right eye inner corner
    const rightEyeOuterCorner = landmarks[263]; // Right eye outer corner
    
    // Iris centers (approximate)
    const leftIris = landmarks[468] || landmarks[159]; // Left iris center (fallback to eye center)
    const rightIris = landmarks[473] || landmarks[386]; // Right iris center (fallback to eye center)

    if (!leftEyeInnerCorner || !rightEyeInnerCorner) {
      return null;
    }

    // Calculate eye centers
    const leftEyeCenter = {
      x: (leftEyeInnerCorner.x + leftEyeOuterCorner.x) / 2,
      y: (leftEyeInnerCorner.y + leftEyeOuterCorner.y) / 2,
    };

    const rightEyeCenter = {
      x: (rightEyeInnerCorner.x + rightEyeOuterCorner.x) / 2,
      y: (rightEyeInnerCorner.y + rightEyeOuterCorner.y) / 2,
    };

    // Calculate iris offset from eye center (gaze direction indicator)
    const leftIrisOffset = {
      x: (leftIris?.x || leftEyeCenter.x) - leftEyeCenter.x,
      y: (leftIris?.y || leftEyeCenter.y) - leftEyeCenter.y,
    };

    const rightIrisOffset = {
      x: (rightIris?.x || rightEyeCenter.x) - rightEyeCenter.x,
      y: (rightIris?.y || rightEyeCenter.y) - rightEyeCenter.y,
    };

    // Average the two eyes for more stable gaze estimation
    const avgIrisOffset = {
      x: (leftIrisOffset.x + rightIrisOffset.x) / 2,
      y: (leftIrisOffset.y + rightIrisOffset.y) / 2,
    };

    // Convert to screen coordinates (normalized 0-1)
    // Gaze point is estimated based on iris offset
    // Scale factor: larger offset = further gaze direction
    const gazeScale = 2.0; // Adjust based on calibration
    const gazeX = Math.max(0, Math.min(1, 0.5 + avgIrisOffset.x * gazeScale));
    const gazeY = Math.max(0, Math.min(1, 0.5 + avgIrisOffset.y * gazeScale));

    // Confidence based on face detection quality
    const confidence = 0.8; // Can be improved with more sophisticated calculation

    return {
      x: gazeX,
      y: gazeY,
      confidence,
    };
  } catch (error) {
    console.error('Error calculating gaze point:', error);
    return null;
  }
}

/**
 * Calculate attention score based on gaze-ball alignment
 * Returns 0-100 score
 */
function calculateAttentionScore(gazePoint: GazePoint, ballPosition: BallPosition): number {
  // Convert ball position from percentage to normalized coordinates
  const ballX = ballPosition.x / 100;
  const ballY = ballPosition.y / 100;
  
  // Calculate distance between gaze point and ball center
  const distance = Math.sqrt(
    Math.pow(gazePoint.x - ballX, 2) + Math.pow(gazePoint.y - ballY, 2)
  );

  // Convert ball radius to normalized coordinates (assuming screen is 1x1)
  const ballRadius = ballPosition.radius / 100; // Adjust based on actual screen size

  // Score: 100 if gaze is on ball, decreases with distance
  // Use a tolerance zone around the ball
  const tolerance = ballRadius * 1.5; // 1.5x ball radius tolerance
  
  if (distance <= ballRadius) {
    // Gaze is directly on ball
    return 100;
  } else if (distance <= tolerance) {
    // Gaze is near ball
    const normalizedDistance = (distance - ballRadius) / (tolerance - ballRadius);
    return Math.max(50, 100 - normalizedDistance * 50);
  } else {
    // Gaze is far from ball
    const maxDistance = Math.sqrt(2); // Maximum possible distance (diagonal)
    const normalizedDistance = Math.min(1, (distance - tolerance) / (maxDistance - tolerance));
    return Math.max(0, 50 - normalizedDistance * 50);
  }
}

/**
 * Cleanup resources
 */
export function cleanupEyeTracking(): void {
  if (faceLandmarker) {
    faceLandmarker.close();
    faceLandmarker = null;
  }
  isInitialized = false;
}

/**
 * Check if eye tracking is available in current environment
 */
export function isEyeTrackingAvailable(): boolean {
  return typeof window !== 'undefined' && 
         typeof navigator !== 'undefined' && 
         navigator.mediaDevices !== undefined &&
         navigator.mediaDevices.getUserMedia !== undefined;
}

