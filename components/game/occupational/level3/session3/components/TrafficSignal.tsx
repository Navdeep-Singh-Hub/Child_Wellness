import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import type { TrafficLight } from '@/components/game/occupational/level3/session3/session3Pacing';
import { trafficLabel } from '@/components/game/occupational/level3/session3/tempoUtils';

type Props = { light: TrafficLight; visible: boolean };

export function TrafficSignal({ light, visible }: Props) {
  if (!visible) return null;
  return (
    <Animated.View entering={ZoomIn.duration(240)} style={styles.wrap}>
      <View style={styles.housing}>
        <View style={[styles.bulb, light === 'red' && styles.redOn]} />
        <View style={[styles.bulb, light === 'yellow' && styles.yellowOn]} />
        <View style={[styles.bulb, light === 'green' && styles.greenOn]} />
      </View>
      <Text style={styles.label}>{trafficLabel(light)}</Text>
      <Text style={styles.captain}>🚦 Captain Signal</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: 16 },
  housing: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 12,
    gap: 10,
    marginBottom: 14,
  },
  bulb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#334155',
    borderWidth: 2,
    borderColor: '#475569',
  },
  redOn: { backgroundColor: '#EF4444', borderColor: '#FCA5A5' },
  yellowOn: { backgroundColor: '#EAB308', borderColor: '#FDE047' },
  greenOn: { backgroundColor: '#22C55E', borderColor: '#86EFAC' },
  label: { fontSize: 28, fontWeight: '900', color: '#0F172A' },
  captain: { fontSize: 14, fontWeight: '700', color: '#64748B', marginTop: 6 },
});
