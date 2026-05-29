import { LipDetectionEngine } from '@/components/game/speech/lip-closure/modules/LipDetectionEngine';
import {
  createCalibration,
  pushCalibration,
} from '@/components/game/speech/mouth-pose/modules/MouthPoseCalibration';
import type { MouthPoseCalibration, MouthPoseReading } from '@/components/game/speech/mouth-pose/modules/mouthPoseTypes';
import { DEFAULT_CALIBRATION_FRAMES } from '@/components/game/speech/mouth-pose/modules/mouthPoseTypes';
import { useJawDetection } from '@/hooks/useJawDetection';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

const IDLE: MouthPoseReading = {
  jawOpen: false,
  jawRatio: 0,
  lipsClosed: false,
  lipGap: 99,
  smileAmount: 0,
  roundness: 0,
  confidence: 0,
  unstable: true,
  hasCamera: false,
  isDetecting: false,
  isTongueVisible: false,
  useCamera: false,
  device: null,
  frameProcessor: null,
};

export function useMouthPoseDetection(enabled: boolean): MouthPoseReading & {
  calibration: MouthPoseCalibration;
  resetCalibration: () => void;
} {
  const jaw = useJawDetection(enabled);
  const lipEngineRef = useRef(new LipDetectionEngine());
  const calFramesRef = useRef(0);
  const [reading, setReading] = useState<MouthPoseReading>(IDLE);
  const [calibration, setCalibration] = useState<MouthPoseCalibration>(() => createCalibration());

  const resetCalibration = () => {
    calFramesRef.current = 0;
    setCalibration(createCalibration());
    lipEngineRef.current.reset();
  };

  useEffect(() => {
    if (!enabled) {
      resetCalibration();
      setReading(IDLE);
      return;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => {
      if (!jaw.isDetecting && !jaw.hasCamera) {
        setReading({
          ...IDLE,
          error: jaw.error,
          hasCamera: jaw.hasCamera,
        });
        return;
      }

      const lipSnap = lipEngineRef.current.processGap(jaw.ratio * 1000);
      if (calFramesRef.current < DEFAULT_CALIBRATION_FRAMES && jaw.ratio > 0) {
        calFramesRef.current += 1;
        setCalibration((prev) => pushCalibration(prev, jaw.ratio));
      }

      const mouthWidth =
        jaw.landmarks?.mouthLeft && jaw.landmarks?.mouthRight
          ? Math.abs(jaw.landmarks.mouthRight.x - jaw.landmarks.mouthLeft.x)
          : 1;
      const lipHeight =
        jaw.landmarks?.upperLip?.length && jaw.landmarks?.lowerLip?.length
          ? 0.02
          : jaw.ratio;
      const roundness = Math.max(
        0,
        Math.min(1, mouthWidth / Math.max(0.01, lipHeight + jaw.ratio) - 0.8),
      );

      const useCamera =
        jaw.hasCamera && (jaw.isDetecting || (Platform.OS === 'web' && jaw.hasCamera));

      setReading({
        jawOpen: jaw.isOpen,
        jawRatio: jaw.ratio,
        lipsClosed: lipSnap.lipsClosed,
        lipGap: lipSnap.smoothedGap,
        smileAmount: jaw.smileAmount ?? 0,
        roundness,
        confidence: Math.min(1, (lipSnap.confidence + (jaw.isDetecting ? 0.5 : 0)) / 1.5),
        unstable: lipSnap.unstable,
        hasCamera: jaw.hasCamera,
        isDetecting: jaw.isDetecting,
        isTongueVisible: Boolean(jaw.isTongueVisible),
        error: jaw.error,
        device: jaw.device,
        frameProcessor: jaw.frameProcessor,
        previewContainerId: jaw.previewContainerId,
        useCamera,
      });
    }, 80);

    return () => clearInterval(id);
  }, [
    enabled,
    jaw.isDetecting,
    jaw.hasCamera,
    jaw.ratio,
    jaw.isOpen,
    jaw.smileAmount,
    jaw.isTongueVisible,
    jaw.error,
    jaw.device,
    jaw.frameProcessor,
    jaw.previewContainerId,
    jaw.landmarks,
  ]);

  return {
    ...reading,
    calibration,
    resetCalibration,
  };
}
