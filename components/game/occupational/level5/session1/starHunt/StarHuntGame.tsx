/**
<<<<<<< HEAD
 * OT Level 5 · Session 1 · Game 4 — Star Hunt
 * Cosmic erratic-chase experience with comet star and nebula backdrop.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast } from '@/components/game/FX';
import {
  CometStarView,
  CosmosBackdrop,
  NearMissToast,
  StarCelebration,
  StarHuntHUD,
  StarHuntInfoScreen,
  StardustTrail,
  TapRippleLayer,
  WarpFlash,
  type StardustPoint,
  type TapRippleData,
} from '@/components/game/occupational/level5/session1/starHunt/StarHuntVisuals';
import { STAR_HUNT_COPY as COPY } from '@/components/game/occupational/level5/session1/starHunt/starHuntTheme';
import { distPx, randomInRange, useTraceSound } from '@/components/game/occupational/level5/session1/followUtils';
import { SESSION5_1_PACING as P } from '@/components/game/occupational/level5/session1/session1Pacing';
=======
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
>>>>>>> parent of d0342ff (Revert "fgh")
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
<<<<<<< HEAD
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const HALF = P.targetHalfPx;
const TAP_TOLERANCE = Platform.OS === 'android' ? P.tapTolerancePx + 14 : P.tapTolerancePx;
const NEAR_MISS_EXTRA = 40;
const TRAIL_LEN = 7;

const StarHuntGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({
  onBack,
  onComplete,
}) => {
=======
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
>>>>>>> parent of d0342ff (Revert "fgh")
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);

  const [showInfo, setShowInfo] = useState(true);
<<<<<<< HEAD
=======
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'idle'>('idle');
>>>>>>> parent of d0342ff (Revert "fgh")
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
<<<<<<< HEAD
  const [showCongratulations, setShowCongratulations] = useState(false);

  const [roundActive, setRoundActive] = useState(false);
  const [starPos, setStarPos] = useState({ x: 180, y: 200 });
  const [starScale, setStarScale] = useState(1);
  const [starAngle, setStarAngle] = useState(0);
  const [trail, setTrail] = useState<StardustPoint[]>([]);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [showNearMiss, setShowNearMiss] = useState(false);
  const [showMissToast, setShowMissToast] = useState(false);
  const [showWarp, setShowWarp] = useState(false);
  const [ripples, setRipples] = useState<TapRippleData[]>([]);
  const [statusHint, setStatusHint] = useState('');
=======
  const [showCongrats, setShowCongrats] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [starPos, setStarPos] = useState({ x: 180, y: 200 });
  const [toast, setToast] = useState('');
  const [showToast, setShowToast] = useState(false);
>>>>>>> parent of d0342ff (Revert "fgh")

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
<<<<<<< HEAD
  const rippleIdRef = useRef(0);
  const moveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
=======
  const moveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
>>>>>>> parent of d0342ff (Revert "fgh")
  const playW = useRef(360);
  const playH = useRef(400);
  const dirX = useRef(1);
  const dirY = useRef(1);
  const speedX = useRef(2);
  const speedY = useRef(2);
  const lastChange = useRef(Date.now());
<<<<<<< HEAD
  const starPosRef = useRef({ x: 180, y: 200 });
  const trailRef = useRef<StardustPoint[]>([]);
=======

  const objX = useSharedValue(180);
  const objY = useSharedValue(200);
  const objScale = useSharedValue(1);
  const objPosRef = useRef({ x: 180, y: 200 });

  const objStyle = useAnimatedStyle(() => ({
    transform: [{ scale: objScale.value }],
  }));
>>>>>>> parent of d0342ff (Revert "fgh")

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

<<<<<<< HEAD
  const addRipple = useCallback((x: number, y: number, kind: TapRippleData['kind']) => {
    const id = ++rippleIdRef.current;
    setRipples((prev) => [...prev.slice(-4), { id, x, y, kind }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 650);
=======
  const syncPos = useCallback((x: number, y: number) => {
    objPosRef.current = { x, y };
    setStarPos({ x, y });
>>>>>>> parent of d0342ff (Revert "fgh")
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
<<<<<<< HEAD
  }, []);

=======
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

>>>>>>> parent of d0342ff (Revert "fgh")
  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.rounds;
      const xp = Math.round(finalScore * P.xpPerScore);
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      setRoundActive(false);
<<<<<<< HEAD
      setShowCongratulations(true);
=======
      setPhase('idle');
      setShowCongrats(true);
>>>>>>> parent of d0342ff (Revert "fgh")
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

<<<<<<< HEAD
  const pushTrail = useCallback((x: number, y: number) => {
    const next: StardustPoint[] = [{ x, y, opacity: 1 }, ...trailRef.current].slice(0, TRAIL_LEN);
    next.forEach((pt, i) => {
      pt.opacity = 1 - i / TRAIL_LEN;
    });
    trailRef.current = next;
    setTrail([...next]);
  }, []);

  const layoutStar = useCallback(() => {
=======
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
>>>>>>> parent of d0342ff (Revert "fgh")
    const w = playW.current;
    const h = playH.current;
    const pad = HALF + 8;
    const x = randomInRange(pad, w - pad);
<<<<<<< HEAD
    const y = randomInRange(pad + 40, h - pad);
    starPosRef.current = { x, y };
    setStarPos({ x, y });
    setStarScale(1);
    trailRef.current = [];
    setTrail([]);
    dirX.current = Math.random() > 0.5 ? 1 : -1;
    dirY.current = Math.random() > 0.5 ? 1 : -1;
    const boost = 1 + (roundRef.current - 1) * 0.06;
    speedX.current = randomInRange(P.erraticSpeedMin, P.erraticSpeedMax) * boost;
    speedY.current = randomInRange(P.erraticSpeedMin, P.erraticSpeedMax) * boost;
    lastChange.current = Date.now();
    setStarAngle(Math.atan2(dirY.current * speedY.current, dirX.current * speedX.current) * (180 / Math.PI));
  }, []);

  const tickMove = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;

    const w = playW.current;
    const h = playH.current;
    const pad = HALF;
    const now = Date.now();

    if (now - lastChange.current > randomInRange(P.erraticChangeMinMs, P.erraticChangeMaxMs)) {
      const oldDx = dirX.current;
      const oldDy = dirY.current;
      dirX.current = Math.random() > 0.5 ? 1 : -1;
      dirY.current = Math.random() > 0.5 ? 1 : -1;
      speedX.current = randomInRange(P.erraticSpeedMin, P.erraticSpeedMax) * (1 + (roundRef.current - 1) * 0.06);
      speedY.current = randomInRange(P.erraticSpeedMin, P.erraticSpeedMax) * (1 + (roundRef.current - 1) * 0.06);
      lastChange.current = now;

      if (oldDx !== dirX.current || oldDy !== dirY.current) {
        setShowWarp(true);
        setTimeout(() => setShowWarp(false), 200);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
      }
    }

    let nx = starPosRef.current.x + speedX.current * dirX.current;
    let ny = starPosRef.current.y + speedY.current * dirY.current;

=======
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
>>>>>>> parent of d0342ff (Revert "fgh")
    if (nx <= pad || nx >= w - pad) {
      dirX.current *= -1;
      nx = Math.max(pad, Math.min(w - pad, nx));
    }
    if (ny <= pad + 36 || ny >= h - pad) {
      dirY.current *= -1;
      ny = Math.max(pad + 36, Math.min(h - pad, ny));
    }
<<<<<<< HEAD

    starPosRef.current = { x: nx, y: ny };
    setStarPos({ x: nx, y: ny });
    setStarAngle(Math.atan2(dirY.current * speedY.current, dirX.current * speedX.current) * (180 / Math.PI));
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
    setStarScale(1.4);
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(COPY.ttsSuccess, 0.85).catch(() => {});
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
    roundTimerRef.current = setTimeout(() => advanceRound(), 900);
  }, [advanceRound, clearTimers, playSuccess]);
=======
    objX.value = nx;
    objY.value = ny;
    syncPos(nx, ny);
  }, [objX, objY, syncPos]);
>>>>>>> parent of d0342ff (Revert "fgh")

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
<<<<<<< HEAD
    setShowCelebrate(false);
    layoutStar();
    setRoundActive(true);
    setStatusHint(COPY.chaseHint);
    speakTTS(COPY.ttsCue, 0.78).catch(() => {});
    startMovement();
  }, [layoutStar, startMovement]);

  useEffect(() => {
    if (showInfo || done) return;
    if (round === 1) speakTTS(COPY.ttsIntro, 0.78).catch(() => {});
    clearTimers();
    setRoundActive(false);
    roundTimerRef.current = setTimeout(() => startRoundPlay(), P.roundStartDelayMs + 200);
    return clearTimers;
  }, [round, showInfo, done, startRoundPlay, clearTimers]);
=======
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
>>>>>>> parent of d0342ff (Revert "fgh")

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
<<<<<<< HEAD
      const { x, y } = starPosRef.current;
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
=======
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
>>>>>>> parent of d0342ff (Revert "fgh")

  if (showInfo) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
<<<<<<< HEAD
        <StarHuntInfoScreen onStart={() => setShowInfo(false)} onBack={handleExit} />
=======
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
>>>>>>> parent of d0342ff (Revert "fgh")
      </SafeAreaView>
    );
  }

<<<<<<< HEAD
  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message={COPY.congratsMessage}
=======
  if (showCongrats && done && finalStats) {
    return (
      <CongratulationsScreen
        message={COPY.congrats}
>>>>>>> parent of d0342ff (Revert "fgh")
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        xpAwarded={finalStats.xp}
        onContinue={() => {
          stopAllSpeech();
          cleanupSounds();
          onComplete ? onComplete() : onBack?.();
        }}
<<<<<<< HEAD
        onHome={handleExit}
=======
        onHome={exit}
>>>>>>> parent of d0342ff (Revert "fgh")
      />
    );
  }

<<<<<<< HEAD
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={handleExit} style={styles.backBtn} activeOpacity={0.85}>
        <Text style={styles.backText}>← Exit</Text>
      </TouchableOpacity>

      <StarHuntHUD
        round={round}
        totalRounds={P.rounds}
        score={score}
        hint={statusHint}
        showHint={roundActive}
      />

      <Pressable
        style={styles.cosmos}
=======
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
>>>>>>> parent of d0342ff (Revert "fgh")
        onLayout={(e) => {
          playW.current = e.nativeEvent.layout.width;
          playH.current = e.nativeEvent.layout.height;
        }}
        onPress={(e) => handleTap(e.nativeEvent.locationX, e.nativeEvent.locationY)}
      >
<<<<<<< HEAD
        <CosmosBackdrop />
        <TapRippleLayer ripples={ripples} />
        <WarpFlash visible={showWarp} x={starPos.x} y={starPos.y} />

        {!roundActive && round <= P.rounds && !done && (
          <View style={styles.readyBanner} pointerEvents="none">
            <Text style={styles.readyText}>🌌 Round {round}</Text>
          </View>
        )}

        {roundActive && (
          <>
            <StardustTrail points={trail} angle={starAngle} />
            <CometStarView
              x={starPos.x}
              y={starPos.y}
              scale={starScale}
              angle={starAngle}
              showAimRing={round <= 3}
            />
          </>
        )}

        <StarCelebration visible={showCelebrate} x={starPos.x} y={starPos.y} />
        <NearMissToast show={showNearMiss} />
        <ResultToast text={COPY.missHint} type="bad" show={showMissToast} />
=======
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
>>>>>>> parent of d0342ff (Revert "fgh")
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
  root: { flex: 1, backgroundColor: '#020617' },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 14,
    zIndex: 50,
    backgroundColor: 'rgba(2,6,23,0.75)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
  },
  backText: { color: '#FFFBEB', fontWeight: '800', fontSize: 14 },
  cosmos: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(251,191,36,0.25)',
    shadowColor: '#FBBF24',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  readyBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '44%',
    backgroundColor: 'rgba(30,27,75,0.88)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(251,191,36,0.4)',
    zIndex: 10,
  },
  readyText: { fontSize: 17, fontWeight: '800', color: '#FDE68A' },
=======
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
>>>>>>> parent of d0342ff (Revert "fgh")
});

export default StarHuntGame;
