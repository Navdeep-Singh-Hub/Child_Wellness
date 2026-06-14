/**
 * StarTarget — a glowing star the child reaches toward (Star Reach Mission).
 * Positioned by normalized anchor; pulses while active, bursts when caught.
 */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  anchor: { x: number; y: number }; // normalized 0..1 within the stage
  active: boolean;
  caught: boolean;
};

export const StarTarget: React.FC<Props> = ({ anchor, active, caught }) => {
  const pulse = useSharedValue(0);
  const pop = useSharedValue(0);

  React.useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [pulse]);

  React.useEffect(() => {
    if (caught) pop.value = withSequence(withTiming(1, { duration: 220 }), withTiming(0, { duration: 220 }));
  }, [caught, pop]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: (active ? 1 + pulse.value * 0.16 : 0.85) + pop.value * 0.6 }],
    opacity: caught ? 1 - pop.value : active ? 1 : 0.5,
  }));

  return (
    <Animated.Text
      pointerEvents="none"
      style={[
        styles.star,
        {
          left: `${anchor.x * 100}%`,
          top: `${anchor.y * 100}%`,
        },
        style,
      ]}
    >
      {caught ? '✨' : '🌟'}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    fontSize: 52,
    marginLeft: -26,
    marginTop: -26,
    textShadowColor: 'rgba(253,224,71,0.9)',
    textShadowRadius: 16,
  },
});
