import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import {
  JawAwarenessSessionManager,
  jawAwarenessRoundDifficulty,
} from '@/components/game/speech/jaw-awareness/modules/JawAwarenessSessionManager';
import type { JawAwarenessGameId } from '@/components/game/speech/jaw-awareness/modules/jawAwarenessTypes';
import {
  JAW_POSE_FACE,
  JAW_POSE_LABEL,
  type JawPose,
} from '@/components/game/speech/jaw-awareness/modules/jawAwarenessTypes';
import { jawPoseToTarget } from '@/components/game/speech/mouth-pose/modules/poseTargetMap';
import {
  MouthPoseFooterStatus,
  MouthPosePlayArea,
  useMouthPoseRoundLoop,
} from '@/components/game/speech/mouth-pose/shared/mouthPoseShared';
import { useJawAwareness, type JawAwarenessSense } from '@/hooks/useJawAwareness';
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

export const DEFAULT_JAW_ROUNDS = 3;
export const JAW_INTERACTIONS_PER_ROUND = 3;

export function clearJawSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakJaw(text: string, rate = DEFAULT_TTS_RATE) {
  clearJawSpeech();
  speakTTS(text, rate);
}

export function hapticJawSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export function useJawAwarenessGameSession(gameId: JawAwarenessGameId, rounds = DEFAULT_JAW_ROUNDS) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);
  const managerRef = useRef(new JawAwarenessSessionManager(gameId, rounds));

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
        durationMs: rounds * 50000,
        skillTags: ['jaw-awareness', 'open-close-basics', 'oral-awareness', 'pre-oral'],
        meta: managerRef.current.getAnalytics(),
      });
    } catch (e) {
      console.warn('[jaw awareness] log failed', e);
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

export function JawGameOverlays({
  showRoundSuccess,
  gameFinished,
  finalStats,
  onBack,
  onComplete,
  message = 'You moved your jaw!',
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
              clearJawSpeech();
              onBack();
            }}
            onContinue={() => {
              clearJawSpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

export function JawAwarenessGameFrame({
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
  startEmoji = '😮',
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
  children: (jaw: JawAwarenessSense) => React.ReactNode;
}) {
  const diff = jawAwarenessRoundDifficulty(round);
  const jaw = useJawAwareness(canPlay, diff);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            onPress={() => {
              clearJawSpeech();
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
            <Text style={styles.startTitle}>Open and close your mouth</Text>
            <Text style={styles.startHint}>
              {startHint ??
                'Watch, copy, and tap along. Every try counts — no wrong answers!'}
            </Text>
            <Pressable style={[styles.startBtn, { backgroundColor: accent }]} onPress={onStart}>
              <Text style={styles.startBtnText}>Start</Text>
            </Pressable>
          </View>
        ) : (
          <MouthPosePlayArea canPlay={canPlay}>
            <View style={styles.playArea}>{children(jaw)}</View>
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
            Round {Math.min(round, rounds)} / {rounds} · {hits} / {JAW_INTERACTIONS_PER_ROUND} plays
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

export function JawMouthDisplay({
  characterEmoji,
  pose,
  sparkle,
  helper,
  large,
}: {
  characterEmoji?: string;
  pose: JawPose;
  sparkle?: boolean;
  helper?: boolean;
  large?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.08, duration: 500, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [pose, scale]);

  return (
    <View style={styles.faceWrap}>
      {characterEmoji ? (
        <Animated.Text style={[styles.character, { transform: [{ scale }] }]}>
          {characterEmoji}
        </Animated.Text>
      ) : null}
      <Text style={[styles.jawPose, large && styles.jawPoseLarge]}>
        {sparkle ? `${JAW_POSE_FACE[pose]}✨` : JAW_POSE_FACE[pose]}
      </Text>
      <Text style={styles.poseLabel}>{JAW_POSE_LABEL[pose]}</Text>
      {helper && (
        <Text style={styles.helperText}>Try when ready — any try is wonderful 💛</Text>
      )}
    </View>
  );
}

export function JawGoodTryButtons({
  accent,
  jaw,
  onGoodTry,
  disabled,
}: {
  accent: string;
  jaw: JawAwarenessSense;
  onGoodTry: () => void;
  disabled?: boolean;
}) {
  const can =
    !disabled &&
    (jaw.state === 'WAITING_FOR_INTERACTION' || jaw.state === 'HELPING');

  return (
    <View style={styles.actionRow}>
      <Pressable
        style={[styles.copyBtn, { backgroundColor: can ? accent : '#CBD5E1' }]}
        disabled={!can}
        onPress={onGoodTry}
      >
        <Text style={styles.copyBtnText}>😮 I tried my jaw!</Text>
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

export function JawTapTarget({
  accent,
  label,
  emoji,
  onTap,
  glow,
}: {
  accent: string;
  label: string;
  emoji: string;
  onTap: () => void;
  glow?: boolean;
}) {
  return (
    <Pressable
      style={[styles.tapTarget, { borderColor: accent, backgroundColor: glow ? `${accent}33` : '#fff' }]}
      onPress={onTap}
    >
      <Text style={styles.tapEmoji}>{emoji}</Text>
      <Text style={[styles.tapLabel, { color: accent }]}>{label}</Text>
    </Pressable>
  );
}

export function useJawCopyRoundLoop({
  jaw,
  canPlay,
  poses,
  hits,
  onHit,
  roundKey,
}: {
  jaw: JawAwarenessSense;
  canPlay: boolean;
  poses: JawPose[];
  hits: number;
  onHit: (pose: JawPose) => void;
  roundKey: number;
}) {
  const { handleGoodTry } = useMouthPoseRoundLoop({
    canPlay,
    poses,
    hits,
    maxHits: JAW_INTERACTIONS_PER_ROUND,
    roundKey,
    targetFromPose: jawPoseToTarget,
    labelFromPose: (p) => JAW_POSE_LABEL[p],
    speak: speakJaw,
    getState: () => jaw.state,
    isWaiting: (s) => s === 'WAITING_FOR_INTERACTION' || s === 'HELPING',
    getCurrentPose: () => jaw.jawPrompt,
    confirm: () => jaw.confirmInteraction(),
    startPrompt: (p) => jaw.startPrompt(p),
    resetEngine: () => jaw.engine.reset(),
    lowerDifficulty: () => jaw.engine.lowerDifficulty(),
    onHit,
    haptic: hapticJawSuccess,
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
  character: { fontSize: 64, marginBottom: 6 },
  jawPose: { fontSize: 96 },
  jawPoseLarge: { fontSize: 110 },
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
  tapTarget: {
    minWidth: 160,
    minHeight: 160,
    borderRadius: 20,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  tapEmoji: { fontSize: 72 },
  tapLabel: { fontSize: 17, fontWeight: '800', marginTop: 8 },
});
