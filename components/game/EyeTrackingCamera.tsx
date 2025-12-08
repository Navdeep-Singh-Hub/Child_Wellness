/**
 * Eye Tracking Camera Component
 * Handles camera access and processes frames for gaze detection
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { detectGaze, initializeEyeTracking, EyeTrackingResult, BallPosition, isEyeTrackingAvailable } from '@/utils/eyeTracking';

// Conditional import for expo-camera (not available on web)
let CameraView: any = null;
let CameraType: any = null;
let useCameraPermissions: any = null;

if (Platform.OS !== 'web') {
  try {
    const expoCamera = require('expo-camera');
    CameraView = expoCamera.CameraView;
    CameraType = expoCamera.CameraType;
    useCameraPermissions = expoCamera.useCameraPermissions;
  } catch (e) {
    console.warn('expo-camera not available:', e);
  }
}

interface EyeTrackingCameraProps {
  onGazeDetected: (result: EyeTrackingResult) => void;
  ballPosition?: BallPosition;
  enabled: boolean;
  showPreview?: boolean;
  processingFps?: number; // Frames per second to process (default: 10)
}

export const EyeTrackingCamera: React.FC<EyeTrackingCameraProps> = ({
  onGazeDetected,
  ballPosition,
  enabled,
  showPreview = false,
  processingFps = 10,
}) => {
  // For web, use browser MediaDevices API directly
  const [permission, setPermission] = useState<{ granted: boolean } | null>(null);
  const [requestPermission] = useState(() => async () => {
    if (Platform.OS === 'web') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Stop immediately, we'll create our own
        setPermission({ granted: true });
        return { granted: true };
      } catch (err) {
        setPermission({ granted: false });
        return { granted: false };
      }
    } else if (useCameraPermissions) {
      const result = await useCameraPermissions();
      setPermission(result);
      return result;
    }
    return { granted: false };
  });

  // Initialize web camera permissions
  useEffect(() => {
    if (Platform.OS === 'web' && !permission) {
      navigator.mediaDevices?.getUserMedia({ video: true })
        .then(() => setPermission({ granted: true }))
        .catch(() => setPermission({ granted: false }));
    }
  }, []);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);
  const processingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessTimeRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize eye tracking on mount
  useEffect(() => {
    if (enabled && Platform.OS === 'web') {
      initializeEyeTracking()
        .then((success) => {
          setIsInitialized(success);
          if (!success) {
            setError('Failed to initialize eye tracking. Please ensure you are using a modern browser.');
          }
        })
        .catch((err) => {
          console.error('Eye tracking initialization error:', err);
          setError('Eye tracking not available');
          setIsInitialized(false);
        });
    } else if (enabled && Platform.OS !== 'web') {
      setError('Eye tracking is currently only available on web platform');
    }

    return () => {
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
      }
    };
  }, [enabled]);

  // Process video frames for gaze detection
  const processFrame = useCallback(async () => {
    if (!isInitialized || !enabled || !cameraRef.current) {
      return;
    }

    const now = performance.now();
    const timeSinceLastProcess = now - lastProcessTimeRef.current;
    const minInterval = 1000 / processingFps; // Minimum time between frames

    if (timeSinceLastProcess < minInterval) {
      return;
    }

    lastProcessTimeRef.current = now;

    try {
      // For web, we need to access the video element
      if (Platform.OS === 'web' && videoRef.current) {
        const result = await detectGaze(videoRef.current, ballPosition);
        if (result) {
          onGazeDetected(result);
        }
      }
    } catch (err) {
      console.error('Error processing frame:', err);
    }
  }, [isInitialized, enabled, ballPosition, onGazeDetected, processingFps]);

  // Start/stop processing based on enabled state
  useEffect(() => {
    if (enabled && isInitialized && permission?.granted) {
      // Start processing frames
      const interval = setInterval(processFrame, 1000 / processingFps);
      processingIntervalRef.current = interval;
    } else {
      // Stop processing
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
        processingIntervalRef.current = null;
      }
    }

    return () => {
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
      }
    };
  }, [enabled, isInitialized, permission?.granted, processFrame, processingFps]);

  // Request camera permission
  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (!result.granted) {
      setError('Camera permission is required for eye tracking');
    }
  };

  // Setup web camera stream
  useEffect(() => {
    if (Platform.OS === 'web' && enabled && permission?.granted && !videoRef.current) {
      const setupWebCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 640, height: 480 }
          });
          
          const video = document.createElement('video');
          video.srcObject = stream;
          video.autoplay = true;
          video.playsInline = true;
          video.style.display = showPreview ? 'block' : 'none';
          video.style.width = '1px';
          video.style.height = '1px';
          video.style.position = 'absolute';
          video.style.opacity = '0';
          document.body.appendChild(video);
          
          video.addEventListener('loadedmetadata', () => {
            video.play();
            videoRef.current = video;
          });
        } catch (err) {
          console.error('Failed to setup web camera:', err);
        }
      };
      
      setupWebCamera();
      
      return () => {
        if (videoRef.current) {
          const stream = (videoRef.current as HTMLVideoElement).srcObject as MediaStream;
          stream?.getTracks().forEach(track => track.stop());
          videoRef.current.remove();
          videoRef.current = null;
        }
      };
    }
  }, [enabled, permission?.granted, showPreview]);

  // Check if eye tracking is available
  if (!isEyeTrackingAvailable() && Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Eye tracking requires camera access and a modern browser.
        </Text>
      </View>
    );
  }

  // Permission not granted
  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Camera access is needed to track your eye movements
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={handleRequestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.fallbackText}>
          The game will continue with behavioral tracking only.
        </Text>
      </View>
    );
  }

  // For web, camera is handled via video element, no CameraView needed
  if (Platform.OS === 'web') {
    return (
      <View style={styles.hiddenContainer}>
        {isInitialized && showPreview && (
          <View style={styles.statusBadge}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusText}>Eye Tracking Active</Text>
          </View>
        )}
      </View>
    );
  }

  // For native platforms, use CameraView
  if (!CameraView || !CameraType) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Camera not available on this platform
        </Text>
      </View>
    );
  }

  // Camera view (only show if showPreview is true)
  if (!showPreview) {
    // Hidden camera - still processing frames
    return (
      <View style={styles.hiddenContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.hiddenCamera}
          facing={CameraType.front}
        />
      </View>
    );
  }

  // Visible camera preview
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={CameraType.front}
      />
      {isInitialized && (
        <View style={styles.statusBadge}>
          <View style={styles.statusIndicator} />
          <Text style={styles.statusText}>Eye Tracking Active</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  hiddenContainer: {
    width: 1,
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    opacity: 0,
  },
  hiddenCamera: {
    width: 1,
    height: 1,
  },
  camera: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  permissionText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  fallbackText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
});

