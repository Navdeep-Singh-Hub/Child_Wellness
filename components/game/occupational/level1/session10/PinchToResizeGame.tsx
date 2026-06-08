/**
 * OT Level 1 · Session 10 · Game 2 — Pinch To Resize
 * Theme: "Morph Lab" — pinch/spread to match the target ring.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION10_PACING } from '@/components/game/occupational/level1/session10/session10Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolateColor, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION10_PACING;
const R = P.pinchResize;
const TOTAL_ROUNDS = 8;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
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

const PinchToResizeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [targetSize, setTargetSize] = useState(120);
  const [sparkleKey, setSparkleKey] = useState(0);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const targetRef = useRef(120);
  const baseSizeRef = useRef(150);
  const objSize = useSharedValue(150);
  const pinchStart = useSharedValue(150);
  const matchProgress = useSharedValue(0);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 20;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Morph lab complete!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'pinchToResize', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['pinch-control', 'size-grading', 'visual-matching'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const trySuccess = useCallback(() => {
    if (!roundActiveRef.current || doneRef.current) return;
    if (Math.abs(objSize.value - targetRef.current) <= R.tolerance) {
      roundActiveRef.current = false;
      setSparkleKey(Date.now());
      playSuccess();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setScore((prev) => {
        const next = prev + 1;
        setTimeout(() => { if (next >= TOTAL_ROUNDS) endGame(next); else setRound((r) => r + 1); }, P.nextRoundDelayMs);
        return next;
      });
    }
  }, [endGame, playSuccess]);

  const startRound = useCallback(() => {
    if (doneRef.current) return;
    roundActiveRef.current = true;
    const target = R.min + Math.random() * (R.max - R.min);
    const start = R.min + Math.random() * (R.max - R.min);
    targetRef.current = target;
    baseSizeRef.current = start;
    setTargetSize(target);
    objSize.value = start;
    pinchStart.value = start;
    matchProgress.value = 0;
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    startRound();
  }, [round]);

  useEffect(() => {
    speakTTS('Pinch to shrink or spread to grow! Match the target ring.', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => { pinchStart.value = objSize.value; })
    .onUpdate((e) => {
      if (!roundActiveRef.current) return;
      const next = Math.max(R.min, Math.min(R.max, pinchStart.value * e.scale));
      objSize.value = next;
      const diff = Math.abs(next - targetRef.current);
      matchProgress.value = Math.max(0, 1 - diff / (R.max - R.min));
    })
    .onEnd(() => { runOnJS(trySuccess)(); });

  const objStyle = useAnimatedStyle(() => ({
    width: objSize.value, height: objSize.value, borderRadius: objSize.value / 2,
    transform: [{ translateX: -objSize.value / 2 }, { translateY: -objSize.value / 2 }],
    overflow: 'hidden' as const,
  }));
  const ringStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(matchProgress.value, [0, 0.5, 1], ['#EF4444', '#FBBF24', '#22C55E']),
  }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Morph Master!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#EDE9FE', '#DDD6FE', '#C4B5FD', '#A78BFA']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.title}>🔮 Morph Lab</Text>
        <Text style={styles.subtitle}>Match the dashed target ring</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
        <Text style={styles.targetHint}>Target: {Math.round(targetSize)}px</Text>
      </View>
      <GestureDetector gesture={pinchGesture}>
        <View style={styles.playArea}>
          <Animated.View style={[styles.targetRing, { width: targetSize, height: targetSize, marginLeft: -targetSize / 2, marginTop: -targetSize / 2, borderRadius: targetSize / 2 }, ringStyle]} />
          <Animated.View style={[styles.orb, objStyle]}>
            <LinearGradient colors={['#818CF8', '#6366F1', '#4F46E5']} style={StyleSheet.absoluteFillObject} />
          </Animated.View>
          <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#A78BFA" count={16} size={8} />
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  backText: { color: '#EDE9FE', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#4C1D95' },
  subtitle: { fontSize: 14, color: '#6D28D9', fontWeight: '600', marginTop: 4, marginBottom: 10 },
  targetHint: { fontSize: 13, color: '#7C3AED', fontWeight: '700', marginBottom: 10 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.55)', borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabel: { fontSize: 11, color: '#7C3AED', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#4C1D95' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(167,139,250,0.35)', backgroundColor: 'rgba(255,255,255,0.25)' },
  targetRing: { position: 'absolute', left: '50%', top: '50%', borderWidth: 4, borderStyle: 'dashed' },
  orb: { position: 'absolute', left: '50%', top: '50%', overflow: 'hidden', shadowColor: '#6366F1', shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 },
});

export default PinchToResizeGame;
