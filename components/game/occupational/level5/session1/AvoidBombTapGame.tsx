/**
 * Tap target / avoid bombs core for OT Level 5 Session 1.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { distPx, useTraceSound } from '@/components/game/occupational/level5/session1/followUtils';
import { SESSION5_1_PACING } from '@/components/game/occupational/level5/session1/session1Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION5_1_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const STAR = require('@/assets/icons/star.png');
const TARGET_HALF = P.targetHalfBombPx;
const BOMB_HALF = P.bombHalfPx;
const MIN_SEP = 150;

type Entity = { id: string; x: number; y: number };

export type AvoidBombTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  targetEmoji: string;
  targetBg: string;
  bombEmoji: string;
  bombBg: string;
  backText: string;
  backBorder: string;
  titleColor: string;
  subtitleColor: string;
  statLabel: string;
  statValue: string;
  statBorder: string;
  playBorder: string;
  playBg: string;
  sparkleColor: string;
};

export type AvoidBombTapGameConfig = {
  theme: AvoidBombTheme;
  ttsIntro: string;
  ttsComplete: string;
  ttsCue?: string;
  ttsSuccess?: string;
  ttsBomb?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const AvoidBombTapGame: React.FC<
  AvoidBombTapGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  ttsIntro,
  ttsComplete,
  ttsCue = 'Tap the target, avoid the bombs!',
  ttsSuccess = 'Great focus!',
  ttsBomb = 'Avoid the bombs!',
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [statusHint, setStatusHint] = useState('');
  const [target, setTarget] = useState<Entity | null>(null);
  const [bombs, setBombs] = useState<Entity[]>([]);
  const [bombFlashId, setBombFlashId] = useState<string | null>(null);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const jitterRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);

  const targetScale = useSharedValue(1);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

  const targetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: targetScale.value }],
  }));

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
      speakTTS(ttsComplete, 0.78);
      recordGame(xp)
        .then(() =>
          logGameAndAward({
            type: logType,
            correct: finalScore,
            total,
            accuracy: (finalScore / total) * 100,
            xpAwarded: xp,
            skillTags,
          }),
        )
        .then(() => router.setParams({ refreshStats: Date.now().toString() }))
        .catch(console.error);
    },
    [clearTimers, logType, router, skillTags, ttsComplete],
  );

  const bumpScore = useCallback(() => {
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(ttsSuccess, 0.78).catch(() => {});
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
  }, [playSuccess, ttsSuccess]);

  const advanceRound = useCallback(() => {
    clearTimers();
    setRoundActive(false);
    roundCompleteRef.current = false;
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    clearTimers();
    targetScale.value = withSequence(withTiming(1.3, { duration: 140 }), withTiming(1, { duration: 140 }));
    bumpScore();
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore, clearTimers, targetScale]);

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
    setRoundActive(true);
    layoutEntities();
    setStatusHint('Tap the target only!');
    speakTTS(ttsCue, 0.78).catch(() => {});
    jitterRef.current = setInterval(tickJitter, P.bombJitterMs);
  }, [layoutEntities, tickJitter, ttsCue]);

  useEffect(() => {
    if (round === 1) speakTTS(ttsIntro, 0.78);
    clearTimers();
    setRoundActive(false);
    roundTimerRef.current = setTimeout(() => startRoundPlay(), P.roundStartDelayMs);
    return clearTimers;
  }, [round, startRoundPlay, ttsIntro, clearTimers]);

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
        if (distPx(locationX, locationY, bomb.x, bomb.y) <= P.tapTolerancePx + BOMB_HALF) {
          setBombFlashId(bomb.id);
          setTimeout(() => setBombFlashId(null), 200);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          speakTTS(ttsBomb, 0.78).catch(() => {});
          return;
        }
      }

      if (distPx(locationX, locationY, target.x, target.y) <= P.tapTolerancePx + TARGET_HALF) {
        completeRound();
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    },
    [bombs, completeRound, target, ttsBomb],
  );

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message={congratsMessage}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        xpAwarded={finalStats.xp}
        onContinue={() => {
          stopAllSpeech();
          cleanupSounds();
          onComplete ? onComplete() : onBack?.();
        }}
        onHome={() => {
          stopAllSpeech();
          cleanupSounds();
          onBack?.();
        }}
      />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity
        onPress={() => {
          stopAllSpeech();
          cleanupSounds();
          clearTimers();
          onBack?.();
        }}
        style={styles.backBtn}
      >
        <View style={[styles.backInner, { borderColor: T.backBorder }]}>
          <Text style={[styles.backText, { color: T.backText }]}>← Back</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: T.titleColor }]}>
          {T.emoji} {T.title}
        </Text>
        <Text style={[styles.subtitle, { color: T.subtitleColor }]}>{T.subtitle}</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statPill, { borderColor: T.statBorder }]}>
            <Text style={[styles.statLabel, { color: T.statLabel }]}>Round</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>
              {round}/{P.rounds}
            </Text>
          </View>
          <View style={[styles.statPill, styles.starPill, { borderColor: T.statBorder }]}>
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
        {roundActive && statusHint ? (
          <Text style={[styles.hint, { color: T.accentDark }]}>{statusHint}</Text>
        ) : null}
      </View>

      <Pressable
        style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
        onLayout={(e) => {
          playW.current = e.nativeEvent.layout.width;
          playH.current = e.nativeEvent.layout.height;
        }}
        onPress={(e) => handleTap(e.nativeEvent.locationX, e.nativeEvent.locationY)}
      >
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}
        {roundActive && target && (
          <Animated.View
            style={[
              styles.target,
              { backgroundColor: T.targetBg, left: target.x - TARGET_HALF, top: target.y - TARGET_HALF },
              targetAnimStyle,
            ]}
          >
            <Text style={styles.entityEmoji}>{T.targetEmoji}</Text>
          </Animated.View>
        )}
        {roundActive &&
          bombs.map((bomb) => (
            <View
              key={bomb.id}
              pointerEvents="none"
              style={[
                styles.bomb,
                {
                  backgroundColor: T.bombBg,
                  left: bomb.x - BOMB_HALF,
                  top: bomb.y - BOMB_HALF,
                  transform: [{ scale: bombFlashId === bomb.id ? 1.25 : 1 }],
                },
              ]}
            >
              <Text style={styles.entityEmoji}>{T.bombEmoji}</Text>
            </View>
          ))}
        <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1 },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  target: {
    position: 'absolute',
    width: TARGET_HALF * 2,
    height: TARGET_HALF * 2,
    borderRadius: TARGET_HALF,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
    zIndex: 3,
  },
  bomb: {
    position: 'absolute',
    width: BOMB_HALF * 2,
    height: BOMB_HALF * 2,
    borderRadius: BOMB_HALF,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
    zIndex: 2,
  },
  entityEmoji: { fontSize: 32 },
});

export default AvoidBombTapGame;
