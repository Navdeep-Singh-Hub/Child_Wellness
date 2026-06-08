/**
 * OT Level 1 · Session 8 · Game 1 — Tiny Dot Tap
 * Theme: "Laser Pinpoint" — hit the glowing micro-dot.
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
import { Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION8_PACING;
const TOTAL_ROUNDS = 12;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const STAR_ICON = require('@/assets/icons/star.png');
const MARGIN = 12;

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

const TinyDotTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [dotPos, setDotPos] = useState<{ x: number; y: number } | null>(null);
  const [sparkleKey, setSparkleKey] = useState(0);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const dotScale = useSharedValue(0);
  const dotOpacity = useSharedValue(0);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 12;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Laser pinpoint master!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'tinyDotTap', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['fine-target-accuracy', 'controlled-finger-movement', 'increased-concentration'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const spawnDot = useCallback(() => {
    const x = MARGIN + Math.random() * (100 - MARGIN * 2);
    const y = MARGIN + Math.random() * (100 - MARGIN * 2);
    setDotPos({ x, y });
    roundActiveRef.current = true;
    dotScale.value = 0;
    dotOpacity.value = 0;
    dotScale.value = withSequence(withTiming(1.25, { duration: P.dotAppearMs }), withSpring(1, { damping: 12 }));
    dotOpacity.value = withTiming(1, { duration: P.dotAppearMs });
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    spawnDot();
  }, [round]);

  useEffect(() => {
    speakTTS('Tap the tiny glowing dot!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const handleTap = useCallback(() => {
    if (!roundActiveRef.current || doneRef.current) return;
    roundActiveRef.current = false;
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    dotScale.value = withTiming(0, { duration: P.successPopMs });
    dotOpacity.value = withTiming(0, { duration: P.successPopMs });
    setScore((prev) => {
      const next = prev + 1;
      setTimeout(() => { if (next >= TOTAL_ROUNDS) endGame(next); else setRound((r) => r + 1); }, P.nextRoundDelayMs);
      return next;
    });
  }, [endGame, playSuccess]);

  const dotStyle = useAnimatedStyle(() => ({ transform: [{ scale: dotScale.value }], opacity: dotOpacity.value }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Pinpoint Pro!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F0A1E', '#1E1B4B', '#312E81', '#4338CA']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🎯 Laser Pinpoint</Text>
        <Text style={styles.subtitle}>Tap the micro-dot as accurately as you can</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        {dotPos && (
          <Animated.View style={[styles.dotWrap, { left: `${dotPos.x}%`, top: `${dotPos.y}%` }, dotStyle]}>
            <Pressable onPress={handleTap} style={styles.hitPad}>
              <LinearGradient colors={['#FCA5A5', '#EF4444', '#B91C1C']} style={styles.dot}>
                <View style={styles.dotCore} />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#F87171" count={12} size={7} />
      </View>
    </SafeAreaView>
  );
};

const S = P.tinyDot;
const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  backText: { color: '#E0E7FF', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#E0E7FF', textShadowColor: 'rgba(129,140,248,0.5)', textShadowRadius: 12, textShadowOffset: { width: 0, height: 0 } },
  subtitle: { fontSize: 14, color: 'rgba(224,231,255,0.75)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.3)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(129,140,248,0.25)', backgroundColor: 'rgba(0,0,0,0.2)' },
  dotWrap: { position: 'absolute', marginLeft: -S.hitPad / 2, marginTop: -S.hitPad / 2 },
  hitPad: { width: S.hitPad, height: S.hitPad, justifyContent: 'center', alignItems: 'center' },
  dot: { width: S.size, height: S.size, borderRadius: S.size / 2, justifyContent: 'center', alignItems: 'center', shadowColor: '#EF4444', shadowOpacity: 0.9, shadowRadius: 12, elevation: 10 },
  dotCore: { width: S.size * 0.35, height: S.size * 0.35, borderRadius: S.size * 0.2, backgroundColor: '#FFF' },
});

export default TinyDotTapGame;
