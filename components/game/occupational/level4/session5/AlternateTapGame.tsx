/**
 * Shared alternating left/right tap core for OT Level 4 Session 5.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { Hand, otherHand, useTraceSound } from '@/components/game/occupational/level4/session5/alternateUtils';
import { SESSION4_5_PACING } from '@/components/game/occupational/level4/session5/session5Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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

const P = SESSION4_5_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type AlternateTapMode = 'sequence' | 'walking' | 'beat' | 'flash' | 'speed';
export type AlternateTargetStyle = 'circle' | 'drum' | 'panel';

export type AlternateTapTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  leftColor: string;
  rightColor: string;
  leftEmoji: string;
  rightEmoji: string;
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
  targetStyle: AlternateTargetStyle;
};

export type AlternateTapGameConfig = {
  theme: AlternateTapTheme;
  mode: AlternateTapMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsCue?: string;
  ttsSuccess?: string;
  ttsWrong?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

const stepsForMode = (mode: AlternateTapMode) => {
  switch (mode) {
    case 'sequence':
      return P.sequenceSteps;
    case 'walking':
      return P.walkingSteps;
    case 'beat':
      return P.beatSteps;
    case 'speed':
      return P.speedSteps;
    case 'flash':
      return 1;
    default:
      return P.sequenceSteps;
  }
};

const speedInterval = (step: number, total: number) => {
  const progress = total <= 1 ? 0 : step / (total - 1);
  return P.speedInitialMs - (P.speedInitialMs - P.speedFinalMs) * progress;
};

export const AlternateTapGame: React.FC<
  AlternateTapGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsCue = 'Alternate left and right!',
  ttsSuccess = 'Perfect!',
  ttsWrong = 'Use the other hand!',
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarn = useTraceSound(WARN);
  const stepsPerRound = stepsForMode(mode);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [stepDisplay, setStepDisplay] = useState(1);
  const [flashTimeLeft, setFlashTimeLeft] = useState(P.flashDurationMs);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const stepRef = useRef(0);
  const expectedRef = useRef<Hand>('left');
  const waitingRef = useRef(false);
  const flashedSideRef = useRef<Hand | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);
  const leftY = useSharedValue(0);
  const rightY = useSharedValue(0);
  const leftFlash = useSharedValue(0);
  const rightFlash = useSharedValue(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: leftY.value }, { scale: leftScale.value }],
    opacity: mode === 'flash' ? 0.35 + leftFlash.value * 0.65 : 1,
    backgroundColor: mode === 'flash' && leftFlash.value > 0.4 ? '#F59E0B' : T.leftColor,
  }));

  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: rightY.value }, { scale: rightScale.value }],
    opacity: mode === 'flash' ? 0.35 + rightFlash.value * 0.65 : 1,
    backgroundColor: mode === 'flash' && rightFlash.value > 0.4 ? '#F59E0B' : T.rightColor,
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
    cancelAnimation(leftScale);
    cancelAnimation(rightScale);
    cancelAnimation(leftY);
    cancelAnimation(rightY);
  }, [leftScale, leftY, rightScale, rightY]);

  const pulseHand = useCallback(
    (hand: Hand) => {
      const scale = hand === 'left' ? leftScale : rightScale;
      scale.value = withSequence(withSpring(1.18), withSpring(1));
    },
    [leftScale, rightScale],
  );

  const bounceHand = useCallback(
    (hand: Hand) => {
      const y = hand === 'left' ? leftY : rightY;
      const scale = hand === 'left' ? leftScale : rightScale;
      y.value = withSequence(withSpring(-28), withSpring(0));
      scale.value = withSequence(withSpring(1.15), withSpring(1));
    },
    [leftScale, leftY, rightScale, rightY],
  );

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.rounds;
      const xp = Math.round(finalScore * 15);
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      setRoundActive(false);
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
    [clearTimers, logType, router, skillTags, ttsComplete],
  );

  const bumpScore = useCallback(() => {
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(ttsSuccess, 0.78).catch(() => {});
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
  }, [playSuccess, ttsSuccess]);

  const showWrong = useCallback(
    (msg?: string) => {
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      speakTTS(msg ?? ttsWrong, 0.78).catch(() => {});
    },
    [playWarn, ttsWrong],
  );

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    waitingRef.current = false;
    clearTimers();
    bumpScore();
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, clearTimers]);

  const resetStepState = useCallback(() => {
    stepRef.current = 0;
    expectedRef.current = 'left';
    waitingRef.current = false;
    flashedSideRef.current = null;
    setStepDisplay(1);
    leftFlash.value = 0;
    rightFlash.value = 0;
    leftY.value = 0;
    rightY.value = 0;
    leftScale.value = withSpring(1);
    rightScale.value = withSpring(1);
  }, [leftFlash, leftScale, leftY, rightFlash, rightScale, rightY]);

  const scheduleSpeedTap = useCallback(() => {
    if (doneRef.current || !roundActiveRef.current) return;
    waitingRef.current = true;
    const hand = expectedRef.current;
    setStatusHint(`Tap ${hand.toUpperCase()}!`);
    pulseHand(hand);
    speakTTS(`Tap ${hand}!`, 0.78).catch(() => {});
    const limit = speedInterval(stepRef.current, stepsPerRound) * 1.4;
    roundTimerRef.current = setTimeout(() => {
      if (waitingRef.current && roundActiveRef.current && !roundCompleteRef.current) {
        showWrong('Too slow! Speed up!');
        scheduleSpeedTap();
      }
    }, limit);
  }, [pulseHand, showWrong, stepsPerRound]);

  const triggerFlash = useCallback(() => {
    if (doneRef.current || !roundActiveRef.current) return;
    const side: Hand = Math.random() < 0.5 ? 'left' : 'right';
    flashedSideRef.current = side;
    waitingRef.current = true;
    setFlashTimeLeft(P.flashDurationMs);
    setStatusHint(`Flash ${side.toUpperCase()} — tap it!`);
    if (side === 'left') {
      leftFlash.value = withSequence(withTiming(1, { duration: 160 }), withTiming(0.35, { duration: 1200 }));
    } else {
      rightFlash.value = withSequence(withTiming(1, { duration: 160 }), withTiming(0.35, { duration: 1200 }));
    }
    speakTTS(`Flash ${side}! Use your ${side} hand!`, 0.78).catch(() => {});
    tickTimerRef.current = setInterval(() => {
      setFlashTimeLeft((prev) => {
        const next = prev - P.flashTickMs;
        if (next <= 0) {
          if (tickTimerRef.current) clearInterval(tickTimerRef.current);
          if (waitingRef.current && roundActiveRef.current) {
            waitingRef.current = false;
            flashedSideRef.current = null;
            leftFlash.value = withTiming(0);
            rightFlash.value = withTiming(0);
            showWrong('Too slow!');
            roundTimerRef.current = setTimeout(() => triggerFlash(), P.flashRetryDelayMs);
          }
          return 0;
        }
        return next;
      });
    }, P.flashTickMs);
  }, [leftFlash, rightFlash, showWrong]);

  const triggerBeat = useCallback(() => {
    if (doneRef.current || !roundActiveRef.current) return;
    waitingRef.current = true;
    const hand = expectedRef.current;
    setStatusHint(`Beat ${stepRef.current + 1}/${stepsPerRound} — tap ${hand.toUpperCase()}!`);
    pulseHand(hand);
    speakTTS(`Tap the ${hand} drum!`, 0.78).catch(() => {});
  }, [pulseHand, stepsPerRound]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    resetStepState();
    if (mode === 'flash') {
      setStatusHint('Watch for the flash…');
      roundTimerRef.current = setTimeout(() => triggerFlash(), 500);
    } else if (mode === 'beat') {
      setStatusHint('Follow the beat!');
      roundTimerRef.current = setTimeout(() => triggerBeat(), P.beatCueDelayMs);
    } else if (mode === 'speed') {
      setStatusHint('Start slow — speed up!');
      speakTTS(ttsCue, 0.78).catch(() => {});
      roundTimerRef.current = setTimeout(() => scheduleSpeedTap(), 350);
    } else {
      setStatusHint(mode === 'walking' ? 'Walk your hands!' : 'Alternate left and right!');
      speakTTS(ttsCue, 0.78).catch(() => {});
      pulseHand('left');
    }
  }, [mode, resetStepState, scheduleSpeedTap, triggerBeat, triggerFlash, ttsCue, pulseHand]);

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

  const handleCorrectTap = useCallback(
    (hand: Hand) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;

      if (mode === 'flash') {
        if (!waitingRef.current || flashedSideRef.current !== hand) {
          showWrong(hand === 'left' ? 'Use your right hand!' : 'Use your left hand!');
          return;
        }
        clearTimers();
        waitingRef.current = false;
        flashedSideRef.current = null;
        leftFlash.value = withTiming(0);
        rightFlash.value = withTiming(0);
        if (hand === 'left') leftScale.value = withSequence(withSpring(1.2), withSpring(1));
        else rightScale.value = withSequence(withSpring(1.2), withSpring(1));
        completeRound();
        return;
      }

      if (mode === 'beat' && !waitingRef.current) return;
      if (expectedRef.current !== hand) {
        showWrong();
        if (hand === 'left') leftScale.value = withSequence(withSpring(0.85), withSpring(1));
        else rightScale.value = withSequence(withSpring(0.85), withSpring(1));
        return;
      }

      if (mode === 'walking') bounceHand(hand);
      else if (hand === 'left') leftScale.value = withSequence(withSpring(1.15), withSpring(1));
      else rightScale.value = withSequence(withSpring(1.15), withSpring(1));

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

      if (mode === 'beat') waitingRef.current = false;
      if (mode === 'speed') {
        clearTimers();
        waitingRef.current = false;
      }

      stepRef.current += 1;
      setStepDisplay(stepRef.current + 1);

      if (stepRef.current >= stepsPerRound) {
        completeRound();
        return;
      }

      expectedRef.current = otherHand(hand);

      if (mode === 'beat') {
        roundTimerRef.current = setTimeout(() => triggerBeat(), P.beatCueDelayMs);
      } else if (mode === 'speed') {
        roundTimerRef.current = setTimeout(() => scheduleSpeedTap(), P.speedStepGapMs);
      } else {
        setStatusHint(`Tap ${expectedRef.current.toUpperCase()}!`);
        pulseHand(expectedRef.current);
      }
    },
    [
      bounceHand,
      completeRound,
      leftFlash,
      leftScale,
      mode,
      pulseHand,
      rightFlash,
      rightScale,
      scheduleSpeedTap,
      showWrong,
      stepsPerRound,
      triggerBeat,
      clearTimers,
    ],
  );

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

  const targetShape =
    T.targetStyle === 'drum'
      ? styles.drumTarget
      : T.targetStyle === 'panel'
        ? styles.panelTarget
        : styles.circleTarget;

  const speedPct = mode === 'speed' ? (stepDisplay - 1) / Math.max(1, stepsPerRound - 1) : 0;
  const speedLabel = speedPct < 0.34 ? 'SLOW' : speedPct < 0.67 ? 'MEDIUM' : 'FAST';

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
              {round}/{P.rounds}
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
        {mode !== 'flash' && roundActive && (
          <Text style={[styles.stepText, { color: T.subtitleColor }]}>
            Step {Math.min(stepDisplay, stepsPerRound)}/{stepsPerRound}
            {mode === 'speed' ? ` · ${speedLabel}` : ''}
          </Text>
        )}
        {mode === 'flash' && roundActive && flashTimeLeft > 0 && flashTimeLeft < P.flashDurationMs && (
          <Text style={[styles.stepText, { color: T.accent }]}>
            {(flashTimeLeft / 1000).toFixed(1)}s
          </Text>
        )}
      </View>

      <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

        {roundActive && mode === 'walking' && <View style={styles.pathLine} />}

        {roundActive && (
          <View style={[styles.targetsRow, mode === 'flash' && styles.panelRow]}>
            <TouchableOpacity onPress={() => handleCorrectTap('left')} activeOpacity={0.85} style={styles.targetWrap}>
              <Animated.View style={[targetShape, leftStyle]}>
                <Text style={[styles.targetEmoji, mode === 'flash' && styles.panelEmoji]}>{T.leftEmoji}</Text>
                <Text style={styles.targetLabel}>LEFT</Text>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleCorrectTap('right')} activeOpacity={0.85} style={styles.targetWrap}>
              <Animated.View style={[targetShape, rightStyle]}>
                <Text style={[styles.targetEmoji, mode === 'flash' && styles.panelEmoji]}>{T.rightEmoji}</Text>
                <Text style={styles.targetLabel}>RIGHT</Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
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
  hint: { fontSize: 16, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  stepText: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, justifyContent: 'center' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  pathLine: {
    position: 'absolute',
    alignSelf: 'center',
    width: '76%',
    height: 4,
    backgroundColor: 'rgba(148,163,184,0.5)',
    borderRadius: 2,
    top: '52%',
  },
  targetsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20 },
  panelRow: { paddingHorizontal: 8, gap: 10 },
  targetWrap: { alignItems: 'center' },
  circleTarget: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drumTarget: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelTarget: {
    width: 148,
    height: 220,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetEmoji: { fontSize: 44, marginBottom: 4 },
  panelEmoji: { fontSize: 64, marginBottom: 8 },
  targetLabel: { fontSize: 11, fontWeight: '800', color: '#fff' },
});

export default AlternateTapGame;
