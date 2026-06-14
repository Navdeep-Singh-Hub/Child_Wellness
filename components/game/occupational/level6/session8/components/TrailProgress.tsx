/**
 * TrailProgress — a horizontal animal-walk trail. Shows markers travelled, the
 * animal hero at the current spot, collectibles ahead, a movement-energy meter
 * and a "get into position" status pill.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

type Props = {
  steps: number;
  index: number;
  hero: string;
  collectible: string;
  accent: string;
  /** 0..1 movement intensity for the energy bar. */
  energy: number;
  inPosition: boolean;
  positionCue: string;
  starEvery: number;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const TrailProgress: React.FC<Props> = ({
  steps,
  index,
  hero,
  collectible,
  accent,
  energy,
  inPosition,
  positionCue,
  starEvery,
}) => {
  const energyStyle = useAnimatedStyle(() => ({
    width: withTiming(`${Math.round(clamp01(energy) * 100)}%`, { duration: 110 }),
    backgroundColor: energy >= 0.25 ? '#34D399' : accent,
  }));

  const markers = Array.from({ length: steps }, (_, i) => i);

  return (
    <View style={styles.wrap} pointerEvents="none">
      {!inPosition && (
        <View style={[styles.cuePill, { borderColor: accent }]}>
          <Text style={styles.cueText}>{positionCue}</Text>
        </View>
      )}

      <View style={styles.trail}>
        <View style={styles.trailLine} />
        {markers.map((i) => {
          const done = i < index;
          const current = i === index;
          const hasItem = i > 0 && i % starEvery === 0;
          return (
            <View key={i} style={styles.cell}>
              {current ? (
                <Text style={styles.hero}>{hero}</Text>
              ) : (
                <View
                  style={[
                    styles.dot,
                    done && { backgroundColor: '#34D399', borderColor: '#34D399' },
                    !done && { borderColor: accent },
                  ]}
                >
                  {!done && hasItem ? <Text style={styles.item}>{collectible}</Text> : null}
                  {done ? <Text style={styles.check}>✓</Text> : null}
                </View>
              )}
            </View>
          );
        })}
        <Text style={styles.flag}>🏁</Text>
      </View>

      <View style={styles.meterRow}>
        <Text style={styles.meterLabel}>ENERGY</Text>
        <View style={styles.meterTrack}>
          <Animated.View style={[styles.meterFill, energyStyle]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', bottom: 16, alignSelf: 'center', width: '92%', alignItems: 'center' },
  cuePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'rgba(2,44,34,0.8)',
    marginBottom: 12,
  },
  cueText: { color: '#FDE68A', fontSize: 14, fontWeight: '900', textAlign: 'center' },
  trail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  trailLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: '50%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(217,249,157,0.25)',
  },
  cell: { alignItems: 'center', justifyContent: 'center', minWidth: 24 },
  hero: { fontSize: 30 },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    backgroundColor: 'rgba(2,44,34,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: { fontSize: 13 },
  check: { color: '#fff', fontSize: 13, fontWeight: '900' },
  flag: { fontSize: 24 },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, width: '80%' },
  meterLabel: { color: '#86EFAC', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  meterTrack: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(2,44,34,0.7)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(132,204,22,0.3)',
  },
  meterFill: { height: '100%', borderRadius: 6 },
});
