/**
 * Focus Field — distraction grid backdrop
 */
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function FocusFieldBackdrop() {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse]);
  const targetGlow = useAnimatedStyle(() => ({ opacity: 0.15 + pulse.value * 0.25 }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={['#14532D', '#166534', '#15803D']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.grid} />
      <Animated.View style={[styles.targetZone, targetGlow]} />
      {Array.from({ length: 10 }).map((_, i) => (
        <View key={i} style={[styles.decoy, { left: `${(i * 19 + 7) % 82 + 6}%`, top: `${(i * 27 + 11) % 70 + 12}%` }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { position: 'absolute', left: '8%', right: '8%', top: '15%', bottom: '15%', borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)', borderRadius: 16 },
  targetZone: { position: 'absolute', alignSelf: 'center', top: '38%', width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: 'rgba(74,222,128,0.45)', backgroundColor: 'rgba(74,222,128,0.08)' },
  decoy: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(148,163,184,0.4)' },
});
