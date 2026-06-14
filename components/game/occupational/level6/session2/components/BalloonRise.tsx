/**
 * BalloonRise — a balloon that floats up toward the clouds as the child stretches
 * tall. `height` 0..100. Used by Grow Taller.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

type Props = { height: number; rising: boolean; accent: string };

export const BalloonRise: React.FC<Props> = ({ height, rising, accent }) => {
  const h = Math.max(0, Math.min(100, height));
  const bob = useSharedValue(0);
  React.useEffect(() => {
    bob.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [bob]);

  const balloonStyle = useAnimatedStyle(() => ({
    // Travels from near the bottom (90%) up to the clouds (6%).
    top: withTiming(`${90 - (h / 100) * 84}%`, { duration: 200 }),
    transform: [{ translateX: (bob.value - 0.5) * 14 }, { scale: rising ? 1.05 : 1 }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.clouds}>☁️ ☁️ ☁️</Text>
      <Animated.View style={[styles.balloonWrap, balloonStyle]}>
        <Text style={styles.balloon}>🎈</Text>
      </Animated.View>
      <View style={[styles.badge, { backgroundColor: accent }]}>
        <Text style={styles.badgeLabel}>HEIGHT</Text>
        <Text style={styles.badgeValue}>{Math.round(h)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 16, top: 10, bottom: 10, width: 80, alignItems: 'center' },
  clouds: { position: 'absolute', top: 0, fontSize: 18, opacity: 0.9 },
  balloonWrap: { position: 'absolute', alignSelf: 'center' },
  balloon: { fontSize: 50 },
  badge: { position: 'absolute', bottom: 0, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14, alignItems: 'center' },
  badgeLabel: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1, opacity: 0.85 },
  badgeValue: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
