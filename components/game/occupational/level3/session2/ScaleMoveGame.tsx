/**
 * Giant vs Tiny Kingdom — OT Level 3 Session 2 shared movement-scaling engine.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CreaturePinchView } from '@/components/game/occupational/level3/session2/components/CreaturePinchView';
import { RoadTraceView } from '@/components/game/occupational/level3/session2/components/RoadTraceView';
import { ScaleCueBadge } from '@/components/game/occupational/level3/session2/components/ScaleCueBadge';
import { SizeTapGrid } from '@/components/game/occupational/level3/session2/components/SizeTapGrid';
import { SwipeScalePanel } from '@/components/game/occupational/level3/session2/components/SwipeScalePanel';
import { ThrowRangeArena } from '@/components/game/occupational/level3/session2/components/ThrowRangeArena';
import {
  SESSION2_PACING,
  difficultyTier,
  pathConfigForRound,
  pinchTargets,
  throwTargetForRound,
  throwTargetMoves,
  swipeThresholds,
} from '@/components/game/occupational/level3/session2/session2Pacing';
import {
  ScaleMoveMode,
  ScaleTarget,
  TapObject,
  ThrowBasket,
  basketLabel,
  buildTapObjects,
  correctTapObject,
  pinchMatches,
  randomTarget,
  swipeMatches,
  throwMatches,
  throwVoiceCue,
  useTraceSound,
} from '@/components/game/occupational/level3/session2/scaleUtils';
import { useScaleAnalytics } from '@/components/game/occupational/level3/session2/useScaleAnalytics';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION2_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');
const VOICE_PRAISE = ['Fantastic!', 'Excellent!', "You're getting stronger!", 'Great control!'];

export type ScaleMoveTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  bigColor: string;
  smallColor: string;
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
  objectEmoji?: string;
  creatureEmoji?: string;
};

export type ScaleMoveGameConfig = {
  theme: ScaleMoveTheme;
  mode: ScaleMoveMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsBig: string;
  ttsSmall: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const ScaleMoveGame: React.FC<
  ScaleMoveGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsBig,
  ttsSmall,
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
  } = useScaleAnalytics(mode);

  const totalRounds =
    mode === 'tap'
      ? P.tapRounds
      : mode === 'swipe'
        ? P.swipeRounds
        : mode === 'pinch'
          ? P.pinchRounds
          : mode === 'throw'
            ? P.throwRounds
            : P.pathRounds;

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
  const [cueSuccess, setCueSuccess] = useState<boolean | undefined>(undefined);

  const [target, setTarget] = useState<ScaleTarget>('big');
  const [showCue, setShowCue] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [tapObjects, setTapObjects] = useState<TapObject[]>([]);
  const [bigBarProgress, setBigBarProgress] = useState(0);
  const [smallBarProgress, setSmallBarProgress] = useState(0);
  const [swipeTrail, setSwipeTrail] = useState<{ x: number; y: number; big: boolean }[]>([]);
  const [pinchCelebrate, setPinchCelebrate] = useState(false);
  const [throwBasket, setThrowBasket] = useState<ThrowBasket>('near');
  const [throwMoving, setThrowMoving] = useState(false);
  const [pathNarrow, setPathNarrow] = useState(false);
  const [pathCurved, setPathCurved] = useState(false);
  const [pathStroke, setPathStroke] = useState(P.widePathStroke);
  const [pathTolerance, setPathTolerance] = useState(P.pathToleranceBase);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const targetRef = useRef<ScaleTarget>('big');
  const isActiveRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeX = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    targetRef.current = target;
  }, [target]);
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const clearRoundTimer = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
  }, []);

  const shakePlay = useCallback(() => {
    shakeX.value = withSequence(
      withSpring(8, { damping: 4 }),
      withSpring(-8, { damping: 4 }),
      withSpring(0),
    );
  }, [shakeX]);

  const praiseVoice = useCallback(() => {
    const msg = VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!;
    speakTTS(msg, 0.78).catch(() => {});
  }, []);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = totalRounds;
      const snap = analyticsSnapshot();
      const xp = Math.round(finalScore * (mode === 'path' ? 20 : 18) + snap.movementScaleAccuracy * 0.15);
      setFinalStats({ correct: finalScore, total, xp, analytics: snap });
      setDone(true);
      doneRef.current = true;
      clearRoundTimer();
      setShowCongratulations(true);
      speakTTS(ttsComplete, 0.78);
      recordGame(xp)
        .then(() =>
          logGameAndAward({
            type: logType as any,
            correct: finalScore,
            total,
            accuracy: snap.movementScaleAccuracy,
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
    [analyticsMeta, analyticsSnapshot, clearRoundTimer, logType, mode, router, skillTags, totalRounds, ttsComplete],
  );

  const bumpScore = useCallback(() => {
    setSparkleKey(Date.now());
    setCoins((c) => c + 5);
    setCueSuccess(true);
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    praiseVoice();
    setScore((s) => {
      const next = s + 1;
      scoreRef.current = next;
      return next;
    });
    setTimeout(() => setCueSuccess(undefined), 700);
  }, [playSuccess, praiseVoice]);

  const failAttempt = useCallback(() => {
    recordError();
    playWarn();
    shakePlay();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    setCueSuccess(false);
    setWarnVisible(true);
    setTimeout(() => {
      setWarnVisible(false);
      setCueSuccess(undefined);
    }, 850);
  }, [playWarn, recordError, shakePlay]);

  const advanceRound = useCallback(() => {
    clearRoundTimer();
    setIsActive(false);
    setShowCue(false);
    setBigBarProgress(0);
    setSmallBarProgress(0);
    setSwipeTrail([]);
    setPinchCelebrate(false);

    if (roundRef.current >= totalRounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearRoundTimer, endGame, totalRounds]);

  const finishAttempt = useCallback(
    (correct: boolean, onSuccess?: () => void) => {
      if (correct) {
        onSuccess?.();
        bumpScore();
      } else {
        failAttempt();
      }
      setIsActive(false);
      setShowCue(false);
      roundTimerRef.current = setTimeout(() => advanceRound(), correct ? 650 : P.nextRoundDelayMs);
    },
    [advanceRound, bumpScore, failAttempt],
  );

  const setupRound = useCallback(() => {
    if (doneRef.current) return;
    clearRoundTimer();
    startAnalyticsRound();
    setCueSuccess(undefined);

    if (mode === 'path') {
      const cfg = pathConfigForRound(roundRef.current);
      setPathNarrow(cfg.narrow);
      setPathCurved(cfg.curved);
      setPathStroke(cfg.stroke);
      setPathTolerance(cfg.tolerance);
      setIsActive(true);
      setShowCue(true);
      speakTTS(cfg.narrow ? 'Trace the narrow road!' : 'Trace the wide road!', 0.78).catch(() => {});
      return;
    }

    if (mode === 'throw') {
      const basket = throwTargetForRound(roundRef.current);
      setThrowBasket(basket);
      setThrowMoving(throwTargetMoves(roundRef.current));
      setTarget(basket === 'near' ? 'small' : basket === 'far' ? 'big' : 'big');
      setShowCue(true);
      setIsActive(true);
      speakTTS(throwVoiceCue(basket), 0.78).catch(() => {});
      return;
    }

    const nextTarget = randomTarget();
    setTarget(nextTarget);

    if (mode === 'tap') {
      const objs = buildTapObjects(roundRef.current, totalRounds);
      setTapObjects([...objs].sort(() => Math.random() - 0.5));
      setShowCue(false);
      setIsActive(false);
      roundTimerRef.current = setTimeout(() => {
        setShowCue(true);
        setIsActive(true);
        speakTTS(nextTarget === 'big' ? ttsBig : ttsSmall, 0.78).catch(() => {});
      }, P.cueDelayMs);
      return;
    }

    setShowCue(false);
    setBigBarProgress(0);
    setSmallBarProgress(0);
    setSwipeTrail([]);
    setIsActive(mode !== 'pinch');

    roundTimerRef.current = setTimeout(() => {
      setShowCue(true);
      setIsActive(true);
      if (mode === 'pinch') {
        speakTTS(nextTarget === 'big' ? 'Make the dragon BIG!' : 'Make the dragon SMALL!', 0.78).catch(() => {});
      } else {
        speakTTS(nextTarget === 'big' ? ttsBig : ttsSmall, 0.78).catch(() => {});
      }
    }, mode === 'pinch' ? 0 : 120);
  }, [clearRoundTimer, mode, startAnalyticsRound, totalRounds, ttsBig, ttsSmall]);

  useEffect(() => {
    resetAnalytics();
  }, [resetAnalytics]);

  useEffect(() => {
    if (round === 1 && !doneRef.current) speakTTS(ttsIntro, 0.78);
    setupRound();
    return clearRoundTimer;
  }, [round, setupRound, ttsIntro, clearRoundTimer]);

  useEffect(
    () => () => {
      stopAllSpeech();
      cleanupSounds();
      clearRoundTimer();
    },
    [clearRoundTimer],
  );

  const handleTapChoice = useCallback(
    (id: string) => {
      if (!showCue || doneRef.current) return;
      const correctObj = correctTapObject(tapObjects, targetRef.current);
      const ok = correctObj.id === id;
      if (ok) recordSuccess();
      finishAttempt(ok);
    },
    [finishAttempt, recordSuccess, showCue, tapObjects],
  );

  const tier = difficultyTier(round, totalRounds);
  const pinchTarget = pinchTargets(tier);
  const { big: bigSwipe } = swipeThresholds(tier);

  const handleSwipeStart = useCallback((x: number, y: number) => {
    setSwipeTrail([{ x, y, big: targetRef.current === 'big' }]);
  }, []);

  const handleSwipeMove = useCallback(
    (x: number, y: number, dist: number) => {
      setBigBarProgress(Math.min(100, (dist / bigSwipe) * 100));
      setSmallBarProgress(Math.min(100, (dist / (bigSwipe * 0.5)) * 100));
      setSwipeTrail((t) => [...t.slice(-24), { x, y, big: dist > bigSwipe * 0.55 }]);
    },
    [bigSwipe],
  );

  const handleSwipeEnd = useCallback(
    (dist: number) => {
      const { ok, score: swipeScore } = swipeMatches(dist, targetRef.current, tier);
      if (ok) recordSuccess({ swipeScore });
      finishAttempt(ok);
    },
    [finishAttempt, recordSuccess, tier],
  );

  const handlePinchEnd = useCallback(
    (scale: number) => {
      const { ok, score: pinchScore } = pinchMatches(scale, targetRef.current, tier);
      if (ok) {
        setPinchCelebrate(true);
        if (targetRef.current === 'big') recordSuccess({ stretchScore: pinchScore });
        else recordSuccess({ pinchScore });
      }
      finishAttempt(ok);
    },
    [finishAttempt, recordSuccess, tier],
  );

  const handleThrowEnd = useCallback(
    (dist: number) => {
      const { ok, score: throwScore } = throwMatches(dist, throwBasket, tier);
      if (ok) recordSuccess({ throwScore });
      finishAttempt(ok);
    },
    [finishAttempt, recordSuccess, throwBasket, tier],
  );

  const handlePathComplete = useCallback(
    (accuracy: number, smoothness: number) => {
      recordSuccess({ traceAcc: accuracy, traceSmooth: smoothness });
      bumpScore();
      setIsActive(false);
      roundTimerRef.current = setTimeout(() => advanceRound(), P.nextRoundDelayMs);
    },
    [advanceRound, bumpScore, recordSuccess],
  );

  const handlePathExit = useCallback(() => {
    failAttempt();
  }, [failAttempt]);

  if (showCongratulations && done && finalStats) {
    const a = finalStats.analytics;
    return (
      <CongratulationsScreen
        message={`${congratsMessage}\n🏰 Giant Kingdom Restored!\n🎯 Accuracy ${a.movementScaleAccuracy}% · ⚡ ${a.avgReactionMs}ms`}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        accuracy={a.movementScaleAccuracy}
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

  const pathCue = pathNarrow ? 'narrow' : 'wide';

  const renderPlayArea = () => {
    if (mode === 'tap') {
      return (
        <SizeTapGrid
          objects={tapObjects}
          showCue={showCue}
          highlightTarget={showCue ? target : null}
          bigColor={T.bigColor}
          smallColor={T.smallColor}
          onPick={handleTapChoice}
          disabled={!isActive}
        />
      );
    }
    if (mode === 'swipe') {
      return (
        <SwipeScalePanel
          target={target}
          bigProgress={bigBarProgress}
          smallProgress={smallBarProgress}
          trail={swipeTrail}
          accent={T.accent}
          accentDark={T.accentDark}
          titleColor={T.titleColor}
          active={isActive && showCue}
          onSwipeStart={handleSwipeStart}
          onSwipeMove={handleSwipeMove}
          onSwipeEnd={handleSwipeEnd}
        />
      );
    }
    if (mode === 'pinch') {
      return (
        <CreaturePinchView
          emoji={T.objectEmoji ?? T.creatureEmoji ?? '🐉'}
          target={target}
          targetBig={pinchTarget.big}
          targetSmall={pinchTarget.small}
          minScale={P.minScale}
          maxScale={P.maxScale}
          baseSize={P.creatureSize}
          bigColor={T.bigColor}
          active={isActive && showCue}
          celebrate={pinchCelebrate}
          onScaleEnd={handlePinchEnd}
        />
      );
    }
    if (mode === 'throw') {
      return (
        <ThrowRangeArena
          targetBasket={throwBasket}
          ballEmoji={T.objectEmoji ?? '⚾'}
          accent={T.accent}
          smallColor={T.smallColor}
          moving={throwMoving}
          active={isActive && showCue}
          onThrowEnd={handleThrowEnd}
          onLayout={() => {}}
        />
      );
    }
    return (
      <RoadTraceView
        curved={pathCurved}
        narrow={pathNarrow}
        stroke={pathStroke}
        tolerance={pathTolerance}
        accent={T.accent}
        active={isActive}
        onProgress={() => {}}
        onComplete={handlePathComplete}
        onExit={handlePathExit}
        onLayout={() => {}}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity
        onPress={() => {
          stopAllSpeech();
          cleanupSounds();
          clearRoundTimer();
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
          <View style={[styles.statPill, styles.coinPill, { borderColor: T.statBorder }]}>
            <Text style={styles.coinEmoji}>🪙</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>{coins}</Text>
          </View>
        </View>
        {showCue && mode === 'path' && (
          <ScaleCueBadge visible target={pathCue as 'wide' | 'narrow'} success={cueSuccess} />
        )}
        {showCue && mode !== 'path' && mode !== 'throw' && (
          <ScaleCueBadge visible target={target} success={cueSuccess} />
        )}
        {showCue && mode === 'throw' && (
          <View style={[styles.throwCue, { borderColor: T.accent }]}>
            <Text style={[styles.throwCueText, { color: T.accentDark }]}>{basketLabel(throwBasket)}</Text>
          </View>
        )}
        {!showCue && mode === 'tap' && (
          <Text style={[styles.hint, { color: T.subtitleColor }]}>{T.hintText}</Text>
        )}
      </View>

      <Animated.View style={[styles.playArea, shakeStyle, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        {renderPlayArea()}
        <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
      </Animated.View>

      {warnVisible && (
        <View style={styles.warnPill}>
          <Text style={styles.warnText}>Try again — match the size!</Text>
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
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: 24,
    borderWidth: 1,
  },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 26, fontWeight: '900', textAlign: 'center' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 13, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap', justifyContent: 'center' },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  starPill: { backgroundColor: 'rgba(251,191,36,0.22)' },
  coinPill: { backgroundColor: 'rgba(245,158,11,0.18)' },
  statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '900' },
  starIcon: { width: 16, height: 16, resizeMode: 'contain' },
  coinEmoji: { fontSize: 14 },
  playArea: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    overflow: 'hidden',
  },
  warnPill: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(254,226,226,0.92)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  warnText: { fontSize: 13, fontWeight: '700', color: '#B91C1C' },
  throwCue: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
  },
  throwCueText: { fontSize: 28, fontWeight: '900', letterSpacing: 1 },
});

export default ScaleMoveGame;
