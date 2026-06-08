/**
 * OT Level 1 · Session 9 · Game 2 — Shrink → Stop → Tap
 * Theme: "Freeze Frame" — wait for the stop, then tap.
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
import Animated, { cancelAnimation, Easing, runOnJS, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION9_PACING;
const S = P.shrinkStop;
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

const ShrinkStopTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [sparkleKey, setSparkleKey] = useState(0);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const shrinkingRef = useRef(true);
  const stoppedRef = useRef(false);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRoundRef = useRef<() => void>(() => {});
  const objSize = useSharedValue(S.initial);
  const objScale = useSharedValue(1);
  const objOpacity = useSharedValue(1);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 18;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Freeze frame champion!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'shrinkStopTap', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['inhibitory-control', 'timing-precision', 'visual-monitoring'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const onMiss = useCallback((msg: string) => {
    if (!roundActiveRef.current || doneRef.current) return;
    playError();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    speakTTS(msg, 0.78).catch(() => {});
    objScale.value = withSequence(withTiming(0.9, { duration: 80 }), withTiming(1, { duration: 80 }));
    setTimeout(() => startRoundRef.current(), P.retryDelayMs);
  }, [playError]);

  const startRound = useCallback(() => {
    if (doneRef.current) return;
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    roundActiveRef.current = true;
    shrinkingRef.current = true;
    stoppedRef.current = false;
    cancelAnimation(objSize);
    const margin = 22;
    setPos({ x: margin + Math.random() * (100 - margin * 2), y: margin + Math.random() * (100 - margin * 2) });
    objSize.value = S.initial;
    objOpacity.value = 1;
    objScale.value = 1;
    objSize.value = withTiming(S.min, { duration: S.shrinkMs, easing: Easing.linear }, (finished) => {
      if (finished && roundActiveRef.current) {
        runOnJS(() => {
          shrinkingRef.current = false;
          stoppedRef.current = true;
          stopTimerRef.current = setTimeout(() => {
            if (roundActiveRef.current && stoppedRef.current) onMiss('Too slow! Tap when it freezes!');
          }, S.stopMs);
        })();
      }
    });
  }, [onMiss]);

  useEffect(() => { startRoundRef.current = startRound; }, [startRound]);

  useEffect(() => {
    if (doneRef.current) return;
    startRound();
    return () => { if (stopTimerRef.current) clearTimeout(stopTimerRef.current); cancelAnimation(objSize); };
  }, [round]);

  useEffect(() => {
    speakTTS('Wait for it to freeze, then tap!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const handleTap = useCallback(() => {
    if (!roundActiveRef.current || doneRef.current) return;
    if (shrinkingRef.current) { onMiss('Wait until it stops shrinking!'); return; }
    if (!stoppedRef.current) return;
    roundActiveRef.current = false;
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    objScale.value = withSequence(withTiming(1.4, { duration: 120 }), withTiming(0, { duration: P.successPopMs }));
    objOpacity.value = withTiming(0, { duration: P.successPopMs });
    setScore((prev) => {
      const next = prev + 1;
      setTimeout(() => { if (next >= TOTAL_ROUNDS) endGame(next); else setRound((r) => r + 1); }, P.nextRoundDelayMs);
      return next;
    });
  }, [endGame, onMiss, playSuccess]);

  const objStyle = useAnimatedStyle(() => ({
    width: objSize.value, height: objSize.value, borderRadius: objSize.value / 2,
    opacity: objOpacity.value, transform: [{ scale: objScale.value }],
  }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Freeze Pro!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#042F2E', '#0F766E', '#14B8A6', '#5EEAD4']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.title}>🧊 Freeze Frame</Text>
        <Text style={styles.subtitle}>Shrink → stop → tap!</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>
      <View style={styles.playArea}>
        <Animated.View style={[styles.orbWrap, { left: `${pos.x}%`, top: `${pos.y}%` }]}>
          <Pressable onPress={handleTap} style={styles.orbHit}>
            <Animated.View style={[objStyle, { overflow: 'hidden' }]}>
              <LinearGradient colors={['#67E8F9', '#06B6D4', '#0891B2']} style={StyleSheet.absoluteFillObject} />
            </Animated.View>
          </Pressable>
        </Animated.View>
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#67E8F9" count={14} size={8} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  backText: { color: '#CCFBF1', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#CCFBF1' },
  subtitle: { fontSize: 14, color: 'rgba(204,251,241,0.8)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(103,232,249,0.15)', borderColor: 'rgba(103,232,249,0.35)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1 },
  orbWrap: { position: 'absolute', marginLeft: -S.initial / 2 - 20, marginTop: -S.initial / 2 - 20 },
  orbHit: { padding: 20, justifyContent: 'center', alignItems: 'center' },
});

export default ShrinkStopTapGame;
