/**
 * OT Level 5 · Session 1 · Game 1 — Ball Chase
 * Dedicated stadium experience with bounce physics, countdown, and goal celebrations.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast } from '@/components/game/FX';
import {
  BALL_RADIUS,
  BallChaseHUD,
  BallChaseInfoScreen,
  GoalCelebration,
  KickoffBanner,
  RoundCountdown,
  SoccerBallView,
  StadiumBackdrop,
  type TrailPoint,
} from '@/components/game/occupational/level5/session1/ballChase/BallChaseVisuals';
import { BALL_CHASE_COPY as COPY } from '@/components/game/occupational/level5/session1/ballChase/ballChaseTheme';
import { distPx, randomInRange, useTraceSound } from '@/components/game/occupational/level5/session1/followUtils';
import { SESSION5_1_PACING as P } from '@/components/game/occupational/level5/session1/session1Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const HALF = BALL_RADIUS;
const TAP_TOLERANCE = Platform.OS === 'android' ? P.tapTolerancePx + 14 : P.tapTolerancePx;
const TRAIL_LEN = 5;

type Phase = 'countdown' | 'playing' | 'celebrating' | 'idle';

const BallChaseGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);

  const [showInfo, setShowInfo] = useState(true);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);

  const [phase, setPhase] = useState<Phase>('idle');
  const [ballPos, setBallPos] = useState({ x: 180, y: 200 });
  const [ballScale, setBallScale] = useState(1);
  const [ballRotation, setBallRotation] = useState(0);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [showGoalFx, setShowGoalFx] = useState(false);
  const [showMissToast, setShowMissToast] = useState(false);
  const [statusHint, setStatusHint] = useState('');

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const phaseRef = useRef<Phase>('idle');
  const roundCompleteRef = useRef(false);
  const moveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);
  const dirX = useRef(1);
  const dirY = useRef(1);
  const speedX = useRef(2);
  const speedY = useRef(2);
  const ballPosRef = useRef({ x: 180, y: 200 });
  const trailRef = useRef<TrailPoint[]>([]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const clearTimers = useCallback(() => {
    if (moveTimerRef.current) {
      clearInterval(moveTimerRef.current);
      moveTimerRef.current = null;
    }
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
  }, []);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.rounds;
      const xp = Math.round(finalScore * P.xpPerScore);
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      setPhase('idle');
      setShowCongratulations(true);
      speakTTS(COPY.ttsComplete, 0.78);
      recordGame(xp)
        .then(() =>
          logGameAndAward({
            type: COPY.logType,
            correct: finalScore,
            total,
            accuracy: (finalScore / total) * 100,
            xpAwarded: xp,
            skillTags: [...COPY.skillTags],
          }),
        )
        .then(() => router.setParams({ refreshStats: Date.now().toString() }))
        .catch(console.error);
    },
    [clearTimers, router],
  );

  const pushTrail = useCallback((x: number, y: number) => {
    const next: TrailPoint[] = [{ x, y, opacity: 1 }, ...trailRef.current].slice(0, TRAIL_LEN);
    next.forEach((pt, i) => {
      pt.opacity = 1 - i / TRAIL_LEN;
    });
    trailRef.current = next;
    setTrail([...next]);
  }, []);

  const layoutBall = useCallback(() => {
    const w = playW.current;
    const h = playH.current;
    const pad = HALF + 10;
    const x = randomInRange(pad, w - pad);
    const y = randomInRange(pad + 50, h - pad - 20);
    ballPosRef.current = { x, y };
    setBallPos({ x, y });
    setBallScale(1);
    setBallRotation(0);
    trailRef.current = [];
    setTrail([]);
    dirX.current = Math.random() > 0.5 ? 1 : -1;
    dirY.current = Math.random() > 0.5 ? 1 : -1;
    const boost = 1 + (roundRef.current - 1) * 0.07;
    speedX.current = randomInRange(P.bounceSpeedMin, P.bounceSpeedMax) * boost;
    speedY.current = randomInRange(P.bounceSpeedMin, P.bounceSpeedMax) * boost;
  }, []);

  const tickMove = useCallback(() => {
    if (phaseRef.current !== 'playing' || roundCompleteRef.current || doneRef.current) return;

    const w = playW.current;
    const h = playH.current;
    const pad = HALF;
    let nx = ballPosRef.current.x + speedX.current * dirX.current;
    let ny = ballPosRef.current.y + speedY.current * dirY.current;
    let bounced = false;

    if (nx <= pad || nx >= w - pad) {
      dirX.current *= -1;
      nx = Math.max(pad, Math.min(w - pad, nx));
      bounced = true;
      setBallScale(1.12);
      setTimeout(() => setBallScale(1), 90);
    }
    if (ny <= pad + 40 || ny >= h - pad - 8) {
      dirY.current *= -1;
      ny = Math.max(pad + 40, Math.min(h - pad - 8, ny));
      bounced = true;
      setBallScale(0.92);
      setTimeout(() => setBallScale(1), 90);
    }

    ballPosRef.current = { x: nx, y: ny };
    setBallPos({ x: nx, y: ny });
    setBallRotation((r) => r + speedX.current * dirX.current * 2.2);
    pushTrail(nx, ny);

    if (bounced) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
    }
  }, [pushTrail]);

  const startMovement = useCallback(() => {
    clearTimers();
    moveTimerRef.current = setInterval(tickMove, P.moveTickMs);
  }, [clearTimers, tickMove]);

  const beginPlaying = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setShowGoalFx(false);
    layoutBall();
    setPhase('playing');
    setStatusHint('Tap the ball to score!');
    speakTTS(COPY.ttsCue, 0.78).catch(() => {});
    startMovement();
  }, [layoutBall, startMovement]);

  const advanceRound = useCallback(() => {
    clearTimers();
    setPhase('idle');
    setShowGoalFx(false);
    roundCompleteRef.current = false;
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs + 200);
  }, [clearTimers, endGame]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    clearTimers();
    setPhase('celebrating');
    setShowGoalFx(true);
    setBallScale(1.35);
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(COPY.ttsSuccess, 0.85).catch(() => {});
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
    roundTimerRef.current = setTimeout(() => advanceRound(), 780);
  }, [advanceRound, clearTimers, playSuccess]);

  const startRoundSequence = useCallback(() => {
    if (doneRef.current) return;
    setPhase('countdown');
    setStatusHint('');
  }, []);

  useEffect(() => {
    if (showInfo || done) return;
    if (round === 1 && phase === 'idle' && !roundCompleteRef.current) {
      speakTTS(COPY.ttsIntro, 0.78).catch(() => {});
    }
    startRoundSequence();
    return clearTimers;
  }, [round, showInfo, done, startRoundSequence, clearTimers]);

  useEffect(
    () => () => {
      stopAllSpeech();
      cleanupSounds();
      clearTimers();
    },
    [clearTimers],
  );

  const handleTap = useCallback(
    (locationX: number, locationY: number) => {
      if (phaseRef.current !== 'playing' || roundCompleteRef.current || doneRef.current) return;
      const { x, y } = ballPosRef.current;
      if (distPx(locationX, locationY, x, y) <= TAP_TOLERANCE + HALF) {
        completeRound();
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        setShowMissToast(true);
        setTimeout(() => setShowMissToast(false), 700);
      }
    },
    [completeRound],
  );

  const handleExit = useCallback(() => {
    stopAllSpeech();
    cleanupSounds();
    clearTimers();
    onBack?.();
  }, [clearTimers, onBack]);

  if (showInfo) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <BallChaseInfoScreen
          onStart={() => setShowInfo(false)}
          onBack={handleExit}
        />
      </SafeAreaView>
    );
  }

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message={COPY.congratsMessage}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        xpAwarded={finalStats.xp}
        onContinue={() => {
          stopAllSpeech();
          cleanupSounds();
          onComplete ? onComplete() : onBack?.();
        }}
        onHome={handleExit}
      />
    );
  }

  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={handleExit} style={styles.backBtn} activeOpacity={0.85}>
        <Text style={styles.backText}>← Exit</Text>
      </TouchableOpacity>

      <BallChaseHUD
        round={round}
        totalRounds={P.rounds}
        score={score}
        hint={statusHint}
        showHint={phase === 'playing'}
      />

      <Pressable
        style={styles.pitch}
        onLayout={(e) => {
          playW.current = e.nativeEvent.layout.width;
          playH.current = e.nativeEvent.layout.height;
        }}
        onPress={(e) => handleTap(e.nativeEvent.locationX, e.nativeEvent.locationY)}
      >
        <StadiumBackdrop />

        {phase === 'idle' && round <= P.rounds && !done && (
          <KickoffBanner text={round === 1 ? 'Get ready…' : `Round ${round}`} />
        )}

        {(phase === 'playing' || phase === 'celebrating') && (
          <SoccerBallView
            x={ballPos.x}
            y={ballPos.y}
            scale={ballScale}
            rotation={ballRotation}
            trail={trail}
            showAimRing={phase === 'playing' && round <= 3}
          />
        )}

        <GoalCelebration visible={showGoalFx} x={ballPos.x} y={ballPos.y} />
        <ResultToast text="Keep your eyes on the ball!" type="bad" show={showMissToast} />

        {phase === 'countdown' && <RoundCountdown key={`cd-${round}`} onDone={beginPlaying} />}
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0369A1' },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 14,
    zIndex: 50,
    backgroundColor: 'rgba(15,23,42,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  backText: { color: '#F8FAFC', fontWeight: '800', fontSize: 14 },
  pitch: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
});

export default BallChaseGame;
