/**
 * Royal-themed distractions — sparkles, stars, and gentle palace floaters.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const EMOJIS = ['✨', '💫', '🌟', '🦋', '🪶', '⭐', '🌙', '💎'];

type Props = { trigger: number; reduceMotion?: boolean };

const Floater: React.FC<{ id: number; reduceMotion?: boolean }> = ({ id, reduceMotion }) => {
  const progress = useSharedValue(reduceMotion ? 0.5 : 0);
  const fromLeft = id % 2 === 0;
  const topPct = 20 + ((id * 31) % 55);
  const emoji = EMOJIS[id % EMOJIS.length];

  React.useEffect(() => {
    if (reduceMotion) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) });
  }, [id, progress, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    left: `${(fromLeft ? progress.value : 1 - progress.value) * 92 + 4}%`,
    opacity: reduceMotion ? 0.35 : progress.value < 0.12 ? progress.value * 8 : progress.value > 0.88 ? (1 - progress.value) * 8 : 0.85,
    transform: [
      { translateY: Math.sin(progress.value * Math.PI * 2) * 12 },
      { scale: 0.85 + Math.sin(progress.value * Math.PI) * 0.15 },
    ],
  }));

  return (
    <Animated.Text pointerEvents="none" style={[styles.floater, { top: `${topPct}%` }, style]}>
      {emoji}
    </Animated.Text>
  );
};

export function RoyalDistractionLayer({ trigger, reduceMotion = false }: Props) {
  if (trigger <= 0) return null;
  return <Floater key={trigger} id={trigger} reduceMotion={reduceMotion} />;
}

const styles = StyleSheet.create({
  floater: { position: 'absolute', fontSize: 36, marginLeft: -18 },
});
