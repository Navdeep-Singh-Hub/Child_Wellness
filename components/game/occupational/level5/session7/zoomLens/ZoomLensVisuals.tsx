/**
 * Zoom Lens — magnifier lab backdrop
 */
import { ZOOM_LENS_THEME } from '@/components/game/occupational/level5/session7/zoomLens/zoomLensTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function ZoomLensBackdrop() {
  const T = ZOOM_LENS_THEME;
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse]);
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: 0.95 + pulse.value * 0.08 }] }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <Animated.View style={[styles.lensRing, { borderColor: T.ring }, ringStyle]} />
      <View style={[styles.crossH, { backgroundColor: T.cross }]} />
      <View style={[styles.crossV, { backgroundColor: T.cross }]} />
      <View style={[styles.focusDot, { backgroundColor: T.accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  lensRing: { position: 'absolute', alignSelf: 'center', top: '28%', width: 140, height: 140, borderRadius: 70, borderWidth: 3 },
  crossH: { position: 'absolute', alignSelf: 'center', top: '35%', width: 160, height: 2 },
  crossV: { position: 'absolute', alignSelf: 'center', top: '28%', width: 2, height: 160 },
  focusDot: { position: 'absolute', alignSelf: 'center', top: '35%', width: 8, height: 8, borderRadius: 4, marginTop: -3, marginLeft: -3 },
});
