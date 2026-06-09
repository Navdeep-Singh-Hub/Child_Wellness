/**
 * Ping-pong ball side tap core for OT Level 4 Session 8.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { Side, randomSide, useTraceSound } from '@/components/game/occupational/level4/session8/sideTapUtils';
import { SESSION4_8_PACING } from '@/components/game/occupational/level4/session8/session8Pacing';
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

const P = SESSION4_8_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');
const BALL_HALF = 36;

export type SidePingPongTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  leftColor: string;
  rightColor: string;
  ballEmoji: string;
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
};

export type SidePingPongGameConfig = {
  theme: SidePingPongTheme;
  ttsIntro: string;
  ttsComplete: string;
  ttsCue?: string;
  ttsSuccess?: string;
  ttsMiss?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const SidePingPongGame: React.FC<
  SidePingPongGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  ttsIntro,
  ttsComplete,
  ttsCue = 'Tap when the ball reaches the center!',
  ttsSuccess = 'Great tap!',
  ttsMiss = 'Wait for the ball at center!',
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
  const [ballVisible, setBallVisible] = useState(false);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const canTapRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);

  const ballX = useSharedValue(180);
  const ballY = useSharedValue(160);
  const ballScale = useSharedValue(1);
  const ballOpacity = useSharedValue(0);
  const leftScale = useSharedValue(1);
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

  const ballStyle = useAnimatedStyle(() => ({
    left: ballX.value - BALL_HALF,
    top: ballY.value - BALL_HALF,
    opacity: ballOpacity.value,
    transform: [{ scale: ballScale.value }],
  }));
  const leftStyle = useAnimatedStyle(() => ({ transform: [{ scale: leftScale.value }] }));
  const rightStyle = useAnimatedStyle(() => ({ transform: [{ scale: rightScale.value }] }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    cancelAnimation(ballX);
    cancelAnimation(ballOpacity);
    cancelAnimation(ballScale);
  }, [ballOpacity, ballScale, ballX]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.pingPongRounds;
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
    setBallVisible(false);
    roundCompleteRef.current = false;
    if (roundRef.current >= P.pingPongRounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    canTapRef.current = false;
    clearTimers();
    ballScale.value = withSequence(withTiming(1.4, { duration: 120 }), withTiming(0, { duration: 200 }));
    ballOpacity.value = withTiming(0, { duration: 200 });
    setBallVisible(false);
    bumpScore();
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, ballOpacity, ballScale, bumpScore, clearTimers]);

  const missRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    canTapRef.current = false;
    clearTimers();
    showWarn('Missed! Try again!');
    ballOpacity.value = withTiming(0, { duration: 160 });
    setBallVisible(false);
    roundTimerRef.current = setTimeout(() => advanceRound(), 500);
  }, [advanceRound, ballOpacity, clearTimers, showWarn]);

  const launchBall = useCallback(() => {
    const w = playW.current;
    const h = playH.current;
    const startSide: Side = randomSide();
    const y = h * 0.38;
    const startX = startSide === 'left' ? w + BALL_HALF : -BALL_HALF;
    const endX = startSide === 'left' ? -BALL_HALF : w + BALL_HALF;
    ballX.value = startX;
    ballY.value = y;
    ballScale.value = 1;
    ballOpacity.value = withTiming(1, { duration: 180 });
    setBallVisible(true);
    canTapRef.current = true;
    roundCompleteRef.current = false;
    setStatusHint('Tap when ball hits center!');
    speakTTS(`Ball from ${startSide}! Tap at center!`, 0.78).catch(() => {});
    ballX.value = withTiming(endX, { duration: P.pingPongDurationMs });
    roundTimerRef.current = setTimeout(() => missRound(), P.pingPongDurationMs + 80);
  }, [ballOpacity, ballScale, ballX, ballY, missRound]);

  const handleTap = useCallback(() => {
    if (!roundActiveRef.current || !canTapRef.current || roundCompleteRef.current || doneRef.current) return;
    if (!ballVisible) return;
    const w = playW.current;
    const center = w * 0.5;
    const tolerance = w * P.pingPongCenterTolerancePct;
    if (Math.abs(ballX.value - center) <= tolerance) {
      completeRound();
    } else {
      showWarn(ttsMiss);
      ballScale.value = withSequence(withTiming(0.9, { duration: 80 }), withTiming(1, { duration: 80 }));
    }
  }, [ballScale, ballVisible, ballX, completeRound, showWarn, ttsMiss]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    setRoundActive(true);
    speakTTS(ttsCue, 0.78).catch(() => {});
    launchBall();
  }, [launchBall, ttsCue]);

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
              {round}/{P.pingPongRounds}
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

      <TouchableOpacity
        activeOpacity={1}
        onPress={handleTap}
        style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
        onLayout={(e) => {
          playW.current = e.nativeEvent.layout.width;
          playH.current = e.nativeEvent.layout.height;
        }}
      >
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

        {roundActive && (
          <View style={[styles.centerZone, { borderColor: T.accent }]}>
            <Text style={[styles.centerLabel, { color: T.accentDark }]}>TAP</Text>
          </View>
        )}

        {roundActive && ballVisible && (
          <Animated.View pointerEvents="none" style={[styles.ball, ballStyle]}>
            <Text style={styles.ballEmoji}>{T.ballEmoji}</Text>
          </Animated.View>
        )}

        {roundActive && (
          <View style={styles.sidesRow}>
            <Animated.View style={[styles.paddle, { backgroundColor: T.leftColor }, leftStyle]}>
              <Text style={styles.paddleEmoji}>🏓</Text>
            </Animated.View>
            <Animated.View style={[styles.paddle, { backgroundColor: T.rightColor }, rightStyle]}>
              <Text style={styles.paddleEmoji}>🏓</Text>
            </Animated.View>
          </View>
        )}

        <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
      </TouchableOpacity>
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
  waitText: { position: 'absolute', alignSelf: 'center', top: '42%', fontSize: 18, fontWeight: '700' },
  centerZone: {
    position: 'absolute',
    alignSelf: 'center',
    top: '36%',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  centerLabel: { fontSize: 12, fontWeight: '900' },
  ball: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(245,158,11,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  ballEmoji: { fontSize: 36 },
  sidesRow: { position: 'absolute', bottom: 20, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  paddle: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  paddleEmoji: { fontSize: 28 },
});

export default SidePingPongGame;
