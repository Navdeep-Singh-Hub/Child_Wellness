/**
 * Shared two-hand simultaneous drag core for OT Level 4 Session 9.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { distPx, randomMatchShape, useTraceSound } from '@/components/game/occupational/level4/session9/dualDragUtils';
import { SESSION4_9_PACING } from '@/components/game/occupational/level4/session9/session9Pacing';
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
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION4_9_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const STAR = require('@/assets/icons/star.png');
const HALF = P.objHalfPx;

export type DualDragMode = 'dualTarget' | 'matchCenter' | 'shapeSort';

export type DualDragTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  leftColor: string;
  rightColor: string;
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
  zoneBorder: string;
};

export type DualDragGameConfig = {
  theme: DualDragTheme;
  mode: DualDragMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsCue?: string;
  ttsSuccess?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const DualDragGame: React.FC<
  DualDragGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsCue = 'Drag both at the same time!',
  ttsSuccess = 'Perfect!',
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [matchEmoji, setMatchEmoji] = useState('⭕');
  const [zoneLayout, setZoneLayout] = useState({ left: { x: 72, y: 288 }, right: { x: 288, y: 288 }, center: { x: 180, y: 260 } });

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const leftInRef = useRef(false);
  const rightInRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);
  const leftStart = useRef({ x: 72, y: 96 });
  const rightStart = useRef({ x: 288, y: 96 });
  const leftTarget = useRef({ x: 72, y: 288 });
  const rightTarget = useRef({ x: 288, y: 288 });
  const centerTarget = useRef({ x: 180, y: 260 });

  const leftX = useSharedValue(72);
  const leftY = useSharedValue(96);
  const leftScale = useSharedValue(1);
  const rightX = useSharedValue(288);
  const rightY = useSharedValue(96);
  const rightScale = useSharedValue(1);

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
    left: leftX.value - HALF,
    top: leftY.value - HALF,
    transform: [{ scale: leftScale.value }],
  }));
  const rightStyle = useAnimatedStyle(() => ({
    left: rightX.value - HALF,
    top: rightY.value - HALF,
    transform: [{ scale: rightScale.value }],
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    cancelAnimation(leftX);
    cancelAnimation(leftY);
    cancelAnimation(rightX);
    cancelAnimation(rightY);
  }, [leftX, leftY, rightX, rightY]);

  const layoutPositions = useCallback(() => {
    const w = playW.current;
    const h = playH.current;
    leftStart.current = { x: w * 0.22, y: h * 0.22 };
    rightStart.current = { x: w * 0.78, y: h * 0.22 };
    if (mode === 'matchCenter') {
      centerTarget.current = { x: w * 0.5, y: h * 0.58 };
      leftTarget.current = centerTarget.current;
      rightTarget.current = centerTarget.current;
    } else if (mode === 'shapeSort') {
      leftTarget.current = { x: w * 0.25, y: h * 0.72 };
      rightTarget.current = { x: w * 0.75, y: h * 0.72 };
    } else {
      leftTarget.current = { x: w * 0.22, y: h * 0.72 };
      rightTarget.current = { x: w * 0.78, y: h * 0.72 };
    }
    leftX.value = leftStart.current.x;
    leftY.value = leftStart.current.y;
    rightX.value = rightStart.current.x;
    rightY.value = rightStart.current.y;
    setZoneLayout({
      left: { ...leftTarget.current },
      right: { ...rightTarget.current },
      center: { ...centerTarget.current },
    });
  }, [leftX, leftY, mode, rightX, rightY]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.rounds;
      const xp = Math.round(finalScore * 20);
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

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
    leftInRef.current = false;
    rightInRef.current = false;
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    bumpScore();
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore]);

  const checkCompletion = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
    if (leftInRef.current && rightInRef.current) completeRound();
  }, [completeRound]);

  const updateInZone = useCallback(
    (side: 'left' | 'right') => {
      const tol = mode === 'shapeSort' ? P.sortTolerancePx : P.matchTolerancePx;
      const x = side === 'left' ? leftX.value : rightX.value;
      const y = side === 'left' ? leftY.value : rightY.value;
      const tx = side === 'left' ? leftTarget.current.x : rightTarget.current.x;
      const ty = side === 'left' ? leftTarget.current.y : rightTarget.current.y;
      const inZone = distPx(x, y, tx, ty) <= tol;
      if (side === 'left') leftInRef.current = inZone;
      else rightInRef.current = inZone;
      checkCompletion();
    },
    [checkCompletion, leftX, leftY, mode, rightX, rightY],
  );

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    layoutPositions();
    if (mode === 'matchCenter') {
      const shape = randomMatchShape();
      setMatchEmoji(shape.emoji);
    }
    const hint =
      mode === 'shapeSort'
        ? 'Circle → left box, square → right box!'
        : mode === 'matchCenter'
          ? 'Drag both shapes to the center!'
          : 'Drag both objects to their targets!';
    setStatusHint(hint);
    speakTTS(ttsCue, 0.78).catch(() => {});
  }, [layoutPositions, mode, ttsCue]);

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

  const leftPan = Gesture.Pan()
    .runOnJS(true)
    .onBegin(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      leftScale.value = withTiming(1.12, { duration: 100 });
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      leftX.value = Math.max(HALF, Math.min(playW.current - HALF, e.x));
      leftY.value = Math.max(HALF, Math.min(playH.current - HALF, e.y));
      updateInZone('left');
    })
    .onEnd(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      leftScale.value = withTiming(1, { duration: 100 });
      updateInZone('left');
    });

  const rightPan = Gesture.Pan()
    .runOnJS(true)
    .onBegin(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      rightScale.value = withTiming(1.12, { duration: 100 });
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      rightX.value = Math.max(HALF, Math.min(playW.current - HALF, e.x));
      rightY.value = Math.max(HALF, Math.min(playH.current - HALF, e.y));
      updateInZone('right');
    })
    .onEnd(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      rightScale.value = withTiming(1, { duration: 100 });
      updateInZone('right');
    });

  const dualGesture = Gesture.Simultaneous(leftPan, rightPan);

  const leftEmoji = mode === 'shapeSort' ? '⭕' : mode === 'matchCenter' ? matchEmoji : '🔵';
  const rightEmoji = mode === 'shapeSort' ? '⬜' : mode === 'matchCenter' ? matchEmoji : '🔴';

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

      <GestureDetector gesture={dualGesture}>
        <View
          style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
            layoutPositions();
          }}
        >
          {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

          {roundActive && mode === 'matchCenter' && (
            <View
              style={[
                styles.zone,
                styles.centerZone,
                {
                  left: zoneLayout.center.x - 55,
                  top: zoneLayout.center.y - 55,
                  borderColor: T.zoneBorder,
                },
              ]}
            >
              <Text style={styles.zoneLabel}>MATCH</Text>
            </View>
          )}

          {roundActive && mode !== 'matchCenter' && (
            <>
              <View
                style={[
                  styles.zone,
                  {
                    left: zoneLayout.left.x - 48,
                    top: zoneLayout.left.y - 48,
                    borderColor: T.zoneBorder,
                  },
                ]}
              >
                <Text style={styles.zoneEmoji}>{mode === 'shapeSort' ? '⭕' : '🎯'}</Text>
              </View>
              <View
                style={[
                  styles.zone,
                  {
                    left: zoneLayout.right.x - 48,
                    top: zoneLayout.right.y - 48,
                    borderColor: T.zoneBorder,
                  },
                ]}
              >
                <Text style={styles.zoneEmoji}>{mode === 'shapeSort' ? '⬜' : '🎯'}</Text>
              </View>
            </>
          )}

          {roundActive && (
            <>
              <Animated.View style={[styles.obj, { backgroundColor: T.leftColor }, leftStyle]}>
                <Text style={styles.objEmoji}>{leftEmoji}</Text>
              </Animated.View>
              <Animated.View style={[styles.obj, { backgroundColor: T.rightColor }, rightStyle]}>
                <Text style={styles.objEmoji}>{rightEmoji}</Text>
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
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1 },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  zone: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  centerZone: { width: 110, height: 110, borderRadius: 55 },
  zoneLabel: { fontSize: 11, fontWeight: '800', color: '#64748B' },
  zoneEmoji: { fontSize: 32 },
  obj: {
    position: 'absolute',
    width: HALF * 2,
    height: HALF * 2,
    borderRadius: HALF,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  objEmoji: { fontSize: 34 },
});

export default DualDragGame;
