/**
 * Speed Storm — velocity swirl backdrop
 */
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function SpeedStormBackdrop() {
  const flash = useSharedValue(0);
  const swirl = useSharedValue(0);
  useEffect(() => {
    flash.value = withRepeat(withTiming(1, { duration: 1800 }), -1, true);
    swirl.value = withRepeat(withTiming(1, { duration: 4000, easing: Easing.linear }), -1, false);
  }, [flash, swirl]);
  const flashStyle = useAnimatedStyle(() => ({ opacity: 0.04 + flash.value * 0.1 }));
  const streakStyle = useAnimatedStyle(() => ({ left: `${-20 + swirl.value * 140}%` }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={['#78350F', '#92400E', '#B45309']} style={StyleSheet.absoluteFillObject} />
      <Animated.View style={[styles.flash, flashStyle]} />
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={[styles.windLine, { top: `${12 + i * 13}%`, opacity: 0.08 + i * 0.04 }]} />
      ))}
      <Animated.View style={[styles.streak, streakStyle]} />
      <Animated.View style={[styles.streak, styles.streakSlow, { left: '20%' }, streakStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  flash: { ...StyleSheet.absoluteFillObject, backgroundColor: '#FBBF24' },
  windLine: { position: 'absolute', left: '5%', right: '5%', height: 2, backgroundColor: 'rgba(251,191,36,0.35)' },
  streak: { position: 'absolute', top: '35%', width: 60, height: 4, borderRadius: 2, backgroundColor: 'rgba(251,191,36,0.55)' },
  streakSlow: { top: '58%', width: 40, height: 3, opacity: 0.4 },
});
