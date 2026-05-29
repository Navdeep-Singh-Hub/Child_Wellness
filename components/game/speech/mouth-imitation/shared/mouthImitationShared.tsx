import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import {
  ImitationSessionManager,
  imitationRoundDifficulty,
} from '@/components/game/speech/mouth-imitation/modules/ImitationSessionManager';
import type { ImitationGameId } from '@/components/game/speech/mouth-imitation/modules/imitationTypes';
import {
  MOUTH_POSE_FACE,
  MOUTH_POSE_LABEL,
  type MouthPose,
} from '@/components/game/speech/mouth-imitation/modules/imitationTypes';
import { mouthPoseToTarget } from '@/components/game/speech/mouth-pose/modules/poseTargetMap';
import {
  MouthPoseFooterStatus,
  MouthPosePlayArea,
  useMouthPoseRoundLoop,
} from '@/components/game/speech/mouth-pose/shared/mouthPoseShared';
import { useImitation, type ImitationSense } from '@/hooks/useImitation';
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

export const DEFAULT_IMITATION_ROUNDS = 3;
export const IMITATION_CYCLES_PER_ROUND = 3;

export function clearImitationSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakImitation(text: string, rate = DEFAULT_TTS_RATE) {
  clearImitationSpeech();
  speakTTS(text, rate);
}

export function hapticImitationSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export function useImitationGameSession(gameId: ImitationGameId, rounds = DEFAULT_IMITATION_ROUNDS) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);
  const managerRef = useRef(new ImitationSessionManager(gameId, rounds));

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
        skillTags: ['mouth-imitation', 'oral-motor-imitation', 'visual-imitation', 'pre-oral'],
        meta: managerRef.current.getAnalytics(),
      });
    } catch (e) {
      console.warn('[imitation game] log failed', e);
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

export function ImitationGameOverlays({
  showRoundSuccess,
  gameFinished,
  finalStats,
  onBack,
  onComplete,
  message = 'You copied the mouth moves!',
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
              clearImitationSpeech();
              onBack();
            }}
            onContinue={() => {
              clearImitationSpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

type ImitationFrameProps = {
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
  startTitle?: string;
  startHint?: string;
  children: (imitation: ImitationSense) => React.ReactNode;
};

export function ImitationGameFrame({
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
  startTitle = 'Watch and copy',
  startHint = 'Look at the friendly mouth, then copy it. The camera can notice your mouth, or tap Good try anytime!',
  children,
}: ImitationFrameProps) {
  const diff = imitationRoundDifficulty(round);
  const imitation = useImitation(canPlay, diff);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            onPress={() => {
              clearImitationSpeech();
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
            <Text style={styles.startTitle}>{startTitle}</Text>
            <Text style={styles.startHint}>{startHint}</Text>
            <Pressable style={[styles.startBtn, { backgroundColor: accent }]} onPress={onStart}>
              <Text style={styles.startBtnText}>Start</Text>
            </Pressable>
          </View>
        ) : (
          <MouthPosePlayArea canPlay={canPlay}>
            <View style={styles.playArea}>{children(imitation)}</View>
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
            Round {Math.min(round, rounds)} / {rounds} · {hits} / {IMITATION_CYCLES_PER_ROUND} copies
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

export function MouthFaceDisplay({
  characterEmoji,
  pose,
  sparkle,
  helper,
}: {
  characterEmoji: string;
  pose: MouthPose;
  sparkle?: boolean;
  helper?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.06, duration: 400, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [pose, scale]);

  return (
    <View style={styles.faceWrap}>
      <Animated.Text style={[styles.character, { transform: [{ scale }] }]}>
        {characterEmoji}
      </Animated.Text>
      <Text style={styles.mouthPose}>{sparkle ? `${MOUTH_POSE_FACE[pose]}✨` : MOUTH_POSE_FACE[pose]}</Text>
      <Text style={styles.poseLabel}>{MOUTH_POSE_LABEL[pose]}</Text>
      {helper && (
        <Text style={styles.helperText}>Try copying when you feel ready 💛</Text>
      )}
    </View>
  );
}

export function ImitationActionButtons({
  accent,
  imitation,
  onGoodTry,
  disabled,
}: {
  accent: string;
  imitation: ImitationSense;
  onGoodTry: () => void;
  disabled?: boolean;
}) {
  const canConfirm =
    !disabled &&
    (imitation.state === 'WAITING_FOR_IMITATION' || imitation.state === 'HELPING');

  return (
    <View style={styles.actionRow}>
      <Pressable
        style={[
          styles.copyBtn,
          { backgroundColor: canConfirm ? accent : '#CBD5E1' },
        ]}
        disabled={!canConfirm}
        onPress={onGoodTry}
      >
        <Text style={styles.copyBtnText}>😊 I copied it!</Text>
      </Pressable>
      <Pressable
        style={[styles.goodTryBtn, { borderColor: accent }]}
        disabled={!canConfirm}
        onPress={onGoodTry}
      >
        <Text style={[styles.goodTryText, { color: accent }]}>Good try (grown-up)</Text>
      </Pressable>
    </View>
  );
}

/** Watch-copy loop with camera pose detection + Good try fallback. */
export function useImitationRoundLoop({
  imitation,
  canPlay,
  poses,
  hits,
  onHit,
  roundKey,
}: {
  imitation: ImitationSense;
  canPlay: boolean;
  poses: MouthPose[];
  hits: number;
  onHit: (pose: MouthPose) => void;
  roundKey: number;
}) {
  const { handleGoodTry } = useMouthPoseRoundLoop({
    canPlay,
    poses,
    hits,
    maxHits: IMITATION_CYCLES_PER_ROUND,
    roundKey,
    targetFromPose: mouthPoseToTarget,
    labelFromPose: (p) => MOUTH_POSE_LABEL[p],
    speak: speakImitation,
    getState: () => imitation.state,
    isWaiting: (s) => s === 'WAITING_FOR_IMITATION' || s === 'HELPING',
    getCurrentPose: () => imitation.imitationPrompt,
    confirm: () => imitation.confirmAttempt(),
    startPrompt: (p) => imitation.startPrompt(p),
    resetEngine: () => imitation.engine.reset(),
    lowerDifficulty: () => imitation.engine.lowerDifficulty(),
    onHit,
    haptic: hapticImitationSuccess,
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
  faceWrap: { alignItems: 'center', marginBottom: 16 },
  character: { fontSize: 56, marginBottom: 8 },
  mouthPose: { fontSize: 96 },
  poseLabel: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginTop: 12, textAlign: 'center' },
  helperText: { fontSize: 15, color: '#B45309', marginTop: 10, fontWeight: '600', textAlign: 'center' },
  actionRow: { gap: 10, paddingHorizontal: 8 },
  copyBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  copyBtnText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  goodTryBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
  },
  goodTryText: { fontWeight: '800', fontSize: 15 },
});
