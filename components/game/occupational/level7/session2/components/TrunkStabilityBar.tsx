/**
 * TrunkStabilityBar — shows how still the body stays while the head moves.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

type Props = { stability: number; accent: string };

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const TrunkStabilityBar: React.FC<Props> = ({ stability, accent }) => {
  const fillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${Math.round(clamp01(stability) * 100)}%`, { duration: 120 }),
    backgroundColor: stability >= 0.55 ? '#34D399' : accent,
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.label}>BODY STILL</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 14, left: 14, width: 110 },
  label: { color: '#FDE68A', fontSize: 9, fontWeight: '900', letterSpacing: 0.8, marginBottom: 4 },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(30,16,51,0.75)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.25)',
  },
  fill: { height: '100%', borderRadius: 5 },
});
