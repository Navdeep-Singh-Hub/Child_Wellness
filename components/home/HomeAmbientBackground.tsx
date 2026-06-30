/**
 * Layered mesh gradient + slow aurora blobs — sensory-friendly motion.
 */
import { HOME_GRADIENTS } from '@/constants/homeDesign';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';

export function HomeAmbientBackground() {
  const drift1 = useRef(new Animated.Value(0)).current;
  const drift2 = useRef(new Animated.Value(0)).current;
  const drift3 = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let reduceMotion = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => { reduceMotion = !!v; })
      .catch(() => {});

    if (reduceMotion) return;

    const loop = (v: Animated.Value, duration: number, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      );

    const a1 = loop(drift1, 11000, 0);
    const a2 = loop(drift2, 14000, 400);
    const a3 = loop(drift3, 17000, 800);
    const a4 = loop(pulse, 9000, 200);
    a1.start();
    a2.start();
    a3.start();
    a4.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
      a4.stop();
    };
  }, [drift1, drift2, drift3, pulse]);

  const blob1Style = {
    transform: [
      { translateX: drift1.interpolate({ inputRange: [0, 1], outputRange: [0, 28] }) },
      { translateY: drift1.interpolate({ inputRange: [0, 1], outputRange: [0, 18] }) },
      { scale: drift1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) },
    ],
  };
  const blob2Style = {
    transform: [
      { translateX: drift2.interpolate({ inputRange: [0, 1], outputRange: [0, -24] }) },
      { translateY: drift2.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
      { scale: drift2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) },
    ],
  };
  const blob3Style = {
    transform: [
      { translateX: drift3.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) },
      { translateY: drift3.interpolate({ inputRange: [0, 1], outputRange: [0, 14] }) },
    ],
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...HOME_GRADIENTS.page]} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.blob, styles.blob1, blob1Style]} />
      <Animated.View style={[styles.blob, styles.blob2, blob2Style]} />
      <Animated.View style={[styles.blob, styles.blob3, blob3Style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blob1: {
    width: 280,
    height: 280,
    top: -80,
    right: -100,
    backgroundColor: 'rgba(167, 139, 250, 0.22)',
  },
  blob2: {
    width: 220,
    height: 220,
    bottom: 80,
    left: -70,
    backgroundColor: 'rgba(45, 212, 191, 0.18)',
  },
  blob3: {
    width: 160,
    height: 160,
    top: '45%',
    right: -40,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
  },
});
