/**
 * Level 5 Counter — Session 2, Game 2: Size Comparison
 * Select the largest object. Three objects (small, medium, large); correct: largest.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const OBJECTS = [
  { id: 'small', label: 'Small', emoji: '🔵', size: 'small' as const },
  { id: 'large', label: 'Largest', emoji: '🔵', size: 'large' as const },
  { id: 'medium', label: 'Medium', emoji: '🔵', size: 'medium' as const },
];

const CORRECT_ID = 'large';

export interface SizeComparisonCounterGameProps {
  onComplete: () => void;
}

export function SizeComparisonCounterGame({ onComplete }: SizeComparisonCounterGameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Which one is the largest? Tap the largest object.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Find the largest one!', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! That is the largest!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        triggerWrong();
      }
    },
    [onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Great Job!"
        subtitle="You found the largest!"
        badgeEmoji="📏"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Size Comparison"
      instruction="Tap the largest object."
      icon="📏"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Which one is the largest?</Text>
        <Animated.View style={[styles.objectsRow, { transform: [{ translateX: shakeX }] }]}>
          {OBJECTS.map((obj) => (
            <Pressable
              key={obj.id}
              onPress={() => handleTap(obj.id)}
              style={({ pressed }) => [
                styles.objBtn,
                obj.size === 'small' && styles.small,
                obj.size === 'medium' && styles.medium,
                obj.size === 'large' && styles.large,
                pressed && styles.pressed,
              ]}
              accessibilityLabel={obj.label}
            >
              <Text style={styles.emoji}>{obj.emoji}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 22, fontWeight: '800', color: '#0369A1', marginBottom: 28, textAlign: 'center' },
  objectsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 24, height: 120 },
  objBtn: {
    borderRadius: 999,
    borderWidth: 4,
    borderColor: '#38BDF8',
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: { width: 50, height: 50 },
  medium: { width: 72, height: 72 },
  large: { width: 96, height: 96 },
  emoji: { fontSize: 28 },
  pressed: { opacity: 0.9 },
});
