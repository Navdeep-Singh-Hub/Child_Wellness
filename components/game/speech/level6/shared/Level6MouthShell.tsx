/**
 * Level 6 — shared camera layer, mirror preview, status pill, and hint
 * escalation helpers.
 *
 * Per-session game shells (vowelShapingShared, bilabialSequencingShared, etc.)
 * compose these pieces; they do not replace the per-session shell.
 */

import { shouldMountLipCamera } from '@/components/game/speech/lip-closure/shared/lipCameraLayer';
import {
  useLevel6MouthTarget,
  type Level6MatchLevel,
  type Level6MouthSense,
  type Level6Target,
} from '@/hooks/useLevel6MouthTarget';
import { recordLevel6GoodTry } from '@/utils/level6Telemetry';
import { useLevel6Settings } from '@/utils/level6Settings';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

let VisionCamera: typeof import('react-native-vision-camera').Camera | null = null;
if (Platform.OS !== 'web') {
  try {
    VisionCamera = require('react-native-vision-camera').Camera;
  } catch {
    /* optional */
  }
}

export type { Level6MatchLevel, Level6MouthSense, Level6Target };
export { useLevel6MouthTarget };

/**
 * Should be called from the per-game shell when the child taps the
 * `Good try` fallback button. We surface this through the shell so all
 * games funnel through one telemetry call.
 */
export function reportLevel6GoodTry(target: Level6Target) {
  recordLevel6GoodTry(target);
}

/**
 * Confirms a match exactly once per `roundKey` change. Use this in games:
 *   useLevel6MatchOnce(sense, roundKey, () => session.completeRound())
 * The callback receives the matchLevel actually observed ('match' or 'partial' fallback).
 */
export function useLevel6MatchOnce(
  sense: Level6MouthSense,
  active: boolean,
  roundKey: number | string,
  onConfirmed: (level: 'match' | 'partial' | 'good_try') => void,
) {
  const firedRef = useRef(false);
  const cbRef = useRef(onConfirmed);
  cbRef.current = onConfirmed;

  useEffect(() => {
    firedRef.current = false;
  }, [roundKey, active]);

  useEffect(() => {
    if (!active || firedRef.current) return;
    if (sense.matchLevel === 'match') {
      firedRef.current = true;
      cbRef.current('match');
    }
  }, [active, sense.matchLevel]);

  const trigger = (level: 'match' | 'partial' | 'good_try' = 'good_try') => {
    if (firedRef.current) return;
    firedRef.current = true;
    cbRef.current(level);
  };

  return { hasFired: firedRef.current, trigger };
}

/**
 * Returns a hint level that escalates while waiting:
 *   0 = wait, 1 = enlarge demo, 2 = glow Good try, 3 = TTS prompt to tap.
 * Resets to 0 when `roundKey` changes or `active` flips.
 */
export function useLevel6HintEscalation(active: boolean, roundKey: number | string): {
  hintLevel: 0 | 1 | 2 | 3;
  elapsedMs: number;
} {
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2 | 3>(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    setHintLevel(0);
    setElapsedMs(0);
    if (!active) return;
    const startedAt = Date.now();
    const id = setInterval(() => {
      const dt = Date.now() - startedAt;
      setElapsedMs(dt);
      if (dt > 12000) setHintLevel(3);
      else if (dt > 8000) setHintLevel(2);
      else if (dt > 4000) setHintLevel(1);
      else setHintLevel(0);
    }, 250);
    return () => clearInterval(id);
  }, [active, roundKey]);

  return { hintLevel, elapsedMs };
}

/**
 * Invisible VisionCamera mount, exactly the same pattern as Level 5's
 * lipClosureShared (opacity 0.01). On web the underlying jaw hook attaches
 * its own video element, so we don't render a Camera here.
 */
export function Level6CameraLayer({
  sense,
  active,
}: {
  sense: Level6MouthSense;
  active: boolean;
}) {
  if (
    Platform.OS === 'web' ||
    !VisionCamera ||
    !shouldMountLipCamera(
      active,
      sense.useCamera,
      sense.hasCamera,
      sense.device,
      sense.frameProcessor,
    )
  ) {
    return null;
  }
  return (
    <View style={styles.cameraLayer} pointerEvents="none">
      <VisionCamera
        style={StyleSheet.absoluteFill}
        device={sense.device as never}
        isActive={active}
        frameProcessor={sense.frameProcessor as never}
        frameProcessorFps={15}
      />
    </View>
  );
}

