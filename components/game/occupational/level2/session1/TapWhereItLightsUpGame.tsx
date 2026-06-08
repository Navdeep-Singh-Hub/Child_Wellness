/**
 * OT Level 2 · Session 1 · Game 4 — Tap Where It Lights Up
 * Theme: "Glow Recall" — remember which shape glowed, then tap it.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION1_PACING } from '@/components/game/occupational/level2/session1/session1Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION1_PACING;
const TOTAL = P.totalRounds;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const STAR_ICON = require('@/assets/icons/star.png');
const SHAPES = ['circle', 'square', 'triangle'] as const;
type Shape = typeof SHAPES[number];
const SHAPE_COLORS: Record<Shape, [string, string]> = {
  circle: ['#60A5FA', '#2563EB'],
  square: ['#F472B6', '#DB2777'],
  triangle: ['#FBBF24', '#D97706'],
};

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

const ShapeView: React.FC<{ shape: Shape; size: number }> = ({ shape, size }) => {
  const colors = SHAPE_COLORS[shape];
  if (shape === 'circle') return <LinearGradient colors={colors} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  if (shape === 'square') return <LinearGradient colors={colors} style={{ width: size, height: size, borderRadius: 8 }} />;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 0, height: 0, borderLeftWidth: size / 2, borderRightWidth: size / 2, borderBottomWidth: size * 0.86, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: colors[0] }} />
    </View>
  );
};

export const TapWhereItLightsUpGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [slots, setSlots] = useState<Shape[]>(['circle', 'square', 'triangle']);
  const [targetIdx, setTargetIdx] = useState(0);
  const [phase, setPhase] = useState<'show' | 'recall'>('show');
  const [sparkleKey, setSparkleKey] = useState(0);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const glow0 = useSharedValue(0);
  const glow1 = useSharedValue(0);
  const glow2 = useSharedValue(0);
  const glowValues = [glow0, glow1, glow2];

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL;
    const xp = finalScore * 12;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Glow recall complete!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'tapWhereItLightsUp', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['visual-memory', 'attention', 'eye-hand-coordination'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const startRound = useCallback(() => {
    const shuffled = [...SHAPES].sort(() => Math.random() - 0.5);
    const idx = Math.floor(Math.random() * 3);
    setSlots(shuffled);
    setTargetIdx(idx);
    setPhase('show');
    roundActiveRef.current = true;
    glow0.value = 0; glow1.value = 0; glow2.value = 0;
    glowValues[idx].value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(1, { duration: P.glowShowMs - 400 }),
      withTiming(0, { duration: 200 }),
    );
    setTimeout(() => setPhase('recall'), P.glowShowMs);
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    startRound();
  }, [round]);

  useEffect(() => {
    speakTTS('Watch which shape glows, then tap it!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const handleTap = useCallback((idx: number) => {
    if (!roundActiveRef.current || doneRef.current || phase !== 'recall') return;
    if (idx !== targetIdx) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    roundActiveRef.current = false;
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setScore((prev) => {
      const next = prev + 1;
      setTimeout(() => { if (next >= TOTAL) endGame(next); else setRound((r) => r + 1); }, P.nextRoundDelayMs);
      return next;
    });
  }, [endGame, phase, playSuccess, targetIdx]);

  const glow0Style = useAnimatedStyle(() => ({ opacity: 0.3 + glow0.value * 0.7, transform: [{ scale: 1 + glow0.value * 0.15 }] }));
  const glow1Style = useAnimatedStyle(() => ({ opacity: 0.3 + glow1.value * 0.7, transform: [{ scale: 1 + glow1.value * 0.15 }] }));
  const glow2Style = useAnimatedStyle(() => ({ opacity: 0.3 + glow2.value * 0.7, transform: [{ scale: 1 + glow2.value * 0.15 }] }));
  const slotStyles = [glow0Style, glow1Style, glow2Style];

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Memory Master!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FFF7ED', '#FFEDD5', '#FED7AA', '#FDBA74']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backTextDark}>← Back</Text></View>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.titleDark}>✨ Glow Recall</Text>
        <Text style={styles.subtitleDark}>{phase === 'show' ? 'Watch the glow…' : 'Tap the shape that lit up'}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabelDark}>Round</Text><Text style={styles.statValueDark}>{round}/{TOTAL}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValueDark}>{score}</Text>
          </View>
        </View>
      </View>
      <View style={styles.playArea}>
        <View style={styles.slotsRow}>
          {slots.map((shape, idx) => (
            <Pressable key={idx} onPress={() => handleTap(idx)} style={styles.slot}>
              <Animated.View style={[styles.shapeWrap, slotStyles[idx]]}>
                <ShapeView shape={shape} size={P.shapeSize} />
              </Animated.View>
            </Pressable>
          ))}
        </View>
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#FBBF24" count={14} size={8} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(234,88,12,0.25)' },
  backTextDark: { color: '#C2410C', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  titleDark: { fontSize: 28, fontWeight: '900', color: '#C2410C' },
  subtitleDark: { fontSize: 14, color: '#EA580C', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(234,88,12,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabelDark: { fontSize: 11, color: '#EA580C', fontWeight: '700', textTransform: 'uppercase' },
  statValueDark: { fontSize: 20, fontWeight: '900', color: '#C2410C' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(234,88,12,0.25)', backgroundColor: 'rgba(255,255,255,0.35)', justifyContent: 'center' },
  slotsRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingHorizontal: 8 },
  slot: { padding: 12 },
  shapeWrap: { padding: 8, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.5)' },
});

export default TapWhereItLightsUpGame;
