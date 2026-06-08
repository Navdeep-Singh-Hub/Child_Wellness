/**
 * OT Level 1 · Session 2 · Game 5 — Multiple Small Targets
 * Theme: "Constellation Pop" — clear every star in the cluster.
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
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const POP_SOUND = 'https://actions.google.com/sounds/v1/cartoon/pop.ogg';
const TOTAL_ROUNDS = 5;
const TARGETS_PER_ROUND = 4;
const STAGGER_MS = 65;
const ROUND_HANDOFF_MS = 400;
const DOT_SIZE = 46;
const STAR_ICON = require('@/assets/icons/star.png');

const STAR_COLORS = ['#38BDF8', '#A78BFA', '#F472B6', '#34D399', '#FBBF24', '#FB7185', '#2DD4BF', '#818CF8'];

type StarData = { id: string; x: number; y: number; colorIdx: number; popped: boolean };

const usePopSound = () => {
  const ref = useRef<ExpoAudio.Sound | null>(null);
  useEffect(() => () => { ref.current?.unloadAsync().catch(() => {}); }, []);
  return useCallback(() => {
    if (Platform.OS === 'web') return;
    (async () => {
      try {
        if (!ref.current) {
          const { sound } = await ExpoAudio.Sound.createAsync({ uri: POP_SOUND }, { volume: 0.42 });
          ref.current = sound;
        }
        ref.current.replayAsync().catch(() => {});
      } catch { /* noop */ }
    })();
  }, []);
};

