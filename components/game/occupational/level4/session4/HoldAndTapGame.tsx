/**
 * Hold one hand, tap with the other — OT Level 4 Session 4.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { useTraceSound } from '@/components/game/occupational/level4/session4/dualTapUtils';
import { SESSION4_4_PACING } from '@/components/game/occupational/level4/session4/session4Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION4_4_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const STAR = require('@/assets/icons/star.png');

const THEME = {
  title: 'Hold & Hit',
  subtitle: 'Hold with one hand, tap with the other',
  emoji: '🤲',
  gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#10B981'] as [string, string, string, string],
  accent: '#10B981',
  accentDark: '#047857',
  backText: '#065F46',
  backBorder: 'rgba(16,185,129,0.25)',
  titleColor: '#064E3B',
  subtitleColor: '#059669',
  statLabel: '#10B981',
  statValue: '#064E3B',
  statBorder: 'rgba(16,185,129,0.2)',
  playBorder: 'rgba(16,185,129,0.25)',
  playBg: 'rgba(255,255,255,0.35)',
  sparkleColor: '#10B981',
};

const HoldAndTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({
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
  const [holdSide, setHoldSide] = useState<'left' | 'right'>('left');
  const [holdProgress, setHoldProgress] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  const doneRef = useRef(false);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const roundCompleteRef = useRef(false);
  const isHoldingRef = useRef(false);
  const holdProgressRef = useRef(0);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const holdScale = useSharedValue(1);
  const tapScale = useSharedValue(1);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    isHoldingRef.current = isHolding;
  }, [isHolding]);
  useEffect(() => {
    holdProgressRef.current = holdProgress;
  }, [holdProgress]);

  const holdStyle = useAnimatedStyle(() => ({ transform: [{ scale: holdScale.value }] }));
  const tapStyle = useAnimatedStyle(() => ({ transform: [{ scale: tapScale.value }] }));

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    cancelAnimation(holdScale);
    cancelAnimation(tapScale);
  }, [holdScale, tapScale]);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = P.rounds;
      const xp = Math.round(finalScore * 15);
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      clearTimers();
      setShowCongratulations(true);
      speakTTS('Amazing hand independence!', 0.78);
      recordGame(xp)
        .then(() =>
          logGameAndAward({
            type: 'hold-and-tap',
            correct: finalScore,
            total,
            accuracy: (finalScore / total) * 100,
            xpAwarded: xp,
            skillTags: ['hand-independence', 'two-hand-tap'],
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
    setIsHolding(false);
    isHoldingRef.current = false;
    roundCompleteRef.current = false;
    if (roundRef.current >= P.rounds) {
      endGame(scoreRef.current);
      return;
    }
    roundTimerRef.current = setTimeout(() => setRound((r) => r + 1), P.nextRoundDelayMs);
  }, [clearTimers, endGame]);

  const resetRound = useCallback((side: 'left' | 'right') => {
    setHoldProgress(0);
    holdProgressRef.current = 0;
    setTapCount(0);
    setIsHolding(false);
    isHoldingRef.current = false;
    setHoldSide(side);
    holdScale.value = withSpring(1);
    tapScale.value = withSpring(1);
  }, [holdScale, tapScale]);

  const completeRound = useCallback(() => {
    if (roundCompleteRef.current || doneRef.current) return;
    roundCompleteRef.current = true;
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS('Perfect hand independence!', 0.78).catch(() => {});
    setScore((s) => {
      scoreRef.current = s + 1;
      return s + 1;
    });
    clearTimers();
    roundTimerRef.current = setTimeout(() => advanceRound(), 650);
  }, [advanceRound, clearTimers, playSuccess]);

  const startRoundPlay = useCallback(() => {
    if (doneRef.current) return;
    roundCompleteRef.current = false;
    setRoundActive(true);
    const side: 'left' | 'right' = Math.random() < 0.5 ? 'left' : 'right';
    resetRound(side);
    speakTTS(
      side === 'left' ? 'Hold with your left hand, tap with your right!' : 'Hold with your right hand, tap with your left!',
      0.78,
    ).catch(() => {});
  }, [resetRound]);

  useEffect(() => {
    if (round === 1) speakTTS('Hold with one hand and tap with the other!', 0.78);
    clearTimers();
    setRoundActive(false);
    roundTimerRef.current = setTimeout(() => startRoundPlay(), P.roundStartDelayMs);
    return clearTimers;
  }, [round, startRoundPlay, clearTimers]);

  useEffect(
    () => () => {
      stopAllSpeech();
      cleanupSounds();
      clearTimers();
    },
    [clearTimers],
  );

  const handleHoldStart = useCallback(() => {
    if (!roundActive || doneRef.current || isHoldingRef.current) return;
    setIsHolding(true);
    isHoldingRef.current = true;
    holdScale.value = withSpring(1.12);
    let progress = 0;
    progressTimerRef.current = setInterval(() => {
      progress += P.holdTickMs;
      holdProgressRef.current = progress;
      setHoldProgress(progress);
      if (progress >= P.holdDurationMs) {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        speakTTS('Now tap!', 0.78).catch(() => {});
      }
    }, P.holdTickMs);
  }, [holdScale, roundActive]);

  const handleHoldEnd = useCallback(() => {
    if (!isHoldingRef.current || holdProgressRef.current >= P.holdDurationMs) return;
    setIsHolding(false);
    isHoldingRef.current = false;
    holdScale.value = withSpring(1);
    setHoldProgress(0);
    holdProgressRef.current = 0;
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    speakTTS('Keep holding!', 0.78).catch(() => {});
  }, [holdScale]);

  const handleTap = useCallback(() => {
    if (!roundActive || !isHoldingRef.current || holdProgressRef.current < P.holdDurationMs) return;
    setTapCount((c) => {
      const next = c + 1;
      tapScale.value = withSequence(withSpring(1.15), withSpring(1));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      if (next >= P.targetTaps) completeRound();
      return next;
    });
  }, [completeRound, roundActive, tapScale]);

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message="Hold & Hit Hero!"
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

  const T = THEME;
  const holdPct = Math.min(100, (holdProgress / P.holdDurationMs) * 100);
  const canTap = isHolding && holdProgress >= P.holdDurationMs;

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
        {roundActive && (
          <Text style={[styles.hint, { color: T.accentDark }]}>
            {holdSide === 'left' ? 'Hold LEFT · Tap RIGHT' : 'Hold RIGHT · Tap LEFT'}
          </Text>
        )}
        {isHolding && (
          <View style={[styles.progressTrack, { borderColor: T.accent }]}>
            <View style={[styles.progressFill, { width: `${holdPct}%`, backgroundColor: T.accent }]} />
          </View>
        )}
        {roundActive && (
          <Text style={[styles.tapCount, { color: T.accentDark }]}>
            Taps: {tapCount}/{P.targetTaps}
          </Text>
        )}
      </View>

      <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        {!roundActive && <Text style={[styles.waitText, { color: T.subtitleColor }]}>Get ready…</Text>}

        {roundActive && (
          <View style={styles.handsRow}>
            {holdSide === 'left' ? (
              <>
                <TouchableOpacity onPressIn={handleHoldStart} onPressOut={handleHoldEnd} activeOpacity={0.85}>
                  <Animated.View style={[styles.holdBtn, styles.holdBlue, holdStyle]}>
                    <Text style={styles.btnEmoji}>👈</Text>
                    <Text style={styles.btnLabel}>HOLD</Text>
                  </Animated.View>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleTap} activeOpacity={0.85} disabled={!canTap}>
                  <Animated.View style={[styles.tapBtn, styles.tapGold, tapStyle, !canTap && styles.disabled]}>
                    <Text style={styles.btnEmoji}>👉</Text>
                    <Text style={styles.btnLabel}>TAP</Text>
                  </Animated.View>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={handleTap} activeOpacity={0.85} disabled={!canTap}>
                  <Animated.View style={[styles.tapBtn, styles.tapGreen, tapStyle, !canTap && styles.disabled]}>
                    <Text style={styles.btnEmoji}>👈</Text>
                    <Text style={styles.btnLabel}>TAP</Text>
                  </Animated.View>
                </TouchableOpacity>
                <TouchableOpacity onPressIn={handleHoldStart} onPressOut={handleHoldEnd} activeOpacity={0.85}>
                  <Animated.View style={[styles.holdBtn, styles.holdRed, holdStyle]}>
                    <Text style={styles.btnEmoji}>👉</Text>
                    <Text style={styles.btnLabel}>HOLD</Text>
                  </Animated.View>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={T.sparkleColor} />
      </View>
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
  hint: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  tapCount: { fontSize: 14, fontWeight: '800', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  progressTrack: { width: '70%', height: 8, borderRadius: 8, borderWidth: 1, overflow: 'hidden', marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.5)' },
  progressFill: { height: '100%', borderRadius: 8 },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, justifyContent: 'center' },
  waitText: { position: 'absolute', alignSelf: 'center', top: '45%', fontSize: 18, fontWeight: '700' },
  handsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 24 },
  holdBtn: {
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdBlue: { backgroundColor: '#3B82F6' },
  holdRed: { backgroundColor: '#EF4444' },
  tapBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapGold: { backgroundColor: '#F59E0B' },
  tapGreen: { backgroundColor: '#10B981' },
  disabled: { opacity: 0.45 },
  btnEmoji: { fontSize: 40, marginBottom: 4 },
  btnLabel: { fontSize: 11, fontWeight: '800', color: '#fff' },
});

export default HoldAndTapGame;
