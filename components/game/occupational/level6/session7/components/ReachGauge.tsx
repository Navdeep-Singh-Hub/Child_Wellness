/**
 * ReachGauge — feedback bar for trunk-rotation reaching games. Shows the
 * reaching hand's position on a left/right track (with target zone) plus an
 * optional rotation meter.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import type { ShiftDir } from '@/components/game/occupational/level6/session1/poseUtils';

type Props = {
  /** Mirrored reach offset (shoulder-widths); ~-1.4..1.4 typical. */
  reachX: number;
  target: ShiftDir | null;
  inZone: boolean;
  /** 0..1 trunk-rotation amount. */
  turnPct: number;
  showTurn: boolean;
  accent: string;
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export const ReachGauge: React.FC<Props> = ({ reachX, target, inZone, turnPct, showTurn, accent }) => {
  const pct = 50 + clamp(reachX / 1.1, -1, 1) * 46;
  const markerStyle = useAnimatedStyle(() => ({
    left: withTiming(`${pct}%`, { duration: 90 }),
    backgroundColor: inZone ? '#34D399' : accent,
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      {showTurn && (
        <View style={[styles.turnPill, { borderColor: accent }]}>
          <Text style={styles.turnLabel}>ROTATION</Text>
          <View style={styles.turnTrack}>
            <View style={[styles.turnFill, { width: `${Math.round(clamp(turnPct, 0, 1) * 100)}%`, backgroundColor: accent }]} />
          </View>
        </View>
      )}
      <View style={styles.track}>
        <View style={[styles.zone, target === 'left' && styles.zoneActive]}>
          <Text style={styles.zoneText}>🖐️</Text>
        </View>
        <View style={[styles.zone, styles.mid, target === 'center' && styles.zoneActive]} />
        <View style={[styles.zone, target === 'right' && styles.zoneActive]}>
          <Text style={styles.zoneText}>🖐️</Text>
        </View>
        <Animated.View style={[styles.marker, markerStyle]} />
      </View>
      <Text style={styles.label}>REACH</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', bottom: 14, alignSelf: 'center', width: '88%', alignItems: 'center' },
  turnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(8,51,68,0.6)',
    marginBottom: 8,
  },
  turnLabel: { color: '#A5F3FC', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  turnTrack: { width: 90, height: 8, borderRadius: 4, backgroundColor: 'rgba(8,51,68,0.8)', overflow: 'hidden' },
  turnFill: { height: '100%', borderRadius: 4 },
  track: {
    flexDirection: 'row',
    width: '100%',
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(8,51,68,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(217,70,239,0.4)',
    overflow: 'hidden',
  },
  zone: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mid: { flex: 1.1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  zoneActive: { backgroundColor: 'rgba(52,211,153,0.32)' },
  zoneText: { fontSize: 15 },
  marker: {
    position: 'absolute',
    top: 4,
    width: 24,
    height: 24,
    marginLeft: -12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  label: { color: '#A5F3FC', fontSize: 10, fontWeight: '900', letterSpacing: 1, marginTop: 4 },
});
