import { TP_COLORS } from '@/constants/therapyProgressDesign';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';

export function TherapyProgressBackground() {
  const drift = useRef(new Animated.Value(0)).current;
  const drift2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let reduceMotion = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => { reduceMotion = !!v; })
      .catch(() => {});
    if (reduceMotion) return;

    const loop = (v: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      );
    const a1 = loop(drift, 14000);
    const a2 = loop(drift2, 18000);
    a1.start();
    a2.start();
    return () => { a1.stop(); a2.stop(); };
  }, [drift, drift2]);

  const blob1 = {
    transform: [
      { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [-10, 18] }) },
      { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [0, 24] }) },
    ],
  };
  const blob2 = {
    transform: [
      { translateX: drift2.interpolate({ inputRange: [0, 1], outputRange: [12, -16] }) },
      { translateY: drift2.interpolate({ inputRange: [0, 1], outputRange: [8, -12] }) },
    ],
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[TP_COLORS.page, '#FAF8F5', TP_COLORS.pageDeep, '#F0EDE8']}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.blob, styles.blobIndigo, blob1]} />
      <Animated.View style={[styles.blob, styles.blobSage, blob2]} />
      <Animated.View style={[styles.blob, styles.blobRose, blob1]} />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.45,
  },
  blobIndigo: {
    width: 220,
    height: 220,
    top: -40,
    right: -60,
    backgroundColor: '#C7D2FE',
  },
  blobSage: {
    width: 180,
    height: 180,
    bottom: 120,
    left: -50,
    backgroundColor: '#A7F3D0',
  },
  blobRose: {
    width: 140,
    height: 140,
    top: '42%',
    right: -30,
    backgroundColor: '#FBCFE8',
  },
});
