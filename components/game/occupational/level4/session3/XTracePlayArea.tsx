/**
 * Mystical sigil chamber for X Trace (OT L4 S3 Game 2).
 */
import { X_TRACE_THEME as T } from '@/components/game/occupational/level4/session3/session3Theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Leg = 'first' | 'second';

type Props = {
  roundActive: boolean;
  showGuide: boolean;
  isDragging: boolean;
  currentLeg: Leg;
  traceKey: number;
  leg1Key: number;
};

const CORNERS = [
  { key: 'tl', label: 'TL', top: '14%', left: '10%', leg: 'first' as Leg, dir: '↘' },
  { key: 'tr', label: 'TR', top: '14%', right: '10%', leg: 'second' as Leg, dir: '↙' },
  { key: 'bl', label: 'BL', top: '72%', left: '10%', leg: 'second' as Leg, dir: '↗' },
  { key: 'br', label: 'BR', top: '72%', right: '10%', leg: 'first' as Leg, dir: '↖' },
];

export const XTracePlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  isDragging,
  currentLeg,
  traceKey,
  leg1Key,
}) => {
  const sigilPulse = useSharedValue(0.4);
  const runeGlow = useSharedValue(0.5);
  const guidePulse = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    sigilPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.25, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    runeGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 800 }), withTiming(0.35, { duration: 800 })),
      -1,
      true,
    );
  }, [roundActive, sigilPulse, runeGlow]);

  useEffect(() => {
    if (!traceKey) return;
    sigilPulse.value = withSequence(
      withSpring(1.5, { damping: 4, stiffness: 200 }),
      withTiming(0.4, { duration: 600 }),
    );
  }, [traceKey, sigilPulse]);

  useEffect(() => {
    if (!leg1Key) return;
    runeGlow.value = withSequence(withTiming(1.3, { duration: 200 }), withTiming(0.5, { duration: 400 }));
  }, [leg1Key, runeGlow]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      guidePulse.value = 0;
      return;
    }
    guidePulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 600 }), withTiming(0.3, { duration: 600 })),
      -1,
      true,
    );
  }, [showGuide, roundActive, guidePulse]);

  const sigilStyle = useAnimatedStyle(() => ({ opacity: 0.2 + sigilPulse.value * 0.45 }));
  const runeStyle = useAnimatedStyle(() => ({ opacity: 0.3 + runeGlow.value * 0.5 }));
  const guideStyle = useAnimatedStyle(() => ({
    opacity: showGuide && roundActive && !isDragging ? 0.15 + guidePulse.value * 0.35 : 0,
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.chamberDark, '#2E1065', '#4C1D95']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.centerSigil, sigilStyle]} />
      <View style={styles.centerRing}>
        <Text style={styles.centerX}>✕</Text>
      </View>

      {CORNERS.map((c) => {
        const active = c.leg === currentLeg;
        return (
          <View
            key={c.key}
            style={[
              styles.cornerRune,
              { top: c.top, left: c.left, right: c.right },
              active && styles.cornerActive,
            ]}
          >
            {active ? <Animated.View style={[styles.cornerGlow, runeStyle]} /> : null}
            <Text style={[styles.cornerDir, active && styles.cornerDirActive]}>{c.dir}</Text>
            <Text style={styles.cornerLabel}>{c.label}</Text>
          </View>
        );
      })}

      <Animated.View style={[styles.mistOverlay, guideStyle]} pointerEvents="none" />

      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View
          key={`spark-${i}`}
          style={[
            styles.spark,
            {
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 22}%`,
              opacity: 0.15 + (i % 2) * 0.1,
            },
          ]}
        />
      ))}

      <View style={styles.legBadge}>
        <Text style={styles.legBadgeText}>
          {currentLeg === 'first' ? 'LEG 1 ↘' : 'LEG 2 ↙'}
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  centerSigil: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: T.sigilGlow,
  },
  centerRing: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: T.runeGold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26,10,46,0.6)',
  },
  centerX: {
    fontSize: 28,
    fontWeight: '900',
    color: T.sigilGlow,
  },
  cornerRune: {
    position: 'absolute',
    width: '18%',
    height: '14%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232,121,249,0.25)',
    borderRadius: 10,
    backgroundColor: 'rgba(26,10,46,0.45)',
    overflow: 'hidden',
  },
  cornerActive: {
    borderColor: T.runeGold,
    borderWidth: 2,
  },
  cornerGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.runeGold,
  },
  cornerDir: {
    fontSize: 16,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.45)',
    zIndex: 2,
  },
  cornerDirActive: { color: '#FEF3C7' },
  cornerLabel: {
    marginTop: 2,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.5)',
    zIndex: 2,
  },
  mistOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.accentViolet,
  },
  spark: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.accentGold,
  },
  legBadge: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    left: '32%',
    right: '32%',
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(232,121,249,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(232,121,249,0.35)',
    alignItems: 'center',
  },
  legBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: T.accentDark,
  },
});
