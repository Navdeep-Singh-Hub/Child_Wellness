import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { TimingGrade } from '@/components/game/occupational/level3/session1/rhythmUtils';

const LABELS: Record<TimingGrade, string> = {
  perfect: 'PERFECT!',
  good: 'GOOD',
  miss: 'MISS',
};

const COLORS: Record<TimingGrade, string> = {
  perfect: '#FBBF24',
  good: '#60A5FA',
  miss: '#F87171',
};

type Props = { grade: TimingGrade | null; visible: boolean };

export const TimingBadge: React.FC<Props> = ({ grade, visible }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible && grade) {
      opacity.value = withTiming(1, { duration: 80 });
      scale.value = withSequence(withSpring(1.15, { damping: 8 }), withSpring(1));
      const t = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 200 });
      }, 700);
      return () => clearTimeout(t);
    }
    opacity.value = 0;
    scale.value = 0;
  }, [grade, visible, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!grade) return null;

  return (
    <Animated.View style={[styles.badge, { backgroundColor: COLORS[grade] }, style]} pointerEvents="none">
      <Text style={styles.text}>{LABELS[grade]}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  text: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
});
