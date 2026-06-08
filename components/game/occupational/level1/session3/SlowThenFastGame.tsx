/**
 * OT Level 1 · Session 3 · Game 3 — Slow Then Fast
 * Theme: "Tempo Switch" — alternate between calm green and fiery orange rhythms.
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
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const P = SESSION3_PACING.slowThenFast;
const TAPS_TO_SWITCH = 5;
const TOTAL_TAPS = 20;
const CIRCLE_SIZE = 168;
const STAR_ICON = require('@/assets/icons/star.png');

type SpeedMode = 'slow' | 'fast';

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

const SlowThenFastGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const scoreRef = useRef(0);
  const modeRef = useRef<SpeedMode>('slow');
  const tapsInModeRef = useRef(0);
  const isLitRef = useRef(false);
  const doneRef = useRef(false);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [score, setScore] = useState(0);
  const [speedMode, setSpeedMode] = useState<SpeedMode>('slow');
  const [tapsInMode, setTapsInMode] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [isLit, setIsLit] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [modeFlash, setModeFlash] = useState<string | null>(null);

  const glow = useSharedValue(0);
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);
  const modeBanner = useSharedValue(0);

  const getTiming = (mode: SpeedMode) => ({
    interval: mode === 'slow' ? P.slowBlinkInterval : P.fastBlinkInterval,
    hold: mode === 'slow' ? P.slowGlowHoldMs : P.fastGlowHoldMs,
    rise: mode === 'slow' ? P.glowRiseSlowMs : P.glowRiseFastMs,
    fall: mode === 'slow' ? P.glowFallSlowMs : P.glowFallFastMs,
  });

  const endGame = useCallback(async (finalScore: number) => {
    const stats = { correct: finalScore, total: TOTAL_TAPS, xp: finalScore * 12 };
    setFinalStats(stats);
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Tempo master! You switched perfectly!', 0.78);
    try {
      await recordGame(stats.xp);
      await logGameAndAward({
        type: 'slowThenFast',
        correct: finalScore,
        total: TOTAL_TAPS,
        accuracy: (finalScore / TOTAL_TAPS) * 100,
        xpAwarded: stats.xp,
        skillTags: ['cognitive-flexibility', 'motor-pattern-switching', 'impulse-control'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) {
      console.error('Failed to log slow then fast game:', e);
    }
  }, [router]);

  const runBlinkCycle = useCallback(() => {
    if (doneRef.current) return;
    const { hold, rise, fall, interval } = getTiming(modeRef.current);

    isLitRef.current = true;
    setIsLit(true);
    glow.value = withTiming(1, { duration: rise, easing: Easing.out(Easing.quad) });

    blinkTimerRef.current = setTimeout(() => {
      isLitRef.current = false;
      setIsLit(false);
      glow.value = withTiming(0, { duration: fall });
      blinkTimerRef.current = setTimeout(() => {
        if (!doneRef.current) runBlinkCycle();
      }, Math.max(150, interval - hold - rise - fall));
    }, hold);
  }, []);

  useEffect(() => {
    speakTTS('Tap when it glows. After five taps, the tempo switches!', 0.78);
    runBlinkCycle();
    return () => { if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current); stopAllSpeech(); cleanupSounds(); };
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    runBlinkCycle();
  }, [speedMode]);

  const switchMode = useCallback(() => {
    const next: SpeedMode = modeRef.current === 'slow' ? 'fast' : 'slow';
    modeRef.current = next;
    tapsInModeRef.current = 0;
    setSpeedMode(next);
    setTapsInMode(0);
    setModeFlash(next === 'fast' ? '⚡ FAST MODE!' : '🌿 SLOW MODE!');
    modeBanner.value = withSequence(withTiming(1, { duration: 200 }), withTiming(0, { duration: 600 }));
    setTimeout(() => setModeFlash(null), 900);
    speakTTS(next === 'fast' ? 'Now tap fast!' : 'Now tap slowly!', 0.78).catch(() => {});
  }, []);

  const handleTap = useCallback(() => {
    if (doneRef.current) return;

    if (!isLitRef.current) {
      shake.value = withSequence(withTiming(-8, { duration: 40 }), withTiming(8, { duration: 40 }), withTiming(0, { duration: 40 }));
      playError();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      speakTTS('Wait for the glow!', 0.78).catch(() => {});
      return;
    }

    isLitRef.current = false;
    setIsLit(false);
    if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    glow.value = withTiming(0, { duration: 70 });

    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSparkleKey(Date.now());
    scale.value = withSequence(withSpring(1.1, { damping: 8 }), withSpring(1));

    tapsInModeRef.current += 1;
    setTapsInMode(tapsInModeRef.current);
    if (tapsInModeRef.current >= TAPS_TO_SWITCH) switchMode();

    const next = scoreRef.current + 1;
    scoreRef.current = next;
    setScore(next);

    if (next >= TOTAL_TAPS) {
      endGame(next);
    } else {
      setTimeout(runBlinkCycle, 130);
    }
  }, [endGame, runBlinkCycle, switchMode, playSuccess, playError]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value * 0.85, transform: [{ scale: 1 + glow.value * 0.2 }] }));
  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { translateX: shake.value }] }));
  const bannerStyle = useAnimatedStyle(() => ({ opacity: modeBanner.value, transform: [{ scale: 0.9 + modeBanner.value * 0.1 }] }));

  const isSlow = speedMode === 'slow';
  const colors = isSlow ? (['#6EE7B7', '#10B981', '#047857'] as const) : (['#FDE68A', '#F59E0B', '#EA580C'] as const);
  const glowColor = isSlow ? '#10B981' : '#F59E0B';

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Tempo Pro!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={isSlow ? ['#064E3B', '#065F46', '#047857'] : ['#7C2D12', '#C2410C', '#EA580C']}
        style={StyleSheet.absoluteFillObject}
      />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={[styles.modeBadge, { backgroundColor: isSlow ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)' }]}>
          <Text style={[styles.modeBadgeText, { color: isSlow ? '#6EE7B7' : '#FDE68A' }]}>
            {isSlow ? '🌿 SLOW' : '⚡ FAST'}
          </Text>
        </View>
        <Text style={styles.title}>Tempo Switch</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Image source={STAR_ICON} style={styles.starIcon} />
            <Text style={styles.statValue}>{score}/{TOTAL_TAPS}</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>Mode</Text>
            <Text style={styles.statValue}>{tapsInMode}/{TAPS_TO_SWITCH}</Text>
          </View>
        </View>
        <View style={[styles.phasePill, isLit && styles.phasePillLit]}>
          <Text style={styles.phaseText}>{isLit ? 'TAP NOW!' : 'Wait for glow…'}</Text>
        </View>
      </View>

      {modeFlash && (
        <Animated.View style={[styles.modeFlashBanner, bannerStyle]}>
          <Text style={styles.modeFlashText}>{modeFlash}</Text>
        </Animated.View>
      )}

      <View style={styles.playArea}>
        <Animated.View style={orbStyle}>
          <Animated.View pointerEvents="none" style={[styles.glowRing, { backgroundColor: glowColor }, glowStyle]} />
          <Pressable onPress={handleTap}>
            <LinearGradient colors={colors as unknown as [string, string, string]} style={[styles.orb, { width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2 }]}>
              <View style={styles.orbShine} />
              {isLit && <Text style={styles.tapLabel}>TAP</Text>}
            </LinearGradient>
          </Pressable>
        </Animated.View>
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={glowColor} count={12} size={7} />
      </View>

      <Text style={styles.footer}>Switch your tapping speed when the mode changes</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  modeBadge: { paddingHorizontal: 20, paddingVertical: 6, borderRadius: 999, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  modeBadgeText: { fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  title: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 10 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700' },
  statValue: { fontSize: 18, fontWeight: '900', color: '#fff' },
  starIcon: { width: 16, height: 16, resizeMode: 'contain' },
  phasePill: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.15)' },
  phasePillLit: { backgroundColor: 'rgba(255,255,255,0.2)' },
  phaseText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  modeFlashBanner: { position: 'absolute', top: 200, alignSelf: 'center', zIndex: 20, backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 },
  modeFlashText: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  playArea: { flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 14, marginBottom: 10, borderRadius: 28, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(0,0,0,0.12)' },
  glowRing: { position: 'absolute', width: CIRCLE_SIZE + 70, height: CIRCLE_SIZE + 70, borderRadius: (CIRCLE_SIZE + 70) / 2, alignSelf: 'center' },
  orb: { justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', shadowOpacity: 0.5, shadowRadius: 18, elevation: 14 },
  orbShine: { position: 'absolute', top: '14%', left: '20%', width: '34%', height: '24%', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.45)', transform: [{ rotate: '-20deg' }] },
  tapLabel: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600', paddingBottom: 18 },
});

export default SlowThenFastGame;
