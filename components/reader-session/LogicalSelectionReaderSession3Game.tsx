/**
 * Level 7 Reader — Session 3, Game 1: Logical Selection
 * Find the object that does NOT belong (e.g. dog, cat, car → car).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ITEMS = [
  { id: 'dog', label: 'Dog', emoji: '🐕' },
  { id: 'cat', label: 'Cat', emoji: '🐱' },
  { id: 'car', label: 'Car', emoji: '🚗' },
];
const CORRECT_ID = 'car'; // does not belong (not an animal)

export interface LogicalSelectionReaderSession3GameProps {
  onComplete: () => void;
}

export function LogicalSelectionReaderSession3Game({ onComplete }: LogicalSelectionReaderSession3GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Which one does NOT belong? Dog, cat, car. Tap the one that is different.', 0.75);
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
        speak('Correct! The car does not belong!', 0.75);
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
      title="Logical Selection"
      instruction="Which one does NOT belong? Tap the one that is different."
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
  prompt: { fontSize: 22, fontWeight: '800', color: '#4338CA', marginBottom: 16, textAlign: 'center' },
  itemsRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  itemBox: { alignItems: 'center' },
  itemEmoji: { fontSize: 40 },
  itemLabel: { fontSize: 14, color: '#64748B', marginTop: 4 },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  optionBtn: {
    minWidth: 100,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#818CF8',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  optionEmoji: { fontSize: 44, marginBottom: 8 },
  optionLabel: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  pressed: { opacity: 0.9, backgroundColor: '#EEF2FF' },
});
