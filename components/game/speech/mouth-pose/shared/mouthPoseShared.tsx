/**
 * Level 5 — shared mouth-pose camera layer + detection round loop (APK-first, web fallback).
 */

import { shouldMountLipCamera } from '@/components/game/speech/lip-closure/shared/lipCameraLayer';
import {
  isPoseSuccess,
  matchPose,
  MouthPoseMatchSmoother,
} from '@/components/game/speech/mouth-pose/modules/MouthPoseMatcher';
import type { MouthPoseTarget } from '@/components/game/speech/mouth-pose/modules/mouthPoseTypes';
import { useMouthPoseDetection } from '@/hooks/useMouthPoseDetection';
import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';

export type MouthPoseSense = ReturnType<typeof useMouthPoseDetection>;

export const MouthPoseContext = createContext<MouthPoseSense | null>(null);

export function MouthPoseProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  const mouth = useMouthPoseDetection(enabled);
  return <MouthPoseContext.Provider value={mouth}>{children}</MouthPoseContext.Provider>;
}

export function useMouthPoseContext(): MouthPoseSense | null {
  return useContext(MouthPoseContext);
}

let VisionCamera: typeof import('react-native-vision-camera').Camera | null = null;
if (Platform.OS !== 'web') {
  try {
    VisionCamera = require('react-native-vision-camera').Camera;
  } catch {
    /* optional */
  }
}

export function MouthPoseCameraLayer({
  mouth,
  active,
}: {
  mouth: ReturnType<typeof useMouthPoseDetection>;
  active: boolean;
}) {
  if (
    Platform.OS === 'web' ||
    !VisionCamera ||
    !shouldMountLipCamera(
      active,
      mouth.useCamera,
      mouth.hasCamera,
      mouth.device,
      mouth.frameProcessor,
    )
  ) {
    return null;
  }
  return (
    <View style={styles.cameraLayer} pointerEvents="none">
      <VisionCamera
        style={StyleSheet.absoluteFill}
        device={mouth.device as never}
        isActive={active}
        frameProcessor={mouth.frameProcessor as never}
        frameProcessorFps={12}
      />
    </View>
  );
}

export function MouthPoseStatusBanner({
  mouth,
  canPlay,
}: {
  mouth: ReturnType<typeof useMouthPoseDetection>;
  canPlay: boolean;
}) {
  if (!canPlay) return null;
  if (!mouth.hasCamera) {
    return (
      <Text style={styles.bannerMuted}>
        Camera not available — use Good try (grown-up) or tap buttons.
      </Text>
    );
  }
  if (mouth.unstable || !mouth.isDetecting) {
    return <Text style={styles.bannerWarn}>Looking for your mouth… face the screen 💛</Text>;
  }
  if (mouth.useCamera) {
    return <Text style={styles.bannerOk}>Camera on — copy the mouth when you are ready</Text>;
  }
  return null;
}

export type MouthPoseRoundLoopConfig<TPose> = {
  canPlay: boolean;
  poses: TPose[];
  hits: number;
  maxHits: number;
  roundKey: number;
  targetFromPose: (pose: TPose) => MouthPoseTarget;
  labelFromPose: (pose: TPose) => string;
  speak: (text: string) => void;
  getState: () => string;
  isWaiting: (state: string) => boolean;
  getCurrentPose: () => TPose;
  confirm: () => void;
  startPrompt: (pose: TPose) => void;
  resetEngine: () => void;
  lowerDifficulty?: () => void;
  onHit: (pose: TPose) => void;
  haptic: () => void;
};

