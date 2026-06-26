import { HOME_GRADIENTS, HOME_SHADOW, HOME_TYPE } from '@/constants/homeDesign';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  onPress: () => void;
};

export function HomeJourneyCard({ onPress }: Props) {
  const shine = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shine, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(shine, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, [float, shine]);

  const shineX = shine.interpolate({ inputRange: [0, 1], outputRange: [-180, 340] });
  const bob = float.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.press, pressed && { transform: [{ scale: 0.985 }] }]}
      accessibilityRole="button"
      accessibilityLabel="Open Therapy Progress. Continue your journey."
    >
      <Animated.View style={[styles.card, HOME_SHADOW.glow('#14B8A6'), { transform: [{ translateY: bob }] }]}>
        <LinearGradient colors={[...HOME_GRADIENTS.journey]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={styles.pattern}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, { left: 24 + i * 28, opacity: 0.15 + i * 0.05 }]} />
          ))}
        </View>
        <Animated.View style={[styles.shine, { transform: [{ translateX: shineX }] }]}>
          <LinearGradient colors={[...HOME_GRADIENTS.journeyShine]} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <View style={styles.row}>
          <View style={styles.iconOrb}>
            <Ionicons name="map" size={26} color="#FFFFFF" />
          </View>
          <View style={styles.copy}>
            <Text style={styles.eyebrow}>CONTINUE YOUR JOURNEY</Text>
            <Text style={styles.title}>Therapy Progress</Text>
            <Text style={styles.caption}>Pick up where you left off · Level up with games</Text>
          </View>
          <View style={styles.chevron}>
            <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { marginTop: 4 },
  card: { borderRadius: 28, overflow: 'hidden', minHeight: 108 },
  pattern: { ...StyleSheet.absoluteFillObject },
  dot: {
    position: 'absolute',
    top: 18,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  shine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
    opacity: 0.7,
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 22, gap: 16 },
  iconOrb: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  copy: { flex: 1 },
  eyebrow: { ...HOME_TYPE.micro, color: 'rgba(255,255,255,0.85)', marginBottom: 6 },
  title: { ...HOME_TYPE.h2, color: '#FFFFFF', marginBottom: 4 },
  caption: { ...HOME_TYPE.caption, color: 'rgba(255,255,255,0.9)' },
  chevron: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
