/**
 * OT Level 1 · Session 10 · Game 3 — Pinch To Open Treasure Box
 * Theme: "Golden Vault" — pinch both locks to open the chest.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION10_PACING } from '@/components/game/occupational/level1/session10/session10Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION10_PACING;
const T = P.treasure;
const TOTAL_ROUNDS = 8;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR_ICON = require('@/assets/icons/star.png');

const useSound = (uri: string) => {
  const ref = useRef<ExpoAudio.Sound | null>(null);
  useEffect(() => () => { ref.current?.unloadAsync().catch(() => {}); }, []);
  return useCallback(() => {
    if (Platform.OS === 'web') return;
    (async () => {
      try {
        if (!ref.current) {
          const { sound } = await ExpoAudio.Sound.createAsync({ uri }, { volume: 0.55 });
          ref.current = sound;
        }
        await ref.current.replayAsync();
      } catch { /* noop */ }
    })();
  }, [uri]);
};

const PinchToOpenTreasureBoxGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const lock1DoneRef = useRef(false);
  const lock2DoneRef = useRef(false);
  const chestOpenRef = useRef(false);
  const lock1Scale = useSharedValue(1);
  const lock2Scale = useSharedValue(1);
  const lock1Opacity = useSharedValue(1);
  const lock2Opacity = useSharedValue(1);
  const chestRot = useSharedValue(0);
  const chestScale = useSharedValue(1);
  const lockGlow = useSharedValue(0.5);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 20;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Golden vault unlocked!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'pinchToOpenTreasureBox', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['bilateral-pinch', 'sequential-motor-planning', 'hand-coordination'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const checkBothLocks = useCallback(() => {
    if (lock1DoneRef.current && lock2DoneRef.current && !chestOpenRef.current) {
      chestOpenRef.current = true;
      roundActiveRef.current = false;
      setSparkleKey(Date.now());
      playSuccess();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      chestRot.value = withSpring(-14, { damping: 10 });
      chestScale.value = withSpring(1.08, { damping: 10 });
      setScore((prev) => {
        const next = prev + 1;
        setTimeout(() => { if (next >= TOTAL_ROUNDS) endGame(next); else setRound((r) => r + 1); }, P.nextRoundDelayMs);
        return next;
      });
    }
  }, [endGame, playSuccess]);

  const unlockLock = useCallback((n: 1 | 2) => {
    if (!roundActiveRef.current || chestOpenRef.current) return;
    if (n === 1 && !lock1DoneRef.current) {
      lock1DoneRef.current = true;
      lock1Scale.value = withSequence(withSpring(1.15), withTiming(0, { duration: P.successPopMs }));
      lock1Opacity.value = withTiming(0, { duration: P.successPopMs });
      checkBothLocks();
    } else if (n === 2 && !lock2DoneRef.current) {
      lock2DoneRef.current = true;
      lock2Scale.value = withSequence(withSpring(1.15), withTiming(0, { duration: P.successPopMs }));
      lock2Opacity.value = withTiming(0, { duration: P.successPopMs });
      checkBothLocks();
    }
  }, [checkBothLocks]);

  const handleWrongTap = useCallback(() => {
    if (!roundActiveRef.current || chestOpenRef.current) return;
    playError();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    speakTTS('Pinch both locks!', 0.78).catch(() => {});
    chestRot.value = withSequence(withTiming(-4, { duration: 60 }), withTiming(4, { duration: 60 }), withTiming(0, { duration: 60 }));
  }, [playError]);

  const startRound = useCallback(() => {
    if (doneRef.current) return;
    roundActiveRef.current = true;
    lock1DoneRef.current = false;
    lock2DoneRef.current = false;
    chestOpenRef.current = false;
    lock1Scale.value = 1;
    lock2Scale.value = 1;
    lock1Opacity.value = 1;
    lock2Opacity.value = 1;
    chestRot.value = 0;
    chestScale.value = 1;
    lockGlow.value = withRepeat(withSequence(withTiming(1, { duration: 600 }), withTiming(0.35, { duration: 600 })), -1, true);
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    startRound();
  }, [round]);

  useEffect(() => {
    speakTTS('Pinch both locks to open the treasure chest!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const makeLockGesture = (n: 1 | 2) => Gesture.Pinch()
    .onUpdate((e) => {
      if (chestOpenRef.current) return;
      const scale = n === 1 ? lock1Scale : lock2Scale;
      scale.value = Math.max(0.35, 1 - (1 - e.scale) * 0.55);
      if (e.scale < 1 - T.pinchThreshold) runOnJS(unlockLock)(n);
    })
    .onEnd(() => {
      if (n === 1 && !lock1DoneRef.current) lock1Scale.value = withSpring(1);
      if (n === 2 && !lock2DoneRef.current) lock2Scale.value = withSpring(1);
    });

  const tapGesture = Gesture.Tap().onEnd(() => { runOnJS(handleWrongTap)(); });
  const gesture = Gesture.Simultaneous(Gesture.Race(makeLockGesture(1), tapGesture), makeLockGesture(2));

  const chestStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${chestRot.value}deg` }, { scale: chestScale.value }] }));
  const lock1Style = useAnimatedStyle(() => ({ transform: [{ scale: lock1Scale.value }], opacity: lock1Opacity.value }));
  const lock2Style = useAnimatedStyle(() => ({ transform: [{ scale: lock2Scale.value }], opacity: lock2Opacity.value }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: lockGlow.value * 0.5 }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Vault Keeper!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#422006', '#78350F', '#B45309', '#FBBF24']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Golden Vault</Text>
        <Text style={styles.subtitle}>Pinch both locks to open the chest</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>
      <GestureDetector gesture={gesture}>
        <View style={styles.playArea}>
          <Animated.View style={[styles.chest, chestStyle]}>
            <LinearGradient colors={['#92400E', '#78350F', '#451A03']} style={styles.chestGrad}>
              <Text style={styles.chestEmoji}>📦</Text>
            </LinearGradient>
          </Animated.View>
          <Animated.View style={[styles.lock, styles.lockLeft, lock1Style]}>
            <Animated.View style={[styles.lockGlow, glowStyle]} />
            <LinearGradient colors={['#9CA3AF', '#6B7280', '#374151']} style={styles.lockGrad}><Text style={styles.lockEmoji}>🔒</Text></LinearGradient>
          </Animated.View>
          <Animated.View style={[styles.lock, styles.lockRight, lock2Style]}>
            <Animated.View style={[styles.lockGlow, glowStyle]} />
            <LinearGradient colors={['#9CA3AF', '#6B7280', '#374151']} style={styles.lockGrad}><Text style={styles.lockEmoji}>🔒</Text></LinearGradient>
          </Animated.View>
          <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#FDE047" count={18} size={9} />
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  backText: { color: '#FEF3C7', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#FEF3C7' },
  subtitle: { fontSize: 14, color: 'rgba(254,243,199,0.85)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(253,224,71,0.15)', borderColor: 'rgba(253,224,71,0.35)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(253,224,71,0.3)', backgroundColor: 'rgba(0,0,0,0.15)' },
  chest: { width: T.chestSize, height: T.chestSize, borderRadius: 18, overflow: 'hidden', shadowColor: '#FBBF24', shadowOpacity: 0.45, shadowRadius: 16, elevation: 12 },
  chestGrad: { flex: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FDE047' },
  chestEmoji: { fontSize: 88 },
  lock: { position: 'absolute', width: T.lockSize, height: T.lockSize, top: '58%', marginTop: -T.lockSize / 2, borderRadius: T.lockSize / 2, overflow: 'visible', zIndex: 2 },
  lockLeft: { left: '28%', marginLeft: -T.lockSize / 2 },
  lockRight: { left: '72%', marginLeft: -T.lockSize / 2 },
  lockGlow: { position: 'absolute', width: T.lockSize * 1.4, height: T.lockSize * 1.4, borderRadius: T.lockSize, backgroundColor: '#FDE047', alignSelf: 'center', top: -T.lockSize * 0.2 },
  lockGrad: { flex: 1, borderRadius: T.lockSize / 2, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#4B5563' },
  lockEmoji: { fontSize: 34 },
});

export default PinchToOpenTreasureBoxGame;
