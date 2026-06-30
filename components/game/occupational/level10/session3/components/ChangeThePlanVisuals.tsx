/** Shift signal bridge backdrop — Change The Plan */
import { CHANGE_THE_PLAN_THEME } from '@/components/game/occupational/level10/session3/changeThePlanTheme';
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

export const ChangeThePlanVisuals: React.FC<{ switchFlash?: boolean }> = ({ switchFlash = false }) => {
  const scan = useSharedValue(0);
  useEffect(() => {
    scan.value = withRepeat(
      withTiming(1, { duration: switchFlash ? 400 : 2200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [scan, switchFlash]);

  const scanStyle = useAnimatedStyle(() => ({
    opacity: switchFlash ? 0.25 + scan.value * 0.35 : 0.08 + scan.value * 0.08,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={CHANGE_THE_PLAN_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.scanLine, scanStyle]} />
      {CHANGE_THE_PLAN_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${5 + (i * 11) % 84}%`, top: `${10 + (i % 5) * 15}%`, opacity: 0.1 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
      <View style={styles.consoleBar} />
    </View>
  );
};

const styles = StyleSheet.create({
  scanLine: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#2DD4BF',
  },
  consoleBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: 'rgba(15,23,42,0.55)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(45,212,191,0.3)',
  },
  decor: { position: 'absolute', fontSize: 17 },
});
