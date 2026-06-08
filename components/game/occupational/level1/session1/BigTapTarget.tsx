/**
 * OT Level 1 · Session 1 · Game 1 — Big Tap Target
 * Theme: "Bubble Pop Paradise" — iridescent soap bubbles in a dreamy aqua sky.
 * UX focus: large obvious targets, breathing pulse affordance, satisfying burst feedback.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const TOTAL_TARGETS = 12;
const STAR_ICON = require('@/assets/icons/star.png');
const POP_URI = 'https://actions.google.com/sounds/v1/cartoon/pop.ogg';

/** Iridescent bubble palette — triadic harmony: teal · coral · violet */
const BUBBLE_PALETTE = [
  { main: '#2DD4BF', light: '#99F6E4', glow: '#14B8A6', accent: '#0D9488' },
  { main: '#FB7185', light: '#FECDD3', glow: '#F43F5E', accent: '#E11D48' },
  { main: '#A78BFA', light: '#DDD6FE', glow: '#8B5CF6', accent: '#7C3AED' },
  { main: '#38BDF8', light: '#BAE6FD', glow: '#0EA5E9', accent: '#0284C7' },
  { main: '#FBBF24', light: '#FDE68A', glow: '#F59E0B', accent: '#D97706' },
  { main: '#34D399', light: '#A7F3D0', glow: '#10B981', accent: '#059669' },
];

const ENCOURAGEMENTS = ['Nice pop!', 'Great tap!', 'Super!', 'Amazing!', 'You got it!', 'Wow!'];

const usePopSound = () => {
  const soundRef = useRef<ExpoAudio.Sound | null>(null);
  const ensureSound = useCallback(async () => {
    if (soundRef.current) return;
    const { sound } = await ExpoAudio.Sound.createAsync({ uri: POP_URI }, { volume: 0.4, shouldPlay: false });
    soundRef.current = sound;
  }, []);
  useEffect(() => () => { soundRef.current?.unloadAsync().catch(() => {}); }, []);
  return useCallback(async () => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && (window as any).Audio) {
        const s = new (window as any).Audio(POP_URI);
        s.volume = 0.35;
        s.play().catch(() => {});
        return;
      }
      await ensureSound();
      await soundRef.current?.replayAsync();
    } catch { /* noop */ }
  }, [ensureSound]);
};

/* ── Ambient floating mini-bubbles (decorative) ── */
function AmbientBubble({ delay, x, size, duration }: { delay: number; x: number; size: number; duration: number }) {
  const drift = useSharedValue(0);
  const sway = useSharedValue(0);
  useEffect(() => {
    drift.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true));
    sway.value = withDelay(delay, withRepeat(withTiming(1, { duration: duration * 1.3, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: 0.15 + drift.value * 0.12,
    transform: [
      { translateY: -drift.value * 40 },
      { translateX: (sway.value - 0.5) * 20 },
      { scale: 0.85 + drift.value * 0.15 },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: `${x}%`, bottom: '8%', width: size, height: size, borderRadius: size / 2,
        borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)', backgroundColor: 'rgba(255,255,255,0.08)' }, style]}
    />
  );
}

/* ── Spawn ripple ring ── */
function SpawnRipple({ trigger }: { trigger: number }) {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  useEffect(() => {
    if (trigger === 0) return;
    scale.value = 0.3;
    opacity.value = 0.7;
    scale.value = withTiming(2.2, { duration: 600, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [trigger]);
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.spawnRipple, ringStyle]} />
  );
}

/* ── Tap-hint finger bounce (first tap only) ── */
function TapHint({ visible }: { visible: boolean }) {
  const bounce = useSharedValue(0);
  const opacity = useSharedValue(0);
  useEffect(() => {
    if (!visible) { opacity.value = withTiming(0, { duration: 200 }); return; }
    opacity.value = withTiming(1, { duration: 300 });
    bounce.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 500, easing: Easing.in(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [visible]);
  const hintStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: -bounce.value * 14 }, { scale: 0.9 + bounce.value * 0.15 }],
  }));
  if (!visible) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.tapHint, hintStyle]}>
      <Text style={styles.tapHintEmoji}>👆</Text>
      <Text style={styles.tapHintText}>Tap the bubble!</Text>
    </Animated.View>
  );
}

