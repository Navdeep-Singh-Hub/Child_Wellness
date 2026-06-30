/**
 * OT Level 5 · Session 3 · Game 3 — Comet Chase
 * Figure-8 drag pursuit through a cosmic night sky.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import {
  CometCelebration,
  CometChaseHUD,
  CometChaseInfoScreen,
  CometFigure,
  CosmicBackdrop,
  Figure8Path,
  GravityTether,
  OrbitCountdown,
  OrbitLockMeter,
  StardustPuck,
  StardustTrail,
  type DustPoint,
} from '@/components/game/occupational/level5/session3/cometChase/CometChaseVisuals';
import { COMET_CHASE_COPY as COPY } from '@/components/game/occupational/level5/session3/cometChase/cometChaseTheme';
import { distPx, useTraceSound } from '@/components/game/occupational/level5/session1/followUtils';
import { SESSION5_3_PACING as P } from '@/components/game/occupational/level5/session3/session3Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const HALF = P.targetHalfPx;
const FINGER = P.fingerHalfPx;
const DUST_LEN = 10;

const CometChaseGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({
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

  const [phase, setPhase] = useState<'countdown' | 'playing' | 'idle'>('idle');
  const [followProgress, setFollowProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [dust, setDust] = useState<DustPoint[]>([]);

  const [cometPos, setCometPos] = useState({ x: 180, y: 200 });
  const [fingerPos, setFingerPos] = useState({ x: 180, y: 280 });
  const [cometAngle, setCometAngle] = useState(-30);
  const [playSize, setPlaySize] = useState({ w: 360, h: 400 });

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const activeRef = useRef(false);
  const completeRef = useRef(false);
  const followingRef = useRef(false);
  const followStartRef = useRef<number | null>(null);
  const moveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);
  const timeRef = useRef(0);
  const cometPosRef = useRef({ x: 180, y: 200 });
  const fingerPosRef = useRef({ x: 180, y: 280 });
  const dustRef = useRef<DustPoint[]>([]);
  const prevCometRef = useRef({ x: 180, y: 200 });

  useEffect(() => {
    scoreRef.current = score;
    roundRef.current = round;
  }, [score, round]);

  const pushDust = useCallback((x: number, y: number) => {
    const next: DustPoint[] = [{ x, y, opacity: 1 }, ...dustRef.current].slice(0, DUST_LEN);
    next.forEach((pt, i) => {
      pt.opacity = 1 - i / DUST_LEN;
    });
    dustRef.current = next;
    setDust([...next]);
  }, []);

  const clearTimers = useCallback(() => {
    if (moveTimerRef.current) {
      clearInterval(moveTimerRef.current);
      moveTimerRef.current = null;
    }
    if (checkTimerRef.current) {
      clearInterval(checkTimerRef.current);
      checkTimerRef.current = null;
    }
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
  }, []);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.rounds;
      const xp = finalScore * P.xpPerScore;
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      activeRef.current = false;
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

  const advanceRound = useCallback(() => {
    clearTimers();
    activeRef.current = false;
    completeRef.current = false;
    followingRef.current = false;
    followStartRef.current = null;
    setFollowProgress(0);
    setIsLocked(false);
    setShowCelebrate(false);
    dustRef.current = [];
    setDust([]);
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    setPhase('idle');
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame]);

  const completeRound = useCallback(() => {
    if (completeRef.current || doneRef.current) return;
    completeRef.current = true;
    clearTimers();
    setShowCelebrate(true);
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(COPY.ttsSuccess, 0.85).catch(() => {});
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
    roundTimerRef.current = setTimeout(() => advanceRound(), 900);
  }, [advanceRound, clearTimers, playSuccess]);

  const tickComet = useCallback(() => {
    if (!activeRef.current || completeRef.current) return;
    timeRef.current += P.moveTickMs / 1000;
    const w = playW.current;
    const h = playH.current;
    const cx = w * 0.5;
    const cy = h * 0.45;
    const r = Math.min(w, h) * 0.22;
    const speedBoost = 1 + (roundRef.current - 1) * 0.04;
    const t = timeRef.current * speedBoost;
    const nx = cx + Math.sin(t * 0.7) * r;
    const ny = cy + Math.sin(t * 1.4) * r * 0.55;

    const prev = prevCometRef.current;
    const angle = (Math.atan2(ny - prev.y, nx - prev.x) * 180) / Math.PI;
    prevCometRef.current = { x: nx, y: ny };

    cometPosRef.current = { x: nx, y: ny };
    setCometPos({ x: nx, y: ny });
    setCometAngle(angle);
    pushDust(nx - HALF, ny);
  }, [pushDust]);

  const checkLock = useCallback(() => {
    if (!activeRef.current || completeRef.current || doneRef.current) return;
    const d = distPx(
      fingerPosRef.current.x,
      fingerPosRef.current.y,
      cometPosRef.current.x,
      cometPosRef.current.y,
    );
    if (d <= P.followDistancePx) {
      if (!followingRef.current) {
        followingRef.current = true;
        followStartRef.current = Date.now();
        setIsLocked(true);
        setStatusHint(COPY.progressHint);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } else {
        const elapsed = Date.now() - (followStartRef.current ?? Date.now());
        const prog = Math.min(100, Math.round((elapsed / P.followHoldMs) * 100));
        setFollowProgress(prog);
        if (elapsed >= P.followHoldMs) completeRound();
      }
    } else {
      if (followingRef.current) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
        speakTTS(COPY.ttsLost, 0.75).catch(() => {});
      }
      followingRef.current = false;
      followStartRef.current = null;
      setIsLocked(false);
      setFollowProgress(0);
      setStatusHint(COPY.lostHint);
    }
  }, [completeRound]);

  const startPlaying = useCallback(() => {
    if (doneRef.current) return;
    completeRef.current = false;
    followingRef.current = false;
    followStartRef.current = null;
    setFollowProgress(0);
    setIsLocked(false);
    setShowCelebrate(false);
    activeRef.current = true;
    setPhase('playing');
    timeRef.current = 0;
    const w = playW.current;
    const h = playH.current;
    const startX = w * 0.5;
    const startY = h * 0.45;
    cometPosRef.current = { x: startX, y: startY };
    fingerPosRef.current = { x: startX, y: h * 0.72 };
    prevCometRef.current = { x: startX, y: startY };
    setCometPos({ x: startX, y: startY });
    setFingerPos({ x: startX, y: h * 0.72 });
    setCometAngle(-30);
    dustRef.current = [];
    setDust([]);
    setStatusHint(COPY.followHint);
    speakTTS(COPY.ttsCue, 0.78).catch(() => {});
    moveTimerRef.current = setInterval(tickComet, P.moveTickMs);
    checkTimerRef.current = setInterval(checkLock, 80);
  }, [checkLock, tickComet]);

  useEffect(() => {
    if (showInfo || done) return;
    if (round === 1) speakTTS(COPY.ttsIntro, 0.78).catch(() => {});
    setPhase('countdown');
  }, [round, showInfo, done]);

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
      if (!activeRef.current || completeRef.current || doneRef.current) return;
      const nx = Math.max(FINGER, Math.min(playW.current - FINGER, e.x));
      const ny = Math.max(FINGER, Math.min(playH.current - FINGER, e.y));
      fingerPosRef.current = { x: nx, y: ny };
      setFingerPos({ x: nx, y: ny });
    });

  const handleExit = useCallback(() => {
    stopAllSpeech();
    cleanupSounds();
    clearTimers();
    onBack?.();
  }, [clearTimers, onBack]);

  if (showInfo) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <CometChaseInfoScreen onStart={() => setShowInfo(false)} onBack={handleExit} />
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

  const lockDist = distPx(fingerPos.x, fingerPos.y, cometPos.x, cometPos.y);
  const showTether = phase === 'playing' && lockDist <= P.followDistancePx + 24;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={handleExit} style={styles.backBtn} activeOpacity={0.85}>
        <Text style={styles.backText}>← Exit</Text>
      </TouchableOpacity>

      <CometChaseHUD
        round={round}
        totalRounds={P.rounds}
        score={score}
        hint={statusHint}
        showHint={phase === 'playing'}
        followProgress={followProgress}
        isLocked={isLocked}
      />

      <GestureDetector gesture={panGesture}>
        <View
          style={styles.cosmos}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
            setPlaySize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
          }}
        >
          <CosmicBackdrop />
          <Figure8Path width={playSize.w} height={playSize.h} />

          {phase === 'playing' && (
            <>
              <StardustTrail points={dust} />
              {showTether && (
                <GravityTether
                  x1={fingerPos.x}
                  y1={fingerPos.y}
                  x2={cometPos.x}
                  y2={cometPos.y}
                  active={isLocked}
                />
              )}
              <CometFigure x={cometPos.x} y={cometPos.y} angle={cometAngle} locked={isLocked} />
              <StardustPuck x={fingerPos.x} y={fingerPos.y} active={isLocked} progress={followProgress} />
              <OrbitLockMeter
                x={cometPos.x}
                y={cometPos.y - HALF - 40}
                progress={followProgress}
                visible={isLocked}
              />
            </>
          )}

          {phase === 'countdown' && (
            <OrbitCountdown key={`cd-${round}`} onDone={startPlaying} />
          )}

          {phase === 'idle' && !done && (
            <View style={styles.readyBanner} pointerEvents="none">
              <Text style={styles.readyText}>☄️ Orbit {round}</Text>
            </View>
          )}

          <CometCelebration visible={showCelebrate} x={cometPos.x} y={cometPos.y} />
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 14,
    zIndex: 50,
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.4)',
  },
  backText: { color: '#F5F3FF', fontWeight: '800', fontSize: 14 },
  cosmos: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(167,139,250,0.35)',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  readyBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '44%',
    backgroundColor: 'rgba(15,23,42,0.9)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(167,139,250,0.45)',
    zIndex: 10,
  },
  readyText: { fontSize: 17, fontWeight: '800', color: '#C4B5FD' },
});

export default CometChaseGame;