/** Tiny optional self-view preview (top-right corner). Native shows the camera
 *  at low opacity; web shows the MediaPipe-attached <video>.
 *
 *  Respects the persisted `mirrorPreviewEnabled` setting (defaults to true).
 *  Caller can still pass `visible={false}` to force-hide it for a game. */
export function Level6MirrorPreview({
  sense,
  active,
  visible = true,
}: {
  sense: Level6MouthSense;
  active: boolean;
  visible?: boolean;
}) {
  const { mirrorPreviewEnabled } = useLevel6Settings();
  if (!visible || !mirrorPreviewEnabled) return null;
  if (
    Platform.OS === 'web'
  ) {
    return (
      <View
        nativeID={sense.previewContainerId ?? 'level6-preview'}
        style={styles.mirror}
        pointerEvents="none"
      >
        <View style={styles.mirrorOverlay}>
          <Ionicons name="happy-outline" size={14} color="#fff" />
          <Text style={styles.mirrorLabel}>You</Text>
        </View>
      </View>
    );
  }
  if (
    !VisionCamera ||
    !shouldMountLipCamera(
      active,
      sense.useCamera,
      sense.hasCamera,
      sense.device,
      sense.frameProcessor,
    )
  ) {
    return null;
  }
  return (
    <View style={styles.mirror} pointerEvents="none">
      <VisionCamera
        style={StyleSheet.absoluteFill}
        device={sense.device as never}
        isActive={active}
        frameProcessor={sense.frameProcessor as never}
        frameProcessorFps={15}
      />
      <View style={styles.mirrorOverlay}>
        <Ionicons name="happy-outline" size={14} color="#fff" />
        <Text style={styles.mirrorLabel}>You</Text>
      </View>
    </View>
  );
}

/** Live "what the camera sees" pill. Sits above the play area. */
export function Level6StatusPill({
  sense,
  target,
  accent,
}: {
  sense: Level6MouthSense;
  target: Level6Target;
  accent: string;
}) {
  if (!sense.faceTrackingAvailable) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>
          Tap “Good try” below — or allow camera for shape detection
        </Text>
      </View>
    );
  }
  if (sense.error) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusWarn}>{sense.error}</Text>
      </View>
    );
  }
  if (!sense.isDetecting) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Looking for your face…</Text>
      </View>
    );
  }
  if (sense.unstable) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Move face closer — keep camera steady</Text>
      </View>
    );
  }

  const label = level6Label(target, sense.matchLevel);
  const bg =
    sense.matchLevel === 'match'
      ? accent
      : sense.matchLevel === 'partial'
        ? `${accent}66`
        : 'rgba(255,255,255,0.92)';
  const fg = sense.matchLevel === 'match' ? '#fff' : '#0F172A';
  return (
    <View style={[styles.statusBanner, { backgroundColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: fg }]} />
      <Text style={[styles.statusOkText, { color: fg }]}>{label}</Text>
    </View>
  );
}

function level6Label(target: Level6Target, level: Level6MatchLevel): string {
  if (level === 'none') {
    switch (target) {
      case 'aaa':
        return 'Open mouth wide';
      case 'open':
        return 'Open mouth';
      case 'ooo':
      case 'round':
        return 'Round lips like a circle';
      case 'eee':
      case 'spread':
        return 'Spread lips wide';
      case 'smile':
        return 'Big smile';
      case 'mm':
      case 'closed':
        return 'Close lips softly';
      case 'neutral':
        return 'Relax your mouth';
      case 'ma':
      case 'pa':
      case 'ba':
        return `Try ${target.toUpperCase()}!`;
      case 'mama':
      case 'papa':
      case 'baba':
        return `${target.toUpperCase()} — two beats`;
      case 'oo-ee':
        return 'OO then EE';
      case 'ee-oo':
        return 'EE then OO';
      case 'face_present':
        return 'Show your face';
      default:
        return 'Get ready!';
    }
  }
  if (level === 'partial') return 'Almost there…';
  switch (target) {
    case 'aaa':
      return 'AAA — perfect!';
    case 'ooo':
      return 'OOO — perfect!';
    case 'eee':
      return 'EEE — perfect!';
    case 'smile':
      return 'Lovely smile!';
    case 'mm':
    case 'closed':
      return 'Lips sealed!';
    case 'ma':
      return 'MA!';
    case 'pa':
      return 'PA!';
    case 'ba':
      return 'BA!';
    case 'mama':
      return 'MA-MA!';
    case 'papa':
      return 'PA-PA!';
    case 'baba':
      return 'BA-BA!';
    case 'oo-ee':
      return 'OO → EE!';
    case 'ee-oo':
      return 'EE → OO!';
    case 'face_present':
      return 'I see you!';
    default:
      return 'Great!';
  }
}

