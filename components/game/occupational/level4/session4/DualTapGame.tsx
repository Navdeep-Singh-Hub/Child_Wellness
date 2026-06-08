/**
 * Shared two-hand simultaneous tap core for OT Level 4 Session 4.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
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

  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);
  const leftBright = useSharedValue(1);
  const rightBright = useSharedValue(1);
  const leftBg = useSharedValue(T.leftColor);
  const rightBg = useSharedValue(T.rightColor);

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
    backgroundColor: mode === 'keys' ? leftBg.value : T.leftColor,
  }));

  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rightScale.value }],
    opacity: mode === 'lights' ? rightBright.value : 1,
    backgroundColor: mode === 'keys' ? rightBg.value : T.rightColor,
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
  }, [leftScale, rightScale]);

  const resetTargets = useCallback(() => {
    leftTappedRef.current = false;
    rightTappedRef.current = false;
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
  }, [T.leftColor, T.rightColor, leftBg, leftBright, leftScale, mode, rightBg, rightBright, rightScale]);

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
  }, [clearTimers, endGame, playWarn, ttsMiss]);

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
    leftScale.value = withSequence(withTiming(1.2, { duration: 120 }), withTiming(1, { duration: 120 }));
    rightScale.value = withSequence(withTiming(1.2, { duration: 120 }), withTiming(1, { duration: 120 }));
    if (mode === 'lights') {
      leftBright.value = withTiming(0.35);
      rightBright.value = withTiming(0.35);
      setLightsOn(false);
    }
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, leftBright, leftScale, mode, rightBright, rightScale, clearTimers]);

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
    if (mode === 'keys') leftBg.value = '#10B981';
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    tryComplete();
  }, [leftBg, leftScale, mode, tryComplete]);

  const handleRightTap = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
    if (mode === 'lights' && !lightsOnRef.current) return;
    if (rightTappedRef.current) return;
    rightTappedRef.current = true;
    rightScale.value = withSpring(0.88);
    if (mode === 'keys') rightBg.value = '#10B981';
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    tryComplete();
  }, [mode, rightBg, rightScale, tryComplete]);

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
    setStatusHint('Tap both lights now!');
    speakTTS(ttsCue, 0.78).catch(() => {});
    roundTimerRef.current = setTimeout(() => {
      if (roundActiveRef.current && !roundCompleteRef.current && lightsOnRef.current) {
        leftBright.value = withTiming(0.35);
        rightBright.value = withTiming(0.35);
        setLightsOn(false);
        lightsOnRef.current = false;
        const delay = P.lightDelayMinMs + Math.random() * (P.lightDelayMaxMs - P.lightDelayMinMs);
        roundTimerRef.current = setTimeout(() => lightUpBoth(), delay);
        speakTTS('Too slow!', 0.78).catch(() => {});
      }
    }, P.lightDurationMs);
  }, [leftBright, leftScale, resetTargets, rightBright, rightScale, ttsCue]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    resetTargets();

    if (mode === 'circles') {
      setStatusHint('Tap both circles!');
      speakTTS(ttsCue, 0.78).catch(() => {});
    } else if (mode === 'keys') {
      setStatusHint('Beat the clock!');
      speakTTS(ttsCue, 0.78).catch(() => {});
      startTimedCountdown();
    } else if (mode === 'drums') {
      setStatusHint('Tap both drums!');
      leftScale.value = withSequence(withSpring(1.15), withSpring(1));
      rightScale.value = withSequence(withSpring(1.15), withSpring(1));
      speakTTS(ttsCue, 0.78).catch(() => {});
    } else if (mode === 'lights') {
      setStatusHint('Watch for the lights…');
      const delay = P.lightDelayMinMs + Math.random() * (P.lightDelayMaxMs - P.lightDelayMinMs);
      roundTimerRef.current = setTimeout(() => lightUpBoth(), delay);
    }
  }, [leftScale, lightUpBoth, mode, resetTargets, rightScale, startTimedCountdown, ttsCue]);

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
        {mode === 'keys' && roundActive && (
          <View style={[styles.timerTrack, { borderColor: T.accent }]}>
            <View style={[styles.timerFill, { width: `${timerPct}%`, backgroundColor: T.accent }]} />
          </View>
        )}
      </View>

      <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

        {roundActive && (
          <View style={styles.targetsRow}>
            <TouchableOpacity onPress={handleLeftTap} activeOpacity={0.85} style={styles.targetWrap}>
              <Animated.View style={[targetShape, styles.leftTarget, leftStyle]}>
                <Text style={styles.targetEmoji}>{T.leftEmoji}</Text>
                <Text style={styles.targetLabel}>LEFT</Text>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRightTap} activeOpacity={0.85} style={styles.targetWrap}>
              <Animated.View style={[targetShape, styles.rightTarget, rightStyle]}>
                <Text style={styles.targetEmoji}>{T.rightEmoji}</Text>
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
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  timerTrack: { width: '70%', height: 10, borderRadius: 8, borderWidth: 1, overflow: 'hidden', marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.5)' },
  timerFill: { height: '100%', borderRadius: 8 },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, justifyContent: 'center' },
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
});

export default DualTapGame;
