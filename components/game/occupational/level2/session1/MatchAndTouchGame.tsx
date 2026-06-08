/**
 * OT Level 2 · Session 1 · Game 5 — Match & Touch
 * Theme: "Shape Match Studio" — match the preview shape below.
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
const SHAPES = ['circle', 'square', 'triangle', 'star'] as const;
type Shape = typeof SHAPES[number];
const SHAPE_COLORS: Record<Shape, [string, string]> = {
  circle: ['#60A5FA', '#2563EB'],
  square: ['#F472B6', '#DB2777'],
  triangle: ['#FBBF24', '#D97706'],
  star: ['#A78BFA', '#7C3AED'],
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
  if (shape === 'star') return <Text style={{ fontSize: size }}>⭐</Text>;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 0, height: 0, borderLeftWidth: size / 2, borderRightWidth: size / 2, borderBottomWidth: size * 0.86, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: colors[0] }} />
    </View>
  );
};

export const MatchAndTouchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [target, setTarget] = useState<Shape>('circle');
  const [options, setOptions] = useState<Shape[]>([]);
  const [sparkleKey, setSparkleKey] = useState(0);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const previewScale = useSharedValue(1);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL;
    const xp = finalScore * 12;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Shape match studio complete!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'matchAndTouch', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['visual-matching', 'shape-recognition', 'eye-hand-coordination'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const startRound = useCallback(() => {
    const shuffled = [...SHAPES].sort(() => Math.random() - 0.5);
    const pick = shuffled[0];
    setTarget(pick);
    setOptions(shuffled.slice(0, 4));
    roundActiveRef.current = true;
    previewScale.value = withSequence(withTiming(1.1, { duration: 150 }), withTiming(1, { duration: 150 }));
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    startRound();
  }, [round]);

  useEffect(() => {
    speakTTS('Match the shape in the preview!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const handleTap = useCallback((shape: Shape) => {
    if (!roundActiveRef.current || doneRef.current) return;
    if (shape !== target) {
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
  }, [endGame, playSuccess, target]);

  const previewStyle = useAnimatedStyle(() => ({ transform: [{ scale: previewScale.value }] }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Shape Matcher!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FDF2F8', '#FCE7F3', '#FBCFE8', '#F9A8D4']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backTextDark}>← Back</Text></View>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.titleDark}>🎨 Shape Match Studio</Text>
        <Text style={styles.subtitleDark}>Tap the shape that matches the preview</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabelDark}>Round</Text><Text style={styles.statValueDark}>{round}/{TOTAL}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValueDark}>{score}</Text>
          </View>
        </View>
      </View>
      <View style={styles.previewBox}>
        <Text style={styles.previewLabel}>Match this</Text>
        <Animated.View style={previewStyle}>
          <ShapeView shape={target} size={P.previewSize} />
        </Animated.View>
      </View>
      <View style={styles.playArea}>
        <View style={styles.optionsGrid}>
          {options.map((shape, idx) => (
            <Pressable key={`${shape}-${idx}`} onPress={() => handleTap(shape)} style={styles.option}>
              <ShapeView shape={shape} size={P.shapeSize} />
            </Pressable>
          ))}
        </View>
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#EC4899" count={14} size={8} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(236,72,153,0.25)' },
  backTextDark: { color: '#BE185D', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  titleDark: { fontSize: 28, fontWeight: '900', color: '#BE185D' },
  subtitleDark: { fontSize: 14, color: '#DB2777', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(236,72,153,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabelDark: { fontSize: 11, color: '#DB2777', fontWeight: '700', textTransform: 'uppercase' },
  statValueDark: { fontSize: 20, fontWeight: '900', color: '#BE185D' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  previewBox: { alignItems: 'center', marginBottom: 12, paddingVertical: 12, marginHorizontal: 24, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: 'rgba(236,72,153,0.2)' },
  previewLabel: { fontSize: 12, fontWeight: '700', color: '#DB2777', textTransform: 'uppercase', marginBottom: 8 },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(236,72,153,0.25)', backgroundColor: 'rgba(255,255,255,0.35)', justifyContent: 'center' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, padding: 16 },
  option: { width: '42%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(236,72,153,0.15)' },
});

export default MatchAndTouchGame;
