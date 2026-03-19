/**
 * Builder Session 5 — Game 1: Trace the Shape
 * User traces a triangle by tapping the three corners in order (connect the dots).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const CORNERS = [
  { id: 'top', label: 'Top', order: 0 },
  { id: 'left', label: 'Bottom left', order: 1 },
  { id: 'right', label: 'Bottom right', order: 2 },
];

export interface TraceShapeGameProps {
  onComplete: () => void;
}

export function TraceShapeGame({ onComplete }: TraceShapeGameProps) {
  const [traced, setTraced] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Trace the triangle. Tap the dots in order: top, then bottom left, then bottom right.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Tap the dots in order to trace the triangle.', 0.7);
  }, [wrongShake]);

  const handleDotTap = useCallback(
    (order: number) => {
      if (order !== traced) {
        triggerWrong();
        return;
      }
      setTraced((t) => t + 1);
      speak(CORNERS.find((c) => c.order === order)?.label ?? '', 0.6);
      if (traced + 1 >= 3) {
        speak('You traced the triangle!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [traced, onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Great Job!"
        subtitle="You traced the triangle!"
        badgeEmoji="🔺"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Trace the Shape"
      instruction="Tap the dots in order to trace the triangle."
      icon="🔺"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Tap: 1 → 2 → 3</Text>
        <Animated.View style={[styles.triangleWrap, { transform: [{ translateX: shakeX }] }]}>
          <View style={styles.triangle}>
            <Pressable
              style={[styles.dot, traced > 0 && styles.dotTraced]}
              onPress={() => handleDotTap(0)}
              accessibilityLabel="Top dot"
            >
              <Text style={styles.dotNum}>1</Text>
            </Pressable>
            <Pressable
              style={[styles.dot, styles.dotLeft, traced > 1 && styles.dotTraced]}
              onPress={() => handleDotTap(1)}
              accessibilityLabel="Bottom left dot"
            >
              <Text style={styles.dotNum}>2</Text>
            </Pressable>
            <Pressable
              style={[styles.dot, styles.dotRight, traced > 2 && styles.dotTraced]}
              onPress={() => handleDotTap(2)}
              accessibilityLabel="Bottom right dot"
            >
              <Text style={styles.dotNum}>3</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#4F46E5', marginBottom: 20 },
  triangleWrap: { width: 200, height: 180 },
  triangle: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    borderWidth: 4,
    borderColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: '50%',
    marginLeft: -24,
  },
  dotLeft: { top: 120, left: 20 },
  dotRight: { top: 120, left: undefined, right: 20 },
  dotTraced: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  dotNum: { fontSize: 18, fontWeight: '800', color: '#FFF' },
});
