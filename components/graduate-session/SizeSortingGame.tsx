/**
 * Game 4 — Sort by size. Small ball, Medium ball, Large ball. Child picks correct size for each. Session 6: Story Understanding.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const BALLS: { id: string; label: string; size: 'small' | 'medium' | 'large'; emojiSize: number }[] = [
  { id: 'small', label: 'Small ball', size: 'small', emojiSize: 28 },
  { id: 'medium', label: 'Medium ball', size: 'medium', emojiSize: 44 },
  { id: 'large', label: 'Large ball', size: 'large', emojiSize: 64 },
];
const VOICE = 'Sort the objects by size. Tap Small, Medium, or Large.';

export function SizeSortingGame({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeAnim] = useState(() => new Animated.Value(0));

  const current = BALLS[index];

  useEffect(() => {
    speak(VOICE, 0.75);
  }, []);

  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleSize = useCallback(
    (size: 'small' | 'medium' | 'large') => {
      if (size !== current.size) {
        speak('Try again.');
        triggerShake();
        return;
      }
      const sizeLabel = size === 'small' ? 'Small' : size === 'medium' ? 'Medium' : 'Large';
      speak(`Correct! This is a ${sizeLabel} ball!`);
      if (index >= BALLS.length - 1) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setIndex((i) => i + 1);
      }
    },
    [current, index, onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You sorted by size!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Sort by size"
      instruction="Sort the objects by size."
      icon="📐"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.prompt}>What size is this ball?</Text>
        <View style={styles.ballDisplay}>
          <Text style={[styles.ballEmoji, { fontSize: current.emojiSize }]}>⚽</Text>
          <Text style={styles.ballLabel}>{current.label}</Text>
        </View>
        <View style={styles.sizesRow}>
          <Animated.View style={{ transform: [{ translateX: current.size === 'medium' || current.size === 'large' ? shakeX : 0 }] }}>
            <Pressable
              onPress={() => handleSize('small')}
              style={({ pressed }) => [styles.sizeCard, pressed && styles.pressed]}
              accessibilityLabel="Small"
            >
              <Text style={styles.sizeEmoji}>⚽</Text>
              <Text style={styles.sizeLabel}>Small</Text>
            </Pressable>
          </Animated.View>
          <Animated.View style={{ transform: [{ translateX: current.size === 'small' || current.size === 'large' ? shakeX : 0 }] }}>
            <Pressable
              onPress={() => handleSize('medium')}
              style={({ pressed }) => [styles.sizeCard, pressed && styles.pressed]}
              accessibilityLabel="Medium"
            >
              <Text style={styles.sizeEmoji}>⚽</Text>
              <Text style={styles.sizeLabel}>Medium</Text>
            </Pressable>
          </Animated.View>
          <Animated.View style={{ transform: [{ translateX: current.size === 'small' || current.size === 'medium' ? shakeX : 0 }] }}>
            <Pressable
              onPress={() => handleSize('large')}
              style={({ pressed }) => [styles.sizeCard, pressed && styles.pressed]}
              accessibilityLabel="Large"
            >
              <Text style={styles.sizeEmoji}>⚽</Text>
              <Text style={styles.sizeLabel}>Large</Text>
            </Pressable>
          </Animated.View>
        </View>
        <Text style={styles.progress}>{index + 1} of {BALLS.length}</Text>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 8, alignItems: 'center' },
  prompt: { fontSize: 20, fontWeight: '800', color: '#374151', marginBottom: 20 },
  ballDisplay: {
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    padding: 28,
    borderWidth: 3,
    borderColor: '#8B5CF6',
    marginBottom: 24,
    alignItems: 'center',
    minWidth: 180,
  },
  ballEmoji: { marginBottom: 8 },
  ballLabel: { fontSize: 18, fontWeight: '800', color: '#5B21B6' },
  sizesRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  sizeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 4,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    minWidth: 90,
  },
  pressed: { opacity: 0.85 },
  sizeEmoji: { fontSize: 36, marginBottom: 6 },
  sizeLabel: { fontSize: 16, fontWeight: '800', color: '#1f2937' },
  progress: { fontSize: 14, color: '#6B7280', marginTop: 16 },
});
