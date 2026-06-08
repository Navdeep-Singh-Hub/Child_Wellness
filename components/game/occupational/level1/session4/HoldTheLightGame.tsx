/**
 * OT Level 1 · Session 4 · Game 5 — Hold The Light
 * Theme: "Beacon Glow" — hold until the lighthouse beam shines fully bright.
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
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION4_PACING.holdLight;
const TOTAL_ROUNDS = 6;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
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

const HoldTheLightGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const bulbSize = Math.min(width * 0.38, 180);
  const playSuccess = useSound(SUCCESS_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'glowing' | 'ready' | 'transition'>('idle');
  const [brightPct, setBrightPct] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);

  const holdingRef = useRef(false);
  const progressRef = useRef(0);
  const doneRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bulbGlow = useSharedValue(0);
  const beamOpacity = useSharedValue(0);
  const bulbScale = useSharedValue(1);
  const waveOpacity = useSharedValue(0.3);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 17;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('The beacon shines! Light master!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({
        type: 'holdTheLight',
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: xp,
        skillTags: ['timing-modulation', 'sustained-attention', 'fine-motor-precision'],
      }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const resetBulb = useCallback(() => {
    bulbGlow.value = 0;
    beamOpacity.value = 0;
    bulbScale.value = 1;
    progressRef.current = 0;
    setBrightPct(0);
    setPhase('idle');
  }, []);

  const onRoundSuccess = useCallback(() => {
    setPhase('transition');
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    bulbScale.value = withSequence(withSpring(1.15, { damping: 8 }), withSpring(1, { damping: 12 }));

    setScore((prev) => {
      const next = prev + 1;
      setTimeout(() => {
        if (next >= TOTAL_ROUNDS) {
          endGame(next);
        } else {
          setRound((r) => r + 1);
          resetBulb();
        }
      }, P.nextRoundDelayMs);
      return next;
    });
  }, [endGame, resetBulb, playSuccess]);

  const onPressIn = useCallback(() => {
    if (doneRef.current || phase === 'transition' || holdingRef.current) return;
    holdingRef.current = true;
    setPhase('glowing');
    progressRef.current = 0;
    setBrightPct(0);
    bulbGlow.value = 0;

    tickRef.current = setInterval(() => {
      if (!holdingRef.current) return;
      progressRef.current = Math.min(1, progressRef.current + 50 / P.holdDurationMs);
      setBrightPct(Math.round(progressRef.current * 100));
      bulbGlow.value = progressRef.current;
      beamOpacity.value = progressRef.current * 0.85;
      waveOpacity.value = 0.3 + progressRef.current * 0.5;

      if (progressRef.current >= 1) {
        setPhase('ready');
        if (tickRef.current) clearInterval(tickRef.current);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speakTTS('Release now!', 0.85).catch(() => {});
      } else if (progressRef.current >= P.perfectWindowStart) {
        setPhase('ready');
      }
    }, 50);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [phase]);

  const onPressOut = useCallback(() => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    if (tickRef.current) clearInterval(tickRef.current);
    cancelAnimation(bulbGlow);

    const p = progressRef.current;

    if (p >= P.perfectWindowStart) {
      onRoundSuccess();
    } else {
      bulbGlow.value = withTiming(0, { duration: 400 });
      beamOpacity.value = withTiming(0, { duration: 400 });
      setBrightPct(0);
      progressRef.current = 0;
      setPhase('idle');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
      speakTTS('Hold longer for full brightness!', 0.78).catch(() => {});
    }
  }, [onRoundSuccess]);

  useEffect(() => {
    waveOpacity.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 1800 }), withTiming(0.25, { duration: 1800 })),
      -1,
      true,
    );
    speakTTS('Press and hold to make the beacon glow. Release at full brightness!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: bulbGlow.value * 0.9,
    transform: [{ scale: 1 + bulbGlow.value * 0.4 }],
  }));
  const beamStyle = useAnimatedStyle(() => ({ opacity: beamOpacity.value }));
  const bulbStyle = useAnimatedStyle(() => ({ transform: [{ scale: bulbScale.value }] }));
  const waveStyle = useAnimatedStyle(() => ({ opacity: waveOpacity.value }));

  const glowColor = brightPct >= 90 ? '#FDE047' : brightPct >= 50 ? '#FBBF24' : '#F59E0B';

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Beacon Keeper!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0C1445', '#1E3A5F', '#0F2847', '#172554']} locations={[0, 0.4, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      {/* Ocean waves */}
      <Animated.View style={[styles.wave, styles.wave1, waveStyle]} />
      <Animated.View style={[styles.wave, styles.wave2, waveStyle]} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>💡 Beacon Glow</Text>
        <Text style={styles.subtitle}>Hold steady · release at full brightness</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        {/* Lighthouse tower */}
        <View style={styles.tower}>
          <LinearGradient colors={['#F8FAFC', '#E2E8F0', '#CBD5E1']} style={styles.towerBody} />
          <View style={styles.towerStripes}>
            <View style={styles.stripe} /><View style={[styles.stripe, styles.stripeRed]} />
          </View>
        </View>

        {/* Glow aura */}
        <Animated.View style={[styles.glowAura, { backgroundColor: glowColor, shadowColor: glowColor }, glowStyle]} />

        {/* Light beam */}
        <Animated.View style={[styles.beam, beamStyle]}>
          <LinearGradient colors={[`${glowColor}CC`, `${glowColor}00`]} style={StyleSheet.absoluteFillObject} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />
        </Animated.View>

        <Animated.View style={bulbStyle}>
          <TouchableOpacity activeOpacity={1} onPressIn={onPressIn} onPressOut={onPressOut}
            disabled={phase === 'transition'} style={[styles.bulbBtn, { width: bulbSize, height: bulbSize, borderRadius: bulbSize / 2 }]}>
            <LinearGradient colors={phase === 'ready' ? ['#FDE047', '#FBBF24'] : ['#64748B', '#475569']}
              style={[StyleSheet.absoluteFillObject, { borderRadius: bulbSize / 2 }]}>
              <View style={styles.bulbShine} />
            </LinearGradient>
            <Text style={styles.bulbEmoji}>💡</Text>
          </TouchableOpacity>
        </Animated.View>

        {(phase === 'glowing' || phase === 'ready') && (
          <View style={[styles.pctPill, phase === 'ready' && styles.readyPill]}>
            <Text style={styles.pctText}>{phase === 'ready' ? 'RELEASE!' : `${brightPct}%`}</Text>
          </View>
        )}

        {phase === 'idle' && (
          <View style={styles.hintPill}><Text style={styles.hintText}>Press & hold to glow ✨</Text></View>
        )}

        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#FBBF24" count={14} size={8} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0C1445' },
  wave: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(30,58,95,0.6)', borderTopLeftRadius: 50, borderTopRightRadius: 50 },
  wave1: { height: 60, bottom: 20 },
  wave2: { height: 40, bottom: 0, backgroundColor: 'rgba(15,40,71,0.8)' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#FEF3C7', textShadowColor: 'rgba(251,191,36,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  subtitle: { fontSize: 14, color: 'rgba(254,243,199,0.8)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.3)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tower: { position: 'absolute', bottom: '18%', alignItems: 'center' },
  towerBody: { width: 60, height: 120, borderRadius: 4 },
  towerStripes: { position: 'absolute', top: 20, gap: 16 },
  stripe: { width: 60, height: 14, backgroundColor: '#EF4444' },
  stripeRed: { backgroundColor: '#DC2626' },
  glowAura: { position: 'absolute', width: 220, height: 220, borderRadius: 110, shadowRadius: 40, shadowOffset: { width: 0, height: 0 }, elevation: 20 },
  beam: { position: 'absolute', top: '18%', width: 120, height: 180, borderRadius: 60, overflow: 'hidden' },
  bulbBtn: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden', zIndex: 5, shadowColor: '#FBBF24', shadowOpacity: 0.4, shadowRadius: 16, elevation: 12 },
  bulbShine: { position: 'absolute', top: '15%', left: '20%', width: '35%', height: '25%', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.4)' },
  bulbEmoji: { fontSize: 56, zIndex: 2 },
  pctPill: { position: 'absolute', bottom: '14%', backgroundColor: 'rgba(15,23,42,0.85)', paddingHorizontal: 22, paddingVertical: 10, borderRadius: 20 },
  readyPill: { backgroundColor: 'rgba(34,197,94,0.9)' },
  pctText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  hintPill: { position: 'absolute', bottom: '8%', backgroundColor: 'rgba(251,191,36,0.85)', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 22 },
  hintText: { color: '#78350F', fontSize: 15, fontWeight: '800' },
});

export default HoldTheLightGame;
