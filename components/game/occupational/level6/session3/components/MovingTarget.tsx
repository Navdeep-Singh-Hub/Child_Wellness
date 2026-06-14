/**
 * MovingTarget — the rocket / star the child follows with their head.
 * Position is normalized (0..1), set by the engine each tick.
 */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

type Props = { pos: { x: number; y: number }; emoji: string; locked: boolean };

export const MovingTarget: React.FC<Props> = ({ pos, emoji, locked }) => {
  const pulse = useSharedValue(0);
  React.useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 650 }), -1, true);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    left: withTiming(`${pos.x * 100}%`, { duration: 90 }),
    top: withTiming(`${pos.y * 100}%`, { duration: 90 }),
    transform: [{ scale: (locked ? 1.2 : 1) + pulse.value * 0.12 }],
  }));

  return (
    <Animated.Text pointerEvents="none" style={[styles.target, style]}>
      {emoji}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  target: {
    position: 'absolute',
    fontSize: 50,
    marginLeft: -25,
    marginTop: -25,
    textShadowColor: 'rgba(103,232,249,0.9)',
    textShadowRadius: 16,
  },
});