/**
 * One-shot neutral-face calibration overlay. Holds the gate open for ~1.4s
 * while it samples the child's jawRatio at rest, then persists the median
 * baseline so subsequent `aaa/open` thresholds adapt to that child.
 *
 * Usage in a Level 6 game (only needs to be mounted once before any round
 * detection starts):
 *
 *     const [calibrated, setCalibrated] = useState(false);
 *     // ... after canPlay flips true:
 *     return (
 *       <>
 *         {!calibrated && (
 *           <Level6CalibrationGate
 *             sense={mouth}
 *             onDone={() => setCalibrated(true)}
 *           />
 *         )}
 *         { rest of game ... }
 *       </>
 *     );
 */
export function Level6CalibrationGate({
  sense,
  onDone,
  message = 'Look at me with a relaxed mouth',
  durationMs = 1400,
}: {
  sense: Level6MouthSense;
  onDone: () => void;
  message?: string;
  durationMs?: number;
}) {
  const { saveCalibration, calibration, ready } = useLevel6Settings();
  const samplesRef = useRef<number[]>([]);
  const startedRef = useRef<number>(0);
  const finishedRef = useRef(false);
  const senseRef = useRef(sense);
  senseRef.current = sense;

  useEffect(() => {
    if (!ready) return;
    if (finishedRef.current) return;
    if (calibration && Date.now() - calibration.updatedAt < 1000 * 60 * 60 * 24) {
      finishedRef.current = true;
      onDone();
      return;
    }
    startedRef.current = Date.now();
    const tick = setInterval(() => {
      const j = senseRef.current;
      if (j.isDetecting) {
        const ratio = j.rawRatio;
        if (Number.isFinite(ratio) && ratio > 0) samplesRef.current.push(ratio);
      }
      const dt = Date.now() - startedRef.current;
      if (dt >= durationMs) {
        clearInterval(tick);
        finishedRef.current = true;
        const samples = samplesRef.current.slice().sort((a, b) => a - b);
        const median = samples.length
          ? samples[Math.floor(samples.length / 2)]
          : NaN;
        if (Number.isFinite(median)) {
          void saveCalibration(median);
        }
        onDone();
      }
    }, 80);
    return () => clearInterval(tick);
  }, [ready, calibration, durationMs, onDone, saveCalibration]);

  return (
    <View style={styles.calibrationOverlay} pointerEvents="none">
      <View style={styles.calibrationCard}>
        <Ionicons name="happy-outline" size={36} color="#fff" />
        <Text style={styles.calibrationTitle}>One second…</Text>
        <Text style={styles.calibrationText}>{message}</Text>
      </View>
    </View>
  );
}

/** Tiny toggle pill — drop into a game settings panel to flip the
 *  persisted mirror-preview setting. */
export function Level6MirrorToggle({ accent = '#4F46E5' }: { accent?: string }) {
  const { mirrorPreviewEnabled, setMirrorPreview } = useLevel6Settings();
  return (
    <Pressable
      onPress={() => void setMirrorPreview(!mirrorPreviewEnabled)}
      style={[
        styles.toggleRow,
        { borderColor: accent, backgroundColor: mirrorPreviewEnabled ? accent : 'transparent' },
      ]}
    >
      <Ionicons
        name={mirrorPreviewEnabled ? 'eye' : 'eye-off-outline'}
        size={16}
        color={mirrorPreviewEnabled ? '#fff' : accent}
      />
      <Text
        style={[
          styles.toggleLabel,
          { color: mirrorPreviewEnabled ? '#fff' : accent },
        ]}
      >
        {mirrorPreviewEnabled ? 'Mirror on' : 'Mirror off'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cameraLayer: { ...StyleSheet.absoluteFillObject, opacity: 0.01 },
  mirror: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 96,
    height: 128,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    zIndex: 20,
  },
  mirrorOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
  mirrorLabel: { color: '#fff', fontSize: 10, fontWeight: '900' },
  statusBanner: {
    marginHorizontal: 12,
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusOkText: { fontWeight: '900', fontSize: 14 },
  statusHint: { color: '#475569', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  statusWarn: { color: '#B45309', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  calibrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
  },
  calibrationCard: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.92)',
    gap: 6,
  },
  calibrationTitle: { color: '#fff', fontWeight: '900', fontSize: 16, marginTop: 4 },
  calibrationText: { color: '#E2E8F0', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    alignSelf: 'center',
  },
  toggleLabel: { fontSize: 13, fontWeight: '900' },
});
