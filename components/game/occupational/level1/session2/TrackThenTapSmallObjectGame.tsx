/**
 * OT Level 1 · Session 2 · Game 4 — Track Then Tap
 * Theme: "Firefly Catcher" — follow the firefly, tap when it lands.
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
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const MISS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const TOTAL_ROUNDS = 8;
const OBJECT_SIZE = 52;
const MOVE_DURATION_MS = 2800;
const STOP_WINDOW_MS = 2200;
const ROUND_HANDOFF_MS = 360;
const STAR_ICON = require('@/assets/icons/star.png');

type Critter = 'firefly' | 'star' | 'bee';
const CRITTER = {
  firefly: { emoji: '✨', color: '#A3E635', label: 'firefly' },
  star: { emoji: '⭐', color: '#FBBF24', label: 'star' },
  bee: { emoji: '🐝', color: '#FCD34D', label: 'bee' },
};

const useSound = (uri: string) => {
  const ref = useRef<ExpoAudio.Sound | null>(null);
  useEffect(() => () => { ref.current?.unloadAsync().catch(() => {}); }, []);
  return useCallback(() => {
    if (Platform.OS === 'web') return;
    (async () => {
      try {
        if (!ref.current) {
          const { sound } = await ExpoAudio.Sound.createAsync({ uri }, { volume: 0.45 });
          ref.current = sound;
        }
        ref.current.replayAsync().catch(() => {});
      } catch { /* noop */ }
    })();
  }, [uri]);
};

const TrackThenTapSmallObjectGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playMiss = useSound(MISS_SOUND);

  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const phaseRef = useRef<'moving' | 'stopped' | 'done'>('moving');
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [phase, setPhase] = useState<'moving' | 'stopped' | 'missed'>('moving');
  const [critter, setCritter] = useState<Critter>('firefly');
  const [sparkleKey, setSparkleKey] = useState(0);

  const x = useSharedValue(50);
  const y = useSharedValue(50);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const landPulse = useSharedValue(1);
  const trailOpacity = useSharedValue(0.3);

  const clearStopTimer = () => {
    if (stopTimerRef.current) { clearTimeout(stopTimerRef.current); stopTimerRef.current = null; }
  };

  const endGame = useCallback(async (finalScore: number) => {
    const stats = { correct: finalScore, total: TOTAL_ROUNDS, xp: finalScore * 14 };
    setFinalStats(stats);
    setDone(true);
    setShowCongratulations(true);
    speakTTS('Firefly master! Amazing tracking!', 0.78);
    try {
      await recordGame(stats.xp);
      await logGameAndAward({
        type: 'trackThenTap',
        correct: finalScore,
        total: TOTAL_ROUNDS,
        accuracy: (finalScore / TOTAL_ROUNDS) * 100,
        xpAwarded: stats.xp,
        skillTags: ['visual-tracking', 'fine-motor-coordination', 'timing-precision', 'aac-targeting'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) {
      console.error('Failed to log track then tap game:', e);
    }
  }, [router]);

  const advanceRound = useCallback((newScore: number) => {
    if (roundRef.current >= TOTAL_ROUNDS) {
      endGame(newScore);
    } else {
      roundRef.current += 1;
      setRound(roundRef.current);
      setTimeout(() => startRoundRef.current(), ROUND_HANDOFF_MS);
    }
  }, [endGame]);

  const onStopped = useCallback(() => {
    phaseRef.current = 'stopped';
    setPhase('stopped');
    landPulse.value = withRepeat(
      withSequence(withTiming(1.15, { duration: 350 }), withTiming(1, { duration: 350 })),
      -1,
      true,
    );
    clearStopTimer();
    stopTimerRef.current = setTimeout(() => {
      if (phaseRef.current !== 'stopped') return;
      phaseRef.current = 'done';
      setPhase('missed');
      playMiss();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      opacity.value = withTiming(0.4, { duration: 300 });
      setTimeout(() => advanceRound(scoreRef.current), ROUND_HANDOFF_MS);
    }, STOP_WINDOW_MS);
  }, [advanceRound, playMiss]);

  const startRound = useCallback(() => {
    clearStopTimer();
    phaseRef.current = 'moving';
    setPhase('moving');
    opacity.value = 1;
    scale.value = 1;
    landPulse.value = 1;

    const types: Critter[] = ['firefly', 'star', 'bee'];
    setCritter(types[Math.floor(Math.random() * types.length)]);

    const margin = 18;
    const sx = margin + Math.random() * (100 - margin * 2);
    const sy = margin + Math.random() * (100 - margin * 2);
    let ex = margin + Math.random() * (100 - margin * 2);
    let ey = margin + Math.random() * (100 - margin * 2);
    if (Math.hypot(ex - sx, ey - sy) < 30) { ex = 100 - sx; ey = 100 - sy; }

    x.value = sx;
    y.value = sy;
    trailOpacity.value = 0.4;

    x.value = withTiming(ex, { duration: MOVE_DURATION_MS, easing: Easing.inOut(Easing.sin) }, (f) => { if (f) runOnJS(onStopped)(); });
    y.value = withTiming(ey, { duration: MOVE_DURATION_MS, easing: Easing.inOut(Easing.sin) });
  }, [onStopped]);

  const startRoundRef = useRef(startRound);
  startRoundRef.current = startRound;

  const handleTap = useCallback(() => {
    if (phaseRef.current !== 'stopped') return;
    clearStopTimer();
    phaseRef.current = 'done';
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSparkleKey(Date.now());
    scale.value = withSequence(withTiming(1.4, { duration: 80 }), withTiming(0, { duration: 150 }));
    opacity.value = withTiming(0, { duration: 150 });

    const newScore = scoreRef.current + 1;
    scoreRef.current = newScore;
    setScore(newScore);
    setTimeout(() => advanceRound(newScore), 200);
  }, [advanceRound, playSuccess]);

  useEffect(() => {
    speakTTS('Follow the firefly with your eyes. Tap it when it stops!', 0.78);
    startRound();
    return () => { clearStopTimer(); stopAllSpeech(); cleanupSounds(); };
  }, []);

  const objectStyle = useAnimatedStyle(() => ({
    left: `${x.value}%` as any,
    top: `${y.value}%` as any,
    transform: [
      { translateX: -OBJECT_SIZE / 2 },
      { translateY: -OBJECT_SIZE / 2 },
      { scale: scale.value * landPulse.value },
    ],
    opacity: opacity.value,
  }));

  const info = CRITTER[critter];

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message="Firefly Catcher!"
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
      <LinearGradient colors={['#0C1445', '#1E1B4B', '#312E81', '#1E3A5F']} locations={[0, 0.4, 0.75, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Firefly Catcher</Text>
        <Text style={styles.subtitle}>
          {phase === 'moving' ? `Follow the ${info.label}…` : phase === 'stopped' ? 'Tap now!' : 'Try again next round'}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.playArea} onPress={handleTap}>
        <LinearGradient colors={['rgba(255,255,255,0.04)', 'rgba(163,230,53,0.06)']} style={StyleSheet.absoluteFillObject} />

        {phase === 'stopped' && (
          <View pointerEvents="none" style={styles.tapNowBanner}>
            <Text style={styles.tapNowText}>Tap now! 👆</Text>
          </View>
        )}

        <Animated.View pointerEvents="none" style={[styles.critterWrap, objectStyle]}>
          <View style={[styles.critterGlow, { backgroundColor: info.color }]} />
          <View style={[styles.critter, { backgroundColor: info.color }]}>
            <Text style={styles.critterEmoji}>{info.emoji}</Text>
          </View>
        </Animated.View>

        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={info.color} count={14} size={7} />
      </Pressable>

      <Text style={styles.footer}>Watch it move · tap the instant it stops</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0C1445' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '900', color: '#A3E635' },
  subtitle: { fontSize: 14, color: 'rgba(190,242,100,0.85)', fontWeight: '600', marginTop: 4, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.3)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '900', color: '#fff' },
  starIcon: { width: 16, height: 16, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 14, marginBottom: 10, borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(163,230,53,0.3)' },
  tapNowBanner: { position: 'absolute', top: 16, alignSelf: 'center', backgroundColor: 'rgba(34,197,94,0.9)', paddingHorizontal: 22, paddingVertical: 10, borderRadius: 999, zIndex: 5 },
  tapNowText: { color: '#fff', fontSize: 17, fontWeight: '900' },
  critterWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  critterGlow: { position: 'absolute', width: OBJECT_SIZE + 28, height: OBJECT_SIZE + 28, borderRadius: (OBJECT_SIZE + 28) / 2, opacity: 0.45 },
  critter: { width: OBJECT_SIZE, height: OBJECT_SIZE, borderRadius: OBJECT_SIZE / 2, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  critterEmoji: { fontSize: 26 },
  footer: { textAlign: 'center', color: 'rgba(190,242,100,0.7)', fontSize: 13, fontWeight: '600', paddingBottom: 18 },
});

export default TrackThenTapSmallObjectGame;
