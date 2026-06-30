/**
 * Visual layer for Color Hunt — prism lab, rainbow orbs, target swatch.
 */
import {
  COLOR_HUNT_COLORS,
  COLOR_HUNT_COPY as COPY,
  COLOR_HUNT_THEME as T,
} from '@/components/game/occupational/level5/session4/colorHunt/colorHuntTheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export type RippleData = { id: number; x: number; y: number };

// ─── Intro ──────────────────────────────────────────────────────────────────

type InfoProps = { onStart: () => void; onBack: () => void };

function IntroPrism() {
  const refract = useSharedValue(0);
  useEffect(() => {
    refract.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [refract]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(refract.value, [0, 1], [-6, 6])}deg` }],
  }));

  return (
    <Animated.View style={[styles.introPrismWrap, style]}>
      <LinearGradient colors={['#F472B6', '#A78BFA', '#60A5FA', '#34D399']} style={styles.introPrism} />
      <View style={styles.introOrbs}>
        {['🔴', '🔵', '🟢'].map((e) => (
          <Text key={e} style={styles.introOrbEmoji}>
            {e}
          </Text>
        ))}
      </View>
    </Animated.View>
  );
}

export function ColorHuntInfoScreen({ onStart, onBack }: InfoProps) {
  const cardOp = useSharedValue(0);
  const cardY = useSharedValue(36);

  useEffect(() => {
    cardOp.value = withTiming(1, { duration: 550 });
    cardY.value = withSpring(0, { damping: 15, stiffness: 110 });
  }, [cardOp, cardY]);

  const cardAnim = useAnimatedStyle(() => ({
    opacity: cardOp.value,
    transform: [{ translateY: cardY.value }],
  }));

  return (
    <View style={styles.infoRoot}>
      <LinearGradient colors={[...T.lab]} locations={[0, 0.4, 0.8, 1]} style={StyleSheet.absoluteFillObject} />
      <PrismBackdrop />
      <IntroPrism />

      <Animated.View style={[styles.infoCard, cardAnim]}>
        <Text style={styles.infoEmoji}>{COPY.emoji}</Text>
        <Text style={styles.infoTitle}>{COPY.title}</Text>
        <Text style={styles.infoTagline}>{COPY.subtitle}</Text>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionLabel}>How to play</Text>
          <Text style={styles.infoBody}>{COPY.introDescription}</Text>
        </View>

        <View style={styles.stepRow}>
          {['🎨 Target', '👆 Tap All', '🎯 Clear'].map((step) => (
            <View key={step} style={styles.stepChip}>
              <Text style={styles.stepChipText}>{step}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={['#F9A8D4', '#EC4899', '#DB2777', '#BE185D']} style={styles.startBtnGrad}>
            <Text style={styles.startBtnText}>🎨 Enter Lab</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoBackBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.infoBackText}>← Back to games</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── Backdrop ───────────────────────────────────────────────────────────────

export function PrismBackdrop() {
  const shimmer = useSharedValue(0);
  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.linear }), -1, false);
  }, [shimmer]);

  const beamStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + shimmer.value * 0.3,
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-20, 20]) }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.lab]} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFillObject} />
      <Animated.View style={[styles.beamPink, beamStyle]} />
      <View style={styles.beamPurple} />
      <View style={styles.beamBlue} />
      <View style={styles.beamGreen} />
      <View style={styles.prismBase} />
      <LabParticles count={16} />
    </View>
  );
}

function LabParticles({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Particle key={i} index={i} />
      ))}
    </>
  );
}

function Particle({ index }: { index: number }) {
  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = withDelay(
      index * 120,
      withRepeat(withTiming(1, { duration: 2500 + index * 150 }), -1, true),
    );
  }, [drift, index]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: `${(index * 17) % 90 + 5}%`,
    top: `${(index * 23) % 80 + 10}%`,
    width: 4 + (index % 3),
    height: 4 + (index % 3),
    borderRadius: 4,
    backgroundColor: index % 2 === 0 ? T.prism : '#A78BFA',
    opacity: 0.2 + drift.value * 0.4,
    transform: [{ translateY: -drift.value * 12 }],
  }));

  return <Animated.View style={style} />;
}

// ─── Color orbs ─────────────────────────────────────────────────────────────

export function ColorOrb({
  x,
  y,
  size,
  colorIndex,
  isTarget,
  onPress,
}: {
  x: number;
  y: number;
  size: number;
  colorIndex: number;
  isTarget: boolean;
  onPress: () => void;
}) {
  const color = COLOR_HUNT_COLORS[colorIndex]!;
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!isTarget) return;
    pulse.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, [isTarget, pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: isTarget ? 0.4 + pulse.value * 0.4 : 0,
    transform: [{ scale: 1 + pulse.value * 0.15 }],
  }));

  return (
    <Pressable
      onPress={onPress}
      style={[styles.orbHit, { left: x - size / 2, top: y - size / 2, width: size, height: size }]}
    >
      {isTarget && (
        <Animated.View
          style={[
            styles.targetRing,
            { width: size + 10, height: size + 10, borderRadius: (size + 10) / 2, top: -5, left: -5 },
            ringStyle,
          ]}
        />
      )}
      <View
        style={[
          styles.orb,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color.color,
            borderColor: isTarget ? T.targetRing : T.orbBorder,
            borderWidth: isTarget ? 3 : 2,
          },
        ]}
      >
        <Text style={{ fontSize: size * 0.4 }}>{color.emoji}</Text>
      </View>
    </Pressable>
  );
}

export function TargetSwatch({ colorIndex }: { colorIndex: number }) {
  const color = COLOR_HUNT_COLORS[colorIndex]!;
  const glow = useSharedValue(0);
  useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 1400 }), -1, true);
  }, [glow]);

  const style = useAnimatedStyle(() => ({
    shadowOpacity: 0.2 + glow.value * 0.3,
    transform: [{ scale: 0.98 + glow.value * 0.04 }],
  }));

  return (
    <Animated.View style={[styles.swatch, { backgroundColor: color.color, borderColor: T.swatchBorder }, style]}>
      <Text style={styles.swatchEmoji}>{color.emoji}</Text>
      <Text style={styles.swatchLabel}>{color.name}</Text>
    </Animated.View>
  );
}

// ─── FX ─────────────────────────────────────────────────────────────────────

export function RoundClearCelebration({ visible }: { visible: boolean }) {
  const burst = useSharedValue(0);
  useEffect(() => {
    if (!visible) return;
    burst.value = withSpring(1, { damping: 8, stiffness: 160 });
  }, [visible, burst]);

  if (!visible) return null;

  const style = useAnimatedStyle(() => ({
    opacity: burst.value,
    transform: [{ scale: interpolate(burst.value, [0, 1], [0.5, 1]) }],
  }));

  return (
    <Animated.View style={[styles.clearBanner, style]} pointerEvents="none">
      <LinearGradient colors={['#D1FAE5', '#6EE7B7', '#34D399']} style={styles.clearGrad}>
        <Text style={styles.clearText}>🎨 Round Clear!</Text>
      </LinearGradient>
    </Animated.View>
  );
}

function WrongRipple({ x, y }: { x: number; y: number }) {
  const expand = useSharedValue(0);
  useEffect(() => {
    expand.value = withTiming(1, { duration: 500 });
  }, [expand]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x - 26,
    top: y - 26,
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: T.wrongGlow,
    backgroundColor: T.wrong,
    opacity: 0.35 * (1 - expand.value),
    transform: [{ scale: 0.4 + expand.value * 1.5 }],
  }));

  return <Animated.View style={style} pointerEvents="none" />;
}

export function WrongColorRipple({ ripples }: { ripples: RippleData[] }) {
  return (
    <>
      {ripples.map((r) => (
        <WrongRipple key={r.id} x={r.x} y={r.y} />
      ))}
    </>
  );
}

// ─── HUD ────────────────────────────────────────────────────────────────────

type HudProps = {
  round: number;
  totalRounds: number;
  score: number;
  hint: string;
  targetColorIndex: number | null;
};

export function ColorHuntHUD({ round, totalRounds, score, hint, targetColorIndex }: HudProps) {
  const scorePop = useSharedValue(1);
  const prevScore = useRef(score);

  useEffect(() => {
    if (score > prevScore.current) {
      scorePop.value = withSequence(
        withSpring(1.35, { damping: 6, stiffness: 280 }),
        withSpring(1, { damping: 10, stiffness: 200 }),
      );
    }
    prevScore.current = score;
  }, [score, scorePop]);

  const scoreBump = useAnimatedStyle(() => ({ transform: [{ scale: scorePop.value }] }));
  const Glass = Platform.OS === 'ios' ? BlurView : View;
  const glassProps = Platform.OS === 'ios' ? { intensity: 40, tint: 'light' as const } : {};

  return (
    <View style={styles.hudWrap} pointerEvents="none">
      <Glass {...glassProps} style={styles.hudGlass}>
        <View style={styles.hudRow}>
          <View>
            <Text style={styles.hudLabel}>ROUND</Text>
            <Text style={styles.hudRound}>
              {round}
              <Text style={styles.hudRoundTotal}>/{totalRounds}</Text>
            </Text>
          </View>
          <View style={styles.hudCenter}>
            <Text style={styles.hudTitle}>🎨 Color Hunt</Text>
            {targetColorIndex !== null && <TargetSwatch colorIndex={targetColorIndex} />}
          </View>
          <Animated.View style={[styles.scoreBox, scoreBump]}>
            <Text style={styles.scoreLabel}>CLEARED</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </Animated.View>
        </View>
        <View style={styles.hintPill}>
          <Text style={styles.hudHint}>{hint}</Text>
        </View>
      </Glass>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  infoRoot: { flex: 1 },
  introPrismWrap: { position: 'absolute', top: '16%', alignSelf: 'center', alignItems: 'center', zIndex: 2 },
  introPrism: { width: 60, height: 80, borderRadius: 8, marginBottom: 20 },
  introOrbs: { flexDirection: 'row', gap: 12 },
  introOrbEmoji: { fontSize: 28 },
  infoCard: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 28,
    backgroundColor: T.hudGlass,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1.5,
    borderColor: T.hudBorder,
    alignItems: 'center',
    shadowColor: T.prismDark,
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  infoEmoji: { fontSize: 44, marginBottom: 2 },
  infoTitle: { fontSize: 32, fontWeight: '900', color: T.title, letterSpacing: -0.5 },
  infoTagline: { fontSize: 11, fontWeight: '700', color: T.subtitle, textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 14 },
  infoSection: { width: '100%', marginBottom: 12 },
  infoSectionLabel: { fontSize: 11, fontWeight: '800', color: T.accent, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.8 },
  infoBody: { fontSize: 15, lineHeight: 23, color: '#6D28D9', fontWeight: '500' },
  stepRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  stepChip: { backgroundColor: 'rgba(236,72,153,0.1)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(236,72,153,0.25)' },
  stepChipText: { fontSize: 13, fontWeight: '700', color: T.subtitle },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8, shadowColor: T.prismDark, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  startBtnGrad: { paddingVertical: 17, alignItems: 'center' },
  startBtnText: { fontSize: 18, fontWeight: '900', color: '#FFF', letterSpacing: 0.3 },
  infoBackBtn: { paddingVertical: 8 },
  infoBackText: { fontSize: 14, fontWeight: '700', color: T.subtitle },

  beamPink: { position: 'absolute', top: '5%', left: '10%', width: '35%', height: '70%', backgroundColor: T.beamPink, transform: [{ skewX: '-15deg' }] },
  beamPurple: { position: 'absolute', top: '10%', right: '15%', width: '30%', height: '60%', backgroundColor: T.beam },
  beamBlue: { position: 'absolute', bottom: '20%', left: '20%', width: '25%', height: '40%', backgroundColor: T.beamBlue },
  beamGreen: { position: 'absolute', bottom: '15%', right: '10%', width: '28%', height: '45%', backgroundColor: T.beamGreen },
  prismBase: {
    position: 'absolute',
    bottom: '12%',
    alignSelf: 'center',
    width: 80,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(139,92,246,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
  },

  orbHit: { position: 'absolute', zIndex: 10 },
  targetRing: { position: 'absolute', borderWidth: 2.5, borderColor: T.targetGlow, borderStyle: 'dashed' },
  orb: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: T.orbShadow,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },

  swatch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 2,
    gap: 5,
    shadowColor: T.prism,
    shadowRadius: 8,
    elevation: 4,
  },
  swatchEmoji: { fontSize: 14 },
  swatchLabel: { fontSize: 11, fontWeight: '900', color: '#FFF', textTransform: 'uppercase', letterSpacing: 0.5 },

  clearBanner: { position: 'absolute', top: '44%', alignSelf: 'center', zIndex: 20, borderRadius: 16, overflow: 'hidden' },
  clearGrad: { paddingHorizontal: 24, paddingVertical: 10 },
  clearText: { fontSize: 16, fontWeight: '900', color: '#064E3B' },

  hudWrap: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 4, zIndex: 40 },
  hudGlass: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: T.hudBorder,
    backgroundColor: Platform.OS === 'android' ? T.hudGlass : 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  hudRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hudLabel: { fontSize: 9, fontWeight: '800', color: T.accent, letterSpacing: 1.2 },
  hudRound: { fontSize: 22, fontWeight: '900', color: T.title },
  hudRoundTotal: { fontSize: 14, fontWeight: '700', color: T.subtitle },
  hudCenter: { alignItems: 'center', flex: 1, marginHorizontal: 6 },
  hudTitle: { fontSize: 12, fontWeight: '800', color: T.title, marginBottom: 4 },
  scoreBox: { alignItems: 'flex-end' },
  scoreLabel: { fontSize: 9, fontWeight: '800', color: T.subtitle, letterSpacing: 1.2 },
  scoreValue: { fontSize: 22, fontWeight: '900', color: T.accent },
  hintPill: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(236,72,153,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.2)',
  },
  hudHint: { fontSize: 12, fontWeight: '700', color: T.subtitle, textAlign: 'center' },
});