export function useMouthPoseRoundLoop<TPose>(config: MouthPoseRoundLoopConfig<TPose>) {
  const {
    canPlay,
    poses,
    hits,
    maxHits,
    roundKey,
    targetFromPose,
    labelFromPose,
    speak,
    getState,
    isWaiting,
    getCurrentPose,
    confirm,
    startPrompt,
    resetEngine,
    lowerDifficulty,
    onHit,
    haptic,
  } = config;

  const ctxMouth = useMouthPoseContext();
  const ownedMouth = useMouthPoseDetection(ctxMouth ? false : canPlay);
  const mouth = ctxMouth ?? ownedMouth;
  const poseIndexRef = useRef(0);
  const busyRef = useRef(false);
  const smootherRef = useRef(new MouthPoseMatchSmoother());

  useEffect(() => {
    if (!canPlay) return;
    poseIndexRef.current = 0;
    busyRef.current = false;
    smootherRef.current.reset();
    mouth.resetCalibration();
    resetEngine();
    const first = poses[0];
    if (first !== undefined) {
      startPrompt(first);
      speak(labelFromPose(first));
    }
  }, [canPlay, roundKey]);

  const advance = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const pose = poses[poseIndexRef.current] ?? getCurrentPose();
    confirm();
    haptic();
    onHit(pose);
    smootherRef.current.reset();

    setTimeout(() => {
      busyRef.current = false;
      const nextHit = hits + 1;
      if (nextHit >= maxHits) return;
      const nextIdx = nextHit % poses.length;
      poseIndexRef.current = nextIdx;
      const nextPose = poses[nextIdx];
      if (nextPose !== undefined) {
        startPrompt(nextPose);
        speak(labelFromPose(nextPose));
      }
      if (nextHit >= 2) lowerDifficulty?.();
    }, 950);
  }, [
    confirm,
    getCurrentPose,
    haptic,
    hits,
    labelFromPose,
    lowerDifficulty,
    maxHits,
    onHit,
    poses,
    speak,
    startPrompt,
  ]);

  useEffect(() => {
    if (!canPlay || !mouth.useCamera) return;

    const id = setInterval(() => {
      if (busyRef.current) return;
      const state = getState();
      if (!isWaiting(state)) return;

      const pose = poses[poseIndexRef.current] ?? getCurrentPose();
      const target = targetFromPose(pose);
      const raw = matchPose(target, mouth, mouth.calibration);
      const level = smootherRef.current.push(raw);
      if (isPoseSuccess(level)) {
        advance();
      }
    }, 80);

    return () => clearInterval(id);
  }, [
    advance,
    canPlay,
    getCurrentPose,
    getState,
    isWaiting,
    mouth,
    mouth.useCamera,
    mouth.calibration,
    poses,
    targetFromPose,
  ]);

  const handleGoodTry = useCallback(() => {
    if (busyRef.current) return;
    if (!isWaiting(getState())) return;
    advance();
  }, [advance, getState, isWaiting]);

  return { handleGoodTry, mouth, advance };
}

/** Polls a single target; calls onMatch with optional cooldown between repeats. */
export function useMouthPosePromptWatcher(
  canPlay: boolean,
  target: MouthPoseTarget | null,
  onMatch: () => void,
  cooldownMs = 0,
) {
  const ctxMouth = useMouthPoseContext();
  const ownedMouth = useMouthPoseDetection(ctxMouth ? false : canPlay);
  const mouth = ctxMouth ?? ownedMouth;
  const smootherRef = useRef(new MouthPoseMatchSmoother());
  const lastFireRef = useRef(0);

  useEffect(() => {
    smootherRef.current.reset();
    lastFireRef.current = 0;
  }, [target, canPlay]);

  useEffect(() => {
    if (!canPlay || !target || !mouth.useCamera) return;

    const id = setInterval(() => {
      const raw = matchPose(target, mouth, mouth.calibration);
      const level = smootherRef.current.push(raw);
      if (!isPoseSuccess(level)) return;
      const now = Date.now();
      if (cooldownMs > 0 && now - lastFireRef.current < cooldownMs) return;
      lastFireRef.current = now;
      onMatch();
    }, 80);

    return () => clearInterval(id);
  }, [canPlay, target, mouth, mouth.useCamera, mouth.calibration, onMatch, cooldownMs]);
}

/** Invisible helper — face-present pulse for hybrid oral games. */
export function MouthPoseFaceGatePulse({
  canPlay,
  onPulse,
  target = 'face_present',
  cooldownMs = 2800,
}: {
  canPlay: boolean;
  onPulse: () => void;
  target?: MouthPoseTarget;
  cooldownMs?: number;
}) {
  useMouthPosePromptWatcher(canPlay, target, onPulse, cooldownMs);
  return null;
}

export function MouthPosePlayArea({
  canPlay,
  children,
}: {
  canPlay: boolean;
  children: React.ReactNode;
}) {
  return (
    <MouthPoseProvider enabled={canPlay}>
      <MouthPosePlayInner canPlay={canPlay}>{children}</MouthPosePlayInner>
    </MouthPoseProvider>
  );
}

function MouthPosePlayInner({
  canPlay,
  children,
}: {
  canPlay: boolean;
  children: React.ReactNode;
}) {
  const mouth = useMouthPoseContext();
  if (!mouth) return <>{children}</>;
  return (
    <>
      <MouthPoseCameraLayer mouth={mouth} active={canPlay} />
      {children}
    </>
  );
}

export function MouthPoseFooterStatus({ canPlay }: { canPlay: boolean }) {
  const mouth = useMouthPoseContext();
  if (!mouth) return null;
  return <MouthPoseStatusBanner mouth={mouth} canPlay={canPlay} />;
}

export async function requestMouthCameraSettings() {
  if (Platform.OS === 'android') {
    await Linking.openSettings();
  }
}

const styles = StyleSheet.create({
  cameraLayer: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0.01,
    overflow: 'hidden',
    left: 0,
    top: 0,
  },
  bannerMuted: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  bannerWarn: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  bannerOk: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
    textAlign: 'center',
    marginBottom: 6,
    paddingHorizontal: 12,
  },
});
