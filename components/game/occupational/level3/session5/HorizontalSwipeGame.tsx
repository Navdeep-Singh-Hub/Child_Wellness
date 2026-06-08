/**
 * Shared left-right swipe game core for OT Level 3 Session 5.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION5_PACING } from '@/components/game/occupational/level3/session5/session5Pacing';
import {
  HorizontalDir,
  oppositeDir,
  randomAnimalEmoji,
  randomHorizontalDir,
  swipeMatchesDir,
  swipeToDir,
  useTraceSound,
} from '@/components/game/occupational/level3/session5/horizontalUtils';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
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

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [warnVisible, setWarnVisible] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [targetDir, setTargetDir] = useState<HorizontalDir>('left');
  const [statusHint, setStatusHint] = useState('');
  const [animalEmoji, setAnimalEmoji] = useState('🐕');
  const [ballFrom, setBallFrom] = useState<HorizontalDir>('left');

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const targetDirRef = useRef<HorizontalDir>('left');
  const ballFromRef = useRef<HorizontalDir>('left');
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);

  const objX = useSharedValue(P.objectCenterPct);
  const objY = useSharedValue(45);
  const objScale = useSharedValue(1);
  const objRotate = useSharedValue(0);
  const cuePulse = useSharedValue(1);
  const ballOpacity = useSharedValue(1);

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

  const cueStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cuePulse.value }],
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    cancelAnimation(objY);
  }, [objY]);

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

  const failAttempt = useCallback(
    (need: HorizontalDir) => {
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setWarnVisible(true);
      setTimeout(() => setWarnVisible(false), 800);
      speakTTS(need === 'left' ? ttsWrongLeft : ttsWrongRight, 0.78).catch(() => {});
      objX.value = withTiming(P.objectCenterPct, { duration: 250 });
      objRotate.value = withTiming(0, { duration: 200 });
    },
    [objRotate, objX, playWarn, ttsWrongLeft, ttsWrongRight],
  );

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
    ballOpacity.value = 1;
    objX.value = P.objectCenterPct;
    objY.value = mode === 'catchBall' ? P.ballTopPct : 45;
    objRotate.value = 0;
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame, mode, ballOpacity, objRotate, objX, objY]);

  const completeRound = useCallback(
    (animDir: HorizontalDir) => {
      if (roundCompleteRef.current || doneRef.current) return;
      roundCompleteRef.current = true;
      bumpScore();
      const dest = animDir === 'left' ? P.objectLeftPct : P.objectRightPct;
      objX.value = withTiming(dest, { duration: 450 });
      objRotate.value = withSequence(withTiming(animDir === 'left' ? -18 : 18, { duration: 200 }), withTiming(0, { duration: 200 }));
      objScale.value = withSequence(withTiming(1.12, { duration: 150 }), withTiming(1, { duration: 150 }));
      if (mode === 'catchBall') {
        ballOpacity.value = withTiming(0, { duration: 350 });
      }
      roundTimerRef.current = setTimeout(() => advanceRound(), 650);
    },
    [advanceRound, bumpScore, mode, ballOpacity, objRotate, objScale, objX],
  );

  const startBallFall = useCallback(() => {
    objY.value = P.ballTopPct;
    objX.value = ballFromRef.current === 'left' ? P.objectLeftPct : P.objectRightPct;
    ballOpacity.value = 1;
    objY.value = withTiming(P.ballCatchPct, { duration: P.ballFallMs });
    roundTimerRef.current = setTimeout(() => {
      if (!roundCompleteRef.current && roundActiveRef.current) {
        failAttempt(ballFromRef.current);
        roundTimerRef.current = setTimeout(() => advanceRound(), 600);
      }
    }, P.ballFallMs + 80);
  }, [advanceRound, ballOpacity, failAttempt, objX, objY]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    objScale.value = 1;
    cuePulse.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 400 }), withTiming(1, { duration: 400 })),
      -1,
      true,
    );

    if (mode === 'mirrorSwipe') {
      objX.value = P.objectCenterPct;
      setStatusHint('Swipe — object goes the opposite way!');
      speakTTS(ttsMirror, 0.78).catch(() => {});
      return;
    }

    if (mode === 'catchBall') {
      const from = randomHorizontalDir();
      setBallFrom(from);
      ballFromRef.current = from;
      setStatusHint(from === 'left' ? 'Ball from LEFT — swipe left!' : 'Ball from RIGHT — swipe right!');
      speakTTS(from === 'left' ? ttsLeft : ttsRight, 0.78).catch(() => {});
      startBallFall();
      return;
    }

    const dir = randomHorizontalDir();
    setTargetDir(dir);
    targetDirRef.current = dir;

    if (mode === 'animalRun') {
      const emoji = randomAnimalEmoji();
      setAnimalEmoji(emoji);
    }

    objX.value = P.objectCenterPct;
    objY.value = 45;

    if (mode === 'arrowMatch') {
      setStatusHint(dir === 'left' ? '⬅️ Swipe LEFT!' : '➡️ Swipe RIGHT!');
    } else {
      setStatusHint(dir === 'left' ? 'Turn LEFT!' : 'Turn RIGHT!');
    }
    speakTTS(dir === 'left' ? ttsLeft : ttsRight, 0.78).catch(() => {});
  }, [cuePulse, mode, objScale, objX, objY, startBallFall, ttsLeft, ttsMirror, ttsRight]);

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
      if (mode === 'arrowMatch' || mode === 'mirrorSwipe' || mode === 'catchBall') return;
      const base = P.objectCenterPct;
      const deltaPct = (e.translationX / playW.current) * 100;
      objX.value = Math.max(P.objectLeftPct, Math.min(P.objectRightPct, base + deltaPct));
      objRotate.value = e.translationX < 0 ? -12 : e.translationX > 0 ? 12 : 0;
    })
    .onEnd((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      const dist = Math.sqrt(e.translationX ** 2 + e.translationY ** 2);
      if (dist < P.swipeThreshold) return;

      const swipeDir = swipeToDir(e.translationX);

      if (mode === 'mirrorSwipe') {
        clearTimers();
        completeRound(oppositeDir(swipeDir));
        return;
      }

      if (mode === 'catchBall') {
        if (swipeMatchesDir(e.translationX, dist, ballFromRef.current, P.swipeThreshold)) {
          clearTimers();
          completeRound(ballFromRef.current);
        } else {
          clearTimers();
          failAttempt(ballFromRef.current);
          roundTimerRef.current = setTimeout(() => advanceRound(), 600);
        }
        return;
      }

      const need = targetDirRef.current;
      if (swipeMatchesDir(e.translationX, dist, need, P.swipeThreshold)) {
        completeRound(need);
      } else {
        failAttempt(need);
      }
    });

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

  const displayEmoji =
    mode === 'animalRun' ? animalEmoji : mode === 'arrowMatch' ? (targetDir === 'left' ? '⬅️' : '➡️') : T.objectEmoji;

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

      <GestureDetector gesture={panGesture}>
        <View
          style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
          }}
        >
          {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

          {roundActive && mode === 'catchBall' && (
            <View style={[styles.catchZone, { borderColor: T.accent }]}>
              <Text style={[styles.catchLabel, { color: T.accentDark }]}>CATCH HERE</Text>
            </View>
          )}

          {roundActive && mode === 'arrowMatch' ? (
            <Animated.View style={[styles.arrowCue, cueStyle]}>
              <Text style={styles.arrowEmoji}>{displayEmoji}</Text>
            </Animated.View>
          ) : (
            roundActive && (
              <Animated.View style={[styles.object, objStyle]}>
                <Text style={styles.objectEmoji}>{displayEmoji}</Text>
              </Animated.View>
            )
          )}

          <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
        </View>
      </GestureDetector>

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
  arrowCue: { position: 'absolute', alignSelf: 'center', top: '38%' },
  arrowEmoji: { fontSize: 96 },
  catchZone: {
    position: 'absolute',
    alignSelf: 'center',
    top: `${P.ballCatchPct - 6}%`,
    width: '55%',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.35)',
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
