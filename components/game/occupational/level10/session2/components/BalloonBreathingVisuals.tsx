/** Cloud loft sanctuary backdrop — Balloon Breathing */
import { BALLOON_BREATHING_THEME } from '@/components/game/occupational/level10/session2/balloonBreathingTheme';
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

export const BalloonBreathingVisuals: React.FC = () => {
  const driftA = useSharedValue(0);
  const driftB = useSharedValue(0.3);

  useEffect(() => {
    driftA.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    driftB.value = withRepeat(
      withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [driftA, driftB]);

  const cloudA = useAnimatedStyle(() => ({
    transform: [{ translateX: driftA.value * 18 - 9 }],
    opacity: 0.35 + driftA.value * 0.15,
  }));
  const cloudB = useAnimatedStyle(() => ({
    transform: [{ translateX: driftB.value * -14 + 7 }],
    opacity: 0.28 + driftB.value * 0.12,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={BALLOON_BREATHING_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.cloud, styles.cloudLeft, cloudA]} />
      <Animated.View style={[styles.cloud, styles.cloudRight, cloudB]} />
      {BALLOON_BREATHING_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${5 + (i * 13) % 82}%`, top: `${8 + (i % 5) * 15}%`, opacity: 0.12 + (i % 2) * 0.06 },
          ]}
        >
          {d}
        </Text>
      ))}
      <View style={styles.horizon} />
    </View>
  );
};

const styles = StyleSheet.create({
  cloud: {
    position: 'absolute',
    width: 140,
    height: 52,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  cloudLeft: { top: '12%', left: '8%' },
  cloudRight: { top: '20%', right: '6%' },
  horizon: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  decor: { position: 'absolute', fontSize: 18 },
});
