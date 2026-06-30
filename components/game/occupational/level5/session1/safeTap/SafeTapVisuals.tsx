/** Safe Tap — Clearance Zone visual layer */
import { SAFE_TAP_COPY as COPY, SAFE_TAP_THEME as T, ZONE } from '@/components/game/occupational/level5/session1/safeTap/safeTapTheme';
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

const GRID_LINES = 8;

export function ClearanceBackdrop() {
  const scan = useSharedValue(0);
  useEffect(() => {
    scan.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.linear }),
      -1,
      false,
    );
  }, [scan]);

  const scanStyle = useAnimatedStyle(() => ({
    top: `${interpolate(scan.value, [0, 1], [8, 88])}%`,
    opacity: interpolate(scan.value, [0, 0.5, 1], [0.15, 0.55, 0.15]),
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      {Array.from({ length: GRID_LINES }).map((_, i) => (
        <View
          key={`h-${i}`}
          style={[styles.gridH, { top: `${(i + 1) * (100 / (GRID_LINES + 1))}%`, backgroundColor: ZONE.gridLine }]}
        />
      ))}
      {Array.from({ length: GRID_LINES }).map((_, i) => (
        <View
          key={`v-${i}`}
          style={[styles.gridV, { left: `${(i + 1) * (100 / (GRID_LINES + 1))}%`, backgroundColor: ZONE.gridLine }]}
        />
      ))}
      <Animated.View style={[styles.scanLine, scanStyle]} />
      <View style={[styles.cautionCorner, styles.cautionTL]} />
      <View style={[styles.cautionCorner, styles.cautionTR]} />
      <View style={[styles.cautionCorner, styles.cautionBL]} />
      <View style={[styles.cautionCorner, styles.cautionBR]} />
      <Text style={styles.zoneLabel}>CLEARANCE ZONE</Text>
    </View>
  );
}

export function ClearanceIntroBackdrop() {
  return (
    <>
      <ClearanceBackdrop />
      <View style={styles.introGlow} />
    </>
  );
}

export function SafeShieldTarget({
  x,
  y,
  size,
  scaleStyle,
}: {
  x: number;
  y: number;
  size: number;
  scaleStyle: object;
}) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.18]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.45, 0.85]),
  }));

  const half = size / 2;
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.entityWrap, { left: x - half, top: y - half, width: size, height: size }, scaleStyle]}
    >
      <Animated.View style={[styles.safeRing, { width: size + 16, height: size + 16, borderRadius: (size + 16) / 2 }, ringStyle]} />
      <LinearGradient colors={['#6EE7B7', ZONE.safeCore, '#047857']} style={[styles.safeBody, { width: size, height: size, borderRadius: half }]}>
        <Text style={styles.safeEmoji}>🛡️</Text>
        <View style={styles.safeBadge}>
          <Text style={styles.safeBadgeText}>SAFE</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

export function DangerMine({
  x,
  y,
  size,
  flashing,
}: {
  x: number;
  y: number;
  size: number;
  flashing: boolean;
}) {
  const tick = useSharedValue(0);
  useEffect(() => {
    tick.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 550, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 550, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [tick]);

  const warnStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tick.value, [0, 1], [0.35, 0.9]),
    transform: [{ scale: flashing ? 1.25 : interpolate(tick.value, [0, 1], [1, 1.08]) }],
  }));

  const half = size / 2;
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.entityWrap, warnStyle, { left: x - half, top: y - half, width: size, height: size }]}
    >
      <View style={[styles.dangerRing, { width: size + 12, height: size + 12, borderRadius: (size + 12) / 2 }]} />
      <LinearGradient colors={['#FCA5A5', ZONE.dangerCore, '#7F1D1D']} style={[styles.dangerBody, { width: size, height: size, borderRadius: half }]}>
        <Text style={styles.dangerEmoji}>💣</Text>
        <View style={styles.dangerBadge}>
          <Text style={styles.dangerBadgeText}>!</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

export function DangerFlashOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return <View style={styles.dangerFlash} pointerEvents="none" />;
}

export function MissionToast({ text, visible, danger }: { text: string; visible: boolean; danger?: boolean }) {
  if (!visible) return null;
  return (
    <View style={styles.toastWrap} pointerEvents="none">
      <LinearGradient
        colors={danger ? [...COPY.dangerGradient] : ['rgba(255,255,255,0.95)', 'rgba(209,250,229,0.92)']}
        style={[styles.toastGrad, danger && styles.toastDanger]}
      >
        <Text style={[styles.toastText, danger && styles.toastTextDanger]}>{text}</Text>
      </LinearGradient>
    </View>
  );
}

export function LegendBar() {
  return (
    <View style={styles.legend} pointerEvents="none">
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: ZONE.safeGlow }]} />
        <Text style={styles.legendText}>Tap</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: ZONE.dangerGlow }]} />
        <Text style={styles.legendText}>Avoid</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridH: { position: 'absolute', left: 0, right: 0, height: 1 },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1 },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: ZONE.scanLine,
    shadowColor: ZONE.safeGlow,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  cautionCorner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: ZONE.caution,
    opacity: 0.7,
  },
  cautionTL: { top: 10, left: 10, borderTopWidth: 3, borderLeftWidth: 3 },
  cautionTR: { top: 10, right: 10, borderTopWidth: 3, borderRightWidth: 3 },
  cautionBL: { bottom: 10, left: 10, borderBottomWidth: 3, borderLeftWidth: 3 },
  cautionBR: { bottom: 10, right: 10, borderBottomWidth: 3, borderRightWidth: 3 },
  zoneLabel: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2.5,
    color: 'rgba(110,231,183,0.45)',
  },
  introGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(52,211,153,0.06)',
  },
  entityWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  safeRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: ZONE.safeRing,
    backgroundColor: 'rgba(52,211,153,0.08)',
  },
  safeBody: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: ZONE.safeGlow,
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 8,
  },
  safeEmoji: { fontSize: 26 },
  safeBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: ZONE.safeCore,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  safeBadgeText: { fontSize: 8, fontWeight: '900', color: '#ECFDF5', letterSpacing: 0.8 },
  dangerRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: ZONE.dangerRing,
    borderStyle: 'dashed',
  },
  dangerBody: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
    shadowColor: ZONE.dangerGlow,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  dangerEmoji: { fontSize: 22 },
  dangerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ZONE.caution,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  dangerBadgeText: { fontSize: 11, fontWeight: '900', color: '#7F1D1D' },
  dangerFlash: { ...StyleSheet.absoluteFillObject, backgroundColor: ZONE.dangerFlash, zIndex: 20 },
  toastWrap: { position: 'absolute', top: '36%', alignSelf: 'center', left: 0, right: 0, alignItems: 'center', zIndex: 25 },
  toastGrad: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.45)',
  },
  toastDanger: { borderColor: 'rgba(255,255,255,0.35)' },
  toastText: { fontSize: 15, fontWeight: '900', color: T.title },
  toastTextDanger: { color: '#fff' },
  legend: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 16,
    backgroundColor: 'rgba(15,23,42,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    zIndex: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, fontWeight: '800', color: 'rgba(226,232,240,0.85)' },
});
