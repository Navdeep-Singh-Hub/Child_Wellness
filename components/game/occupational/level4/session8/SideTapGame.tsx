/**
 * Shared left/right side tap core for OT Level 4 Session 8.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import {
  Side,
  SoundCue,
  randomCountNumber,
  randomSide,
  randomSound,
  sideForNumber,
  soundEmoji,
  useTraceSound,
} from '@/components/game/occupational/level4/session8/sideTapUtils';
import { SESSION4_8_PACING } from '@/components/game/occupational/level4/session8/session8Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, playSound, stopAllSpeech } from '@/utils/soundPlayer';
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
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION4_8_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type SideTapMode = 'lights' | 'sound' | 'count' | 'fast';

export type SideTapTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  leftColor: string;
  rightColor: string;
  leftIcon: string;
  rightIcon: string;
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

export type SideTapGameConfig = {
  theme: SideTapTheme;
  mode: SideTapMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsCue?: string;
  ttsSuccess?: string;
  ttsMiss?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

const roundsForMode = (mode: SideTapMode) => {
  switch (mode) {
    case 'lights':
      return P.lightsRounds;
    case 'sound':
      return P.soundRounds;
    case 'count':
      return P.countRounds;
    case 'fast':
      return P.fastRounds;
  }
};

const fastDisplayMs = (round: number) =>
  Math.max(P.fastMinMs, P.fastInitialMs - (round - 1) * P.fastDecreaseMs);

export const SideTapGame: React.FC<
  SideTapGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsCue = 'Tap the active side!',
  ttsSuccess = 'Perfect!',
  ttsMiss = 'Too slow!',
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
  const [activeSide, setActiveSide] = useState<Side | null>(null);
  const [countNumber, setCountNumber] = useState<number | null>(null);
  const [soundCue, setSoundCue] = useState<SoundCue>('bell');

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const activeRef = useRef<Side | null>(null);
  const canTapRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);
  const leftGlow = useSharedValue(0.35);
  const rightGlow = useSharedValue(0.35);
  const centerScale = useSharedValue(1);

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
    transform: [{ scale: leftScale.value }],
    opacity: 0.4 + leftGlow.value * 0.6,
  }));
  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rightScale.value }],
    opacity: 0.4 + rightGlow.value * 0.6,
  }));
  const centerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: centerScale.value }],
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    cancelAnimation(leftGlow);
    cancelAnimation(rightGlow);
  }, [leftGlow, rightGlow]);

  const pulseSide = useCallback(
    (side: Side) => {
      const glow = side === 'left' ? leftGlow : rightGlow;
      const other = side === 'left' ? rightGlow : leftGlow;
      other.value = 0.35;
      glow.value = withRepeat(
        withSequence(withTiming(1, { duration: P.pulseHalfMs }), withTiming(0.55, { duration: P.pulseHalfMs })),
        -1,
        true,
      );
    },
    [leftGlow, rightGlow],
  );

  const dimSides = useCallback(() => {
    leftGlow.value = withTiming(0.35, { duration: 160 });
    rightGlow.value = withTiming(0.35, { duration: 160 });
  }, [leftGlow, rightGlow]);

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
    setActiveSide(null);
    activeRef.current = null;
    setCountNumber(null);
    roundCompleteRef.current = false;
    dimSides();
    if (roundRef.current >= totalRounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, dimSides, endGame, totalRounds]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    canTapRef.current = false;
    clearTimers();
    dimSides();
    bumpScore();
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, clearTimers, dimSides]);

  const missRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current || !canTapRef.current) return;
    roundCompleteRef.current = true;
    canTapRef.current = false;
    clearTimers();
    dimSides();
    showWarn(ttsMiss);
    roundTimerRef.current = setTimeout(() => advanceRound(), 500);
  }, [advanceRound, clearTimers, dimSides, showWarn, ttsMiss]);

  const revealCue = useCallback(() => {
    let side: Side;
    let hint = '';
    if (mode === 'count') {
      const n = randomCountNumber();
      side = sideForNumber(n);
      setCountNumber(n);
      centerScale.value = 0.5;
      centerScale.value = withSpring(1);
      hint = `${n} is ${n % 2 === 1 ? 'odd' : 'even'} → ${side.toUpperCase()}!`;
      speakTTS(`Number ${n}! ${n % 2 === 1 ? 'Odd' : 'Even'} means ${side} side!`, 0.78).catch(() => {});
    } else {
      side = randomSide();
      if (mode === 'sound') {
        const snd = randomSound();
        setSoundCue(snd);
        playSound(snd, 0.8, 1.0).catch(() => {});
        hint = `${soundEmoji(snd)} on ${side.toUpperCase()}!`;
        speakTTS(`Sound on ${side} side!`, 0.78).catch(() => {});
      } else {
        hint = `Tap ${side.toUpperCase()}!`;
        speakTTS(`Tap ${side} side!`, 0.78).catch(() => {});
      }
    }
    setActiveSide(side);
    activeRef.current = side;
    setStatusHint(hint);
    canTapRef.current = true;
    roundCompleteRef.current = false;
    pulseSide(side);

    const timeoutMs =
      mode === 'count'
        ? P.countTimeoutMs
        : mode === 'fast'
          ? fastDisplayMs(roundRef.current)
          : mode === 'sound'
            ? P.soundTimeoutMs
            : P.lightsTimeoutMs;

    roundTimerRef.current = setTimeout(() => missRound(), timeoutMs);
  }, [centerScale, missRound, mode, pulseSide]);

  const handleSide = useCallback(
    (side: Side) => {
      if (!roundActiveRef.current || !canTapRef.current || roundCompleteRef.current || doneRef.current) return;
      if (!activeRef.current) return;

      if (side === activeRef.current) {
        const scale = side === 'left' ? leftScale : rightScale;
        scale.value = withSequence(withSpring(1.2), withSpring(1));
        if (mode === 'count') {
          centerScale.value = withSequence(withTiming(1.3, { duration: 140 }), withTiming(0, { duration: 160 }));
        }
        completeRound();
        return;
      }

      const scale = side === 'left' ? leftScale : rightScale;
      scale.value = withSequence(withSpring(0.88), withSpring(1));
      if (mode === 'count' && countNumber !== null) {
        const isOdd = countNumber % 2 === 1;
        showWarn(`${countNumber} is ${isOdd ? 'odd' : 'even'}! Tap ${activeRef.current}!`);
      } else {
        showWarn(`Tap ${activeRef.current}!`);
      }
    },
    [centerScale, completeRound, countNumber, leftScale, mode, rightScale, showWarn],
  );

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    setRoundActive(true);
    speakTTS(ttsCue, 0.78).catch(() => {});
    revealCue();
  }, [revealCue, ttsCue]);

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

  const leftPanelIcon = mode === 'sound' && activeSide === 'left' ? soundEmoji(soundCue) : T.leftIcon;
  const rightPanelIcon = mode === 'sound' && activeSide === 'right' ? soundEmoji(soundCue) : T.rightIcon;

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

      <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

        {roundActive && mode === 'count' && countNumber !== null && (
          <Animated.View style={[styles.centerNumber, centerStyle, { borderColor: T.accent }]}>
            <Text style={[styles.numberText, { color: T.accentDark }]}>{countNumber}</Text>
          </Animated.View>
        )}

        {roundActive && (
          <View style={styles.sidesRow}>
            <TouchableOpacity onPress={() => handleSide('left')} activeOpacity={0.85} style={styles.sideTap}>
              <Animated.View style={[styles.sidePanel, { backgroundColor: T.leftColor }, leftStyle]}>
                <Text style={styles.sideIcon}>{leftPanelIcon}</Text>
                <Text style={styles.sideLabel}>LEFT</Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSide('right')} activeOpacity={0.85} style={styles.sideTap}>
              <Animated.View style={[styles.sidePanel, { backgroundColor: T.rightColor }, rightStyle]}>
                <Text style={styles.sideIcon}>{rightPanelIcon}</Text>
                <Text style={styles.sideLabel}>RIGHT</Text>
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
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, justifyContent: 'center' },
  waitText: { position: 'absolute', alignSelf: 'center', fontSize: 18, fontWeight: '700' },
  centerNumber: {
    position: 'absolute',
    alignSelf: 'center',
    top: '28%',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  numberText: { fontSize: 40, fontWeight: '900' },
  sidesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 8 },
  sideTap: { flex: 1, alignItems: 'center' },
  sidePanel: {
    width: 130,
    height: 130,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideIcon: { fontSize: 44, marginBottom: 4 },
  sideLabel: { fontSize: 11, fontWeight: '800', color: '#fff' },
});

export default SideTapGame;
