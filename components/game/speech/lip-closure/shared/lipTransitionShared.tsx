/**
 * Speech Level 5 Session 5 — Lip Alternation System (shared UI + session).
 */

import { shouldMountLipCamera } from '@/components/game/speech/lip-closure/shared/lipCameraLayer';
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import {
  TransitionSequenceTracker,
  type LipPose,
} from '@/components/game/speech/lip-closure/modules/LipTransitionEngine';
import { LipTransitionSessionManager } from '@/components/game/speech/lip-closure/modules/LipTransitionSessionManager';
import type { LipTransitionGameId } from '@/components/game/speech/lip-closure/modules/lipTransitionTypes';
import { useLipTransitionDetection } from '@/hooks/useLipTransitionDetection';
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

export const DEFAULT_TRANSITION_ROUNDS = 3;

export function poseEmoji(pose: LipPose) {
  switch (pose) {
    case 'ROUNDED':
      return '😮';
    case 'SPREAD':
      return '😁';
    default:
      return '😐';
  }
}

export function poseLabel(pose: LipPose) {
  switch (pose) {
    case 'ROUNDED':
      return 'O shape';
    case 'SPREAD':
      return 'E / smile';
    default:
      return 'Neutral';
  }
}

export function clearTransitionSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakTransition(text: string, rate = DEFAULT_TTS_RATE) {
  clearTransitionSpeech();
  speakTTS(text, rate);
}

export function hapticTransitionSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export type LipTransitionSense = ReturnType<typeof useLipTransitionDetection> & {
  tapO: () => void;
  tapE: () => void;
  tapNeutral: () => void;
  manualPose: LipPose;
  useCamera: boolean;
  faceTrackingAvailable: boolean;
  glowColor: string;
  effectivePose: LipPose;
  effectiveConfirmed: boolean;
};

export function useLipTransitionSense(enabled: boolean): LipTransitionSense {
  const lip = useLipTransitionDetection(enabled);
  const [manualPose, setManualPose] = useState<LipPose>('NEUTRAL');
  const faceTrackingAvailable =
    lip.hasCamera;
  const useCamera = enabled && faceTrackingAvailable && (lip.isDetecting || (Platform.OS === 'web' && lip.hasCamera));
  const effectivePose = useCamera ? lip.lipPose : manualPose;
  const effectiveConfirmed = useCamera ? lip.confirmedPose : true;

  let glowColor = '#BFDBFE';
  if (effectivePose === 'ROUNDED') glowColor = '#93C5FD';
  if (effectivePose === 'SPREAD') glowColor = '#FDE047';
  if (effectiveConfirmed) glowColor = effectivePose === 'SPREAD' ? '#FBBF24' : '#60A5FA';

  return {
    ...lip,
    effectivePose,
    effectiveConfirmed,
    tapO: () => setManualPose('ROUNDED'),
    tapE: () => setManualPose('SPREAD'),
    tapNeutral: () => setManualPose('NEUTRAL'),
    manualPose,
    useCamera,
    faceTrackingAvailable,
    glowColor,
  };
}

export function useTransitionSequence(
  lip: LipTransitionSense,
  sequence: LipPose[],
  active: boolean,
  onComplete: () => void,
  resetKey = 0,
) {
  const sequenceRef = useRef(sequence);
  sequenceRef.current = sequence;
  const trackerRef = useRef(new TransitionSequenceTracker(sequence));
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    trackerRef.current = new TransitionSequenceTracker(sequenceRef.current);
    doneRef.current = false;
    setProgress(0);
  }, [resetKey, active]);

  useEffect(() => {
    if (!active || doneRef.current) return;
    const id = setInterval(() => {
      const now = Date.now();
      const advanced = trackerRef.current.tryAdvance(lip.effectivePose, lip.effectiveConfirmed, now);
      if (advanced) {
        hapticTransitionSuccess();
      }
      const p = trackerRef.current.progress;
      setProgress(p);
      if (trackerRef.current.complete) {
        doneRef.current = true;
        onCompleteRef.current();
      }
    }, 80);
    return () => clearInterval(id);
  }, [active, lip.effectivePose, lip.effectiveConfirmed]);

  return { progress, expected: trackerRef.current.expected, tracker: trackerRef.current };
}

