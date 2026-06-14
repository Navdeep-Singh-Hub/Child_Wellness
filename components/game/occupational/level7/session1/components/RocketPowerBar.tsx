/**
 * RocketPowerBar — vertical rocket power gauge for Rocket Launch game.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

type Props = {
  power: number;
  accent: string;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const RocketPowerBar: React.FC<Props> = ({ power, accent }) => {
  const fillStyle = useAnimatedStyle(() => ({
    height: withTiming(`${Math.round(clamp01(power) * 100)}%`, { duration: 200 }),
    backgroundColor: power >= 0.85 ? '#34D399' : accent,
  }));

  const rocketY = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(-clamp01(power) * 48, { duration: 220 }) }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.Text style={[styles.rocket, rocketY]}>🚀</Animated.Text>
      <View style={styles.tower}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>
        <Text style={styles.label}>POWER</Text>
        <Text style={styles.pct}>{Math.round(clamp01(power) * 100)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 14, top: '28%', alignItems: 'center' },
  rocket: { fontSize: 36, marginBottom: 6 },
  tower: { alignItems: 'center' },
  track: {
    width: 28,
    height: 140,
    borderRadius: 14,
    backgroundColor: 'rgba(12,25,41,0.75)',
    borderWidth: 2,
    borderColor: 'rgba(56,189,248,0.4)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: { width: '100%', borderRadius: 12 },
  label: { color: '#7DD3FC', fontSize: 9, fontWeight: '900', marginTop: 6, letterSpacing: 1 },
  pct: { color: '#FEF3C7', fontSize: 14, fontWeight: '900', marginTop: 2 },
});
