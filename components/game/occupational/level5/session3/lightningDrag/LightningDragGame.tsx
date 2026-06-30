/**
 * OT Level 5 · Session 3 · Game 5 — Lightning Drag
 * Triangular zigzag drag pursuit through a storm sky.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import {
  ChargeMeter,
  ElectricArc,
  LightningBolt,
  LightningCelebration,
  LightningDragHUD,
  LightningDragInfoScreen,
  SparkTrail,
  StormBackdrop,
  StormCountdown,
  StormPuck,
  ZigzagPath,
  type SparkPoint,
} from '@/components/game/occupational/level5/session3/lightningDrag/LightningDragVisuals';
import { LIGHTNING_DRAG_COPY as COPY } from '@/components/game/occupational/level5/session3/lightningDrag/lightningDragTheme';
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
const SPARK_LEN = 10;

const LightningDragGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({
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
  const [sparks, setSparks] = useState<SparkPoint[]>([]);
  const [playSize, setPlaySize] = useState({ w: 360, h: 400 });
  const [flashKey, setFlashKey] = useState(0);

  const [boltPos, setBoltPos] = useState({ x: 180, y: 200 });
  const [fingerPos, setFingerPos] = useState({ x: 180, y: 280 });
  const [boltFacing, setBoltFacing] = useState<'left' | 'right'>('right');

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
  const boltPosRef = useRef({ x: 180, y: 200 });
  const fingerPosRef = useRef({ x: 180, y: 280 });
  const sparksRef = useRef<SparkPoint[]>([]);
  const prevBoltRef = useRef({ x: 180, y: 200 });
  const prevDirRef = useRef<'left' | 'right'>('right');

  useEffect(() => {
    scoreRef.current = score;
    roundRef.current = round;
  }, [score, round]);

  const pushSparks = useCallback((x: number, y: number) => {
    const next: SparkPoint[] = [{ x, y, opacity: 1 }, ...sparksRef.current].slice(0, SPARK_LEN);
    next.forEach((pt, i) => {
      pt.opacity = 1 - i / SPARK_LEN;
    });
    sparksRef.current = next;
    setSparks([...next]);
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
    sparksRef.current = [];
    setSparks([]);
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

  const tickBolt = useCallback(() => {
    if (!activeRef.current || completeRef.current) return;
    timeRef.current += P.moveTickMs / 1000;
    const w = playW.current;
    const h = playH.current;
    const cx = w * 0.5;
    const cy = h * 0.45;
    const r = Math.min(w, h) * 0.22;
    const speedBoost = 1 + (roundRef.current - 1) * 0.05;
    const t = timeRef.current * speedBoost;
    const phase = (t * 1.2) % 2;
    const tri = phase < 1 ? phase : 2 - phase;
    const nx = cx + (tri * 2 - 1) * r;
    const ny = cy + Math.sin(t * 0.5) * r * 0.4;

    const dir: 'left' | 'right' = nx > prevBoltRef.current.x ? 'right' : 'left';
    if (dir !== prevDirRef.current) {
      setFlashKey(Date.now());
      prevDirRef.current = dir;
    }
    prevBoltRef.current = { x: nx, y: ny };

    boltPosRef.current = { x: nx, y: ny };
    setBoltPos({ x: nx, y: ny });
    setBoltFacing(dir);
    pushSparks(nx, ny);
  }, [pushSparks]);

  const checkLock = useCallback(() => {
    if (!activeRef.current || completeRef.current || doneRef.current) return;
    const d = distPx(
      fingerPosRef.current.x,
      fingerPosRef.current.y,
      boltPosRef.current.x,
      boltPosRef.current.y,
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
    const startX = w * 0.5 - Math.min(w, h) * 0.22;
    const startY = h * 0.45;
    boltPosRef.current = { x: startX, y: startY };
    fingerPosRef.current = { x: w * 0.5, y: h * 0.72 };
    prevBoltRef.current = { x: startX, y: startY };
    prevDirRef.current = 'right';
    setBoltPos({ x: startX, y: startY });
    setFingerPos({ x: w * 0.5, y: h * 0.72 });
    setBoltFacing('right');
    sparksRef.current = [];
    setSparks([]);
    setStatusHint(COPY.followHint);
    speakTTS(COPY.ttsCue, 0.78).catch(() => {});
    moveTimerRef.current = setInterval(tickBolt, P.moveTickMs);
    checkTimerRef.current = setInterval(checkLock, 80);
  }, [checkLock, tickBolt]);

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
        <LightningDragInfoScreen onStart={() => setShowInfo(false)} onBack={handleExit} />
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

  const lockDist = distPx(fingerPos.x, fingerPos.y, boltPos.x, boltPos.y);
  const showArc = phase === 'playing' && lockDist <= P.followDistancePx + 24;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={handleExit} style={styles.backBtn} activeOpacity={0.85}>
        <Text style={styles.backText}>← Exit</Text>
      </TouchableOpacity>

      <LightningDragHUD
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
          style={styles.storm}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
            setPlaySize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
          }}
        >
          <StormBackdrop flashKey={flashKey} />
          <ZigzagPath width={playSize.w} height={playSize.h} />

          {phase === 'playing' && (
            <>
              <SparkTrail points={sparks} />
              {showArc && (
                <ElectricArc
                  x1={fingerPos.x}
                  y1={fingerPos.y}
                  x2={boltPos.x}
                  y2={boltPos.y}
                  active={isLocked}
                />
              )}
              <LightningBolt x={boltPos.x} y={boltPos.y} facing={boltFacing} locked={isLocked} />
              <StormPuck x={fingerPos.x} y={fingerPos.y} active={isLocked} progress={followProgress} />
              <ChargeMeter
                x={boltPos.x}
                y={boltPos.y - HALF - 40}
                progress={followProgress}
                visible={isLocked}
              />
            </>
          )}

          {phase === 'countdown' && (
            <StormCountdown key={`cd-${round}`} onDone={startPlaying} />
          )}

          {phase === 'idle' && !done && (
            <View style={styles.readyBanner} pointerEvents="none">
              <Text style={styles.readyText}>⚡ Strike {round}</Text>
            </View>
          )}

          <LightningCelebration visible={showCelebrate} x={boltPos.x} y={boltPos.y} />
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 14,
    zIndex: 50,
    backgroundColor: 'rgba(30,41,59,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.35)',
  },
  backText: { color: '#F8FAFC', fontWeight: '800', fontSize: 14 },
  storm: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(250,204,21,0.3)',
    shadowColor: '#EAB308',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  readyBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '44%',
    backgroundColor: 'rgba(30,41,59,0.92)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(250,204,21,0.4)',
    zIndex: 10,
  },
  readyText: { fontSize: 17, fontWeight: '800', color: '#FDE047' },
});

export default LightningDragGame;
