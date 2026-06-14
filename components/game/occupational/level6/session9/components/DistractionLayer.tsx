/**
 * DistractionLayer — floating emojis that drift across the stage during holds,
 * challenging the child's focus and motor inhibition (purely visual). Spawns a
 * new drifter on an interval while `active`.
 */
import React from 'react';
import { Dimensions, StyleSheet, Text } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');

type Item = { id: number; emoji: string; top: number; fromLeft: boolean };

const FloatingItem: React.FC<{ item: Item; onDone: (id: number) => void }> = ({ item, onDone }) => {
  const progress = useSharedValue(0);
  React.useEffect(() => {
    progress.value = withTiming(1, { duration: 3200 }, (finished) => {
      if (finished) runOnJS(onDone)(item.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => {
    const travel = SCREEN_W + 120;
    const x = item.fromLeft ? -80 + progress.value * travel : SCREEN_W + 40 - progress.value * travel;
    const wobble = Math.sin(progress.value * Math.PI * 3) * 16;
    return {
      transform: [{ translateX: x }, { translateY: wobble }, { scale: 0.9 + progress.value * 0.2 }],
      opacity: progress.value < 0.1 ? progress.value * 10 : progress.value > 0.9 ? (1 - progress.value) * 10 : 1,
    };
  });

  return <Animated.Text style={[styles.emoji, { top: item.top }, style]}>{item.emoji}</Animated.Text>;
};

export const DistractionLayer: React.FC<{ emojis: string[]; active: boolean; intervalMs: number }> = ({
  emojis,
  active,
  intervalMs,
}) => {
  const [items, setItems] = React.useState<Item[]>([]);
  const idRef = React.useRef(0);

  React.useEffect(() => {
    if (!active || emojis.length === 0) return;
    const timer = setInterval(() => {
      const id = idRef.current++;
      setItems((prev) => [
        ...prev.slice(-4),
        {
          id,
          emoji: emojis[Math.floor(Math.random() * emojis.length)]!,
          top: 60 + Math.random() * 220,
          fromLeft: Math.random() < 0.5,
        },
      ]);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [active, emojis, intervalMs]);

  const remove = React.useCallback((id: number) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  return (
    <>
      {items.map((it) => (
        <FloatingItem key={it.id} item={it} onDone={remove} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  emoji: { position: 'absolute', left: 0, fontSize: 40 },
});
