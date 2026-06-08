/**
 * OT Level 1 · Session 3 · Game 4 — Race The Dot
 * Theme: "Turbo Track" — tap to push the racer toward the finish line.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION3_PACING } from '@/components/game/occupational/level1/session3/session3Pacing';
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
const GOAL_SOUND = 'https://actions.google.com/sounds/v1/cartoon/pop.ogg';
const P = SESSION3_PACING.raceDot;
const TOTAL_ROUNDS = 10;
const STAR_ICON = require('@/assets/icons/star.png');

const useSound = (uri: string) => {
  const ref = useRef<ExpoAudio.Sound | null>(null);
  useEffect(() => () => { ref.current?.unloadAsync().catch(() => {}); }, []);
  return useCallback(() => {
    if (Platform.OS === 'web') return;
    (async () => {
      try {
        if (!ref.current) {
          const { sound } = await ExpoAudio.Sound.createAsync({ uri }, { volume: 0.48 });
          ref.current = sound;
        }
        ref.current.replayAsync().catch(() => {});
      } catch { /* noop */ }
    })();
  }, [uri]);
};

const RaceTheDotGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playTap = useSound(SUCCESS_SOUND);
  const playGoal = useSound(GOAL_SOUND);

  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const positionRef = useRef(0);
  const activeRef = useRef(true);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);

  const dotX = useSharedValue(15);
  const pathProgress = useSharedValue(0);
  const dotScale = useSharedValue(1);
  const dotOpacity = useSharedValue(1);
  const goalPulse = useSharedValue(1);
  const turboFlash = useSharedValue(0);

  const isFastMode = round > P.slowRounds;

  const endGame = useCallback(async (finalScore: number) => {
    const stats = { correct: finalScore, total: TOTAL_ROUNDS, xp: finalScore * 15 };
    setFinalStats(stats);
    setDone(true);
    setShowCongratulations(true);
    speakTTS('Race complete! Turbo champion!', 0.78);
    try {
      await recordGame(stats.xp);
      await logGameAndAward({
        type: 'raceTheDot',
        correct: finalScore,
        total: TOTAL_ROUNDS,
        accuracy: (finalScore / TOTAL_ROUNDS) * 100,
        xpAwarded: stats.xp,
        skillTags: ['visual-tracking', 'speed-modulation', 'motor-planning', 'timing'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) {
      console.error('Failed to log race the dot game:', e);
    }
  }, [router]);

  const startRound = useCallback(() => {
    activeRef.current = true;
    positionRef.current = 0;
    setProgress(0);
    dotOpacity.value = 1;
    dotScale.value = 1;
    pathProgress.value = 0;
    dotX.value = 15;
    goalPulse.value = withRepeat(
      withSequence(withTiming(1.12, { duration: 500 }), withTiming(1, { duration: 500 })),
      -1,
      true,
    );
    if (roundRef.current > P.slowRounds) {
      turboFlash.value = withSequence(withTiming(1, { duration: 150 }), withTiming(0.3, { duration: 400 }));
    }
  }, []);

  const onGoalReached = useCallback(() => {
    const nextScore = scoreRef.current + 1;
    scoreRef.current = nextScore;
    setScore(nextScore);
    setSparkleKey(Date.now());

    if (roundRef.current >= TOTAL_ROUNDS) {
      endGame(nextScore);
    } else {
      roundRef.current += 1;
      setRound(roundRef.current);
      if (roundRef.current === P.slowRounds + 1) {
        speakTTS('Turbo mode! Tap faster!', 0.78).catch(() => {});
      }
      setTimeout(startRound, P.nextRoundDelayMs);
    }
  }, [endGame, startRound]);

  const handleTap = useCallback(() => {
    if (!activeRef.current || done) return;

    const speed = isFastMode ? P.fastSpeedPerTap : P.slowSpeedPerTap;
    const newPos = Math.min(positionRef.current + speed, P.goalDistance);
    positionRef.current = newPos;
    const pct = newPos / P.goalDistance;
    setProgress(Math.round(pct * 100));

    pathProgress.value = withTiming(pct, { duration: 90, easing: Easing.out(Easing.quad) });
    dotX.value = withTiming(15 + pct * 65, { duration: 90, easing: Easing.out(Easing.quad) });
    dotScale.value = withSequence(withSpring(1.25, { damping: 6 }), withSpring(1, { damping: 10 }));

    if (newPos >= P.goalDistance) {
      activeRef.current = false;
      playGoal();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      dotScale.value = withSequence(
        withTiming(1.5, { duration: 150 }),
        withTiming(0, { duration: 220, easing: Easing.in(Easing.back(1.5)) }, (f) => { if (f) runOnJS(onGoalReached)(); }),
      );
      dotOpacity.value = withTiming(0, { duration: 220 });
    } else {
      playTap();
      Haptics.impactAsync(isFastMode ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [done, isFastMode, onGoalReached, playTap, playGoal]);

  useEffect(() => {
    speakTTS('Tap to race the dot to the finish line!', 0.78);
    startRound();
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    left: `${dotX.value}%`,
    transform: [{ translateY: -18 }, { scale: dotScale.value }],
    opacity: dotOpacity.value,
  }));

  const pathFillStyle = useAnimatedStyle(() => ({ width: `${pathProgress.value * 100}%` }));
  const goalStyle = useAnimatedStyle(() => ({ transform: [{ scale: goalPulse.value }] }));
  const turboStyle = useAnimatedStyle(() => ({ opacity: turboFlash.value }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Turbo Champion!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={isFastMode ? ['#450A0A', '#7F1D1D', '#B91C1C'] : ['#0C4A6E', '#0369A1', '#0284C7']}
        style={StyleSheet.absoluteFillObject}
      />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{isFastMode ? '🏎️ Turbo Track' : '🏁 Race Track'}</Text>
        <Text style={styles.subtitle}>
          {isFastMode ? 'Tap fast to boost!' : 'Tap steadily to advance'} · Round {round}/{TOTAL_ROUNDS}
        </Text>
        <View style={styles.statsRow}>
          <View style={[styles.statPill, isFastMode && styles.turboPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} />
            <Text style={styles.statValue}>{score}</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>Progress</Text>
            <Text style={styles.statValue}>{progress}%</Text>
          </View>
        </View>
        {isFastMode && (
          <Animated.View style={[styles.turboBadge, turboStyle]}>
            <Text style={styles.turboText}>TURBO MODE</Text>
          </Animated.View>
        )}
      </View>

      <Pressable style={styles.playArea} onPress={handleTap}>
        <LinearGradient colors={['rgba(255,255,255,0.06)', 'rgba(0,0,0,0.15)']} style={StyleSheet.absoluteFillObject} />

        <View style={styles.track}>
          <View style={styles.trackBg} />
          <Animated.View style={[styles.trackFill, { backgroundColor: isFastMode ? '#F59E0B' : '#38BDF8' }, pathFillStyle]} />
          <View style={styles.trackDashRow}>
            {Array.from({ length: 8 }).map((_, i) => (
              <View key={i} style={styles.trackDash} />
            ))}
          </View>
        </View>

        <Animated.View style={[styles.goalWrap, goalStyle]}>
          <View style={styles.goal}>
            <Text style={styles.goalEmoji}>🏁</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.racer, dotStyle]}>
          <LinearGradient
            colors={isFastMode ? ['#FDE68A', '#F59E0B'] : ['#BAE6FD', '#0EA5E9']}
            style={styles.racerBody}
          >
            <Text style={styles.racerEmoji}>{isFastMode ? '🏎️' : '🔵'}</Text>
          </LinearGradient>
        </Animated.View>

        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={isFastMode ? '#F59E0B' : '#38BDF8'} count={14} size={8} />
      </Pressable>

      <Text style={styles.footer}>Keep tapping — reach the finish flag!</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '900', color: '#fff' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginTop: 4, marginBottom: 10 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  turboPill: { backgroundColor: 'rgba(245,158,11,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700' },
  statValue: { fontSize: 18, fontWeight: '900', color: '#fff' },
  starIcon: { width: 16, height: 16, resizeMode: 'contain' },
  turboBadge: { marginTop: 8, backgroundColor: 'rgba(245,158,11,0.35)', paddingHorizontal: 16, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: '#FDE68A' },
  turboText: { fontSize: 12, fontWeight: '900', color: '#FDE68A', letterSpacing: 2 },
  playArea: { flex: 1, marginHorizontal: 14, marginBottom: 10, borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', justifyContent: 'center' },
  track: { position: 'absolute', left: '8%', right: '8%', top: '52%', height: 14, justifyContent: 'center' },
  trackBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 8 },
  trackFill: { height: '100%', borderRadius: 8 },
  trackDashRow: { position: 'absolute', flexDirection: 'row', justifyContent: 'space-around', width: '100%', top: 3 },
  trackDash: { width: 14, height: 3, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 2 },
  goalWrap: { position: 'absolute', right: '6%', top: '46%' },
  goal: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
  goalEmoji: { fontSize: 28 },
  racer: { position: 'absolute', top: '50%' },
  racerBody: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  racerEmoji: { fontSize: 18 },
  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600', paddingBottom: 18 },
});

export default RaceTheDotGame;
