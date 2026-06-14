/**
 * WeightShiftBar — horizontal feedback bar showing the child's center-of-mass
 * shift (a sliding marker) and the active target zone. Core feedback for all
 * weight-shifting games.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import type { ShiftDir } from '@/components/game/occupational/level6/session1/poseUtils';

type Props = {
  /** Mirrored shift in shoulder-widths; ~-1..1 typical. */
  shiftX: number;
  target: ShiftDir | null;
  inZone: boolean;
  accent: string;
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export const WeightShiftBar: React.FC<Props> = ({ shiftX, target, inZone, accent }) => {
  const pct = 50 + clamp(shiftX / 0.7, -1, 1) * 46;
  const markerStyle = useAnimatedStyle(() => ({
    left: withTiming(`${pct}%`, { duration: 90 }),
    backgroundColor: inZone ? '#34D399' : accent,
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.track}>
        <View style={[styles.zone, styles.left, target === 'left' && { backgroundColor: 'rgba(52,211,153,0.35)' }]}>
          <Text style={styles.zoneText}>◀</Text>
        </View>
        <View style={[styles.zone, styles.center, target === 'center' && { backgroundColor: 'rgba(52,211,153,0.35)' }]}>
          <Text style={styles.zoneText}>•</Text>
        </View>
        <View style={[styles.zone, styles.right, target === 'right' && { backgroundColor: 'rgba(52,211,153,0.35)' }]}>
          <Text style={styles.zoneText}>▶</Text>
        </View>
        <Animated.View style={[styles.marker, markerStyle]} />
      </View>
      <Text style={styles.label}>WEIGHT</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', bottom: 16, alignSelf: 'center', width: '86%', alignItems: 'center' },
  track: {
    flexDirection: 'row',
    width: '100%',
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(46,16,101,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.4)',
    overflow: 'hidden',
  },
  zone: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  left: { borderTopLeftRadius: 15, borderBottomLeftRadius: 15 },
  center: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  right: { borderTopRightRadius: 15, borderBottomRightRadius: 15 },
  zoneText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '900' },
  marker: {
    position: 'absolute',
    top: 3,
    width: 22,
    height: 22,
    marginLeft: -11,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#fff',
  },
  label: { color: '#FBCFE8', fontSize: 10, fontWeight: '900', letterSpacing: 1, marginTop: 4 },
});
