/**
 * Aurora sky backdrop for Sky Catch (OT L4 S3 Game 3).
 */
import { SKY_CATCH_THEME as T } from '@/components/game/occupational/level4/session3/session3Theme';
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
  fallFromLeft: boolean;
  catchKey: number;
};

const CLOUDS = [
  { left: '8%', top: '18%', w: 64 },
  { left: '55%', top: '12%', w: 80 },
  { left: '72%', top: '28%', w: 56 },
];

export const SkyCatchPlayArea: React.FC<Props> = ({ roundActive, fallFromLeft, catchKey }) => {
  const aurora = useSharedValue(0.3);
  const netGlow = useSharedValue(0.5);
  const windPulse = useSharedValue(0.4);

  useEffect(() => {
    if (!roundActive) return;
    aurora.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.25, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    netGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 800 }), withTiming(0.35, { duration: 800 })),
      -1,
      true,
    );
    windPulse.value = withRepeat(
      withSequence(withTiming(0.85, { duration: 1000 }), withTiming(0.2, { duration: 1000 })),
      -1,
      true,
    );
  }, [roundActive, aurora, netGlow, windPulse]);

  useEffect(() => {
    if (!catchKey) return;
    netGlow.value = withSequence(
      withSpring(1.4, { damping: 5, stiffness: 180 }),
      withTiming(0.5, { duration: 500 }),
    );
  }, [catchKey, netGlow]);

  const auroraStyle = useAnimatedStyle(() => ({ opacity: 0.12 + aurora.value * 0.28 }));
  const netStyle = useAnimatedStyle(() => ({ opacity: 0.2 + netGlow.value * 0.4 }));
  const windStyle = useAnimatedStyle(() => ({ opacity: 0.15 + windPulse.value * 0.35 }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.skyDeep, '#1E3A8A', '#4C1D95', '#9D174D']}
        locations={[0, 0.4, 0.75, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.auroraBand, auroraStyle]} />
      <Animated.View style={[styles.auroraBand2, auroraStyle]} />

      {CLOUDS.map((c, i) => (
        <View key={`cloud-${i}`} style={[styles.cloud, { left: c.left, top: c.top, width: c.w }]}>
          <View style={[styles.cloudPuff, { width: c.w * 0.5 }]} />
          <View style={[styles.cloudPuff, styles.cloudPuffMid, { width: c.w * 0.65 }]} />
        </View>
      ))}

      <Animated.View
        style={[
          styles.windTrail,
          windStyle,
          fallFromLeft ? styles.windFromLeft : styles.windFromRight,
        ]}
        pointerEvents="none"
      />

      <View style={styles.launchZone}>
        <Text style={styles.zoneLabel}>{fallFromLeft ? '↘ FALL' : '↙ FALL'}</Text>
      </View>

      <View style={styles.netLane}>
        <Animated.View style={[styles.netLaneGlow, netStyle]} />
        <Text style={styles.netLabel}>NET LANE</Text>
      </View>

      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View
          key={`star-bg-${i}`}
          style={[
            styles.bgStar,
            { left: `${10 + i * 15}%`, top: `${6 + (i % 3) * 5}%` },
          ]}
        />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  auroraBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '22%',
    height: 40,
    backgroundColor: T.auroraGreen,
    transform: [{ skewX: '-12deg' }],
  },
  auroraBand2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '30%',
    height: 24,
    backgroundColor: T.accentViolet,
    transform: [{ skewX: '8deg' }],
  },
  cloud: {
    position: 'absolute',
    height: 28,
    opacity: 0.35,
  },
  cloudPuff: {
    height: 22,
    borderRadius: 11,
    backgroundColor: T.cloudWhite,
    alignSelf: 'flex-start',
  },
  cloudPuffMid: {
    marginTop: -10,
    marginLeft: 12,
    alignSelf: 'center',
  },
  windTrail: {
    position: 'absolute',
    width: '55%',
    height: 3,
    borderRadius: 2,
    backgroundColor: T.accent,
    top: '22%',
  },
  windFromLeft: {
    left: '12%',
    transform: [{ rotate: '32deg' }],
  },
  windFromRight: {
    right: '12%',
    transform: [{ rotate: '-32deg' }],
  },
  launchZone: {
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
    left: '30%',
    right: '30%',
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(56,189,248,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.3)',
    alignItems: 'center',
  },
  zoneLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: T.accent,
  },
  netLane: {
    position: 'absolute',
    left: '4%',
    right: '4%',
    bottom: '14%',
    height: '12%',
    borderWidth: 2,
    borderColor: T.accentPink,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(157,23,77,0.2)',
    overflow: 'hidden',
  },
  netLaneGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.accentPink,
  },
  netLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#FBCFE8',
    zIndex: 2,
  },
  bgStar: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FEF3C7',
    opacity: 0.5,
  },
});
