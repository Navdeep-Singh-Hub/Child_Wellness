/**
 * Balanced-pace two-hand drag core for OT Level 4 Session 9.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import {
  createObjectPanGesture,
  createSimultaneousDualPan,
  useTraceSound,
} from '@/components/game/occupational/level4/session9/dualDragUtils';
import { SESSION4_9_PACING } from '@/components/game/occupational/level4/session9/session9Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION4_9_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const STAR = require('@/assets/icons/star.png');
const HALF = P.objHalfPx;

export type BalanceDualTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  accent: string;
  accentDark: string;
  leftColor: string;
  rightColor: string;
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

export type BalanceDualDragGameConfig = {
  theme: BalanceDualTheme;
  ttsIntro: string;
  ttsComplete: string;
  ttsCue?: string;
  ttsSuccess?: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

export const BalanceDualDragGame: React.FC<
  BalanceDualDragGameConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  ttsIntro,
  ttsComplete,
  ttsCue = 'Drag both down together at the same speed!',
  ttsSuccess = 'Perfect balance!',
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
  const [targetY, setTargetY] = useState(288);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundActiveRef = useRef(false);
  const roundCompleteRef = useRef(false);
  const targetYRef = useRef(288);
  const leftReachedAtRef = useRef<number | null>(null);
  const rightReachedAtRef = useRef<number | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playW = useRef(360);
  const playH = useRef(400);

  const leftX = useSharedValue(90);
  const leftY = useSharedValue(96);
  const leftScale = useSharedValue(1);
  const rightX = useSharedValue(270);
  const rightY = useSharedValue(96);
  const rightScale = useSharedValue(1);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

  const leftStyle = useAnimatedStyle(() => ({
    left: leftX.value - HALF,
    top: leftY.value - HALF,
    transform: [{ scale: leftScale.value }],
  }));
  const rightStyle = useAnimatedStyle(() => ({
    left: rightX.value - HALF,
    top: rightY.value - HALF,
    transform: [{ scale: rightScale.value }],
  }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    cancelAnimation(leftX);
    cancelAnimation(leftY);
    cancelAnimation(rightX);
    cancelAnimation(rightY);
  }, [leftX, leftY, rightX, rightY]);

  const layoutRound = useCallback(() => {
    const w = playW.current;
    const h = playH.current;
    const ty = h * P.balanceTargetYPct;
    targetYRef.current = ty;
    setTargetY(ty);
    leftX.value = w * 0.25;
    leftY.value = h * 0.22;
    rightX.value = w * 0.75;
    rightY.value = h * 0.22;
    leftReachedAtRef.current = null;
    rightReachedAtRef.current = null;
  }, [leftX, leftY, rightX, rightY]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.rounds;
      const xp = Math.round(finalScore * 20);
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
    bumpScore();
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, bumpScore]);

  const checkBalance = useCallback(() => {
    if (!roundActiveRef.current || roundCompleteRef.current || doneRef.current) return;
    const ty = targetYRef.current;
    const now = Date.now();
    const leftAt = Math.abs(leftY.value - ty) <= P.balanceTolerancePx;
    const rightAt = Math.abs(rightY.value - ty) <= P.balanceTolerancePx;

    if (leftAt) {
      if (!leftReachedAtRef.current) leftReachedAtRef.current = now;
    } else {
      leftReachedAtRef.current = null;
    }

    if (rightAt) {
      if (!rightReachedAtRef.current) rightReachedAtRef.current = now;
    } else {
      rightReachedAtRef.current = null;
    }

    if (
      leftReachedAtRef.current &&
      rightReachedAtRef.current &&
      Math.abs(leftReachedAtRef.current - rightReachedAtRef.current) <= P.balanceSyncMs
    ) {
      completeRound();
    }
  }, [completeRound, leftY, rightY]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    layoutRound();
    setStatusHint('Drag both down at the same pace!');
    speakTTS(ttsCue, 0.78).catch(() => {});
  }, [layoutRound, ttsCue]);

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

  const isDragActive = useCallback(
    () => roundActiveRef.current && !roundCompleteRef.current && !doneRef.current,
    [],
  );

  const leftPan = createObjectPanGesture({
    objX: leftX,
    objY: leftY,
    objScale: leftScale,
    playW,
    playH,
    half: HALF,
    isActive: isDragActive,
    clampX: (x, w, _h, half) => Math.max(half, Math.min(w * 0.5 - half, x)),
    onUpdate: () => checkBalance(),
  });

  const rightPan = createObjectPanGesture({
    objX: rightX,
    objY: rightY,
    objScale: rightScale,
    playW,
    playH,
    half: HALF,
    isActive: isDragActive,
    clampX: (x, w, _h, half) => Math.max(w * 0.5 + half, Math.min(w - half, x)),
    onUpdate: () => checkBalance(),
  });

  const dualGesture = createSimultaneousDualPan(leftPan, rightPan);

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

      <GestureDetector gesture={dualGesture}>
        <View
          style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}
          onLayout={(e) => {
            playW.current = e.nativeEvent.layout.width;
            playH.current = e.nativeEvent.layout.height;
            layoutRound();
          }}
        >
          {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}
          {roundActive && (
            <View style={[styles.balanceLine, { top: targetY - 2, borderColor: T.accent }]}>
              <Text style={[styles.lineLabel, { color: T.accentDark }]}>BALANCE LINE</Text>
            </View>
          )}
          {roundActive && (
            <>
              <Animated.View style={[styles.obj, { backgroundColor: T.leftColor }, leftStyle]}>
                <Text style={styles.objEmoji}>⚖️</Text>
              </Animated.View>
              <Animated.View style={[styles.obj, { backgroundColor: T.rightColor }, rightStyle]}>
                <Text style={styles.objEmoji}>⚖️</Text>
              </Animated.View>
            </>
          )}
          <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
        </View>
      </GestureDetector>
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
  balanceLine: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 4,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  lineLabel: { position: 'absolute', top: -18, fontSize: 10, fontWeight: '800' },
  obj: {
    position: 'absolute',
    width: HALF * 2,
    height: HALF * 2,
    borderRadius: HALF,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  objEmoji: { fontSize: 30 },
});

export default BalanceDualDragGame;
