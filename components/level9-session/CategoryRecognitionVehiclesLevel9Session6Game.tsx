/**
 * Level 9 (Clockwise) — Session 6, Game 2: Category Recognition
 * Select all vehicles. Tap each vehicle; avoid non-vehicles.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ITEMS = [
  { id: 'car', label: 'Car', emoji: '🚗', isVehicle: true },
  { id: 'apple', label: 'Apple', emoji: '🍎', isVehicle: false },
  { id: 'bus', label: 'Bus', emoji: '🚌', isVehicle: true },
  { id: 'dog', label: 'Dog', emoji: '🐕', isVehicle: false },
  { id: 'train', label: 'Train', emoji: '🚂', isVehicle: true },
  { id: 'book', label: 'Book', emoji: '📚', isVehicle: false },
];
const VEHICLE_IDS = ITEMS.filter((i) => i.isVehicle).map((i) => i.id);
const TOTAL_VEHICLES = VEHICLE_IDS.length;

export interface CategoryRecognitionVehiclesLevel9Session6GameProps {
  onComplete: () => void;
}

export function CategoryRecognitionVehiclesLevel9Session6Game({ onComplete }: CategoryRecognitionVehiclesLevel9Session6GameProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Tap all the vehicles. Find the car, the bus, and the train.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('That is not a vehicle. Tap only the vehicles.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      const item = ITEMS.find((i) => i.id === id);
      if (!item) return;
      if (item.isVehicle) {
        const next = new Set(selected).add(id);
        setSelected(next);
        speak(item.label, 0.5);
        if (next.size >= TOTAL_VEHICLES) {
          speak('You found all the vehicles!', 0.75);
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2200);
        }
      } else {
        triggerWrong();
      }
    },
    [onComplete, selected, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You selected all the vehicles!"
        badgeEmoji="🚗"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Category Recognition"
      instruction="Tap ALL the vehicles. Do not tap things that are not vehicles."
      icon="🚗"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Select all vehicles ({selected.size}/{TOTAL_VEHICLES})</Text>
        <Animated.View style={[styles.itemsRow, { transform: [{ translateX: shakeX }] }]}>
          {ITEMS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleTap(item.id)}
              style={[
                styles.itemBtn,
                selected.has(item.id) && styles.itemSelected,
                { borderColor: selected.has(item.id) ? '#22C55E' : '#818CF8' },
              ]}
              accessibilityLabel={item.label}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemLabel}>{item.label}</Text>
              {selected.has(item.id) ? <Text style={styles.check}>✓</Text> : null}
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 20, fontWeight: '800', color: '#4338CA', marginBottom: 20 },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 16 },
  itemBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 4,
    alignItems: 'center',
    minWidth: 88,
  },
  itemSelected: { backgroundColor: '#DCFCE7' },
  itemEmoji: { fontSize: 36, marginBottom: 4 },
  itemLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  check: { position: 'absolute', top: 4, right: 6, fontSize: 16, color: '#22C55E', fontWeight: '800' },
});
