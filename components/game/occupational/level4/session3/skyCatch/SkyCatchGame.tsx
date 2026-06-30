/**
 * Diagonal catch game — OT Level 4 Session 3 · Theme: "Sky Catch" · Aurora Sky
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast, SparkleBurst } from '@/components/game/FX';
import { SkyCatchPlayArea } from '@/components/game/occupational/level4/session3/skyCatch/SkyCatchVisuals';
import { useTraceSound } from '@/components/game/occupational/level4/session3/shared/diagonalUtils';
import { SESSION4_3_PACING } from '@/components/game/occupational/level4/session3/shared/session3Pacing';
import { SKY_CATCH_STARS, SKY_CATCH_THEME as T } from '@/components/game/occupational/level4/session3/skyCatch/skyCatchTheme';
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
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION4_3_PACING;
const CATCHER_RADIUS = 40;
const OBJECT_RADIUS = 30;
const CATCH_SLACK = 22;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

const DiagonalCatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({
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
  const [successToast, setSuccessToast] = useState(false);
  const [warnVisible, setWarnVisible] = useState(false);
  const [warnMessage, setWarnMessage] = useState('Too slow!');
  const [kickOffVisible, setKickOffVisible] = useState(false);
  const [catchKey, setCatchKey] = useState(0);
  const [fallFromLeft, setFallFromLeft] = useState(true);
  const [fallEmoji, setFallEmoji] = useState<string>(SKY_CATCH_STARS[0]);
  const [roundActive, setRoundActive] = useState(false);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const fallActiveRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kickOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationRef = useRef<number | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);
  const targetEndX = useRef(306);
  const targetEndY = useRef(328);

  const catcherX = useSharedValue(180);
  const catcherY = useSharedValue(320);
  const catcherScale = useSharedValue(1);
  const objectX = useSharedValue(54);
  const objectY = useSharedValue(72);
  const objectOpacity = useSharedValue(1);
  const objectSpin = useSharedValue(0);
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

  const catcherStyle = useAnimatedStyle(() => ({
    left: catcherX.value - 40,
    top: catcherY.value - 40,
    transform: [{ scale: catcherScale.value }],
  }));

  const objectStyle = useAnimatedStyle(() => ({
    left: objectX.value - 30,
    top: objectY.value - 30,
    opacity: objectOpacity.value,
    transform: [{ rotate: `${objectSpin.value}deg` }],
  }));

  const playShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playShake.value }],
  }));

  const kickOffStyle = useAnimatedStyle(() => ({
    opacity: kickOffOpacity.value,
    transform: [{ scale: 0.92 + kickOffOpacity.value * 0.08 }],
  }));

  const starTrailStyle = useAnimatedStyle(() => ({
    left: objectX.value - 20,
    top: objectY.value - 8,
    opacity: objectOpacity.value * 0.35,
    transform: [{ rotate: `${objectSpin.value * 0.5}deg` }],
  }));

  const shakePlayArea = useCallback(() => {
    playShake.value = withSequence(
      withTiming(-8, { duration: 45 }),
      withTiming(8, { duration: 45 }),
      withTiming(-5, { duration: 45 }),
      withTiming(5, { duration: 45 }),
      withTiming(0, { duration: 45 }),
    );
  }, [playShake]);

  const stopFall = useCallback(() => {
    fallActiveRef.current = false;
    if (animationRef.current != null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (kickOffTimerRef.current) {
      clearTimeout(kickOffTimerRef.current);
      kickOffTimerRef.current = null;
    }
    stopFall();
    cancelAnimation(catcherX);
    cancelAnimation(catcherY);
    cancelAnimation(objectX);
    cancelAnimation(objectY);
  }, [catcherX, catcherY, objectX, objectY, stopFall]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.rounds;
      const xp = Math.round(finalScore * 15);
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      setShowCongratulations(true);
      speakTTS(T.voiceComplete, 0.78);
      recordGame(xp)
        .then(() =>
          logGameAndAward({
            type: 'diagonal-catch',
            correct: finalScore,
            total,
            accuracy: (finalScore / total) * 100,
            xpAwarded: xp,
            skillTags: ['anticipation-skills', 'diagonal-drag'],
          }),
        )
        .then(() => router.setParams({ refreshStats: Date.now().toString() }))
        .catch(console.error);
    },
    [clearTimers, router],
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

  const handleCatchSuccess = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    stopFall();
    objectOpacity.value = withTiming(0, { duration: 200 });
    bumpScore();
    setCatchKey(Date.now());
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 700);
    speakTTS(T.voiceCaught, 0.82).catch(() => {});
    catcherScale.value = withSequence(withTiming(1.2, { duration: 140 }), withTiming(1, { duration: 140 }));
    roundTimerRef.current = setTimeout(() => advanceRound(), 780);
  }, [advanceRound, bumpScore, catcherScale, objectOpacity, stopFall]);

  const startObjectFallRef = useRef<() => void>(() => {});

  const handleCatchMiss = useCallback(() => {
    if (doneRef.current) return;
    stopFall();
    objectOpacity.value = withTiming(0, { duration: 200 });
    playWarn();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    setWarnMessage('Too slow!');
    setWarnVisible(true);
    shakePlayArea();
    setTimeout(() => setWarnVisible(false), 800);
    speakTTS(T.voiceMiss, 0.78).catch(() => {});
    roundTimerRef.current = setTimeout(() => {
      if (!doneRef.current && roundActiveRef.current) startObjectFallRef.current();
    }, 700);
  }, [objectOpacity, playWarn, shakePlayArea]);

  const isObjectCaught = useCallback(() => {
    const hDist = Math.abs(objectX.value - catcherX.value);
    const vDist = objectY.value - catcherY.value;
    const reach = CATCHER_RADIUS + OBJECT_RADIUS + CATCH_SLACK;
    return hDist <= reach && vDist >= -OBJECT_RADIUS && vDist <= reach;
  }, [catcherX, catcherY, objectX, objectY]);

  const startObjectFall = useCallback(() => {
    if (doneRef.current || !roundActiveRef.current) return;
    roundCompleteRef.current = false;
    fallActiveRef.current = true;
    objectOpacity.value = 1;
    objectSpin.value = 0;

    const fromTopLeft = Math.random() < 0.5;
    setFallFromLeft(fromTopLeft);
    const star = SKY_CATCH_STARS[Math.floor(Math.random() * SKY_CATCH_STARS.length)]!;
    setFallEmoji(star);

    const w = playW.current;
    const h = playH.current;
    const startX = fromTopLeft ? w * P.startXPct : w * P.endXPct;
    const startY = h * P.startYPct;
    targetEndX.current = fromTopLeft ? w * P.endXPct : w * P.startXPct;
    targetEndY.current = h * P.endYPct;

    objectX.value = startX;
    objectY.value = startY;

    const animate = () => {
      if (!fallActiveRef.current || doneRef.current) return;

      if (isObjectCaught()) {
        handleCatchSuccess();
        return;
      }

      const dx = targetEndX.current - objectX.value;
      const dy = targetEndY.current - objectY.value;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= P.catchFallSpeed) {
        handleCatchMiss();
        return;
      }

      const step = P.catchFallSpeed;
      const ratio = step / distance;
      objectX.value += dx * ratio;
      objectY.value += dy * ratio;
      objectSpin.value += fromTopLeft ? 2.5 : -2.5;

      if (isObjectCaught()) {
        handleCatchSuccess();
        return;
      }

      if (objectY.value > catcherY.value + CATCHER_RADIUS + OBJECT_RADIUS + CATCH_SLACK) {
        handleCatchMiss();
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [
    catcherY,
    handleCatchMiss,
    handleCatchSuccess,
    isObjectCaught,
    objectOpacity,
    objectSpin,
    objectX,
    objectY,
  ]);

  startObjectFallRef.current = startObjectFall;

  const placeCatcher = useCallback(() => {
    catcherX.value = playW.current * 0.5;
    catcherY.value = playH.current * P.catcherYPct;
  }, [catcherX, catcherY]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    placeCatcher();
    setKickOffVisible(true);
    kickOffOpacity.value = withSequence(
      withTiming(1, { duration: 220 }),
      withTiming(1, { duration: 900 }),
      withTiming(0, { duration: 280 }),
    );
    kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1400);
    roundTimerRef.current = setTimeout(() => startObjectFall(), 350);
  }, [kickOffOpacity, placeCatcher, startObjectFall]);

  useEffect(() => {
    if (round === 1) speakTTS(T.voiceIntro, 0.78);
    clearTimers();
    setRoundActive(false);
    roundTimerRef.current = setTimeout(() => startRoundPlay(), P.roundStartDelayMs);
    return clearTimers;
  }, [round, startRoundPlay, clearTimers]);

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
    .onBegin(() => {
      if (!roundActiveRef.current || doneRef.current) return;
      setKickOffVisible(false);
      kickOffOpacity.value = withTiming(0, { duration: 100 });
      catcherScale.value = withTiming(1.14, { duration: 100 });
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || doneRef.current) return;
      catcherX.value = Math.max(CATCHER_RADIUS, Math.min(playW.current - CATCHER_RADIUS, e.x));
      catcherY.value = playH.current * P.catcherYPct;
    })
    .onEnd(() => {
      catcherScale.value = withTiming(1, { duration: 100 });
    });

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message={T.congrats}
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

  const roundPct = ((round - 1) / P.rounds) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.headerGlow} pointerEvents="none">
        {[0, 1, 2].map((i) => (
          <View key={`hg-${i}`} style={[styles.headerOrb, { left: `${15 + i * 28}%` }]} />
        ))}
      </View>
      <TouchableOpacity
        onPress={() => {
          stopAllSpeech();
          cleanupSounds();
          clearTimers();
          onBack?.();
        }}
        style={styles.backBtn}
      >
        <View style={[styles.backInner, { borderColor: T.backBorder, backgroundColor: 'rgba(12,20,69,0.55)' }]}>
          <Text style={[styles.backText, { color: T.backText }]}>← Back</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: T.titleColor }, styles.themedTitle]}>
          {T.emoji} {T.title}
        </Text>
        <Text style={[styles.subtitle, { color: T.subtitleColor }]}>{T.subtitle}</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statPill, { borderColor: T.statBorder, backgroundColor: 'rgba(12,20,69,0.45)' }]}>
            <Text style={[styles.statLabel, { color: T.statLabel }]}>Round</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>
              {round}/{P.rounds}
            </Text>
          </View>
          <View
            style={[
              styles.statPill,
              styles.starPill,
              { borderColor: T.statBorder, backgroundColor: 'rgba(251,191,36,0.15)' },
            ]}
          >
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${roundPct}%`, backgroundColor: T.accent }]} />
        </View>
        {roundActive ? (
          <Text style={[styles.hint, { color: T.accentDark }]}>Slide the net under the falling star!</Text>
        ) : null}
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.playArea,
            playShakeStyle,
            {
              borderColor: T.playBorder,
              backgroundColor: T.playBg,
              borderWidth: 2,
              shadowColor: '#000',
              shadowOpacity: 0.28,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
            },
          ]}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
            placeCatcher();
          }}
        >
          {!roundActive && (
            <Text style={[styles.waitText, { color: '#C4B5FD' }]}>Aurora rising…</Text>
          )}

          {roundActive && (
            <SkyCatchPlayArea roundActive={roundActive} fallFromLeft={fallFromLeft} catchKey={catchKey} />
          )}

          {roundActive && (
            <>
              <Animated.View style={[styles.starTrail, starTrailStyle]} pointerEvents="none" />
              <Animated.View style={[styles.fallingObject, objectStyle]}>
                <LinearGradient colors={['#FEF9C3', '#FDE047', '#F59E0B']} style={styles.starGradient}>
                  <Text style={styles.objectEmoji}>{fallEmoji}</Text>
                </LinearGradient>
              </Animated.View>
              <Animated.View style={[styles.catcher, catcherStyle]}>
                <LinearGradient colors={['#BAE6FD', '#38BDF8', '#0284C7']} style={styles.catcherGradient}>
                  <Text style={styles.catcherEmoji}>{T.catcherEmoji}</Text>
                </LinearGradient>
              </Animated.View>
            </>
          )}

          {kickOffVisible && (
            <Animated.View style={[styles.catchBanner, kickOffStyle]} pointerEvents="none">
              <Text style={styles.catchBannerText}>☁️ CATCH!</Text>
            </Animated.View>
          )}

          <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} count={16} size={8} />
          <ResultToast text="SNAGGED!" type="ok" show={successToast} />
        </Animated.View>
      </GestureDetector>

      {warnVisible && (
        <View style={styles.skyWarnPill}>
          <Text style={styles.skyWarnText}>{warnMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 90, pointerEvents: 'none' },
  headerOrb: {
    position: 'absolute',
    top: 18,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(167,139,250,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
  },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900' },
  themedTitle: {
    textShadowColor: 'rgba(56,189,248,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  progressTrack: {
    width: '72%',
    height: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: { height: '100%', borderRadius: 99 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: {},
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700', zIndex: 3 },
  starTrail: {
    position: 'absolute',
    width: 40,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FDE047',
    zIndex: 1,
  },
  catcher: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    zIndex: 3,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  catcherGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catcherEmoji: { fontSize: 40 },
  fallingObject: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    zIndex: 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#FBBF24',
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 8,
  },
  starGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  objectEmoji: { fontSize: 32 },
  catchBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: 'rgba(12,20,69,0.88)',
    borderWidth: 2,
    borderColor: '#38BDF8',
    zIndex: 5,
  },
  catchBannerText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#E0F2FE',
    textShadowColor: '#FB7185',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  skyWarnPill: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(12,20,69,0.88)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.45)',
  },
  skyWarnText: { fontSize: 15, fontWeight: '800', color: '#FDA4AF' },
});

export default DiagonalCatchGame;
