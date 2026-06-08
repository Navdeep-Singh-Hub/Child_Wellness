/**
 * OT Level 1 · Session 2 · Game 1 — Small Circle Tap
 * Theme: "Neon Pinpoint" — precision gems on a deep teal starfield.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
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
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const POP_SOUND = 'https://actions.google.com/sounds/v1/cartoon/pop.ogg';
const TARGETS_TO_POP = 15;
const CIRCLE_SIZE_PCT = 11;
const SPAWN_DELAY_MS = 130;
const STAR_ICON = require('@/assets/icons/star.png');

const GEM_COLORS = [
  { main: '#22D3EE', light: '#A5F3FC', glow: '#06B6D4' },
  { main: '#A78BFA', light: '#DDD6FE', glow: '#8B5CF6' },
  { main: '#F472B6', light: '#FBCFE8', glow: '#EC4899' },
  { main: '#34D399', light: '#A7F3D0', glow: '#10B981' },
  { main: '#FBBF24', light: '#FDE68A', glow: '#F59E0B' },
];

const usePopSound = () => {
  const ref = useRef<ExpoAudio.Sound | null>(null);
  useEffect(() => () => { ref.current?.unloadAsync().catch(() => {}); }, []);
  return useCallback(() => {
    if (Platform.OS === 'web') return;
    (async () => {
      try {
        if (!ref.current) {
          const { sound } = await ExpoAudio.Sound.createAsync({ uri: POP_SOUND }, { volume: 0.45 });
          ref.current = sound;
        }
        ref.current.replayAsync().catch(() => {});
      } catch { /* noop */ }
    })();
  }, []);
};

function StarDot({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <View pointerEvents="none" style={[styles.bgStar, { left: `${x}%`, top: `${y}%`, width: size, height: size, borderRadius: size / 2 }]} />
  );
}

const SmallCircleTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playPop = usePopSound();
  const scoreRef = useRef(0);

  const [score, setScore] = useState(0);
  const [targetsLeft, setTargetsLeft] = useState(TARGETS_TO_POP);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [gemIdx, setGemIdx] = useState(0);
  const [spawnKey, setSpawnKey] = useState(0);

  const targetX = useSharedValue(50);
  const targetY = useSharedValue(50);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const pulse = useSharedValue(1);
  const glowPulse = useSharedValue(0.4);

  const palette = GEM_COLORS[gemIdx % GEM_COLORS.length];

  const spawnTarget = useCallback(() => {
    const margin = CIRCLE_SIZE_PCT / 2 + 8;
    targetX.value = margin + Math.random() * (100 - margin * 2);
    targetY.value = margin + Math.random() * (100 - margin * 2);
    scale.value = 0;
    opacity.value = 0;
    scale.value = withSpring(1, { damping: 11, stiffness: 160 });
    opacity.value = withTiming(1, { duration: 160 });
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.94, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    glowPulse.value = withRepeat(
      withSequence(withTiming(0.8, { duration: 700 }), withTiming(0.35, { duration: 700 })),
      -1,
      true,
    );
    setGemIdx((i) => i + 1);
    setSpawnKey((k) => k + 1);
  }, []);

  const finishGame = useCallback(async (finalScore: number) => {
    const stats = { correct: finalScore, total: TARGETS_TO_POP, xp: finalScore * 12 };
    setFinalStats(stats);
    setDone(true);
    setShowCongratulations(true);
    speakTTS('Pinpoint master! Amazing precision!', 0.78);
    try {
      await recordGame(stats.xp);
      await logGameAndAward({
        type: 'smallCircleTap' as any,
        correct: finalScore,
        total: TARGETS_TO_POP,
        accuracy: 100,
        xpAwarded: stats.xp,
        skillTags: ['finger-isolation', 'precision-motor', 'attention'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) {
      console.error('Failed to log small circle tap game:', e);
    }
  }, [router]);

  const handleTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    playPop();
    scale.value = withSequence(withTiming(1.25, { duration: 60 }), withTiming(0, { duration: 120, easing: Easing.in(Easing.back(1.5)) }));
    opacity.value = withTiming(0, { duration: 130 });
    setSparkleKey(Date.now());

    const next = scoreRef.current + 1;
    scoreRef.current = next;
    setScore(next);
    setTargetsLeft(TARGETS_TO_POP - next);

    if (next >= TARGETS_TO_POP) {
      finishGame(next);
    } else {
      setTimeout(spawnTarget, SPAWN_DELAY_MS);
    }
  }, [playPop, spawnTarget, finishGame]);

  useEffect(() => {
    speakTTS('Use your index finger. Tap the small glowing gem!', 0.78);
    spawnTarget();
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    width: `${CIRCLE_SIZE_PCT}%` as any,
    height: `${CIRCLE_SIZE_PCT}%` as any,
    left: `${targetX.value}%` as any,
    top: `${targetY.value}%` as any,
    transform: [
      { translateX: `${-CIRCLE_SIZE_PCT / 2}%` as any },
      { translateY: `${-CIRCLE_SIZE_PCT / 2}%` as any },
      { scale: scale.value * pulse.value },
    ],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    width: `${CIRCLE_SIZE_PCT * 1.5}%` as any,
    height: `${CIRCLE_SIZE_PCT * 1.5}%` as any,
    left: `${targetX.value}%` as any,
    top: `${targetY.value}%` as any,
    opacity: glowPulse.value * opacity.value,
    transform: [
      { translateX: `${-(CIRCLE_SIZE_PCT * 1.5) / 2}%` as any },
      { translateY: `${-(CIRCLE_SIZE_PCT * 1.5) / 2}%` as any },
      { scale: scale.value * pulse.value },
    ],
  }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message="Pinpoint Pro!"
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }}
      />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#042F2E', '#0F766E', '#115E59', '#134E4A']} locations={[0, 0.4, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <StarDot x={12} y={18} size={3} /><StarDot x={78} y={12} size={2} /><StarDot x={45} y={8} size={2} />
      <StarDot x={88} y={42} size={3} /><StarDot x={22} y={55} size={2} /><StarDot x={65} y={72} size={2} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Neon Pinpoint</Text>
        <Text style={styles.subtitle}>Tap the small gem with your index finger</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Image source={STAR_ICON} style={styles.starIcon} />
            <Text style={styles.statValue}>{score}/{TARGETS_TO_POP}</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>Left</Text>
            <Text style={styles.statValue}>{targetsLeft}</Text>
          </View>
        </View>
        <View style={styles.progressRow}>
          {Array.from({ length: TARGETS_TO_POP }).map((_, i) => (
            <View key={i} style={[styles.progressDot, i < score && styles.progressDotDone]} />
          ))}
        </View>
      </View>

      <View style={styles.playArea}>
        <LinearGradient colors={['rgba(255,255,255,0.06)', 'rgba(45,212,191,0.08)']} style={StyleSheet.absoluteFillObject} />
        <Animated.View pointerEvents="none" style={[styles.glowRing, { backgroundColor: palette.glow }, glowStyle]} />
        <Animated.View style={circleStyle}>
          <Pressable onPress={handleTap} style={styles.hitArea}>
            <LinearGradient colors={[palette.light, palette.main, palette.glow]} style={styles.gem}>
              <View style={styles.gemShine} />
            </LinearGradient>
          </Pressable>
        </Animated.View>
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={palette.main} count={12} size={6} />
      </View>

      <Text style={styles.footer}>Small target · precise finger tap</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#042F2E' },
  bgStar: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.35)' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#5EEAD4' },
  subtitle: { fontSize: 13, color: 'rgba(153,246,228,0.85)', fontWeight: '600', marginTop: 4, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  statValue: { fontSize: 18, fontWeight: '900', color: '#fff' },
  starIcon: { width: 16, height: 16, resizeMode: 'contain' },
  progressRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, maxWidth: '90%', marginTop: 4 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  progressDotDone: { backgroundColor: '#2DD4BF', borderColor: '#5EEAD4' },
  playArea: { flex: 1, marginHorizontal: 14, marginBottom: 12, borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(45,212,191,0.35)' },
  glowRing: { position: 'absolute', borderRadius: 9999 },
  hitArea: { flex: 1, borderRadius: 9999, overflow: 'hidden' },
  gem: { flex: 1, borderRadius: 9999, borderWidth: 2, borderColor: 'rgba(255,255,255,0.45)', shadowColor: '#2DD4BF', shadowOpacity: 0.6, shadowRadius: 16, elevation: 12 },
  gemShine: { position: 'absolute', top: '15%', left: '20%', width: '35%', height: '25%', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.55)', transform: [{ rotate: '-20deg' }] },
  footer: { textAlign: 'center', color: 'rgba(153,246,228,0.7)', fontSize: 13, fontWeight: '600', paddingBottom: 18 },
});

export default SmallCircleTapGame;
