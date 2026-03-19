/**
 * Game 1 — Position Hunt. 3 tasks: Find what is IN box (ball), ON table (cup), UNDER chair (cat). Session 10: Logic Lab Master.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const TASKS: {
  prompt: string;
  correctId: string;
  voice: string;
}[] = [
  { prompt: 'Find what is IN the box', correctId: 'ball', voice: 'Tap the object that is IN the box.' },
  { prompt: 'Find what is ON the table', correctId: 'cup', voice: 'Tap the object that is ON the table.' },
  { prompt: 'Find what is UNDER the chair', correctId: 'cat', voice: 'Tap the object that is UNDER the chair.' },
];
const ITEMS = [
  { id: 'ball', label: 'Ball', emoji: '⚽' },
  { id: 'cup', label: 'Cup', emoji: '☕' },
  { id: 'cat', label: 'Cat', emoji: '🐱' },
];

export function PositionHuntLogicLabMaster({ onComplete }: { onComplete: () => void }) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeAnim] = useState(() => new Animated.Value(0));

  const task = TASKS[taskIndex];
  const isLast = taskIndex === TASKS.length - 1;

  useEffect(() => {
    speak(task.voice, 0.75);
  }, [taskIndex]);

  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleTap = useCallback(
    (id: string) => {
      if (id !== task.correctId) {
        speak('Try again.');
        triggerShake();
        return;
      }
      speak('Correct!');
      if (isLast) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setTaskIndex((i) => i + 1);
      }
    },
    [task.correctId, isLast, onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You found them all!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Find the correct position"
      instruction="Tap the object that matches the position."
      icon="📍"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.prompt}>{task.prompt}</Text>
        <View style={styles.itemsRow}>
          {ITEMS.map((item) => (
            <Animated.View
              key={item.id}
              style={{ transform: [{ translateX: item.id === task.correctId ? 0 : shakeX }] }}
            >
              <Pressable
                onPress={() => handleTap(item.id)}
                style={({ pressed }) => [styles.itemCard, pressed && styles.pressed]}
                accessibilityLabel={item.label}
              >
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <Text style={styles.itemLabel}>{item.label}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
        <Text style={styles.progressText}>Task {taskIndex + 1} of {TASKS.length}</Text>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 8, alignItems: 'center' },
  prompt: { fontSize: 20, fontWeight: '800', color: '#3730A3', marginBottom: 24, textAlign: 'center' },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 },
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 4,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    minWidth: 100,
  },
  pressed: { opacity: 0.85 },
  itemEmoji: { fontSize: 48, marginBottom: 8 },
  itemLabel: { fontSize: 16, fontWeight: '800', color: '#374151' },
  progressText: { fontSize: 14, color: '#6B7280', marginTop: 24 },
});
