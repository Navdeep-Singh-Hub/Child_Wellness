/** Zigzag Run — neon wave circuit visuals */
import { CIRCUIT, ZIGZAG_RUN_COPY as COPY, ZIGZAG_RUN_THEME as T } from '@/components/game/occupational/level5/session1/zigzagRun/zigzagRunTheme';
import { SESSION5_1_PACING as P } from '@/components/game/occupational/level5/session1/session1Pacing';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo } from 'react';
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
import Svg, { Path } from 'react-native-svg';

const HALF = P.targetHalfPx;

function buildZigzagPath(width: number, height: number): string {
  if (width <= 0 || height <= 0) return '';
  const pad = HALF + 8;
  const cy = height * 0.5;
  const amp = P.zigzagAmplitudePx;
  const freq = P.zigzagFrequency;
  const step = 8;
  let d = '';
  for (let x = pad; x <= width - pad; x += step) {
    const y = cy + Math.sin(x * freq) * amp;
    d += x === pad ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return d;
}

export function CircuitBackdrop() {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const horizonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.35, 0.65]),
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      {Array.from({ length: 10 }).map((_, i) => (
        <View
          key={`g-${i}`}
          style={[
            styles.gridLine,
            {
              bottom: `${8 + i * 7}%`,
              backgroundColor: CIRCUIT.gridLine,
              transform: [{ perspective: 400 }, { rotateX: '58deg' }],
            },
          ]}
        />
      ))}
      <Animated.View style={[styles.horizon, horizonStyle]} />
      <Text style={styles.circuitLabel}>NEON CIRCUIT</Text>
    </View>
  );
}

export function ZigzagPathGuide({ width, height }: { width: number; height: number }) {
  const path = useMemo(() => buildZigzagPath(width, height), [width, height]);
  if (!path) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Path d={path} stroke={CIRCUIT.pathShadow} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.45} />
        <Path d={path} stroke={CIRCUIT.pathGlow} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.55} />
        <Path d={path} stroke={CIRCUIT.pathCore} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.9} />
      </Svg>
    </View>
  );
}

export function CircuitIntroBackdrop() {
  return (
    <>
      <CircuitBackdrop />
      <View style={styles.introVeil} />
    </>
  );
}

export function NeonRunner({ x, y, size, scaleStyle }: { x: number; y: number; size: number; scaleStyle: object }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 550, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 550, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.16]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.5, 0.95]),
  }));

  const half = size / 2;
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.runnerWrap, { left: x - half, top: y - half, width: size, height: size }, scaleStyle]}
    >
      <Animated.View style={[styles.runnerRing, { width: size + 18, height: size + 18, borderRadius: (size + 18) / 2 }, ringStyle]} />
      <LinearGradient colors={['#F0ABFC', CIRCUIT.runnerCore, '#C026D3']} style={[styles.runnerBody, { width: size, height: size, borderRadius: half }]}>
        <Text style={styles.runnerEmoji}>🔮</Text>
        <View style={styles.runnerBadge}>
          <Text style={styles.runnerBadgeText}>TAP</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

export function RunToast({ text, visible }: { text: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <View style={styles.toastWrap} pointerEvents="none">
      <LinearGradient colors={['rgba(255,255,255,0.95)', 'rgba(224,242,254,0.92)']} style={styles.toastGrad}>
        <Text style={styles.toastText}>{text}</Text>
      </LinearGradient>
    </View>
  );
}

export function PathHint() {
  return (
    <View style={styles.pathHint} pointerEvents="none">
      <Text style={styles.pathHintText}>Follow the neon wave · Tap the runner</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gridLine: { position: 'absolute', left: '-10%', right: '-10%', height: 1 },
  horizon: {
    position: 'absolute',
    bottom: '14%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: CIRCUIT.horizon,
    shadowColor: '#EC4899',
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  circuitLabel: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2.5,
    color: 'rgba(34,211,238,0.4)',
  },
  introVeil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,1,24,0.12)' },
  runnerWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  runnerRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: CIRCUIT.runnerRing,
    backgroundColor: 'rgba(236,72,153,0.08)',
  },
  runnerBody: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: CIRCUIT.runnerCore,
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 10,
  },
  runnerEmoji: { fontSize: 28 },
  runnerBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: CIRCUIT.runnerBadge,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  runnerBadgeText: { fontSize: 7, fontWeight: '900', color: '#FAE8FF', letterSpacing: 0.8 },
  toastWrap: { position: 'absolute', top: '36%', alignSelf: 'center', left: 0, right: 0, alignItems: 'center', zIndex: 25 },
  toastGrad: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.4)',
  },
  toastText: { fontSize: 15, fontWeight: '900', color: COPY.rootBg },
  pathHint: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 4,
  },
  pathHintText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(196,181,253,0.75)',
    letterSpacing: 0.6,
    backgroundColor: 'rgba(10,1,24,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.2)',
  },
});
