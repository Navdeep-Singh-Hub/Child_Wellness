/**
 * OT Level 5 · Session 1 · Game 5 — Zigzag Run
 * Neon circuit zigzag chase with visible path trace.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast } from '@/components/game/FX';
import {
  CircuitBackdrop,
  CircuitCelebration,
  NearMissToast,
  NeonRunnerView,
  PathNodes,
  PathTrace,
  TapRippleLayer,
  ZigzagRunHUD,
  ZigzagRunInfoScreen,
  type TapRippleData,
  type TrailPoint,
} from '@/components/game/occupational/level5/session1/zigzagRun/ZigzagRunVisuals';
import { ZIGZAG_RUN_COPY as COPY } from '@/components/game/occupational/level5/session1/zigzagRun/zigzagRunTheme';
import { distPx, useTraceSound } from '@/components/game/occupational/level5/session1/followUtils';
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
const HALF = P.targetHalfPx;
const TAP_TOLERANCE = Platform.OS === 'android' ? P.tapTolerancePx + 14 : P.tapTolerancePx;
const NEAR_MISS_EXTRA = 38;
const TRAIL_LEN = 8;

const ZigzagRunGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({
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

  const [roundActive, setRoundActive] = useState(false);
  const [runnerPos, setRunnerPos] = useState({ x: 40, y: 200 });
  const [runnerScale, setRunnerScale] = useState(1);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [showNearMiss, setShowNearMiss] = useState(false);
  const [showMissToast, setShowMissToast] = useState(false);
  const [ripples, setRipples] = useState<TapRippleData[]>([]);
  const [statusHint, setStatusHint] = useState('');
  const [playSize, setPlaySize] = useState({ w: 360, h: 400 });

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const rippleIdRef = useRef(0);
  const moveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);
  const zigzagPhase = useRef(HALF);
  const zigzagDir = useRef(1);
  const runnerPosRef = useRef({ x: 40, y: 200 });
  const trailRef = useRef<TrailPoint[]>([]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

  const addRipple = useCallback((x: number, y: number, kind: TapRippleData['kind']) => {
    const id = ++rippleIdRef.current;
    setRipples((prev) => [...prev.slice(-4), { id, x, y, kind }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 650);
  }, []);

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
      setRoundActive(false);
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

  const layoutRunner = useCallback(() => {
    const w = playW.current;
    const h = playH.current;
    const pad = HALF + 8;
    zigzagPhase.current = pad;
    zigzagDir.current = 1;
    const x = pad;
    const y = h * 0.5;
    runnerPosRef.current = { x, y };
    setRunnerPos({ x, y });
    setRunnerScale(1);
    trailRef.current = [];
    setTrail([]);
  }, []);

  const tickMove = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;

    const w = playW.current;
    const h = playH.current;
    const pad = HALF;
    const speedBoost = 1 + (roundRef.current - 1) * 0.05;

    zigzagPhase.current += P.zigzagSpeedPx * zigzagDir.current * speedBoost;
    let nx = zigzagPhase.current;
    const ny = h * 0.5 + Math.sin(nx * P.zigzagFrequency) * P.zigzagAmplitudePx;

    if (nx >= w - pad) {
      zigzagDir.current = -1;
      zigzagPhase.current = w - pad;
      nx = w - pad;
    } else if (nx <= pad) {
      zigzagDir.current = 1;
      zigzagPhase.current = pad;
      nx = pad;
    }

    runnerPosRef.current = { x: nx, y: ny };
    setRunnerPos({ x: nx, y: ny });
    pushTrail(nx, ny);
  }, [pushTrail]);

  const startMovement = useCallback(() => {
    clearTimers();
    moveTimerRef.current = setInterval(tickMove, P.moveTickMs);
  }, [clearTimers, tickMove]);

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    setShowCelebrate(false);
    roundCompleteRef.current = false;
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs + 250);
  }, [clearTimers, endGame]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    clearTimers();
    setShowCelebrate(true);
    setRunnerScale(1.35);
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(COPY.ttsSuccess, 0.85).catch(() => {});
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
    roundTimerRef.current = setTimeout(() => advanceRound(), 900);
  }, [advanceRound, clearTimers, playSuccess]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setShowCelebrate(false);
    layoutRunner();
    setRoundActive(true);
    setStatusHint(COPY.followHint);
    speakTTS(COPY.ttsCue, 0.78).catch(() => {});
    startMovement();
  }, [layoutRunner, startMovement]);

  useEffect(() => {
    if (showInfo || done) return;
    if (round === 1) speakTTS(COPY.ttsIntro, 0.78).catch(() => {});
    clearTimers();
    setRoundActive(false);
    roundTimerRef.current = setTimeout(() => startRoundPlay(), P.roundStartDelayMs + 200);
    return clearTimers;
  }, [round, showInfo, done, startRoundPlay, clearTimers]);

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
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      const { x, y } = runnerPosRef.current;
      const dist = distPx(locationX, locationY, x, y);
      const hitRadius = TAP_TOLERANCE + HALF;

      if (dist <= hitRadius) {
        addRipple(locationX, locationY, 'hit');
        completeRound();
      } else if (dist <= hitRadius + NEAR_MISS_EXTRA) {
        addRipple(locationX, locationY, 'near');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        setShowNearMiss(true);
        setStatusHint(COPY.nearMissHint);
        speakTTS(COPY.ttsNearMiss, 0.8).catch(() => {});
        setTimeout(() => setShowNearMiss(false), 750);
      } else {
        addRipple(locationX, locationY, 'miss');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        setShowMissToast(true);
        setStatusHint(COPY.missHint);
        setTimeout(() => setShowMissToast(false), 700);
      }
    },
    [addRipple, completeRound],
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
        <ZigzagRunInfoScreen onStart={() => setShowInfo(false)} onBack={handleExit} />
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

      <ZigzagRunHUD
        round={round}
        totalRounds={P.rounds}
        score={score}
        hint={statusHint}
        showHint={roundActive}
      />

      <Pressable
        style={styles.circuit}
        onLayout={(e) => {
          playW.current = e.nativeEvent.layout.width;
          playH.current = e.nativeEvent.layout.height;
          setPlaySize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
        }}
        onPress={(e) => handleTap(e.nativeEvent.locationX, e.nativeEvent.locationY)}
      >
        <CircuitBackdrop />
        <PathTrace width={playSize.w} height={playSize.h} />
        <PathNodes width={playSize.w} height={playSize.h} />
        <TapRippleLayer ripples={ripples} />

        {!roundActive && round <= P.rounds && !done && (
          <View style={styles.readyBanner} pointerEvents="none">
            <Text style={styles.readyText}>〰️ Round {round}</Text>
          </View>
        )}

        {roundActive && (
          <NeonRunnerView
            x={runnerPos.x}
            y={runnerPos.y}
            scale={runnerScale}
            trail={trail}
            showAimRing={round <= 3}
          />
        )}

        <CircuitCelebration visible={showCelebrate} x={runnerPos.x} y={runnerPos.y} />
        <NearMissToast show={showNearMiss} />
        <ResultToast text={COPY.missHint} type="bad" show={showMissToast} />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0F' },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 14,
    zIndex: 50,
    backgroundColor: 'rgba(10,10,15,0.8)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.35)',
  },
  backText: { color: '#F5F3FF', fontWeight: '800', fontSize: 14 },
  circuit: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(139,92,246,0.35)',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  readyBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '44%',
    backgroundColor: 'rgba(26,26,46,0.9)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(139,92,246,0.45)',
    zIndex: 10,
  },
  readyText: { fontSize: 17, fontWeight: '800', color: '#C4B5FD' },
});

export default ZigzagRunGame;
