/**
 * Thunder Forge reactor power meter — segmented vertical charge with glow.
 */
import { TF } from './thunderForgeTokens';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const SEGMENTS = 5;

type Props = {
  power: number;
  charging: boolean;
  reduceMotion?: boolean;
};

export function ThunderForgeReactorMeter({ power, charging, reduceMotion = false }: Props) {
  const pct = Math.max(0, Math.min(100, power));
  const filledSegs = Math.floor((pct / 100) * SEGMENTS);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion || !charging) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 400 }), withTiming(1, { duration: 400 })),
      -1,
      true,
    );
  }, [charging, reduceMotion, pulse]);

  const boltStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: charging ? 1 : 0.45,
  }));

  const fillStyle = useAnimatedStyle(() => ({
    height: withTiming(`${Math.max(0, Math.min(100, power))}%`, { duration: reduceMotion ? 0 : 180 }),
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.label}>REACTOR</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fillClip, fillStyle]}>
          <LinearGradient
            colors={[TF.molten, TF.accent, TF.accentGlow]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <View style={styles.segments}>
          {Array.from({ length: SEGMENTS - 1 }).map((_, i) => (
            <View key={i} style={styles.segLine} />
          ))}
        </View>
        <Animated.Text style={[styles.bolt, boltStyle]}>⚡</Animated.Text>
      </View>
      <Text style={styles.value}>{Math.round(pct)}%</Text>
      <View style={styles.dotsRow}>
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < filledSegs && styles.dotOn,
              i === filledSegs && pct > 0 && pct < 100 && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    top: 16,
    bottom: 16,
    width: 72,
    alignItems: 'center',
  },
  label: {
    color: TF.textMuted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  track: {
    flex: 1,
    width: 48,
    borderRadius: 24,
    backgroundColor: TF.reactorTrack,
    borderWidth: 2,
    borderColor: TF.glassBorder,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  fillClip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderRadius: 22,
  },
  segments: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-evenly',
    paddingVertical: 8,
  },
  segLine: {
    height: 2,
    marginHorizontal: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 1,
  },
  bolt: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    fontSize: 28,
  },
  value: {
    color: TF.textLight,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dotOn: { backgroundColor: TF.accentBright },
  dotActive: { backgroundColor: TF.accentGlow, transform: [{ scale: 1.2 }] },
});
