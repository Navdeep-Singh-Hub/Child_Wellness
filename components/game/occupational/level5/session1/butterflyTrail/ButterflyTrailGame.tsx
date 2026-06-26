/**
 * OT Level 5 · Session 1 · Game 1 — Butterfly Trail
 * Dedicated smooth-pursuit follow game with enchanted meadow identity.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import {
  AnimatedButterfly,
  FingerCursor,
  FollowTether,
  MeadowBackdrop,
  MeadowIntroBackdrop,
  NectarProgress,
  OrbitGuide,
  TrailToast,
} from '@/components/game/occupational/level5/session1/butterflyTrail/ButterflyTrailVisuals';
import {
  BUTTERFLY_SIZE,
  BUTTERFLY_TRAIL_COPY as COPY,
  BUTTERFLY_TRAIL_THEME as THEME,
} from '@/components/game/occupational/level5/session1/butterflyTrail/butterflyTrailTheme';
import { distPx, useTraceSound } from '@/components/game/occupational/level5/session1/followUtils';
import { SESSION5_1_PACING as P } from '@/components/game/occupational/level5/session1/session1Pacing';
import { RoundCountdownOverlay, Session2HUD, Session2Intro } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const HALF = BUTTERFLY_SIZE / 2;

const ButterflyTrailGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);

  const [showInfo, setShowInfo] = useState(true);
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'idle'>('idle');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [followProgress, setFollowProgress] = useState(0);
  const [onTrail, setOnTrail] = useState(false);
  const [toast, setToast] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [orbit, setOrbit] = useState({ cx: 0, cy: 0, r: 0 });
  const [tether, setTether] = useState({ x1: 0, y1: 0, x2: 0, y2: 0, show: false });

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
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);
  const timeRef = useRef(0);

  const targetX = useSharedValue(180);
  const targetY = useSharedValue(200);
  const fingerX = useSharedValue(180);
  const fingerY = useSharedValue(280);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

  const butterflyStyle = useAnimatedStyle(() => ({
    left: targetX.value - HALF,
    top: targetY.value - HALF,
  }));
  const fingerStyle = useAnimatedStyle(() => ({
    left: fingerX.value - 22,
    top: fingerY.value - 22,
  }));

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
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    cancelAnimation(targetX);
    cancelAnimation(targetY);
  }, [targetX, targetY]);

  const flashToast = useCallback((text: string, ms = 900) => {
    setToast(text);
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(false), ms);
  }, []);

  const exit = useCallback(() => {
    stopAllSpeech();
    cleanupSounds();
    clearTimers();
    onBack?.();
  }, [clearTimers, onBack]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.rounds;
      const xp = Math.round(finalScore * P.xpPerScore);
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      setRoundActive(false);
      setPhase('idle');
      setShowCongrats(true);
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

  const bumpScore = useCallback(() => {
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(COPY.ttsSuccess, 0.78).catch(() => {});
    flashToast('✨ Nectar collected!');
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
  }, [flashToast, playSuccess]);

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
    followingRef.current = false;
    followStartRef.current = null;
    setFollowProgress(0);
    setOnTrail(false);
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    setRound((r) => r + 1);
    setPhase('countdown');
  }, [clearTimers, endGame]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    clearTimers();
    bumpScore();
    roundTimerRef.current = setTimeout(() => advanceRound(), 700);
  }, [advanceRound, bumpScore, clearTimers]);

  const tickTarget = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current) return;
    timeRef.current += P.moveTickMs / 1000;
    const w = playW.current;
    const h = playH.current;
    const cx = w * 0.5;
    const cy = h * 0.45;
    const radius = Math.min(w, h) * 0.22;
    targetX.value = cx + Math.sin(timeRef.current * 0.5) * radius;
    targetY.value = cy + Math.cos(timeRef.current * 0.5) * radius;
  }, [targetX, targetY]);

  const checkFollow = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;

    const tx = targetX.value;
    const ty = targetY.value;
    const fx = fingerX.value;
    const fy = fingerY.value;
    const d = distPx(fx, fy, tx, ty);

    setTether({ x1: fx, y1: fy, x2: tx, y2: ty, show: d <= P.followDistancePx * 1.35 });

    if (d <= P.followDistancePx) {
      if (!followingRef.current) {
        followingRef.current = true;
        followStartRef.current = Date.now();
        setOnTrail(true);
      } else {
        const elapsed = Date.now() - (followStartRef.current ?? Date.now());
        setFollowProgress(Math.min(100, Math.round((elapsed / P.followHoldMs) * 100)));
        if (elapsed >= P.followHoldMs) completeRound();
      }
    } else {
      if (followingRef.current) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      followingRef.current = false;
      followStartRef.current = null;
      setFollowProgress(0);
      setOnTrail(false);
    }
  }, [completeRound, fingerX, fingerY, targetX, targetY]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    followingRef.current = false;
    followStartRef.current = null;
    setFollowProgress(0);
    setOnTrail(false);
    setRoundActive(true);
    setPhase('playing');
    timeRef.current = 0;

    const w = playW.current;
    const h = playH.current;
    const cx = w * 0.5;
    const cy = h * 0.45;
    const radius = Math.min(w, h) * 0.22;
    setOrbit({ cx, cy, r: radius });

    targetX.value = cx;
    targetY.value = cy;
    fingerX.value = cx;
    fingerY.value = h * 0.72;

    speakTTS(COPY.ttsCue, 0.78).catch(() => {});
    moveTimerRef.current = setInterval(tickTarget, P.moveTickMs);
    checkTimerRef.current = setInterval(checkFollow, 100);
  }, [checkFollow, fingerX, fingerY, targetX, targetY, tickTarget]);

  useEffect(() => {
    if (showInfo || done) return;
    if (phase === 'countdown' && round === 1) {
      speakTTS(COPY.ttsIntro, 0.78).catch(() => {});
    }
  }, [showInfo, done, phase, round]);

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
      fingerX.value = Math.max(22, Math.min(playW.current - 22, e.x));
      fingerY.value = Math.max(22, Math.min(playH.current - 22, e.y));
    });

  const hint = !roundActive
    ? phase === 'countdown'
      ? 'Trail begins soon…'
      : 'Get ready…'
    : followProgress > 0
      ? `Stay on the butterfly — ${followProgress}% nectar`
      : onTrail
        ? 'Collecting nectar… hold steady!'
        : 'Drag your finger onto the butterfly 🦋';

  if (showInfo) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <Session2Intro
          config={{
            theme: THEME,
            emoji: COPY.emoji,
            title: COPY.title,
            tagline: COPY.tagline,
            body: COPY.body,
            chips: [...COPY.chips],
            startLabel: COPY.startLabel,
            startGradient: [...COPY.startGradient],
            backdrop: <MeadowIntroBackdrop />,
            floatEmoji: '🦋',
          }}
          onStart={() => {
            setShowInfo(false);
            setPhase('countdown');
          }}
          onBack={exit}
        />
      </SafeAreaView>
    );
  }

  if (showCongrats && done && finalStats) {
    return (
      <CongratulationsScreen
        message={COPY.congrats}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        xpAwarded={finalStats.xp}
        onContinue={() => {
          stopAllSpeech();
          cleanupSounds();
          onComplete ? onComplete() : onBack?.();
        }}
        onHome={exit}
      />
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <LinearGradient colors={[...THEME.sky]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={exit} style={styles.exitBtn}>
        <Text style={styles.exitText}>← Exit</Text>
      </TouchableOpacity>

      <Session2HUD
        theme={THEME}
        gameTitle="Trail"
        emoji={COPY.emoji}
        round={round}
        totalRounds={P.rounds}
        score={score}
        scoreLabel="NECTAR"
        hint={hint}
        showHint={phase === 'playing'}
        extra={roundActive ? <NectarProgress progress={followProgress} /> : null}
      />

      <GestureDetector gesture={panGesture}>
        <View
          style={styles.arena}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
          }}
        >
          <MeadowBackdrop />
          {roundActive && <OrbitGuide cx={orbit.cx} cy={orbit.cy} radius={orbit.r} />}
          {roundActive && (
            <FollowTether
              x1={tether.x1}
              y1={tether.y1}
              x2={tether.x2}
              y2={tether.y2}
              visible={tether.show}
            />
          )}
          {roundActive && <AnimatedButterfly style={butterflyStyle} />}
          {roundActive && <FingerCursor style={fingerStyle} active={onTrail} />}
          <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={THEME.accent} />
          <TrailToast text={toast} visible={showToast} />
          {phase === 'countdown' && (
            <RoundCountdownOverlay key={`cd-${round}`} accent={THEME.accent} onDone={startRoundPlay} />
          )}
          {!roundActive && phase !== 'countdown' && (
            <View style={styles.waitLayer} pointerEvents="none">
              <Text style={styles.waitText}>Preparing meadow…</Text>
            </View>
          )}
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COPY.rootBg },
  exitBtn: {
    position: 'absolute',
    top: 52,
    left: 12,
    zIndex: 50,
    backgroundColor: 'rgba(20,83,45,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  exitText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  arena: {
    flex: 1,
    margin: 10,
    marginTop: 4,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  waitLayer: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 6 },
  waitText: { fontSize: 17, fontWeight: '800', color: THEME.subtitle },
});

export default ButterflyTrailGame;
