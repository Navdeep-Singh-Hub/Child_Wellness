/**
 * DistractionLayer — playful animated emojis that drift across the stage to
 * challenge focus during Statue Kingdom and Crown Keeper. Purely visual.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

const EMOJIS = ['🦋', '🐝', '🎈', '🐠', '🪁', '⭐', '🦜', '🍃'];

type Props = { trigger: number };

const Floater: React.FC<{ id: number }> = ({ id }) => {
  const progress = useSharedValue(0);
  const fromLeft = id % 2 === 0;
  const topPct = 18 + ((id * 37) % 60);
  const emoji = EMOJIS[id % EMOJIS.length];

  React.useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 2600, easing: Easing.linear });
  }, [id, progress]);

  const style = useAnimatedStyle(() => ({
    left: `${(fromLeft ? progress.value : 1 - progress.value) * 100}%`,
    opacity: progress.value < 0.1 ? progress.value * 10 : progress.value > 0.9 ? (1 - progress.value) * 10 : 1,
    transform: [{ translateY: Math.sin(progress.value * Math.PI * 2) * 16 }],
  }));

  return (
    <Animated.Text pointerEvents="none" style={[styles.floater, { top: `${topPct}%` }, style]}>
      {emoji}
    </Animated.Text>
  );
};

export const DistractionLayer: React.FC<Props> = ({ trigger }) => {
  if (trigger <= 0) return null;
  // Keying by trigger remounts a fresh floater each time the engine fires one.
  return <Floater key={trigger} id={trigger} />;
};

const styles = StyleSheet.create({
  floater: { position: 'absolute', fontSize: 40, marginLeft: -20 },
});
