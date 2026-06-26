/** Prism garden backdrop — Spot The Change */
import { SPOT_THE_CHANGE_THEME } from '@/components/game/occupational/level10/session1/spotTheChangeTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';

export const SpotTheChangeVisuals: React.FC<{ changeFlash?: boolean }> = ({ changeFlash = false }) => {
  const shimmer = useSharedValue(0);
  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: changeFlash ? 500 : 2200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [changeFlash, shimmer]);

  const prismStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + shimmer.value * (changeFlash ? 0.35 : 0.15),
    transform: [{ rotate: `${shimmer.value * 8 - 4}deg` }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={SPOT_THE_CHANGE_THEME.bgGradient} style={StyleSheet.absoluteFill} />

      <Animated.View style={[styles.prismWrap, prismStyle]}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Polygon points="50,8 92,50 50,92 8,50" fill="rgba(236,72,153,0.12)" stroke="rgba(110,231,183,0.25)" />
          <Polygon points="50,20 80,50 50,80 20,50" fill="rgba(16,185,129,0.1)" stroke="rgba(240,171,252,0.2)" />
        </Svg>
      </Animated.View>

      {SPOT_THE_CHANGE_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${7 + (i * 12) % 80}%`, top: `${12 + (i % 4) * 17}%`, opacity: 0.16 + (i % 2) * 0.07 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  prismWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  decor: { position: 'absolute', fontSize: 20 },
});
