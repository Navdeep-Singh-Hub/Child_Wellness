/**
 * TreeGrowth — a magical tree that grows taller (with leaves & birds appearing)
 * as standing posture is maintained. `growth` 0..100. Used by Tall Tree.
 */
import { FOREST_SHELL } from '@/components/game/occupational/level6/session2/forestTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

type Props = { growth: number; growing: boolean };

export const TreeGrowth: React.FC<Props> = ({ growth, growing }) => {
  const g = Math.max(0, Math.min(100, growth));

  const trunkStyle = useAnimatedStyle(() => ({
    height: withTiming(28 + (g / 100) * 150, { duration: 180 }),
  }));
  const canopyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(0.5 + (g / 100) * 0.9, { duration: 200 }) }],
    opacity: withTiming(0.5 + (g / 100) * 0.5, { duration: 200 }),
  }));

  const stage = g < 25 ? '🌱' : g < 60 ? '🌿' : '🌳';
  const showBird = g >= 75;
  const showNest = g >= 50;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.treeColumn}>
        {showBird && <Text style={styles.bird}>🐦</Text>}
        <Animated.Text style={[styles.canopy, canopyStyle]}>{stage}</Animated.Text>
        {showNest && <Text style={styles.nest}>🪺</Text>}
        <Animated.View style={[styles.trunk, trunkStyle]} />
        <View style={styles.ground} />
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeLabel}>TREE GROWTH</Text>
        <Text style={styles.badgeValue}>{Math.round(g)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 14, bottom: 16, alignItems: 'center' },
  treeColumn: { alignItems: 'center', justifyContent: 'flex-end' },
  bird: { fontSize: 26, marginBottom: -6 },
  canopy: { fontSize: 76 },
  nest: { fontSize: 22, marginTop: -10 },
  trunk: { width: 16, backgroundColor: '#92400E', borderRadius: 6, marginTop: -4 },
  ground: { width: 90, height: 10, borderRadius: 6, backgroundColor: '#15803D', marginTop: -2 },
  badge: {
    marginTop: 6,
    backgroundColor: 'rgba(21,128,61,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FOREST_SHELL.glassBorder,
  },
  badgeLabel: { color: '#BBF7D0', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  badgeValue: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
