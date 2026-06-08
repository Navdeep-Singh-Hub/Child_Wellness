/**
 * OT Level 1 · Session 1 · Game 5 — Multi-Tap Fun
 * Theme: "Pop Party Meadow" — burst every balloon as fast as you can.
 * Gameplay: staggered spawns, instant tap response, no blocking delays between pops.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
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

const POP_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const BALLOONS_PER_ROUND = 5;
const TOTAL_ROUNDS = 3;
const STAGGER_MS = 70;
const ROUND_HANDOFF_MS = 420;
const STAR_ICON = require('@/assets/icons/star.png');

const BALLOON_PALETTE = [
  { body: ['#FB7185', '#F43F5E'], string: '#BE123C' },
  { body: ['#FBBF24', '#F59E0B'], string: '#B45309' },
  { body: ['#A78BFA', '#8B5CF6'], string: '#6D28D9' },
  { body: ['#34D399', '#10B981'], string: '#047857' },
  { body: ['#60A5FA', '#3B82F6'], string: '#1D4ED8' },
  { body: ['#F472B6', '#EC4899'], string: '#BE185D' },
  { body: ['#2DD4BF', '#14B8A6'], string: '#0F766E' },
  { body: ['#FB923C', '#EA580C'], string: '#9A3412' },
];

type BalloonData = {
  id: string;
  x: number;
  y: number;
  colorIdx: number;
  popped: boolean;
};

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

function MeadowBalloon({
  data,
  size,
  onPop,
  enterDelay,
  isLastUntapped,
}: {
  data: BalloonData;
  size: number;
  onPop: (id: string) => void;
  enterDelay: number;
  isLastUntapped: boolean;
}) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const bob = useSharedValue(0);
  const wiggle = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(enterDelay, withSpring(1, { damping: 11, stiffness: 140 }));
    opacity.value = withDelay(enterDelay, withTiming(1, { duration: 180 }));
    bob.value = withDelay(enterDelay, withRepeat(
      withSequence(
        withTiming(-6, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(6, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    ));
  }, [data.id]);

  useEffect(() => {
    if (isLastUntapped && !data.popped) {
      wiggle.value = withRepeat(
        withSequence(withTiming(1.08, { duration: 400 }), withTiming(1, { duration: 400 })),
        -1,
        true,
      );
    } else {
      wiggle.value = withTiming(1, { duration: 150 });
    }
  }, [isLastUntapped, data.popped]);

  useEffect(() => {
    if (data.popped) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 60 }),
        withTiming(0, { duration: 100, easing: Easing.in(Easing.back(1.5)) }),
      );
      opacity.value = withTiming(0, { duration: 120 });
    }
  }, [data.popped]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: -size / 2 },
      { translateY: -size / 2 + bob.value },
      { scale: scale.value * wiggle.value },
    ],
    opacity: opacity.value,
  }));

  const colors = BALLOON_PALETTE[data.colorIdx % BALLOON_PALETTE.length];
  if (data.popped) return null;

  return (
    <Animated.View pointerEvents={data.popped ? 'none' : 'auto'} style={[styles.balloonWrap, { left: `${data.x}%`, top: `${data.y}%` }, style]}>
      <Pressable onPress={() => onPop(data.id)} hitSlop={12}>
        <View style={styles.balloonCol}>
          <LinearGradient colors={colors.body as [string, string]} style={[styles.balloonBody, { width: size, height: size * 1.12, borderRadius: size * 0.5 }]}>
            <View style={styles.balloonShine} />
          </LinearGradient>
          <View style={[styles.balloonString, { backgroundColor: colors.string }]} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

function RoundClearFlash({ visible }: { visible: boolean }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  useEffect(() => {
    if (!visible) return;
    opacity.value = withSequence(withTiming(1, { duration: 100 }), withTiming(0, { duration: 350 }));
    scale.value = withSpring(1, { damping: 10 });
  }, [visible]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));
  if (!visible) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.roundFlash, style]}>
      <Text style={styles.roundFlashText}>Round clear! 🎉</Text>
    </Animated.View>
  );
}

const MultiTapFunGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const balloonSize = Math.min(width * 0.22, 108);

  const [round, setRound] = useState(1);
  const [balloons, setBalloons] = useState<BalloonData[]>([]);
  const [totalPopped, setTotalPopped] = useState(0);
  const [roundPopped, setRoundPopped] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [showRoundFlash, setShowRoundFlash] = useState(false);
  const [spawnGen, setSpawnGen] = useState(0);

  const totalPoppedRef = useRef(0);
  const roundPoppedRef = useRef(0);
  const roundRef = useRef(1);
  const transitioningRef = useRef(false);
  const playPop = usePopSound();

  const generatePositions = useCallback((): Array<{ x: number; y: number }> => {
    const positions: Array<{ x: number; y: number }> = [];
    const margin = 14;
    const minDist = 18;
    for (let i = 0; i < BALLOONS_PER_ROUND; i++) {
      let attempts = 0;
      let x = 0;
      let y = 0;
      let ok = false;
      while (!ok && attempts < 60) {
        x = margin + Math.random() * (100 - margin * 2);
        y = margin + Math.random() * (100 - margin * 2);
        ok = positions.every((p) => Math.hypot(p.x - x, p.y - y) >= minDist);
        attempts++;
      }
      positions.push({ x, y });
    }
    return positions;
  }, []);

  const spawnRound = useCallback((r: number) => {
    const positions = generatePositions();
    const newBalloons: BalloonData[] = positions.map((pos, i) => ({
      id: `b-${r}-${i}-${Date.now()}`,
      x: pos.x,
      y: pos.y,
      colorIdx: (r * 3 + i) % BALLOON_PALETTE.length,
      popped: false,
    }));
    roundPoppedRef.current = 0;
    setRoundPopped(0);
    setBalloons(newBalloons);
    setSpawnGen((g) => g + 1);
    transitioningRef.current = false;
  }, [generatePositions]);

  const endGame = useCallback(async (finalPopped: number) => {
    const total = TOTAL_ROUNDS * BALLOONS_PER_ROUND;
    const xp = finalPopped * 10;
    const stats = { correct: finalPopped, total, xp };
    setFinalStats(stats);
    setDone(true);
    setShowCongratulations(true);
    speakTTS('Pop party complete! You got them all!', 0.78);
    try {
      await recordGame(xp);
      await logGameAndAward({
        type: 'multiTap' as any,
        correct: finalPopped,
        total,
        accuracy: (finalPopped / total) * 100,
        xpAwarded: xp,
        skillTags: ['repetitive-motor', 'coordination', 'finger-precision'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) {
      console.error('Failed to log multi-tap game:', e);
    }
  }, [router]);

  const handlePop = useCallback((id: string) => {
    if (transitioningRef.current || done) return;

    setBalloons((prev) => {
      const target = prev.find((b) => b.id === id);
      if (!target || target.popped) return prev;
      return prev.map((b) => (b.id === id ? { ...b, popped: true } : b));
    });

    playPop();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    roundPoppedRef.current += 1;
    totalPoppedRef.current += 1;
    const newRoundPopped = roundPoppedRef.current;
    const newTotal = totalPoppedRef.current;

    setRoundPopped(newRoundPopped);
    setTotalPopped(newTotal);

    if (newRoundPopped >= BALLOONS_PER_ROUND && !transitioningRef.current) {
      transitioningRef.current = true;
      if (roundRef.current >= TOTAL_ROUNDS) {
        setTimeout(() => endGame(newTotal), 280);
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
    speakTTS('Pop every balloon! Tap them as fast as you can!', 0.78);
    spawnRound(1);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const untappedCount = BALLOONS_PER_ROUND - roundPopped;
  const lastUntappedId = balloons.find((b) => !b.popped)?.id;

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message="Pop Star!"
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
      <LinearGradient colors={['#14532D', '#166534', '#22C55E', '#BBF7D0']} locations={[0, 0.3, 0.65, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backButton} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Pop Party</Text>
        <Text style={styles.subtitle}>{untappedCount} balloon{untappedCount !== 1 ? 's' : ''} left this round</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>Round</Text>
            <Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text>
          </View>
          <View style={[styles.statPill, styles.popPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} />
            <Text style={styles.statValue}>{totalPopped}</Text>
          </View>
        </View>
        <View style={styles.roundDots}>
          {Array.from({ length: BALLOONS_PER_ROUND }).map((_, i) => (
            <View key={i} style={[styles.dot, i < roundPopped && styles.dotDone]} />
          ))}
        </View>
      </View>

      <View style={styles.playArea}>
        <LinearGradient colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)']} style={StyleSheet.absoluteFillObject} />
        <RoundClearFlash visible={showRoundFlash} />
        {balloons.map((b, i) => (
          <MeadowBalloon
            key={`${spawnGen}-${b.id}`}
            data={b}
            size={balloonSize}
            onPop={handlePop}
            enterDelay={i * STAGGER_MS}
            isLastUntapped={b.id === lastUntappedId && untappedCount === 1}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Tap each balloon — pop them all to clear the round!</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#166534' },
  backButton: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '700', marginTop: 4, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  popPill: { backgroundColor: 'rgba(251,191,36,0.22)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  roundDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)' },
  dotDone: { backgroundColor: '#FBBF24', borderColor: '#FDE68A' },
  playArea: { flex: 1, marginHorizontal: 14, marginBottom: 10, borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  balloonWrap: { position: 'absolute' },
  balloonCol: { alignItems: 'center' },
  balloonBody: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8, borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)' },
  balloonShine: { position: 'absolute', top: '14%', left: '20%', width: '32%', height: '22%', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.5)', transform: [{ rotate: '-22deg' }] },
  balloonString: { width: 2, height: 28, marginTop: -2 },
  roundFlash: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)' },
  roundFlashText: { fontSize: 26, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  footer: { paddingHorizontal: 20, paddingBottom: 20, alignItems: 'center' },
  footerText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '600', textAlign: 'center' },
});

export default MultiTapFunGame;
