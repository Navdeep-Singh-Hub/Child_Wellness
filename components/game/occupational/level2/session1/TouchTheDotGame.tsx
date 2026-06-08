/**
 * OT Level 2 · Session 1 · Game 1 — Touch The Dot
 * Theme: "Dot Safari" — tap the colorful dot wherever it appears.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION1_PACING } from '@/components/game/occupational/level2/session1/session1Pacing';
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

const P = SESSION1_PACING;
const TOTAL = P.totalRounds;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const STAR_ICON = require('@/assets/icons/star.png');
const PALETTES: [string, string][] = [
  ['#4ADE80', '#16A34A'], ['#60A5FA', '#2563EB'], ['#FBBF24', '#D97706'],
  ['#F472B6', '#DB2777'], ['#A78BFA', '#7C3AED'], ['#22D3EE', '#0891B2'],
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

export const TouchTheDotGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [colors, setColors] = useState<[string, string]>(PALETTES[0]);
  const [sparkleKey, setSparkleKey] = useState(0);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL;
    const xp = finalScore * 12;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Dot safari complete!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'touchTheDot', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['eye-hand-coordination', 'visual-attention', 'target-acquisition'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const spawn = useCallback(() => {
    const m = 14;
    setPos({ x: m + Math.random() * (100 - m * 2), y: m + Math.random() * (100 - m * 2) });
    setColors(PALETTES[Math.floor(Math.random() * PALETTES.length)]);
    roundActiveRef.current = true;
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withTiming(1, { duration: 200 });
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    spawn();
  }, [round]);

  useEffect(() => {
    speakTTS('Tap the dot when you see it!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const handleTap = useCallback(() => {
    if (!roundActiveRef.current || doneRef.current) return;
    roundActiveRef.current = false;
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    scale.value = withSequence(withTiming(1.2, { duration: 100 }), withTiming(0, { duration: P.successPopMs }));
    opacity.value = withTiming(0, { duration: P.successPopMs });
    setScore((prev) => {
      const next = prev + 1;
      setTimeout(() => { if (next >= TOTAL) endGame(next); else setRound((r) => r + 1); }, P.nextRoundDelayMs);
      return next;
    });
  }, [endGame, spawn, playSuccess]);

  const dotStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Dot Explorer!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#ECFDF5', '#D1FAE5', '#A7F3D0', '#6EE7B7']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backTextDark}>← Back</Text></View>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.titleDark}>🎯 Dot Safari</Text>
        <Text style={styles.subtitleDark}>Tap the dot wherever it appears</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabelDark}>Round</Text><Text style={styles.statValueDark}>{round}/{TOTAL}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValueDark}>{score}</Text>
          </View>
        </View>
      </View>
      <View style={styles.playArea}>
        <Animated.View style={[styles.dotWrap, { left: `${pos.x}%`, top: `${pos.y}%` }, dotStyle]}>
          <Pressable onPress={handleTap} style={styles.hit}>
            <LinearGradient colors={colors} style={styles.dot} />
          </Pressable>
        </Animated.View>
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={colors[0]} count={14} size={8} />
      </View>
    </SafeAreaView>
  );
};

const S = P.dotSize;
const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)' },
  backTextDark: { color: '#047857', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  titleDark: { fontSize: 28, fontWeight: '900', color: '#047857' },
  subtitleDark: { fontSize: 14, color: '#059669', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabelDark: { fontSize: 11, color: '#059669', fontWeight: '700', textTransform: 'uppercase' },
  statValueDark: { fontSize: 20, fontWeight: '900', color: '#047857' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)', backgroundColor: 'rgba(255,255,255,0.35)' },
  dotWrap: { position: 'absolute', marginLeft: -S / 2, marginTop: -S / 2 },
  hit: { width: S + 24, height: S + 24, justifyContent: 'center', alignItems: 'center' },
  dot: { width: S, height: S, borderRadius: S / 2, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
});

export default TouchTheDotGame;
