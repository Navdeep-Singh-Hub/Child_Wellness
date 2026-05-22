import { useMemo } from 'react';
import { Platform, NativeModules } from 'react-native';
import type { Frame } from 'react-native-vision-camera';

export type NativeFaceDetectorPlugin = {
  detectFaces: (frame: Frame) => unknown[];
  stopListeners: () => void;
} | null;

type FaceDetectorOptions = {
  performanceMode?: 'fast' | 'accurate';
  landmarkMode?: 'none' | 'all';
  contourMode?: 'none' | 'all';
  classificationMode?: 'none' | 'all';
  cameraFacing?: 'front' | 'back';
  minFaceSize?: number;
};

/**
 * Same as useFaceDetector from vision-camera-face-detector, but returns null
 * instead of throwing when frame processors / worklets-core are unavailable.
 */
export function useNativeFaceDetectorSafe(
  options?: FaceDetectorOptions
): NativeFaceDetectorPlugin {
  return useMemo(() => {
    if (Platform.OS === 'web') return null;

    try {
      const { VisionCameraProxy } = require('react-native-vision-camera');
      const plugin = VisionCameraProxy.initFrameProcessorPlugin('detectFaces', {
        ...options,
      });

      if (!plugin) {
        console.warn('[useNativeFaceDetector] detectFaces plugin not loaded — rebuild dev client');
        return null;
      }

      return {
        detectFaces: (frame: Frame) => {
          'worklet';
          // @ts-expect-error native plugin call
          return plugin.call(frame);
        },
        stopListeners: () => {
          if (Platform.OS !== 'android') return;
          const { VisionCameraFaceDetectorOrientationManager } = NativeModules;
          VisionCameraFaceDetectorOrientationManager?.stopDeviceOrientationListener?.();
        },
      };
    } catch (e) {
      console.warn(
        '[useNativeFaceDetector] Frame processors unavailable. Run: npx expo run:android',
        e
      );
      return null;
    }
  }, [options]);
}
