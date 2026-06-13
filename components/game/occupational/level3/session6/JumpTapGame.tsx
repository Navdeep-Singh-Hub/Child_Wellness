/**
 * Leap Lily Pad Kingdom — OT Level 3 Session 6 jump imitation engine.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { DoubleTapBadge } from '@/components/game/occupational/level3/session6/components/DoubleTapBadge';
import { JumpCountBadge } from '@/components/game/occupational/level3/session6/components/JumpCountBadge';
import { LilyPadTrack } from '@/components/game/occupational/level3/session6/components/LilyPadTrack';
import { RhythmBeatCue } from '@/components/game/occupational/level3/session6/components/RhythmBeatCue';
import {
  randomJumpNumber,
  rhythmMatches,
  scoreDoubleTap,
  useTraceSound,
} from '@/components/game/occupational/level3/session6/jumpUtils';
import {
  SESSION6_PACING,
  beatIntervalMs,
  difficultyTier,
  doubleTapMaxMs,
  numberShowMs,
  obstacleCrossMs,
  rhythmBeatCount,
  rhythmTapWindowMs,
  rhythmToleranceMs,
} from '@/components/game/occupational/level3/session6/session6Pacing';
import { useJumpAnalytics } from '@/components/game/occupational/level3/session6/useJumpAnalytics';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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
const VOICE_PRAISE = ['Great Jump!', 'Perfect Hop!', 'Awesome Timing!', 'You Got It!'];

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
  const {
    reset: resetAnalytics,
    startRound: startAnalyticsRound,
    recordSuccess,
    recordError,
    snapshot: analyticsSnapshot,
    metaPayload: analyticsMeta,
  } = useJumpAnalytics();

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{
    correct: number;
    total: number;
    xp: number;
    analytics: ReturnType<typeof analyticsSnapshot>;
  } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [warnVisible, setWarnVisible] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [rhythmPhase, setRhythmPhase] = useState<'listen' | 'tap' | 'idle'>('idle');
  const [rhythmBeatIdx, setRhythmBeatIdx] = useState(0);
  const [rhythmBeatsTotal, setRhythmBeatsTotal] = useState(2);
  const [showObstacle, setShowObstacle] = useState(false);
  const [cueSuccess, setCueSuccess] = useState<boolean | undefined>(undefined);

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
  const rhythmBeatsRef = useRef(2);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const objY = useSharedValue(P.jumpDownPct);
  const objScale = useSharedValue(1);
  const objPulse = useSharedValue(1);
  const obstacleX = useSharedValue(110);
  const beatScale = useSharedValue(1);

  const tier = difficultyTier(round, P.rounds);

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

  const praiseVoice = useCallback(() => {
    speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.78).catch(() => {});
  }, []);

  const endGame = useCallback(
    (finalScore: number) => {
      const snap = analyticsSnapshot();
      const xp = Math.round(finalScore * 16 + snap.jumpMasteryScore * 0.18);
      setFinalStats({ correct: finalScore, total: P.rounds, xp, analytics: snap });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      setShowCongratulations(true);
      speakTTS(ttsComplete, 0.78);
      recordGame(xp)
        .then(() =>
          logGameAndAward({
            type: logType as any,
            correct: finalScore,
            total: P.rounds,
            accuracy: snap.jumpMasteryScore,
            xpAwarded: xp,
            durationMs: snap.durationMs,
            responseTimeMs: snap.avgReactionMs,
            skillTags,
            meta: analyticsMeta(),
          }),
        )
        .then(() => router.setParams({ refreshStats: Date.now().toString() }))
        .catch(console.error);
    },
    [analyticsMeta, analyticsSnapshot, clearTimers, logType, router, skillTags, ttsComplete],
  );

  const bumpScore = useCallback(
    (opts?: {
      doubleTapScore?: number;
      inhibition?: number;
      rhythm?: number;
      sequencing?: number;
      motor?: number;
    }) => {
      setSparkleKey(Date.now());
      setCoins((c) => c + 5);
      setCueSuccess(true);
      recordSuccess(opts);
      playSuccess();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      praiseVoice();
      setScore((s) => {
        scoreRef.current = s + 1;
        return s + 1;
      });
      setTimeout(() => setCueSuccess(undefined), 650);
    },
    [playSuccess, praiseVoice, recordSuccess],
  );

  const playJumpAnim = useCallback(() => {
    objY.value = withSequence(
      withTiming(P.jumpUpPct, { duration: 260 }),
      withTiming(P.jumpDownPct, { duration: 260 }),
    );
    objScale.value = withSequence(withTiming(1.3, { duration: 130 }), withTiming(1, { duration: 130 }));
  }, [objScale, objY]);

  const showWarn = useCallback(
    (msg: string, inhibitionFail = false) => {
      recordError({ inhibitionFail });
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setCueSuccess(false);
      setWarnVisible(true);
      setTimeout(() => {
        setWarnVisible(false);
        setCueSuccess(undefined);
      }, 800);
      speakTTS(msg, 0.78).catch(() => {});
    },
    [playWarn, recordError],
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
    setRhythmBeatIdx(0);
    setShowObstacle(false);
    objY.value = P.jumpDownPct;
    objScale.value = 1;
    obstacleX.value = 110;
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame, objScale, objY, obstacleX]);

  const completeRound = useCallback(
    (
      withJump = true,
      opts?: {
        doubleTapScore?: number;
        inhibition?: number;
        rhythm?: number;
        sequencing?: number;
        motor?: number;
      },
    ) => {
      if (roundCompleteRef.current || doneRef.current) return;
      roundCompleteRef.current = true;
      bumpScore(opts);
      if (withJump) playJumpAnim();
      if (mode === 'obstacleJump') cancelAnimation(obstacleX);
      roundTimerRef.current = setTimeout(() => advanceRound(), 640);
    },
    [advanceRound, bumpScore, mode, obstacleX, playJumpAnim],
  );

  const failAndAdvance = useCallback(
    (msg: string, opts?: { withJump?: boolean; inhibitionFail?: boolean }) => {
      if (roundCompleteRef.current || doneRef.current) return;
      roundCompleteRef.current = true;
      showWarn(msg, opts?.inhibitionFail);
      if (opts?.withJump) playJumpAnim();
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
    const strict = mode === 'doubleTapOnly';
    const maxDelay = doubleTapMaxMs(tier, strict);

    if (firstTapTimeRef.current === null) {
      firstTapTimeRef.current = now;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      tapTimeoutRef.current = setTimeout(() => {
        resetDoubleTap();
        showWarn(strict ? ttsSingleIgnored : ttsDoubleTap);
      }, maxDelay);
      return;
    }

    const diff = now - firstTapTimeRef.current;
    resetDoubleTap();
    const { ok, score: tapScore } = scoreDoubleTap(diff, maxDelay);
    if (ok) {
      const motor = mode === 'obstacleJump' ? tapScore : undefined;
      const sequencing = mode === 'frogJump' || mode === 'doubleTapOnly' ? tapScore : undefined;
      completeRound(true, { doubleTapScore: tapScore, motor, sequencing });
    } else {
      showWarn(strict ? ttsSingleIgnored : ttsDoubleTap);
    }
  }, [completeRound, mode, resetDoubleTap, showWarn, tier, ttsDoubleTap, ttsSingleIgnored]);

  const finishJumpCountRound = useCallback(
    (num: number, tapped: boolean) => {
      if (roundCompleteRef.current || doneRef.current) return;
      setCurrentNumber(null);
      if (num === 2 && tapped) {
        completeRound(true, { inhibition: 100, sequencing: 90 });
      } else if (num === 2 && !tapped) {
        failAndAdvance('Jump when you see number 2!');
      } else if (num !== 2 && !tapped) {
        completeRound(false, { inhibition: 100 });
      } else {
        failAndAdvance(ttsWrongNumber, { withJump: true, inhibitionFail: true });
      }
    },
    [completeRound, failAndAdvance, ttsWrongNumber],
  );

  const showJumpCountNumber = useCallback(() => {
    const num = randomJumpNumber(tier);
    jumpCountNumRef.current = num;
    jumpCountTappedRef.current = false;
    setCurrentNumber(num);
    speakTTS(num === 2 ? ttsNumberTwo : `${num}! ${ttsNumberOther}`, 0.78).catch(() => {});
    roundTimerRef.current = setTimeout(() => {
      finishJumpCountRound(num, jumpCountTappedRef.current);
    }, numberShowMs(tier));
  }, [finishJumpCountRound, tier, ttsNumberOther, ttsNumberTwo]);

  const pulseBeat = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    beatScale.value = withSequence(withTiming(1.5, { duration: 110 }), withTiming(1, { duration: 110 }));
  }, [beatScale]);

  const scheduleRhythmBeats = useCallback(
    (beatIdx: number, beatCount: number, interval: number) => {
      if (beatIdx >= beatCount) {
        setRhythmPhase('tap');
        canTapRhythmRef.current = true;
        setStatusHint('Your turn — copy the beat!');
        speakTTS(ttsRhythmPrompt, 0.78).catch(() => {});
        roundTimerRef.current = setTimeout(() => {
          if (roundCompleteRef.current) return;
          canTapRhythmRef.current = false;
          const taps = userTapsRef.current;
          const tol = rhythmToleranceMs(tier);
          if (rhythmMatches(taps, interval, tol, beatCount)) {
            const rhythmScore = Math.max(70, 100 - Math.abs(taps.length - beatCount) * 15);
            completeRound(true, { rhythm: rhythmScore, sequencing: rhythmScore });
          } else {
            failAndAdvance(taps.length < beatCount ? 'Tap the full rhythm!' : ttsRhythmFail);
          }
        }, rhythmTapWindowMs(tier));
        return;
      }
      setRhythmBeatIdx(beatIdx + 1);
      pulseBeat();
      roundTimerRef.current = setTimeout(
        () => scheduleRhythmBeats(beatIdx + 1, beatCount, interval),
        beatIdx === 0 ? 400 : interval,
      );
    },
    [completeRound, failAndAdvance, pulseBeat, tier, ttsRhythmFail, ttsRhythmPrompt],
  );

  const startRhythmRound = useCallback(() => {
    const beatCount = rhythmBeatCount(tier);
    const interval = beatIntervalMs(tier);
    rhythmBeatsRef.current = beatCount;
    setRhythmBeatsTotal(beatCount);
    setRhythmPhase('listen');
    setRhythmBeatIdx(0);
    userTapsRef.current = [];
    canTapRhythmRef.current = false;
    setStatusHint('Listen to the beat…');
    scheduleRhythmBeats(0, beatCount, interval);
  }, [scheduleRhythmBeats, tier]);

  const startObstacleRound = useCallback(() => {
    setShowObstacle(true);
    obstacleX.value = 110;
    const crossMs = obstacleCrossMs(tier);
    obstacleX.value = withTiming(-12, { duration: crossMs });
    roundTimerRef.current = setTimeout(() => {
      if (!roundCompleteRef.current && roundActiveRef.current) {
        failAndAdvance(ttsObstacleMiss);
      }
    }, crossMs + 80);
  }, [failAndAdvance, obstacleX, tier, ttsObstacleMiss]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    startAnalyticsRound();
    roundCompleteRef.current = false;
    setRoundActive(true);
    objY.value = P.jumpDownPct;
    objScale.value = 1;
    objPulse.value = withRepeat(
      withSequence(withTiming(1.06, { duration: 440 }), withTiming(1, { duration: 440 })),
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
    startAnalyticsRound,
    startObstacleRound,
    startRhythmRound,
    ttsDoubleTap,
    ttsObstacleMiss,
    ttsSingleIgnored,
  ]);

  useEffect(() => {
    if (round === 1) {
      resetAnalytics();
      speakTTS(ttsIntro, 0.78);
    }
    clearTimers();
    setRoundActive(false);
    roundTimerRef.current = setTimeout(() => startRoundPlay(), P.roundStartDelayMs);
    return clearTimers;
  }, [round, startRoundPlay, ttsIntro, clearTimers, resetAnalytics]);

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
      if (roundTimerRef.current) {
        clearTimeout(roundTimerRef.current);
        roundTimerRef.current = null;
      }
      if (currentNumber === 2) {
        completeRound(true, { inhibition: 100, sequencing: 95 });
      } else {
        failAndAdvance(ttsWrongNumber, { withJump: true, inhibitionFail: true });
      }
      return;
    }

    if (mode === 'rhythmJump') {
      if (!canTapRhythmRef.current) return;
      const now = Date.now();
      userTapsRef.current = [...userTapsRef.current, now];
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const beatCount = rhythmBeatsRef.current;
      if (userTapsRef.current.length >= beatCount) {
        canTapRhythmRef.current = false;
        if (roundTimerRef.current) {
          clearTimeout(roundTimerRef.current);
          roundTimerRef.current = null;
        }
        const taps = userTapsRef.current;
        const interval = beatIntervalMs(tier);
        const tol = rhythmToleranceMs(tier);
        if (rhythmMatches(taps, interval, tol, beatCount)) {
          const rhythmScore = 95;
          completeRound(true, { rhythm: rhythmScore, sequencing: rhythmScore });
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
    tier,
    ttsRhythmFail,
    ttsWrongNumber,
  ]);

  const showDoubleBadge =
    roundActive && (mode === 'frogJump' || mode === 'doubleTapOnly' || mode === 'obstacleJump');

  if (showCongratulations && done && finalStats) {
    const a = finalStats.analytics;
    return (
      <CongratulationsScreen
        message={`${congratsMessage}\n🪷 Lily Pad Festival!\n👆👆 ${a.doubleTapAccuracy}% · 🎯 ${a.jumpMasteryScore}%`}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        accuracy={a.jumpMasteryScore}
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
  if (done) return null;

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
          <View style={[styles.statPill, styles.coinPill, { borderColor: T.statBorder }]}>
            <Text>🪙</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>{coins}</Text>
          </View>
        </View>
        {showDoubleBadge && <DoubleTapBadge visible success={cueSuccess} label={T.hintText} />}
        {roundActive && statusHint && mode !== 'jumpCount' ? (
          <Text style={[styles.hint, { color: T.accentDark }]}>{statusHint}</Text>
        ) : null}
      </View>

      <Pressable
        style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
        onPress={handleTap}
      >
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

        <LilyPadTrack
          obstacleX={obstacleX}
          showObstacle={showObstacle && mode === 'obstacleJump'}
          obstacleEmoji={T.obstacleEmoji ?? '🪨'}
          lilyY={P.lilyPadY}
        />

        {roundActive && mode === 'rhythmJump' && (
          <RhythmBeatCue
            visible
            phase={rhythmPhase}
            beatScale={beatScale}
            beatCount={rhythmBeatsTotal}
            currentBeat={rhythmBeatIdx}
          />
        )}

        {roundActive && mode === 'jumpCount' && (
          <JumpCountBadge number={currentNumber} visible={currentNumber !== null} success={cueSuccess} />
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
  backInner: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 24,
    borderWidth: 1,
  },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 16, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  coinPill: { backgroundColor: 'rgba(245,158,11,0.15)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  object: { position: 'absolute', width: 96, height: 96, alignItems: 'center', justifyContent: 'center', zIndex: 6 },
  objectEmoji: { fontSize: 72 },
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
