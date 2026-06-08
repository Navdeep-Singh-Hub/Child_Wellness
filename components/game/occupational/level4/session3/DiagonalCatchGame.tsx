/**
 * Diagonal catch game — OT Level 4 Session 3.
 * Move the catcher to intercept objects falling diagonally.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { useTraceSound } from '@/components/game/occupational/level4/session3/diagonalUtils';
import { SESSION4_3_PACING } from '@/components/game/occupational/level4/session3/session3Pacing';
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
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

const THEME = {
  title: 'Sky Catch',
  subtitle: 'Move the catcher to grab falling objects',
  emoji: '🎯',
  gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'] as [string, string, string, string],
  accent: '#EF4444',
  accentDark: '#B91C1C',
  backText: '#991B1B',
  backBorder: 'rgba(239,68,68,0.25)',
  titleColor: '#7F1D1D',
  subtitleColor: '#DC2626',
  statLabel: '#EF4444',
  statValue: '#7F1D1D',
  statBorder: 'rgba(239,68,68,0.2)',
  playBorder: 'rgba(239,68,68,0.25)',
  playBg: 'rgba(255,255,255,0.35)',
  sparkleColor: '#EF4444',
};

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
  const [roundActive, setRoundActive] = useState(false);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const fallActiveRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  }));

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
      speakTTS('Amazing catching!', 0.78);
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
    catcherScale.value = withSequence(withTiming(1.2, { duration: 140 }), withTiming(1, { duration: 140 }));
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, catcherScale, objectOpacity, stopFall]);

  const startObjectFallRef = useRef<() => void>(() => {});

  const handleCatchMiss = useCallback(() => {
    if (doneRef.current) return;
    stopFall();
    objectOpacity.value = withTiming(0, { duration: 200 });
    playWarn();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    speakTTS('Try again!', 0.78).catch(() => {});
    roundTimerRef.current = setTimeout(() => {
      if (!doneRef.current && roundActiveRef.current) startObjectFallRef.current();
    }, 700);
  }, [objectOpacity, playWarn, stopFall]);

  const startObjectFall = useCallback(() => {
    if (doneRef.current || !roundActiveRef.current) return;
    roundCompleteRef.current = false;
    fallActiveRef.current = true;
    objectOpacity.value = 1;

    const fromTopLeft = Math.random() < 0.5;
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

      const dx = targetEndX.current - objectX.value;
      const dy = targetEndY.current - objectY.value;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < P.catchTolerancePx) {
        const catcherDist = Math.sqrt(
          (objectX.value - catcherX.value) ** 2 + (objectY.value - catcherY.value) ** 2,
        );
        if (catcherDist <= P.catchTolerancePx) {
          handleCatchSuccess();
        } else {
          handleCatchMiss();
        }
        return;
      }

      const step = P.catchFallSpeed;
      const ratio = step / distance;
      objectX.value += dx * ratio;
      objectY.value += dy * ratio;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [catcherX, catcherY, handleCatchMiss, handleCatchSuccess, objectOpacity, objectX, objectY]);

  startObjectFallRef.current = startObjectFall;

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    catcherX.value = playW.current * 0.5;
    catcherY.value = playH.current * 0.78;
    roundTimerRef.current = setTimeout(() => startObjectFall(), 350);
  }, [catcherX, catcherY, startObjectFall]);

  useEffect(() => {
    if (round === 1) speakTTS('Catch objects coming diagonally across the screen!', 0.78);
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
      catcherScale.value = withTiming(1.12, { duration: 100 });
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || doneRef.current) return;
      const half = 40;
      catcherX.value = Math.max(half, Math.min(playW.current - half, e.x));
      catcherY.value = Math.max(half, Math.min(playH.current - half, e.y));
    })
    .onEnd(() => {
      catcherScale.value = withTiming(1, { duration: 100 });
    });

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message="Sky Catch Champion!"
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

  const T = THEME;

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
        {roundActive ? (
          <Text style={[styles.hint, { color: T.accentDark }]}>Drag the catcher to intercept!</Text>
        ) : null}
      </View>

      <GestureDetector gesture={panGesture}>
        <View
          style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
            catcherX.value = playW.current * 0.5;
            catcherY.value = playH.current * 0.78;
          }}
        >
          {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

          {roundActive && (
            <>
              <Animated.View style={[styles.fallingObject, objectStyle]}>
                <Text style={styles.objectEmoji}>⚽</Text>
              </Animated.View>
              <Animated.View style={[styles.catcher, catcherStyle]}>
                <Text style={styles.catcherEmoji}>🫴</Text>
              </Animated.View>
            </>
          )}

          <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
        </View>
      </GestureDetector>
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
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  catcher: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(59,130,246,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  catcherEmoji: { fontSize: 44 },
  fallingObject: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(245,158,11,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  objectEmoji: { fontSize: 34 },
});

export default DiagonalCatchGame;
