/**
 * OT Level 1 · Session 8 · Game 3 — Moving Small Target
 * Theme: "Comet Lane" — tap the comet when it crosses the neon gate.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION8_PACING } from '@/components/game/occupational/level1/session8/session8Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { cancelAnimation, runOnJS, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION8_PACING;
const TOTAL_ROUNDS = 10;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR_ICON = require('@/assets/icons/star.png');
const M = P.movingTarget;

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

const MovingSmallTargetGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [zoneCenter, setZoneCenter] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);

  const roundActiveRef = useRef(false);
  const doneRef = useRef(false);
  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const playWidthRef = useRef(0);
  const zoneCenterRef = useRef(0);

  useEffect(() => { roundRef.current = round; }, [round]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  const posX = useSharedValue(-M.size);
  const targetScale = useSharedValue(1);
  const zonePulse = useSharedValue(0.35);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 20;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Comet catcher!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'movingSmallTarget', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['dynamic-accuracy', 'hand-eye-coordination', 'timing'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const isInZone = useCallback((x: number) => {
    const z = zoneCenterRef.current;
    const half = M.zoneWidth / 2 + 18;
    return x + M.size / 2 >= z - half && x - M.size / 2 <= z + half;
  }, []);

  const handleMiss = useCallback(() => {
    if (!roundActiveRef.current || doneRef.current) return;
    roundActiveRef.current = false;
    cancelAnimation(posX);
    playError();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    speakTTS('Missed the gate!', 0.78).catch(() => {});
    setTimeout(() => {
      if (roundRef.current >= TOTAL_ROUNDS) endGame(scoreRef.current);
      else setRound((r) => r + 1);
    }, P.nextRoundDelayMs + 200);
  }, [endGame, playError]);

  const handleHit = useCallback(() => {
    if (!roundActiveRef.current || doneRef.current) return;
    roundActiveRef.current = false;
    cancelAnimation(posX);
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    targetScale.value = withSequence(withTiming(1.5, { duration: 120 }), withTiming(0, { duration: 180 }));
    setScore((prev) => {
      const next = prev + 1;
      setTimeout(() => { if (next >= TOTAL_ROUNDS) endGame(next); else setRound((r) => r + 1); }, P.nextRoundDelayMs);
      return next;
    });
  }, [endGame, playSuccess]);

  const startRound = useCallback((width: number) => {
    if (doneRef.current) return;
    roundActiveRef.current = true;
    targetScale.value = 1;
    const z = width * 0.3 + Math.random() * (width * 0.4);
    zoneCenterRef.current = z;
    setZoneCenter(z);
    zonePulse.value = withRepeat(withSequence(withTiming(0.55, { duration: P.zonePulseMs }), withTiming(0.25, { duration: P.zonePulseMs })), -1, true);
    const startX = -M.size;
    const endX = width + M.size;
    const duration = ((endX - startX) / M.speedPxPerSec) * 1000;
    posX.value = startX;
    posX.value = withTiming(endX, { duration }, (finished) => {
      if (finished) runOnJS(handleMiss)();
    });
  }, [handleMiss]);

  const onPlayLayout = useCallback((e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    playWidthRef.current = width;
    if (!doneRef.current && round === 1 && width > 0) startRound(width);
  }, [round, startRound]);

  useEffect(() => {
    if (doneRef.current || round === 1) return;
    const w = playWidthRef.current;
    if (w > 0) startRound(w);
    return () => cancelAnimation(posX);
  }, [round]);

  useEffect(() => {
    speakTTS('Tap the comet when it crosses the green gate!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); cancelAnimation(posX); };
  }, []);

  const handleTap = useCallback(() => {
    if (!roundActiveRef.current || doneRef.current) return;
    const x = posX.value;
    if (isInZone(x)) handleHit();
    else {
      roundActiveRef.current = false;
      cancelAnimation(posX);
      playError();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      speakTTS('Wait for the gate!', 0.78).catch(() => {});
      targetScale.value = withSequence(withTiming(0.85, { duration: 80 }), withTiming(1, { duration: 80 }));
      setTimeout(() => {
        if (roundRef.current >= TOTAL_ROUNDS) endGame(scoreRef.current);
        else setRound((r) => r + 1);
      }, P.nextRoundDelayMs + 200);
    }
  }, [isInZone, handleHit, endGame, playError]);

  const cometStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: posX.value - (M.size + 40) / 2 }, { translateY: -(M.size + 40) / 2 }, { scale: targetScale.value }],
  }));
  const zoneStyle = useAnimatedStyle(() => ({ opacity: zonePulse.value }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Comet Captain!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#020617', '#0F172A', '#1E3A5F', '#0E7490']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); cancelAnimation(posX); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>☄️ Comet Lane</Text>
        <Text style={styles.subtitle}>Tap when the comet crosses the neon gate</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>

      <Pressable onLayout={onPlayLayout} onPress={handleTap} style={styles.playArea}>
        <Animated.View style={[styles.zone, { left: zoneCenter - M.zoneWidth / 2 }, zoneStyle]}>
          <LinearGradient colors={['rgba(52,211,153,0.5)', 'rgba(16,185,129,0.2)']} style={styles.zoneGrad} />
        </Animated.View>
        <Animated.View style={[styles.cometWrap, { top: '50%' }, cometStyle]}>
          <LinearGradient colors={['#F472B6', '#EF4444', '#FBBF24']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.comet}>
            <View style={styles.cometTail} />
          </LinearGradient>
        </Animated.View>
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#34D399" count={14} size={8} />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  backText: { color: '#E0F2FE', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#E0F2FE' },
  subtitle: { fontSize: 14, color: 'rgba(224,242,254,0.75)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(52,211,153,0.12)', borderColor: 'rgba(52,211,153,0.3)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(52,211,153,0.25)', backgroundColor: 'rgba(0,0,0,0.25)', overflow: 'hidden' },
  zone: { position: 'absolute', top: '20%', width: M.zoneWidth, height: '60%', borderRadius: 14, borderWidth: 3, borderColor: '#34D399', borderStyle: 'dashed', overflow: 'hidden' },
  zoneGrad: { flex: 1 },
  cometWrap: { position: 'absolute', left: 0, width: M.size + 40, height: M.size + 40, justifyContent: 'center', alignItems: 'center' },
  comet: { width: M.size, height: M.size, borderRadius: M.size / 2, justifyContent: 'center', alignItems: 'center', shadowColor: '#F472B6', shadowOpacity: 0.8, shadowRadius: 12, elevation: 10 },
  cometTail: { position: 'absolute', right: M.size * 0.6, width: M.size * 1.2, height: 4, borderRadius: 2, backgroundColor: 'rgba(251,191,36,0.6)' },
});

export default MovingSmallTargetGame;
