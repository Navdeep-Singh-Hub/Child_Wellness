/**
 * Shrink Zone — precision portal backdrop
 */
import { SHRINK_ZONE_THEME } from '@/components/game/occupational/level5/session7/shrinkZone/shrinkZoneTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export function ShrinkZoneBackdrop() {
  const T = SHRINK_ZONE_THEME;
  const pulse = useSharedValue(1);
  const shrink = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(0.85, { duration: 900, easing: Easing.inOut(Easing.sin) }), withTiming(1, { duration: 900 })), -1, false);
    shrink.value = withRepeat(withTiming(0.6, { duration: 2400, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse, shrink]);
  const portalAnim = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const coreAnim = useAnimatedStyle(() => ({ transform: [{ scale: shrink.value }], opacity: 0.5 + (1 - shrink.value) * 0.5 }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <Animated.View style={[styles.portal, { borderColor: T.portal }, portalAnim]}>
        <Animated.View style={[styles.portalCore, { backgroundColor: T.portalCore }, coreAnim]} />
      </Animated.View>
      <View style={styles.ringOuter} />
    </View>
  );
}

const styles = StyleSheet.create({
  portal: { position: 'absolute', alignSelf: 'center', top: '30%', width: 120, height: 120, borderRadius: 60, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  portalCore: { width: 60, height: 60, borderRadius: 30 },
  ringOuter: { position: 'absolute', alignSelf: 'center', top: '26%', width: 150, height: 150, borderRadius: 75, borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)' },
});
