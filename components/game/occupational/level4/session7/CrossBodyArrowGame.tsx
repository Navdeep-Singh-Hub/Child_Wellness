/**
 * Shared cross-body arrow tap core for OT Level 4 Session 7.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import {
  ArrowDirection,
  Hand,
  arrowEmoji,
  crossBodyHand,
  handLabel,
  randomDirection,
  useTraceSound,
} from '@/components/game/occupational/level4/session7/arrowUtils';
import { SESSION4_7_PACING } from '@/components/game/occupational/level4/session7/session7Pacing';
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

const P = SESSION4_7_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type CrossBodyArrowMode = 'tap' | 'moving' | 'speed';

export type CrossBodyArrowTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  leftColor: string;
  rightColor: string;
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

export type CrossBodyArrowGameConfig = {
  theme: CrossBodyArrowTheme;
  mode: CrossBodyArrowMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsCue?: string;
  ttsSuccess?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

const roundsForMode = (mode: CrossBodyArrowMode) => {
  switch (mode) {
    case 'tap':
      return P.tapRounds;
    case 'moving':
      return P.movingRounds;
    case 'speed':
      return P.speedRounds;
  }
};

const speedDisplayMs = (round: number) =>
  Math.max(P.speedMinMs, P.speedInitialMs - (round - 1) * P.speedDecreaseMs);

export const CrossBodyArrowGame: React.FC<
  CrossBodyArrowGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsCue = 'Use the opposite hand!',
  ttsSuccess = 'Perfect!',
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarn = useTraceSound(WARN);
  const totalRounds = roundsForMode(mode);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [arrowDir, setArrowDir] = useState<ArrowDirection>('left');
  const [expectedHand, setExpectedHand] = useState<Hand>('right');
  const [showArrow, setShowArrow] = useState(false);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const expectedRef = useRef<Hand>('right');
  const canTapRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);

  const arrowX = useSharedValue(180);
  const arrowY = useSharedValue(200);
  const arrowScale = useSharedValue(0.5);
  const arrowOpacity = useSharedValue(0);
  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

  const arrowStyle = useAnimatedStyle(() => ({
    left: arrowX.value - 50,
    top: arrowY.value - 50,
    opacity: arrowOpacity.value,
    transform: [{ scale: arrowScale.value }],
  }));

  const leftStyle = useAnimatedStyle(() => ({ transform: [{ scale: leftScale.value }] }));
  const rightStyle = useAnimatedStyle(() => ({ transform: [{ scale: rightScale.value }] }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    cancelAnimation(arrowX);
    cancelAnimation(arrowY);
    cancelAnimation(arrowOpacity);
    cancelAnimation(arrowScale);
  }, [arrowOpacity, arrowScale, arrowX, arrowY]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = totalRounds;
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
    [clearTimers, logType, router, skillTags, totalRounds, ttsComplete],
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

  const showWarn = useCallback(
    (msg: string) => {
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      speakTTS(msg, 0.78).catch(() => {});
    },
    [playWarn],
  );

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    setShowArrow(false);
    roundCompleteRef.current = false;
    if (roundRef.current >= totalRounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame, totalRounds]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    canTapRef.current = false;
    clearTimers();
    arrowOpacity.value = withTiming(0, { duration: 180 });
    setShowArrow(false);
    bumpScore();
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, arrowOpacity, bumpScore, clearTimers]);

  const layoutArrowCenter = useCallback(() => {
    arrowX.value = playW.current * 0.5;
    arrowY.value = playH.current * 0.38;
  }, [arrowX, arrowY]);

  const startMovingArrow = useCallback(
    (dir: ArrowDirection) => {
      const w = playW.current;
      const h = playH.current;
      const pad = 60;
      let sx = w * 0.5;
      let sy = h * 0.38;
      let ex = sx;
      let ey = sy;
      if (dir === 'left') {
        sx = w + pad;
        ex = -pad;
      } else if (dir === 'right') {
        sx = -pad;
        ex = w + pad;
      } else if (dir === 'up') {
        sy = h + pad;
        ey = -pad;
      } else {
        sy = -pad;
        ey = h + pad;
      }
      arrowX.value = sx;
      arrowY.value = sy;
      arrowOpacity.value = withTiming(1, { duration: 180 });
      arrowScale.value = withSpring(1);
      arrowX.value = withTiming(ex, { duration: P.moveDurationMs });
      arrowY.value = withTiming(ey, { duration: P.moveDurationMs });
      roundTimerRef.current = setTimeout(() => {
        if (roundActiveRef.current && !roundCompleteRef.current && canTapRef.current) {
          showWarn('Too slow! Catch the arrow!');
          canTapRef.current = false;
          arrowOpacity.value = withTiming(0, { duration: 160 });
          setShowArrow(false);
          roundTimerRef.current = setTimeout(() => advanceRound(), 500);
        }
      }, P.moveDurationMs);
    },
    [advanceRound, arrowOpacity, arrowScale, arrowX, arrowY, showWarn],
  );

  const revealArrow = useCallback(() => {
    const dir = randomDirection();
    const hand = crossBodyHand(dir);
    setArrowDir(dir);
    setExpectedHand(hand);
    expectedRef.current = hand;
    setShowArrow(true);
    canTapRef.current = true;
    roundCompleteRef.current = false;

    const hint =
      dir === 'left'
        ? 'Left arrow → RIGHT hand!'
        : dir === 'right'
          ? 'Right arrow → LEFT hand!'
          : `${arrowEmoji(dir)} → ${handLabel(hand)} hand!`;
    setStatusHint(hint);
    speakTTS(hint, 0.78).catch(() => {});

    if (mode === 'moving') {
      startMovingArrow(dir);
      return;
    }

    layoutArrowCenter();
    arrowOpacity.value = 0;
    arrowScale.value = 0.5;
    arrowOpacity.value = withTiming(1, { duration: P.arrowRevealMs });
    arrowScale.value = withSpring(1);

    if (mode === 'speed') {
      const ms = speedDisplayMs(roundRef.current);
      roundTimerRef.current = setTimeout(() => {
        if (roundActiveRef.current && !roundCompleteRef.current && canTapRef.current) {
          showWarn('Too slow!');
          canTapRef.current = false;
          arrowOpacity.value = withTiming(0, { duration: 160 });
          setShowArrow(false);
          roundTimerRef.current = setTimeout(() => advanceRound(), 500);
        }
      }, ms);
    }
  }, [arrowOpacity, arrowScale, layoutArrowCenter, mode, showWarn, startMovingArrow]);

  const handleHand = useCallback(
    (hand: Hand) => {
      if (!roundActiveRef.current || !canTapRef.current || roundCompleteRef.current || doneRef.current) return;
      if (!showArrow) return;

      if (hand === expectedRef.current) {
        const scale = hand === 'left' ? leftScale : rightScale;
        scale.value = withSequence(withSpring(1.2), withSpring(1));
        completeRound();
        return;
      }

      const scale = hand === 'left' ? leftScale : rightScale;
      scale.value = withSequence(withSpring(0.88), withSpring(1));
      showWarn(`Use your ${handLabel(expectedRef.current)} hand!`);
    },
    [completeRound, leftScale, rightScale, showArrow, showWarn],
  );

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    setRoundActive(true);
    speakTTS(ttsCue, 0.78).catch(() => {});
    revealArrow();
  }, [revealArrow, ttsCue]);

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

      <View
        style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
        onLayout={(e) => {
          playW.current = e.nativeEvent.layout.width;
          playH.current = e.nativeEvent.layout.height;
        }}
      >
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

        {roundActive && showArrow && (
          <Animated.View pointerEvents="none" style={[styles.arrow, arrowStyle]}>
            <Text style={styles.arrowEmoji}>{arrowEmoji(arrowDir)}</Text>
          </Animated.View>
        )}

        {roundActive && (
          <View style={styles.handsRow}>
            <TouchableOpacity onPress={() => handleHand('left')} activeOpacity={0.85}>
              <Animated.View style={[styles.hand, { backgroundColor: T.leftColor }, leftStyle]}>
                <Text style={styles.handEmoji}>👈</Text>
                <Text style={styles.handLabel}>LEFT</Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleHand('right')} activeOpacity={0.85}>
              <Animated.View style={[styles.hand, { backgroundColor: T.rightColor }, rightStyle]}>
                <Text style={styles.handEmoji}>👉</Text>
                <Text style={styles.handLabel}>RIGHT</Text>
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
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, justifyContent: 'flex-end', paddingBottom: 24 },
  waitText: { position: 'absolute', alignSelf: 'center', top: '42%', fontSize: 18, fontWeight: '700' },
  arrow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  arrowEmoji: { fontSize: 52 },
  handsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 12 },
  hand: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handEmoji: { fontSize: 40, marginBottom: 2 },
  handLabel: { fontSize: 10, fontWeight: '800', color: '#fff' },
});

export default CrossBodyArrowGame;
