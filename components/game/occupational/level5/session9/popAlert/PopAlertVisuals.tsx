import { POP_ALERT_THEME } from '@/components/game/occupational/level5/session9/popAlert/popAlertTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function PopAlertBackdrop() {
  const T = POP_ALERT_THEME;
  const spin = useSharedValue(0);
  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 8000, easing: Easing.linear }), -1, false);
  }, [spin]);
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      {['🎪', '✨', '🎉'].map((e, i) => (
        <Text key={i} style={[styles.carnival, { left: `${20 + i * 28}%`, top: `${12 + (i % 2) * 5}%` }]}>{e}</Text>
      ))}
      <Animated.View style={[styles.popRing, { borderColor: `${T.accent}44` }, ringStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  carnival: { position: 'absolute', fontSize: 22, opacity: 0.5 },
  popRing: { position: 'absolute', alignSelf: 'center', top: '38%', width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderStyle: 'dashed' },
});
