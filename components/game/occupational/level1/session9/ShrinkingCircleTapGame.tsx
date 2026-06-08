/**
 * OT Level 1 · Session 9 · Game 1 — Shrinking Circle Tap
 * Theme: "Void Collapse" — tap the ring before it vanishes.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION9_PACING } from '@/components/game/occupational/level1/session9/session9Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { cancelAnimation, Easing, runOnJS, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION9_PACING;
const C = P.shrinkCircle;
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

const ShrinkingCircleTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
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
  const circleSize = useSharedValue(C.initial);
  const circleScale = useSharedValue(1);
  const circleOpacity = useSharedValue(1);
  const timerProgress = useSharedValue(0);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 18;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Void collapse complete!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'shrinkingCircleTap', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['timing-control', 'visual-tracking', 'impulse-inhibition'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const startRound = useCallback(() => {
    if (doneRef.current) return;
    roundActiveRef.current = true;
    cancelAnimation(circleSize);
    circleSize.value = C.initial;
    circleOpacity.value = 1;
    circleScale.value = 1;
    timerProgress.value = 0;
    circleSize.value = withTiming(C.min, { duration: C.durationMs, easing: Easing.linear }, (finished) => {
      if (finished && roundActiveRef.current) runOnJS(onTooLate)();
    });
    timerProgress.value = withTiming(1, { duration: C.durationMs, easing: Easing.linear });
  }, []);

  const onTooLate = useCallback(() => {
    if (!roundActiveRef.current || doneRef.current) return;
    playError();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    speakTTS('Too late! Tap before it vanishes!', 0.78).catch(() => {});
    circleScale.value = withSequence(withTiming(0.92, { duration: 80 }), withTiming(1, { duration: 80 }));
    setTimeout(() => startRound(), P.retryDelayMs);
  }, [startRound, playError]);

  useEffect(() => {
    if (doneRef.current) return;
    startRound();
    return () => cancelAnimation(circleSize);
  }, [round]);

  useEffect(() => {
    speakTTS('Tap the circle before it disappears!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); cancelAnimation(circleSize); };
  }, []);

  const handleTap = useCallback(() => {
    if (!roundActiveRef.current || doneRef.current) return;
    if (circleSize.value <= C.min + 12) { onTooLate(); return; }
    roundActiveRef.current = false;
    cancelAnimation(circleSize);
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    circleScale.value = withSequence(withTiming(1.25, { duration: 120 }), withTiming(0, { duration: P.successPopMs }));
    circleOpacity.value = withTiming(0, { duration: P.successPopMs });
    setScore((prev) => {
      const next = prev + 1;
      setTimeout(() => { if (next >= TOTAL_ROUNDS) endGame(next); else setRound((r) => r + 1); }, P.nextRoundDelayMs);
      return next;
    });
  }, [endGame, onTooLate, playSuccess]);

  const circleStyle = useAnimatedStyle(() => ({
    width: circleSize.value, height: circleSize.value, borderRadius: circleSize.value / 2,
    opacity: circleOpacity.value, transform: [{ scale: circleScale.value }],
  }));
  const timerStyle = useAnimatedStyle(() => ({ width: `${timerProgress.value * 100}%` }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Collapse Master!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0C0A1A', '#1E1B4B', '#312E81', '#4338CA']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.title}>🌀 Void Collapse</Text>
        <Text style={styles.subtitle}>Tap before the ring vanishes</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>
      <View style={styles.playArea}>
        <View style={styles.timerTrack}><Animated.View style={[styles.timerFill, timerStyle]} /></View>
        <Pressable onPress={handleTap} style={styles.centerHit}>
          <Animated.View style={[circleStyle, { overflow: 'hidden' }]}>
            <LinearGradient colors={['rgba(129,140,248,0.9)', 'rgba(99,102,241,0.4)']} style={StyleSheet.absoluteFillObject} />
          </Animated.View>
        </Pressable>
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#818CF8" count={14} size={8} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  backText: { color: '#E0E7FF', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#E0E7FF' },
  subtitle: { fontSize: 14, color: 'rgba(224,231,255,0.75)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.3)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  timerTrack: { position: 'absolute', top: 12, left: 20, right: 20, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  timerFill: { height: '100%', backgroundColor: '#818CF8', borderRadius: 3 },
  centerHit: { justifyContent: 'center', alignItems: 'center', padding: 40 },
});

export default ShrinkingCircleTapGame;
