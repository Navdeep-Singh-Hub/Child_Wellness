/**
 * Speech Level 5 Session 2 — Lip Hold System (shared UI + session).
 */

import { shouldMountLipCamera } from '@/components/game/speech/lip-closure/shared/lipCameraLayer';
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { LipHoldSessionManager } from '@/components/game/speech/lip-closure/modules/LipHoldSessionManager';
import type { LipHoldGameId } from '@/components/game/speech/lip-closure/modules/lipHoldTypes';
import { useLipStabilityDetection } from '@/hooks/useLipStabilityDetection';
import { logGameAndAward } from '@/utils/api';
import { clearScheduledSpeech, DEFAULT_TTS_RATE, speak as speakTTS, stopTTS } from '@/utils/tts';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

let VisionCamera: typeof import('react-native-vision-camera').Camera | null = null;
if (Platform.OS !== 'web') {
  try {
    VisionCamera = require('react-native-vision-camera').Camera;
  } catch {
    /* optional */
  }
}

export const DEFAULT_HOLD_ROUNDS = 3;

export function clearHoldSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakHold(text: string, rate = DEFAULT_TTS_RATE) {
  clearHoldSpeech();
  speakTTS(text, rate);
}

export function hapticHoldSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export type LipHoldSense = ReturnType<typeof useLipStabilityDetection> & {
  tapSteady: () => void;
  tapMoving: () => void;
  manualStable: boolean;
  useCamera: boolean;
  faceTrackingAvailable: boolean;
  glowColor: string;
};

export function useLipHoldSense(enabled: boolean): LipHoldSense {
  const lip = useLipStabilityDetection(enabled);
  const [manualStable, setManualStable] = useState(true);
  const faceTrackingAvailable =
    lip.hasCamera;
  const useCamera = enabled && faceTrackingAvailable && (lip.isDetecting || (Platform.OS === 'web' && lip.hasCamera));
  const stableHold = useCamera ? lip.stableHold : manualStable;
  const holdDuration = useCamera ? lip.holdDuration : manualStable ? 9999 : 0;
  const stabilityScore = useCamera ? lip.stabilityScore : manualStable ? 1 : 0.3;

  let glowColor = '#86EFAC';
  if (!stableHold && !lip.inGracePeriod) glowColor = '#FDE047';
  if (lip.inGracePeriod) glowColor = '#FEF08A';

  return {
    ...lip,
    stableHold,
    holdDuration,
    stabilityScore,
    tapSteady: () => setManualStable(true),
    tapMoving: () => setManualStable(false),
    manualStable,
    useCamera,
    faceTrackingAvailable,
    glowColor,
  };
}

function LipHoldCameraLayer({ lip, active }: { lip: LipHoldSense; active: boolean }) {
  if (Platform.OS === 'web' || !VisionCamera || !shouldMountLipCamera(active, lip.useCamera, lip.hasCamera, lip.device, lip.frameProcessor)) return null;
  return (
    <View style={styles.cameraLayer} pointerEvents="none">
      <VisionCamera
        style={StyleSheet.absoluteFill}
        device={lip.device as never}
        isActive={active}
        frameProcessor={lip.frameProcessor as never}
        frameProcessorFps={15}
      />
    </View>
  );
}

export function useLipHoldGameSession(gameId: LipHoldGameId, rounds = DEFAULT_HOLD_ROUNDS) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);
  const managerRef = useRef(new LipHoldSessionManager(gameId, rounds));

  const finishGame = useCallback(
    async (accuracy: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;
      setFinalStats({ accuracy, totalStars: stars });
      setGameFinished(true);
      try {
        await logGameAndAward({
          type: gameId,
          correct: rounds,
          total: rounds,
          accuracy,
          xpAwarded: stars * 15,
          durationMs: rounds * 50000,
          skillTags: ['lip-hold', 'lip-stability', 'speech-level-5'],
        });
      } catch (e) {
        console.warn('[lip hold game] log failed', e);
      }
    },
    [gameId, rounds],
  );

  const completeRound = useCallback(() => {
    if (round >= rounds) {
      void finishGame(Math.min(100, 70 + round * 9));
      return;
    }
    setShowRoundSuccess(true);
    setTimeout(() => {
      setShowRoundSuccess(false);
      setRound((r) => r + 1);
      managerRef.current.resetRound();
    }, 1400);
  }, [round, rounds, finishGame]);

  return {
    round,
    rounds,
    showRoundSuccess,
    gameFinished,
    finalStats,
    completeRound,
    manager: managerRef.current,
  };
}

