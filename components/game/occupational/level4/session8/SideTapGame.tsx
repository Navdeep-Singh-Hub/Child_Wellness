/**
 * Shared left/right side tap core for OT Level 4 Session 8.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast, SparkleBurst } from '@/components/game/FX';
import { GlowTapPlayArea } from '@/components/game/occupational/level4/session8/GlowTapPlayArea';
import { OddEvenTapPlayArea } from '@/components/game/occupational/level4/session8/OddEvenTapPlayArea';
import { QuickSwitchPlayArea } from '@/components/game/occupational/level4/session8/QuickSwitchPlayArea';
import { SoundTapPlayArea } from '@/components/game/occupational/level4/session8/SoundTapPlayArea';
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
  ttsWrong?: string;
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
  ttsWrong = 'Wrong side — tap the glowing panel!',
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
  const [successToast, setSuccessToast] = useState(false);
  const [kickOffVisible, setKickOffVisible] = useState(false);
  const [warnVisible, setWarnVisible] = useState(false);
  const [warnMessage, setWarnMessage] = useState('Try again!');
  const [glowKey, setGlowKey] = useState(0);
  const [soundKey, setSoundKey] = useState(0);
  const [countKey, setCountKey] = useState(0);
  const [fastKey, setFastKey] = useState(0);

  const isGlowTap = mode === 'lights';
  const isSoundTap = mode === 'sound';
  const isOddEvenTap = mode === 'count';
  const isQuickSwitch = mode === 'fast';
  const isThemedSide = isGlowTap || isSoundTap || isOddEvenTap || isQuickSwitch;

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const activeRef = useRef<Side | null>(null);
  const canTapRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kickOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);
  const leftGlow = useSharedValue(0.35);
  const rightGlow = useSharedValue(0.35);
  const centerScale = useSharedValue(1);
  const playShake = useSharedValue(0);
  const kickOffOpacity = useSharedValue(0);

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
  const playShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playShake.value }],
  }));
  const kickOffStyle = useAnimatedStyle(() => ({
    opacity: kickOffOpacity.value,
    transform: [{ scale: 0.9 + kickOffOpacity.value * 0.1 }],
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    if (kickOffTimerRef.current) {
      clearTimeout(kickOffTimerRef.current);
      kickOffTimerRef.current = null;
    }
    cancelAnimation(leftGlow);
    cancelAnimation(rightGlow);
    cancelAnimation(playShake);
    cancelAnimation(kickOffOpacity);
  }, [kickOffOpacity, leftGlow, playShake, rightGlow]);

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
      if (isThemedSide) {
        setWarnMessage(msg);
        setWarnVisible(true);
        playShake.value = withSequence(
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 50 }),
          withTiming(-6, { duration: 50 }),
          withTiming(0, { duration: 50 }),
        );
        toastTimerRef.current = setTimeout(() => setWarnVisible(false), 1200);
      }
    },
    [isThemedSide, playShake, playWarn],
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
    if (isGlowTap) {
      setSuccessToast(true);
      setGlowKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    if (isSoundTap) {
      setSuccessToast(true);
      setSoundKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    if (isOddEvenTap) {
      setSuccessToast(true);
      setCountKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    if (isQuickSwitch) {
      setSuccessToast(true);
      setFastKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, clearTimers, dimSides, isGlowTap, isOddEvenTap, isQuickSwitch, isSoundTap]);

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
        showWarn(isThemedSide ? ttsWrong : `Tap ${activeRef.current}!`);
      }
    },
    [centerScale, completeRound, countNumber, isThemedSide, leftScale, mode, rightScale, showWarn, ttsWrong],
  );

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    setRoundActive(true);
    if (isThemedSide) {
      setSuccessToast(false);
      setWarnVisible(false);
      setKickOffVisible(true);
      kickOffOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 700 }),
        withTiming(0, { duration: 350 }),
      );
      kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1300);
    }
    speakTTS(ttsCue, 0.78).catch(() => {});
    revealCue();
  }, [isThemedSide, kickOffOpacity, revealCue, ttsCue]);

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
        {isThemedSide && (
          <View
            style={[
              styles.roundTrack,
              isSoundTap && styles.soundRoundTrack,
              isOddEvenTap && styles.countRoundTrack,
              isQuickSwitch && styles.quickRoundTrack,
              { borderColor: T.accent },
            ]}
          >
            <View style={[styles.roundFill, { width: `${(round / totalRounds) * 100}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {isGlowTap && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoEmoji}>💡</Text>
            <Text style={[styles.decoArrow, { color: T.accent }]}>↔</Text>
            <Text style={styles.decoEmoji}>💡</Text>
          </View>
        )}
        {isSoundTap && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoEmoji}>👂</Text>
            <Text style={[styles.decoArrow, { color: T.accent }]}>🔊</Text>
            <Text style={styles.decoEmoji}>👆</Text>
          </View>
        )}
        {isOddEvenTap && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoEmoji}>1️⃣</Text>
            <Text style={[styles.decoArrow, { color: T.accent }]}>↔</Text>
            <Text style={styles.decoEmoji}>2️⃣</Text>
          </View>
        )}
        {isQuickSwitch && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoEmoji}>⚡</Text>
            <Text style={[styles.decoArrow, { color: T.accent }]}>↔</Text>
            <Text style={styles.decoEmoji}>⚡</Text>
          </View>
        )}
      </View>

      <Animated.View style={[styles.playAreaWrap, isThemedSide && playShakeStyle]}>
      <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }, isThemedSide && styles.playAreaThemed]}>
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

        {isGlowTap && (
          <GlowTapPlayArea
            roundActive={roundActive}
            showGuide={isGlowTap && round <= 2}
            glowKey={glowKey}
            activeSide={activeSide}
          />
        )}

        {isSoundTap && (
          <SoundTapPlayArea
            roundActive={roundActive}
            showGuide={isSoundTap && round <= 2}
            soundKey={soundKey}
            activeSide={activeSide}
            soundCue={soundCue}
          />
        )}

        {isOddEvenTap && (
          <OddEvenTapPlayArea
            roundActive={roundActive}
            showGuide={isOddEvenTap && round <= 2}
            countKey={countKey}
            countNumber={countNumber}
          />
        )}

        {isQuickSwitch && (
          <QuickSwitchPlayArea
            roundActive={roundActive}
            showGuide={isQuickSwitch && round <= 2}
            fastKey={fastKey}
            activeSide={activeSide}
            round={round}
            totalRounds={totalRounds}
          />
        )}

        {roundActive && mode === 'count' && countNumber !== null && (
          <Animated.View
            style={[
              styles.centerNumber,
              isOddEvenTap && styles.oddEvenNumber,
              isOddEvenTap && (countNumber % 2 === 1 ? styles.oddNumberBg : styles.evenNumberBg),
              centerStyle,
              !isOddEvenTap && { borderColor: T.accent },
            ]}
          >
            <Text style={[styles.numberText, isOddEvenTap ? styles.oddEvenNumberText : { color: T.accentDark }]}>
              {countNumber}
            </Text>
          </Animated.View>
        )}

        {roundActive && (
          <View style={styles.sidesRow}>
            <TouchableOpacity onPress={() => handleSide('left')} activeOpacity={0.85} style={styles.sideTap}>
              <Animated.View
                style={[
                  styles.sidePanel,
                  { backgroundColor: T.leftColor },
                  leftStyle,
                  isGlowTap && styles.glowPanel,
                  isGlowTap && activeSide === 'left' && styles.glowPanelActive,
                  isSoundTap && styles.soundPanel,
                  isSoundTap && activeSide === 'left' && styles.soundPanelActive,
                  isOddEvenTap && styles.oddPanel,
                  isOddEvenTap && activeSide === 'left' && styles.oddPanelActive,
                  isQuickSwitch && styles.quickPanel,
                  isQuickSwitch && activeSide === 'left' && styles.quickPanelActive,
                ]}
              >
                <Text style={styles.sideIcon}>{leftPanelIcon}</Text>
                <Text style={styles.sideLabel}>LEFT</Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSide('right')} activeOpacity={0.85} style={styles.sideTap}>
              <Animated.View
                style={[
                  styles.sidePanel,
                  { backgroundColor: T.rightColor },
                  rightStyle,
                  isGlowTap && styles.glowPanel,
                  isGlowTap && activeSide === 'right' && styles.glowPanelActive,
                  isSoundTap && styles.soundPanel,
                  isSoundTap && activeSide === 'right' && styles.soundPanelActive,
                  isOddEvenTap && styles.evenPanel,
                  isOddEvenTap && activeSide === 'right' && styles.evenPanelActive,
                  isQuickSwitch && styles.quickPanel,
                  isQuickSwitch && activeSide === 'right' && styles.quickPanelActive,
                ]}
              >
                <Text style={styles.sideIcon}>{rightPanelIcon}</Text>
                <Text style={styles.sideLabel}>RIGHT</Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}

        {kickOffVisible && isGlowTap ? (
          <Animated.View style={[styles.kickOffBanner, kickOffStyle]} pointerEvents="none">
            <Text style={styles.kickOffText}>💡 GLOW TAP!</Text>
          </Animated.View>
        ) : null}
        {kickOffVisible && isSoundTap ? (
          <Animated.View style={[styles.kickOffBanner, styles.soundKickOff, kickOffStyle]} pointerEvents="none">
            <Text style={[styles.kickOffText, styles.soundKickOffText]}>🔊 SOUND TAP!</Text>
          </Animated.View>
        ) : null}
        {kickOffVisible && isOddEvenTap ? (
          <Animated.View style={[styles.kickOffBanner, styles.oddEvenKickOff, kickOffStyle]} pointerEvents="none">
            <Text style={[styles.kickOffText, styles.oddEvenKickOffText]}>🔢 ODD EVEN TAP!</Text>
          </Animated.View>
        ) : null}
        {kickOffVisible && isQuickSwitch ? (
          <Animated.View style={[styles.kickOffBanner, styles.quickKickOff, kickOffStyle]} pointerEvents="none">
            <Text style={[styles.kickOffText, styles.quickKickOffText]}>⚡ QUICK SWITCH!</Text>
          </Animated.View>
        ) : null}

        <SparkleBurst
          key={sparkleKey}
          visible={sparkleKey > 0}
          color={T.sparkleColor}
          count={isThemedSide ? 16 : 10}
          size={isThemedSide ? 8 : 6}
        />
        {isGlowTap && <ResultToast text="GLOW!" type="ok" show={successToast} />}
        {isSoundTap && <ResultToast text="SOUND!" type="ok" show={successToast} />}
        {isOddEvenTap && <ResultToast text="MATCH!" type="ok" show={successToast} />}
        {isQuickSwitch && <ResultToast text="SWITCH!" type="ok" show={successToast} />}
      </View>
      </Animated.View>

      {warnVisible && isGlowTap && (
        <View style={styles.glowWarnPill}>
          <Text style={styles.glowWarnText}>{warnMessage}</Text>
        </View>
      )}
      {warnVisible && isSoundTap && (
        <View style={styles.soundWarnPill}>
          <Text style={styles.soundWarnText}>{warnMessage}</Text>
        </View>
      )}
      {warnVisible && isOddEvenTap && (
        <View style={styles.oddEvenWarnPill}>
          <Text style={styles.oddEvenWarnText}>{warnMessage}</Text>
        </View>
      )}
      {warnVisible && isQuickSwitch && (
        <View style={styles.quickWarnPill}>
          <Text style={styles.quickWarnText}>{warnMessage}</Text>
        </View>
      )}
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
  roundTrack: {
    width: '70%',
    height: 8,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: 'rgba(12,25,41,0.55)',
  },
  soundRoundTrack: { backgroundColor: 'rgba(46,16,101,0.55)' },
  countRoundTrack: { backgroundColor: 'rgba(26,10,20,0.55)' },
  quickRoundTrack: { backgroundColor: 'rgba(28,25,23,0.55)' },
  roundFill: { height: '100%', borderRadius: 6 },
  headerDeco: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  decoEmoji: { fontSize: 20 },
  decoArrow: { fontSize: 18, fontWeight: '900' },
  playAreaWrap: { flex: 1 },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, justifyContent: 'center', overflow: 'hidden' },
  playAreaThemed: { borderWidth: 2 },
  waitText: { position: 'absolute', alignSelf: 'center', fontSize: 18, fontWeight: '700', zIndex: 2 },
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
  oddEvenNumber: {
    top: '38%',
    borderWidth: 4,
    zIndex: 5,
  },
  oddNumberBg: {
    backgroundColor: 'rgba(69,10,10,0.92)',
    borderColor: '#EF4444',
  },
  evenNumberBg: {
    backgroundColor: 'rgba(30,58,138,0.92)',
    borderColor: '#60A5FA',
  },
  oddEvenNumberText: { color: '#FFF1F2' },
  sidesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 8, zIndex: 4 },
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
  glowPanel: {
    borderColor: 'rgba(191,219,254,0.45)',
    shadowColor: '#60A5FA',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  glowPanelActive: {
    borderColor: '#FDE047',
    borderWidth: 4,
    shadowColor: '#FDE047',
    shadowOpacity: 0.75,
    shadowRadius: 14,
    elevation: 10,
  },
  soundPanel: {
    borderColor: 'rgba(221,214,254,0.45)',
    shadowColor: '#A78BFA',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  soundPanelActive: {
    borderColor: '#FDE047',
    borderWidth: 4,
    shadowColor: '#FDE047',
    shadowOpacity: 0.75,
    shadowRadius: 14,
    elevation: 10,
  },
  oddPanel: {
    borderColor: 'rgba(254,205,211,0.45)',
    shadowColor: '#EF4444',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  oddPanelActive: {
    borderColor: '#FECDD3',
    borderWidth: 4,
    shadowColor: '#FB7185',
    shadowOpacity: 0.75,
    shadowRadius: 14,
    elevation: 10,
  },
  evenPanel: {
    borderColor: 'rgba(191,219,254,0.45)',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  evenPanelActive: {
    borderColor: '#BFDBFE',
    borderWidth: 4,
    shadowColor: '#60A5FA',
    shadowOpacity: 0.75,
    shadowRadius: 14,
    elevation: 10,
  },
  quickPanel: {
    borderColor: 'rgba(253,230,138,0.45)',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  quickPanelActive: {
    borderColor: '#FBBF24',
    borderWidth: 4,
    shadowColor: '#FBBF24',
    shadowOpacity: 0.85,
    shadowRadius: 16,
    elevation: 12,
  },
  sideIcon: { fontSize: 44, marginBottom: 4 },
  sideLabel: { fontSize: 11, fontWeight: '800', color: '#fff' },
  kickOffBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '12%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(12,25,41,0.92)',
    borderWidth: 2,
    borderColor: '#60A5FA',
    zIndex: 6,
  },
  kickOffText: { fontSize: 22, fontWeight: '900', color: '#BFDBFE', letterSpacing: 1 },
  soundKickOff: {
    backgroundColor: 'rgba(46,16,101,0.92)',
    borderColor: '#A78BFA',
  },
  soundKickOffText: { color: '#DDD6FE' },
  oddEvenKickOff: {
    backgroundColor: 'rgba(26,10,20,0.92)',
    borderColor: '#FB7185',
  },
  oddEvenKickOffText: { color: '#FECDD3' },
  quickKickOff: {
    backgroundColor: 'rgba(28,25,23,0.92)',
    borderColor: '#FBBF24',
  },
  quickKickOffText: { color: '#FDE68A' },
  glowWarnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(12,25,41,0.92)',
    borderWidth: 1,
    borderColor: '#60A5FA',
  },
  glowWarnText: { fontSize: 14, fontWeight: '800', color: '#BFDBFE', textAlign: 'center' },
  soundWarnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(46,16,101,0.92)',
    borderWidth: 1,
    borderColor: '#A78BFA',
  },
  soundWarnText: { fontSize: 14, fontWeight: '800', color: '#DDD6FE', textAlign: 'center' },
  oddEvenWarnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(26,10,20,0.92)',
    borderWidth: 1,
    borderColor: '#FB7185',
  },
  oddEvenWarnText: { fontSize: 14, fontWeight: '800', color: '#FECDD3', textAlign: 'center' },
  quickWarnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(28,25,23,0.92)',
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  quickWarnText: { fontSize: 14, fontWeight: '800', color: '#FDE68A', textAlign: 'center' },
});

export default SideTapGame;
