/**
 * OT Level 1 · Session 9 · Game 5 — Shrinking Object Movement
 * Theme: "Wander Shrink" — chase the shrinking drifter at its smallest.
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
import { Image, LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { cancelAnimation, Easing, runOnJS, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION9_PACING;
const W = P.moveShrink;
const TOTAL_ROUNDS = 8;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR_ICON = require('@/assets/icons/star.png');

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

const ShrinkingObjectMovementGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [playLayout, setPlayLayout] = useState({ w: 0, h: 0 });

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const startRoundRef = useRef<() => void>(() => {});
  const objSize = useSharedValue(W.initial);
  const objX = useSharedValue(0);
  const objY = useSharedValue(0);
  const objScale = useSharedValue(1);
  const objOpacity = useSharedValue(1);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 18;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Wander shrink complete!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'shrinkingObjectMovement', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['dynamic-tracking', 'size-timing', 'hand-eye-coordination'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const onMiss = useCallback(() => {
    if (!roundActiveRef.current || doneRef.current) return;
    playError();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    speakTTS('Catch it at its smallest!', 0.78).catch(() => {});
    setTimeout(() => startRoundRef.current(), P.retryDelayMs);
  }, [playError]);

  const startRound = useCallback(() => {
    if (doneRef.current || playLayout.w <= 0 || playLayout.h <= 0) return;
    roundActiveRef.current = true;
    cancelAnimation(objSize);
    cancelAnimation(objX);
    cancelAnimation(objY);
    const startX = -W.initial / 2;
    const endX = playLayout.w + W.initial / 2;
    const startY = playLayout.h * (0.25 + Math.random() * 0.5);
    const endY = playLayout.h * (0.25 + Math.random() * 0.5);
    const moveMs = ((endX - startX) / W.speedPxPerSec) * 1000;
    objSize.value = W.initial;
    objOpacity.value = 1;
    objScale.value = 1;
    objX.value = startX;
    objY.value = startY;
    objX.value = withTiming(endX, { duration: moveMs, easing: Easing.linear }, (finished) => {
      if (finished && roundActiveRef.current) runOnJS(onMiss)();
    });
    objY.value = withTiming(endY, { duration: moveMs, easing: Easing.linear });
    objSize.value = withTiming(W.min, { duration: W.shrinkMs, easing: Easing.linear });
  }, [playLayout, onMiss]);

  useEffect(() => { startRoundRef.current = startRound; }, [startRound]);

  useEffect(() => {
    if (doneRef.current || playLayout.w <= 0 || round > 1) return;
    startRound();
  }, [playLayout]);

  useEffect(() => {
    if (doneRef.current || round === 1 || playLayout.w <= 0) return;
    startRound();
    return () => { cancelAnimation(objX); cancelAnimation(objSize); };
  }, [round]);

  useEffect(() => {
    speakTTS('Tap the drifter when it is smallest!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); cancelAnimation(objX); };
  }, []);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPlayLayout({ w: width, h: height });
  }, []);

  const handleTap = useCallback((e: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (!roundActiveRef.current || doneRef.current) return;
    const { locationX, locationY } = e.nativeEvent;
    const dist = Math.hypot(locationX - objX.value, locationY - objY.value);
    const threshold = Math.max(objSize.value / 2 + 50, 65);
    const atSmallest = objSize.value <= W.min + 24;
    if (dist > threshold || !atSmallest) {
      playError();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      speakTTS(atSmallest ? 'Aim for the drifter!' : 'Wait until it is smallest!', 0.78).catch(() => {});
      return;
    }
    roundActiveRef.current = false;
    cancelAnimation(objX);
    cancelAnimation(objSize);
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    objScale.value = withSequence(withTiming(1.45, { duration: 120 }), withTiming(0, { duration: P.successPopMs }));
    objOpacity.value = withTiming(0, { duration: P.successPopMs });
    setScore((prev) => {
      const next = prev + 1;
      setTimeout(() => { if (next >= TOTAL_ROUNDS) endGame(next); else setRound((r) => r + 1); }, P.nextRoundDelayMs);
      return next;
    });
  }, [endGame, playSuccess, playError]);

  const objStyle = useAnimatedStyle(() => ({
    width: objSize.value, height: objSize.value, borderRadius: objSize.value / 2,
    opacity: objOpacity.value,
    transform: [
      { translateX: objX.value - objSize.value / 2 },
      { translateY: objY.value - objSize.value / 2 },
      { scale: objScale.value },
    ],
  }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Drift Catcher!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#431407', '#9A3412', '#EA580C', '#FB923C']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.title}>🔥 Wander Shrink</Text>
        <Text style={styles.subtitle}>Tap the drifter at its tiniest size</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>
      <Pressable onLayout={onLayout} onPress={handleTap} style={styles.playArea}>
        <Animated.View style={[styles.drifter, objStyle]}>
          <LinearGradient colors={['#FDE047', '#F97316', '#DC2626']} style={StyleSheet.absoluteFillObject} />
        </Animated.View>
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#FDE047" count={14} size={8} />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  backText: { color: '#FFEDD5', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#FFEDD5' },
  subtitle: { fontSize: 14, color: 'rgba(255,237,213,0.85)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(253,224,71,0.15)', borderColor: 'rgba(253,224,71,0.35)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(253,224,71,0.25)', backgroundColor: 'rgba(0,0,0,0.12)', overflow: 'hidden' },
  drifter: { position: 'absolute', left: 0, top: 0, overflow: 'hidden' },
});

export default ShrinkingObjectMovementGame;
