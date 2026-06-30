import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface PrecisionMeterProps {
  fillPct: number;
  outsidePct: number;
  outsideMax: number;
  fillMin?: number;
  accent: string;
  warnColor?: string;
  label?: string;
}

export function PrecisionMeter({
  fillPct,
  outsidePct,
  outsideMax,
  fillMin = 60,
  accent,
  warnColor = '#F59E0B',
  label = 'Precision',
}: PrecisionMeterProps) {
  const fillW = useSharedValue(0);
  const outsideOk = outsidePct <= outsideMax;
  const fillOk = fillPct >= fillMin;

  useEffect(() => {
    fillW.value = withTiming(Math.min(100, fillPct), { duration: 300, easing: Easing.out(Easing.cubic) });
  }, [fillPct, fillW]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillW.value}%` as `${number}%`,
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.fillVal, fillOk && styles.ok]}>{fillPct}% fill</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: accent }, fillStyle]} />
        <View style={[styles.goalMark, { left: `${fillMin}%` }]} />
      </View>
      <Text style={[styles.outside, !outsideOk && { color: warnColor, fontWeight: '800' }]}>
        Outside: {outsidePct}% · keep under {outsideMax}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 0.8, textTransform: 'uppercase' },
  fillVal: { fontSize: 14, fontWeight: '800', color: '#334155' },
  ok: { color: '#16A34A' },
  track: {
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
    position: 'relative',
  },
  fill: { height: '100%', borderRadius: 6 },
  goalMark: {
    position: 'absolute',
    top: -2,
    width: 3,
    height: 16,
    backgroundColor: '#16A34A',
    borderRadius: 2,
    marginLeft: -1.5,
  },
  outside: { fontSize: 12, fontWeight: '600', color: '#64748B' },
});
