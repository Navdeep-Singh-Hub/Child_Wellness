/**
 * OT Level 1 · Session 9 · Game 4 — Multiple Shrinking Targets
 * Theme: "Tri-Glow Pick" — tap the orb that stops glowing.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION9_PACING } from '@/components/game/occupational/level1/session9/session9Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { cancelAnimation, Easing, runOnJS, SharedValue, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION9_PACING;
const M = P.multiTarget;
const TOTAL_ROUNDS = 8;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR_ICON = require('@/assets/icons/star.png');
const COLORS: [string, string][] = [['#F472B6', '#DB2777'], ['#60A5FA', '#2563EB'], ['#FBBF24', '#D97706']];

type TargetData = { id: string; x: number; y: number; size: SharedValue<number>; glow: SharedValue<number>; scale: SharedValue<number>; isCorrect: boolean };

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

function TargetOrb({ target, colorIdx, onPress, disabled }: { target: TargetData; colorIdx: number; onPress: () => void; disabled: boolean }) {
  const bodyStyle = useAnimatedStyle(() => ({
    width: target.size.value, height: target.size.value, borderRadius: target.size.value / 2,
    transform: [{ scale: target.scale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: target.glow.value,
    transform: [{ scale: 1 + target.glow.value * 0.25 }],
  }));
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.orbPos, { left: `${target.x}%`, top: `${target.y}%` }]}>
      <Animated.View style={[styles.glowRing, glowStyle]} />
      <Animated.View style={bodyStyle}>
        <LinearGradient colors={COLORS[colorIdx]} style={[StyleSheet.absoluteFillObject, { borderRadius: 999 }]} />
      </Animated.View>
    </Pressable>
  );
}

const MultipleShrinkingTargetsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [targets, setTargets] = useState<TargetData[]>([]);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [roundActive, setRoundActive] = useState(true);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const correctIdRef = useRef('');
  const t1s = useSharedValue(M.initial); const t1g = useSharedValue(1); const t1sc = useSharedValue(1);
  const t2s = useSharedValue(M.initial); const t2g = useSharedValue(1); const t2sc = useSharedValue(1);
  const t3s = useSharedValue(M.initial); const t3g = useSharedValue(1); const t3sc = useSharedValue(1);
  const sharedSets = [[t1s, t1g, t1sc], [t2s, t2g, t2sc], [t3s, t3g, t3sc]] as const;
  const durations = [M.fastMs, M.mediumMs, M.slowMs];

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 18;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Tri-glow master!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'multipleShrinkingTargets', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['selective-attention', 'visual-discrimination', 'timing-control'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const startRound = useCallback(() => {
    if (doneRef.current) return;
    roundActiveRef.current = true;
    setRoundActive(true);
    const margin = 16;
    const positions: { x: number; y: number }[] = [];
    for (let i = 0; i < 3; i++) {
      for (let a = 0; a < 40; a++) {
        const x = margin + Math.random() * (100 - margin * 2);
        const y = margin + Math.random() * (100 - margin * 2);
        if (positions.every((p) => Math.hypot(p.x - x, p.y - y) >= 22)) { positions.push({ x, y }); break; }
      }
      if (positions.length <= i) positions.push({ x: 25 + i * 22, y: 35 + Math.random() * 30 });
    }
    const correctIdx = Math.floor(Math.random() * 3);
    const newTargets: TargetData[] = positions.map((p, i) => {
      const [size, glow, scale] = sharedSets[i];
      cancelAnimation(size);
      size.value = M.initial;
      glow.value = 1;
      scale.value = 1;
      glow.value = withRepeat(withSequence(withTiming(1.6, { duration: 450 }), withTiming(0.9, { duration: 450 })), -1, true);
      const isCorrect = i === correctIdx;
      size.value = withTiming(M.min, { duration: durations[i], easing: Easing.linear }, (finished) => {
        if (finished && isCorrect && roundActiveRef.current) {
          runOnJS(() => {
            setTimeout(() => { glow.value = withTiming(0, { duration: 280 }); }, M.glowStopMs);
          })();
        }
      });
      return { id: `${round}-${i}`, x: p.x, y: p.y, size, glow, scale, isCorrect };
    });
    correctIdRef.current = newTargets[correctIdx].id;
    setTargets(newTargets);
  }, [round]);

  useEffect(() => {
    if (doneRef.current) return;
    startRound();
  }, [round]);

  useEffect(() => {
    speakTTS('Tap the orb that stops glowing!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const handleTap = useCallback((id: string, target: TargetData) => {
    if (!roundActiveRef.current || doneRef.current) return;
    if (id !== correctIdRef.current) {
      playError();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      speakTTS('Tap the one that stops glowing!', 0.78).catch(() => {});
      setTimeout(() => startRound(), P.retryDelayMs);
      return;
    }
    roundActiveRef.current = false;
    setRoundActive(false);
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    target.scale.value = withSequence(withTiming(1.45, { duration: 120 }), withTiming(0, { duration: P.successPopMs }));
    setScore((prev) => {
      const next = prev + 1;
      setTimeout(() => { if (next >= TOTAL_ROUNDS) endGame(next); else setRound((r) => r + 1); }, P.nextRoundDelayMs);
      return next;
    });
  }, [endGame, startRound, playSuccess, playError]);

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Glow Hunter!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E3A5F', '#1D4ED8', '#3B82F6']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.title}>💫 Tri-Glow Pick</Text>
        <Text style={styles.subtitle}>Find the orb that stops glowing</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>
      <View style={styles.playArea}>
        {targets.map((t, i) => (
          <TargetOrb key={t.id} target={t} colorIdx={i} onPress={() => handleTap(t.id, t)} disabled={!roundActive} />
        ))}
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#93C5FD" count={14} size={8} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  backText: { color: '#DBEAFE', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#DBEAFE' },
  subtitle: { fontSize: 14, color: 'rgba(219,234,254,0.8)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(147,197,253,0.12)', borderColor: 'rgba(147,197,253,0.3)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(147,197,253,0.25)', backgroundColor: 'rgba(0,0,0,0.15)' },
  orbPos: { position: 'absolute', marginLeft: -M.initial / 2, marginTop: -M.initial / 2, justifyContent: 'center', alignItems: 'center' },
  glowRing: { position: 'absolute', width: M.initial + 30, height: M.initial + 30, borderRadius: (M.initial + 30) / 2, backgroundColor: 'rgba(255,255,255,0.35)' },
});

export default MultipleShrinkingTargetsGame;
