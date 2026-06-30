import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MOON_BRIDGE } from './theme';

interface FlowMeterProps {
  percent: number;
  label?: string;
}

export function FlowMeter({ percent, label = 'Path traced' }: FlowMeterProps) {
  const pct = Math.round(Math.min(100, Math.max(0, percent)));
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.pct}>{pct}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 14, fontWeight: '700', color: MOON_BRIDGE.textMuted },
  pct: { fontSize: 14, fontWeight: '900', color: MOON_BRIDGE.success },
  track: { height: 12, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: MOON_BRIDGE.success, borderRadius: 6 },
});
