/**
 * OT Level 1 · Session 1 · Game 4 — Tap and Hold
 * Theme: "Power Orb Lab" — charge a glowing orb by holding steady.
 * Gameplay: fluid fill animation, instant early-release reset, fast round handoff.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
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
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const HOLD_TARGET_MS = 2000;
const TOTAL_ROUNDS = 6;
const ROUND_HANDOFF_MS = 380;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const STAR_ICON = require('@/assets/icons/star.png');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ORB_COLORS = [
  { ring: '#818CF8', core: ['#6366F1', '#4F46E5', '#312E81'] as [string, string, string] },
  { ring: '#F472B6', core: ['#EC4899', '#DB2777', '#9D174D'] as [string, string, string] },
  { ring: '#34D399', core: ['#10B981', '#059669', '#064E3B'] as [string, string, string] },
  { ring: '#FBBF24', core: ['#F59E0B', '#D97706', '#78350F'] as [string, string, string] },
  { ring: '#38BDF8', core: ['#0EA5E9', '#0284C7', '#0C4A6E'] as [string, string, string] },
  { ring: '#A78BFA', core: ['#8B5CF6', '#7C3AED', '#4C1D95'] as [string, string, string] },
];

const usePopSound = () => {
  const ref = useRef<ExpoAudio.Sound | null>(null);
  useEffect(() => () => { ref.current?.unloadAsync().catch(() => {}); }, []);
  return useCallback(async () => {
    try {
      if (Platform.OS === 'web') return;
      if (!ref.current) {
        const { sound } = await ExpoAudio.Sound.createAsync({ uri: SUCCESS_SOUND }, { volume: 0.5 });
        ref.current = sound;
      }
      await ref.current.replayAsync();
    } catch { /* noop */ }
  }, []);
};

function EarlyReleaseToast({ visible }: { visible: boolean }) {
  const opacity = useSharedValue(0);
  const y = useSharedValue(6);
  useEffect(() => {
    if (!visible) return;
    opacity.value = 0;
    y.value = 6;
    opacity.value = withSequence(withTiming(1, { duration: 120 }), withTiming(0, { duration: 400 }));
    y.value = withSpring(0, { damping: 14 });
  }, [visible]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: y.value }] }));
  if (!visible) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.earlyToast, style]}>
      <Text style={styles.earlyToastText}>Keep holding!</Text>
    </Animated.View>
  );
}

const TapAndHoldGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const orbSize = Math.min(width * 0.48, 220);
  const ringSize = orbSize + 36;
  const strokeW = 10;
  const radius = (ringSize - strokeW) / 2;
  const circumference = 2 * Math.PI * radius;

  const [round, setRound] = useState(1);
  const [successfulHolds, setSuccessfulHolds] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'holding' | 'success' | 'transition'>('idle');
  const [showEarlyToast, setShowEarlyToast] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [holdPct, setHoldPct] = useState(0);

  const holdingRef = useRef(false);
  const completedRef = useRef(false);
  const progressTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playSuccess = usePopSound();

  const progress = useSharedValue(0);
  const orbScale = useSharedValue(1);
  const orbGlow = useSharedValue(0.3);
  const orbOpacity = useSharedValue(1);
  const successFlash = useSharedValue(0);

  const palette = ORB_COLORS[(round - 1) % ORB_COLORS.length];

  const resetOrb = useCallback((instant = false) => {
    cancelAnimation(progress);
    cancelAnimation(orbScale);
    if (instant) {
      progress.value = 0;
      orbScale.value = 1;
      orbGlow.value = 0.3;
      successFlash.value = 0;
    } else {
      progress.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
      orbScale.value = withSpring(1, { damping: 14, stiffness: 180 });
      orbGlow.value = withTiming(0.3, { duration: 200 });
      successFlash.value = withTiming(0, { duration: 200 });
    }
    holdingRef.current = false;
    completedRef.current = false;
    setPhase('idle');
  }, []);

  const advanceRound = useCallback((holdCount: number) => {
    if (round >= TOTAL_ROUNDS) {
      const xp = holdCount * 20;
      const stats = { correct: holdCount, total: TOTAL_ROUNDS, xp };
      setFinalStats(stats);
      setDone(true);
      setShowCongratulations(true);
      speakTTS('Perfect! You charged every orb!', 0.78);
      recordGame(xp).then(() =>
        logGameAndAward({
          type: 'tapAndHold' as any,
          correct: holdCount,
          total: TOTAL_ROUNDS,
          accuracy: (holdCount / TOTAL_ROUNDS) * 100,
          xpAwarded: xp,
          skillTags: ['finger-isolation', 'force-control', 'motor-endurance', 'proprioception'],
        }),
      ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
    } else {
      setRound((r) => r + 1);
      resetOrb(true);
    }
  }, [round, resetOrb, router]);

  const onHoldComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    holdingRef.current = false;
    if (progressTickRef.current) clearInterval(progressTickRef.current);
    setHoldPct(100);
    setPhase('success');
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    successFlash.value = withSequence(withTiming(1, { duration: 120 }), withTiming(0.4, { duration: 300 }));
    orbScale.value = withSequence(
      withSpring(1.12, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 12, stiffness: 160 }),
    );

    const newCount = successfulHolds + 1;
    setSuccessfulHolds(newCount);

    setPhase('transition');
    setTimeout(() => {
      advanceRound(newCount);
    }, ROUND_HANDOFF_MS);
  }, [successfulHolds, advanceRound, playSuccess]);

  const onPressIn = useCallback(() => {
    if (done || phase === 'success' || phase === 'transition' || holdingRef.current) return;
    holdingRef.current = true;
    setHoldPct(0);
    setPhase('holding');
    setShowEarlyToast(false);

    orbScale.value = withSpring(0.94, { damping: 16, stiffness: 260 });
    orbGlow.value = withTiming(0.85, { duration: 300 });

    cancelAnimation(progress);
    progress.value = 0;
    progress.value = withTiming(1, { duration: HOLD_TARGET_MS, easing: Easing.linear }, (finished) => {
      if (finished && holdingRef.current) runOnJS(onHoldComplete)();
    });

    // Smooth % label updates
    const tick = setInterval(() => {
      if (holdingRef.current) setHoldPct((p) => Math.min(100, p + 3));
    }, 60);
    progressTickRef.current = tick;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [done, phase, onHoldComplete]);

  const onPressOut = useCallback(() => {
    if (!holdingRef.current || completedRef.current) return;
    holdingRef.current = false;
    if (progressTickRef.current) clearInterval(progressTickRef.current);
    cancelAnimation(progress);

    const releasedEarly = progress.value < 0.98;
    if (releasedEarly) {
      progress.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.quad) });
      orbScale.value = withSpring(1, { damping: 12, stiffness: 200 });
      orbGlow.value = withTiming(0.3, { duration: 180 });
      setPhase('idle');
      setHoldPct(0);
      setShowEarlyToast(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
    }
  }, []);

  useEffect(() => {
    speakTTS('Press and hold the glowing orb for 2 seconds. Do not let go!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
    opacity: orbOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: orbGlow.value + successFlash.value * 0.5,
    transform: [{ scale: 1 + orbGlow.value * 0.15 + successFlash.value * 0.1 }],
  }));

  const pctStyle = useAnimatedStyle(() => ({
    opacity: phase === 'holding' ? 1 : 0.6,
  }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message="Orb Master!"
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }}
      />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F0A2E', '#1E1B4B', '#312E81', '#4338CA']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backButton} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Power Orb</Text>
        <Text style={styles.subtitle}>Hold steady for 2 seconds to charge</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>Round</Text>
            <Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text>
          </View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} />
            <Text style={styles.statValue}>{successfulHolds}</Text>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        <EarlyReleaseToast visible={showEarlyToast} />

        <View style={[styles.orbStage, { width: ringSize + 20, height: ringSize + 20 }]}>
          <Animated.View pointerEvents="none" style={[styles.orbAura, { width: ringSize + 40, height: ringSize + 40, backgroundColor: palette.ring }, glowStyle]} />

          <Svg width={ringSize} height={ringSize} style={styles.progressSvg}>
            <Circle cx={ringSize / 2} cy={ringSize / 2} r={radius} stroke="rgba(255,255,255,0.12)" strokeWidth={strokeW} fill="none" />
            <AnimatedCircle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke={palette.ring}
              strokeWidth={strokeW}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animatedProps={ringProps}
              rotation={-90}
              origin={`${ringSize / 2}, ${ringSize / 2}`}
            />
          </Svg>

          <Animated.View style={orbStyle}>
            <TouchableOpacity
              activeOpacity={1}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={phase === 'success' || phase === 'transition'}
              style={[styles.orbTouchable, { width: orbSize, height: orbSize, borderRadius: orbSize / 2 }]}
            >
              <LinearGradient colors={palette.core} style={[styles.orb, { width: orbSize, height: orbSize, borderRadius: orbSize / 2 }]}>
                <View style={styles.orbShine} />
                <Text style={styles.orbLabel}>
                  {phase === 'success' ? '✓' : phase === 'holding' ? 'Hold…' : 'Press & Hold'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Animated.Text style={[styles.pctLabel, pctStyle]}>
          {phase === 'holding' ? `${holdPct}%` : phase === 'success' ? 'Charged!' : 'Ready'}
        </Animated.Text>
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={palette.ring} count={14} size={8} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Keep your finger on the orb — release only when it glows green!</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1B4B' },
  backButton: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#E0E7FF', textShadowColor: 'rgba(99,102,241,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12 },
  subtitle: { fontSize: 14, color: 'rgba(199,210,254,0.85)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.35)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  orbStage: { justifyContent: 'center', alignItems: 'center' },
  orbAura: { position: 'absolute', borderRadius: 999, opacity: 0.35 },
  progressSvg: { position: 'absolute' },
  orbTouchable: { overflow: 'hidden', shadowColor: '#6366F1', shadowOpacity: 0.6, shadowRadius: 24, shadowOffset: { width: 0, height: 0 }, elevation: 16 },
  orb: { justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)' },
  orbShine: { position: 'absolute', top: '14%', left: '18%', width: '34%', height: '24%', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.45)', transform: [{ rotate: '-20deg' }] },
  orbLabel: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  pctLabel: { marginTop: 20, fontSize: 16, fontWeight: '800', color: 'rgba(199,210,254,0.9)' },
  earlyToast: { position: 'absolute', top: 20, backgroundColor: 'rgba(251,191,36,0.92)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 },
  earlyToastText: { fontSize: 15, fontWeight: '900', color: '#78350F' },
  footer: { paddingHorizontal: 24, paddingBottom: 22, alignItems: 'center' },
  footerText: { fontSize: 14, color: 'rgba(199,210,254,0.75)', textAlign: 'center', fontWeight: '600' },
});

export default TapAndHoldGame;