/* ── Progress bubble trail ── */
function ProgressTrail({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.progressTrail}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < current;
        return (
          <View key={i} style={[styles.progressDot, filled && styles.progressDotFilled]}>
            {filled && <View style={styles.progressDotShine} />}
          </View>
        );
      })}
    </View>
  );
}

/* ── Encouragement toast ── */
function EncouragementToast({ text, show }: { text: string; show: boolean }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  useEffect(() => {
    if (!show) return;
    opacity.value = 0;
    scale.value = 0.8;
    opacity.value = withSequence(withTiming(1, { duration: 180 }), withDelay(900, withTiming(0, { duration: 300 })));
    scale.value = withSequence(withSpring(1.08, { damping: 8 }), withSpring(1, { damping: 12 }));
  }, [show, text]);
  const toastStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));
  if (!show) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.encouragementToast, toastStyle]}>
      <Text style={styles.encouragementText}>{text}</Text>
    </Animated.View>
  );
}

interface BigTapTargetProps {
  onBack: () => void;
  onComplete?: () => void;
}

export const BigTapTarget: React.FC<BigTapTargetProps> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const { width: screenW } = useWindowDimensions();
  const isTablet = screenW >= 768;

  const [score, setScore] = useState(0);
  const [targetsLeft, setTargetsLeft] = useState(TOTAL_TARGETS);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [bubbleIdx, setBubbleIdx] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [spawnKey, setSpawnKey] = useState(0);
  const [showTapHint, setShowTapHint] = useState(true);
  const [encouragement, setEncouragement] = useState('');
  const [showEncouragement, setShowEncouragement] = useState(false);

  const playPop = usePopSound();
  const sizePct = isTablet ? 28 : 30;

  const targetX = useSharedValue(50);
  const targetY = useSharedValue(50);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const breathe = useSharedValue(1);
  const glowPulse = useSharedValue(0.4);

  const palette = BUBBLE_PALETTE[bubbleIdx % BUBBLE_PALETTE.length];

  const spawnTarget = useCallback(() => {
    const margin = sizePct / 2 + 6;
    const x = margin + Math.random() * (100 - margin * 2);
    const y = margin + Math.random() * (100 - margin * 2);
    targetX.value = x;
    targetY.value = y;
    scale.value = 0;
    opacity.value = 0;
    scale.value = withSpring(1, { damping: 10, stiffness: 120 });
    opacity.value = withTiming(1, { duration: 250 });
    breathe.value = 1;
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.96, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.35, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    setBubbleIdx((i) => i + 1);
    setSpawnKey((k) => k + 1);
  }, []);

  const finishGame = async () => {
    const total = TOTAL_TARGETS;
    const finalScore = score + 1;
    const xp = finalScore * 15;
    const accuracy = (finalScore / total) * 100;
    const stats = { correct: finalScore, total, xp };
    setFinalStats(stats);
    setDone(true);
    setShowCongratulations(true);
    speakTTS('Amazing work! You popped all the bubbles!', 0.78);
    try {
      await logGameAndAward({
        type: 'big-tap-target',
        correct: finalScore,
        total,
        accuracy,
        xpAwarded: xp,
        skillTags: ['motor-control', 'hand-eye-coordination', 'targeting'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (error) {
      console.error('Failed to log game:', error);
    }
  };

  const handleTap = () => {
    if (done) return;
    setShowTapHint(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    playPop();
    scale.value = withSequence(
      withTiming(1.25, { duration: 70 }),
      withTiming(0, { duration: 160, easing: Easing.in(Easing.back(2)) }),
    );
    opacity.value = withTiming(0, { duration: 180 });
    setSparkleKey(Date.now());

    const newScore = score + 1;
    setScore(newScore);

    if (newScore % 3 === 0) {
      const msg = ENCOURAGEMENTS[Math.floor(newScore / 3) % ENCOURAGEMENTS.length];
      setEncouragement(msg);
      setShowEncouragement(false);
      setTimeout(() => setShowEncouragement(true), 30);
    }

    setTargetsLeft((t) => {
      const next = t - 1;
      if (next <= 0) {
        runOnJS(finishGame)();
      } else {
        setTimeout(() => spawnTarget(), 140);
      }
      return next;
    });
  };

  useEffect(() => {
    speakTTS('Tap the big bubble! Pop it to earn a star!', 0.78);
    spawnTarget();
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    width: `${sizePct}%` as any,
    height: `${sizePct}%` as any,
    borderRadius: 9999,
    left: `${targetX.value}%` as any,
    top: `${targetY.value}%` as any,
    transform: [
      { translateX: `${-(sizePct / 2)}%` as any },
      { translateY: `${-(sizePct / 2)}%` as any },
      { scale: scale.value * breathe.value },
    ],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    width: `${sizePct * 1.3}%` as any,
    height: `${sizePct * 1.3}%` as any,
    left: `${targetX.value}%` as any,
    top: `${targetY.value}%` as any,
    opacity: glowPulse.value,
    transform: [
      { translateX: `${-(sizePct * 1.3) / 2}%` as any },
      { translateY: `${-(sizePct * 1.3) / 2}%` as any },
      { scale: scale.value * breathe.value * 1.18 },
    ],
  }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message="Bubble Master!"
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack(); }}
      />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Dreamy sky background */}
      <LinearGradient colors={['#0C4A6E', '#0369A1', '#38BDF8', '#BAE6FD']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
      <LinearGradient colors={['rgba(255,255,255,0.12)', 'transparent', 'rgba(167,243,208,0.15)']} style={StyleSheet.absoluteFillObject} />

      {/* Ambient decorative bubbles */}
      <AmbientBubble delay={0} x={8} size={36} duration={4200} />
      <AmbientBubble delay={600} x={78} size={28} duration={3800} />
      <AmbientBubble delay={1200} x={42} size={22} duration={5100} />
      <AmbientBubble delay={400} x={88} size={18} duration={4500} />
      <AmbientBubble delay={900} x={22} size={44} duration={5500} />

      {/* Back button — glass pill */}
      <TouchableOpacity
        onPress={() => { stopAllSpeech(); cleanupSounds(); onBack(); }}
        style={styles.backButton}
        activeOpacity={0.85}
      >
        <View style={styles.backButtonInner}>
          <Text style={styles.backButtonText}>← Back</Text>
        </View>
      </TouchableOpacity>

      {/* HUD */}
      <View style={styles.hud}>
        <View style={styles.hudPill}>
          <LinearGradient colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.08)']} style={styles.hudPillGradient}>
            <View style={styles.hudRow}>
              <Image source={STAR_ICON} style={styles.starIcon} />
              <Text style={styles.hudLabel}>Stars</Text>
            </View>
            <Text style={styles.hudValue}>{score}</Text>
          </LinearGradient>
        </View>
        <View style={styles.hudPill}>
          <LinearGradient colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.08)']} style={styles.hudPillGradient}>
            <Text style={styles.hudLabel}>Left</Text>
            <Text style={styles.hudValue}>{targetsLeft}</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Play area — glass meadow card */}
      <View style={styles.playArea}>
        <LinearGradient colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.06)', 'rgba(167,243,208,0.12)']} style={StyleSheet.absoluteFillObject} />

        <View style={styles.instructionWrap}>
          <Text style={styles.instructionTitle}>Pop the Big Bubble</Text>
          <Text style={styles.instructionSubtitle}>Tap it before it floats away!</Text>
        </View>

        <EncouragementToast text={encouragement} show={showEncouragement} />

        {/* Target bubble */}
        <Animated.View
          pointerEvents="none"
          style={[styles.glowRing, { backgroundColor: palette.glow }, glowStyle]}
        />
        <Animated.View style={[styles.circle, circleStyle]}>
          <TouchableOpacity style={styles.hitArea} activeOpacity={0.85} onPress={handleTap}>
            <LinearGradient colors={[palette.light, palette.main, palette.accent]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.circleFill}>
              <View style={styles.bubbleHighlightLarge} />
              <View style={styles.bubbleHighlightSmall} />
              <View style={styles.bubbleShimmer} />
            </LinearGradient>
          </TouchableOpacity>
          <SpawnRipple trigger={spawnKey} />
        </Animated.View>

        <TapHint visible={showTapHint && score === 0} />
        <SparkleBurst key={sparkleKey} visible color={palette.main} count={18} size={9} />

        <ProgressTrail current={score} total={TOTAL_TARGETS} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0369A1' },
  backButton: {
    position: 'absolute', top: 50, left: 16, zIndex: 10,
    borderRadius: 24, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  backButtonInner: {
    paddingHorizontal: 18, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 24,
  },
  backButtonText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.3 },
  hud: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 68, paddingHorizontal: 16 },
  hudPill: { borderRadius: 20, overflow: 'hidden', minWidth: 110, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  hudPillGradient: { paddingVertical: 10, paddingHorizontal: 18, alignItems: 'center', borderRadius: 20 },
  hudRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  hudLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  hudValue: { fontSize: 26, fontWeight: '900', color: '#fff', marginTop: 2, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  starIcon: { width: 16, height: 16, resizeMode: 'contain' },
  playArea: {
    flex: 1, marginTop: 14, marginHorizontal: 14, marginBottom: 12,
    borderRadius: 32, overflow: 'hidden',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#0284C7', shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 10,
  },
  instructionWrap: { alignItems: 'center', paddingTop: 20, paddingHorizontal: 20 },
  instructionTitle: {
    fontSize: 24, fontWeight: '900', color: '#fff',
    letterSpacing: 0.3, textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
  },
  instructionSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: '600' },
  circle: { position: 'absolute' },
  glowRing: { position: 'absolute', borderRadius: 9999 },
  hitArea: {
    flex: 1, borderRadius: 9999, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 14,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.45)',
  },
  circleFill: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bubbleHighlightLarge: {
    position: 'absolute', top: '12%', left: '18%', width: '38%', height: '28%',
    borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.55)',
    transform: [{ rotate: '-25deg' }],
  },
  bubbleHighlightSmall: {
    position: 'absolute', bottom: '22%', right: '20%', width: '14%', height: '10%',
    borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.35)',
  },
  bubbleShimmer: {
    position: 'absolute', top: '35%', right: '28%', width: '8%', height: '8%',
    borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.7)',
  },
  spawnRipple: {
    position: 'absolute', alignSelf: 'center', top: '50%', left: '50%',
    width: 80, height: 80, marginLeft: -40, marginTop: -40,
    borderRadius: 40, borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)',
  },
  tapHint: { position: 'absolute', alignSelf: 'center', bottom: '28%', alignItems: 'center' },
  tapHintEmoji: { fontSize: 36 },
  tapHintText: { color: '#fff', fontWeight: '800', fontSize: 16, marginTop: 4, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  encouragementToast: {
    position: 'absolute', top: 80, alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 22, paddingVertical: 10,
    borderRadius: 999, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  encouragementText: { fontSize: 18, fontWeight: '900', color: '#0369A1' },
  progressTrail: {
    position: 'absolute', bottom: 16, alignSelf: 'center',
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 5, maxWidth: '90%',
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 999,
  },
  progressDot: {
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressDotFilled: { backgroundColor: '#FBBF24', borderColor: '#FDE68A' },
  progressDotShine: {
    position: 'absolute', top: 2, left: 3, width: 5, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.6)',
  },
});
