import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  placed: number;
  total: number;
  accent: string;
};

export function PuzzleBuildProgress({ placed, total, accent }: Props) {
  const pct = total > 0 ? Math.round((placed / total) * 100) : 0;
  return (
    <View style={styles.wrap}>
      <View style={[styles.bar, { borderColor: accent }]}>
        <View style={[styles.fill, { backgroundColor: accent, width: `${pct}%` }]} />
      </View>
      <Text style={[styles.label, { color: accent }]}>🤖 Build {placed}/{total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 10, alignSelf: 'center', width: '72%', zIndex: 3 },
  bar: {
    height: 10,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  fill: { height: '100%', borderRadius: 8 },
  label: { fontSize: 12, fontWeight: '800', marginTop: 6, textAlign: 'center' },
});
