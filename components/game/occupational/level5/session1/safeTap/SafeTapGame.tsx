/**
<<<<<<< HEAD
 * OT Level 5 · Session 1 · Game 3 — Safe Tap
 * Crystal cavern selective-attention experience.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import {
  CavernBackdrop,
  CrystalCelebration,
  CrystalTarget,
  DangerMine,
  SafeTapHUD,
  SafeTapInfoScreen,
  ScreenShake,
  TapRippleLayer,
  type TapRippleData,
} from '@/components/game/occupational/level5/session1/safeTap/SafeTapVisuals';
import { SAFE_TAP_COPY as COPY } from '@/components/game/occupational/level5/session1/safeTap/safeTapTheme';
import { distPx, useTraceSound } from '@/components/game/occupational/level5/session1/followUtils';
import { SESSION5_1_PACING as P } from '@/components/game/occupational/level5/session1/session1Pacing';
=======
 * OT Level 5 · Session 1 · Game 3 — Safe Tap (Clearance Zone)
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import {
  ClearanceBackdrop,
  ClearanceIntroBackdrop,
  DangerFlashOverlay,
  DangerMine,
  LegendBar,
  MissionToast,
  SafeShieldTarget,
} from '@/components/game/occupational/level5/session1/safeTap/SafeTapVisuals';
import {
  MINE_SIZE,
  SAFE_TAP_COPY as COPY,
  SAFE_TAP_THEME as THEME,
  TARGET_SIZE,
} from '@/components/game/occupational/level5/session1/safeTap/safeTapTheme';
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
const TARGET_HALF = P.targetHalfBombPx;
const BOMB_HALF = P.bombHalfPx;
=======
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const TARGET_HALF = TARGET_SIZE / 2;
const BOMB_HALF = MINE_SIZE / 2;
>>>>>>> parent of d0342ff (Revert "fgh")
const MIN_SEP = 150;
const TAP_TOLERANCE = Platform.OS === 'android' ? P.tapTolerancePx + 14 : P.tapTolerancePx;

type Entity = { id: string; x: number; y: number };

<<<<<<< HEAD
const SafeTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({
  onBack,
  onComplete,
}) => {
=======
const SafeTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const [statusHint, setStatusHint] = useState('');
  const [target, setTarget] = useState<Entity | null>(null);
  const [bombs, setBombs] = useState<Entity[]>([]);
  const [hitBombId, setHitBombId] = useState<string | null>(null);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [ripples, setRipples] = useState<TapRippleData[]>([]);
=======
  const [showCongrats, setShowCongrats] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [target, setTarget] = useState<Entity | null>(null);
  const [bombs, setBombs] = useState<Entity[]>([]);
  const [bombFlashId, setBombFlashId] = useState<string | null>(null);
  const [dangerFlash, setDangerFlash] = useState(false);
  const [toast, setToast] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastDanger, setToastDanger] = useState(false);
>>>>>>> parent of d0342ff (Revert "fgh")

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const jitterRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
<<<<<<< HEAD
  const rippleIdRef = useRef(0);
  const playW = useRef(360);
  const playH = useRef(400);

=======
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);

  const targetScale = useSharedValue(1);
  const targetAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: targetScale.value }] }));

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
    setRipples((prev) => [...prev.slice(-5), { id, x, y, kind }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 650);
  }, []);

=======
>>>>>>> parent of d0342ff (Revert "fgh")
  const clearTimers = useCallback(() => {
    if (jitterRef.current) {
      clearInterval(jitterRef.current);
      jitterRef.current = null;
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
    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current);
      flashTimerRef.current = null;
    }
  }, []);

  const flashToast = useCallback((text: string, danger = false, ms = 900) => {
    setToast(text);
    setToastDanger(danger);
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(false), ms);
  }, []);

  const flashDanger = useCallback(() => {
    setDangerFlash(true);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setDangerFlash(false), 280);
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
  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    setShowCelebrate(false);
    roundCompleteRef.current = false;
    setHitBombId(null);
=======
  const bumpScore = useCallback(() => {
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(COPY.ttsSuccess, 0.78).catch(() => {});
    flashToast('🛡️ Target secured!');
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
  }, [flashToast, playSuccess]);

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
    setTarget(null);
    setBombs([]);
>>>>>>> parent of d0342ff (Revert "fgh")
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
<<<<<<< HEAD
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs + 200);
=======
    setRound((r) => r + 1);
    setPhase('countdown');
>>>>>>> parent of d0342ff (Revert "fgh")
  }, [clearTimers, endGame]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    clearTimers();
<<<<<<< HEAD
    setShowCelebrate(true);
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(COPY.ttsSuccess, 0.85).catch(() => {});
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
    roundTimerRef.current = setTimeout(() => advanceRound(), 850);
  }, [advanceRound, clearTimers, playSuccess]);
=======
    targetScale.value = withSequence(withTiming(1.22, { duration: 140 }), withTiming(1, { duration: 140 }));
    bumpScore();
    roundTimerRef.current = setTimeout(() => advanceRound(), 700);
  }, [advanceRound, bumpScore, clearTimers, targetScale]);
>>>>>>> parent of d0342ff (Revert "fgh")

  const layoutEntities = useCallback(() => {
    const w = playW.current;
    const h = playH.current;
    const padT = TARGET_HALF + 8;
    const padB = BOMB_HALF + 8;
    const tx = padT + Math.random() * (w - padT * 2);
<<<<<<< HEAD
    const ty = padT + 40 + Math.random() * (h - padT * 2 - 40);
=======
    const ty = padT + 48 + Math.random() * (h - padT * 2 - 48);
>>>>>>> parent of d0342ff (Revert "fgh")
    const newTarget: Entity = { id: 'target', x: tx, y: ty };
    const newBombs: Entity[] = [];

    for (let i = 0; i < P.bombCount; i++) {
      let bx = 0;
      let by = 0;
      let ok = false;
      for (let attempt = 0; attempt < 24; attempt++) {
        bx = padB + Math.random() * (w - padB * 2);
<<<<<<< HEAD
        by = padB + 40 + Math.random() * (h - padB * 2 - 40);
=======
        by = padB + 48 + Math.random() * (h - padB * 2 - 48);
>>>>>>> parent of d0342ff (Revert "fgh")
        if (distPx(bx, by, tx, ty) >= MIN_SEP) {
          ok = true;
          break;
        }
      }
      if (ok) newBombs.push({ id: `bomb-${i}`, x: bx, y: by });
    }

    setTarget(newTarget);
    setBombs(newBombs);
  }, []);

  const tickJitter = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
    const w = playW.current;
    const h = playH.current;
    const padT = TARGET_HALF;
    const padB = BOMB_HALF;

    setTarget((prev) => {
      if (!prev) return prev;
      const nx = Math.max(padT, Math.min(w - padT, prev.x + (Math.random() - 0.5) * P.jitterTargetPx * 2));
      const ny = Math.max(padT + 36, Math.min(h - padT, prev.y + (Math.random() - 0.5) * P.jitterTargetPx * 2));
      return { ...prev, x: nx, y: ny };
    });

    setBombs((prev) =>
      prev.map((b) => {
        const nx = Math.max(padB, Math.min(w - padB, b.x + (Math.random() - 0.5) * P.jitterBombPx * 2));
        const ny = Math.max(padB + 36, Math.min(h - padB, b.y + (Math.random() - 0.5) * P.jitterBombPx * 2));
        return { ...b, x: nx, y: ny };
      }),
    );
  }, []);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
<<<<<<< HEAD
    setHitBombId(null);
    setShowCelebrate(false);
    setRoundActive(true);
    layoutEntities();
    setStatusHint(COPY.tapHint);
=======
    setRoundActive(true);
    setPhase('playing');
    layoutEntities();
>>>>>>> parent of d0342ff (Revert "fgh")
    speakTTS(COPY.ttsCue, 0.78).catch(() => {});
    jitterRef.current = setInterval(tickJitter, P.bombJitterMs);
  }, [layoutEntities, tickJitter]);

  useEffect(() => {
    if (showInfo || done) return;
<<<<<<< HEAD
    if (round === 1) speakTTS(COPY.ttsIntro, 0.78).catch(() => {});
    clearTimers();
    setRoundActive(false);
    roundTimerRef.current = setTimeout(() => startRoundPlay(), P.roundStartDelayMs + 200);
    return clearTimers;
  }, [round, showInfo, done, startRoundPlay, clearTimers]);
=======
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
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current || !target) return;

      for (const bomb of bombs) {
        if (distPx(locationX, locationY, bomb.x, bomb.y) <= TAP_TOLERANCE + BOMB_HALF) {
<<<<<<< HEAD
          addRipple(locationX, locationY, 'bomb');
          setHitBombId(bomb.id);
          setShakeKey((k) => k + 1);
          setTimeout(() => setHitBombId(null), 400);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          speakTTS(COPY.ttsBomb, 0.78).catch(() => {});
          setStatusHint(COPY.bombHint);
=======
          setBombFlashId(bomb.id);
          setTimeout(() => setBombFlashId(null), 220);
          flashDanger();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          speakTTS(COPY.ttsBomb, 0.78).catch(() => {});
          flashToast('💣 Danger! Tap the green shield only', true);
>>>>>>> parent of d0342ff (Revert "fgh")
          return;
        }
      }

      if (distPx(locationX, locationY, target.x, target.y) <= TAP_TOLERANCE + TARGET_HALF) {
<<<<<<< HEAD
        addRipple(locationX, locationY, 'hit');
        completeRound();
      } else {
        addRipple(locationX, locationY, 'miss');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        setStatusHint(COPY.missHint);
      }
    },
    [addRipple, bombs, completeRound, target],
  );

  const handleExit = useCallback(() => {
    stopAllSpeech();
    cleanupSounds();
    clearTimers();
    onBack?.();
  }, [clearTimers, onBack]);
=======
        completeRound();
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    },
    [bombs, completeRound, flashDanger, flashToast, target],
  );

  const hint = !roundActive
    ? phase === 'countdown'
      ? 'Scanning zone…'
      : 'Stand by…'
    : '🛡️ Tap GREEN shield · Avoid RED mines';
>>>>>>> parent of d0342ff (Revert "fgh")

  if (showInfo) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
<<<<<<< HEAD
        <SafeTapInfoScreen onStart={() => setShowInfo(false)} onBack={handleExit} />
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
            backdrop: <ClearanceIntroBackdrop />,
            floatEmoji: '🛡️',
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

      <SafeTapHUD
        round={round}
        totalRounds={P.rounds}
        score={score}
        hint={statusHint}
        showHint={roundActive}
      />

      <ScreenShake trigger={shakeKey}>
        <Pressable
          style={styles.cavern}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
          }}
          onPress={(e) => handleTap(e.nativeEvent.locationX, e.nativeEvent.locationY)}
        >
          <CavernBackdrop />
          <TapRippleLayer ripples={ripples} />

          {!roundActive && round <= P.rounds && !done && (
            <View style={styles.readyBanner} pointerEvents="none">
              <Text style={styles.readyText}>💎 Round {round}</Text>
            </View>
          )}

          {roundActive && target && (
            <CrystalTarget x={target.x} y={target.y} celebrating={showCelebrate} />
          )}
          {roundActive &&
            bombs.map((bomb) => (
              <DangerMine
                key={bomb.id}
                x={bomb.x}
                y={bomb.y}
                triggered={hitBombId === bomb.id}
              />
            ))}

          {showCelebrate && target && (
            <CrystalCelebration x={target.x} y={target.y} />
          )}
        </Pressable>
      </ScreenShake>
=======
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <LinearGradient colors={[...THEME.sky]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={exit} style={styles.exitBtn}>
        <Text style={styles.exitText}>← Exit</Text>
      </TouchableOpacity>

      <Session2HUD
        theme={THEME}
        gameTitle="Clearance"
        emoji={COPY.emoji}
        round={round}
        totalRounds={P.rounds}
        score={score}
        scoreLabel="SECURED"
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
        <ClearanceBackdrop />
        <LegendBar />
        {roundActive && target && (
          <SafeShieldTarget x={target.x} y={target.y} size={TARGET_SIZE} scaleStyle={targetAnimStyle} />
        )}
        {roundActive &&
          bombs.map((bomb) => (
            <DangerMine key={bomb.id} x={bomb.x} y={bomb.y} size={MINE_SIZE} flashing={bombFlashId === bomb.id} />
          ))}
        <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={THEME.accent} />
        <DangerFlashOverlay visible={dangerFlash} />
        <MissionToast text={toast} visible={showToast} danger={toastDanger} />
        {phase === 'countdown' && (
          <RoundCountdownOverlay key={`cd-${round}`} accent={THEME.accent} onDone={startRoundPlay} />
        )}
        {!roundActive && phase !== 'countdown' && (
          <View style={styles.waitLayer} pointerEvents="none">
            <Text style={styles.waitText}>Initializing zone…</Text>
          </View>
        )}
      </Pressable>
>>>>>>> parent of d0342ff (Revert "fgh")
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
  root: { flex: 1, backgroundColor: '#0F172A' },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 14,
    zIndex: 50,
    backgroundColor: 'rgba(15,23,42,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  backText: { color: '#F0FDF4', fontWeight: '800', fontSize: 14 },
  cavern: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(52,211,153,0.3)',
    shadowColor: '#34D399',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  readyBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '44%',
    backgroundColor: 'rgba(30,27,75,0.85)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(52,211,153,0.4)',
    zIndex: 10,
  },
  readyText: { fontSize: 17, fontWeight: '800', color: '#A7F3D0' },
=======
  root: { flex: 1, backgroundColor: COPY.rootBg },
  exitBtn: {
    position: 'absolute',
    top: 52,
    left: 12,
    zIndex: 50,
    backgroundColor: 'rgba(15,23,42,0.72)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
  },
  exitText: { color: '#ECFDF5', fontWeight: '800', fontSize: 13 },
  arena: {
    flex: 1,
    margin: 10,
    marginTop: 4,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(52,211,153,0.28)',
    backgroundColor: 'rgba(15,23,42,0.35)',
  },
  waitLayer: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 6 },
  waitText: { fontSize: 16, fontWeight: '800', color: THEME.subtitle },
>>>>>>> parent of d0342ff (Revert "fgh")
});

export default SafeTapGame;
