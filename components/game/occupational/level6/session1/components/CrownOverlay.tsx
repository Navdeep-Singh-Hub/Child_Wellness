/**
 * CrownOverlay — a magical crown that wobbles and tips as head stability drops.
 * Used by Crown Keeper. `stability` 0..1 (1 = perfectly steady).
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

type Props = { stability: number; safePct: number };

export const CrownOverlay: React.FC<Props> = ({ stability, safePct }) => {
  const wobble = useSharedValue(0);
  React.useEffect(() => {
    wobble.value = withRepeat(withTiming(1, { duration: 600 }), -1, true);
  }, [wobble]);

  const crownStyle = useAnimatedStyle(() => {
    const instability = 1 - stability;
    const tilt = (wobble.value - 0.5) * 2 * instability * 26; // up to ±26°
    const drop = instability * 14;
    return { transform: [{ translateY: drop }, { rotateZ: `${tilt}deg` }] };
  });

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.Text style={[styles.crown, crownStyle]}>👑</Animated.Text>
      <View style={styles.badge}>
        <Text style={styles.badgeLabel}>CROWN SAFE</Text>
        <Text style={styles.badgeValue}>{Math.round(safePct)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 16, alignSelf: 'center', alignItems: 'center' },
  crown: { fontSize: 64 },
  badge: {
    marginTop: 4,
    backgroundColor: 'rgba(190,24,93,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    alignItems: 'center',
  },
  badgeLabel: { color: '#FBCFE8', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  badgeValue: { color: '#fff', fontSize: 18, fontWeight: '900' },
});
