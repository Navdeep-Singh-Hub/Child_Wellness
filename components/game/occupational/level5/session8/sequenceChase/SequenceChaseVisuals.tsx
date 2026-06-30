/**
 * Sequence Chase — pattern stage backdrop
 */
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function SequenceChaseBackdrop() {
  const glow = useSharedValue(0);
  useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [glow]);
  const stageGlow = useAnimatedStyle(() => ({ borderColor: `rgba(192,132,252,${0.25 + glow.value * 0.25})` }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={['#4C1D95', '#6B21A8', '#7E22CE']} style={StyleSheet.absoluteFillObject} />
      <Animated.View style={[styles.stage, stageGlow]} />
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[styles.slot, { left: `${12 + i * 22}%` }]}>
          <View style={styles.slotInner} />
        </View>
      ))}
      <View style={styles.recallBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { position: 'absolute', left: '6%', right: '6%', top: '22%', height: '38%', borderRadius: 20, borderWidth: 2, backgroundColor: 'rgba(192,132,252,0.08)' },
  slot: { position: 'absolute', top: '30%', width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: 'rgba(192,132,252,0.35)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  slotInner: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(192,132,252,0.12)' },
  recallBar: { position: 'absolute', left: '10%', right: '10%', top: '68%', height: 4, borderRadius: 2, backgroundColor: 'rgba(192,132,252,0.25)' },
});
