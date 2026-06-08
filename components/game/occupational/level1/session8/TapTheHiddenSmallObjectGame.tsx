/**
 * OT Level 1 · Session 8 · Game 5 — Tap The Hidden Small Object
 * Theme: "Camo Scanner" — scan the pattern and find the hidden speck.
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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION8_PACING;
const TOTAL_ROUNDS = 10;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR_ICON = require('@/assets/icons/star.png');
const H = P.hiddenObject;

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

function buildPatternDots(): { x: number; y: number }[] {
  const dots: { x: number; y: number }[] = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 8; col++) {
      dots.push({
        x: 6 + col * 12 + (Math.random() * 2 - 1),
        y: 6 + row * 10 + (Math.random() * 2 - 1),
      });
    }
  }
  return dots;
}

const TapTheHiddenSmallObjectGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [objPos, setObjPos] = useState<{ x: number; y: number } | null>(null);
  const [sparkleKey, setSparkleKey] = useState(0);

  const patternDots = useMemo(() => buildPatternDots(), []);
  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const objScale = useSharedValue(1);
  const objOpacity = useSharedValue(0.22);
  const hintPulse = useSharedValue(1);
  const hintMode = useSharedValue(0);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 20;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Camo scanner complete!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'tapTheHiddenSmallObject', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['visual-scanning', 'figure-ground-perception', 'precise-tap-execution'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const spawnObject = useCallback(() => {
    let pos = { x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 };
    for (let a = 0; a < 40; a++) {
      const x = 10 + Math.random() * 80;
      const y = 10 + Math.random() * 80;
      if (patternDots.every((d) => Math.hypot(d.x - x, d.y - y) >= 5)) { pos = { x, y }; break; }
    }
    setObjPos(pos);
    hintMode.value = 0;
    roundActiveRef.current = true;
    objScale.value = 0;
    objOpacity.value = 0.18;
    objScale.value = withTiming(1, { duration: 300 });
    objOpacity.value = withTiming(0.22, { duration: 300 });
    cancelAnimation(hintPulse);
    hintPulse.value = 1;
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => {
      if (!roundActiveRef.current) return;
      hintMode.value = 1;
      hintPulse.value = withRepeat(withSequence(withTiming(1.35, { duration: 450 }), withTiming(1, { duration: 450 })), -1, true);
    }, P.hintDelayMs);
  }, [patternDots]);

  useEffect(() => {
    if (doneRef.current) return;
    spawnObject();
    return () => { if (hintTimerRef.current) clearTimeout(hintTimerRef.current); };
  }, [round]);

  useEffect(() => {
    speakTTS('Scan the pattern and find the hidden speck!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); if (hintTimerRef.current) clearTimeout(hintTimerRef.current); };
  }, []);

  const handleFound = useCallback(() => {
    if (!roundActiveRef.current || doneRef.current) return;
    roundActiveRef.current = false;
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    cancelAnimation(hintPulse);
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    objOpacity.value = withTiming(1, { duration: 120 });
    objScale.value = withSequence(withTiming(1.5, { duration: 140 }), withTiming(0, { duration: 200 }));
    setScore((prev) => {
      const next = prev + 1;
      setTimeout(() => { if (next >= TOTAL_ROUNDS) endGame(next); else setRound((r) => r + 1); }, P.nextRoundDelayMs);
      return next;
    });
  }, [endGame, playSuccess]);

  const handleMiss = useCallback(() => {
    if (!roundActiveRef.current || doneRef.current) return;
    playError();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    speakTTS('Keep scanning!', 0.78).catch(() => {});
  }, [playError]);

  const objAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: (hintMode.value ? hintPulse.value : 1) * objScale.value }],
    opacity: objOpacity.value,
  }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Scanner Pro!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#14532D', '#166534', '#15803D', '#22C55E']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🌿 Camo Scanner</Text>
        <Text style={styles.subtitle}>Find the hidden speck in the pattern</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>

      <Pressable onPress={handleMiss} style={styles.playArea}>
        {patternDots.map((d, i) => (
          <View key={i} style={[styles.patternDot, { left: `${d.x}%`, top: `${d.y}%` }]} />
        ))}
        {objPos && (
          <Animated.View style={[styles.objWrap, { left: `${objPos.x}%`, top: `${objPos.y}%` }, objAnimStyle]}>
            <Pressable onPress={handleFound} style={styles.objHit}>
              <View style={styles.hiddenObj} />
            </Pressable>
          </Animated.View>
        )}
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#86EFAC" count={14} size={8} />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  backText: { color: '#DCFCE7', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#DCFCE7' },
  subtitle: { fontSize: 14, color: 'rgba(220,252,231,0.8)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(134,239,172,0.15)', borderColor: 'rgba(134,239,172,0.35)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(134,239,172,0.25)', backgroundColor: 'rgba(0,0,0,0.12)', overflow: 'hidden' },
  patternDot: { position: 'absolute', width: H.patternDot, height: H.patternDot, borderRadius: H.patternDot / 2, backgroundColor: '#4ADE80', opacity: 0.55, marginLeft: -H.patternDot / 2, marginTop: -H.patternDot / 2 },
  objWrap: { position: 'absolute', marginLeft: -H.hitPad / 2, marginTop: -H.hitPad / 2, zIndex: 5 },
  objHit: { width: H.hitPad, height: H.hitPad, justifyContent: 'center', alignItems: 'center' },
  hiddenObj: { width: H.size, height: H.size, borderRadius: H.size / 2, backgroundColor: '#4ADE80', borderWidth: 1, borderColor: '#22C55E' },
});

export default TapTheHiddenSmallObjectGame;
