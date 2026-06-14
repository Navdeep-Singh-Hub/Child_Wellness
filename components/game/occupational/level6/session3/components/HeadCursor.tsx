/**
 * HeadCursor — a reticle showing where the child's head is "pointing" on the
 * stage. Position is normalized (0..1). Glows green when on target.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

type Props = { pos: { x: number; y: number }; onTarget: boolean; visible: boolean; accent: string };

export const HeadCursor: React.FC<Props> = ({ pos, onTarget, visible, accent }) => {
  const style = useAnimatedStyle(() => ({
    left: withTiming(`${pos.x * 100}%`, { duration: 90 }),
    top: withTiming(`${pos.y * 100}%`, { duration: 90 }),
    opacity: withTiming(visible ? 1 : 0.25, { duration: 150 }),
    borderColor: onTarget ? '#34D399' : accent,
    transform: [{ scale: withTiming(onTarget ? 1.15 : 1, { duration: 120 }) }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.cursor, style]}>
      <View style={[styles.dot, { backgroundColor: onTarget ? '#34D399' : accent }]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cursor: {
    position: 'absolute',
    width: 56,
    height: 56,
    marginLeft: -28,
    marginTop: -28,
    borderRadius: 28,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
});