export function LipHoldGameOverlays({
  showRoundSuccess,
  gameFinished,
  finalStats,
  onBack,
  onComplete,
}: {
  showRoundSuccess: boolean;
  gameFinished: boolean;
  finalStats: { accuracy: number; totalStars: number } | null;
  onBack: () => void;
  onComplete?: () => void;
}) {
  return (
    <>
      <RoundSuccessAnimation visible={showRoundSuccess} stars={3} />
      {gameFinished && finalStats && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <CongratulationsScreen
            message="Steady lips — great job!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 15}
            onHome={() => {
              clearHoldSpeech();
              onBack();
            }}
            onContinue={() => {
              clearHoldSpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

type ShellProps = {
  title: string;
  subtitle: string;
  skills: string;
  gradient: [string, string];
  accent: string;
  onBack: () => void;
  round: number;
  rounds: number;
  canPlay: boolean;
  onStart: () => void;
  lip: LipHoldSense;
  children: React.ReactNode;
};

export function LipHoldGameShell({
  title,
  subtitle,
  skills,
  gradient,
  accent,
  onBack,
  round,
  rounds,
  canPlay,
  onStart,
  lip,
  children,
}: ShellProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            onPress={() => {
              clearHoldSpeech();
              onBack();
            }}
            style={[styles.backBtn, { backgroundColor: `${accent}22` }]}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>

        {!canPlay ? (
          <View style={styles.startWrap}>
            <Text style={styles.startEmoji}>🙂</Text>
            <Text style={styles.startTitle}>Keep lips steady</Text>
            <Text style={styles.startHint}>
              Hold your lip posture gently and still. Camera or Steady / Moving buttons work.
            </Text>
            <Pressable style={[styles.startBtn, { backgroundColor: accent }]} onPress={onStart}>
              <Text style={styles.startBtnText}>Start</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <LipHoldStatusBar lip={lip} accent={accent} />
            {!lip.useCamera && (
              <View style={styles.tapRow}>
                <Pressable style={[styles.tapBtn, lip.stableHold && styles.tapBtnOn]} onPress={lip.tapSteady}>
                  <Text style={styles.tapBtnText}>🙂 Steady</Text>
                </Pressable>
                <Pressable style={[styles.tapBtn, !lip.stableHold && styles.tapBtnOn]} onPress={lip.tapMoving}>
                  <Text style={styles.tapBtnText}>😮 Moving</Text>
                </Pressable>
              </View>
            )}
            <View style={styles.playArea}>
              <LipHoldCameraLayer lip={lip} active={canPlay} />
              <View style={[styles.glowRing, { shadowColor: lip.glowColor, borderColor: lip.glowColor }]}>
                {children}
              </View>
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.skills}>{skills}</Text>
          <View style={styles.dotsRow}>
            {Array.from({ length: rounds }).map((_, i) => (
              <View
                key={i}
                style={[styles.dot, { borderColor: accent }, i < round && { backgroundColor: accent }]}
              />
            ))}
          </View>
          <Text style={styles.progressText}>
            Round {Math.min(round, rounds)} / {rounds}
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

function LipHoldStatusBar({ lip, accent }: { lip: LipHoldSense; accent: string }) {
  if (lip.unstable && lip.useCamera) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Move face closer — we are still listening</Text>
      </View>
    );
  }
  if (lip.error) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusWarn}>{lip.error}</Text>
      </View>
    );
  }
  if (!lip.faceTrackingAvailable) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Use Steady / Moving below — or allow camera</Text>
      </View>
    );
  }
  if (!lip.useCamera && !lip.isDetecting) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Tap Steady when lips are still</Text>
      </View>
    );
  }
  if (!lip.isDetecting) {
    return (
      <View style={styles.statusBanner}>
        <ActivityIndicator color={accent} />
        <Text style={styles.statusHint}>Starting camera…</Text>
      </View>
    );
  }
  const label = lip.inGracePeriod
    ? 'Almost steady…'
    : lip.stableHold
      ? 'Lips steady'
      : 'Hold still gently';
  return (
    <View style={[styles.statusBanner, styles.statusOk]}>
      <View style={[styles.mouthPill, { backgroundColor: lip.glowColor }]} />
      <Text style={styles.statusOkText}>{label}</Text>
    </View>
  );
}

