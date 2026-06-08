/**
 * Shared posture-based game core for OT Level 3 Session 10.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import {
  ANIMAL_POSES,
  AnimalPose,
  HOLD_POSES,
  HoldPose,
  PostureCue,
  SHAPE_POSES,
  ShapePose,
  YOGA_POSES,
  randomAnimalPose,
  randomHoldPose,
  randomShapePose,
  randomYogaPose,
  useTraceSound,
} from '@/components/game/occupational/level3/session10/postureUtils';
import { SESSION10_PACING } from '@/components/game/occupational/level3/session10/session10Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION10_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type PostureMode = 'poseMatch' | 'animalPose' | 'shapePose' | 'freezePose' | 'countHold';

export type PostureTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  confirmBg: string;
  backText: string;
  backBorder: string;
  titleColor: string;
  subtitleColor: string;
  statLabel: string;
  statValue: string;
  statBorder: string;
  playBorder: string;
  playBg: string;
  sparkleColor: string;
};

export type PostureGameConfig = {
  theme: PostureTheme;
  mode: PostureMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsWatch?: string;
  ttsConfirm?: string;
  ttsMiss?: string;
  ttsHold?: string;
  ttsHoldDone?: string;
  confirmLabel?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

const isHoldMode = (mode: PostureMode) => mode === 'freezePose' || mode === 'countHold';

export const PostureGame: React.FC<PostureGameConfig & { onBack?: () => void; onComplete?: () => void }> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsWatch = 'Watch the pose…',
  ttsConfirm = 'Copy the pose, then tap done!',
  ttsMiss = 'Try to match the pose!',
  ttsHold = 'Hold the pose!',
  ttsHoldDone = 'Perfect hold!',
  confirmLabel = '✓ I did it!',
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarn = useTraceSound(WARN);

  const totalRounds = isHoldMode(mode) ? P.holdRounds : P.confirmRounds;

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [canConfirm, setCanConfirm] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [cue, setCue] = useState<PostureCue>({ emoji: '🙌', label: 'Arms up' });

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const canConfirmRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cueScale = useSharedValue(0.75);
  const cueOpacity = useSharedValue(0);
  const holdBar = useSharedValue(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);
  useEffect(() => {
    canConfirmRef.current = canConfirm;
  }, [canConfirm]);

  const cueStyle = useAnimatedStyle(() => ({
    opacity: cueOpacity.value,
    transform: [{ scale: cueScale.value }],
  }));

  const holdBarStyle = useAnimatedStyle(() => ({
    width: `${holdBar.value * 100}%`,
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    cancelAnimation(cueScale);
    cancelAnimation(holdBar);
  }, [cueScale, holdBar]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = totalRounds;
      const xp = Math.round(finalScore * 15);
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      setShowCongratulations(true);
      speakTTS(ttsComplete, 0.78);
      recordGame(xp)
        .then(() =>
          logGameAndAward({
            type: logType,
            correct: finalScore,
            total,
            accuracy: (finalScore / total) * 100,
            xpAwarded: xp,
            skillTags,
          }),
        )
        .then(() => router.setParams({ refreshStats: Date.now().toString() }))
        .catch(console.error);
    },
    [clearTimers, logType, router, skillTags, totalRounds, ttsComplete],
  );

  const bumpScore = useCallback(() => {
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
  }, [playSuccess]);

  const showWarn = useCallback(
    (msg: string) => {
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      speakTTS(msg, 0.78).catch(() => {});
    },
    [playWarn],
  );

  const showCueCard = useCallback(
    (next: PostureCue) => {
      setCue(next);
      cueOpacity.value = 0;
      cueScale.value = 0.75;
      cueOpacity.value = withTiming(1, { duration: 240 });
      cueScale.value = withSpring(1, { damping: 12, stiffness: 140 });
    },
    [cueOpacity, cueScale],
  );

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
    setCanConfirm(false);
    canConfirmRef.current = false;
    setIsHolding(false);
    setHoldProgress(0);
    setCountdown(5);
    holdBar.value = 0;
    cueOpacity.value = 0;
    if (roundRef.current >= totalRounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, cueOpacity, endGame, holdBar, totalRounds]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    bumpScore();
    cueScale.value = withSequence(withTiming(1.18, { duration: 160 }), withTiming(1, { duration: 160 }));
    speakTTS(ttsHoldDone, 0.78).catch(() => {});
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, cueScale, ttsHoldDone]);

  const failRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    showWarn(ttsMiss);
    roundTimerRef.current = setTimeout(() => advanceRound(), 700);
  }, [advanceRound, showWarn, ttsMiss]);

  const pickCue = useCallback((): PostureCue => {
    if (mode === 'poseMatch') return YOGA_POSES[randomYogaPose()];
    if (mode === 'animalPose') return ANIMAL_POSES[randomAnimalPose()];
    if (mode === 'shapePose') return SHAPE_POSES[randomShapePose()];
    return HOLD_POSES[randomHoldPose()];
  }, [mode]);

  const startHoldTimer = useCallback(() => {
    setIsHolding(true);
    setStatusHint('Hold steady…');
    speakTTS(ttsHold, 0.78).catch(() => {});

    if (mode === 'freezePose') {
      let elapsed = 0;
      holdTimerRef.current = setInterval(() => {
        elapsed += P.holdTickMs;
        const prog = Math.min(1, elapsed / P.holdDurationMs);
        setHoldProgress(prog);
        holdBar.value = prog;
        if (elapsed >= P.holdDurationMs) {
          clearInterval(holdTimerRef.current!);
          holdTimerRef.current = null;
          completeRound();
        }
      }, P.holdTickMs);
      return;
    }

    let count = 5;
    setCountdown(count);
    speakTTS('5', 0.78).catch(() => {});
    holdTimerRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count > 0) {
        speakTTS(String(count), 0.78).catch(() => {});
      } else {
        clearInterval(holdTimerRef.current!);
        holdTimerRef.current = null;
        completeRound();
      }
    }, P.countIntervalMs);
  }, [completeRound, holdBar, mode, ttsHold]);

  const startConfirmRound = useCallback(
    (next: PostureCue) => {
      showCueCard(next);
      setStatusHint('Watch the pose…');
      speakTTS(`${next.label}. ${ttsWatch}`, 0.78).catch(() => {});
      roundTimerRef.current = setTimeout(() => {
        setCanConfirm(true);
        canConfirmRef.current = true;
        setStatusHint('Copy it, then tap done!');
        speakTTS(ttsConfirm, 0.78).catch(() => {});
        roundTimerRef.current = setTimeout(() => {
          if (!roundCompleteRef.current && canConfirmRef.current) {
            failRound();
          }
        }, P.confirmWindowMs);
      }, P.poseShowMs);
    },
    [failRound, showCueCard, ttsConfirm, ttsWatch],
  );

  const startHoldRound = useCallback(
    (next: PostureCue) => {
      showCueCard(next);
      setStatusHint('Get ready…');
      speakTTS(`Get ready! ${next.label}!`, 0.78).catch(() => {});
      roundTimerRef.current = setTimeout(() => startHoldTimer(), P.holdPoseShowMs);
    },
    [showCueCard, startHoldTimer],
  );

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    setCanConfirm(false);
    canConfirmRef.current = false;
    setIsHolding(false);
    const next = pickCue();
    if (isHoldMode(mode)) startHoldRound(next);
    else startConfirmRound(next);
  }, [mode, pickCue, startConfirmRound, startHoldRound]);

  useEffect(() => {
    if (round === 1) speakTTS(ttsIntro, 0.78);
    clearTimers();
    setRoundActive(false);
    roundTimerRef.current = setTimeout(() => startRoundPlay(), P.roundStartDelayMs);
    return clearTimers;
  }, [round, startRoundPlay, ttsIntro, clearTimers]);

  useEffect(
    () => () => {
      stopAllSpeech();
      cleanupSounds();
      clearTimers();
    },
    [clearTimers],
  );

  const handleConfirm = useCallback(() => {
    if (!canConfirmRef.current || roundCompleteRef.current || doneRef.current) return;
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    setCanConfirm(false);
    canConfirmRef.current = false;
    completeRound();
  }, [completeRound]);

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message={congratsMessage}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        xpAwarded={finalStats.xp}
        onContinue={() => {
          stopAllSpeech();
          cleanupSounds();
          onComplete ? onComplete() : onBack?.();
        }}
        onHome={() => {
          stopAllSpeech();
          cleanupSounds();
          onBack?.();
        }}
      />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  const holdSecondsLeft = Math.max(0, ((1 - holdProgress) * P.holdDurationMs) / 1000).toFixed(1);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity
        onPress={() => {
          stopAllSpeech();
          cleanupSounds();
          clearTimers();
          onBack?.();
        }}
        style={styles.backBtn}
      >
        <View style={[styles.backInner, { borderColor: T.backBorder }]}>
          <Text style={[styles.backText, { color: T.backText }]}>← Back</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: T.titleColor }]}>
          {T.emoji} {T.title}
        </Text>
        <Text style={[styles.subtitle, { color: T.subtitleColor }]}>{T.subtitle}</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statPill, { borderColor: T.statBorder }]}>
            <Text style={[styles.statLabel, { color: T.statLabel }]}>Round</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>
              {round}/{totalRounds}
            </Text>
          </View>
          <View style={[styles.statPill, styles.starPill, { borderColor: T.statBorder }]}>
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
        {roundActive && statusHint ? (
          <Text style={[styles.hint, { color: T.accentDark }]}>{statusHint}</Text>
        ) : null}
      </View>

      <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

        {roundActive && (
          <Animated.View style={[styles.cueCard, { borderColor: T.accent }, cueStyle]}>
            <Text style={styles.cueEmoji}>{cue.emoji}</Text>
            <Text style={[styles.cueLabel, { color: T.accentDark }]}>{cue.label}</Text>
          </Animated.View>
        )}

        {roundActive && isHolding && mode === 'freezePose' && (
          <View style={styles.holdBlock}>
            <Text style={[styles.holdTime, { color: T.accentDark }]}>{holdSecondsLeft}s</Text>
            <View style={[styles.holdTrack, { borderColor: T.accent }]}>
              <Animated.View style={[styles.holdFill, { backgroundColor: T.accent }, holdBarStyle]} />
            </View>
            <Text style={[styles.holdLabel, { color: T.accentDark }]}>HOLD!</Text>
          </View>
        )}

        {roundActive && isHolding && mode === 'countHold' && (
          <View style={styles.countBlock}>
            <Text style={[styles.countNum, { color: T.accentDark }]}>{countdown}</Text>
            <Text style={[styles.holdLabel, { color: T.accentDark }]}>Keep holding!</Text>
          </View>
        )}

        {canConfirm && (
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: T.confirmBg }]}
            onPress={handleConfirm}
            activeOpacity={0.88}
          >
            <Text style={styles.confirmText}>{confirmLabel}</Text>
          </TouchableOpacity>
        )}

        <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 16, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  waitText: { fontSize: 18, fontWeight: '700' },
  cueCard: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 36,
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.88)',
    marginBottom: 20,
  },
  cueEmoji: { fontSize: 88 },
  cueLabel: { fontSize: 18, fontWeight: '800', marginTop: 8, textTransform: 'capitalize' },
  holdBlock: { alignItems: 'center', width: '80%', marginBottom: 16 },
  holdTrack: { width: '100%', height: 12, borderRadius: 8, borderWidth: 1, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.5)' },
  holdFill: { height: '100%', borderRadius: 8 },
  holdTime: { fontSize: 28, fontWeight: '900', marginBottom: 8 },
  holdLabel: { fontSize: 16, fontWeight: '800', marginTop: 8 },
  countBlock: { alignItems: 'center', marginBottom: 16 },
  countNum: { fontSize: 64, fontWeight: '900' },
  confirmBtn: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 20,
    minWidth: 260,
    marginTop: 8,
  },
  confirmText: { color: '#FFF', fontSize: 18, fontWeight: '800', textAlign: 'center' },
});

export default PostureGame;
