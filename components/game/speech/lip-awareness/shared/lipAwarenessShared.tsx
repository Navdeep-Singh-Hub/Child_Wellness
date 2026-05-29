import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import {
  LipAwarenessSessionManager,
  lipAwarenessRoundDifficulty,
} from '@/components/game/speech/lip-awareness/modules/LipAwarenessSessionManager';
import type { LipAwarenessGameId } from '@/components/game/speech/lip-awareness/modules/lipAwarenessTypes';
import {
  LIP_POSE_FACE,
  LIP_POSE_LABEL,
  type LipPose,
} from '@/components/game/speech/lip-awareness/modules/lipAwarenessTypes';
import { lipPoseToTarget } from '@/components/game/speech/mouth-pose/modules/poseTargetMap';
import {
  MouthPoseFooterStatus,
  MouthPosePlayArea,
  useMouthPoseRoundLoop,
} from '@/components/game/speech/mouth-pose/shared/mouthPoseShared';
import { useLipAwareness, type LipAwarenessSense } from '@/hooks/useLipAwareness';
import { logGameAndAward } from '@/utils/api';
import { clearScheduledSpeech, DEFAULT_TTS_RATE, speak as speakTTS, stopTTS } from '@/utils/tts';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const DEFAULT_LIP_ROUNDS = 3;
export const LIP_INTERACTIONS_PER_ROUND = 3;

export function clearLipSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakLip(text: string, rate = DEFAULT_TTS_RATE) {
  clearLipSpeech();
  speakTTS(text, rate);
}

