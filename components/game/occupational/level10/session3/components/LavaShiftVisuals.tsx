/** Volcanic lava field backdrop — Lava Shift */
import { LAVA_SHIFT_THEME } from '@/components/game/occupational/level10/session3/lavaShiftTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = { lavaLevel?: number; erupting?: boolean };

export const LavaShiftVisuals: React.FC<Props> = ({ lavaLevel = 0, erupting = false }) => {
  const bubble = useSharedValue(0);
  useEffect(() => {
    bubble.value = withRepeat(
      withTiming(1, { duration: erupting ? 500 : 1800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [bubble, erupting]);

  const lavaStyle = useAnimatedStyle(() => ({
    height: `${(lavaLevel + bubble.value * 0.04) * 100}%`,
    opacity: 0.55 + bubble.value * 0.2,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={LAVA_SHIFT_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.lavaPool, lavaStyle]} />
      <View style={styles.ashHaze} />
    </View>
  );
};

const styles = StyleSheet.create({
  lavaPool: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EA580C',
    borderTopWidth: 3,
    borderTopColor: '#FDE68A',
  },
  ashHaze: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(28,25,23,0.35)',
  },
});
