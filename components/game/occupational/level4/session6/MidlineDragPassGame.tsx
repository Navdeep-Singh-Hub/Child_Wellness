/**
 * Shared pan-drag midline pass core for OT Level 4 Session 6.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { distPx, useTraceSound } from '@/components/game/occupational/level4/session6/midlineUtils';
import { SESSION4_6_PACING } from '@/components/game/occupational/level4/session6/session6Pacing';
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

const P = SESSION4_6_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');
const BALL_HALF = 28;

export type MidlineDragMode = 'targetPass' | 'obstaclePass';

export type MidlineDragTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  ballEmoji: string;
  targetEmoji: string;
  obstacleEmoji: string;
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
  midlineColor: string;
};

export type MidlineDragPassGameConfig = {
  theme: MidlineDragTheme;
  mode: MidlineDragMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsDrag?: string;
  ttsMiss?: string;
  ttsObstacle?: string;
  ttsSuccess?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const MidlineDragPassGame: React.FC<
  MidlineDragPassGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsDrag = 'Drag the ball across your body to the target!',
  ttsMiss = 'Drag to the target across your body!',
  ttsObstacle = 'Hit obstacle! Go around it!',
  ttsSuccess = 'Perfect pass!',
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
  const [targetPos, setTargetPos] = useState({ x: 288, y: 96 });
  const [obstaclePos, setObstaclePos] = useState({ x: 180, y: 200 });

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);
  const startX = useRef(64);
  const startY = useRef(288);
  const targetX = useRef(288);
  const targetY = useRef(96);
  const obstacleX = useRef(180);
  const obstacleY = useRef(200);

  const ballX = useSharedValue(64);
  const ballY = useSharedValue(288);
  const ballScale = useSharedValue(1);
  const targetScale = useSharedValue(1);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

  const ballStyle = useAnimatedStyle(() => ({
    left: ballX.value - BALL_HALF,
    top: ballY.value - BALL_HALF,
    transform: [{ scale: ballScale.value }],
  }));

  const targetStyle = useAnimatedStyle(() => ({
    transform: [{ scale: targetScale.value }],
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    cancelAnimation(ballX);
    cancelAnimation(ballY);
  }, [ballX, ballY]);

  const layoutRound = useCallback(() => {
    const w = playW.current;
    const h = playH.current;
    startX.current = w * P.ballStartXPct;
    startY.current = h * P.ballStartYPct;
    targetX.current = w * (0.72 + Math.random() * 0.18);
    targetY.current = h * (0.18 + Math.random() * 0.28);
    if (mode === 'obstaclePass') {
      obstacleX.current = w * (0.42 + Math.random() * 0.16);
      obstacleY.current = h * (0.38 + Math.random() * 0.2);
    }
    ballX.value = startX.current;
    ballY.value = startY.current;
    targetScale.value = 1;
  }, [ballX, ballY, mode, targetScale]);

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

  const resetBall = useCallback(() => {
    ballX.value = withSpring(startX.current, { damping: 14, stiffness: 160 });
    ballY.value = withSpring(startY.current, { damping: 14, stiffness: 160 });
    ballScale.value = withTiming(1, { duration: 120 });
  }, [ballScale, ballX, ballY]);

  const showWarn = useCallback(
    (msg: string) => {
      playWarn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      speakTTS(msg, 0.78).catch(() => {});
    },
    [playWarn],
  );

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
    targetScale.value = withSequence(withTiming(1.25, { duration: 140 }), withTiming(1, { duration: 140 }));
    bumpScore();
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, targetScale]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    layoutRound();
    setStatusHint('Drag across the midline!');
    speakTTS(ttsDrag, 0.78).catch(() => {});
  }, [layoutRound, ttsDrag]);

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
    .onBegin(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      ballScale.value = withTiming(1.15, { duration: 100 });
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      ballX.value = Math.max(BALL_HALF, Math.min(playW.current - BALL_HALF, e.x));
      ballY.value = Math.max(BALL_HALF, Math.min(playH.current - BALL_HALF, e.y));
    })
    .onEnd(() => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      ballScale.value = withTiming(1, { duration: 100 });

      if (mode === 'obstaclePass') {
        const hitObstacle = distPx(ballX.value, ballY.value, obstacleX.current, obstacleY.current) <= P.obstacleRadiusPx;
        if (hitObstacle) {
          showWarn(ttsObstacle);
          resetBall();
          return;
        }
      }

      const hitTarget = distPx(ballX.value, ballY.value, targetX.current, targetY.current) <= P.matchTolerancePx;
      if (hitTarget) {
        completeRound();
        return;
      }
      showWarn(ttsMiss);
      resetBall();
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
            playH.current = e.nativeEvent.layout.height;
            layoutRound();
          }}
        >
          {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

          {roundActive && (
            <>
              <View style={[styles.midline, { backgroundColor: T.midlineColor }]} />
              <View style={[styles.startZone, { borderColor: T.accent }]}>
                <Text style={[styles.zoneLabel, { color: T.accentDark }]}>START</Text>
              </View>
              <Animated.View
                style={[
                  styles.target,
                  targetStyle,
                  { left: targetPos.x - 40, top: targetPos.y - 40, borderColor: T.accent },
                ]}
              >
                <Text style={styles.targetEmoji}>{T.targetEmoji}</Text>
              </Animated.View>
              {mode === 'obstaclePass' && (
                <View
                  style={[
                    styles.obstacle,
                    {
                      left: obstaclePos.x - P.obstacleRadiusPx,
                      top: obstaclePos.y - P.obstacleRadiusPx,
                      width: P.obstacleRadiusPx * 2,
                      height: P.obstacleRadiusPx * 2,
                    },
                  ]}
                >
                  <Text style={styles.obstacleEmoji}>{T.obstacleEmoji}</Text>
                </View>
              )}
              <Animated.View style={[styles.ball, ballStyle]}>
                <Text style={styles.ballEmoji}>{T.ballEmoji}</Text>
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
  midline: { position: 'absolute', left: '50%', top: 12, bottom: 12, width: 3, marginLeft: -1.5, borderRadius: 2 },
  startZone: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneLabel: { fontSize: 10, fontWeight: '800' },
  target: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetEmoji: { fontSize: 36 },
  obstacle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(239,68,68,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  obstacleEmoji: { fontSize: 36 },
  ball: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(245,158,11,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  ballEmoji: { fontSize: 32 },
});

export default MidlineDragPassGame;