/** Hold progress with grace-period tolerance — never harsh reset. */
export function useLipStabilityProgress(
  lip: LipHoldSense,
  targetMs: number,
  active: boolean,
  onSuccess: () => void,
  resetKey = 0,
) {
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    doneRef.current = false;
    setProgress(0);
  }, [targetMs, active, resetKey]);

  useEffect(() => {
    if (!active || doneRef.current) return;
    const id = setInterval(() => {
      if (lip.stableHold) {
        const p = Math.min(1, lip.holdDuration / targetMs);
        setProgress(p);
        if (lip.holdDuration >= targetMs) {
          doneRef.current = true;
          hapticHoldSuccess();
          onSuccessRef.current();
        }
      } else if (!lip.inGracePeriod) {
        setProgress((prev) => Math.max(0, prev - 0.012));
      }
    }, 50);
    return () => clearInterval(id);
  }, [active, lip.stableHold, lip.inGracePeriod, lip.holdDuration, targetMs]);

  return progress;
}

export function LipHoldProgressRing({
  progress,
  accent,
  emoji,
}: {
  progress: number;
  accent: string;
  emoji?: string;
}) {
  return (
    <View style={styles.ringWrap}>
      {emoji ? <Text style={styles.ringEmoji}>{emoji}</Text> : null}
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: accent }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  cameraLayer: { ...StyleSheet.absoluteFillObject, opacity: 0.01 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 2,
  },
    backBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 10 },
  backText: { marginLeft: 4, fontWeight: '700', color: '#0F172A', fontSize: 15 },
  headerText: { marginLeft: 10, flex: 1 },
  title: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  startWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  startEmoji: { fontSize: 56, marginBottom: 12 },
  startTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', textAlign: 'center' },
  startHint: { fontSize: 15, color: '#475569', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  startBtn: { marginTop: 24, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  startBtnText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  tapRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, paddingHorizontal: 12, paddingTop: 8 },
  tapBtn: {
    flex: 1,
    maxWidth: 160,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  tapBtnOn: { borderColor: '#22C55E', backgroundColor: '#ECFDF5' },
  tapBtnText: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  playArea: { flex: 1, padding: 12 },
  glowRing: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  footer: { paddingHorizontal: 16, paddingBottom: Platform.OS === 'web' ? 16 : 24, alignItems: 'center' },
  skills: { fontSize: 12, color: '#475569', textAlign: 'center', marginBottom: 8 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, backgroundColor: 'transparent' },
  progressText: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  statusBanner: {
    marginHorizontal: 12,
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusOk: { backgroundColor: 'rgba(255,255,255,0.95)' },
  statusOkText: { fontWeight: '800', color: '#0F172A', fontSize: 15 },
  statusHint: { fontWeight: '700', color: '#475569', fontSize: 14, textAlign: 'center' },
  statusWarn: { fontWeight: '700', color: '#B45309', fontSize: 14, textAlign: 'center' },
  mouthPill: { width: 14, height: 14, borderRadius: 7 },
  ringWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ringEmoji: { fontSize: 72, marginBottom: 16 },
  bar: {
    width: '88%',
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.85)',
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 9 },
});
