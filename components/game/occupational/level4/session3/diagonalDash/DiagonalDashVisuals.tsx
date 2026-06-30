/**
 * Summit-to-valley backdrop for Diagonal Dash (OT L4 S3 Game 1).
 */
import { DIAGONAL_DASH_THEME as T } from '@/components/game/occupational/level4/session3/diagonalDash/diagonalDashTheme';
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

type Props = {
  roundActive: boolean;
  showGuide: boolean;
  isDragging: boolean;
  dashKey: number;
};

export const DiagonalDashPlayArea: React.FC<Props> = ({ roundActive, showGuide, isDragging, dashKey }) => {
  const summitGlow = useSharedValue(0.5);
  const finishGlow = useSharedValue(0.45);
  const arrowT = useSharedValue(0);
  const trailPulse = useSharedValue(0.3);

  useEffect(() => {
    if (!roundActive) return;
    summitGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.4, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    finishGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.35, { duration: 700 })),
      -1,
      true,
    );
    trailPulse.value = withRepeat(
      withSequence(withTiming(0.9, { duration: 1200 }), withTiming(0.2, { duration: 1200 })),
      -1,
      true,
    );
  }, [roundActive, summitGlow, finishGlow, trailPulse]);

  useEffect(() => {
    if (!dashKey) return;
    finishGlow.value = withSequence(
      withSpring(1.4, { damping: 5, stiffness: 180 }),
      withTiming(0.45, { duration: 500 }),
    );
  }, [dashKey, finishGlow]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      arrowT.value = 0;
      return;
    }
    arrowT.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 700, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      true,
    );
  }, [showGuide, roundActive, arrowT]);

  const summitStyle = useAnimatedStyle(() => ({ opacity: 0.25 + summitGlow.value * 0.45 }));
  const finishStyle = useAnimatedStyle(() => ({ opacity: 0.3 + finishGlow.value * 0.5 }));
  const trailStyle = useAnimatedStyle(() => ({ opacity: 0.15 + trailPulse.value * 0.35 }));
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: arrowT.value * 28 },
      { translateY: arrowT.value * 20 },
    ],
    opacity: showGuide && roundActive && !isDragging ? 0.92 : 0,
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.summitDark, '#1E3A5F', T.valleyWarm, '#92400E']}
        locations={[0, 0.35, 0.72, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {[0, 1, 2].map((i) => (
        <View
          key={`peak-${i}`}
          style={[
            styles.peak,
            {
              left: `${4 + i * 8}%`,
              borderBottomWidth: 28 + i * 10,
              borderLeftWidth: 18 + i * 6,
              borderRightWidth: 18 + i * 6,
              opacity: 0.2 + i * 0.08,
            },
          ]}
        />
      ))}

      <Animated.View style={[styles.diagonalTrail, trailStyle]} />
      <View style={styles.diagonalTrailCore} />

      <View style={styles.summitPad}>
        <Animated.View style={[styles.summitGlow, summitStyle]} />
        <Text style={styles.padLabel}>SUMMIT</Text>
        <Text style={styles.padEmoji}>⛰️</Text>
      </View>

      <View style={styles.valleyFinish}>
        <Animated.View style={[styles.finishGlow, finishStyle]} />
        <Text style={styles.finishEmoji}>{T.targetEmoji}</Text>
        <Text style={styles.padLabel}>FINISH</Text>
      </View>

      {[0, 1, 2, 3, 4].map((i) => (
        <View
          key={`star-${i}`}
          style={[
            styles.star,
            { left: `${12 + i * 18}%`, top: `${8 + (i % 3) * 6}%` },
          ]}
        />
      ))}

      <Animated.View style={[styles.dashArrow, arrowStyle]}>
        <Text style={styles.arrowEmoji}>↘</Text>
        <Text style={styles.arrowHint}>Dash down</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  peak: {
    position: 'absolute',
    bottom: '55%',
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(148,163,184,0.35)',
    borderStyle: 'solid',
    backgroundColor: 'transparent',
  },
  diagonalTrail: {
    position: 'absolute',
    left: '14%',
    top: '18%',
    width: '72%',
    height: 10,
    borderRadius: 5,
    backgroundColor: T.trailGlow,
    transform: [{ rotate: '32deg' }],
  },
  diagonalTrailCore: {
    position: 'absolute',
    left: '15%',
    top: '20%',
    width: '70%',
    height: 3,
    borderRadius: 2,
    backgroundColor: T.accentGold,
    opacity: 0.45,
    transform: [{ rotate: '32deg' }],
  },
  summitPad: {
    position: 'absolute',
    left: '5%',
    top: '7%',
    width: '26%',
    height: '24%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.accent,
    borderRadius: 14,
    backgroundColor: 'rgba(15,23,42,0.5)',
    overflow: 'hidden',
  },
  summitGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.accent,
  },
  valleyFinish: {
    position: 'absolute',
    right: '5%',
    bottom: '7%',
    width: '28%',
    height: '26%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.accentGold,
    borderRadius: 14,
    backgroundColor: 'rgba(120,53,15,0.45)',
    overflow: 'hidden',
  },
  finishGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.accentGold,
  },
  padLabel: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#FEF3C7',
    zIndex: 2,
  },
  padEmoji: { fontSize: 26, zIndex: 2 },
  finishEmoji: { fontSize: 30, zIndex: 2 },
  star: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FEF3C7',
    opacity: 0.6,
  },
  dashArrow: {
    position: 'absolute',
    left: '38%',
    top: '38%',
    alignItems: 'center',
    zIndex: 4,
  },
  arrowEmoji: { fontSize: 34, color: '#BAE6FD' },
  arrowHint: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: T.accentDark,
  },
});