export function hapticLipSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export function useLipAwarenessGameSession(gameId: LipAwarenessGameId, rounds = DEFAULT_LIP_ROUNDS) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);
  const managerRef = useRef(new LipAwarenessSessionManager(gameId, rounds));

  const finishGame = useCallback(async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    managerRef.current.markComplete();
    const accuracy = managerRef.current.accuracyPercent();
    const stars = accuracy >= 85 ? 3 : accuracy >= 65 ? 2 : 1;
    setFinalStats({ accuracy, totalStars: stars });
    setGameFinished(true);
    try {
      await logGameAndAward({
        type: gameId,
        correct: rounds,
        total: rounds,
        accuracy,
        xpAwarded: stars * 12,
        durationMs: rounds * 48000,
        skillTags: ['lip-awareness', 'lip-sensory-mapping', 'oral-awareness', 'pre-oral'],
        meta: managerRef.current.getAnalytics(),
      });
    } catch (e) {
      console.warn('[lip awareness] log failed', e);
    }
  }, [gameId, rounds]);

  const completeRound = useCallback(() => {
    if (round >= rounds) {
      void finishGame();
      return;
    }
    setShowRoundSuccess(true);
    setTimeout(() => {
      setShowRoundSuccess(false);
      setRound((r) => r + 1);
      managerRef.current.advanceRound();
      managerRef.current.startRound();
    }, 1200);
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

export function LipGameOverlays({
  showRoundSuccess,
  gameFinished,
  finalStats,
  onBack,
  onComplete,
  message = 'You explored your lips!',
}: {
  showRoundSuccess: boolean;
  gameFinished: boolean;
  finalStats: { accuracy: number; totalStars: number } | null;
  onBack: () => void;
  onComplete?: () => void;
  message?: string;
}) {
  return (
    <>
      <RoundSuccessAnimation visible={showRoundSuccess} stars={3} />
      {gameFinished && finalStats && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <CongratulationsScreen
            message={message}
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 12}
            onHome={() => {
              clearLipSpeech();
              onBack();
            }}
            onContinue={() => {
              clearLipSpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

export function LipAwarenessGameFrame({
  title,
  subtitle,
  skills,
  gradient,
  accent,
  onBack,
  round,
  rounds,
  hits,
  canPlay,
  onStart,
  startEmoji = '👄',
  startHint,
  children,
}: {
  title: string;
  subtitle: string;
  skills: string;
  gradient: [string, string];
  accent: string;
  onBack: () => void;
  round: number;
  rounds: number;
  hits: number;
  canPlay: boolean;
  onStart: () => void;
  startEmoji?: string;
  startHint?: string;
  children: (lip: LipAwarenessSense) => React.ReactNode;
}) {
  const diff = lipAwarenessRoundDifficulty(round);
  const lip = useLipAwareness(canPlay, diff);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            onPress={() => {
              clearLipSpeech();
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
            <Text style={styles.startEmoji}>{startEmoji}</Text>
            <Text style={styles.startTitle}>Explore your lips</Text>
            <Text style={styles.startHint}>
              {startHint ??
                'Tap, watch, and copy lip shapes. Every try is celebrated — no wrong answers!'}
            </Text>
            <Pressable style={[styles.startBtn, { backgroundColor: accent }]} onPress={onStart}>
              <Text style={styles.startBtnText}>Start</Text>
            </Pressable>
          </View>
        ) : (
          <MouthPosePlayArea canPlay={canPlay}>
            <View style={styles.playArea}>{children(lip)}</View>
          </MouthPosePlayArea>
        )}

        <View style={styles.footer}>
          {canPlay && <MouthPoseFooterStatus canPlay={canPlay} />}
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
            Round {Math.min(round, rounds)} / {rounds} · {hits} / {LIP_INTERACTIONS_PER_ROUND}{' '}
            plays
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

export function LipFaceDisplay({
  characterEmoji,
  pose,
  sparkle,
  helper,
  lipOnly,
}: {
  characterEmoji?: string;
  pose: LipPose;
  sparkle?: boolean;
  helper?: boolean;
  lipOnly?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.05, duration: 450, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 450, useNativeDriver: true }),
    ]).start();
  }, [pose, scale]);

  return (
    <View style={styles.faceWrap}>
      {characterEmoji && !lipOnly ? (
        <Animated.Text style={[styles.character, { transform: [{ scale }] }]}>
          {characterEmoji}
        </Animated.Text>
      ) : null}
      <Text style={styles.lipPose}>{sparkle ? `${LIP_POSE_FACE[pose]}✨` : LIP_POSE_FACE[pose]}</Text>
      <Text style={styles.poseLabel}>{LIP_POSE_LABEL[pose]}</Text>
      {helper && (
        <Text style={styles.helperText}>Try when you feel ready — any try counts 💛</Text>
      )}
    </View>
  );
}

export function LipGoodTryButtons({
  accent,
  lip,
  onGoodTry,
  disabled,
}: {
  accent: string;
  lip: LipAwarenessSense;
  onGoodTry: () => void;
  disabled?: boolean;
}) {
  const can =
    !disabled &&
    (lip.state === 'WAITING_FOR_INTERACTION' || lip.state === 'HELPING');

  return (
    <View style={styles.actionRow}>
      <Pressable
        style={[styles.copyBtn, { backgroundColor: can ? accent : '#CBD5E1' }]}
        disabled={!can}
        onPress={onGoodTry}
      >
        <Text style={styles.copyBtnText}>😊 I tried my lips!</Text>
      </Pressable>
      <Pressable
        style={[styles.goodTryBtn, { borderColor: accent }]}
        disabled={!can}
        onPress={onGoodTry}
      >
        <Text style={[styles.goodTryText, { color: accent }]}>Good try (grown-up)</Text>
      </Pressable>
    </View>
  );
}

export function LipTapTarget({
  accent,
  label,
  onTap,
  glow,
}: {
  accent: string;
  label: string;
  onTap: () => void;
  glow?: boolean;
}) {
  return (
    <Pressable
      style={[styles.tapLips, { borderColor: accent, backgroundColor: glow ? `${accent}33` : '#fff' }]}
      onPress={onTap}
    >
      <Text style={styles.tapLipsEmoji}>{glow ? '👄✨' : '👄'}</Text>
      <Text style={[styles.tapLipsLabel, { color: accent }]}>{label}</Text>
    </Pressable>
  );
}

export function useLipCopyRoundLoop({
  lip,
  canPlay,
  poses,
  hits,
  onHit,
  roundKey,
}: {
  lip: LipAwarenessSense;
  canPlay: boolean;
  poses: LipPose[];
  hits: number;
  onHit: (pose: LipPose) => void;
  roundKey: number;
}) {
  const { handleGoodTry } = useMouthPoseRoundLoop({
    canPlay,
    poses,
    hits,
    maxHits: LIP_INTERACTIONS_PER_ROUND,
    roundKey,
    targetFromPose: lipPoseToTarget,
    labelFromPose: (p) => LIP_POSE_LABEL[p],
    speak: speakLip,
    getState: () => lip.state,
    isWaiting: (s) => s === 'WAITING_FOR_INTERACTION' || s === 'HELPING',
    getCurrentPose: () => lip.lipPrompt,
    confirm: () => lip.confirmInteraction(),
    startPrompt: (p) => lip.startPrompt(p),
    resetEngine: () => lip.engine.reset(),
    lowerDifficulty: () => lip.engine.lowerDifficulty(),
    onHit,
    haptic: hapticLipSuccess,
  });

  return { handleGoodTry };
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
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
  startEmoji: { fontSize: 72, marginBottom: 12 },
  startTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', textAlign: 'center' },
  startHint: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
    maxWidth: 340,
  },
  startBtn: { marginTop: 24, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  startBtnText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  playArea: { flex: 1, padding: 12, justifyContent: 'center' },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'web' ? 16 : 24,
    alignItems: 'center',
  },
  skills: { fontSize: 12, color: '#475569', textAlign: 'center', marginBottom: 8 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  progressText: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  faceWrap: { alignItems: 'center', marginBottom: 12 },
  character: { fontSize: 52, marginBottom: 6 },
  lipPose: { fontSize: 100 },
  poseLabel: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginTop: 10, textAlign: 'center' },
  helperText: { fontSize: 15, color: '#B45309', marginTop: 10, fontWeight: '600', textAlign: 'center' },
  actionRow: { gap: 10, paddingHorizontal: 8 },
  copyBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  copyBtnText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  goodTryBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
  },
  goodTryText: { fontWeight: '800', fontSize: 15 },
  tapLips: {
    minWidth: 200,
    minHeight: 200,
    borderRadius: 100,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  tapLipsEmoji: { fontSize: 88 },
  tapLipsLabel: { fontSize: 18, fontWeight: '800', marginTop: 8 },
});
