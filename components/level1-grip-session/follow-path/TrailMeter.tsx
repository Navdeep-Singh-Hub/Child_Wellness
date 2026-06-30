import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { GAME4_CONFIG, SUNSET } from './theme';

interface TrailMeterProps {
  progress: number;
}

export function TrailMeter({ progress }: TrailMeterProps) {
  const width = useSharedValue(0);
  const pct = Math.round(progress * 100);
  const goal = Math.round(GAME4_CONFIG.progressThreshold * 100);
  const ready = progress >= GAME4_CONFIG.progressThreshold;

  useEffect(() => {
    width.value = withTiming(Math.min(100, pct), { duration: 250, easing: Easing.out(Easing.cubic) });
  }, [pct, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as `${number}%`,
  }));

  return (
    <View style={styles.wrap} accessibilityLabel={`Trail progress ${pct} percent, goal ${goal}`}>
      <Text style={styles.emoji}>{ready ? '🏆' : '🛤️'}</Text>
      <View style={styles.trackWrap}>
        <Text style={styles.label}>Sunset Trail</Text>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, ready && styles.fillReady, fillStyle]} />
          <View style={[styles.goalMark, { left: `${goal}%` }]} />
        </View>
        <Text style={[styles.pct, ready && styles.pctReady]}>{pct}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: SUNSET.panel,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: SUNSET.panelBorder,
    marginBottom: 12,
  },
  emoji: { fontSize: 24 },
  trackWrap: { flex: 1, gap: 4 },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: SUNSET.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  track: {
    height: 12,
    backgroundColor: 'rgba(124,45,18,0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: { height: '100%', backgroundColor: SUNSET.water, borderRadius: 6 },
  fillReady: { backgroundColor: SUNSET.success },
  goalMark: {
    position: 'absolute',
    top: -2,
    width: 3,
    height: 16,
    backgroundColor: SUNSET.pathCore,
    borderRadius: 2,
    marginLeft: -1.5,
  },
  pct: { fontSize: 13, fontWeight: '800', color: SUNSET.waterDeep, alignSelf: 'flex-end' },
  pctReady: { color: SUNSET.success },
});
