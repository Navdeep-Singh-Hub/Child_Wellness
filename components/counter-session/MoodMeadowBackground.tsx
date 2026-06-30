import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { COUNTER_S8_HUB_THEME as T } from './counterSessionTheme';

const FACES = [
  { left: '12%', top: '16%', emoji: '😊', delay: 0 },
  { left: '62%', top: '10%', emoji: '😢', delay: 400 },
  { left: '78%', top: '32%', emoji: '😄', delay: 800 },
] as const;

const FLOWERS = [
  { left: '28%', bottom: '22%', delay: 200 },
  { left: '55%', bottom: '18%', delay: 600 },
] as const;

function MoodFloat({ left, top, emoji, delay }: { left: string; top: string; emoji: string; delay: number }) {
  const bob = useSharedValue(0);

  useEffect(() => {
    bob.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [bob, delay]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -bob.value * 10 }],
    opacity: 0.3 + bob.value * 0.25,
  }));

  return (
    <Animated.Text style={[styles.face, { left, top }, style]} pointerEvents="none">
      {emoji}
    </Animated.Text>
  );
}

function MeadowFlower({ left, bottom, delay }: { left: string; bottom: string; delay: number }) {
  const sway = useSharedValue(0);

  useEffect(() => {
    sway.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 3200, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      )
    );
  }, [delay, sway]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-8 + sway.value * 16}deg` }],
    opacity: 0.35 + sway.value * 0.2,
  }));

  return (
    <Animated.Text style={[styles.flower, { left, bottom }, style]} pointerEvents="none">
      🌼
    </Animated.Text>
  );
}

export function MoodMeadowBackground() {
  const glow = useSharedValue(0.85);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.85, { duration: 2600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + glow.value * 0.25,
    transform: [{ scale: 0.9 + glow.value * 0.12 }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.meadowGlow, glowStyle]} />
      {FACES.map((f, i) => (
        <MoodFloat key={i} {...f} />
      ))}
      {FLOWERS.map((f, i) => (
        <MeadowFlower key={i} {...f} />
      ))}
      <View style={[styles.hill, { backgroundColor: T.accentSoft }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  meadowGlow: {
    position: 'absolute',
    left: '38%',
    top: '12%',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(74, 222, 128, 0.22)',
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.38)',
  },
  face: { position: 'absolute', fontSize: 28 },
  flower: { position: 'absolute', fontSize: 26 },
  hill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '20%',
    opacity: 0.12,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
  },
});
