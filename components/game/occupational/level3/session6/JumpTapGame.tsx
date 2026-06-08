/**
 * Shared double-tap / jump imitation game core for OT Level 3 Session 6.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION6_PACING } from '@/components/game/occupational/level3/session6/session6Pacing';
import { randomJumpNumber, rhythmMatches, useTraceSound } from '@/components/game/occupational/level3/session6/jumpUtils';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION6_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type JumpTapMode = 'frogJump' | 'doubleTapOnly' | 'jumpCount' | 'obstacleJump' | 'rhythmJump';

export type JumpTapTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  objectEmoji: string;
  obstacleEmoji?: string;
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
  hintText: string;
};

export type JumpTapGameConfig = {
  theme: JumpTapTheme;
  mode: JumpTapMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsDoubleTap?: string;
  ttsSingleIgnored?: string;
  ttsNumberTwo?: string;
  ttsNumberOther?: string;
  ttsWrongNumber?: string;
  ttsRhythmPrompt?: string;
  ttsRhythmFail?: string;
  ttsObstacleMiss?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const JumpTapGame: React.FC<JumpTapGameConfig & { onBack?: () => void; onComplete?: () => void }> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsDoubleTap = 'Tap twice quickly!',
  ttsSingleIgnored = 'Single tap ignored! Tap twice!',
  ttsNumberTwo = 'Number 2! Now jump!',
  ttsNumberOther = "Don't jump!",
  ttsWrongNumber = 'Only jump on number 2!',
  ttsRhythmPrompt = 'Now tap the same tap-tap rhythm!',
  ttsRhythmFail = 'Try matching the beat!',
  ttsObstacleMiss = 'Jump over the rock with a double tap!',
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
  const [warnVisible, setWarnVisible] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [rhythmPhase, setRhythmPhase] = useState<'listen' | 'tap' | 'idle'>('idle');
  const [showObstacle, setShowObstacle] = useState(false);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const firstTapTimeRef = useRef<number | null>(null);
  const userTapsRef = useRef<number[]>([]);
  const canTapRhythmRef = useRef(false);
  const jumpCountNumRef = useRef<number | null>(null);
  const jumpCountTappedRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const objY = useSharedValue(P.jumpDownPct);
  const objScale = useSharedValue(1);
  const objPulse = useSharedValue(1);
  const obstacleX = useSharedValue(110);
  const numberOpacity = useSharedValue(0);
  const numberScale = useSharedValue(0.6);
  const beatScale = useSharedValue(1);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

  const objStyle = useAnimatedStyle(() => ({
    left: '50%',
    top: `${objY.value}%`,
    transform: [{ translateX: -48 }, { translateY: -48 }, { scale: objScale.value * objPulse.value }],
  }));

  const obstacleStyle = useAnimatedStyle(() => ({
    left: `${obstacleX.value}%`,
    top: `${P.jumpDownPct + 8}%`,
    transform: [{ translateX: -36 }, { translateY: -36 }],
  }));

  const numberStyle = useAnimatedStyle(() => ({
    opacity: numberOpacity.value,
    transform: [{ scale: numberScale.value }],
  }));

  const beatStyle = useAnimatedStyle(() => ({
    transform: [{ scale: beatScale.value }],
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
    }
    cancelAnimation(obstacleX);
    cancelAnimation(objY);
  }, [obstacleX, objY]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.rounds;
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
    [clearTimers, logType, router, skillTags, ttsComplete],
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

  const playJumpAnim = useCallback(() => {
    objY.value = withSequence(
      withTiming(P.jumpUpPct, { duration: 280 }),
      withTiming(P.jumpDownPct, { duration: 280 }),
    );
    objScale.value = withSequence(withTiming(1.28, { duration: 140 }), withTiming(1, { duration: 140 }));
  }, [objScale, objY]);

  const showWarn = useCallback(
    (msg: string) => {
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setWarnVisible(true);
      setTimeout(() => setWarnVisible(false), 800);
      speakTTS(msg, 0.78).catch(() => {});
    },
    [playWarn],
  );

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
    firstTapTimeRef.current = null;
    userTapsRef.current = [];
    canTapRhythmRef.current = false;
    jumpCountTappedRef.current = false;
    setCurrentNumber(null);
    setRhythmPhase('idle');
    setShowObstacle(false);
    objY.value = P.jumpDownPct;
    objScale.value = 1;
    obstacleX.value = 110;
    numberOpacity.value = 0;
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame, numberOpacity, objScale, objY, obstacleX]);

  const completeRound = useCallback(
    (withJump = true) => {
      if (roundCompleteRef.current || doneRef.current) return;
      roundCompleteRef.current = true;
      bumpScore();
      if (withJump) playJumpAnim();
      if (mode === 'obstacleJump') cancelAnimation(obstacleX);
      roundTimerRef.current = setTimeout(() => advanceRound(), 650);
    },
    [advanceRound, bumpScore, mode, obstacleX, playJumpAnim],
  );

  const failAndAdvance = useCallback(
    (msg: string, withJump = false) => {
      if (roundCompleteRef.current || doneRef.current) return;
      roundCompleteRef.current = true;
      showWarn(msg);
      if (withJump) playJumpAnim();
      if (mode === 'obstacleJump') cancelAnimation(obstacleX);
      roundTimerRef.current = setTimeout(() => advanceRound(), 700);
    },
    [advanceRound, mode, obstacleX, playJumpAnim, showWarn],
  );

  const resetDoubleTap = useCallback(() => {
    firstTapTimeRef.current = null;
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
    }
  }, []);

  const handleDoubleTapModes = useCallback(() => {
    const now = Date.now();
    const maxDelay = mode === 'doubleTapOnly' ? P.strictDoubleTapMaxMs : P.doubleTapMaxMs;

    if (firstTapTimeRef.current === null) {
      firstTapTimeRef.current = now;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      tapTimeoutRef.current = setTimeout(() => {
        resetDoubleTap();
        showWarn(mode === 'doubleTapOnly' ? ttsSingleIgnored : ttsDoubleTap);
      }, maxDelay);
      return;
    }

    const diff = now - firstTapTimeRef.current;
    resetDoubleTap();
    if (diff <= maxDelay) {
      completeRound(true);
    } else {
      showWarn(mode === 'doubleTapOnly' ? ttsSingleIgnored : ttsDoubleTap);
    }
  }, [completeRound, mode, resetDoubleTap, showWarn, ttsDoubleTap, ttsSingleIgnored]);

  const finishJumpCountRound = useCallback(
    (num: number, tapped: boolean) => {
      if (roundCompleteRef.current || doneRef.current) return;
      numberOpacity.value = withTiming(0, { duration: 200 });
      if (num === 2 && tapped) {
        completeRound(true);
      } else if (num === 2 && !tapped) {
        failAndAdvance('Jump when you see number 2!');
      } else if (num !== 2 && !tapped) {
        completeRound(false);
      } else {
        failAndAdvance(ttsWrongNumber);
      }
    },
    [completeRound, failAndAdvance, numberOpacity, ttsWrongNumber],
  );

  const showJumpCountNumber = useCallback(() => {
    const num = randomJumpNumber();
    jumpCountNumRef.current = num;
    jumpCountTappedRef.current = false;
    setCurrentNumber(num);
    numberOpacity.value = 0;
    numberScale.value = 0.6;
    numberOpacity.value = withTiming(1, { duration: 250 });
    numberScale.value = withSequence(withTiming(1.15, { duration: 180 }), withTiming(1, { duration: 120 }));
    speakTTS(num === 2 ? ttsNumberTwo : `${num}! ${ttsNumberOther}`, 0.78).catch(() => {});
    roundTimerRef.current = setTimeout(() => {
      finishJumpCountRound(num, jumpCountTappedRef.current);
    }, P.numberShowMs);
  }, [finishJumpCountRound, numberOpacity, numberScale, ttsNumberOther, ttsNumberTwo]);

  const pulseBeat = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    beatScale.value = withSequence(withTiming(1.45, { duration: 120 }), withTiming(1, { duration: 120 }));
  }, [beatScale]);

  const startRhythmRound = useCallback(() => {
    setRhythmPhase('listen');
    userTapsRef.current = [];
    canTapRhythmRef.current = false;
    setStatusHint('Listen to the beat…');
    pulseBeat();
    roundTimerRef.current = setTimeout(() => {
      pulseBeat();
      roundTimerRef.current = setTimeout(() => {
        setRhythmPhase('tap');
        canTapRhythmRef.current = true;
        setStatusHint('Your turn — tap tap!');
        speakTTS(ttsRhythmPrompt, 0.78).catch(() => {});
        roundTimerRef.current = setTimeout(() => {
          if (roundCompleteRef.current) return;
          canTapRhythmRef.current = false;
          const taps = userTapsRef.current;
          if (taps.length === 2 && rhythmMatches(taps, P.beatIntervalMs, P.rhythmToleranceMs)) {
            completeRound(true);
          } else {
            failAndAdvance(taps.length < 2 ? 'Tap twice!' : ttsRhythmFail);
          }
        }, P.rhythmTapWindowMs);
      }, 280);
    }, P.beatIntervalMs);
  }, [completeRound, failAndAdvance, pulseBeat, ttsRhythmFail, ttsRhythmPrompt]);

  const startObstacleRound = useCallback(() => {
    setShowObstacle(true);
    obstacleX.value = 110;
    obstacleX.value = withTiming(-12, { duration: P.obstacleCrossMs });
    roundTimerRef.current = setTimeout(() => {
      if (!roundCompleteRef.current && roundActiveRef.current) {
        failAndAdvance(ttsObstacleMiss);
      }
    }, P.obstacleCrossMs + 60);
  }, [failAndAdvance, obstacleX, ttsObstacleMiss]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    objY.value = P.jumpDownPct;
    objScale.value = 1;
    objPulse.value = withRepeat(
      withSequence(withTiming(1.06, { duration: 450 }), withTiming(1, { duration: 450 })),
      -1,
      true,
    );

    if (mode === 'frogJump') {
      setStatusHint('Tap twice to jump!');
      speakTTS(ttsDoubleTap, 0.78).catch(() => {});
      return;
    }
    if (mode === 'doubleTapOnly') {
      setStatusHint('Only double tap counts!');
      speakTTS(ttsSingleIgnored, 0.78).catch(() => {});
      return;
    }
    if (mode === 'jumpCount') {
      setStatusHint('Jump only on number 2!');
      roundTimerRef.current = setTimeout(() => showJumpCountNumber(), P.numberDelayMs);
      return;
    }
    if (mode === 'obstacleJump') {
      setStatusHint('Double tap to hop the rock!');
      speakTTS(ttsObstacleMiss, 0.78).catch(() => {});
      startObstacleRound();
      return;
    }
    if (mode === 'rhythmJump') {
      startRhythmRound();
    }
  }, [
    mode,
    objPulse,
    objScale,
    objY,
    showJumpCountNumber,
    startObstacleRound,
    startRhythmRound,
    ttsDoubleTap,
    ttsObstacleMiss,
    ttsSingleIgnored,
  ]);

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

  const handleTap = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;

    if (mode === 'jumpCount') {
      if (currentNumber === null || jumpCountTappedRef.current) return;
      jumpCountTappedRef.current = true;
      if (currentNumber === 2) {
        if (roundTimerRef.current) {
          clearTimeout(roundTimerRef.current);
          roundTimerRef.current = null;
        }
        completeRound(true);
      } else {
        if (roundTimerRef.current) {
          clearTimeout(roundTimerRef.current);
          roundTimerRef.current = null;
        }
        failAndAdvance(ttsWrongNumber, true);
      }
      return;
    }

    if (mode === 'rhythmJump') {
      if (!canTapRhythmRef.current) return;
      const now = Date.now();
      userTapsRef.current = [...userTapsRef.current, now];
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      if (userTapsRef.current.length >= 2) {
        canTapRhythmRef.current = false;
        if (roundTimerRef.current) {
          clearTimeout(roundTimerRef.current);
          roundTimerRef.current = null;
        }
        const taps = userTapsRef.current;
        if (rhythmMatches(taps, P.beatIntervalMs, P.rhythmToleranceMs)) {
          completeRound(true);
        } else {
          failAndAdvance(ttsRhythmFail);
        }
      }
      return;
    }

    if (mode === 'obstacleJump') {
      if (!showObstacle) return;
      handleDoubleTapModes();
      return;
    }

    handleDoubleTapModes();
  }, [
    completeRound,
    currentNumber,
    failAndAdvance,
    handleDoubleTapModes,
    mode,
    showObstacle,
    ttsRhythmFail,
    ttsWrongNumber,
  ]);

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
      </View>

      <Pressable
        style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
        onPress={handleTap}
      >
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

        {roundActive && mode === 'rhythmJump' && rhythmPhase === 'listen' && (
          <Animated.View style={[styles.beatCue, beatStyle]}>
            <Text style={styles.beatEmoji}>🥁</Text>
          </Animated.View>
        )}

        {roundActive && mode === 'jumpCount' && currentNumber !== null && (
          <Animated.View style={[styles.numberBadge, { borderColor: T.accent }, numberStyle]}>
            <Text style={[styles.numberText, { color: T.accentDark }]}>{currentNumber}</Text>
          </Animated.View>
        )}

        {roundActive && showObstacle && (
          <Animated.View style={[styles.obstacle, obstacleStyle]}>
            <Text style={styles.obstacleEmoji}>{T.obstacleEmoji ?? '🪨'}</Text>
          </Animated.View>
        )}

        {roundActive && (
          <Animated.View style={[styles.object, objStyle]}>
            <Text style={styles.objectEmoji}>{T.objectEmoji}</Text>
          </Animated.View>
        )}

        <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
      </Pressable>

      {warnVisible && (
        <View style={styles.warnPill}>
          <Text style={styles.warnText}>Try again!</Text>
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
  hint: { fontSize: 16, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  object: { position: 'absolute', width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  objectEmoji: { fontSize: 72 },
  obstacle: { position: 'absolute', width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  obstacleEmoji: { fontSize: 56 },
  numberBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '22%',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: { fontSize: 48, fontWeight: '900' },
  beatCue: { position: 'absolute', alignSelf: 'center', top: '28%' },
  beatEmoji: { fontSize: 72 },
  warnPill: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(254,226,226,0.92)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  warnText: { fontSize: 15, fontWeight: '800', color: '#B91C1C' },
});

export default JumpTapGame;
