/**
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
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const TARGET_HALF = P.targetHalfBombPx;
const BOMB_HALF = P.bombHalfPx;
const MIN_SEP = 150;
const TAP_TOLERANCE = Platform.OS === 'android' ? P.tapTolerancePx + 14 : P.tapTolerancePx;

type Entity = { id: string; x: number; y: number };

const SafeTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({
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
  const [statusHint, setStatusHint] = useState('');
  const [target, setTarget] = useState<Entity | null>(null);
  const [bombs, setBombs] = useState<Entity[]>([]);
  const [hitBombId, setHitBombId] = useState<string | null>(null);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [ripples, setRipples] = useState<TapRippleData[]>([]);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const jitterRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rippleIdRef = useRef(0);
  const playW = useRef(360);
  const playH = useRef(400);

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
    setRipples((prev) => [...prev.slice(-5), { id, x, y, kind }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 650);
  }, []);

  const clearTimers = useCallback(() => {
    if (jitterRef.current) {
      clearInterval(jitterRef.current);
      jitterRef.current = null;
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
    setHitBombId(null);
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

  const layoutEntities = useCallback(() => {
    const w = playW.current;
    const h = playH.current;
    const padT = TARGET_HALF + 8;
    const padB = BOMB_HALF + 8;
    const tx = padT + Math.random() * (w - padT * 2);
    const ty = padT + 40 + Math.random() * (h - padT * 2 - 40);
    const newTarget: Entity = { id: 'target', x: tx, y: ty };
    const newBombs: Entity[] = [];

    for (let i = 0; i < P.bombCount; i++) {
      let bx = 0;
      let by = 0;
      let ok = false;
      for (let attempt = 0; attempt < 24; attempt++) {
        bx = padB + Math.random() * (w - padB * 2);
        by = padB + 40 + Math.random() * (h - padB * 2 - 40);
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
    setHitBombId(null);
    setShowCelebrate(false);
    setRoundActive(true);
    layoutEntities();
    setStatusHint(COPY.tapHint);
    speakTTS(COPY.ttsCue, 0.78).catch(() => {});
    jitterRef.current = setInterval(tickJitter, P.bombJitterMs);
  }, [layoutEntities, tickJitter]);

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
      if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current || !target) return;

      for (const bomb of bombs) {
        if (distPx(locationX, locationY, bomb.x, bomb.y) <= TAP_TOLERANCE + BOMB_HALF) {
          addRipple(locationX, locationY, 'bomb');
          setHitBombId(bomb.id);
          setShakeKey((k) => k + 1);
          setTimeout(() => setHitBombId(null), 400);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          speakTTS(COPY.ttsBomb, 0.78).catch(() => {});
          setStatusHint(COPY.bombHint);
          return;
        }
      }

      if (distPx(locationX, locationY, target.x, target.y) <= TAP_TOLERANCE + TARGET_HALF) {
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

  if (showInfo) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <SafeTapInfoScreen onStart={() => setShowInfo(false)} onBack={handleExit} />
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
});

export default SafeTapGame;
