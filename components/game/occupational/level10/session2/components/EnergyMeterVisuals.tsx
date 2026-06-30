/** Neon pulse station backdrop — Energy Meter */
import { ENERGY_METER_THEME } from '@/components/game/occupational/level10/session2/energyMeterTheme';
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

export const EnergyMeterVisuals: React.FC = () => {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [pulse]);

  const gridStyle = useAnimatedStyle(() => ({
    opacity: 0.06 + pulse.value * 0.06,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={ENERGY_METER_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.grid, gridStyle]} />
      {ENERGY_METER_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${4 + (i * 12) % 86}%`, top: `${8 + (i % 5) * 16}%`, opacity: 0.1 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
      <View style={styles.floorGlow} />
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.15)',
    backgroundColor: 'transparent',
  },
  floorGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(8,145,178,0.2)',
  },
  decor: { position: 'absolute', fontSize: 17 },
});
