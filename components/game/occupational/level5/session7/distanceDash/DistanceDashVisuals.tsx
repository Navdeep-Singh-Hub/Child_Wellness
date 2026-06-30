/**
 * Distance Dash — horizon path backdrop
 */
import { DISTANCE_DASH_THEME } from '@/components/game/occupational/level5/session7/distanceDash/distanceDashTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function DistanceDashBackdrop() {
  const T = DISTANCE_DASH_THEME;
  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = withRepeat(withTiming(1, { duration: 5000, easing: Easing.linear }), -1, false);
  }, [drift]);
  const markerStyle = useAnimatedStyle(() => ({ opacity: 0.4 + drift.value * 0.3 }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.horizon, { backgroundColor: T.horizon }]} />
      <View style={[styles.road, { borderColor: T.road }]} />
      <View style={[styles.vanish, { backgroundColor: T.vanish }]} />
      <Animated.View style={[styles.depthMarker, markerStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  horizon: { position: 'absolute', left: 0, right: 0, top: '42%', height: 2 },
  road: { position: 'absolute', bottom: '8%', left: '18%', right: '18%', height: '35%', borderLeftWidth: 2, borderRightWidth: 2, borderStyle: 'dashed', opacity: 0.4 },
  vanish: { position: 'absolute', alignSelf: 'center', top: '40%', width: 60, height: 60, borderRadius: 30 },
  depthMarker: { position: 'absolute', alignSelf: 'center', bottom: '22%', width: 14, height: 14, borderRadius: 7, backgroundColor: '#FACC15', borderWidth: 2, borderColor: '#FDE68A' },
});
