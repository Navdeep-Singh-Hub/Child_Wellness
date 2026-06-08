/**
 * OT Level 1 · Session 4 · Game 4 — Squish The Jelly
 * Theme: "Wobble Dome" — gentle squish in the sweet spot, not too hard!
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

const P = SESSION4_PACING.squishJelly;
const TOTAL_ROUNDS = 10;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const SPLAT_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR_ICON = require('@/assets/icons/star.png');

const JELLY_COLORS = [
  ['#C084FC', '#A855F7', '#7E22CE'] as [string, string, string],
  ['#F472B6', '#EC4899', '#BE185D'] as [string, string, string],
  ['#67E8F9', '#22D3EE', '#0891B2'] as [string, string, string],
  ['#86EFAC', '#4ADE80', '#16A34A'] as [string, string, string],
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

const SquishTheJellyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playSplat = useSound(SPLAT_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'squishing' | 'splat' | 'transition'>('idle');
  const [squishPct, setSquishPct] = useState(100);
  const [sparkleKey, setSparkleKey] = useState(0);

  const holdingRef = useRef(false);
  const compressionRef = useRef(1);
  const splattedRef = useRef(false);
  const doneRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scaleY = useSharedValue(1);
  const scaleX = useSharedValue(1);
  const jellyBounce = useSharedValue(0);
  const splatPulse = useSharedValue(1);

  const palette = JELLY_COLORS[(round - 1) % JELLY_COLORS.length];

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 16;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Perfect squish control! Jelly master!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({
        type: 'squishTheJelly',
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: xp,
        skillTags: ['proprioception', 'force-regulation', 'sensory-feedback'],
      }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const resetJelly = useCallback(() => {
    scaleY.value = withSpring(1, { damping: 10, stiffness: 120 });
    scaleX.value = withSpring(1, { damping: 10, stiffness: 120 });
    compressionRef.current = 1;
    splattedRef.current = false;
    setSquishPct(100);
    setPhase('idle');
  }, []);

  const triggerSplat = useCallback(() => {
    splattedRef.current = true;
    setPhase('splat');
    playSplat();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    speakTTS('Too much pressure!', 0.78).catch(() => {});
    splatPulse.value = withSequence(withTiming(1.4, { duration: 180 }), withTiming(1.1, { duration: 260 }));
    scaleY.value = withTiming(0.15, { duration: 200 });
    scaleX.value = withTiming(1.9, { duration: 200 });
    if (tickRef.current) clearInterval(tickRef.current);
    holdingRef.current = false;
    setTimeout(resetJelly, P.splatResetMs);
  }, [playSplat, resetJelly]);

  const onPressIn = useCallback(() => {
    if (doneRef.current || phase === 'splat' || phase === 'transition' || holdingRef.current) return;
    holdingRef.current = true;
    splattedRef.current = false;
    setPhase('squishing');
    compressionRef.current = 1;

    const startTime = Date.now();
    tickRef.current = setInterval(() => {
      if (!holdingRef.current || splattedRef.current) return;
      const elapsed = Date.now() - startTime;
      const amount = Math.min(elapsed / P.compressDurationMs, 1);
      const comp = 1 - amount * (1 - P.maxCompression);
      compressionRef.current = comp;
      setSquishPct(Math.round(comp * 100));
      scaleY.value = comp;
      scaleX.value = 1 + (1 - comp) * 0.35;
      jellyBounce.value = withTiming(Math.sin(elapsed / 80) * 2, { duration: 50 });

      if (comp <= P.splatThreshold) {
        triggerSplat();
      }
    }, 50);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [phase, triggerSplat]);

  const onPressOut = useCallback(() => {
    if (!holdingRef.current || splattedRef.current) return;
    holdingRef.current = false;
    if (tickRef.current) clearInterval(tickRef.current);

    const comp = compressionRef.current;
    scaleY.value = withSpring(1, { damping: 10, stiffness: 120 });
    scaleX.value = withSpring(1, { damping: 10, stiffness: 120 });

    if (comp >= P.goodMin && comp <= P.goodMax) {
      setSparkleKey(Date.now());
      playSuccess();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setScore((prev) => {
        const next = prev + 1;
        setPhase('transition');
        setTimeout(() => {
          if (next >= TOTAL_ROUNDS) {
            endGame(next);
          } else {
            setRound((r) => r + 1);
            resetJelly();
          }
        }, P.nextRoundDelayMs);
        return next;
      });
    } else if (comp > P.goodMax) {
      speakTTS('Squish a little less!', 0.78).catch(() => {});
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
      setPhase('idle');
    } else {
      speakTTS('Squish a bit more!', 0.78).catch(() => {});
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
      setPhase('idle');
    }
  }, [endGame, resetJelly, playSuccess]);

  useEffect(() => {
    speakTTS('Press and hold to squish the jelly gently. Release in the sweet spot!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  const jellyStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scaleY.value }, { scaleX: scaleX.value }, { rotate: `${jellyBounce.value}deg` }],
  }));
  const splatStyle = useAnimatedStyle(() => ({ transform: [{ scale: splatPulse.value }] }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Wobble Master!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#2E1065', '#4C1D95', '#6D28D9', '#7C3AED']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🍮 Wobble Dome</Text>
        <Text style={styles.subtitle}>Gentle squish · sweet spot 50–72%</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.playArea} onPressIn={onPressIn} onPressOut={onPressOut} disabled={phase === 'splat' || phase === 'transition'}>
        <View style={styles.domeBase} />

        <Animated.View style={[styles.jellyWrap, jellyStyle]}>
          <LinearGradient colors={palette} style={styles.jelly}>
            <View style={styles.jellyShine} />
            <Text style={styles.jellyFace}>{phase === 'splat' ? '💥' : '🍮'}</Text>
          </LinearGradient>
        </Animated.View>

        {phase === 'splat' && (
          <Animated.View style={[styles.splatRing, splatStyle]} />
        )}

        {phase === 'squishing' && (
          <View style={[styles.pctPill, squishPct >= P.goodMin * 100 && squishPct <= P.goodMax * 100 && styles.sweetPill]}>
            <Text style={styles.pctText}>{squishPct}%</Text>
          </View>
        )}

        {phase === 'idle' && (
          <View style={styles.hintPill}><Text style={styles.hintText}>Press & hold to squish 👆</Text></View>
        )}

        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={palette[0]} count={12} size={7} />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4C1D95' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#EDE9FE', textShadowColor: 'rgba(167,139,250,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  subtitle: { fontSize: 14, color: 'rgba(221,214,254,0.85)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.3)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  domeBase: { position: 'absolute', bottom: '26%', width: 200, height: 30, borderRadius: 100, backgroundColor: 'rgba(0,0,0,0.25)' },
  jellyWrap: { alignItems: 'center' },
  jelly: { width: 150, height: 150, borderRadius: 75, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', shadowColor: '#A855F7', shadowOpacity: 0.5, shadowRadius: 20, elevation: 14 },
  jellyShine: { position: 'absolute', top: 20, left: 28, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.35)' },
  jellyFace: { fontSize: 56 },
  splatRing: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 4, borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.2)' },
  pctPill: { position: 'absolute', bottom: '18%', backgroundColor: 'rgba(15,23,42,0.85)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  sweetPill: { backgroundColor: 'rgba(34,197,94,0.85)' },
  pctText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  hintPill: { position: 'absolute', bottom: '12%', backgroundColor: 'rgba(167,139,250,0.9)', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 22 },
  hintText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

export default SquishTheJellyGame;
