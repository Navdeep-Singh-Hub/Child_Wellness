/**
 * OT Level 1 · Session 6 · Game 4 — Tap Lights In Order
 * Theme: "Simon Spark" — classic watch-and-repeat light sequence.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION6_PACING } from '@/components/game/occupational/level1/session6/session6Pacing';
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
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION6_PACING;
const TOTAL_ROUNDS = 8;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR_ICON = require('@/assets/icons/star.png');

type ShapeId = 'circle' | 'square' | 'star';

const SHAPES: Record<ShapeId, { emoji: string; colors: [string, string]; glow: string }> = {
  circle: { emoji: '⭕', colors: ['#F472B6', '#DB2777'], glow: '#FBCFE8' },
  square: { emoji: '⬜', colors: ['#60A5FA', '#2563EB'], glow: '#BFDBFE' },
  star: { emoji: '⭐', colors: ['#FBBF24', '#D97706'], glow: '#FDE68A' },
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

const TapLightsInOrderGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sequence, setSequence] = useState<ShapeId[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSequence, setShowSequence] = useState(true);
  const [seqLength, setSeqLength] = useState(P.lights.startLength);
  const [sparkleKey, setSparkleKey] = useState(0);

  const indexRef = useRef(0);
  const sequenceRef = useRef<ShapeId[]>([]);
  const seqLengthRef = useRef(P.lights.startLength);
  const shakingRef = useRef(false);
  const roundActiveRef = useRef(false);
  const showingRef = useRef(true);
  const doneRef = useRef(false);
  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const glows = { circle: useSharedValue(0), square: useSharedValue(0), star: useSharedValue(0) };
  const scales = { circle: useSharedValue(1), square: useSharedValue(1), star: useSharedValue(1) };
  const shakes = { circle: useSharedValue(0), square: useSharedValue(0), star: useSharedValue(0) };

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 18;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Simon Spark champion! Amazing memory!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({
        type: 'tapLightsInOrder',
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: xp,
        skillTags: ['visual-memory', 'imitation-of-visual-sequence', 'attention-to-order'],
      }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const generateSequence = useCallback((len: number): ShapeId[] => {
    const ids: ShapeId[] = ['circle', 'square', 'star'];
    return Array.from({ length: len }, () => ids[Math.floor(Math.random() * 3)]);
  }, []);

  const playDemo = useCallback((seq: ShapeId[]) => {
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    setShowSequence(true);
    showingRef.current = true;
    roundActiveRef.current = false;
    (['circle', 'square', 'star'] as ShapeId[]).forEach((s) => { glows[s].value = 0; scales[s].value = 1; });

    let i = 0;
    const step = () => {
      if (i >= seq.length) {
        setShowSequence(false);
        showingRef.current = false;
        roundActiveRef.current = true;
        speakTTS('Your turn! Repeat the pattern.', 0.78).catch(() => {});
        return;
      }
      const s = seq[i];
      scales[s].value = withSequence(withTiming(1.3, { duration: 200 }), withTiming(1, { duration: 200 }));
      glows[s].value = withSequence(withTiming(1, { duration: 200 }), withTiming(0, { duration: 280 }));
      i += 1;
      demoTimerRef.current = setTimeout(step, P.sequenceStepMs);
    };
    demoTimerRef.current = setTimeout(step, P.sequenceStartDelayMs);
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    const len = seqLengthRef.current;
    const seq = generateSequence(len);
    setSequence(seq);
    setCurrentIndex(0);
    indexRef.current = 0;
    sequenceRef.current = seq;
    playDemo(seq);
  }, [round]);

  useEffect(() => {
    speakTTS('Watch the lights flash, then tap the shapes in the same order!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); if (demoTimerRef.current) clearTimeout(demoTimerRef.current); };
  }, []);

  const handleTap = useCallback((shape: ShapeId) => {
    if (!roundActiveRef.current || doneRef.current || shakingRef.current || showingRef.current) return;

    const expected = sequenceRef.current[indexRef.current];
    if (shape === expected) {
      scales[shape].value = withSequence(withSpring(1.15, { damping: 8 }), withSpring(1, { damping: 12 }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const next = indexRef.current + 1;
      indexRef.current = next;
      setCurrentIndex(next);

      if (next >= sequenceRef.current.length) {
        setSparkleKey(Date.now());
        playSuccess();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        roundActiveRef.current = false;

        setScore((prev) => {
          const newScore = prev + 1;
          if (newScore % 2 === 0 && seqLengthRef.current < P.lights.maxLength) {
            seqLengthRef.current += 1;
            setSeqLength(seqLengthRef.current);
          }
          setTimeout(() => {
            if (newScore >= TOTAL_ROUNDS) endGame(newScore);
            else setRound((r) => r + 1);
          }, P.nextRoundDelayMs);
          return newScore;
        });
      }
    } else {
      shakingRef.current = true;
      shakes[shape].value = withSequence(withTiming(-8, { duration: 45 }), withTiming(8, { duration: 45 }), withTiming(0, { duration: 45 }));
      indexRef.current = 0;
      setCurrentIndex(0);
      playError();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      speakTTS('Watch again!', 0.78).catch(() => {});
      setTimeout(() => {
        shakingRef.current = false;
        playDemo(sequenceRef.current);
      }, P.replayDelayMs);
    }
  }, [endGame, playSuccess, playError, playDemo]);

  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scales.circle.value + glows.circle.value * 0.15 }, { translateX: shakes.circle.value }], opacity: 0.5 + glows.circle.value * 0.5 }));
  const squareStyle = useAnimatedStyle(() => ({ transform: [{ scale: scales.square.value + glows.square.value * 0.15 }, { translateX: shakes.square.value }], opacity: 0.5 + glows.square.value * 0.5 }));
  const starStyle = useAnimatedStyle(() => ({ transform: [{ scale: scales.star.value + glows.star.value * 0.15 }, { translateX: shakes.star.value }], opacity: 0.5 + glows.star.value * 0.5 }));
  const shapeStyles: Record<ShapeId, typeof circleStyle> = { circle: circleStyle, square: squareStyle, star: starStyle };

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Simon Spark Pro!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1A0A2E', '#2E1065', '#4C1D95', '#6D28D9']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>💡 Simon Spark</Text>
        <Text style={styles.subtitle}>Pattern length: {seqLength} · watch & repeat</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        <View style={styles.panel}>
          {(['circle', 'square', 'star'] as ShapeId[]).map((id) => (
            <Animated.View key={id} style={shapeStyles[id]}>
              <Pressable onPress={() => handleTap(id)} disabled={showSequence || shakingRef.current}>
                <LinearGradient colors={SHAPES[id].colors} style={styles.lightPad}>
                  <Text style={styles.shapeEmoji}>{SHAPES[id].emoji}</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <View style={[styles.statusPill, showSequence && styles.statusWatch]}>
          <Text style={styles.statusText}>
            {showSequence ? '👀 Watch the lights!' : `Tap ${currentIndex + 1} of ${sequence.length}`}
          </Text>
        </View>

        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#A855F7" count={16} size={8} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2E1065' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#EDE9FE', textShadowColor: 'rgba(167,139,250,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  subtitle: { fontSize: 14, color: 'rgba(221,214,254,0.85)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.3)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  panel: { flexDirection: 'row', gap: 18, backgroundColor: 'rgba(0,0,0,0.25)', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  lightPad: { width: P.lights.size, height: P.lights.size, borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#A855F7', shadowOpacity: 0.45, shadowRadius: 14, elevation: 12 },
  shapeEmoji: { fontSize: 48 },
  statusPill: { marginTop: 36, backgroundColor: 'rgba(109,40,217,0.9)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 22 },
  statusWatch: { backgroundColor: 'rgba(251,191,36,0.88)' },
  statusText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

export default TapLightsInOrderGame;
