/**
 * OT Level 1 · Session 4 · Game 3 — Launch Rocket
 * Theme: "Cosmic Launch Bay" — fill fuel, release at full to blast off.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION4_PACING } from '@/components/game/occupational/level1/session4/session4Pacing';
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
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION4_PACING.launchRocket;
const TOTAL_ROUNDS = 8;
const LAUNCH_SOUND = 'https://actions.google.com/sounds/v1/cartoon/pop.ogg';
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

const LaunchRocketGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playLaunch = useSound(LAUNCH_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'filling' | 'ready' | 'launching' | 'transition'>('idle');
  const [fuelPct, setFuelPct] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);

  const holdingRef = useRef(false);
  const progressRef = useRef(0);
  const doneRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fuelHeight = useSharedValue(0);
  const rocketY = useSharedValue(0);
  const rocketScale = useSharedValue(1);
  const rocketOpacity = useSharedValue(1);
  const flashOpacity = useSharedValue(0);
  const flameScale = useSharedValue(0.6);
  const starTwinkle = useSharedValue(0.4);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 18;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('All rockets launched! Mission complete!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({
        type: 'launchRocket',
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: xp,
        skillTags: ['force-duration-control', 'delayed-gratification', 'impulse-inhibition'],
      }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const resetRocket = useCallback(() => {
    fuelHeight.value = 0;
    rocketY.value = 0;
    rocketScale.value = 1;
    rocketOpacity.value = 1;
    flashOpacity.value = 0;
    flameScale.value = 0.6;
    progressRef.current = 0;
    setFuelPct(0);
    setPhase('idle');
  }, []);

  useEffect(() => {
    starTwinkle.value = withRepeat(
      withSequence(withTiming(1, { duration: 1200 }), withTiming(0.3, { duration: 1200 })),
      -1,
      true,
    );
    speakTTS('Press and hold to fill fuel. Release when full to launch!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  const onPressIn = useCallback(() => {
    if (doneRef.current || phase === 'launching' || phase === 'transition' || holdingRef.current) return;
    holdingRef.current = true;
    setPhase('filling');
    progressRef.current = 0;
    setFuelPct(0);
    fuelHeight.value = 0;
    flashOpacity.value = 0;
    flameScale.value = withRepeat(withSequence(withTiming(1.1, { duration: 150 }), withTiming(0.7, { duration: 150 })), -1, true);

    tickRef.current = setInterval(() => {
      if (!holdingRef.current) return;
      progressRef.current = Math.min(1, progressRef.current + 50 / P.fuelDurationMs);
      setFuelPct(Math.round(progressRef.current * 100));
      fuelHeight.value = progressRef.current * 100;
      if (progressRef.current >= 1) {
        setPhase('ready');
        flashOpacity.value = withSequence(withTiming(1, { duration: 180 }), withTiming(0.4, { duration: 400 }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speakTTS('Release to launch!', 0.85).catch(() => {});
        if (tickRef.current) clearInterval(tickRef.current);
      }
    }, 50);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [phase]);

  const onPressOut = useCallback(() => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    if (tickRef.current) clearInterval(tickRef.current);
    cancelAnimation(flameScale);
    flameScale.value = 0.6;

    const p = progressRef.current;
    if (p >= P.perfectThreshold) {
      setPhase('launching');
      setSparkleKey(Date.now());
      playLaunch();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      flashOpacity.value = withTiming(0, { duration: 150 });

      rocketY.value = withTiming(-320, { duration: P.launchDurationMs, easing: Easing.out(Easing.quad) });
      rocketScale.value = withTiming(1.4, { duration: P.launchDurationMs });
      rocketOpacity.value = withTiming(0, { duration: P.launchDurationMs, easing: Easing.in(Easing.quad) });

      setScore((prev) => {
        const next = prev + 1;
        setPhase('transition');
        setTimeout(() => {
          if (next >= TOTAL_ROUNDS) {
            endGame(next);
          } else {
            setRound((r) => r + 1);
            resetRocket();
          }
        }, P.launchDurationMs + P.nextRoundDelayMs);
        return next;
      });
    } else {
      fuelHeight.value = withTiming(0, { duration: 250 });
      flashOpacity.value = withTiming(0, { duration: 180 });
      setFuelPct(0);
      progressRef.current = 0;
      setPhase('idle');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
      speakTTS('Fill the fuel bar completely!', 0.78).catch(() => {});
    }
  }, [endGame, resetRocket, playLaunch]);

  const fuelStyle = useAnimatedStyle(() => ({ height: `${fuelHeight.value}%` }));
  const rocketStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: rocketY.value }, { scale: rocketScale.value }],
    opacity: rocketOpacity.value,
  }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));
  const flameStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: flameScale.value }] }));
  const starStyle = useAnimatedStyle(() => ({ opacity: starTwinkle.value }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Rocket Commander!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#020617', '#0F172A', '#1E1B4B', '#312E81']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      {/* Stars */}
      {[...Array(6)].map((_, i) => (
        <Animated.View key={i} style={[styles.star, { top: `${12 + i * 13}%`, left: `${8 + i * 14}%` }, starStyle]} />
      ))}

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🚀 Cosmic Launch Bay</Text>
        <Text style={styles.subtitle}>Fill fuel · release to blast off</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.playArea} onPressIn={onPressIn} onPressOut={onPressOut} disabled={phase === 'launching' || phase === 'transition'}>
        {/* Launch pad */}
        <View style={styles.pad}>
          <LinearGradient colors={['#475569', '#334155', '#1E293B']} style={styles.padSurface} />
        </View>

        {/* Fuel gauge */}
        <View style={styles.fuelGauge}>
          <Text style={styles.fuelLabel}>FUEL</Text>
          <View style={styles.fuelTrack}>
            <Animated.View style={[styles.fuelFill, fuelStyle]} />
          </View>
          {(phase === 'filling' || phase === 'ready') && (
            <Text style={styles.fuelPct}>{fuelPct}%</Text>
          )}
        </View>

        {/* Rocket */}
        <Animated.View style={[styles.rocketWrap, rocketStyle]}>
          <Text style={styles.rocketEmoji}>🚀</Text>
          <Animated.View style={[styles.flame, flameStyle]}>
            <LinearGradient colors={['#F59E0B', '#EF4444', 'transparent']} style={StyleSheet.absoluteFillObject} />
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.launchFlash, flashStyle]} />

        {phase === 'idle' && (
          <View style={styles.hintPill}><Text style={styles.hintText}>Press & hold to fuel ⛽</Text></View>
        )}

        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#F59E0B" count={16} size={8} />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  star: { position: 'absolute', width: 3, height: 3, borderRadius: 2, backgroundColor: '#fff' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#E0E7FF', textShadowColor: 'rgba(99,102,241,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  subtitle: { fontSize: 14, color: 'rgba(199,210,254,0.8)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.3)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pad: { position: 'absolute', bottom: '22%', width: 180, height: 24, borderRadius: 6, overflow: 'hidden' },
  padSurface: { flex: 1 },
  fuelGauge: { position: 'absolute', left: '12%', bottom: '28%', alignItems: 'center' },
  fuelLabel: { fontSize: 11, fontWeight: '900', color: '#F59E0B', letterSpacing: 2, marginBottom: 6 },
  fuelTrack: { width: 36, height: 160, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, borderWidth: 2, borderColor: 'rgba(245,158,11,0.4)', overflow: 'hidden', justifyContent: 'flex-end' },
  fuelFill: { width: '100%', backgroundColor: '#F59E0B', borderRadius: 16 },
  fuelPct: { marginTop: 8, fontSize: 13, fontWeight: '800', color: '#FCD34D' },
  rocketWrap: { alignItems: 'center', marginBottom: 40 },
  rocketEmoji: { fontSize: 72 },
  flame: { width: 20, height: 40, borderRadius: 10, marginTop: -8, overflow: 'hidden' },
  launchFlash: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(34,197,94,0.25)', borderWidth: 3, borderColor: '#22C55E' },
  hintPill: { position: 'absolute', bottom: '12%', backgroundColor: 'rgba(99,102,241,0.85)', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 22 },
  hintText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

export default LaunchRocketGame;
