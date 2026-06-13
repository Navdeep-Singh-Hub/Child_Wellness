import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

type Props = { active: boolean; count: number };

export function RainDrops({ active, count }: Props) {
  const offset = useSharedValue(0);

  React.useEffect(() => {
    if (active) {
      offset.value = 0;
      offset.value = withRepeat(withTiming(140, { duration: 1800 }), -1, false);
    }
  }, [active, offset]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  if (!active) return null;

  return (
    <Animated.View style={[styles.row, anim]}>
      {Array.from({ length: count }).map((_, i) => (
        <Text key={i} style={styles.drop}>
          💧
        </Text>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { position: 'absolute', alignSelf: 'center', top: '6%', flexDirection: 'row', gap: 16 },
  drop: { fontSize: 28 },
});
