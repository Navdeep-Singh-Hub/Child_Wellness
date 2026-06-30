/**
 * Ball Duel — twin-track arena backdrop
 */
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function BallDuelBackdrop() {
  const glow = useSharedValue(0);
  useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [glow]);
  const laneStyle = useAnimatedStyle(() => ({ opacity: 0.25 + glow.value * 0.2 }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={['#0C4A6E', '#0369A1', '#0284C7']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.floor} />
      <View style={styles.centerLine} />
      <Animated.View style={[styles.laneLeft, laneStyle]} />
      <Animated.View style={[styles.laneRight, laneStyle]} />
      <Text style={styles.cornerStar}>⭐</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  floor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%', backgroundColor: 'rgba(0,0,0,0.22)' },
  centerLine: { position: 'absolute', bottom: '28%', left: '10%', right: '10%', height: 2, backgroundColor: 'rgba(56,189,248,0.45)' },
  laneLeft: { position: 'absolute', left: '18%', top: '30%', bottom: '32%', width: 2, backgroundColor: 'rgba(125,211,252,0.5)' },
  laneRight: { position: 'absolute', right: '18%', top: '30%', bottom: '32%', width: 2, backgroundColor: 'rgba(125,211,252,0.5)' },
  cornerStar: { position: 'absolute', top: '12%', right: '14%', fontSize: 22, opacity: 0.5 },
});
