/**
 * OT Level 1 · Session 10 · Game 1 — Pinch To Pop
 * Theme: "Bubble Burst Bay" — pinch the floating balloon to pop it.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION10_PACING } from '@/components/game/occupational/level1/session10/session10Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION10_PACING;
const B = P.pinchPop;
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

const PinchToPopGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const poppedRef = useRef(false);
  const balloonScale = useSharedValue(1);
  const balloonX = useSharedValue(50);
  const balloonY = useSharedValue(50);
  const balloonOpacity = useSharedValue(1);
  const wiggle = useSharedValue(0);
  const floatY = useSharedValue(0);
  const glow = useSharedValue(0.4);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 20;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Bubble burst champion!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'pinchToPop', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['pinch-grasp', 'bilateral-coordination', 'fine-motor-control'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const startRound = useCallback(() => {
    if (doneRef.current) return;
    roundActiveRef.current = true;
    poppedRef.current = false;
    const margin = 18;
    balloonX.value = margin + Math.random() * (100 - margin * 2);
    balloonY.value = margin + Math.random() * (100 - margin * 2);
    balloonScale.value = 1;
    balloonOpacity.value = 1;
    wiggle.value = 0;
    glow.value = withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0.35, { duration: 700 })), -1, true);
    floatY.value = withRepeat(withSequence(withTiming(-10, { duration: 1800, easing: Easing.inOut(Easing.ease) }), withTiming(10, { duration: 1800, easing: Easing.inOut(Easing.ease) })), -1, true);
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    startRound();
  }, [round]);

  useEffect(() => {
    speakTTS('Pinch the balloon with two fingers to pop it!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const handlePop = useCallback(() => {
    if (!roundActiveRef.current || doneRef.current || poppedRef.current) return;
    poppedRef.current = true;
    roundActiveRef.current = false;
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    balloonScale.value = withSequence(withTiming(1.3, { duration: 120 }), withTiming(0, { duration: P.successPopMs }));
    balloonOpacity.value = withTiming(0, { duration: P.successPopMs });
    setScore((prev) => {
      const next = prev + 1;
      setTimeout(() => { if (next >= TOTAL_ROUNDS) endGame(next); else setRound((r) => r + 1); }, P.nextRoundDelayMs);
      return next;
    });
  }, [endGame, playSuccess]);

  const handleSingleTap = useCallback(() => {
    if (!roundActiveRef.current || doneRef.current || poppedRef.current) return;
    playError();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    speakTTS('Use two fingers to pinch!', 0.78).catch(() => {});
    wiggle.value = withSequence(withTiming(-12, { duration: 60 }), withTiming(12, { duration: 60 }), withTiming(0, { duration: 60 }));
  }, [playError]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      if (!roundActiveRef.current || poppedRef.current) return;
      balloonScale.value = Math.max(0.35, 1 - (1 - e.scale) * 0.55);
      glow.value = Math.min(1, 0.35 + (1 - e.scale) * 1.5);
      if (e.scale < 1 - B.pinchThreshold) runOnJS(handlePop)();
    })
    .onEnd(() => {
      if (!poppedRef.current) balloonScale.value = withSpring(1, { damping: 12 });
    });

  const tapGesture = Gesture.Tap().onEnd(() => { runOnJS(handleSingleTap)(); });
  const gesture = Gesture.Race(pinchGesture, tapGesture);

  const balloonStyle = useAnimatedStyle(() => ({
    width: B.balloonSize, height: B.balloonSize, left: `${balloonX.value}%`, top: `${balloonY.value}%`,
    transform: [{ translateX: -B.balloonSize / 2 }, { translateY: -B.balloonSize / 2 + floatY.value }, { scale: balloonScale.value }, { rotate: `${wiggle.value}deg` }],
    opacity: balloonOpacity.value,
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value * 0.55, transform: [{ scale: 1 + glow.value * 0.15 }] }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Pop Star!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FFF1F2', '#FECDD3', '#FDA4AF', '#FB7185']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backTextDark}>← Back</Text></View>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.titleDark}>🎈 Bubble Burst Bay</Text>
        <Text style={styles.subtitleDark}>Pinch with two fingers to pop!</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabelDark}>Round</Text><Text style={styles.statValueDark}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValueDark}>{score}</Text>
          </View>
        </View>
      </View>
      <GestureDetector gesture={gesture}>
        <View style={styles.playArea}>
          <Animated.View style={[styles.glow, glowStyle]} />
          <Animated.View style={[styles.balloon, balloonStyle]}>
            <LinearGradient colors={['#FCA5A5', '#EF4444', '#B91C1C']} style={styles.balloonGrad}>
              <Text style={styles.emoji}>🎈</Text>
            </LinearGradient>
          </Animated.View>
          <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#FB7185" count={16} size={8} />
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(244,63,94,0.25)' },
  backTextDark: { color: '#BE123C', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  titleDark: { fontSize: 28, fontWeight: '900', color: '#BE123C' },
  subtitleDark: { fontSize: 14, color: '#E11D48', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(244,63,94,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabelDark: { fontSize: 11, color: '#E11D48', fontWeight: '700', textTransform: 'uppercase' },
  statValueDark: { fontSize: 20, fontWeight: '900', color: '#BE123C' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(251,113,133,0.3)', backgroundColor: 'rgba(255,255,255,0.35)' },
  glow: { position: 'absolute', alignSelf: 'center', top: '40%', width: B.balloonSize * 1.5, height: B.balloonSize * 1.5, borderRadius: B.balloonSize, backgroundColor: '#FB7185' },
  balloon: { position: 'absolute', borderRadius: 999, overflow: 'hidden', shadowColor: '#EF4444', shadowOpacity: 0.45, shadowRadius: 14, elevation: 10 },
  balloonGrad: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 999, borderWidth: 3, borderColor: '#FECACA' },
  emoji: { fontSize: 56 },
});

export default PinchToPopGame;
