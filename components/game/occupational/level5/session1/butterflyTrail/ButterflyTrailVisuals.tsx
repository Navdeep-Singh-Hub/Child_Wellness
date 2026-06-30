/** Butterfly Trail — enchanted meadow visual layer */
import { BUTTERFLY_TRAIL_THEME as T, MEADOW } from '@/components/game/occupational/level5/session1/butterflyTrail/butterflyTrailTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const FLOWERS = [
  { x: '8%', y: '72%', e: '🌸', s: 16 },
  { x: '22%', y: '82%', e: '🌼', s: 14 },
  { x: '38%', y: '76%', e: '🌷', s: 15 },
  { x: '55%', y: '84%', e: '🌸', s: 13 },
  { x: '70%', y: '74%', e: '🌼', s: 16 },
  { x: '86%', y: '80%', e: '🌷', s: 14 },
  { x: '14%', y: '58%', e: '🌿', s: 12 },
  { x: '88%', y: '55%', e: '🌿', s: 12 },
] as const;

const POLLEN = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${8 + (i * 6.5) % 84}%`,
  top: `${12 + ((i * 11) % 55)}%`,
  delay: i * 180,
  size: 4 + (i % 3),
}));

export function MeadowBackdrop() {
  const sway = useSharedValue(0);
  useEffect(() => {
    sway.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [sway]);

  const hillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(sway.value, [0, 1], [-4, 4]) }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.sunGlow} />
      <Text style={styles.cloudA}>☁️</Text>
      <Text style={styles.cloudB}>☁️</Text>
      <Animated.View style={[styles.hillBack, hillStyle]}>
        <LinearGradient colors={['#4ADE80', MEADOW.hillDark]} style={StyleSheet.absoluteFillObject} />
      </Animated.View>
      <View style={styles.hillFront}>
        <LinearGradient colors={[...MEADOW.grass]} style={StyleSheet.absoluteFillObject} />
      </View>
      {FLOWERS.map((f) => (
        <Text key={`${f.x}-${f.y}`} style={[styles.flower, { left: f.x, top: f.y, fontSize: f.s }]}>
          {f.e}
        </Text>
      ))}
      {POLLEN.map((p) => (
        <PollenMote key={p.id} left={p.left} top={p.top} delay={p.delay} size={p.size} />
      ))}
    </View>
  );
}

function PollenMote({ left, top, delay, size }: { left: string; top: string; delay: number; size: number }) {
  const drift = useSharedValue(0);
  useEffect(() => {
    const t = setTimeout(() => {
      drift.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2600 + delay, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2600 + delay, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    }, delay);
    return () => clearTimeout(t);
  }, [delay, drift]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(drift.value, [0, 0.5, 1], [0.25, 0.75, 0.25]),
    transform: [
      { translateY: interpolate(drift.value, [0, 1], [0, -18]) },
      { translateX: interpolate(drift.value, [0, 1], [0, 8]) },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.pollen,
        { left, top, width: size, height: size, borderRadius: size / 2, backgroundColor: T.accent },
        style,
      ]}
    />
  );
}

export function OrbitGuide({ cx, cy, radius }: { cx: number; cy: number; radius: number }) {
  if (radius <= 0) return null;
  const size = radius * 2;
  return (
    <View
      pointerEvents="none"
      style={[
        styles.orbit,
        {
          left: cx - radius,
          top: cy - radius,
          width: size,
          height: size,
          borderRadius: radius,
          borderColor: MEADOW.orbitStroke,
        },
      ]}
    />
  );
}

export function AnimatedButterfly({ style }: { style: object }) {
  const flap = useSharedValue(0);
  useEffect(() => {
    flap.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 320, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 320, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [flap]);

  const leftWing = useAnimatedStyle(() => ({
    transform: [{ scaleX: interpolate(flap.value, [0, 1], [1, 0.72]) }, { rotate: '-18deg' }],
  }));
  const rightWing = useAnimatedStyle(() => ({
    transform: [{ scaleX: interpolate(flap.value, [0, 1], [1, 0.72]) }, { rotate: '18deg' }],
  }));
  const bodyBob = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(flap.value, [0, 1], [0, -3]) }],
  }));

  return (
    <Animated.View style={[styles.butterflyWrap, style]} pointerEvents="none">
      <View style={styles.butterflyAura} />
      <Animated.View style={[styles.wingRow, bodyBob]}>
        <Animated.View style={[styles.wing, styles.wingLeft, leftWing]}>
          <LinearGradient colors={[MEADOW.butterflyWingTip, MEADOW.butterflyWing]} style={styles.wingGrad} />
        </Animated.View>
        <View style={styles.body}>
          <Text style={styles.butterflyEmoji}>🦋</Text>
        </View>
        <Animated.View style={[styles.wing, styles.wingRight, rightWing]}>
          <LinearGradient colors={[MEADOW.butterflyWing, MEADOW.butterflyWingTip]} style={styles.wingGrad} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

export function FingerCursor({ style, active }: { style: object; active: boolean }) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(active ? 1.15 : 1.05, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [active, pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: active ? 0.85 : 0.45,
  }));

  return (
    <Animated.View style={[styles.fingerWrap, style]} pointerEvents="none">
      <Animated.View style={[styles.fingerRing, ringStyle]} />
      <View style={styles.fingerCore} />
    </Animated.View>
  );
}

export function FollowTether({ x1, y1, x2, y2, visible }: { x1: number; y1: number; x2: number; y2: number; visible: boolean }) {
  if (!visible) return null;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length < 8) return null;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <View
      pointerEvents="none"
      style={[styles.tether, { left: x1, top: y1, width: length, transform: [{ rotate: `${angle}deg` }] }]}
    />
  );
}

export function NectarProgress({ progress }: { progress: number }) {
  return (
    <View style={styles.nectarWrap}>
      <Text style={styles.nectarLabel}>🍯 Nectar {progress}%</Text>
      <View style={styles.nectarTrack}>
        <LinearGradient
          colors={['#FDE68A', '#FBBF24', '#F59E0B']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.nectarFill, { width: `${progress}%` }]}
        />
      </View>
    </View>
  );
}

export function TrailToast({ text, visible }: { text: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <View style={styles.toast} pointerEvents="none">
      <LinearGradient colors={['rgba(255,255,255,0.95)', 'rgba(254,243,199,0.92)']} style={styles.toastGrad}>
        <Text style={styles.toastText}>{text}</Text>
      </LinearGradient>
    </View>
  );
}

export function MeadowIntroBackdrop() {
  return (
    <>
      <MeadowBackdrop />
      <View style={styles.introVignette} />
    </>
  );
}

const styles = StyleSheet.create({
  sunGlow: {
    position: 'absolute',
    top: '6%',
    right: '10%',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(254,240,138,0.45)',
  },
  cloudA: { position: 'absolute', top: '12%', left: '8%', fontSize: 34, opacity: 0.85 },
  cloudB: { position: 'absolute', top: '18%', right: '22%', fontSize: 26, opacity: 0.65 },
  hillBack: {
    position: 'absolute',
    bottom: '18%',
    left: '-8%',
    right: '-8%',
    height: '38%',
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
    overflow: 'hidden',
    opacity: 0.85,
  },
  hillFront: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '28%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  flower: { position: 'absolute' },
  pollen: { position: 'absolute' },
  orbit: { position: 'absolute', borderWidth: 2, borderStyle: 'dashed' },
  butterflyWrap: { position: 'absolute', width: 72, height: 72, alignItems: 'center', justifyContent: 'center', zIndex: 12 },
  butterflyAura: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
    backgroundColor: 'rgba(251,191,36,0.18)',
    transform: [{ scale: 1.25 }],
  },
  wingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  wing: { width: 22, height: 30, borderRadius: 16, overflow: 'hidden' },
  wingLeft: { marginRight: -6 },
  wingRight: { marginLeft: -6 },
  wingGrad: { flex: 1 },
  body: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: MEADOW.butterflyBody,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    zIndex: 2,
  },
  butterflyEmoji: { fontSize: 18 },
  fingerWrap: { position: 'absolute', width: 44, height: 44, alignItems: 'center', justifyContent: 'center', zIndex: 14 },
  fingerRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: MEADOW.fingerGlow,
    backgroundColor: 'rgba(251,191,36,0.12)',
  },
  fingerCore: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: MEADOW.fingerCore,
    borderWidth: 2,
    borderColor: '#fff',
  },
  tether: {
    position: 'absolute',
    height: 3,
    backgroundColor: MEADOW.tether,
    borderRadius: 2,
    transformOrigin: 'left center',
    zIndex: 8,
  },
  nectarWrap: { marginTop: 8, width: '100%' },
  nectarLabel: { fontSize: 10, fontWeight: '800', color: T.subtitle, marginBottom: 4, textAlign: 'center', letterSpacing: 0.4 },
  nectarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.45)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.35)',
  },
  nectarFill: { height: '100%', borderRadius: 5 },
  toast: { position: 'absolute', top: '38%', alignSelf: 'center', left: 0, right: 0, alignItems: 'center', zIndex: 25 },
  toastGrad: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(251,191,36,0.45)' },
  toastText: { fontSize: 16, fontWeight: '900', color: T.title },
  introVignette: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,83,45,0.08)' },
});
