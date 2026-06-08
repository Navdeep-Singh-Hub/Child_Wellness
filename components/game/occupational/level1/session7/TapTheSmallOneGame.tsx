/**
 * OT Level 1 · Session 7 · Game 2 — Tap The Small One
 * Theme: "Pixel Hunt" — find the tiniest shape among giants.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION7_PACING } from '@/components/game/occupational/level1/session7/session7Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION7_PACING;
const TOTAL_ROUNDS = 8;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR_ICON = require('@/assets/icons/star.png');

type SizeId = 'large' | 'medium' | 'small';
type ShapeTarget = { id: SizeId; size: number; x: number; y: number; colors: [string, string] };

const PALETTES: [string, string][] = [
  ['#818CF8', '#6366F1'], ['#22D3EE', '#0891B2'], ['#F472B6', '#DB2777'],
  ['#FBBF24', '#D97706'], ['#4ADE80', '#16A34A'], ['#FB7185', '#E11D48'],
];

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

function spawnShapes(): ShapeTarget[] {
  const margin = 14;
  const sizes: Record<SizeId, number> = { large: P.smallOne.large, medium: P.smallOne.medium, small: P.smallOne.small };
  const positions: { x: number; y: number }[] = [];
  for (const id of (['large', 'medium', 'small'] as SizeId[])) {
    for (let a = 0; a < 50; a++) {
      const x = margin + Math.random() * (100 - margin * 2);
      const y = margin + Math.random() * (100 - margin * 2);
      if (positions.every((p) => Math.hypot(p.x - x, p.y - y) >= 22)) { positions.push({ x, y }); break; }
    }
    if (positions.length < (['large', 'medium', 'small'] as SizeId[]).indexOf(id) + 1) positions.push({ x: 25 + Math.random() * 50, y: 25 + Math.random() * 50 });
  }
  return (['large', 'medium', 'small'] as SizeId[]).map((id, i) => ({
    id, size: sizes[id], x: positions[i].x, y: positions[i].y,
    colors: PALETTES[Math.floor(Math.random() * PALETTES.length)],
  }));
}

function ShapeOrb({ target, onPress, disabled }: { target: ShapeTarget; onPress: () => void; disabled: boolean }) {
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { translateX: shake.value }] }));

  return (
    <Animated.View style={[{ position: 'absolute', left: `${target.x}%`, top: `${target.y}%`, marginLeft: -target.size / 2, marginTop: -target.size / 2 }, style]}>
      <Pressable
        onPress={() => { onPress(); }}
        disabled={disabled}
        onPressIn={() => { scale.value = withSpring(0.9, { damping: 14 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      >
        <LinearGradient colors={target.colors} style={[styles.orb, { width: target.size, height: target.size, borderRadius: target.size / 2 }]}>
          <View style={styles.shine} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const TapTheSmallOneGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [shapes, setShapes] = useState<ShapeTarget[]>([]);
  const [sparkleKey, setSparkleKey] = useState(0);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 15;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Pixel perfect! You found them all!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'tapTheSmallOne', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['size-discrimination', 'fine-target-selection', 'visual-attention'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  useEffect(() => { setShapes(spawnShapes()); roundActiveRef.current = true; }, [round]);
  useEffect(() => { speakTTS('Tap the smallest shape!', 0.78); return () => { stopAllSpeech(); cleanupSounds(); }; }, []);

  const handleTap = useCallback((id: SizeId) => {
    if (!roundActiveRef.current || doneRef.current) return;
    if (id === 'small') {
      setSparkleKey(Date.now());
      playSuccess();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      roundActiveRef.current = false;
      setScore((prev) => {
        const next = prev + 1;
        setTimeout(() => { if (next >= TOTAL_ROUNDS) endGame(next); else setRound((r) => r + 1); }, P.nextRoundDelayMs);
        return next;
      });
    } else {
      playError();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      speakTTS('Find the smallest one!', 0.78).catch(() => {});
    }
  }, [endGame, playSuccess, playError]);

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Pixel Hunter!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F0A2E', '#1E1B4B', '#312E81']} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🔬 Pixel Hunt</Text>
        <Text style={styles.subtitle}>Tap the tiniest shape</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        {shapes.map((s) => (
          <ShapeOrb key={`${round}-${s.id}`} target={s} onPress={() => handleTap(s.id)} disabled={!roundActiveRef.current} />
        ))}
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#818CF8" count={14} size={8} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1B4B' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#E0E7FF', textShadowColor: 'rgba(129,140,248,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  subtitle: { fontSize: 14, color: 'rgba(199,210,254,0.85)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.3)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, position: 'relative', marginHorizontal: 8 },
  orb: { shadowColor: '#6366F1', shadowOpacity: 0.45, shadowRadius: 12, elevation: 10 },
  shine: { position: 'absolute', top: '12%', left: '16%', width: '34%', height: '20%', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.35)' },
});

export default TapTheSmallOneGame;
