/**
 * Shared two-hand simultaneous tap core for OT Level 4 Session 4.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast, SparkleBurst } from '@/components/game/FX';
import { TwinTapPlayArea } from '@/components/game/occupational/level4/session4/TwinTapPlayArea';
import { DuoKeysPlayArea } from '@/components/game/occupational/level4/session4/DuoKeysPlayArea';
import { BeatDuoPlayArea } from '@/components/game/occupational/level4/session4/BeatDuoPlayArea';
import { FlashTapPlayArea } from '@/components/game/occupational/level4/session4/FlashTapPlayArea';
import { useTraceSound } from '@/components/game/occupational/level4/session4/dualTapUtils';
import { SESSION4_4_PACING } from '@/components/game/occupational/level4/session4/session4Pacing';
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

const P = SESSION4_4_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type DualTapMode = 'circles' | 'keys' | 'drums' | 'lights';

export type DualTapTargetStyle = 'circle' | 'key' | 'drum' | 'light';

export type DualTapTheme = {
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
  targetStyle: DualTapTargetStyle;
};

export type DualTapGameConfig = {
  theme: DualTapTheme;
  mode: DualTapMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsCue?: string;
  ttsSuccess?: string;
  ttsMiss?: string;
  ttsTooSlow?: string;
  ttsWatch?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const DualTapGame: React.FC<
  DualTapGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsCue = 'Tap both sides together!',
  ttsSuccess = 'Perfect! Both hands!',
  ttsMiss = 'Tap both sides together!',
  ttsTooSlow = 'Too slow!',
  ttsWatch = 'Watch for the lights…',
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarn = useTraceSound(WARN);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [timeLeftMs, setTimeLeftMs] = useState(P.timedLimitMs);
  const [lightsOn, setLightsOn] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [kickOffVisible, setKickOffVisible] = useState(false);
  const [syncKey, setSyncKey] = useState(0);
  const [leftLit, setLeftLit] = useState(false);
  const [rightLit, setRightLit] = useState(false);
  const [chordKey, setChordKey] = useState(0);
  const [beatKey, setBeatKey] = useState(0);
  const [flashKey, setFlashKey] = useState(0);
  const [warnVisible, setWarnVisible] = useState(false);
  const [warnMessage, setWarnMessage] = useState('Try again!');

  const isTwinTap = mode === 'circles';
  const isDuoKeys = mode === 'keys';
  const isBeatDuo = mode === 'drums';
  const isFlashTap = mode === 'lights';

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const leftTappedRef = useRef(false);
  const rightTappedRef = useRef(false);
  const lightsOnRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const kickOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);
  const leftBright = useSharedValue(1);
  const rightBright = useSharedValue(1);
  const leftBg = useSharedValue(T.leftColor);
  const rightBg = useSharedValue(T.rightColor);
  const kickOffOpacity = useSharedValue(0);
  const playShake = useSharedValue(0);

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
    lightsOnRef.current = lightsOn;
  }, [lightsOn]);

  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ scale: leftScale.value }],
    opacity: mode === 'lights' ? leftBright.value : 1,
    backgroundColor:
      mode === 'keys'
        ? isDuoKeys
          ? 'transparent'
          : leftBg.value
        : isTwinTap || isBeatDuo || isFlashTap
          ? 'transparent'
          : T.leftColor,
  }));

  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rightScale.value }],
    opacity: mode === 'lights' ? rightBright.value : 1,
    backgroundColor:
      mode === 'keys'
        ? isDuoKeys
          ? 'transparent'
          : rightBg.value
        : isTwinTap || isBeatDuo || isFlashTap
          ? 'transparent'
          : T.rightColor,
  }));

  const kickOffStyle = useAnimatedStyle(() => ({
    opacity: kickOffOpacity.value,
    transform: [{ scale: 0.9 + kickOffOpacity.value * 0.1 }],
  }));

  const playShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playShake.value }],
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
    if (kickOffTimerRef.current) {
      clearTimeout(kickOffTimerRef.current);
      kickOffTimerRef.current = null;
    }
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    cancelAnimation(leftScale);
    cancelAnimation(rightScale);
    cancelAnimation(kickOffOpacity);
    cancelAnimation(playShake);
  }, [kickOffOpacity, leftScale, playShake, rightScale]);

  const resetTargets = useCallback(() => {
    leftTappedRef.current = false;
    rightTappedRef.current = false;
    if (isTwinTap || isDuoKeys || isBeatDuo || isFlashTap) {
      setLeftLit(false);
      setRightLit(false);
      setSuccessToast(false);
    }
    if (isDuoKeys || isFlashTap) setWarnVisible(false);
    leftScale.value = withSpring(1);
    rightScale.value = withSpring(1);
    leftBg.value = T.leftColor;
    rightBg.value = T.rightColor;
    if (mode === 'lights') {
      leftBright.value = withTiming(0.35);
      rightBright.value = withTiming(0.35);
      setLightsOn(false);
      lightsOnRef.current = false;
    }
  }, [T.leftColor, T.rightColor, isBeatDuo, isDuoKeys, isFlashTap, isTwinTap, leftBg, leftBright, leftScale, mode, rightBg, rightBright, rightScale]);

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

  const failRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    playWarn();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    speakTTS(ttsMiss, 0.78).catch(() => {});
    if (isDuoKeys) {
      setWarnMessage(ttsMiss);
      setWarnVisible(true);
      playShake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      toastTimerRef.current = setTimeout(() => setWarnVisible(false), 1200);
    }
    clearTimers();
    setRoundActive(false);
    roundTimerRef.current = setTimeout(() => {
      roundCompleteRef.current = false;
      if (roundRef.current >= P.rounds) {
        endGame(scoreRef.current);
      } else {
        setRound((r) => r + 1);
      }
    }, 700);
  }, [clearTimers, endGame, isDuoKeys, playShake, playWarn, ttsMiss]);

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
    clearTimers();
    bumpScore();
    if (isTwinTap) {
      setSuccessToast(true);
      setSyncKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    if (isDuoKeys) {
      setSuccessToast(true);
      setChordKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    if (isBeatDuo) {
      setSuccessToast(true);
      setBeatKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    if (isFlashTap) {
      setSuccessToast(true);
      setFlashKey(Date.now());
      toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    }
    leftScale.value = withSequence(withTiming(1.2, { duration: 120 }), withTiming(1, { duration: 120 }));
    rightScale.value = withSequence(withTiming(1.2, { duration: 120 }), withTiming(1, { duration: 120 }));
    if (mode === 'lights') {
      leftBright.value = withTiming(0.35);
      rightBright.value = withTiming(0.35);
      setLightsOn(false);
    }
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, isBeatDuo, isDuoKeys, isFlashTap, isTwinTap, leftBright, leftScale, mode, rightBright, rightScale, clearTimers]);

  const tryComplete = useCallback(() => {
    if (leftTappedRef.current && rightTappedRef.current) {
      completeRound();
    }
  }, [completeRound]);

  const handleLeftTap = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
    if (mode === 'lights' && !lightsOnRef.current) return;
    if (leftTappedRef.current) return;
    leftTappedRef.current = true;
    leftScale.value = withSpring(0.88);
    if (isTwinTap || isDuoKeys || isBeatDuo || isFlashTap) setLeftLit(true);
    if (mode === 'keys' && !isDuoKeys) leftBg.value = '#10B981';
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    tryComplete();
  }, [isBeatDuo, isDuoKeys, isFlashTap, isTwinTap, leftBg, leftScale, mode, tryComplete]);

  const handleRightTap = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
    if (mode === 'lights' && !lightsOnRef.current) return;
    if (rightTappedRef.current) return;
    rightTappedRef.current = true;
    rightScale.value = withSpring(0.88);
    if (isTwinTap || isDuoKeys || isBeatDuo || isFlashTap) setRightLit(true);
    if (mode === 'keys' && !isDuoKeys) rightBg.value = '#10B981';
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    tryComplete();
  }, [isBeatDuo, isDuoKeys, isFlashTap, isTwinTap, mode, rightBg, rightScale, tryComplete]);

  const startTimedCountdown = useCallback(() => {
    setTimeLeftMs(P.timedLimitMs);
    tickTimerRef.current = setInterval(() => {
      setTimeLeftMs((prev) => {
        const next = prev - P.timedTickMs;
        if (next <= 0) {
          if (tickTimerRef.current) clearInterval(tickTimerRef.current);
          if (roundActiveRef.current && !roundCompleteRef.current) failRound();
          return 0;
        }
        return next;
      });
    }, P.timedTickMs);
  }, [failRound]);

  const lightUpBoth = useCallback(() => {
    if (doneRef.current) return;
    resetTargets();
    setLightsOn(true);
    lightsOnRef.current = true;
    leftBright.value = withTiming(1);
    rightBright.value = withTiming(1);
    leftScale.value = withSpring(1.08);
    rightScale.value = withSpring(1.08);
    setStatusHint(isFlashTap ? '⚡ Both targets lit — TAP!' : 'Tap both lights now!');
    speakTTS(ttsCue, 0.78).catch(() => {});
    if (isFlashTap) {
      setKickOffVisible(true);
      kickOffOpacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(1, { duration: 500 }),
        withTiming(0, { duration: 300 }),
      );
      kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1000);
    }
    roundTimerRef.current = setTimeout(() => {
      if (roundActiveRef.current && !roundCompleteRef.current && lightsOnRef.current) {
        leftBright.value = withTiming(0.35);
        rightBright.value = withTiming(0.35);
        setLightsOn(false);
        lightsOnRef.current = false;
        if (isFlashTap) {
          setWarnMessage(ttsTooSlow);
          setWarnVisible(true);
          playShake.value = withSequence(
            withTiming(-8, { duration: 50 }),
            withTiming(8, { duration: 50 }),
            withTiming(-6, { duration: 50 }),
            withTiming(0, { duration: 50 }),
          );
          toastTimerRef.current = setTimeout(() => setWarnVisible(false), 1000);
        }
        const delay = P.lightDelayMinMs + Math.random() * (P.lightDelayMaxMs - P.lightDelayMinMs);
        roundTimerRef.current = setTimeout(() => lightUpBoth(), delay);
        speakTTS(isFlashTap ? ttsTooSlow : 'Too slow!', 0.78).catch(() => {});
      }
    }, P.lightDurationMs);
  }, [isFlashTap, kickOffOpacity, leftBright, leftScale, playShake, resetTargets, rightBright, rightScale, ttsCue, ttsTooSlow]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    resetTargets();

    if (mode === 'circles') {
      setStatusHint(isTwinTap ? 'Tap both orbs together!' : 'Tap both circles!');
      speakTTS(ttsCue, 0.78).catch(() => {});
      if (isTwinTap) {
        setKickOffVisible(true);
        kickOffOpacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 700 }),
          withTiming(0, { duration: 350 }),
        );
        kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1300);
      }
    } else if (mode === 'keys') {
      setStatusHint(isDuoKeys ? 'Strike both keys — hurry!' : 'Beat the clock!');
      speakTTS(ttsCue, 0.78).catch(() => {});
      startTimedCountdown();
      if (isDuoKeys) {
        setKickOffVisible(true);
        kickOffOpacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 700 }),
          withTiming(0, { duration: 350 }),
        );
        kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1300);
      }
    } else if (mode === 'drums') {
      setStatusHint(isBeatDuo ? 'Hit both pads on the beat!' : 'Tap both drums!');
      leftScale.value = withSequence(withSpring(1.15), withSpring(1));
      rightScale.value = withSequence(withSpring(1.15), withSpring(1));
      speakTTS(ttsCue, 0.78).catch(() => {});
      if (isBeatDuo) {
        setKickOffVisible(true);
        kickOffOpacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 700 }),
          withTiming(0, { duration: 350 }),
        );
        kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1300);
      }
    } else if (mode === 'lights') {
      setStatusHint(isFlashTap ? 'Eyes on the grid…' : 'Watch for the lights…');
      if (isFlashTap) {
        speakTTS(ttsWatch, 0.78).catch(() => {});
        setKickOffVisible(true);
        kickOffOpacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 600 }),
          withTiming(0, { duration: 350 }),
        );
        kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1200);
      }
      const delay = P.lightDelayMinMs + Math.random() * (P.lightDelayMaxMs - P.lightDelayMinMs);
      roundTimerRef.current = setTimeout(() => lightUpBoth(), delay);
    }
  }, [isBeatDuo, isDuoKeys, isFlashTap, isTwinTap, kickOffOpacity, leftScale, lightUpBoth, mode, resetTargets, rightScale, startTimedCountdown, ttsCue, ttsWatch]);

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

  const timerPct = (timeLeftMs / P.timedLimitMs) * 100;
  const roundPct = (round / P.rounds) * 100;
  const showGuide = (isTwinTap || isDuoKeys || isBeatDuo || isFlashTap) && round <= 2;
  const timerUrgent = isDuoKeys && timerPct < 28;
  const timerFillColor = timerUrgent ? '#EF4444' : T.accent;
  const targetShape =
    T.targetStyle === 'key'
      ? styles.keyTarget
      : T.targetStyle === 'drum'
        ? styles.drumTarget
        : styles.circleTarget;

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
        {isTwinTap && (
          <View style={[styles.roundTrack, { borderColor: T.accent }]}>
            <View style={[styles.roundFill, { width: `${roundPct}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {isDuoKeys && (
          <View style={[styles.roundTrack, styles.keysRoundTrack, { borderColor: T.accent }]}>
            <View style={[styles.roundFill, { width: `${roundPct}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {isBeatDuo && (
          <View style={[styles.roundTrack, styles.beatRoundTrack, { borderColor: T.accent }]}>
            <View style={[styles.roundFill, { width: `${roundPct}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {isFlashTap && (
          <View style={[styles.roundTrack, styles.flashRoundTrack, { borderColor: T.accent }]}>
            <View style={[styles.roundFill, { width: `${roundPct}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {(isDuoKeys || mode === 'keys') && roundActive && (
          <View style={[styles.timerTrack, isDuoKeys && styles.keysTimerTrack, { borderColor: T.accent }]}>
            <View style={[styles.timerFill, { width: `${timerPct}%`, backgroundColor: timerFillColor }]} />
          </View>
        )}
        {isTwinTap && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoOrb}>⭕</Text>
            <Text style={[styles.decoPulse, { color: T.accent }]}>⚡</Text>
            <Text style={styles.decoOrb}>⭕</Text>
          </View>
        )}
        {isDuoKeys && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoNote}>♪</Text>
            <Text style={[styles.decoPulse, { color: T.accent }]}>🎹</Text>
            <Text style={styles.decoNote}>♪</Text>
          </View>
        )}
        {isBeatDuo && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoBurst}>💥</Text>
            <Text style={[styles.decoPulse, { color: T.accent }]}>🥁</Text>
            <Text style={styles.decoBurst}>💥</Text>
          </View>
        )}
        {isFlashTap && (
          <View style={styles.headerDeco}>
            <Text style={styles.decoFlash}>⚡</Text>
            <Text style={[styles.decoPulse, { color: T.accent }]}>💡</Text>
            <Text style={styles.decoFlash}>⚡</Text>
          </View>
        )}
      </View>

      <Animated.View style={[styles.playAreaWrap, (isTwinTap || isDuoKeys || isFlashTap) && playShakeStyle]}>
      <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

        {isTwinTap && (
          <TwinTapPlayArea
            roundActive={roundActive}
            showGuide={showGuide}
            leftLit={leftLit}
            rightLit={rightLit}
            syncKey={syncKey}
          />
        )}

        {isDuoKeys && (
          <DuoKeysPlayArea
            roundActive={roundActive}
            showGuide={showGuide}
            leftLit={leftLit}
            rightLit={rightLit}
            chordKey={chordKey}
            timerPct={timerPct}
          />
        )}

        {isBeatDuo && (
          <BeatDuoPlayArea
            roundActive={roundActive}
            showGuide={showGuide}
            leftLit={leftLit}
            rightLit={rightLit}
            beatKey={beatKey}
          />
        )}

        {isFlashTap && (
          <FlashTapPlayArea
            roundActive={roundActive}
            showGuide={showGuide}
            lightsOn={lightsOn}
            leftLit={leftLit}
            rightLit={rightLit}
            flashKey={flashKey}
          />
        )}

        {roundActive && (
          <View style={styles.targetsRow}>
            <TouchableOpacity onPress={handleLeftTap} activeOpacity={0.85} style={styles.targetWrap}>
              <Animated.View
                style={[
                  targetShape,
                  styles.leftTarget,
                  leftStyle,
                  isTwinTap && styles.twinOrb,
                  isTwinTap && { borderColor: T.leftColor },
                  isDuoKeys && styles.pianoKey,
                  isBeatDuo && styles.beatDrum,
                  isFlashTap && styles.flashTarget,
                  isFlashTap && { borderColor: T.leftColor },
                ]}
              >
                {isTwinTap ? (
                  <LinearGradient
                    colors={[T.leftColor, '#0284C7', '#0369A1']}
                    style={styles.twinOrbGradient}
                  >
                    <Text style={styles.targetEmoji}>{T.leftEmoji}</Text>
                    <Text style={styles.targetLabel}>LEFT</Text>
                  </LinearGradient>
                ) : isDuoKeys ? (
                  <LinearGradient colors={['#FFFBEB', '#FEF3C7', '#FDE68A']} style={styles.pianoKeyGradient}>
                    {leftLit && <View style={styles.keyPressedOverlay} />}
                    <Text style={styles.pianoNoteEmoji}>{T.leftEmoji}</Text>
                    <Text style={styles.pianoNoteLabel}>C</Text>
                    <Text style={styles.pianoKeyLabel}>LEFT</Text>
                  </LinearGradient>
                ) : isBeatDuo ? (
                  <LinearGradient colors={['#FB923C', '#F97316', '#EA580C']} style={styles.beatDrumGradient}>
                    {leftLit && <View style={styles.drumHitOverlay} />}
                    <Text style={styles.drumEmoji}>{T.leftEmoji}</Text>
                    <Text style={styles.drumHitLabel}>BOOM</Text>
                    <Text style={styles.drumSideLabel}>LEFT</Text>
                  </LinearGradient>
                ) : isFlashTap ? (
                  <LinearGradient colors={['#1E3A8A', '#3B82F6', '#60A5FA']} style={styles.flashTargetGradient}>
                    {leftLit && <View style={styles.flashHitOverlay} />}
                    <Text style={styles.flashEmoji}>{T.leftEmoji}</Text>
                    <Text style={styles.flashTargetLabel}>LEFT</Text>
                  </LinearGradient>
                ) : (
                  <>
                    <Text style={styles.targetEmoji}>{T.leftEmoji}</Text>
                    <Text style={styles.targetLabel}>LEFT</Text>
                  </>
                )}
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRightTap} activeOpacity={0.85} style={styles.targetWrap}>
              <Animated.View
                style={[
                  targetShape,
                  styles.rightTarget,
                  rightStyle,
                  isTwinTap && styles.twinOrb,
                  isTwinTap && { borderColor: T.rightColor },
                  isDuoKeys && styles.pianoKey,
                  isBeatDuo && styles.beatDrum,
                  isFlashTap && styles.flashTarget,
                  isFlashTap && { borderColor: T.rightColor },
                ]}
              >
                {isTwinTap ? (
                  <LinearGradient
                    colors={[T.rightColor, '#E11D48', '#BE123C']}
                    style={styles.twinOrbGradient}
                  >
                    <Text style={styles.targetEmoji}>{T.rightEmoji}</Text>
                    <Text style={styles.targetLabel}>RIGHT</Text>
                  </LinearGradient>
                ) : isDuoKeys ? (
                  <LinearGradient colors={['#FEF9C3', '#FEF3C7', '#FDE047']} style={styles.pianoKeyGradient}>
                    {rightLit && <View style={styles.keyPressedOverlay} />}
                    <Text style={styles.pianoNoteEmoji}>{T.rightEmoji}</Text>
                    <Text style={styles.pianoNoteLabel}>G</Text>
                    <Text style={styles.pianoKeyLabel}>RIGHT</Text>
                  </LinearGradient>
                ) : isBeatDuo ? (
                  <LinearGradient colors={['#F472B6', '#EC4899', '#DB2777']} style={styles.beatDrumGradient}>
                    {rightLit && <View style={styles.drumHitOverlay} />}
                    <Text style={styles.drumEmoji}>{T.rightEmoji}</Text>
                    <Text style={styles.drumHitLabel}>BOOM</Text>
                    <Text style={styles.drumSideLabel}>RIGHT</Text>
                  </LinearGradient>
                ) : isFlashTap ? (
                  <LinearGradient colors={['#7F1D1D', '#EF4444', '#F87171']} style={styles.flashTargetGradient}>
                    {rightLit && <View style={styles.flashHitOverlay} />}
                    <Text style={styles.flashEmoji}>{T.rightEmoji}</Text>
                    <Text style={styles.flashTargetLabel}>RIGHT</Text>
                  </LinearGradient>
                ) : (
                  <>
                    <Text style={styles.targetEmoji}>{T.rightEmoji}</Text>
                    <Text style={styles.targetLabel}>RIGHT</Text>
                  </>
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}

        {kickOffVisible && isTwinTap ? (
          <Animated.View style={[styles.kickOffBanner, kickOffStyle]} pointerEvents="none">
            <Text style={styles.kickOffText}>⭕ TWIN SYNC!</Text>
          </Animated.View>
        ) : null}
        {kickOffVisible && isDuoKeys ? (
          <Animated.View style={[styles.kickOffBanner, styles.keysKickOff, kickOffStyle]} pointerEvents="none">
            <Text style={[styles.kickOffText, styles.keysKickOffText]}>🎹 DUO CHORD!</Text>
          </Animated.View>
        ) : null}
        {kickOffVisible && isBeatDuo ? (
          <Animated.View style={[styles.kickOffBanner, styles.beatKickOff, kickOffStyle]} pointerEvents="none">
            <Text style={[styles.kickOffText, styles.beatKickOffText]}>🥁 DOUBLE BEAT!</Text>
          </Animated.View>
        ) : null}
        {kickOffVisible && isFlashTap && lightsOn ? (
          <Animated.View style={[styles.kickOffBanner, styles.flashKickOffGo, kickOffStyle]} pointerEvents="none">
            <Text style={[styles.kickOffText, styles.flashKickOffGoText]}>⚡ TAP NOW!</Text>
          </Animated.View>
        ) : null}
        {kickOffVisible && isFlashTap && !lightsOn ? (
          <Animated.View style={[styles.kickOffBanner, styles.flashKickOff, kickOffStyle]} pointerEvents="none">
            <Text style={[styles.kickOffText, styles.flashKickOffText]}>👀 WATCH!</Text>
          </Animated.View>
        ) : null}

        <SparkleBurst
          key={sparkleKey}
          visible={sparkleKey > 0}
          color={T.sparkleColor}
          count={isTwinTap || isDuoKeys || isBeatDuo || isFlashTap ? 16 : 10}
          size={isTwinTap || isDuoKeys || isBeatDuo || isFlashTap ? 8 : 6}
        />
        {isTwinTap && <ResultToast text="SYNC!" type="ok" show={successToast} />}
        {isDuoKeys && <ResultToast text="CHORD!" type="ok" show={successToast} />}
        {isBeatDuo && <ResultToast text="BEAT!" type="ok" show={successToast} />}
        {isFlashTap && <ResultToast text="FLASH!" type="ok" show={successToast} />}
      </View>
      </Animated.View>

      {warnVisible && (isDuoKeys || isFlashTap) && (
        <View style={[styles.keysWarnPill, isFlashTap && styles.flashWarnPill]}>
          <Text style={[styles.keysWarnText, isFlashTap && styles.flashWarnText]}>{warnMessage}</Text>
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
  timerTrack: { width: '70%', height: 10, borderRadius: 8, borderWidth: 1, overflow: 'hidden', marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.5)' },
  timerFill: { height: '100%', borderRadius: 8 },
  roundTrack: { width: '70%', height: 8, borderRadius: 6, borderWidth: 1, overflow: 'hidden', marginBottom: 6, backgroundColor: 'rgba(15,23,42,0.35)' },
  roundFill: { height: '100%', borderRadius: 6 },
  keysRoundTrack: { backgroundColor: 'rgba(28,10,10,0.45)' },
  beatRoundTrack: { backgroundColor: 'rgba(15,10,26,0.45)' },
  flashRoundTrack: { backgroundColor: 'rgba(3,7,18,0.45)' },
  keysTimerTrack: { backgroundColor: 'rgba(28,10,10,0.45)', height: 12 },
  headerDeco: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  decoOrb: { fontSize: 16 },
  decoNote: { fontSize: 16, color: '#FDE68A' },
  decoBurst: { fontSize: 16 },
  decoFlash: { fontSize: 16, color: '#67E8F9' },
  decoPulse: { fontSize: 14, fontWeight: '900' },
  playAreaWrap: { flex: 1 },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, justifyContent: 'center', overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  targetsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 24 },
  targetWrap: { alignItems: 'center' },
  circleTarget: {
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyTarget: {
    width: 96,
    height: 140,
    borderRadius: 14,
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
  leftTarget: {},
  rightTarget: {},
  targetEmoji: { fontSize: 44, marginBottom: 4 },
  targetLabel: { fontSize: 11, fontWeight: '800', color: '#fff' },
  twinOrb: { overflow: 'hidden', borderWidth: 3, shadowColor: '#22D3EE', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 8 },
  twinOrbGradient: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 59 },
  kickOffBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '18%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.88)',
    borderWidth: 2,
    borderColor: '#22D3EE',
  },
  kickOffText: { fontSize: 22, fontWeight: '900', color: '#22D3EE', letterSpacing: 1 },
  keysKickOff: {
    backgroundColor: 'rgba(28,10,10,0.9)',
    borderColor: '#F59E0B',
  },
  keysKickOffText: { color: '#FBBF24' },
  beatKickOff: {
    backgroundColor: 'rgba(15,10,26,0.92)',
    borderColor: '#F472B6',
  },
  beatKickOffText: { color: '#F472B6' },
  flashKickOff: {
    backgroundColor: 'rgba(3,7,18,0.92)',
    borderColor: '#64748B',
  },
  flashKickOffText: { color: '#94A3B8', fontSize: 20 },
  flashKickOffGo: {
    backgroundColor: 'rgba(3,7,18,0.92)',
    borderColor: '#22D3EE',
  },
  flashKickOffGoText: { color: '#22D3EE' },
  flashTarget: {
    overflow: 'hidden',
    borderWidth: 3,
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },
  flashTargetGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 59,
  },
  flashHitOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 59,
  },
  flashEmoji: { fontSize: 40, marginBottom: 4 },
  flashTargetLabel: { fontSize: 10, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  flashWarnPill: {
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderColor: '#22D3EE',
  },
  flashWarnText: { color: '#CFFAFE' },
  beatDrum: {
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  beatDrumGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 64,
  },
  drumHitOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 64,
  },
  drumEmoji: { fontSize: 40, marginBottom: 2 },
  drumHitLabel: { fontSize: 13, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  drumSideLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.85)', letterSpacing: 1 },
  pianoKey: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#292524',
    borderBottomWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  pianoKeyGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  keyPressedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(251,191,36,0.45)',
    borderRadius: 12,
  },
  pianoNoteEmoji: { fontSize: 28, marginBottom: 2 },
  pianoNoteLabel: { fontSize: 22, fontWeight: '900', color: '#292524', marginBottom: 2 },
  pianoKeyLabel: { fontSize: 9, fontWeight: '800', color: '#57534E', letterSpacing: 1 },
  keysWarnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(127,29,29,0.92)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  keysWarnText: { fontSize: 14, fontWeight: '800', color: '#FECACA', textAlign: 'center' },
});

export default DualTapGame;
