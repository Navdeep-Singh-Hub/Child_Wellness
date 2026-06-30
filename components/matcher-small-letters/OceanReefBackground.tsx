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
import { LETTER_LAGOON_THEME as T } from './matcherSessionTheme';

const BUBBLES = [
  { left: '8%', size: 18, delay: 0, duration: 3200 },
  { left: '22%', size: 12, delay: 400, duration: 2800 },
  { left: '45%', size: 22, delay: 200, duration: 3600 },
  { left: '68%', size: 14, delay: 600, duration: 3000 },
  { left: '85%', size: 20, delay: 100, duration: 3400 },
] as const;

const FLOATERS = [
  { emoji: '🐠', left: '10%', top: '18%', size: 26, delay: 0 },
  { emoji: '🦀', left: '80%', top: '14%', size: 24, delay: 500 },
  { emoji: '🌊', left: '6%', top: '62%', size: 28, delay: 300 },
  { emoji: '🐚', left: '84%', top: '58%', size: 22, delay: 800 },
] as const;

function RisingBubble({ left, size, delay, duration }: { left: string; size: number; delay: number; duration: number }) {
  const rise = useSharedValue(0);
  const sway = useSharedValue(0);

  useEffect(() => {
    rise.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 0 })
        ),
        -1,
        false
      )
    );
    sway.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(8, { duration: duration * 0.5 }),
          withTiming(-8, { duration: duration * 0.5 })
        ),
        -1,
        false
      )
    );
  }, [delay, duration, rise, sway]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: -rise.value * 120 },
      { translateX: sway.value },
    ],
    opacity: 0.15 + rise.value * 0.45,
  }));

  return (
    <Animated.View
      style={[
        styles.risingBubble,
        { left, width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
      pointerEvents="none"
    />
  );
}

function FloatingSeaEmoji({
  emoji,
  left,
  top,
  size,
  delay,
}: {
  emoji: string;
  left: string;
  top: string;
  size: number;
  delay: number;
}) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, drift]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: drift.value * -12 }],
    opacity: 0.4 + drift.value * 0.25,
  }));

  return (
    <Animated.Text style={[styles.floater, { left, top, fontSize: size }, style]} pointerEvents="none">
      {emoji}
    </Animated.Text>
  );
}

export function OceanReefBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.waveBack} />
      <View style={styles.waveFront} />
      {BUBBLES.map((b, i) => (
        <RisingBubble key={`b-${i}`} {...b} />
      ))}
      {FLOATERS.map((f) => (
        <FloatingSeaEmoji key={`${f.emoji}-${f.left}`} {...f} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  risingBubble: {
    position: 'absolute',
    bottom: '8%',
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  floater: { position: 'absolute' },
  waveBack: {
    position: 'absolute',
    width: '140%',
    height: 160,
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    bottom: -30,
    left: '-20%',
  },
  waveFront: {
    position: 'absolute',
    width: '120%',
    height: 100,
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    bottom: -40,
    right: '-10%',
  },
});