function ConstellationStar({
  data, onPop, enterDelay, hint,
}: { data: StarData; onPop: (id: string) => void; enterDelay: number; hint: boolean }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const twinkle = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(enterDelay, withSpring(1, { damping: 11, stiffness: 150 }));
    opacity.value = withDelay(enterDelay, withTiming(1, { duration: 160 }));
  }, [data.id]);

  useEffect(() => {
    if (hint && !data.popped) {
      twinkle.value = withRepeat(withSequence(withTiming(1.12, { duration: 400 }), withTiming(1, { duration: 400 })), -1, true);
    } else {
      twinkle.value = withTiming(1, { duration: 120 });
    }
  }, [hint, data.popped]);

  useEffect(() => {
    if (data.popped) {
      scale.value = withSequence(withTiming(1.2, { duration: 55 }), withTiming(0, { duration: 100 }));
      opacity.value = withTiming(0, { duration: 110 });
    }
  }, [data.popped]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: -DOT_SIZE / 2 }, { translateY: -DOT_SIZE / 2 }, { scale: scale.value * twinkle.value }],
    opacity: opacity.value,
  }));

  const color = STAR_COLORS[data.colorIdx % STAR_COLORS.length];
  if (data.popped) return null;

  return (
    <Animated.View style={[{ position: 'absolute', left: `${data.x}%`, top: `${data.y}%` }, style]}>
      <Pressable onPress={() => onPop(data.id)} hitSlop={10}>
        <LinearGradient colors={[color, `${color}99`]} style={[styles.star, { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2 }]}>
          <View style={styles.starShine} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const MultipleSmallTargetsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playPop = usePopSound();

  const scoreRef = useRef(0);
  const roundPoppedRef = useRef(0);
  const roundRef = useRef(1);
  const transitioningRef = useRef(false);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState<StarData[]>([]);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [showRoundFlash, setShowRoundFlash] = useState(false);
  const [roundPopped, setRoundPopped] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);

  const generatePositions = useCallback(() => {
    const margin = 14;
    const positions: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < TARGETS_PER_ROUND; i++) {
      let attempts = 0;
      let x = 0, y = 0, ok = false;
      while (!ok && attempts < 60) {
        x = margin + Math.random() * (100 - margin * 2);
        y = margin + Math.random() * (100 - margin * 2);
        ok = positions.every((p) => Math.hypot(p.x - x, p.y - y) >= 16);
        attempts++;
      }
      positions.push({ x, y });
    }
    return positions;
  }, []);

  const spawnRound = useCallback((r: number) => {
    const positions = generatePositions();
    setStars(positions.map((pos, i) => ({
      id: `s-${r}-${i}-${Date.now()}`,
      x: pos.x,
      y: pos.y,
      colorIdx: r * 2 + i,
      popped: false,
    })));
    roundPoppedRef.current = 0;
    setRoundPopped(0);
    transitioningRef.current = false;
    setSpawnGen((g) => g + 1);
  }, [generatePositions]);

  const endGame = useCallback(async (finalScore: number) => {
    const total = TOTAL_ROUNDS * TARGETS_PER_ROUND;
    const stats = { correct: finalScore, total, xp: finalScore * 10 };
    setFinalStats(stats);
    setDone(true);
    setShowCongratulations(true);
    speakTTS('Constellation complete! Perfect scanning!', 0.78);
    try {
      await recordGame(stats.xp);
      await logGameAndAward({
        type: 'multipleSmallTargets',
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: stats.xp,
        skillTags: ['refined-tapping', 'scanning-precision', 'sustained-motor-activity', 'finger-isolation'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) {
      console.error('Failed to log multiple small targets game:', e);
    }
  }, [router]);

  const handlePop = useCallback((id: string) => {
    if (transitioningRef.current || done) return;

    setStars((prev) => {
      const target = prev.find((s) => s.id === id);
      if (!target || target.popped) return prev;
      return prev.map((s) => (s.id === id ? { ...s, popped: true } : s));
    });

    playPop();
    setSparkleKey(Date.now());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    roundPoppedRef.current += 1;
    scoreRef.current += 1;
    setScore(scoreRef.current);
    setRoundPopped(roundPoppedRef.current);

    if (roundPoppedRef.current >= TARGETS_PER_ROUND && !transitioningRef.current) {
      transitioningRef.current = true;
      if (roundRef.current >= TOTAL_ROUNDS) {
        setTimeout(() => endGame(scoreRef.current), 280);
      } else {
        setShowRoundFlash(true);
        setTimeout(() => {
          setShowRoundFlash(false);
          roundRef.current += 1;
          setRound(roundRef.current);
          spawnRound(roundRef.current);
        }, ROUND_HANDOFF_MS);
      }
    }
  }, [done, endGame, spawnRound, playPop]);

  useEffect(() => {
    speakTTS('Pop every star in the cluster!', 0.78);
    spawnRound(1);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const lastId = stars.find((s) => !s.popped)?.id;

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message="Star Scanner!"
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#020617', '#0F172A', '#1E293B', '#312E81']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Constellation Pop</Text>
        <Text style={styles.subtitle}>{TARGETS_PER_ROUND - roundPopped} stars left · Round {round}/{TOTAL_ROUNDS}</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
        <View style={styles.roundDots}>
          {Array.from({ length: TARGETS_PER_ROUND }).map((_, i) => (
            <View key={i} style={[styles.dot, i < roundPopped && styles.dotDone]} />
          ))}
        </View>
      </View>

      <View style={styles.playArea}>
        {showRoundFlash && (
          <View pointerEvents="none" style={styles.roundFlash}>
            <Text style={styles.roundFlashText}>Cluster clear! ✨</Text>
          </View>
        )}
        {stars.map((s, i) => (
          <ConstellationStar
            key={`${spawnGen}-${s.id}`}
            data={s}
            onPop={handlePop}
            enterDelay={i * STAGGER_MS}
            hint={s.id === lastId && stars.filter((x) => !x.popped).length === 1}
          />
        ))}
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#38BDF8" count={10} size={6} />
      </View>

      <Text style={styles.footer}>Scan the screen · pop every star in the cluster</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '900', color: '#BAE6FD' },
  subtitle: { fontSize: 13, color: 'rgba(186,230,253,0.85)', fontWeight: '600', marginTop: 4, marginBottom: 10 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.3)' },
  statValue: { fontSize: 18, fontWeight: '900', color: '#fff' },
  starIcon: { width: 16, height: 16, resizeMode: 'contain' },
  roundDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 11, height: 11, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },
  dotDone: { backgroundColor: '#38BDF8', borderColor: '#BAE6FD' },
  playArea: { flex: 1, marginHorizontal: 14, marginBottom: 10, borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(56,189,248,0.3)', backgroundColor: 'rgba(0,0,0,0.2)' },
  star: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)', shadowColor: '#38BDF8', shadowOpacity: 0.5, shadowRadius: 10, elevation: 8 },
  starShine: { position: 'absolute', top: '15%', left: '20%', width: '32%', height: '22%', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.5)', transform: [{ rotate: '-20deg' }] },
  roundFlash: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  roundFlashText: { fontSize: 24, fontWeight: '900', color: '#BAE6FD' },
  footer: { textAlign: 'center', color: 'rgba(186,230,253,0.7)', fontSize: 13, fontWeight: '600', paddingBottom: 18 },
});

export default MultipleSmallTargetsGame;
