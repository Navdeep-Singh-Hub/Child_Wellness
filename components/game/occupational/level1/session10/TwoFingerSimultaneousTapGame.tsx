/**
 * OT Level 1 · Session 10 · Game 4 — Two Finger Simultaneous Tap
 * Theme: "Twin Tap Arena" — tap both pads at the same time.
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
import { Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION10_PACING;
const TT = P.twinTap;
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

function TwinPad({ side, onPress, disabled, pulse }: { side: 'left' | 'right'; onPress: () => void; disabled: boolean; pulse: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));
  return (
    <Animated.View style={[styles.padWrap, side === 'left' ? styles.padLeft : styles.padRight, style]}>
      <Pressable onPress={onPress} disabled={disabled} style={styles.padHit}>
        <LinearGradient colors={['#FDE047', '#F59E0B', '#D97706']} style={styles.padGrad}>
          <Text style={styles.padEmoji}>👆</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const TwoFingerSimultaneousTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [roundActive, setRoundActive] = useState(true);
  const [sparkleKey, setSparkleKey] = useState(0);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const firstTapRef = useRef<{ time: number; side: 'left' | 'right' } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leftPulse = useSharedValue(1);
  const rightPulse = useSharedValue(1);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 20;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Twin tap champion!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'twoFingerSimultaneousTap', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['bilateral-tapping', 'timing-coordination', 'finger-isolation'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const resetTapState = useCallback(() => {
    firstTapRef.current = null;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handleSuccess = useCallback(() => {
    if (!roundActiveRef.current || doneRef.current) return;
    roundActiveRef.current = false;
    setRoundActive(false);
    resetTapState();
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setScore((prev) => {
      const next = prev + 1;
      setTimeout(() => { if (next >= TOTAL_ROUNDS) endGame(next); else setRound((r) => r + 1); }, P.nextRoundDelayMs);
      return next;
    });
  }, [endGame, playSuccess, resetTapState]);

  const handleMiss = useCallback(() => {
    if (!roundActiveRef.current || doneRef.current) return;
    playError();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    speakTTS('Tap both pads together!', 0.78).catch(() => {});
    leftPulse.value = withSequence(withTiming(0.9, { duration: 70 }), withTiming(1, { duration: 70 }));
    rightPulse.value = withSequence(withTiming(0.9, { duration: 70 }), withTiming(1, { duration: 70 }));
    resetTapState();
  }, [playError, resetTapState]);

  const startRound = useCallback(() => {
    if (doneRef.current) return;
    roundActiveRef.current = true;
    setRoundActive(true);
    resetTapState();
    leftPulse.value = 1;
    rightPulse.value = 1;
    leftPulse.value = withRepeat(withSequence(withTiming(1.08, { duration: 700 }), withTiming(1, { duration: 700 })), -1, true);
    rightPulse.value = withRepeat(withSequence(withTiming(1.08, { duration: 700 }), withTiming(1, { duration: 700 })), -1, true);
  }, [resetTapState]);

  useEffect(() => {
    if (doneRef.current) return;
    startRound();
    return () => resetTapState();
  }, [round]);

  useEffect(() => {
    speakTTS('Tap both targets at the same time with two fingers!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); resetTapState(); };
  }, []);

  const handlePadTap = useCallback((side: 'left' | 'right') => {
    if (!roundActiveRef.current || doneRef.current) return;
    const now = Date.now();
    const first = firstTapRef.current;
    if (!first) {
      firstTapRef.current = { time: now, side };
      timeoutRef.current = setTimeout(() => handleMiss(), TT.maxTapDelayMs);
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (first.side !== side && now - first.time <= TT.maxTapDelayMs) handleSuccess();
    else handleMiss();
  }, [handleSuccess, handleMiss]);

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Twin Tap Pro!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FEF9C3', '#FEF08A', '#FDE047', '#EAB308']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backTextDark}>← Back</Text></View>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.titleDark}>✌️ Twin Tap Arena</Text>
        <Text style={styles.subtitleDark}>Tap both pads at the same time!</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabelDark}>Round</Text><Text style={styles.statValueDark}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValueDark}>{score}</Text>
          </View>
        </View>
      </View>
      <View style={styles.playArea}>
        <View style={styles.connector} />
        <TwinPad side="left" onPress={() => handlePadTap('left')} disabled={!roundActive} pulse={leftPulse} />
        <TwinPad side="right" onPress={() => handlePadTap('right')} disabled={!roundActive} pulse={rightPulse} />
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#FACC15" count={18} size={9} />
      </View>
    </SafeAreaView>
  );
};

const S = TT.targetSize;
const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(234,179,8,0.3)' },
  backTextDark: { color: '#A16207', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  titleDark: { fontSize: 28, fontWeight: '900', color: '#A16207' },
  subtitleDark: { fontSize: 14, color: '#CA8A04', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.65)', borderWidth: 1, borderColor: 'rgba(234,179,8,0.25)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.25)', borderColor: 'rgba(251,191,36,0.45)' },
  statLabelDark: { fontSize: 11, color: '#CA8A04', fontWeight: '700', textTransform: 'uppercase' },
  statValueDark: { fontSize: 20, fontWeight: '900', color: '#A16207' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(250,204,21,0.35)', backgroundColor: 'rgba(255,255,255,0.3)' },
  connector: { position: 'absolute', top: '50%', left: '22%', right: '22%', height: 4, backgroundColor: '#F59E0B', borderRadius: 2, opacity: 0.5 },
  padWrap: { position: 'absolute', top: '50%', marginTop: -S / 2, width: S, height: S },
  padLeft: { left: '18%' },
  padRight: { right: '18%' },
  padHit: { width: S, height: S, borderRadius: S / 2, overflow: 'hidden', shadowColor: '#F59E0B', shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 },
  padGrad: { flex: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FDE047', borderRadius: S / 2 },
  padEmoji: { fontSize: 42 },
});

export default TwoFingerSimultaneousTapGame;
