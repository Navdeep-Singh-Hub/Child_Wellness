/**
 * Level 9 (Clockwise) — Session 9, Game 1: Logical Reasoning
 * Which item doesn't belong: spoon, fork, knife, chair. Answer: chair (utensils vs furniture).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ITEMS = [
  { id: 'spoon', label: 'Spoon', emoji: '🥄' },
  { id: 'fork', label: 'Fork', emoji: '🍴' },
  { id: 'knife', label: 'Knife', emoji: '🔪' },
  { id: 'chair', label: 'Chair', emoji: '🪑' },
];
const CORRECT_ID = 'chair';

export interface LogicalReasoningLevel9Session9GameProps {
  onComplete: () => void;
}

export function LogicalReasoningLevel9Session9Game({ onComplete }: LogicalReasoningLevel9Session9GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Which one does NOT belong? Spoon, fork, knife, chair. Tap the one that is different.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Which one is not like the others?', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! The chair does not belong — the others are utensils!', 0.75);
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
        variant="indigo"
        title="Great Job!"
        subtitle="You found the one that doesn't belong!"
        badgeEmoji="🧠"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Logical Reasoning"
      instruction="Which one does NOT belong? Spoon, fork, knife, chair."
      icon="🧠"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Which one does NOT belong?</Text>
        <View style={styles.itemsRow}>
          {ITEMS.map((item) => (
            <View key={item.id} style={styles.itemBox}>
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.tapLabel}>Tap the one that is different</Text>
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
          {ITEMS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleTap(item.id)}
              style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
              accessibilityLabel={item.label}
            >
              <Text style={styles.optionEmoji}>{item.emoji}</Text>
              <Text style={styles.optionLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 20, fontWeight: '800', color: '#4338CA', marginBottom: 20, textAlign: 'center' },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 20 },
  itemBox: { alignItems: 'center' },
  itemEmoji: { fontSize: 36, marginBottom: 4 },
  itemLabel: { fontSize: 14, fontWeight: '700', color: '#4338CA' },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  optionBtn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#818CF8',
    alignItems: 'center',
    minWidth: 80,
  },
  pressed: { opacity: 0.9, backgroundColor: '#EEF2FF' },
  optionEmoji: { fontSize: 36, marginBottom: 6 },
  optionLabel: { fontSize: 14, fontWeight: '700', color: '#4338CA' },
});
