import { LIGHTNING_FLASH_THEME } from '@/components/game/occupational/level5/session9/lightningFlash/lightningFlashTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function LightningFlashBackdrop() {
  const T = LIGHTNING_FLASH_THEME;
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse]);
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.12 + pulse.value * 0.18 }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      {Array.from({ length: 16 }).map((_, i) => (
        <View key={i} style={[styles.gridDot, { left: `${(i % 4) * 25 + 12}%`, top: `${Math.floor(i / 4) * 22 + 15}%`, borderColor: `${T.accent}22` }]} />
      ))}
      <Animated.View style={[styles.flashGlow, { backgroundColor: `${T.accent}15` }, glowStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  gridDot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, borderWidth: 1 },
  flashGlow: { position: 'absolute', alignSelf: 'center', top: '35%', width: 120, height: 120, borderRadius: 60 },
});
