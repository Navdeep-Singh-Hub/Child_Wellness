/**
 * Ping-pong ball side tap core for OT Level 4 Session 8.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast, SparkleBurst } from '@/components/game/FX';
import { RallyTapPlayArea } from '@/components/game/occupational/level4/session8/RallyTapPlayArea';
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
  ttsEarly?: string;
  ttsRetry?: string;
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
  ttsEarly = 'Too early! Wait for center…',
  ttsRetry = 'Missed! Try again!',
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
  const [successToast, setSuccessToast] = useState(false);
  const [kickOffVisible, setKickOffVisible] = useState(false);
  const [warnVisible, setWarnVisible] = useState(false);
  const [warnMessage, setWarnMessage] = useState('Try again!');
  const [rallyKey, setRallyKey] = useState(0);
  const [centerReady, setCenterReady] = useState(false);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const canTapRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kickOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const centerTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const launchTimeRef = useRef(0);
  const launchBallRef = useRef<() => void>(() => {});
  const startRoundPlayRef = useRef<() => void>(() => {});

  const playW = useRef(360);
  const playH = useRef(400);

  const ballX = useSharedValue(180);
  const ballY = useSharedValue(160);
  const ballScale = useSharedValue(1);
  const ballOpacity = useSharedValue(0);
  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);
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

  const ballStyle = useAnimatedStyle(() => ({
    left: ballX.value - BALL_HALF,
    top: ballY.value - BALL_HALF,
    opacity: ballOpacity.value,
    transform: [{ scale: ballScale.value }],
  }));
  const leftStyle = useAnimatedStyle(() => ({ transform: [{ scale: leftScale.value }] }));
  const rightStyle = useAnimatedStyle(() => ({ transform: [{ scale: rightScale.value }] }));
  const playShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playShake.value }],
  }));
  const kickOffStyle = useAnimatedStyle(() => ({
    opacity: kickOffOpacity.value,
    transform: [{ scale: 0.9 + kickOffOpacity.value * 0.1 }],
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    if (kickOffTimerRef.current) {
      clearTimeout(kickOffTimerRef.current);
      kickOffTimerRef.current = null;
    }
    centerTimersRef.current.forEach((t) => clearTimeout(t));
    centerTimersRef.current = [];
    cancelAnimation(ballX);
    cancelAnimation(ballOpacity);
    cancelAnimation(ballScale);
    cancelAnimation(playShake);
    cancelAnimation(kickOffOpacity);
  }, [ballOpacity, ballScale, ballX, kickOffOpacity, playShake]);

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
      setWarnMessage(msg);
      setWarnVisible(true);
      playShake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      toastTimerRef.current = setTimeout(() => setWarnVisible(false), 1200);
    },
    [playShake, playWarn],
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
    setCenterReady(false);
    clearTimers();
    ballScale.value = withSequence(withTiming(1.4, { duration: 120 }), withTiming(0, { duration: 200 }));
    ballOpacity.value = withTiming(0, { duration: 200 });
    setBallVisible(false);
    bumpScore();
    setSuccessToast(true);
    setRallyKey(Date.now());
    toastTimerRef.current = setTimeout(() => setSuccessToast(false), 900);
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, ballOpacity, ballScale, bumpScore, clearTimers]);

  const missRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    canTapRef.current = false;
    setCenterReady(false);
    clearTimers();
    showWarn(ttsRetry);
    ballOpacity.value = withTiming(0, { duration: 160 });
    setBallVisible(false);
    roundTimerRef.current = setTimeout(() => launchBallRef.current(), 700);
  }, [ballOpacity, clearTimers, showWarn, ttsRetry]);

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
    setCenterReady(false);
    launchTimeRef.current = Date.now();
    setStatusHint('Watch the ball cross the court…');
    ballX.value = withTiming(endX, { duration: P.pingPongDurationMs });
    const centerAt = P.pingPongDurationMs / 2;
    centerTimersRef.current.push(
      setTimeout(() => {
        setCenterReady(true);
        setStatusHint('TAP NOW — ball at center!');
      }, Math.max(0, centerAt - P.pingPongCenterWindowMs)),
    );
    centerTimersRef.current.push(setTimeout(() => setCenterReady(false), centerAt + P.pingPongCenterWindowMs));
    roundTimerRef.current = setTimeout(() => missRound(), P.pingPongDurationMs + 250);
  }, [ballOpacity, ballScale, ballX, ballY, missRound]);

  launchBallRef.current = launchBall;

  const handleTap = useCallback(() => {
    if (!roundActiveRef.current || !canTapRef.current || roundCompleteRef.current || doneRef.current) return;
    if (!ballVisible) return;
    const elapsed = Date.now() - launchTimeRef.current;
    const centerAt = P.pingPongDurationMs / 2;
    const inWindow = Math.abs(elapsed - centerAt) <= P.pingPongCenterWindowMs;
    if (inWindow) {
      completeRound();
      return;
    }
    if (elapsed < centerAt - P.pingPongCenterWindowMs) {
      showWarn(ttsEarly);
    } else {
      showWarn(ttsMiss);
    }
    ballScale.value = withSequence(withTiming(0.9, { duration: 80 }), withTiming(1, { duration: 80 }));
  }, [ballScale, ballVisible, completeRound, showWarn, ttsEarly, ttsMiss]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    setRoundActive(true);
    setSuccessToast(false);
    setWarnVisible(false);
    setKickOffVisible(true);
    kickOffOpacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(1, { duration: 700 }),
      withTiming(0, { duration: 350 }),
    );
    kickOffTimerRef.current = setTimeout(() => setKickOffVisible(false), 1300);
    if (roundRef.current === 1) {
      speakTTS(ttsCue, 0.78).catch(() => {});
    }
    launchBall();
  }, [kickOffOpacity, launchBall, ttsCue]);

  startRoundPlayRef.current = startRoundPlay;

  useEffect(() => {
    if (round === 1) speakTTS(ttsIntro, 0.78);
    clearTimers();
    setRoundActive(false);
    setCenterReady(false);
    roundTimerRef.current = setTimeout(() => startRoundPlayRef.current(), P.roundStartDelayMs);
    return clearTimers;
  }, [round, ttsIntro, clearTimers]);

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
        <View style={[styles.roundTrack, { borderColor: T.accent }]}>
          <View style={[styles.roundFill, { width: `${(round / P.pingPongRounds) * 100}%`, backgroundColor: T.accent }]} />
        </View>
        <View style={styles.headerDeco}>
          <Text style={styles.decoEmoji}>🏓</Text>
          <Text style={[styles.decoArrow, { color: T.accent }]}>→</Text>
          <Text style={styles.decoEmoji}>🎯</Text>
        </View>
      </View>

      <Animated.View style={[styles.playAreaWrap, playShakeStyle]}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleTap}
          style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }, styles.playAreaThemed]}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
          }}
        >
          {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

          <RallyTapPlayArea
            roundActive={roundActive}
            showGuide={round <= 2}
            rallyKey={rallyKey}
            centerReady={centerReady}
            ballVisible={ballVisible}
          />

          {roundActive && (
            <View
              style={[
                styles.centerZone,
                centerReady && styles.centerZoneReady,
                {
                  borderColor: centerReady ? T.accent : 'rgba(74,222,128,0.35)',
                  backgroundColor: centerReady ? 'rgba(74,222,128,0.35)' : 'rgba(5,46,22,0.55)',
                  borderWidth: centerReady ? 4 : 2,
                },
              ]}
            >
              <Text style={[styles.centerLabel, { color: centerReady ? '#F0FDF4' : T.accentDark }]}>
                {centerReady ? 'TAP!' : 'TAP'}
              </Text>
            </View>
          )}

          {roundActive && ballVisible && (
            <Animated.View pointerEvents="none" style={[styles.ball, styles.rallyBall, ballStyle]}>
              <Text style={styles.ballEmoji}>{T.ballEmoji}</Text>
            </Animated.View>
          )}

          {roundActive && (
            <View style={styles.sidesRow}>
              <Animated.View style={[styles.paddle, styles.rallyPaddle, { backgroundColor: T.leftColor }, leftStyle]}>
                <Text style={styles.paddleEmoji}>🏓</Text>
              </Animated.View>
              <Animated.View style={[styles.paddle, styles.rallyPaddle, { backgroundColor: T.rightColor }, rightStyle]}>
                <Text style={styles.paddleEmoji}>🏓</Text>
              </Animated.View>
            </View>
          )}

          {kickOffVisible ? (
            <Animated.View style={[styles.kickOffBanner, kickOffStyle]} pointerEvents="none">
              <Text style={styles.kickOffText}>🏓 RALLY TAP!</Text>
            </Animated.View>
          ) : null}

          <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} count={16} size={8} />
          <ResultToast text="RALLY!" type="ok" show={successToast} />
        </TouchableOpacity>
      </Animated.View>

      {warnVisible && (
        <View style={styles.rallyWarnPill}>
          <Text style={styles.rallyWarnText}>{warnMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(5,46,22,0.75)', borderRadius: 24, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(5,46,22,0.55)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  roundTrack: {
    width: '70%',
    height: 8,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: 'rgba(5,46,22,0.55)',
  },
  roundFill: { height: '100%', borderRadius: 6 },
  headerDeco: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  decoEmoji: { fontSize: 20 },
  decoArrow: { fontSize: 18, fontWeight: '900' },
  playAreaWrap: { flex: 1 },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  playAreaThemed: { borderWidth: 2 },
  waitText: { position: 'absolute', alignSelf: 'center', top: '42%', fontSize: 18, fontWeight: '700', zIndex: 2 },
  centerZone: {
    position: 'absolute',
    alignSelf: 'center',
    top: '34%',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  centerZoneReady: {
    shadowColor: '#4ADE80',
    shadowOpacity: 0.65,
    shadowRadius: 14,
    elevation: 10,
  },
  centerLabel: { fontSize: 14, fontWeight: '900' },
  ball: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(245,158,11,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
  },
  rallyBall: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 2,
    borderColor: '#4ADE80',
    shadowColor: '#4ADE80',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  ballEmoji: { fontSize: 36 },
  sidesRow: { position: 'absolute', bottom: 20, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', zIndex: 4 },
  paddle: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rallyPaddle: {
    borderWidth: 2,
    borderColor: 'rgba(187,247,208,0.45)',
    shadowColor: '#4ADE80',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  paddleEmoji: { fontSize: 28 },
  kickOffBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '12%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(5,46,22,0.92)',
    borderWidth: 2,
    borderColor: '#4ADE80',
    zIndex: 8,
  },
  kickOffText: { fontSize: 22, fontWeight: '900', color: '#BBF7D0', letterSpacing: 1 },
  rallyWarnPill: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(5,46,22,0.92)',
    borderWidth: 1,
    borderColor: '#4ADE80',
  },
  rallyWarnText: { fontSize: 14, fontWeight: '800', color: '#BBF7D0', textAlign: 'center' },
});

export default SidePingPongGame;
