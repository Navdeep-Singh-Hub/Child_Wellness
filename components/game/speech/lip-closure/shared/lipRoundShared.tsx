/**
 * Speech Level 5 Session 3 — Lip Rounding System (shared UI + session).
 */

import { shouldMountLipCamera } from '@/components/game/speech/lip-closure/shared/lipCameraLayer';
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { LipRoundSessionManager } from '@/components/game/speech/lip-closure/modules/LipRoundSessionManager';
import type { LipRoundGameId } from '@/components/game/speech/lip-closure/modules/lipRoundTypes';
import { useLipRoundnessDetection } from '@/hooks/useLipRoundnessDetection';
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

export const DEFAULT_ROUND_ROUNDS = 3;

export function clearRoundSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakRound(text: string, rate = DEFAULT_TTS_RATE) {
  clearRoundSpeech();
  speakTTS(text, rate);
}

export function hapticRoundSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export type LipRoundSense = ReturnType<typeof useLipRoundnessDetection> & {
  tapRound: () => void;
  tapFlat: () => void;
  manualRounded: boolean;
  useCamera: boolean;
  faceTrackingAvailable: boolean;
  glowColor: string;
};

export function useLipRoundSense(enabled: boolean): LipRoundSense {
  const lip = useLipRoundnessDetection(enabled);
  const [manualRounded, setManualRounded] = useState(true);
  const faceTrackingAvailable =
    lip.hasCamera;
  const useCamera = enabled && faceTrackingAvailable && (lip.isDetecting || (Platform.OS === 'web' && lip.hasCamera));
  const roundedLips = useCamera ? lip.roundedLips : manualRounded;
  const confirmedRounded = useCamera ? lip.confirmedRounded : manualRounded;
  const holdDuration = useCamera ? lip.holdDuration : manualRounded ? 9999 : 0;
  const roundnessScore = useCamera ? lip.roundnessScore : manualRounded ? 1 : 0.2;

  let glowColor = '#C4B5FD';
  if (confirmedRounded) glowColor = '#A78BFA';
  else if (roundedLips || lip.inGracePeriod) glowColor = '#DDD6FE';
  else glowColor = '#E9D5FF';

  return {
    ...lip,
    roundedLips,
    confirmedRounded,
    holdDuration,
    roundnessScore,
    tapRound: () => setManualRounded(true),
    tapFlat: () => setManualRounded(false),
    manualRounded,
    useCamera,
    faceTrackingAvailable,
    glowColor,
  };
}

function LipRoundCameraLayer({ lip, active }: { lip: LipRoundSense; active: boolean }) {
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

export function useLipRoundGameSession(gameId: LipRoundGameId, rounds = DEFAULT_ROUND_ROUNDS) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);
  const managerRef = useRef(new LipRoundSessionManager(gameId, rounds));

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
          skillTags: ['lip-rounding', 'o-shape', 'speech-level-5'],
        });
      } catch (e) {
        console.warn('[lip round game] log failed', e);
      }
    },
    [gameId, rounds],
  );

  const completeRound = useCallback(() => {
    if (round >= rounds) {
      void finishGame(Math.min(100, 72 + round * 9));
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

export function LipRoundGameOverlays({
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
            message="Round mouth — great job!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 15}
            onHome={() => {
              clearRoundSpeech();
              onBack();
            }}
            onContinue={() => {
              clearRoundSpeech();
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
  lip: LipRoundSense;
  children: React.ReactNode;
};

export function LipRoundGameShell({
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
              clearRoundSpeech();
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
            <Text style={styles.startEmoji}>⭕</Text>
            <Text style={styles.startTitle}>Make a round mouth</Text>
            <Text style={styles.startHint}>
              Shape lips like the letter O. Camera or Round / Flat buttons work.
            </Text>
            <Pressable style={[styles.startBtn, { backgroundColor: accent }]} onPress={onStart}>
              <Text style={styles.startBtnText}>Start</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <LipRoundStatusBar lip={lip} accent={accent} />
            {!lip.useCamera && (
              <View style={styles.tapRow}>
                <Pressable style={[styles.tapBtn, lip.roundedLips && styles.tapBtnOn]} onPress={lip.tapRound}>
                  <Text style={styles.tapBtnText}>⭕ Round</Text>
                </Pressable>
                <Pressable style={[styles.tapBtn, !lip.roundedLips && styles.tapBtnOn]} onPress={lip.tapFlat}>
                  <Text style={styles.tapBtnText}>➖ Flat</Text>
                </Pressable>
              </View>
            )}
            <View style={styles.playArea}>
              <LipRoundCameraLayer lip={lip} active={canPlay} />
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

function LipRoundStatusBar({ lip, accent }: { lip: LipRoundSense; accent: string }) {
  if (lip.unstable && lip.useCamera) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Make a round mouth — move face closer</Text>
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
        <Text style={styles.statusHint}>Use Round / Flat below — or allow camera</Text>
      </View>
    );
  }
  if (!lip.useCamera && !lip.isDetecting) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Tap Round when lips are in O shape</Text>
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
  const label = lip.confirmedRounded
    ? 'O shape held'
    : lip.roundedLips || lip.inGracePeriod
      ? 'Almost round…'
      : 'Make a round mouth';
  return (
    <View style={[styles.statusBanner, styles.statusOk]}>
      <View style={[styles.mouthPill, { backgroundColor: lip.glowColor }]} />
      <Text style={styles.statusOkText}>{label}</Text>
    </View>
  );
}

/** Progress uses confirmed O-shape hold; grace period avoids harsh reset. */
export function useLipRoundProgress(
  lip: LipRoundSense,
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
      if (lip.confirmedRounded) {
        const p = Math.min(1, lip.holdDuration / targetMs);
        setProgress(p);
        if (lip.holdDuration >= targetMs) {
          doneRef.current = true;
          hapticRoundSuccess();
          onSuccessRef.current();
        }
      } else if (!lip.inGracePeriod && !lip.roundedLips) {
        setProgress((prev) => Math.max(0, prev - 0.012));
      }
    }, 50);
    return () => clearInterval(id);
  }, [active, lip.confirmedRounded, lip.roundedLips, lip.inGracePeriod, lip.holdDuration, targetMs]);

  return progress;
}

export function LipRoundProgressRing({
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
  tapBtnOn: { borderColor: '#8B5CF6', backgroundColor: '#F5F3FF' },
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
