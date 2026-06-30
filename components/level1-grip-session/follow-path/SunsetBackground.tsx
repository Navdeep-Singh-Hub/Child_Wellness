import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SUNSET } from './theme';

const { width: W } = Dimensions.get('window');

export function SunsetBackground() {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [shimmer]);

  const waterStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + shimmer.value * 0.15,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[SUNSET.skyTop, SUNSET.skyMid, SUNSET.horizon, SUNSET.skyBottom]}
        locations={[0, 0.3, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.waterBand, waterStyle]} />
      <View style={styles.hill} />
      <View style={styles.sun} />
    </View>
  );
}

const styles = StyleSheet.create({
  waterBand: {
    position: 'absolute',
    bottom: '18%',
    left: 0,
    right: 0,
    height: '22%',
    backgroundColor: SUNSET.water,
    opacity: 0.3,
  },
  hill: {
    position: 'absolute',
    bottom: 0,
    left: -W * 0.1,
    right: -W * 0.1,
    height: 90,
    backgroundColor: SUNSET.land,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    opacity: 0.5,
  },
  sun: {
    position: 'absolute',
    top: '18%',
    right: '12%',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: SUNSET.horizon,
    shadowColor: SUNSET.skyTop,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
});
