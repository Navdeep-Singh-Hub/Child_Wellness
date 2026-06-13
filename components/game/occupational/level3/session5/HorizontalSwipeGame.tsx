/**
 * Adventure Road Kingdom — OT Level 3 Session 5 left-right swipe engine.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { HorizontalBadge } from '@/components/game/occupational/level3/session5/components/HorizontalBadge';
import { MirrorOverlay } from '@/components/game/occupational/level3/session5/components/MirrorOverlay';
import { RoadBendCue } from '@/components/game/occupational/level3/session5/components/RoadBendCue';
import {
  SESSION5_PACING,
  arrowSequenceLength,
  ballFallMs,
  difficultyTier,
  multiBallRound,
  swipeThreshold,
  useMirrorRound,
} from '@/components/game/occupational/level3/session5/session5Pacing';
import {
  HorizontalDir,
  buildArrowSequence,
  dirArrow,
  oppositeDir,
  randomAnimal,
  randomHorizontalDir,
  swipeMatchesDir,
  swipeToDir,
  useTraceSound,
} from '@/components/game/occupational/level3/session5/horizontalUtils';
import { useHorizontalAnalytics } from '@/components/game/occupational/level3/session5/useHorizontalAnalytics';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION5_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');
const VOICE_PRAISE = ['Great Turn!', 'Perfect Direction!', 'Awesome Driving!', 'You Got It!'];

export type HorizontalSwipeMode = 'carTurn' | 'arrowMatch' | 'animalRun' | 'mirrorSwipe' | 'catchBall';

export type HorizontalSwipeTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  objectEmoji: string;
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

export type HorizontalSwipeGameConfig = {
  theme: HorizontalSwipeTheme;
  mode: HorizontalSwipeMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsLeft: string;
  ttsRight: string;
  ttsMirror?: string;
  ttsWrongLeft?: string;
  ttsWrongRight?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const HorizontalSwipeGame: React.FC<
  HorizontalSwipeGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsLeft,
  ttsRight,
  ttsMirror = 'Mirror mode! Swipe left or right!',
  ttsWrongLeft = 'Try swiping left!',
  ttsWrongRight = 'Try swiping right!',
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
    recordDirectionError,
    snapshot: analyticsSnapshot,
    metaPayload: analyticsMeta,
  } = useHorizontalAnalytics();

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
  const [targetDir, setTargetDir] = useState<HorizontalDir>('left');
  const [statusHint, setStatusHint] = useState('');
  const [animalEmoji, setAnimalEmoji] = useState('🐕');
  const [animalName, setAnimalName] = useState('Dash');
  const [ballFrom, setBallFrom] = useState<HorizontalDir>('left');
  const [sequence, setSequence] = useState<HorizontalDir[]>(['left']);
  const [seqStep, setSeqStep] = useState(0);
  const [mirrorActive, setMirrorActive] = useState(true);
  const [cueSuccess, setCueSuccess] = useState<boolean | undefined>(undefined);
  const [multiBall, setMultiBall] = useState(false);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const targetDirRef = useRef<HorizontalDir>('left');
  const ballFromRef = useRef<HorizontalDir>('left');
  const sequenceRef = useRef<HorizontalDir[]>(['left']);
  const seqStepRef = useRef(0);
  const mirrorActiveRef = useRef(true);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);

  const objX = useSharedValue(P.objectCenterPct);
  const objY = useSharedValue(45);
  const objScale = useSharedValue(1);
  const objRotate = useSharedValue(0);
  const cuePulse = useSharedValue(1);
  const ballOpacity = useSharedValue(1);
  const ball2Opacity = useSharedValue(1);
  const shakeX = useSharedValue(0);

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
  useEffect(() => {
    targetDirRef.current = targetDir;
  }, [targetDir]);
  useEffect(() => {
    ballFromRef.current = ballFrom;
  }, [ballFrom]);
  useEffect(() => {
    sequenceRef.current = sequence;
  }, [sequence]);
  useEffect(() => {
    seqStepRef.current = seqStep;
  }, [seqStep]);
  useEffect(() => {
    mirrorActiveRef.current = mirrorActive;
  }, [mirrorActive]);

  const objStyle = useAnimatedStyle(() => ({
    left: `${objX.value}%`,
    top: `${objY.value}%`,
    opacity: ballOpacity.value,
    transform: [
      { translateX: -48 },
      { translateY: -48 },
      { rotate: `${objRotate.value}deg` },
      { scale: objScale.value },
    ],
  }));

  const ball2Style = useAnimatedStyle(() => ({
    left: `${ballFromRef.current === 'left' ? P.objectRightPct : P.objectLeftPct}%`,
    top: `${objY.value}%`,
    opacity: ball2Opacity.value,
    transform: [{ translateX: -36 }, { translateY: -36 }],
  }));

  const cueStyle = useAnimatedStyle(() => ({ transform: [{ scale: cuePulse.value }] }));
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    cancelAnimation(objY);
  }, [objY]);

  const praiseVoice = useCallback(() => {
    speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.78).catch(() => {});
  }, []);

  const endGame = useCallback(
    (finalScore: number) => {
      const snap = analyticsSnapshot();
      const xp = Math.round(finalScore * 18 + snap.spatialAwarenessScore * 0.15);
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
            accuracy: snap.spatialAwarenessScore,
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
    (opts: { dir: HorizontalDir; score: number; mirror?: boolean; tracking?: number }) => {
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

  const failAttempt = useCallback(
    (need: HorizontalDir) => {
      recordDirectionError();
      playWarn();
      shakeX.value = withSequence(withTiming(10, { duration: 60 }), withTiming(-10, { duration: 60 }), withTiming(0));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setCueSuccess(false);
      setWarnVisible(true);
      setTimeout(() => {
        setWarnVisible(false);
        setCueSuccess(undefined);
      }, 800);
      speakTTS(need === 'left' ? ttsWrongLeft : ttsWrongRight, 0.78).catch(() => {});
      objX.value = withTiming(P.objectCenterPct, { duration: 250 });
      objRotate.value = withTiming(0, { duration: 200 });
    },
    [objRotate, objX, playWarn, recordDirectionError, shakeX, ttsWrongLeft, ttsWrongRight],
  );

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
    ballOpacity.value = 1;
    ball2Opacity.value = 1;
    objX.value = P.objectCenterPct;
    objY.value = mode === 'catchBall' ? P.ballTopPct : 45;
    objRotate.value = 0;
    setSeqStep(0);
    seqStepRef.current = 0;
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame, mode, ballOpacity, ball2Opacity, objRotate, objX, objY]);

  const completeRound = useCallback(
    (animDir: HorizontalDir, swipeScore: number, opts?: { mirror?: boolean; tracking?: number }) => {
      if (roundCompleteRef.current || doneRef.current) return;
      roundCompleteRef.current = true;
      bumpScore({ dir: animDir, score: swipeScore, mirror: opts?.mirror, tracking: opts?.tracking });
      const dest = animDir === 'left' ? P.objectLeftPct : P.objectRightPct;
      objX.value = withTiming(dest, { duration: 420 });
      objRotate.value = withSequence(
        withTiming(animDir === 'left' ? -16 : 16, { duration: 180 }),
        withTiming(0, { duration: 180 }),
      );
      objScale.value = withSequence(withTiming(1.12, { duration: 140 }), withTiming(1, { duration: 140 }));
      if (mode === 'catchBall') {
        ballOpacity.value = withTiming(0, { duration: 320 });
        ball2Opacity.value = withTiming(0, { duration: 320 });
      }
      roundTimerRef.current = setTimeout(() => advanceRound(), 620);
    },
    [advanceRound, bumpScore, mode, ballOpacity, ball2Opacity, objRotate, objScale, objX],
  );

  const startBallFall = useCallback(() => {
    const fallMs = ballFallMs(roundRef.current, P.rounds);
    objY.value = P.ballTopPct;
    objX.value = ballFromRef.current === 'left' ? P.objectLeftPct : P.objectRightPct;
    ballOpacity.value = 1;
    ball2Opacity.value = 1;
    objY.value = withTiming(P.ballCatchPct, { duration: fallMs });
    roundTimerRef.current = setTimeout(() => {
      if (!roundCompleteRef.current && roundActiveRef.current) {
        failAttempt(ballFromRef.current);
        roundTimerRef.current = setTimeout(() => advanceRound(), 550);
      }
    }, fallMs + 60);
  }, [advanceRound, failAttempt, objX, objY, ballOpacity, ball2Opacity]);

  const currentNeed = useCallback((): HorizontalDir => {
    if (mode === 'arrowMatch' && sequenceRef.current.length > 1) {
      return sequenceRef.current[seqStepRef.current] ?? 'left';
    }
    if (mode === 'catchBall') return ballFromRef.current;
    return targetDirRef.current;
  }, [mode]);

  const handleSwipe = useCallback(
    (deltaX: number, deltaY: number, dist: number) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      const need = currentNeed();
      const { ok, score: swipeScore } = swipeMatchesDir(deltaX, deltaY, dist, need, tier);

      if (mode === 'mirrorSwipe') {
        const swipeDir = swipeToDir(deltaX);
        if (mirrorActiveRef.current) {
          const { ok, score: s } = swipeMatchesDir(deltaX, deltaY, dist, swipeDir, tier);
          if (ok) {
            clearTimers();
            completeRound(oppositeDir(swipeDir), s, { mirror: true });
          } else if (dist >= swipeThreshold(tier) * 0.45) {
            clearTimers();
            failAttempt(swipeDir);
            roundTimerRef.current = setTimeout(() => advanceRound(), 550);
          }
        } else {
          const needDir = targetDirRef.current;
          if (ok) {
            clearTimers();
            completeRound(needDir, swipeScore);
          } else if (dist >= swipeThreshold(tier) * 0.45) {
            clearTimers();
            failAttempt(needDir);
            roundTimerRef.current = setTimeout(() => advanceRound(), 550);
          }
        }
        return;
      }

      if (mode === 'arrowMatch' && sequenceRef.current.length > 1) {
        if (ok) {
          const next = seqStepRef.current + 1;
          if (next >= sequenceRef.current.length) {
            clearTimers();
            completeRound(need, swipeScore);
          } else {
            seqStepRef.current = next;
            setSeqStep(next);
            const nextDir = sequenceRef.current[next]!;
            setTargetDir(nextDir);
            targetDirRef.current = nextDir;
            setStatusHint(`${dirArrow(nextDir)} Next!`);
            speakTTS(nextDir === 'left' ? ttsLeft : ttsRight, 0.78).catch(() => {});
          }
        } else {
          clearTimers();
          failAttempt(need);
          roundTimerRef.current = setTimeout(() => advanceRound(), 550);
        }
        return;
      }

      if (ok) {
        if (mode === 'catchBall') clearTimers();
        completeRound(need, swipeScore, { tracking: swipeScore });
      } else if (dist >= swipeThreshold(tier) * 0.45) {
        if (mode === 'catchBall') clearTimers();
        failAttempt(need);
        if (mode !== 'carTurn' && mode !== 'animalRun') {
          roundTimerRef.current = setTimeout(() => advanceRound(), 550);
        }
      }
    },
    [advanceRound, completeRound, currentNeed, failAttempt, mode, tier, ttsLeft, ttsRight],
  );

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    startAnalyticsRound();
    roundCompleteRef.current = false;
    setRoundActive(true);
    objScale.value = 1;
    const pulseMs = tier >= 3 ? P.arrowPulseFastMs : P.arrowPulseSlowMs;
    cuePulse.value = withRepeat(
      withSequence(withTiming(1.12, { duration: pulseMs }), withTiming(1, { duration: pulseMs })),
      -1,
      true,
    );

    if (mode === 'mirrorSwipe') {
      const mirror = useMirrorRound(roundRef.current, P.rounds);
      setMirrorActive(mirror);
      mirrorActiveRef.current = mirror;
      objX.value = P.objectCenterPct;
      if (!mirror) {
        const dir = randomHorizontalDir();
        setTargetDir(dir);
        targetDirRef.current = dir;
        setStatusHint(`Normal — swipe ${dir.toUpperCase()}!`);
        speakTTS(dir === 'left' ? ttsLeft : ttsRight, 0.78).catch(() => {});
      } else {
        setStatusHint('Mirror — swipe flips direction!');
        speakTTS(ttsMirror, 0.78).catch(() => {});
      }
      roundTimerRef.current = setTimeout(() => {
        if (!roundCompleteRef.current && roundActiveRef.current) {
          failAttempt('left');
          advanceRound();
        }
      }, P.reactionWindowMs);
      return;
    }

    if (mode === 'catchBall') {
      const from = randomHorizontalDir();
      setBallFrom(from);
      ballFromRef.current = from;
      setMultiBall(multiBallRound(roundRef.current, P.rounds));
      setStatusHint(from === 'left' ? 'Catch from LEFT!' : 'Catch from RIGHT!');
      speakTTS(from === 'left' ? 'Catch from the LEFT!' : 'Catch from the RIGHT!', 0.78).catch(() => {});
      startBallFall();
      return;
    }

    const dir = randomHorizontalDir();
    setTargetDir(dir);
    targetDirRef.current = dir;

    if (mode === 'arrowMatch') {
      const len = arrowSequenceLength(roundRef.current, P.rounds);
      const seq = buildArrowSequence(len);
      setSequence(seq);
      sequenceRef.current = seq;
      setSeqStep(0);
      seqStepRef.current = 0;
      const first = seq[0]!;
      setTargetDir(first);
      targetDirRef.current = first;
      setStatusHint(
        len > 1 ? `${seq.map(dirArrow).join(' → ')}` : `${dirArrow(first)} Swipe ${first.toUpperCase()}!`,
      );
      speakTTS(first === 'left' ? ttsLeft : ttsRight, 0.78).catch(() => {});
      return;
    }

    if (mode === 'animalRun') {
      const pet = randomAnimal();
      setAnimalEmoji(pet.emoji);
      setAnimalName(pet.name);
      setStatusHint(`Send ${pet.name} ${dir.toUpperCase()}!`);
      speakTTS(`Send ${pet.name} ${dir}!`, 0.78).catch(() => {});
      return;
    }

    objX.value = P.objectCenterPct;
    objY.value = 45;
    setStatusHint(dir === 'left' ? 'Turn LEFT!' : 'Turn RIGHT!');
    speakTTS(dir === 'left' ? ttsLeft : ttsRight, 0.78).catch(() => {});
  }, [cuePulse, mode, objScale, objX, objY, startAnalyticsRound, startBallFall, tier, ttsLeft, ttsMirror, ttsRight]);

  useEffect(() => {
    resetAnalytics();
  }, [resetAnalytics]);

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

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      if (mode === 'carTurn' || mode === 'animalRun') {
        const base = P.objectCenterPct;
        const deltaPct = (e.translationX / playW.current) * 100;
        objX.value = Math.max(P.objectLeftPct, Math.min(P.objectRightPct, base + deltaPct));
        objRotate.value = e.translationX < 0 ? -14 : e.translationX > 0 ? 14 : 0;
      }
    })
    .onEnd((e) => {
      const dist = Math.sqrt(e.translationX ** 2 + e.translationY ** 2);
      handleSwipe(e.translationX, e.translationY, dist);
    });

  if (showCongratulations && done && finalStats) {
    const a = finalStats.analytics;
    return (
      <CongratulationsScreen
        message={`${congratsMessage}\n🏁 Adventure Road Festival!\n⬅️ ${a.leftAccuracy}% · ➡️ ${a.rightAccuracy}%`}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        accuracy={a.spatialAwarenessScore}
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

  const displayEmoji =
    mode === 'animalRun'
      ? animalEmoji
      : mode === 'arrowMatch'
        ? dirArrow(targetDir)
        : T.objectEmoji;

  const showDir = roundActive ? (mode === 'arrowMatch' ? targetDir : mode === 'catchBall' ? ballFrom : targetDir) : null;

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
        <Text style={[styles.title, { color: T.titleColor }]}>{T.emoji} {T.title}</Text>
        <Text style={[styles.subtitle, { color: T.subtitleColor }]}>{T.subtitle}</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statPill, { borderColor: T.statBorder }]}>
            <Text style={[styles.statLabel, { color: T.statLabel }]}>Round</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>{round}/{P.rounds}</Text>
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
        {roundActive && <HorizontalBadge visible dir={showDir} success={cueSuccess} />}
        {roundActive && statusHint ? (
          <Text style={[styles.hint, { color: T.accentDark }]}>{statusHint}</Text>
        ) : null}
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[styles.playArea, shakeStyle, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
          }}
        >
          {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

          {roundActive && mode === 'carTurn' && <RoadBendCue dir={targetDir} accent={T.accent} />}
          {roundActive && mode === 'mirrorSwipe' && mirrorActive && <MirrorOverlay />}

          {roundActive && mode === 'catchBall' && (
            <View style={[styles.catchZone, { borderColor: T.accent }]}>
              <Text style={[styles.catchLabel, { color: T.accentDark }]}>CATCH ZONE</Text>
            </View>
          )}

          {roundActive && mode === 'arrowMatch' ? (
            <Animated.View style={[styles.arrowCue, cueStyle]}>
              <Text style={styles.arrowEmoji}>{displayEmoji}</Text>
              {sequence.length > 1 && (
                <Text style={[styles.seqHint, { color: T.subtitleColor }]}>
                  Step {seqStep + 1}/{sequence.length}
                </Text>
              )}
            </Animated.View>
          ) : (
            roundActive && (
              <>
                <Animated.View style={[styles.object, objStyle]}>
                  <Text style={styles.objectEmoji}>{displayEmoji}</Text>
                </Animated.View>
                {mode === 'catchBall' && multiBall && (
                  <Animated.View style={[styles.objectSmall, ball2Style]}>
                    <Text style={styles.ballSmall}>⚽</Text>
                  </Animated.View>
                )}
              </>
            )
          )}

          <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
        </Animated.View>
      </GestureDetector>

      {warnVisible && (
        <View style={styles.warnPill}>
          <Text style={styles.warnText}>Try again — check LEFT or RIGHT!</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.78)', borderRadius: 24, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 26, fontWeight: '900', textAlign: 'center' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 6, flexWrap: 'wrap', justifyContent: 'center' },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.22)' },
  coinPill: { backgroundColor: 'rgba(245,158,11,0.18)' },
  statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '900' },
  starIcon: { width: 16, height: 16, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  object: { position: 'absolute', width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  objectSmall: { position: 'absolute', width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  objectEmoji: { fontSize: 72 },
  ballSmall: { fontSize: 48 },
  arrowCue: { position: 'absolute', alignSelf: 'center', top: '36%', alignItems: 'center' },
  arrowEmoji: { fontSize: 96 },
  seqHint: { fontSize: 14, fontWeight: '800', marginTop: 8 },
  catchZone: {
    position: 'absolute',
    alignSelf: 'center',
    top: `${P.ballCatchPct - 6}%`,
    width: '58%',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  catchLabel: { fontSize: 13, fontWeight: '800' },
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
});

export default HorizontalSwipeGame;
