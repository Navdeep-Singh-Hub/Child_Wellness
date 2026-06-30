/**
 * Red Radar — radar sweep arena backdrop
 */
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function RedRadarBackdrop() {
  const sweep = useSharedValue(0);
  const pulse = useSharedValue(0);
  useEffect(() => {
    sweep.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [sweep, pulse]);
  const sweepStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${sweep.value * 360}deg` }] }));
  const blipStyle = useAnimatedStyle(() => ({ opacity: 0.3 + pulse.value * 0.5 }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={['#450A0A', '#7F1D1D', '#991B1B']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.ring} />
      <View style={[styles.ring, { width: '50%', height: '50%' }]} />
      <View style={[styles.ring, { width: '25%', height: '25%', borderColor: 'rgba(248,113,113,0.5)' }]} />
      <Animated.View style={[styles.sweep, sweepStyle]} />
      <Animated.View style={[styles.blip, blipStyle]} />
      <View style={styles.crossH} />
      <View style={styles.crossV} />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { position: 'absolute', alignSelf: 'center', top: '20%', width: '70%', aspectRatio: 1, borderRadius: 9999, borderWidth: 1.5, borderColor: 'rgba(248,113,113,0.35)' },
  sweep: { position: 'absolute', alignSelf: 'center', top: '20%', width: '35%', height: 2, backgroundColor: 'rgba(248,113,113,0.55)', transformOrigin: 'left center' },
  blip: { position: 'absolute', top: '38%', right: '32%', width: 10, height: 10, borderRadius: 5, backgroundColor: '#F87171' },
  crossH: { position: 'absolute', alignSelf: 'center', top: '55%', width: '70%', height: 1, backgroundColor: 'rgba(248,113,113,0.15)' },
  crossV: { position: 'absolute', alignSelf: 'center', top: '20%', width: 1, height: '70%', backgroundColor: 'rgba(248,113,113,0.15)' },
});
