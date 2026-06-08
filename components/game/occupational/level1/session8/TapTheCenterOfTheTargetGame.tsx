/**
 * OT Level 1 · Session 8 · Game 2 — Tap The Center Of The Target
 * Theme: "Bullseye Arena" — hit the glowing bullseye core.
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
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION8_PACING;
const TOTAL_ROUNDS = 10;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR_ICON = require('@/assets/icons/star.png');
const T = P.centerTarget;

type TapResult = 'center' | 'edge' | 'miss';

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

const TapTheCenterOfTheTargetGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [centerTaps, setCenterTaps] = useState(0);
  const [edgeTaps, setEdgeTaps] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [targetPos, setTargetPos] = useState<{ x: number; y: number } | null>(null);
  const [sparkleKey, setSparkleKey] = useState(0);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const centerTapsRef = useRef(0);
  const edgeTapsRef = useRef(0);
  const roundRef = useRef(1);
  const layoutRef = useRef<{ w: number; h: number } | null>(null);

  useEffect(() => { roundRef.current = round; }, [round]);

  const targetScale = useSharedValue(1);
  const coreGlow = useSharedValue(0.4);

  const endGame = useCallback((finalCenter: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalCenter * 15 + edgeTapsRef.current * 5;
    setFinalStats({ correct: finalCenter, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Bullseye champion!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'tapTheCenterOfTheTarget', correct: finalCenter, total, accuracy: (finalCenter / total) * 100, xpAwarded: xp,
        skillTags: ['spatial-precision', 'proprioceptive-feedback', 'accuracy-grading'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const startRound = useCallback(() => {
    const margin = 18;
    setTargetPos({ x: margin + Math.random() * (100 - margin * 2), y: margin + Math.random() * (100 - margin * 2) });
    roundActiveRef.current = true;
    targetScale.value = 0;
    targetScale.value = withSequence(withSpring(1.08, { damping: 10 }), withSpring(1, { damping: 14 }));
    cancelAnimation(coreGlow);
    coreGlow.value = withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0.35, { duration: 700 })), -1, true);
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    startRound();
  }, [round]);

  useEffect(() => {
    speakTTS('Tap the center of the bullseye!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const calcResult = (lx: number, ly: number): TapResult => {
    const layout = layoutRef.current;
    if (!layout) return 'miss';
    const cx = layout.w / 2;
    const cy = layout.h / 2;
    const dist = Math.hypot(lx - cx, ly - cy);
    if (dist <= T.centerHit) return 'center';
    if (dist <= T.outer / 2 + 10) return 'edge';
    return 'miss';
  };

  const advanceRound = useCallback((result: TapResult) => {
    if (result === 'center') {
      setSparkleKey(Date.now());
      playSuccess();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setCenterTaps((prev) => {
        const next = prev + 1;
        centerTapsRef.current = next;
        setTimeout(() => {
          if (roundRef.current >= TOTAL_ROUNDS) endGame(next);
          else setRound((r) => r + 1);
        }, P.nextRoundDelayMs);
        return next;
      });
    } else if (result === 'edge') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      speakTTS('Close! Aim for the center.', 0.78).catch(() => {});
      setEdgeTaps((prev) => { edgeTapsRef.current = prev + 1; return prev + 1; });
      setTimeout(() => {
        if (roundRef.current >= TOTAL_ROUNDS) endGame(centerTapsRef.current);
        else setRound((r) => r + 1);
      }, P.nextRoundDelayMs);
    }
  }, [endGame, playSuccess]);

  const handleTap = useCallback((e: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (!roundActiveRef.current || doneRef.current) return;
    const result = calcResult(e.nativeEvent.locationX, e.nativeEvent.locationY);
    if (result === 'miss') {
      playError();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      speakTTS('Aim for the center dot!', 0.78).catch(() => {});
      targetScale.value = withSequence(withTiming(0.92, { duration: 80 }), withSpring(1, { damping: 12 }));
      return;
    }
    roundActiveRef.current = false;
    cancelAnimation(coreGlow);
    targetScale.value = withSequence(withSpring(1.15, { damping: 8 }), withSpring(1, { damping: 14 }));
    advanceRound(result);
  }, [advanceRound, playError]);

  const handleCenterTap = useCallback(() => {
    if (!roundActiveRef.current || doneRef.current) return;
    roundActiveRef.current = false;
    cancelAnimation(coreGlow);
    targetScale.value = withSequence(withSpring(1.15, { damping: 8 }), withSpring(1, { damping: 14 }));
    advanceRound('center');
  }, [advanceRound]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    layoutRef.current = { w: width, h: height };
  }, []);

  const targetAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: targetScale.value }] }));
  const coreAnimStyle = useAnimatedStyle(() => ({ opacity: coreGlow.value }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Bullseye King!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#450A0A', '#7F1D1D', '#991B1B', '#B45309']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🏹 Bullseye Arena</Text>
        <Text style={styles.subtitle}>Hit the glowing center, not the outer ring</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{centerTaps}</Text>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        {targetPos && (
          <Animated.View style={[styles.targetWrap, { left: `${targetPos.x}%`, top: `${targetPos.y}%` }, targetAnimStyle]}>
            <Pressable onPress={handleTap} onLayout={onLayout} style={styles.targetPress}>
              <View style={styles.outerRing}>
                <LinearGradient colors={['rgba(254,243,199,0.15)', 'rgba(251,191,36,0.05)']} style={StyleSheet.absoluteFillObject} />
              </View>
              <Pressable onPress={handleCenterTap} style={styles.coreHit} hitSlop={16}>
                <Animated.View style={[styles.core, coreAnimStyle]}>
                  <LinearGradient colors={['#FDE047', '#F59E0B', '#B45309']} style={styles.coreGrad} />
                </Animated.View>
              </Pressable>
            </Pressable>
          </Animated.View>
        )}
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#FDE047" count={14} size={8} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  backText: { color: '#FEF3C7', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#FEF3C7' },
  subtitle: { fontSize: 14, color: 'rgba(254,243,199,0.8)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.35)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1 },
  targetWrap: { position: 'absolute', marginLeft: -T.outer / 2, marginTop: -T.outer / 2 },
  targetPress: { width: T.outer, height: T.outer, justifyContent: 'center', alignItems: 'center' },
  outerRing: { position: 'absolute', width: T.outer, height: T.outer, borderRadius: T.outer / 2, borderWidth: 5, borderColor: '#FDE047', overflow: 'hidden' },
  coreHit: { width: T.center + 50, height: T.center + 50, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  core: { width: T.center, height: T.center, borderRadius: T.center / 2, overflow: 'hidden', shadowColor: '#F59E0B', shadowOpacity: 0.8, shadowRadius: 14, elevation: 10 },
  coreGrad: { flex: 1, borderRadius: T.center / 2 },
});

export default TapTheCenterOfTheTargetGame;
