/**
 * ShiftTarget — a collectible (apple / star / treasure) that appears on the
 * left or right side and glows while it is the active target.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

type Props = { side: 'left' | 'right' | 'center'; emoji: string; active: boolean; accent: string };

export const ShiftTarget: React.FC<Props> = ({ side, emoji, active, accent }) => {
  const pulse = useSharedValue(0);
  React.useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 600 }), -1, true);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: active ? 1 + pulse.value * 0.18 : 0.8 }],
    opacity: withTiming(active ? 1 : 0.3, { duration: 200 }),
  }));

  const posStyle =
    side === 'left' ? styles.left : side === 'right' ? styles.right : styles.center;

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, posStyle, style]}>
      <View style={[styles.halo, { borderColor: active ? accent : 'transparent', shadowColor: accent }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: '36%' },
  left: { left: '6%' },
  right: { right: '6%' },
  center: { alignSelf: 'center', left: '44%' },
  halo: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(46,16,101,0.4)',
    shadowRadius: 18,
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
  },
  emoji: { fontSize: 56 },
});
