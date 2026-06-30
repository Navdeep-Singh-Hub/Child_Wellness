/**
<<<<<<< HEAD
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
=======
 * OT Level 5 · Session 1 · Game 5 — Zigzag Run (Neon Circuit)
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import {
  CircuitBackdrop,
  CircuitIntroBackdrop,
  NeonRunner,
  PathHint,
  RunToast,
  ZigzagPathGuide,
} from '@/components/game/occupational/level5/session1/zigzagRun/ZigzagRunVisuals';
import {
  RUNNER_SIZE,
  ZIGZAG_RUN_COPY as COPY,
  ZIGZAG_RUN_THEME as THEME,
} from '@/components/game/occupational/level5/session1/zigzagRun/zigzagRunTheme';
import { distPx, useTraceSound } from '@/components/game/occupational/level5/session1/followUtils';
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
const NEAR_MISS_EXTRA = 38;
const TRAIL_LEN = 8;

const ZigzagRunGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({
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
const HALF = RUNNER_SIZE / 2;
const TAP_TOLERANCE = Platform.OS === 'android' ? P.tapTolerancePx + 14 : P.tapTolerancePx;

const ZigzagRunGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const [runnerPos, setRunnerPos] = useState({ x: 40, y: 200 });
  const [runnerScale, setRunnerScale] = useState(1);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [showNearMiss, setShowNearMiss] = useState(false);
  const [showMissToast, setShowMissToast] = useState(false);
  const [ripples, setRipples] = useState<TapRippleData[]>([]);
  const [statusHint, setStatusHint] = useState('');
  const [playSize, setPlaySize] = useState({ w: 360, h: 400 });
=======
  const [showCongrats, setShowCongrats] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [runnerPos, setRunnerPos] = useState({ x: 180, y: 200 });
  const [arenaSize, setArenaSize] = useState({ w: 360, h: 400 });
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
  const zigzagPhase = useRef(HALF);
  const zigzagDir = useRef(1);
<<<<<<< HEAD
  const runnerPosRef = useRef({ x: 40, y: 200 });
  const trailRef = useRef<TrailPoint[]>([]);
=======

  const objX = useSharedValue(180);
  const objY = useSharedValue(200);
  const objScale = useSharedValue(1);
  const objPosRef = useRef({ x: 180, y: 200 });

  const runnerStyle = useAnimatedStyle(() => ({ transform: [{ scale: objScale.value }] }));
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
    setRunnerPos({ x, y });
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
    const next: TrailPoint[] = [{ x, y, opacity: 1 }, ...trailRef.current].slice(0, TRAIL_LEN);
    next.forEach((pt, i) => {
      pt.opacity = 1 - i / TRAIL_LEN;
    });
    trailRef.current = next;
    setTrail([...next]);
  }, []);
=======
  const bumpScore = useCallback(() => {
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(COPY.ttsSuccess, 0.78).catch(() => {});
    flashToast('〰️ Perfect tap!');
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
    objScale.value = withSequence(withTiming(1.32, { duration: 140 }), withTiming(1, { duration: 140 }));
    bumpScore();
    roundTimerRef.current = setTimeout(() => advanceRound(), 700);
  }, [advanceRound, bumpScore, clearTimers, objScale]);
>>>>>>> parent of d0342ff (Revert "fgh")

  const layoutRunner = useCallback(() => {
    const w = playW.current;
    const h = playH.current;
    const pad = HALF + 8;
    zigzagPhase.current = pad;
    zigzagDir.current = 1;
<<<<<<< HEAD
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
=======
    objX.value = pad;
    objY.value = h * 0.5;
    syncPos(pad, h * 0.5);
  }, [objX, objY, syncPos]);

  const tickMove = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
    const w = playW.current;
    const h = playH.current;
    const pad = HALF;

    zigzagPhase.current += P.zigzagSpeedPx * zigzagDir.current;
    objX.value = zigzagPhase.current;
    objY.value = h * 0.5 + Math.sin(zigzagPhase.current * P.zigzagFrequency) * P.zigzagAmplitudePx;

    if (objX.value >= w - pad) {
      zigzagDir.current = -1;
      zigzagPhase.current = w - pad;
    } else if (objX.value <= pad) {
      zigzagDir.current = 1;
      zigzagPhase.current = pad;
    }

    syncPos(objX.value, objY.value);
  }, [objX, objY, syncPos]);
>>>>>>> parent of d0342ff (Revert "fgh")

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
<<<<<<< HEAD
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
=======
    setRoundActive(true);
    setPhase('playing');
    layoutRunner();
    speakTTS(COPY.ttsCue, 0.78).catch(() => {});
    moveTimerRef.current = setInterval(tickMove, P.moveTickMs);
  }, [layoutRunner, tickMove]);

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
      ? 'Wave charging…'
      : 'Booting circuit…'
    : '〰️ Tap the neon runner on the wave!';
>>>>>>> parent of d0342ff (Revert "fgh")

  if (showInfo) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
<<<<<<< HEAD
        <ZigzagRunInfoScreen onStart={() => setShowInfo(false)} onBack={handleExit} />
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
            backdrop: <CircuitIntroBackdrop />,
            floatEmoji: '🔮',
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
=======
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <LinearGradient colors={[...THEME.sky]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={exit} style={styles.exitBtn}>
        <Text style={styles.exitText}>← Exit</Text>
      </TouchableOpacity>

      <Session2HUD
        theme={THEME}
        gameTitle="Run"
        emoji={COPY.emoji}
        round={round}
        totalRounds={P.rounds}
        score={score}
        scoreLabel="TAPS"
        hint={hint}
        showHint={phase === 'playing'}
      />

      <Pressable
        style={styles.arena}
        onLayout={(e) => {
          playW.current = e.nativeEvent.layout.width;
          playH.current = e.nativeEvent.layout.height;
          setArenaSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
>>>>>>> parent of d0342ff (Revert "fgh")
        }}
        onPress={(e) => handleTap(e.nativeEvent.locationX, e.nativeEvent.locationY)}
      >
        <CircuitBackdrop />
<<<<<<< HEAD
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
=======
        <ZigzagPathGuide width={arenaSize.w} height={arenaSize.h} />
        <PathHint />
        {roundActive && <NeonRunner x={runnerPos.x} y={runnerPos.y} size={RUNNER_SIZE} scaleStyle={runnerStyle} />}
        <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={THEME.accent} />
        <RunToast text={toast} visible={showToast} />
        {phase === 'countdown' && (
          <RoundCountdownOverlay key={`cd-${round}`} accent={THEME.accent} onDone={startRoundPlay} />
        )}
        {!roundActive && phase !== 'countdown' && (
          <View style={styles.waitLayer} pointerEvents="none">
            <Text style={styles.waitText}>Loading circuit…</Text>
          </View>
        )}
>>>>>>> parent of d0342ff (Revert "fgh")
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
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
=======
  root: { flex: 1, backgroundColor: COPY.rootBg },
  exitBtn: {
    position: 'absolute',
    top: 52,
    left: 12,
    zIndex: 50,
    backgroundColor: 'rgba(10,1,24,0.72)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.3)',
  },
  exitText: { color: '#F0ABFC', fontWeight: '800', fontSize: 13 },
  arena: {
    flex: 1,
    margin: 10,
    marginTop: 4,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(34,211,238,0.25)',
    backgroundColor: 'rgba(10,1,24,0.45)',
  },
  waitLayer: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 6 },
  waitText: { fontSize: 16, fontWeight: '800', color: THEME.subtitle },
>>>>>>> parent of d0342ff (Revert "fgh")
});

export default ZigzagRunGame;
