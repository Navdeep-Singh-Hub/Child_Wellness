import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { diagonalArrow, type DiagonalDir } from '@/components/game/occupational/level3/session7/swingUtils';

type Props = {
  visible: boolean;
  target?: DiagonalDir | null;
};

const POS: Record<DiagonalDir, { left: string; top: string }> = {
  ne: { left: '78%', top: '22%' },
  se: { left: '78%', top: '68%' },
  sw: { left: '18%', top: '68%' },
  nw: { left: '18%', top: '22%' },
};

export function VineTargets({ visible, target }: Props) {
  if (!visible) return null;
  const dirs = (target ? [target] : ['ne', 'nw', 'se', 'sw']) as DiagonalDir[];

  return (
    <View style={styles.wrap} pointerEvents="none">
      {dirs.map((d) => (
        <View
          key={d}
          style={[
            styles.vine,
            { left: POS[d].left, top: POS[d].top },
            target === d && styles.vineActive,
          ]}
        >
          <Text style={styles.vineEmoji}>🪢</Text>
          <Text style={styles.arrow}>{diagonalArrow(d)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, zIndex: 2 },
  vine: {
    position: 'absolute',
    alignItems: 'center',
    opacity: 0.55,
    transform: [{ translateX: -24 }, { translateY: -24 }],
  },
  vineActive: { opacity: 1, transform: [{ translateX: -24 }, { translateY: -24 }, { scale: 1.15 }] },
  vineEmoji: { fontSize: 28 },
  arrow: { fontSize: 22, fontWeight: '900' },
});
