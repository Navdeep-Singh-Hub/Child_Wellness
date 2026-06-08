/**
 * OT Level 1 · Session 4 · Game 2 — Grow The Balloon
 * Theme: "Candy Cloud Pop" — inflate a balloon and release to let it soar.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION4_PACING } from '@/components/game/occupational/level1/session4/session4Pacing';
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
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION4_PACING.growBalloon;
const TOTAL_ROUNDS = 8;
const FLOAT_SOUND = 'https://actions.google.com/sounds/v1/cartoon/pop.ogg';
const STAR_ICON = require('@/assets/icons/star.png');

const BALLOON_COLORS = [
  ['#F472B6', '#EC4899'] as [string, string],
  ['#60A5FA', '#3B82F6'] as [string, string],
  ['#A78BFA', '#8B5CF6'] as [string, string],
  ['#34D399', '#10B981'] as [string, string],
  ['#FBBF24', '#F59E0B'] as [string, string],
  ['#FB7185', '#F43F5E'] as [string, string],
  ['#38BDF8', '#0EA5E9'] as [string, string],
  ['#C084FC', '#A855F7'] as [string, string],
];

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

const GrowTheBalloonGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playFloat = useSound(FLOAT_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'inflating' | 'floating' | 'transition'>('idle');
  const [inflatePct, setInflatePct] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);

  const holdingRef = useRef(false);
  const progressRef = useRef(0);
  const doneRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const balloonScale = useSharedValue(0.35);
  const balloonY = useSharedValue(0);
  const balloonOpacity = useSharedValue(1);
  const wobble = useSharedValue(0);

  const colors = BALLOON_COLORS[(round - 1) % BALLOON_COLORS.length];

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 18;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Amazing balloons! They all floated away!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({
        type: 'growTheBalloon',
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: xp,
        skillTags: ['visual-motor-mapping', 'finger-endurance', 'graded-force-control'],
      }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const resetBalloon = useCallback(() => {
    balloonScale.value = 0.35;
    balloonY.value = 0;
    balloonOpacity.value = 1;
    wobble.value = 0;
    progressRef.current = 0;
    setInflatePct(0);
    setPhase('idle');
  }, []);

  const onPressIn = useCallback(() => {
    if (doneRef.current || phase === 'floating' || phase === 'transition' || holdingRef.current) return;
    holdingRef.current = true;
    setPhase('inflating');
    progressRef.current = 0;
    setInflatePct(0);
    balloonScale.value = 0.35;
    wobble.value = withSequence(withTiming(3, { duration: 200 }), withTiming(-3, { duration: 200 }));

    tickRef.current = setInterval(() => {
      if (!holdingRef.current) return;
      progressRef.current = Math.min(1, progressRef.current + 50 / P.inflateDurationMs);
      setInflatePct(Math.round(progressRef.current * 100));
      balloonScale.value = 0.35 + progressRef.current * 0.75;
    }, 50);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [phase]);

  const onPressOut = useCallback(() => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    if (tickRef.current) clearInterval(tickRef.current);

    const p = progressRef.current;
    if (p >= P.minSizeForReward) {
      setPhase('floating');
      setSparkleKey(Date.now());
      playFloat();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

      balloonY.value = withTiming(-280, { duration: P.floatDurationMs, easing: Easing.out(Easing.quad) });
      balloonOpacity.value = withTiming(0, { duration: P.floatDurationMs, easing: Easing.in(Easing.quad) });
      balloonScale.value = withTiming(balloonScale.value + 0.1, { duration: 200 });

      setScore((prev) => {
        const next = prev + 1;
        setPhase('transition');
        setTimeout(() => {
          if (next >= TOTAL_ROUNDS) {
            endGame(next);
          } else {
            setRound((r) => r + 1);
            resetBalloon();
          }
        }, P.floatDurationMs + P.nextRoundDelayMs);
        return next;
      });
    } else {
      balloonScale.value = withSpring(0.35, { damping: 12 });
      setInflatePct(0);
      progressRef.current = 0;
      setPhase('idle');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
      speakTTS('Hold longer for a bigger balloon!', 0.78).catch(() => {});
    }
  }, [endGame, resetBalloon, playFloat]);

  useEffect(() => {
    speakTTS('Press and hold to inflate. Release when it\'s big to make it float!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  const balloonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: balloonScale.value }, { translateY: balloonY.value }, { rotate: `${wobble.value}deg` }],
    opacity: balloonOpacity.value,
  }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Cloud Pop Star!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FDF2F8', '#FCE7F3', '#E0F2FE', '#BAE6FD']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🎈 Candy Cloud Pop</Text>
        <Text style={styles.subtitle}>Inflate · release to float away</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabelDark}>Round</Text><Text style={styles.statValueDark}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValueDark}>{score}</Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.playArea} onPressIn={onPressIn} onPressOut={onPressOut} disabled={phase === 'floating' || phase === 'transition'}>
        {/* Cloud decorations */}
        <View style={[styles.cloud, styles.cloud1]} />
        <View style={[styles.cloud, styles.cloud2]} />

        <Animated.View style={[styles.balloonWrap, balloonStyle]}>
          <LinearGradient colors={colors} style={styles.balloon}>
            <View style={styles.balloonShine} />
          </LinearGradient>
          <View style={styles.string} />
          <View style={styles.knot} />
        </Animated.View>

        {phase === 'inflating' && (
          <View style={styles.pctPill}>
            <Text style={styles.pctText}>{inflatePct}%</Text>
          </View>
        )}

        {phase === 'idle' && (
          <View style={styles.hintPill}><Text style={styles.hintText}>Press & hold to inflate 💨</Text></View>
        )}

        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={colors[0]} count={14} size={8} />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(236,72,153,0.25)' },
  backText: { color: '#831843', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#831843' },
  subtitle: { fontSize: 14, color: '#9D174D', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(236,72,153,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabelDark: { fontSize: 11, color: '#9D174D', fontWeight: '700', textTransform: 'uppercase' },
  statValueDark: { fontSize: 20, fontWeight: '900', color: '#831843' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cloud: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 40 },
  cloud1: { width: 120, height: 50, top: '18%', left: '8%' },
  cloud2: { width: 90, height: 38, top: '28%', right: '10%' },
  balloonWrap: { alignItems: 'center' },
  balloon: { width: 110, height: 130, borderRadius: 55, overflow: 'hidden', shadowColor: '#EC4899', shadowOpacity: 0.35, shadowRadius: 16, elevation: 10 },
  balloonShine: { position: 'absolute', top: 18, left: 22, width: 36, height: 50, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.45)' },
  string: { width: 2, height: 70, backgroundColor: '#64748B', marginTop: -4 },
  knot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#94A3B8', marginTop: -2 },
  pctPill: { position: 'absolute', bottom: '22%', backgroundColor: 'rgba(131,24,67,0.85)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  pctText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  hintPill: { position: 'absolute', bottom: '18%', backgroundColor: 'rgba(236,72,153,0.9)', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 22 },
  hintText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

export default GrowTheBalloonGame;
