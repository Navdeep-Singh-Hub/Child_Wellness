import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  progress: number;
  accent: string;
  label?: string;
};

export function CircleProgressRing({ progress, accent, label = 'Circle' }: Props) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  return (
    <View style={styles.wrap}>
      <View style={[styles.ring, { borderColor: accent }]}>
        <View style={[styles.fill, { backgroundColor: accent, width: `${pct}%` }]} />
      </View>
      <Text style={[styles.label, { color: accent }]}>{label} {pct}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', alignSelf: 'center', top: '10%', width: '76%', zIndex: 3 },
  ring: {
    height: 12,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  fill: { height: '100%', borderRadius: 8 },
  label: { fontSize: 13, fontWeight: '800', marginTop: 6, textAlign: 'center' },
});
