/**
 * OT Level 1 · Session 6 · Game 2 — Tap Colours In Order
 * Theme: "Rainbow Relay" — watch the flash, then repeat the color order.
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

type ColorId = 'red' | 'green' | 'blue';

const COLOR_META: Record<ColorId, { emoji: string; colors: [string, string]; label: string }> = {
  red: { emoji: '🔴', colors: ['#F87171', '#DC2626'], label: 'red' },
  green: { emoji: '🟢', colors: ['#4ADE80', '#16A34A'], label: 'green' },
  blue: { emoji: '🔵', colors: ['#60A5FA', '#2563EB'], label: 'blue' },
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

const TapColoursInOrderGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sequence, setSequence] = useState<ColorId[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSequence, setShowSequence] = useState(true);
  const [sparkleKey, setSparkleKey] = useState(0);

  const indexRef = useRef(0);
  const sequenceRef = useRef<ColorId[]>([]);
  const shakingRef = useRef(false);
  const roundActiveRef = useRef(false);
  const doneRef = useRef(false);
  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const glows = { red: useSharedValue(0), green: useSharedValue(0), blue: useSharedValue(0) };
  const scales = { red: useSharedValue(1), green: useSharedValue(1), blue: useSharedValue(1) };
  const shakes = { red: useSharedValue(0), green: useSharedValue(0), blue: useSharedValue(0) };

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 18;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Rainbow relay complete!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({
        type: 'tapColoursInOrder',
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: xp,
        skillTags: ['sequencing', 'colour-discrimination', 'visual-scanning', 'memory-stability'],
      }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const generateSequence = useCallback((): ColorId[] => {
    const ids: ColorId[] = ['red', 'green', 'blue'];
    return Array.from({ length: P.colors.sequenceLength }, () => ids[Math.floor(Math.random() * 3)]);
  }, []);

  const showingRef = useRef(true);
  useEffect(() => { showingRef.current = showSequence; }, [showSequence]);

  const playDemo = useCallback((seq: ColorId[]) => {
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    setShowSequence(true);
    showingRef.current = true;
    roundActiveRef.current = false;
    (['red', 'green', 'blue'] as ColorId[]).forEach((c) => { glows[c].value = 0; scales[c].value = 1; });

    let i = 0;
    const step = () => {
      if (i >= seq.length) {
        setShowSequence(false);
        showingRef.current = false;
        roundActiveRef.current = true;
        speakTTS('Your turn! Tap the colors in the same order.', 0.78).catch(() => {});
        return;
      }
      const c = seq[i];
      scales[c].value = withSequence(withTiming(1.35, { duration: 220 }), withTiming(1, { duration: 220 }));
      glows[c].value = withSequence(withTiming(1, { duration: 220 }), withTiming(0, { duration: 280 }));
      i += 1;
      demoTimerRef.current = setTimeout(step, P.sequenceStepMs);
    };
    demoTimerRef.current = setTimeout(step, P.sequenceStartDelayMs);
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    const seq = generateSequence();
    setSequence(seq);
    setCurrentIndex(0);
    indexRef.current = 0;
    sequenceRef.current = seq;
    playDemo(seq);
  }, [round]);

  useEffect(() => {
    speakTTS('Watch the color flash, then tap them in the same order!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); if (demoTimerRef.current) clearTimeout(demoTimerRef.current); };
  }, []);

  const handleTap = useCallback((color: ColorId) => {
    if (!roundActiveRef.current || doneRef.current || shakingRef.current || showingRef.current) return;

    const expected = sequenceRef.current[indexRef.current];
    if (color === expected) {
      scales[color].value = withSequence(withSpring(1.2, { damping: 8 }), withSpring(1, { damping: 12 }));
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
          setTimeout(() => {
            if (newScore >= TOTAL_ROUNDS) endGame(newScore);
            else setRound((r) => r + 1);
          }, P.nextRoundDelayMs);
          return newScore;
        });
      }
    } else {
      shakingRef.current = true;
      shakes[color].value = withSequence(withTiming(-8, { duration: 45 }), withTiming(8, { duration: 45 }), withTiming(0, { duration: 45 }));
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

  const redStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scales.red.value + glows.red.value * 0.15 }, { translateX: shakes.red.value }],
    opacity: 0.55 + glows.red.value * 0.45,
  }));
  const greenStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scales.green.value + glows.green.value * 0.15 }, { translateX: shakes.green.value }],
    opacity: 0.55 + glows.green.value * 0.45,
  }));
  const blueStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scales.blue.value + glows.blue.value * 0.15 }, { translateX: shakes.blue.value }],
    opacity: 0.55 + glows.blue.value * 0.45,
  }));
  const colorStyles: Record<ColorId, typeof redStyle> = { red: redStyle, green: greenStyle, blue: blueStyle };

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Rainbow Champion!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FDF2F8', '#FCE7F3', '#DBEAFE', '#E0E7FF']} locations={[0, 0.3, 0.65, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backTextDark}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.titleDark}>🌈 Rainbow Relay</Text>
        <Text style={styles.subtitleDark}>Watch · remember · repeat</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabelDark}>Round</Text><Text style={styles.statValueDark}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValueDark}>{score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        <View style={styles.colorsRow}>
          {(['red', 'green', 'blue'] as ColorId[]).map((id) => (
            <Animated.View key={id} style={colorStyles[id]}>
              <Pressable onPress={() => handleTap(id)} disabled={!roundActiveRef.current || showSequence || shakingRef.current}>
                <LinearGradient colors={COLOR_META[id].colors} style={styles.colorOrb}>
                  <Text style={styles.colorEmoji}>{COLOR_META[id].emoji}</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <View style={[styles.statusPill, showSequence && styles.statusWatch]}>
          <Text style={styles.statusText}>
            {showSequence ? '👀 Watch the sequence!' : `Tap ${currentIndex + 1} of ${sequence.length}`}
          </Text>
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
  backTextDark: { color: '#831843', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  titleDark: { fontSize: 28, fontWeight: '900', color: '#831843' },
  subtitleDark: { fontSize: 14, color: '#9D174D', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(236,72,153,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabelDark: { fontSize: 11, color: '#9D174D', fontWeight: '700', textTransform: 'uppercase' },
  statValueDark: { fontSize: 20, fontWeight: '900', color: '#831843' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  colorsRow: { flexDirection: 'row', gap: 20 },
  colorOrb: { width: P.colors.size, height: P.colors.size, borderRadius: P.colors.size / 2, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, elevation: 10 },
  colorEmoji: { fontSize: 52 },
  statusPill: { marginTop: 36, backgroundColor: 'rgba(99,102,241,0.88)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 22 },
  statusWatch: { backgroundColor: 'rgba(236,72,153,0.88)' },
  statusText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

export default TapColoursInOrderGame;
