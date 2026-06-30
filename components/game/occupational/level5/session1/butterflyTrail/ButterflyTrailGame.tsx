/**
 * OT Level 5 · Session 1 · Game 2 — Butterfly Trail
 * Enchanted garden follow experience with nectar collection mechanic.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import {
  ButterflyTrailHUD,
  ButterflyTrailInfoScreen,
  ButterflyView,
  ConnectionThread,
  FingerAura,
  GardenBackdrop,
  NectarCelebration,
  NectarMeter,
  TrailDust,
  type DustPoint,
} from '@/components/game/occupational/level5/session1/butterflyTrail/ButterflyTrailVisuals';
import { BUTTERFLY_TRAIL_COPY as COPY } from '@/components/game/occupational/level5/session1/butterflyTrail/butterflyTrailTheme';
import { distPx, useTraceSound } from '@/components/game/occupational/level5/session1/followUtils';
import { SESSION5_1_PACING as P } from '@/components/game/occupational/level5/session1/session1Pacing';
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
const TRAIL_LEN = 8;

const ButterflyTrailGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({
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
  const [followProgress, setFollowProgress] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [dust, setDust] = useState<DustPoint[]>([]);

  const [targetPos, setTargetPos] = useState({ x: 180, y: 200 });
  const [fingerPos, setFingerPos] = useState({ x: 180, y: 280 });

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const followingRef = useRef(false);
  const followStartRef = useRef<number | null>(null);
  const moveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);
  const timeRef = useRef(0);
  const targetPosRef = useRef({ x: 180, y: 200 });
  const fingerPosRef = useRef({ x: 180, y: 280 });
  const dustRef = useRef<DustPoint[]>([]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

  const pushDust = useCallback((x: number, y: number) => {
    const next: DustPoint[] = [{ x, y, opacity: 1 }, ...dustRef.current].slice(0, TRAIL_LEN);
    next.forEach((pt, i) => {
      pt.opacity = 1 - i / TRAIL_LEN;
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

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    setShowCelebrate(false);
    roundCompleteRef.current = false;
    followingRef.current = false;
    followStartRef.current = null;
    setFollowProgress(0);
    setIsFollowing(false);
    dustRef.current = [];
    setDust([]);
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs + 300);
  }, [clearTimers, endGame]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    clearTimers();
    setShowCelebrate(true);
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(COPY.ttsSuccess, 0.85).catch(() => {});
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
    roundTimerRef.current = setTimeout(() => advanceRound(), 1000);
  }, [advanceRound, clearTimers, playSuccess]);

  const tickTarget = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current) return;
    timeRef.current += P.moveTickMs / 1000;
    const w = playW.current;
    const h = playH.current;
    const cx = w * 0.5;
    const cy = h * 0.42;
    const radiusX = Math.min(w, h) * 0.28;
    const radiusY = Math.min(w, h) * 0.18;
    const nx = cx + Math.sin(timeRef.current * 0.55) * radiusX;
    const ny = cy + Math.cos(timeRef.current * 0.55 * 1.3) * radiusY;
    targetPosRef.current = { x: nx, y: ny };
    setTargetPos({ x: nx, y: ny });
    pushDust(nx, ny);
  }, [pushDust]);

  const checkFollow = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
    const d = distPx(
      fingerPosRef.current.x,
      fingerPosRef.current.y,
      targetPosRef.current.x,
      targetPosRef.current.y,
    );
    if (d <= P.followDistancePx) {
      if (!followingRef.current) {
        followingRef.current = true;
        followStartRef.current = Date.now();
        setIsFollowing(true);
        setStatusHint(COPY.progressHint);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } else {
        const elapsed = Date.now() - (followStartRef.current ?? Date.now());
        const prog = Math.min(100, Math.round((elapsed / P.followHoldMs) * 100));
        setFollowProgress(prog);
        if (prog >= 100) completeRound();
      }
    } else {
      if (followingRef.current) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
      }
      followingRef.current = false;
      followStartRef.current = null;
      setIsFollowing(false);
      setFollowProgress(0);
      setStatusHint(COPY.followHint);
    }
  }, [completeRound]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    followingRef.current = false;
    followStartRef.current = null;
    setFollowProgress(0);
    setIsFollowing(false);
    setShowCelebrate(false);
    setRoundActive(true);
    timeRef.current = 0;
    const w = playW.current;
    const h = playH.current;
    const startX = w * 0.5;
    const startY = h * 0.42;
    targetPosRef.current = { x: startX, y: startY };
    fingerPosRef.current = { x: startX, y: h * 0.72 };
    setTargetPos({ x: startX, y: startY });
    setFingerPos({ x: startX, y: h * 0.72 });
    dustRef.current = [];
    setDust([]);
    setStatusHint(COPY.followHint);
    speakTTS(COPY.ttsCue, 0.78).catch(() => {});
    moveTimerRef.current = setInterval(tickTarget, P.moveTickMs);
    checkTimerRef.current = setInterval(checkFollow, 80);
  }, [checkFollow, tickTarget]);

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

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      const nx = Math.max(18, Math.min(playW.current - 18, e.x));
      const ny = Math.max(18, Math.min(playH.current - 18, e.y));
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
        <ButterflyTrailInfoScreen onStart={() => setShowInfo(false)} onBack={handleExit} />
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

  const followDist = distPx(fingerPos.x, fingerPos.y, targetPos.x, targetPos.y);
  const showThread = roundActive && followDist <= P.followDistancePx + 20;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={handleExit} style={styles.backBtn} activeOpacity={0.85}>
        <Text style={styles.backText}>← Exit</Text>
      </TouchableOpacity>

      <ButterflyTrailHUD
        round={round}
        totalRounds={P.rounds}
        score={score}
        hint={statusHint}
        showHint={roundActive}
        followProgress={followProgress}
        isFollowing={isFollowing}
      />

      <GestureDetector gesture={panGesture}>
        <View
          style={styles.garden}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
          }}
        >
          <GardenBackdrop />

          {!roundActive && round <= P.rounds && !done && (
            <View style={styles.readyBanner} pointerEvents="none">
              <Text style={styles.readyText}>{round === 1 ? '🌸 Get ready…' : `🌸 Round ${round}`}</Text>
            </View>
          )}

          {roundActive && (
            <>
              <TrailDust points={dust} />
              {showThread && (
                <ConnectionThread
                  x1={fingerPos.x}
                  y1={fingerPos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  active={isFollowing}
                />
              )}
              <ButterflyView x={targetPos.x} y={targetPos.y} following={isFollowing} />
              <FingerAura x={fingerPos.x} y={fingerPos.y} active={isFollowing} progress={followProgress} />
              <NectarMeter x={targetPos.x} y={targetPos.y - HALF - 36} progress={followProgress} visible={isFollowing} />
            </>
          )}

          <NectarCelebration visible={showCelebrate} x={targetPos.x} y={targetPos.y} />
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#064E3B' },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 14,
    zIndex: 50,
    backgroundColor: 'rgba(6,78,59,0.65)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  backText: { color: '#F0FDF4', fontWeight: '800', fontSize: 14 },
  garden: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#14532D',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  readyBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '44%',
    backgroundColor: 'rgba(255,255,255,0.82)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    zIndex: 10,
  },
  readyText: { fontSize: 17, fontWeight: '800', color: '#064E3B' },
});

export default ButterflyTrailGame;
