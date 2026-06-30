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
import { SCRIBBLE_STUDIO_THEME as T } from './gripSessionTheme';

const FLOATERS = [
  { emoji: '✏️', left: '8%', top: '14%', size: 28, delay: 0 },
  { emoji: '🖍️', left: '82%', top: '18%', size: 32, delay: 400 },
  { emoji: '⭐', left: '72%', top: '62%', size: 22, delay: 800 },
  { emoji: '🌈', left: '12%', top: '68%', size: 26, delay: 200 },
  { emoji: '✨', left: '88%', top: '42%', size: 20, delay: 600 },
  { emoji: '🎨', left: '6%', top: '42%', size: 30, delay: 1000 },
] as const;

function FloatingEmoji({
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
  const spin = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(
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
    spin.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(8, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
          withTiming(-8, { duration: 3200, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      )
    );
  }, [delay, drift, spin]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: drift.value * -14 },
      { rotate: `${spin.value}deg` },
    ],
    opacity: 0.35 + drift.value * 0.25,
  }));

  return (
    <Animated.Text
      style={[
        styles.floater,
        { left, top, fontSize: size },
        style,
      ]}
      pointerEvents="none"
    >
      {emoji}
    </Animated.Text>
  );
}

/** Soft ambient art-supply decorations for the scribble studio */
export function ScribbleStudioBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.blob, styles.blobA]} />
      <View style={[styles.blob, styles.blobB]} />
      <View style={[styles.blob, styles.blobC]} />
      {FLOATERS.map((f) => (
        <FloatingEmoji key={`${f.emoji}-${f.left}`} {...f} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  floater: {
    position: 'absolute',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.22,
  },
  blobA: {
    width: 220,
    height: 220,
    backgroundColor: T.accentSoft,
    top: -60,
    right: -40,
  },
  blobB: {
    width: 180,
    height: 180,
    backgroundColor: '#F9A8D4',
    bottom: 80,
    left: -50,
  },
  blobC: {
    width: 140,
    height: 140,
    backgroundColor: '#FDE047',
    bottom: -30,
    right: 40,
  },
});
