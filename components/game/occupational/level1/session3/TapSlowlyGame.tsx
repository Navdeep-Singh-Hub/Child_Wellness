/**
 * OT Level 1 · Session 3 · Game 1 — Tap Slowly
 * Theme: "Moonlight Pulse" — wait for the calm glow, then tap.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION3_PACING } from '@/components/game/occupational/level1/session3/session3Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const P = SESSION3_PACING.tapSlowly;
const TOTAL_TAPS = 15;
const CIRCLE_SIZE = 168;
const STAR_ICON = require('@/assets/icons/star.png');

const useSound = (uri: string) => {
  const ref = useRef<ExpoAudio.Sound | null>(null);
  useEffect(() => () => { ref.current?.unloadAsync().catch(() => {}); }, []);
  return useCallback(() => {
    if (Platform.OS === 'web') return;
    (async () => {
      try {
        if (!ref.current) {
          const { sound } = await ExpoAudio.Sound.createAsync({ uri }, { volume: 0.45 });
          ref.current = sound;
        }
        ref.current.replayAsync().catch(() => {});
      } catch { /* noop */ }
    })();
  }, [uri]);
};

const TapSlowlyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const scoreRef = useRef(0);
  const isLitRef = useRef(false);
  const doneRef = useRef(false);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [isLit, setIsLit] = useState(false);
  const [blinkInterval, setBlinkInterval] = useState(P.initialBlinkInterval);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [missFlash, setMissFlash] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);

  const glow = useSharedValue(0);
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);
  const ringScale = useSharedValue(1);

  const endGame = useCallback(async (finalScore: number) => {
    const stats = { correct: finalScore, total: TOTAL_TAPS, xp: finalScore * 12 };
    setFinalStats(stats);
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Beautiful rhythm! You mastered slow tapping!', 0.78);
    try {
      await recordGame(stats.xp);
      await logGameAndAward({
        type: 'tapSlowly',
        correct: finalScore,
        total: TOTAL_TAPS,
        accuracy: (finalScore / TOTAL_TAPS) * 100,
        xpAwarded: stats.xp,
        skillTags: ['slow-motor-control', 'motor-inhibition', 'rhythm-synchronization', 'visual-motor-mapping'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) {
      console.error('Failed to log tap slowly game:', e);
    }
  }, [router]);

  const runBlinkCycle = useCallback(() => {
    if (doneRef.current) return;
    const hold = Math.min(P.glowHoldMs, Math.max(1500, blinkInterval - P.glowRiseMs - P.glowFallMs));

    isLitRef.current = true;
    setIsLit(true);
    glow.value = withTiming(1, { duration: P.glowRiseMs, easing: Easing.out(Easing.quad) });
    ringScale.value = withRepeatPulse();

    blinkTimerRef.current = setTimeout(() => {
      isLitRef.current = false;
      setIsLit(false);
      glow.value = withTiming(0, { duration: P.glowFallMs, easing: Easing.in(Easing.quad) });

      blinkTimerRef.current = setTimeout(() => {
        if (!doneRef.current) runBlinkCycle();
      }, Math.max(200, blinkInterval - hold - P.glowRiseMs - P.glowFallMs));
    }, hold);
  }, [blinkInterval]);

  function withRepeatPulse() {
    return withSequence(withTiming(1.08, { duration: 400 }), withTiming(1, { duration: 400 }));
  }

  const spokeRef = useRef(false);

  useEffect(() => {
    if (!spokeRef.current) {
      spokeRef.current = true;
      speakTTS('Wait for the moon to glow, then tap gently!', 0.78);
    }
    if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    runBlinkCycle();
    return () => { if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current); };
  }, [blinkInterval]);

  useEffect(() => () => { stopAllSpeech(); cleanupSounds(); }, []);

  const handleTap = useCallback(() => {
    if (doneRef.current) return;

    if (!isLitRef.current) {
      setMissFlash(true);
      setTimeout(() => setMissFlash(false), 600);
      shake.value = withSequence(
        withTiming(-8, { duration: 40 }), withTiming(8, { duration: 40 }), withTiming(0, { duration: 40 }),
      );
      playError();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      speakTTS('Wait for the glow!', 0.78).catch(() => {});
      setConsecutiveCorrect(0);
      return;
    }

    isLitRef.current = false;
    setIsLit(false);
    glow.value = withTiming(0, { duration: 80 });
    if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);

    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSparkleKey(Date.now());
    scale.value = withSequence(withSpring(1.12, { damping: 8 }), withSpring(1, { damping: 12 }));

    const next = scoreRef.current + 1;
    scoreRef.current = next;
    setScore(next);

    setConsecutiveCorrect((c) => {
      const nc = c + 1;
      if (nc >= P.tapsBeforeSpeedUp) {
        setBlinkInterval((bi) => Math.max(P.minBlinkInterval, bi - P.speedDecreasePerStep));
        return 0;
      }
      return nc;
    });

    if (next >= TOTAL_TAPS) {
      endGame(next);
    } else {
      setTimeout(runBlinkCycle, 180);
    }
  }, [endGame, runBlinkCycle, playSuccess, playError]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value * 0.85, transform: [{ scale: 1 + glow.value * 0.2 }] }));
  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { translateX: shake.value }] }));
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: ringScale.value }], opacity: glow.value * 0.6 }));

  const speedPct = Math.round(((P.initialBlinkInterval - blinkInterval) / (P.initialBlinkInterval - P.minBlinkInterval)) * 100);

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Rhythm Master!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1E1B4B', '#312E81', '#4C1D95', '#6B21A8']} locations={[0, 0.4, 0.75, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Moonlight Pulse</Text>
        <Text style={styles.subtitle}>Tap only when the orb glows</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Image source={STAR_ICON} style={styles.starIcon} />
            <Text style={styles.statValue}>{score}/{TOTAL_TAPS}</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>Tempo</Text>
            <Text style={styles.statValue}>{speedPct}%</Text>
          </View>
        </View>
        <View style={[styles.phasePill, isLit && styles.phasePillLit]}>
          <Text style={styles.phaseText}>{isLit ? '✨ GLOW — TAP NOW!' : '🌙 Wait…'}</Text>
        </View>
      </View>

      <View style={[styles.playArea, missFlash && styles.playAreaMiss]}>
        <Animated.View style={orbStyle}>
          <Animated.View pointerEvents="none" style={[styles.glowRing, glowStyle]} />
          <Animated.View pointerEvents="none" style={[styles.outerRing, ringStyle]} />
          <Pressable onPress={handleTap}>
            <LinearGradient
              colors={isLit ? ['#C4B5FD', '#8B5CF6', '#6D28D9'] : ['#475569', '#334155', '#1E293B']}
              style={[styles.orb, { width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2 }]}
            >
              <View style={styles.orbShine} />
              {isLit && <Text style={styles.tapLabel}>TAP</Text>}
            </LinearGradient>
          </Pressable>
        </Animated.View>
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#A78BFA" count={12} size={7} />
      </View>

      <Text style={styles.footer}>Slow and steady — tap only during the glow window</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#312E81' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#E9D5FF' },
  subtitle: { fontSize: 13, color: 'rgba(233,213,255,0.8)', fontWeight: '600', marginTop: 4, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700' },
  statValue: { fontSize: 18, fontWeight: '900', color: '#fff' },
  starIcon: { width: 16, height: 16, resizeMode: 'contain' },
  phasePill: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  phasePillLit: { backgroundColor: 'rgba(139,92,246,0.35)', borderColor: '#C4B5FD' },
  phaseText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  playArea: { flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 14, marginBottom: 10, borderRadius: 28, borderWidth: 2, borderColor: 'rgba(167,139,250,0.3)', backgroundColor: 'rgba(0,0,0,0.12)' },
  playAreaMiss: { borderColor: 'rgba(248,113,113,0.5)' },
  glowRing: { position: 'absolute', width: CIRCLE_SIZE + 70, height: CIRCLE_SIZE + 70, borderRadius: (CIRCLE_SIZE + 70) / 2, backgroundColor: '#8B5CF6', alignSelf: 'center' },
  outerRing: { position: 'absolute', width: CIRCLE_SIZE + 40, height: CIRCLE_SIZE + 40, borderRadius: (CIRCLE_SIZE + 40) / 2, borderWidth: 3, borderColor: '#C4B5FD', alignSelf: 'center' },
  orb: { justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)', shadowColor: '#8B5CF6', shadowOpacity: 0.5, shadowRadius: 20, elevation: 14 },
  orbShine: { position: 'absolute', top: '14%', left: '20%', width: '34%', height: '24%', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.45)', transform: [{ rotate: '-20deg' }] },
  tapLabel: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  footer: { textAlign: 'center', color: 'rgba(233,213,255,0.7)', fontSize: 13, fontWeight: '600', paddingBottom: 18 },
});

export default TapSlowlyGame;
