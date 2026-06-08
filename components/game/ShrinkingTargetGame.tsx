/**
 * OT Level 1 · Session 2 · Game 3 — Shrinking Target
 * Theme: "Zoom Challenge" — target shrinks with each success, grows if you struggle.
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
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const POP_SOUND = 'https://actions.google.com/sounds/v1/cartoon/pop.ogg';
const TOTAL_TARGETS = 12;
const INITIAL_SIZE = 140;
const MIN_SIZE = 48;
const MAX_SIZE = 180;
const SIZE_DECREASE = 10;
const SIZE_INCREASE = 14;
const MISS_THRESHOLD = 2;
const STAR_ICON = require('@/assets/icons/star.png');

const RING_COLORS = ['#818CF8', '#F472B6', '#34D399', '#FBBF24', '#38BDF8', '#FB7185'];

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

const ShrinkingTargetGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playPop = usePopSound();

  const scoreRef = useRef(0);
  const sizeRef = useRef(INITIAL_SIZE);
  const missRef = useRef(0);
  const doneRef = useRef(false);
  const posRef = useRef({ x: 50, y: 50 });

  const [score, setScore] = useState(0);
  const [currentSize, setCurrentSize] = useState(INITIAL_SIZE);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [sizeHint, setSizeHint] = useState('');
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const ringPulse = useSharedValue(0.5);

  const spawnTarget = useCallback(() => {
    const size = sizeRef.current;
    const margin = Math.max(18, size / 5 + 12);
    const x = margin + Math.random() * (100 - margin * 2);
    const y = margin + Math.random() * (100 - margin * 2);
    posRef.current = { x, y };
    setTargetPos({ x, y });
    scale.value = 0;
    opacity.value = 0;
    scale.value = withSpring(1, { damping: 11, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 150 });
    ringPulse.value = withSequence(withTiming(1, { duration: 400 }), withTiming(0.4, { duration: 400 }));
  }, []);

  const finishGame = useCallback(async (finalScore: number) => {
    const stats = { correct: finalScore, total: TOTAL_TARGETS, xp: finalScore * 12 };
    setFinalStats(stats);
    setDone(true);
    setShowCongratulations(true);
    speakTTS('Zoom master! You hit every target!', 0.78);
    try {
      await recordGame(stats.xp);
      await logGameAndAward({
        type: 'shrinkingTarget',
        correct: finalScore,
        total: TOTAL_TARGETS,
        accuracy: (finalScore / TOTAL_TARGETS) * 100,
        xpAwarded: stats.xp,
        skillTags: ['graded-motor-control', 'progressive-precision', 'adaptability'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) {
      console.error('Failed to log shrinking target game:', e);
    }
  }, [router]);

  const onTapDone = useCallback(() => {
    const next = scoreRef.current + 1;
    scoreRef.current = next;
    setScore(next);
    setSparkleKey(Date.now());
    missRef.current = 0;

    if (next >= TOTAL_TARGETS) {
      finishGame(next);
      return;
    }

    const nextSize = Math.max(MIN_SIZE, sizeRef.current - SIZE_DECREASE);
    sizeRef.current = nextSize;
    setCurrentSize(nextSize);
    setTimeout(spawnTarget, 120);
  }, [finishGame, spawnTarget]);

  const handleTap = useCallback(() => {
    if (doneRef.current) return;
    playPop();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    scale.value = withSequence(
      withTiming(1.2, { duration: 60 }),
      withTiming(0, { duration: 130, easing: Easing.in(Easing.back(1.5)) }, (f) => { if (f) runOnJS(onTapDone)(); }),
    );
    opacity.value = withTiming(0, { duration: 130 });
  }, [playPop, onTapDone]);

  const handleMiss = useCallback(() => {
    if (doneRef.current) return;
    missRef.current += 1;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    if (missRef.current >= MISS_THRESHOLD) {
      const bigger = Math.min(MAX_SIZE, sizeRef.current + SIZE_INCREASE);
      sizeRef.current = bigger;
      setCurrentSize(bigger);
      missRef.current = 0;
      setSizeHint('Target grew bigger!');
      setTimeout(() => setSizeHint(''), 1200);
      speakTTS('Target is bigger now!', 0.78).catch(() => {});
    }
  }, []);

  useEffect(() => {
    doneRef.current = done;
  }, [done]);

  useEffect(() => {
    speakTTS('Tap the target! It shrinks each time. If you miss, it grows to help you.', 0.78);
    spawnTarget();
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const targetStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const ringColor = RING_COLORS[score % RING_COLORS.length];
  const sizePct = Math.round((currentSize / INITIAL_SIZE) * 100);

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message="Zoom Champion!"
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

  const { x, y } = targetPos;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1E1B4B', '#312E81', '#4338CA', '#6366F1']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Zoom Challenge</Text>
        <Text style={styles.subtitle}>Target shrinks as you succeed</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Image source={STAR_ICON} style={styles.starIcon} />
            <Text style={styles.statValue}>{score + 1}/{TOTAL_TARGETS}</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>Size</Text>
            <Text style={styles.statValue}>{sizePct}%</Text>
          </View>
        </View>
        <View style={styles.sizeBarTrack}>
          <View style={[styles.sizeBarFill, { width: `${sizePct}%`, backgroundColor: ringColor }]} />
        </View>
        {sizeHint ? <Text style={styles.sizeHint}>{sizeHint}</Text> : null}
      </View>

      <View style={styles.playArea}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={handleMiss}>
          <Animated.View
            style={[
              styles.targetWrap,
              { left: `${x}%`, top: `${y}%`, marginLeft: -currentSize / 2, marginTop: -currentSize / 2 },
              targetStyle,
            ]}
          >
            <Pressable onPress={(e) => { e.stopPropagation?.(); handleTap(); }}>
              <LinearGradient colors={[ringColor, '#6366F1', '#4338CA']} style={[styles.target, { width: currentSize, height: currentSize, borderRadius: currentSize / 2 }]}>
                <View style={styles.targetShine} />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </Pressable>
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={ringColor} count={12} size={7} />
      </View>

      <Text style={styles.footer}>Miss the background? Target grows to help you</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#312E81' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#E0E7FF' },
  subtitle: { fontSize: 13, color: 'rgba(199,210,254,0.85)', fontWeight: '600', marginTop: 4, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  statValue: { fontSize: 18, fontWeight: '900', color: '#fff' },
  starIcon: { width: 16, height: 16, resizeMode: 'contain' },
  sizeBarTrack: { width: '70%', height: 8, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, overflow: 'hidden', marginTop: 4 },
  sizeBarFill: { height: '100%', borderRadius: 999 },
  sizeHint: { marginTop: 6, fontSize: 13, fontWeight: '800', color: '#FDE68A' },
  playArea: { flex: 1, marginHorizontal: 14, marginBottom: 12, borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.15)' },
  targetWrap: { position: 'absolute' },
  target: { justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', shadowColor: '#818CF8', shadowOpacity: 0.6, shadowRadius: 20, elevation: 14 },
  targetShine: { position: 'absolute', top: '14%', left: '20%', width: '34%', height: '24%', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.45)', transform: [{ rotate: '-20deg' }] },
  footer: { textAlign: 'center', color: 'rgba(199,210,254,0.75)', fontSize: 13, fontWeight: '600', paddingBottom: 18 },
});

export default ShrinkingTargetGame;
