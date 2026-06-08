/**
 * OT Level 1 · Session 8 · Game 4 — Tap Only The Smallest Shape
 * Theme: "Scale Lab" — pick the tiniest orb among mixed sizes.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION8_PACING } from '@/components/game/occupational/level1/session8/session8Pacing';
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

const P = SESSION8_PACING;
const TOTAL_ROUNDS = 10;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR_ICON = require('@/assets/icons/star.png');

type ShapeItem = { id: string; size: number; x: number; y: number; colors: [string, string] };

const PALETTES: [string, string][] = [
  ['#2DD4BF', '#0D9488'], ['#38BDF8', '#0284C7'], ['#A78BFA', '#7C3AED'],
  ['#FB7185', '#E11D48'], ['#FBBF24', '#D97706'], ['#4ADE80', '#16A34A'],
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

function ShapeOrb({ item, onPress, disabled }: { item: ShapeItem; onPress: (id: string, anim: { pop: () => void; shake: () => void }) => void; disabled: boolean }) {
  const scale = useSharedValue(0);
  const shakeX = useSharedValue(0);
  useEffect(() => { scale.value = withSpring(1, { damping: 12 }); }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { translateX: shakeX.value }] }));
  const anim = {
    pop: () => { scale.value = withSequence(withTiming(1.4, { duration: 120 }), withTiming(0, { duration: 180 })); },
    shake: () => { shakeX.value = withSequence(withTiming(-8, { duration: 50 }), withTiming(8, { duration: 50 }), withTiming(0, { duration: 50 })); },
  };
  return (
    <Animated.View style={[{ position: 'absolute', left: `${item.x}%`, top: `${item.y}%`, marginLeft: -item.size / 2, marginTop: -item.size / 2 }, style]}>
      <Pressable onPress={() => onPress(item.id, anim)} disabled={disabled} style={{ borderRadius: item.size / 2, overflow: 'hidden' }}>
        <LinearGradient colors={item.colors} style={{ width: item.size, height: item.size, borderRadius: item.size / 2 }} />
      </Pressable>
    </Animated.View>
  );
}

const TapOnlyTheSmallestShapeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [shapes, setShapes] = useState<ShapeItem[]>([]);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [roundActive, setRoundActive] = useState(true);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const smallestRef = useRef('');

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 20;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Scale lab expert!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'tapOnlyTheSmallestShape', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['precision-discrimination', 'selective-control', 'inhibitory-control'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const spawnShapes = useCallback(() => {
    const count = 3 + Math.floor(Math.random() * 2);
    const sizes = [...P.smallestShape.sizes].sort(() => Math.random() - 0.5).slice(0, count);
    const minSize = Math.min(...sizes);
    const margin = 12;
    const positions: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
      for (let a = 0; a < 40; a++) {
        const x = margin + Math.random() * (100 - margin * 2);
        const y = margin + Math.random() * (100 - margin * 2);
        if (positions.every((p) => Math.hypot(p.x - x, p.y - y) >= 20)) { positions.push({ x, y }); break; }
      }
      if (positions.length <= i) positions.push({ x: 20 + i * 25, y: 30 + Math.random() * 40 });
    }
    const items: ShapeItem[] = sizes.map((size, i) => ({
      id: `${round}-${i}`, size, x: positions[i].x, y: positions[i].y,
      colors: PALETTES[Math.floor(Math.random() * PALETTES.length)],
    }));
    smallestRef.current = items.find((s) => s.size === minSize)!.id;
    setShapes(items);
    roundActiveRef.current = true;
    setRoundActive(true);
  }, [round]);

  useEffect(() => {
    if (doneRef.current) return;
    spawnShapes();
  }, [round]);

  useEffect(() => {
    speakTTS('Tap only the smallest shape!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const handleTap = useCallback((id: string, anim: { pop: () => void; shake: () => void }) => {
    if (!roundActiveRef.current || doneRef.current) return;
    if (id === smallestRef.current) {
      anim.pop();
      setSparkleKey(Date.now());
      playSuccess();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      roundActiveRef.current = false;
      setRoundActive(false);
      setScore((prev) => {
        const next = prev + 1;
        setTimeout(() => { if (next >= TOTAL_ROUNDS) endGame(next); else setRound((r) => r + 1); }, P.nextRoundDelayMs);
        return next;
      });
    } else {
      anim.shake();
      playError();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      speakTTS('Find the smallest one!', 0.78).catch(() => {});
    }
  }, [endGame, playSuccess, playError]);

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Micro Master!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#042F2E', '#0F766E', '#14B8A6', '#5EEAD4']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🔬 Scale Lab</Text>
        <Text style={styles.subtitle}>Find and tap the smallest orb</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        {shapes.map((s) => (
          <ShapeOrb key={s.id} item={s} onPress={handleTap} disabled={!roundActive} />
        ))}
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#5EEAD4" count={14} size={8} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  backText: { color: '#CCFBF1', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#CCFBF1' },
  subtitle: { fontSize: 14, color: 'rgba(204,251,241,0.8)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(94,234,212,0.15)', borderColor: 'rgba(94,234,212,0.35)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(94,234,212,0.25)', backgroundColor: 'rgba(0,0,0,0.15)' },
});

export default TapOnlyTheSmallestShapeGame;
