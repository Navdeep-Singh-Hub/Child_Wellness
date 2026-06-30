import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TraceMeterProps {
  percent: number;
  label?: string;
  color?: string;
  textColor?: string;
}

export function TraceMeter({ percent, label = 'Traced', color = '#22C55E', textColor = '#115E59' }: TraceMeterProps) {
  const pct = Math.round(Math.min(100, Math.max(0, percent)));
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        <Text style={[styles.pct, { color }]}>{pct}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 10, gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 14, fontWeight: '700' },
  pct: { fontSize: 14, fontWeight: '900' },
  track: { height: 12, backgroundColor: 'rgba(0,0,0,0.12)', borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
});
