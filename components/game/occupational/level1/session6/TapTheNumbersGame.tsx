/**
 * OT Level 1 · Session 6 · Game 1 — Tap The Numbers
 * Theme: "Number Galaxy" — tap glowing orbs in the right order.
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
  withRepeat,
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
const NUM_POOL = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const ORB_COLORS = [
  ['#818CF8', '#6366F1'] as [string, string],
  ['#F472B6', '#EC4899'] as [string, string],
  ['#34D399', '#10B981'] as [string, string],
];

function formatSequenceSpeech(seq: number[]): string {
  if (seq.length <= 1) return String(seq[0] ?? '');
  return `${seq.slice(0, -1).join(', then ')}, then ${seq[seq.length - 1]}`;
}

function generateRound() {
  const pool = [...NUM_POOL].sort(() => Math.random() - 0.5);
  const sequence = pool.slice(0, P.numbers.sequenceLength);
  const slots = [...sequence].sort(() => Math.random() - 0.5);
  return { sequence, slots };
}

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

const TapTheNumbersGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sequence, setSequence] = useState<number[]>([1, 2, 3]);
  const [slotNumbers, setSlotNumbers] = useState<number[]>([1, 2, 3]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);

  const indexRef = useRef(0);
  const sequenceRef = useRef<number[]>([1, 2, 3]);
  const shakingRef = useRef(false);
  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);

  const scales = [useSharedValue(1), useSharedValue(1), useSharedValue(1)];
  const shakes = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];
  const nextPulse = useSharedValue(1);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 18;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    roundActiveRef.current = false;
    setShowCongratulations(true);
    speakTTS('Number galaxy conquered!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({
        type: 'tapTheNumbers',
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: xp,
        skillTags: ['early-sequencing', 'number-order-foundation', 'working-memory'],
      }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const setupRound = useCallback((speakHint: boolean) => {
    const { sequence: seq, slots } = generateRound();
    setSequence(seq);
    setSlotNumbers(slots);
    setCurrentIndex(0);
    indexRef.current = 0;
    sequenceRef.current = seq;
    roundActiveRef.current = true;
    scales.forEach((s) => { s.value = 1; });
    shakes.forEach((s) => { s.value = 0; });
    nextPulse.value = withRepeat(withSequence(withTiming(1.08, { duration: 500 }), withTiming(1, { duration: 500 })), -1, true);
    if (speakHint) speakTTS(`Tap in order: ${formatSequenceSpeech(seq)}`, 0.78).catch(() => {});
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    setupRound(round === 1);
  }, [round]);

  useEffect(() => {
    speakTTS('Tap the number orbs in the order shown!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const handleTap = useCallback((num: number, slotIndex: number) => {
    if (!roundActiveRef.current || doneRef.current || shakingRef.current) return;

    const expected = sequenceRef.current[indexRef.current];
    if (num === expected) {
      scales[slotIndex].value = withSequence(withSpring(1.2, { damping: 8 }), withSpring(1, { damping: 12 }));
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
      shakes[slotIndex].value = withSequence(
        withTiming(-8, { duration: 45 }), withTiming(8, { duration: 45 }),
        withTiming(-8, { duration: 45 }), withTiming(0, { duration: 45 }),
      );
      indexRef.current = 0;
      setCurrentIndex(0);
      playError();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      speakTTS(`Try again! ${formatSequenceSpeech(sequenceRef.current)}`, 0.78).catch(() => {});
      setTimeout(() => { shakingRef.current = false; }, P.shakeResetMs);
    }
  }, [endGame, playSuccess, playError]);

  const slot0Style = useAnimatedStyle(() => ({ transform: [{ scale: scales[0].value }, { translateX: shakes[0].value }] }));
  const slot1Style = useAnimatedStyle(() => ({ transform: [{ scale: scales[1].value }, { translateX: shakes[1].value }] }));
  const slot2Style = useAnimatedStyle(() => ({ transform: [{ scale: scales[2].value }, { translateX: shakes[2].value }] }));
  const slotStyles = [slot0Style, slot1Style, slot2Style];

  const expected = sequence[currentIndex];

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Galaxy Counter!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
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
        <Text style={styles.title}>🔢 Number Galaxy</Text>
        <Text style={styles.subtitle}>Tap orbs in order: {formatSequenceSpeech(sequence)}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        <View style={styles.orbsRow}>
          {slotNumbers.map((num, i) => {
            const isNext = num === expected;
            const colors = ORB_COLORS[i % ORB_COLORS.length];
            return (
              <Animated.View key={`${round}-${i}-${num}`} style={slotStyles[i]}>
                <Pressable onPress={() => handleTap(num, i)} disabled={!roundActiveRef.current || shakingRef.current}>
                  <LinearGradient colors={isNext ? ['#22C55E', '#16A34A'] : colors}
                    style={[styles.orb, isNext && styles.orbNext]}>
                    <Text style={styles.orbNum}>{num}</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Tap {expected} next</Text>
          <View style={styles.dotsRow}>
            {sequence.map((n, idx) => (
              <View key={`dot-${idx}`} style={[styles.dot, idx < currentIndex && styles.dotDone, idx === currentIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

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
  subtitle: { fontSize: 14, color: 'rgba(199,210,254,0.85)', fontWeight: '600', marginTop: 4, marginBottom: 14, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.3)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  orbsRow: { flexDirection: 'row', gap: 18, flexWrap: 'wrap', justifyContent: 'center' },
  orb: { width: P.numbers.circleSize, height: P.numbers.circleSize, borderRadius: P.numbers.circleSize / 2, justifyContent: 'center', alignItems: 'center', shadowColor: '#6366F1', shadowOpacity: 0.5, shadowRadius: 14, elevation: 12 },
  orbNext: { borderWidth: 3, borderColor: '#FDE047' },
  orbNum: { fontSize: 40, fontWeight: '900', color: '#fff' },
  progressRow: { marginTop: 36, alignItems: 'center' },
  progressLabel: { fontSize: 17, fontWeight: '800', color: '#C7D2FE', marginBottom: 12 },
  dotsRow: { flexDirection: 'row', gap: 10 },
  dot: { width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.15)' },
  dotDone: { backgroundColor: '#22C55E' },
  dotActive: { backgroundColor: '#818CF8', transform: [{ scale: 1.15 }] },
});

export default TapTheNumbersGame;
