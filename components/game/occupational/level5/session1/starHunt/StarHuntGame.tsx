/**
 * OT Level 5 · Session 1 · Game 4 — Star Hunt (Cosmic Chase)
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import {
  CometStar,
  CosmicIntroBackdrop,
  HuntToast,
  NightSkyBackdrop,
  StreakHint,
} from '@/components/game/occupational/level5/session1/starHunt/StarHuntVisuals';
import {
  COMET_SIZE,
  STAR_HUNT_COPY as COPY,
  STAR_HUNT_THEME as THEME,
} from '@/components/game/occupational/level5/session1/starHunt/starHuntTheme';
import { distPx, randomInRange, useTraceSound } from '@/components/game/occupational/level5/session1/followUtils';
import { SESSION5_1_PACING as P } from '@/components/game/occupational/level5/session1/session1Pacing';
import { RoundCountdownOverlay, Session2HUD, Session2Intro } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const HALF = COMET_SIZE / 2;
const TAP_TOLERANCE = Platform.OS === 'android' ? P.tapTolerancePx + 14 : P.tapTolerancePx;

const StarHuntGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const [starPos, setStarPos] = useState({ x: 180, y: 200 });
  const [toast, setToast] = useState('');
  const [showToast, setShowToast] = useState(false);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const moveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);
  const dirX = useRef(1);
  const dirY = useRef(1);
  const speedX = useRef(2);
  const speedY = useRef(2);
  const lastChange = useRef(Date.now());

  const objX = useSharedValue(180);
  const objY = useSharedValue(200);
  const objScale = useSharedValue(1);
  const objPosRef = useRef({ x: 180, y: 200 });

  const objStyle = useAnimatedStyle(() => ({
    transform: [{ scale: objScale.value }],
  }));

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

  const syncPos = useCallback((x: number, y: number) => {
    objPosRef.current = { x, y };
    setStarPos({ x, y });
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
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    cancelAnimation(objX);
    cancelAnimation(objY);
  }, [objX, objY]);

  const flashToast = useCallback((text: string, ms = 850) => {
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
    flashToast('⭐ Star caught!');
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
  }, [flashToast, playSuccess]);

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
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
    objScale.value = withSequence(withTiming(1.35, { duration: 140 }), withTiming(1, { duration: 140 }));
    bumpScore();
    roundTimerRef.current = setTimeout(() => advanceRound(), 700);
  }, [advanceRound, bumpScore, clearTimers, objScale]);

  const layoutComet = useCallback(() => {
    const w = playW.current;
    const h = playH.current;
    const pad = HALF + 8;
    const x = randomInRange(pad, w - pad);
    const y = randomInRange(pad + 48, h - pad);
    objX.value = x;
    objY.value = y;
    syncPos(x, y);
    dirX.current = Math.random() > 0.5 ? 1 : -1;
    dirY.current = Math.random() > 0.5 ? 1 : -1;
    speedX.current = randomInRange(P.erraticSpeedMin, P.erraticSpeedMax);
    speedY.current = randomInRange(P.erraticSpeedMin, P.erraticSpeedMax);
    lastChange.current = Date.now();
  }, [objX, objY, syncPos]);

  const tickMove = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
    const w = playW.current;
    const h = playH.current;
    const pad = HALF;

    const now = Date.now();
    if (now - lastChange.current > randomInRange(P.erraticChangeMinMs, P.erraticChangeMaxMs)) {
      dirX.current = Math.random() > 0.5 ? 1 : -1;
      dirY.current = Math.random() > 0.5 ? 1 : -1;
      speedX.current = randomInRange(P.erraticSpeedMin, P.erraticSpeedMax);
      speedY.current = randomInRange(P.erraticSpeedMin, P.erraticSpeedMax);
      lastChange.current = now;
    }

    let nx = objX.value + speedX.current * dirX.current;
    let ny = objY.value + speedY.current * dirY.current;
    if (nx <= pad || nx >= w - pad) {
      dirX.current *= -1;
      nx = Math.max(pad, Math.min(w - pad, nx));
    }
    if (ny <= pad + 36 || ny >= h - pad) {
      dirY.current *= -1;
      ny = Math.max(pad + 36, Math.min(h - pad, ny));
    }
    objX.value = nx;
    objY.value = ny;
    syncPos(nx, ny);
  }, [objX, objY, syncPos]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    setPhase('playing');
    layoutComet();
    speakTTS(COPY.ttsCue, 0.78).catch(() => {});
    moveTimerRef.current = setInterval(tickMove, P.moveTickMs);
  }, [layoutComet, tickMove]);

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

  const handleTap = useCallback(
    (locationX: number, locationY: number) => {
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
      const { x, y } = objPosRef.current;
      if (distPx(locationX, locationY, x, y) <= TAP_TOLERANCE + HALF) {
        completeRound();
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    },
    [completeRound],
  );

  const hint = !roundActive
    ? phase === 'countdown'
      ? 'Comet incoming…'
      : 'Scanning sky…'
    : '⭐ Tap the golden comet star!';

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
            backdrop: <CosmicIntroBackdrop />,
            floatEmoji: '⭐',
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
        gameTitle="Hunt"
        emoji={COPY.emoji}
        round={round}
        totalRounds={P.rounds}
        score={score}
        scoreLabel="CAUGHT"
        hint={hint}
        showHint={phase === 'playing'}
      />

      <Pressable
        style={styles.arena}
        onLayout={(e) => {
          playW.current = e.nativeEvent.layout.width;
          playH.current = e.nativeEvent.layout.height;
        }}
        onPress={(e) => handleTap(e.nativeEvent.locationX, e.nativeEvent.locationY)}
      >
        <NightSkyBackdrop />
        <StreakHint />
        {roundActive && <CometStar x={starPos.x} y={starPos.y} size={COMET_SIZE} scaleStyle={objStyle} />}
        <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={THEME.accent} />
        <HuntToast text={toast} visible={showToast} />
        {phase === 'countdown' && (
          <RoundCountdownOverlay key={`cd-${round}`} accent={THEME.accent} onDone={startRoundPlay} />
        )}
        {!roundActive && phase !== 'countdown' && (
          <View style={styles.waitLayer} pointerEvents="none">
            <Text style={styles.waitText}>Charting stars…</Text>
          </View>
        )}
      </Pressable>
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
    backgroundColor: 'rgba(11,16,38,0.72)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.35)',
  },
  exitText: { color: '#FEF9C3', fontWeight: '800', fontSize: 13 },
  arena: {
    flex: 1,
    margin: 10,
    marginTop: 4,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(167,139,250,0.28)',
    backgroundColor: 'rgba(11,16,38,0.4)',
  },
  waitLayer: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 6 },
  waitText: { fontSize: 16, fontWeight: '800', color: THEME.subtitle },
});

export default StarHuntGame;
