/**
 * BridgePath — a row of stepping stones placed in left/center/right lanes.
 * Highlights the current target stone and shows crossed (completed) stones.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ShiftDir } from '@/components/game/occupational/level6/session1/poseUtils';

type Props = { pattern: ShiftDir[]; stepIndex: number; hero: string; accent: string };

const laneTop = (dir: ShiftDir) => (dir === 'left' ? 56 : dir === 'right' ? 56 : 0);
const laneAlign = (dir: ShiftDir): 'flex-start' | 'center' | 'flex-end' =>
  dir === 'left' ? 'flex-start' : dir === 'right' ? 'flex-end' : 'center';

export const BridgePath: React.FC<Props> = ({ pattern, stepIndex, hero, accent }) => {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.row}>
        {pattern.map((dir, i) => {
          const done = i < stepIndex;
          const current = i === stepIndex;
          return (
            <View key={i} style={[styles.cell, { alignItems: laneAlign(dir) }]}>
              <View
                style={[
                  styles.stone,
                  { marginTop: laneTop(dir) },
                  done && styles.stoneDone,
                  current && { borderColor: accent, backgroundColor: 'rgba(56,189,248,0.3)', shadowColor: accent },
                ]}
              >
                <Text style={styles.stoneText}>{current ? hero : done ? '✓' : '🪵'}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: '30%', alignSelf: 'center', width: '92%' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cell: { flex: 1 },
  stone: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(46,16,101,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowRadius: 12,
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
  },
  stoneDone: { backgroundColor: 'rgba(52,211,153,0.35)', borderColor: '#34D399' },
  stoneText: { fontSize: 20 },
});
