/**
 * Layer Stack — depth layers backdrop
 */
import { LAYER_STACK_THEME } from '@/components/game/occupational/level5/session7/layerStack/layerStackTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function LayerStackBackdrop() {
  const T = LAYER_STACK_THEME;
  const float = useSharedValue(0);
  useEffect(() => {
    float.value = withRepeat(withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [float]);
  const frontStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -float.value * 4 }] }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.stackBack, { borderColor: T.stackBack }]} />
      <View style={[styles.stackMid, { borderColor: T.stackMid }]} />
      <Animated.View style={[styles.stackFront, { borderColor: T.stackFront }, frontStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  stackBack: { position: 'absolute', left: '18%', top: '50%', width: '50%', height: '18%', borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', opacity: 0.4 },
  stackMid: { position: 'absolute', left: '28%', top: '42%', width: '50%', height: '18%', borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', opacity: 0.55 },
  stackFront: { position: 'absolute', left: '38%', top: '34%', width: '50%', height: '18%', borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', opacity: 0.7 },
});