function LipTransitionCameraLayer({ lip, active }: { lip: LipTransitionSense; active: boolean }) {
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

export function useLipTransitionGameSession(gameId: LipTransitionGameId, rounds = DEFAULT_TRANSITION_ROUNDS) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);
  const managerRef = useRef(new LipTransitionSessionManager(gameId, rounds));

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
          durationMs: rounds * 55000,
          skillTags: ['lip-alternation', 'mouth-transitions', 'speech-level-5'],
        });
      } catch (e) {
        console.warn('[lip transition game] log failed', e);
      }
    },
    [gameId, rounds],
  );

  const completeRound = useCallback(() => {
    if (round >= rounds) {
      void finishGame(Math.min(100, 74 + round * 8));
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

export function LipTransitionGameOverlays({
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
            message="Smooth mouth switches — great job!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 15}
            onHome={() => {
              clearTransitionSpeech();
              onBack();
            }}
            onContinue={() => {
              clearTransitionSpeech();
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
  lip: LipTransitionSense;
  children: React.ReactNode;
};

export function LipTransitionGameShell({
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
              clearTransitionSpeech();
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
            <Text style={styles.startEmoji}>🔄</Text>
            <Text style={styles.startTitle}>Switch mouth shapes smoothly</Text>
            <Text style={styles.startHint}>
              Copy O and E shapes. Camera or O / E / Neutral buttons work.
            </Text>
            <Pressable style={[styles.startBtn, { backgroundColor: accent }]} onPress={onStart}>
              <Text style={styles.startBtnText}>Start</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <LipTransitionStatusBar lip={lip} accent={accent} />
            {!lip.useCamera && (
              <View style={styles.tapRow}>
                <Pressable
                  style={[styles.tapBtn, lip.effectivePose === 'ROUNDED' && styles.tapBtnOn]}
                  onPress={lip.tapO}
                >
                  <Text style={styles.tapBtnText}>😮 O</Text>
                </Pressable>
                <Pressable
                  style={[styles.tapBtn, lip.effectivePose === 'SPREAD' && styles.tapBtnOn]}
                  onPress={lip.tapE}
                >
                  <Text style={styles.tapBtnText}>😁 E</Text>
                </Pressable>
                <Pressable
                  style={[styles.tapBtn, lip.effectivePose === 'NEUTRAL' && styles.tapBtnOn]}
                  onPress={lip.tapNeutral}
                >
                  <Text style={styles.tapBtnText}>😐</Text>
                </Pressable>
              </View>
            )}
            <View style={styles.playArea}>
              <LipTransitionCameraLayer lip={lip} active={canPlay} />
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

function LipTransitionStatusBar({ lip, accent }: { lip: LipTransitionSense; accent: string }) {
  if (lip.unstable && lip.useCamera) {
    return (
      <View style={styles.statusBanner}>
        <Text style={styles.statusHint}>Switch mouth shape — move face closer</Text>
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
        <Text style={styles.statusHint}>Use O / E / Neutral below — or allow camera</Text>
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
  return (
    <View style={[styles.statusBanner, styles.statusOk]}>
      <View style={[styles.mouthPill, { backgroundColor: lip.glowColor }]} />
      <Text style={styles.statusOkText}>{poseLabel(lip.effectivePose)}</Text>
    </View>
  );
}

export function LipTransitionProgressRing({ progress, accent }: { progress: number; accent: string }) {
  return (
    <View style={styles.ringWrap}>
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
  tapRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingHorizontal: 8, paddingTop: 8 },
  tapBtn: {
    flex: 1,
    maxWidth: 110,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  tapBtnOn: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  tapBtnText: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
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
  ringWrap: { width: '88%', marginTop: 12 },
  bar: {
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.85)',
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 9 },
});
