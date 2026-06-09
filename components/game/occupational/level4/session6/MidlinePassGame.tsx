/**
 * Shared hand-based midline pass core for OT Level 4 Session 6.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { useTraceSound } from '@/components/game/occupational/level4/session6/midlineUtils';
import { SESSION4_6_PACING } from '@/components/game/occupational/level4/session6/session6Pacing';
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

const P = SESSION4_6_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type MidlinePassMode = 'handPass' | 'throwCatch' | 'rhythmPass';
type BallState = 'left' | 'right' | 'moving' | 'throwing' | 'catching';

export type MidlinePassTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
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

export type MidlinePassGameConfig = {
  theme: MidlinePassTheme;
  mode: MidlinePassMode;
  ttsIntro: string;
  ttsComplete: string;
  ttsCue?: string;
  ttsSuccess?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const MidlinePassGame: React.FC<
  MidlinePassGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  ttsIntro,
  ttsComplete,
  ttsCue = 'Pass the ball across your body!',
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
  const passesNeeded = mode === 'rhythmPass' ? P.rhythmPassesPerRound : P.handPassesPerRound;

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [passCount, setPassCount] = useState(0);
  const [ballSide, setBallSide] = useState<'left' | 'right'>('left');
  const [ballState, setBallState] = useState<BallState>('left');

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const ballStateRef = useRef<BallState>('left');
  const passCountRef = useRef(0);
  const canInteractRef = useRef(true);
  const waitingBeatRef = useRef(false);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);

  const ballX = useSharedValue(90);
  const ballY = useSharedValue(200);
  const ballScale = useSharedValue(1);
  const ballRot = useSharedValue(0);
  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);
  const beatPulse = useSharedValue(0);

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
    left: ballX.value - 28,
    top: ballY.value - 28,
    transform: [{ scale: ballScale.value }, { rotate: `${ballRot.value}deg` }],
  }));

  const leftStyle = useAnimatedStyle(() => ({ transform: [{ scale: leftScale.value }] }));
  const rightStyle = useAnimatedStyle(() => ({ transform: [{ scale: rightScale.value }] }));
  const beatStyle = useAnimatedStyle(() => ({
    opacity: beatPulse.value,
    transform: [{ scale: 0.85 + beatPulse.value * 0.15 }],
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    cancelAnimation(ballX);
    cancelAnimation(ballY);
    cancelAnimation(ballRot);
  }, [ballX, ballRot, ballY]);

  const layoutBall = useCallback(
    (side: 'left' | 'right') => {
      const w = playW.current;
      const h = playH.current;
      const yPct = mode === 'throwCatch' ? P.throwYPct : P.ballYPct;
      ballX.value = side === 'left' ? w * P.leftXPct : w * P.rightXPct;
      ballY.value = h * yPct;
    },
    [ballX, ballY, mode],
  );

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
    canInteractRef.current = false;
    waitingBeatRef.current = false;
    clearTimers();
    bumpScore();
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, clearTimers]);

  const resetRoundState = useCallback(() => {
    passCountRef.current = 0;
    setPassCount(0);
    ballStateRef.current = 'left';
    setBallState('left');
    setBallSide('left');
    canInteractRef.current = true;
    waitingBeatRef.current = false;
    ballRot.value = 0;
    layoutBall('left');
    leftScale.value = withSpring(1.1);
    rightScale.value = withSpring(1);
  }, [ballRot, layoutBall, leftScale, rightScale]);

  const showWrong = useCallback(
    (msg: string) => {
      playWarn();
      speakTTS(msg, 0.78).catch(() => {});
    },
    [playWarn],
  );

  const afterPassLand = useCallback(
    (newSide: 'left' | 'right') => {
      ballStateRef.current = newSide;
      setBallState(newSide);
      setBallSide(newSide);
      canInteractRef.current = true;
      passCountRef.current += 1;
      setPassCount(passCountRef.current);

      if (passCountRef.current >= passesNeeded) {
        completeRound();
        return;
      }

      if (mode === 'rhythmPass') {
        roundTimerRef.current = setTimeout(() => triggerBeatRef.current(), P.rhythmBeatMs - P.passAnimMs);
      } else {
        setStatusHint(newSide === 'left' ? 'Tap LEFT to pass!' : 'Tap RIGHT to pass!');
        if (newSide === 'left') leftScale.value = withSequence(withSpring(1.15), withSpring(1));
        else rightScale.value = withSequence(withSpring(1.15), withSpring(1));
      }
    },
    [completeRound, leftScale, mode, passesNeeded, rightScale],
  );

  const animatePass = useCallback(
    (from: 'left' | 'right') => {
      canInteractRef.current = false;
      ballStateRef.current = 'moving';
      setBallState('moving');
      setStatusHint('Ball crossing midline…');
      const w = playW.current;
      const h = playH.current;
      const targetX = from === 'left' ? w * P.rightXPct : w * P.leftXPct;
      const y = h * P.ballYPct;
      if (from === 'left') leftScale.value = withSequence(withSpring(0.9), withSpring(1));
      else rightScale.value = withSequence(withSpring(0.9), withSpring(1));
      ballX.value = withTiming(targetX, { duration: P.passAnimMs });
      ballY.value = withTiming(y, { duration: P.passAnimMs });
      ballScale.value = withSequence(withTiming(1.15, { duration: 180 }), withTiming(1, { duration: 180 }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      roundTimerRef.current = setTimeout(() => afterPassLand(from === 'left' ? 'right' : 'left'), P.passAnimMs);
    },
    [afterPassLand, ballScale, ballX, ballY, leftScale, rightScale],
  );

  const triggerBeatRef = useRef<() => void>(() => {});

  const triggerBeat = useCallback(() => {
    if (doneRef.current || !roundActiveRef.current || roundCompleteRef.current) return;
    waitingBeatRef.current = true;
    canInteractRef.current = true;
    const side = ballStateRef.current === 'left' || ballStateRef.current === 'right' ? ballStateRef.current : 'left';
    setStatusHint(`Beat! Pass ${side.toUpperCase()}! (${passCountRef.current + 1}/${passesNeeded})`);
    beatPulse.value = withSequence(withTiming(1, { duration: 160 }), withTiming(0, { duration: 1200 }));
    if (side === 'left') leftScale.value = withSequence(withSpring(1.18), withSpring(1));
    else rightScale.value = withSequence(withSpring(1.18), withSpring(1));
    speakTTS('Pass on the beat!', 0.78).catch(() => {});
    roundTimerRef.current = setTimeout(() => {
      if (waitingBeatRef.current && roundActiveRef.current && !roundCompleteRef.current) {
        waitingBeatRef.current = false;
        playWarn();
        speakTTS('Missed the beat!', 0.78).catch(() => {});
        passCountRef.current = 0;
        setPassCount(0);
        ballStateRef.current = 'left';
        setBallState('left');
        setBallSide('left');
        layoutBall('left');
        roundTimerRef.current = setTimeout(() => triggerBeatRef.current(), 600);
      }
    }, P.rhythmBeatMs);
  }, [beatPulse, layoutBall, leftScale, passesNeeded, playWarn, rightScale]);

  triggerBeatRef.current = triggerBeat;

  const startThrowCatch = useCallback(() => {
    if (doneRef.current) return;
    ballStateRef.current = 'left';
    setBallState('left');
    setBallSide('left');
    canInteractRef.current = true;
    setStatusHint('Tap LEFT to throw!');
    layoutBall('left');
    leftScale.value = withSpring(1.12);
  }, [layoutBall, leftScale]);

  const throwBall = useCallback(() => {
    if (!canInteractRef.current || ballStateRef.current !== 'left') return;
    canInteractRef.current = false;
    ballStateRef.current = 'throwing';
    setBallState('throwing');
    setStatusHint('Ball flying…');
    const w = playW.current;
    const h = playH.current;
    const targetX = w * P.rightXPct;
    const midY = h * 0.22;
    const endY = h * P.throwYPct;
    leftScale.value = withSequence(withSpring(0.88), withSpring(1));
    ballX.value = withTiming(targetX, { duration: P.throwDurationMs });
    ballY.value = withSequence(
      withTiming(midY, { duration: P.throwDurationMs / 2 }),
      withTiming(endY, { duration: P.throwDurationMs / 2 }),
    );
    ballRot.value = withTiming(360, { duration: P.throwDurationMs });
    speakTTS('Throw!', 0.78).catch(() => {});
    roundTimerRef.current = setTimeout(() => {
      ballStateRef.current = 'catching';
      setBallState('catching');
      canInteractRef.current = true;
      setStatusHint('Tap RIGHT to catch!');
      rightScale.value = withSequence(withSpring(1.2), withSpring(1.05));
      speakTTS('Catch with your right hand!', 0.78).catch(() => {});
      roundTimerRef.current = setTimeout(() => {
        if (ballStateRef.current === 'catching') {
          playWarn();
          speakTTS('Missed! Try again!', 0.78).catch(() => {});
          startThrowCatch();
        }
      }, P.catchWindowMs);
    }, P.throwDurationMs);
  }, [ballRot, ballX, ballY, leftScale, playWarn, rightScale, startThrowCatch]);

  const catchBall = useCallback(() => {
    if (!canInteractRef.current || ballStateRef.current !== 'catching') return;
    clearTimers();
    canInteractRef.current = false;
    ballStateRef.current = 'right';
    setBallState('right');
    rightScale.value = withSequence(withSpring(1.2), withSpring(1));
    completeRound();
  }, [clearTimers, completeRound, rightScale]);

  const handleHand = useCallback(
    (hand: 'left' | 'right') => {
      if (!roundActiveRef.current || doneRef.current || roundCompleteRef.current) return;

      if (mode === 'throwCatch') {
        if (hand === 'left' && ballStateRef.current === 'left') throwBall();
        else if (hand === 'right' && ballStateRef.current === 'catching') catchBall();
        else if (ballStateRef.current === 'catching' && hand === 'left') {
          showWrong('Wait for the ball!');
        }
        return;
      }

      const current = ballStateRef.current;
      if (current !== 'left' && current !== 'right') return;
      if (!canInteractRef.current) return;
      if (mode === 'rhythmPass' && !waitingBeatRef.current) return;

      if (current !== hand) {
        playWarn();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speakTTS(`Ball is on the ${current} side!`, 0.78).catch(() => {});
        return;
      }

      if (mode === 'rhythmPass') {
        waitingBeatRef.current = false;
        clearTimers();
      }
      animatePass(hand);
    },
    [animatePass, catchBall, clearTimers, mode, playWarn, showWrong, throwBall],
  );

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    resetRoundState();
    if (mode === 'throwCatch') {
      speakTTS(ttsCue, 0.78).catch(() => {});
      startThrowCatch();
    } else if (mode === 'rhythmPass') {
      speakTTS(ttsCue, 0.78).catch(() => {});
      roundTimerRef.current = setTimeout(() => triggerBeatRef.current(), 450);
    } else {
      setStatusHint('Tap LEFT to pass!');
      speakTTS(ttsCue, 0.78).catch(() => {});
    }
  }, [mode, resetRoundState, startThrowCatch, ttsCue]);

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

  const showBallOnHand = mode !== 'throwCatch' || ballState === 'left';
  const showFlyingBall =
    mode === 'throwCatch'
      ? ballState === 'throwing' || ballState === 'catching'
      : ballState === 'moving';

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
        {mode === 'rhythmPass' && roundActive && (
          <Text style={[styles.stepText, { color: T.subtitleColor }]}>
            Passes {passCount}/{passesNeeded}
          </Text>
        )}
      </View>

      <View
        style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
        onLayout={(e) => {
          playW.current = e.nativeEvent.layout.width;
          playH.current = e.nativeEvent.layout.height;
          layoutBall(ballSide);
        }}
      >
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

        {mode === 'rhythmPass' && roundActive && (
          <Animated.View style={[styles.beatBadge, beatStyle]}>
            <Text style={styles.beatText}>🎵 BEAT</Text>
          </Animated.View>
        )}

        {roundActive && (
          <View style={styles.handsRow}>
            <TouchableOpacity onPress={() => handleHand('left')} activeOpacity={0.85}>
              <Animated.View style={[styles.hand, styles.leftHand, leftStyle]}>
                <Text style={styles.handEmoji}>👈</Text>
                <Text style={styles.handLabel}>{mode === 'throwCatch' ? 'THROW' : 'LEFT'}</Text>
                {showBallOnHand && ballSide === 'left' && ballStateRef.current === 'left' && (
                  <View style={styles.ballBadge}>
                    <Text style={styles.ballBadgeEmoji}>{T.ballEmoji}</Text>
                  </View>
                )}
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.midline} />

            <TouchableOpacity onPress={() => handleHand('right')} activeOpacity={0.85}>
              <Animated.View style={[styles.hand, styles.rightHand, rightStyle]}>
                <Text style={styles.handEmoji}>👉</Text>
                <Text style={styles.handLabel}>{mode === 'throwCatch' ? 'CATCH' : 'RIGHT'}</Text>
                {ballSide === 'right' && ballState === 'right' && (
                  <View style={styles.ballBadge}>
                    <Text style={styles.ballBadgeEmoji}>{T.ballEmoji}</Text>
                  </View>
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}

        {roundActive && showFlyingBall && (
          <Animated.View pointerEvents="none" style={[styles.ball, ballStyle]}>
            <Text style={styles.ballEmoji}>{T.ballEmoji}</Text>
          </Animated.View>
        )}

        <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
      </View>
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
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  stepText: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, justifyContent: 'center' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  beatBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(139,92,246,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    zIndex: 3,
  },
  beatText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  handsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 12 },
  midline: { width: 3, height: 100, backgroundColor: 'rgba(148,163,184,0.45)', borderRadius: 2 },
  hand: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftHand: { backgroundColor: '#3B82F6' },
  rightHand: { backgroundColor: '#EF4444' },
  handEmoji: { fontSize: 40, marginBottom: 2 },
  handLabel: { fontSize: 10, fontWeight: '800', color: '#fff' },
  ballBadge: {
    position: 'absolute',
    top: -10,
    right: -6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballBadgeEmoji: { fontSize: 16 },
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

export default MidlinePassGame;
