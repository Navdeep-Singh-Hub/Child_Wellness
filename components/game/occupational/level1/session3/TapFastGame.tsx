/**
 * OT Level 1 · Session 3 · Game 2 — Tap Fast
 * Theme: "Lightning Strike" — react the instant the bolt flashes orange.
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
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const P = SESSION3_PACING.tapFast;
const TOTAL_TAPS = 15;
const CIRCLE_SIZE = 168;
const STAR_ICON = require('@/assets/icons/star.png');

const usePopSound = () => {
  const ref = useRef<ExpoAudio.Sound | null>(null);
  useEffect(() => () => { ref.current?.unloadAsync().catch(() => {}); }, []);
  return useCallback(() => {
    if (Platform.OS === 'web') return;
    (async () => {
      try {
        if (!ref.current) {
          const { sound } = await ExpoAudio.Sound.createAsync({ uri: SUCCESS_SOUND }, { volume: 0.48 });
          ref.current = sound;
        }
        ref.current.replayAsync().catch(() => {});
      } catch { /* noop */ }
    })();
  }, []);
};

const TapFastGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playPop = usePopSound();

  const scoreRef = useRef(0);
  const isLitRef = useRef(false);
  const litStartRef = useRef(0);
  const doneRef = useRef(false);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const responseTimesRef = useRef<number[]>([]);

  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [isLit, setIsLit] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [avgMs, setAvgMs] = useState(0);

  const glow = useSharedValue(0);
  const scale = useSharedValue(1);
  const boltFlash = useSharedValue(0);

  const endGame = useCallback(async (finalScore: number) => {
    const avg = responseTimesRef.current.length
      ? Math.round(responseTimesRef.current.reduce((a, b) => a + b, 0) / responseTimesRef.current.length)
      : 0;
    const stats = { correct: finalScore, total: TOTAL_TAPS, xp: finalScore * 10 };
    setFinalStats(stats);
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Lightning fast! Amazing reactions!', 0.78);
    try {
      await recordGame(stats.xp);
      await logGameAndAward({
        type: 'tapFast',
        correct: finalScore,
        total: TOTAL_TAPS,
        accuracy: (finalScore / TOTAL_TAPS) * 100,
        xpAwarded: stats.xp,
        skillTags: ['fast-motor-activation', 'quick-reaction', 'proprioceptive-timing'],
        meta: { avgResponseTime: avg },
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) {
      console.error('Failed to log tap fast game:', e);
    }
  }, [router]);

  const runBlinkCycle = useCallback(() => {
    if (doneRef.current) return;
    isLitRef.current = true;
    litStartRef.current = Date.now();
    setIsLit(true);
    glow.value = withTiming(1, { duration: P.glowRiseMs, easing: Easing.out(Easing.quad) });
    boltFlash.value = withSequence(withTiming(1, { duration: 80 }), withTiming(0.3, { duration: P.litDuration }));

    blinkTimerRef.current = setTimeout(() => {
      isLitRef.current = false;
      setIsLit(false);
      glow.value = withTiming(0, { duration: P.glowFallMs });
      blinkTimerRef.current = setTimeout(() => {
        if (!doneRef.current) runBlinkCycle();
      }, Math.max(180, P.blinkInterval - P.litDuration - P.glowRiseMs - P.glowFallMs));
    }, P.litDuration);
  }, []);

  useEffect(() => {
    speakTTS('When the bolt turns orange, tap as fast as you can!', 0.78);
    runBlinkCycle();
    return () => { if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current); stopAllSpeech(); cleanupSounds(); };
  }, []);

  const handleTap = useCallback(() => {
    if (doneRef.current) return;
    if (!isLitRef.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      speakTTS('Wait for orange!', 0.78).catch(() => {});
      scale.value = withSequence(withTiming(0.94, { duration: 60 }), withSpring(1));
      return;
    }

    const rt = Date.now() - litStartRef.current;
    responseTimesRef.current.push(rt);
    setAvgMs(Math.round(responseTimesRef.current.reduce((a, b) => a + b, 0) / responseTimesRef.current.length));

    isLitRef.current = false;
    setIsLit(false);
    if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    glow.value = withTiming(0, { duration: 60 });

    playPop();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setSparkleKey(Date.now());
    scale.value = withSequence(withSpring(1.15, { damping: 6 }), withSpring(1));

    const next = scoreRef.current + 1;
    scoreRef.current = next;
    setScore(next);

    if (next >= TOTAL_TAPS) {
      endGame(next);
    } else {
      setTimeout(runBlinkCycle, 120);
    }
  }, [endGame, runBlinkCycle, playPop]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value * 0.9, transform: [{ scale: 1 + glow.value * 0.25 }] }));
  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const boltStyle = useAnimatedStyle(() => ({ opacity: boltFlash.value }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Lightning Fast!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#431407', '#7C2D12', '#C2410C', '#EA580C']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>⚡ Lightning Strike</Text>
        <Text style={styles.subtitle}>Tap instantly when orange!</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Image source={STAR_ICON} style={styles.starIcon} />
            <Text style={styles.statValue}>{score}/{TOTAL_TAPS}</Text>
          </View>
          {avgMs > 0 && (
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>Avg</Text>
              <Text style={styles.statValue}>{avgMs}ms</Text>
            </View>
          )}
        </View>
        <View style={[styles.phasePill, isLit && styles.phasePillLit]}>
          <Text style={styles.phaseText}>{isLit ? '⚡ STRIKE NOW!' : '⏳ Ready…'}</Text>
        </View>
      </View>

      <View style={styles.playArea}>
        <Animated.View style={orbStyle}>
          <Animated.View pointerEvents="none" style={[styles.glowRing, glowStyle]} />
          <Pressable onPress={handleTap}>
            <LinearGradient
              colors={isLit ? ['#FDE68A', '#F59E0B', '#EA580C'] : ['#7F1D1D', '#991B1B', '#450A0A']}
              style={[styles.orb, { width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2 }]}
            >
              <Animated.Text style={[styles.boltEmoji, boltStyle]}>⚡</Animated.Text>
              {isLit && <Text style={styles.tapLabel}>TAP!</Text>}
            </LinearGradient>
          </Pressable>
        </Animated.View>
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#F59E0B" count={14} size={8} />
      </View>

      <Text style={styles.footer}>Fast reactions — tap the moment it flashes orange</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#7C2D12' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#FED7AA' },
  subtitle: { fontSize: 13, color: 'rgba(254,215,170,0.85)', fontWeight: '600', marginTop: 4, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700' },
  statValue: { fontSize: 18, fontWeight: '900', color: '#fff' },
  starIcon: { width: 16, height: 16, resizeMode: 'contain' },
  phasePill: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  phasePillLit: { backgroundColor: 'rgba(245,158,11,0.4)', borderColor: '#FDE68A' },
  phaseText: { fontSize: 14, fontWeight: '900', color: '#fff' },
  playArea: { flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 14, marginBottom: 10, borderRadius: 28, borderWidth: 2, borderColor: 'rgba(251,191,36,0.35)', backgroundColor: 'rgba(0,0,0,0.15)' },
  glowRing: { position: 'absolute', width: CIRCLE_SIZE + 70, height: CIRCLE_SIZE + 70, borderRadius: (CIRCLE_SIZE + 70) / 2, backgroundColor: '#F59E0B', alignSelf: 'center' },
  orb: { justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)', shadowColor: '#F59E0B', shadowOpacity: 0.6, shadowRadius: 22, elevation: 16 },
  boltEmoji: { fontSize: 36, position: 'absolute' },
  tapLabel: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: 3, marginTop: 28 },
  footer: { textAlign: 'center', color: 'rgba(254,215,170,0.75)', fontSize: 13, fontWeight: '600', paddingBottom: 18 },
});

export default TapFastGame;
