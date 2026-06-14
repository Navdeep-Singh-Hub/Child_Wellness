/**
 * LinearPathTrack — horizontal station/marker progress for vestibular walking games.
 */
import { RAINBOW_COLORS } from '@/components/game/occupational/level7/session1/vestibularTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

type Props = {
  steps: number;
  index: number;
  hero: string;
  collectible: string;
  accent: string;
  energy: number;
  inPosition: boolean;
  positionCue: string;
  starEvery: number;
  rainbow?: boolean;
  balancePct: number;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const LinearPathTrack: React.FC<Props> = ({
  steps,
  index,
  hero,
  collectible,
  accent,
  energy,
  inPosition,
  positionCue,
  starEvery,
  rainbow,
  balancePct,
}) => {
  const energyStyle = useAnimatedStyle(() => ({
    width: withTiming(`${Math.round(clamp01(energy) * 100)}%`, { duration: 110 }),
    backgroundColor: energy >= 0.22 ? '#34D399' : accent,
  }));

  const balanceStyle = useAnimatedStyle(() => ({
    width: withTiming(`${Math.round(clamp01(balancePct) * 100)}%`, { duration: 140 }),
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
        <View style={[styles.trailLine, { backgroundColor: `${accent}40` }]} />
        {markers.map((i) => {
          const done = i < index;
          const current = i === index;
          const hasItem = i > 0 && i % starEvery === 0;
          const dotColor = rainbow ? RAINBOW_COLORS[i % RAINBOW_COLORS.length] : accent;
          return (
            <View key={i} style={styles.cell}>
              {current ? (
                <Text style={styles.hero}>{hero}</Text>
              ) : (
                <View
                  style={[
                    styles.dot,
                    done && { backgroundColor: '#34D399', borderColor: '#34D399' },
                    !done && { borderColor: dotColor },
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
        <Text style={styles.meterLabel}>STEP</Text>
        <View style={styles.meterTrack}>
          <Animated.View style={[styles.meterFill, energyStyle]} />
        </View>
      </View>

      <View style={styles.meterRow}>
        <Text style={styles.meterLabel}>BAL</Text>
        <View style={styles.meterTrack}>
          <Animated.View style={[styles.balanceFill, balanceStyle]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', bottom: 14, alignSelf: 'center', width: '92%', alignItems: 'center' },
  cuePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'rgba(12,25,41,0.85)',
    marginBottom: 10,
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
  },
  cell: { alignItems: 'center', justifyContent: 'center', minWidth: 22 },
  hero: { fontSize: 28 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(12,25,41,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: { fontSize: 12 },
  check: { color: '#fff', fontSize: 12, fontWeight: '900' },
  flag: { fontSize: 22 },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, width: '82%' },
  meterLabel: { color: '#FCD34D', fontSize: 10, fontWeight: '900', letterSpacing: 1, width: 32 },
  meterTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(12,25,41,0.75)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.25)',
  },
  meterFill: { height: '100%', borderRadius: 5 },
  balanceFill: { height: '100%', borderRadius: 5, backgroundColor: '#38BDF8' },
});
