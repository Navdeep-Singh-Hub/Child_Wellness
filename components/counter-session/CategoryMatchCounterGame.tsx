/**
 * Level 5 Counter — Session 8, Game 2: Category Match
 * Match animals with habitat. Tap animal then correct habitat (fish→water, bird→sky, dog→home).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PAIRS: { id: string; animal: string; animalEmoji: string; habitatId: string; habitat: string; habitatEmoji: string }[] = [
  { id: 'fish', animal: 'Fish', animalEmoji: '🐟', habitatId: 'water', habitat: 'Water', habitatEmoji: '🌊' },
  { id: 'bird', animal: 'Bird', animalEmoji: '🐦', habitatId: 'sky', habitat: 'Sky', habitatEmoji: '☁️' },
  { id: 'dog', animal: 'Dog', animalEmoji: '🐕', habitatId: 'home', habitat: 'Home', habitatEmoji: '🏠' },
];

export interface CategoryMatchCounterGameProps {
  onComplete: () => void;
}

export function CategoryMatchCounterGame({ onComplete }: CategoryMatchCounterGameProps) {
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Match each animal to its home. Tap an animal, then tap where it lives.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Where does this animal live?', 0.7);
  }, [wrongShake]);

  const handleAnimalTap = useCallback((id: string) => {
    if (matched.has(id)) return;
    setSelectedId(id);
    const pair = PAIRS.find((p) => p.id === id);
    speak(pair?.animal ?? id, 0.7);
  }, [matched]);

  const handleHabitatTap = useCallback(
    (habitatId: string) => {
      if (!selectedId) return;
      const pair = PAIRS.find((p) => p.id === selectedId);
      const correctHabitatId = pair?.habitatId ?? '';
      if (habitatId !== correctHabitatId) {
        triggerWrong();
        setSelectedId(null);
        return;
      }
      speak(`Correct! ${pair?.animal} lives in ${pair?.habitat}!`, 0.7);
      setMatched((m) => new Set(m).add(selectedId));
      setSelectedId(null);
      if (matched.size + 1 >= PAIRS.length) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [selectedId, matched, onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Great Job!"
        subtitle="You matched animals to their homes!"
        badgeEmoji="🐾"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const habitats = [
    { id: 'water', label: 'Water', emoji: '🌊' },
    { id: 'sky', label: 'Sky', emoji: '☁️' },
    { id: 'home', label: 'Home', emoji: '🏠' },
  ];

  return (
    <GameLayout
      title="Category Match"
      instruction="Match each animal to where it lives."
      icon="🐾"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Animals</Text>
        <Animated.View style={[styles.animalsRow, { transform: [{ translateX: shakeX }] }]}>
          {PAIRS.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => handleAnimalTap(p.id)}
              style={[
                styles.animalBtn,
                selectedId === p.id && styles.selected,
                matched.has(p.id) && styles.matched,
              ]}
              accessibilityLabel={p.animal}
            >
              <Text style={styles.animalEmoji}>{p.animalEmoji}</Text>
              <Text style={styles.animalLabel}>{p.animal}</Text>
            </Pressable>
          ))}
        </Animated.View>
        <Text style={styles.label}>Habitats</Text>
        <View style={styles.habitatsRow}>
          {habitats.map((h) => (
            <Pressable
              key={h.id}
              onPress={() => handleHabitatTap(h.id)}
              style={[styles.habitatBtn]}
              accessibilityLabel={h.label}
            >
              <Text style={styles.habitatEmoji}>{h.emoji}</Text>
              <Text style={styles.habitatLabel}>{h.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#0369A1', marginBottom: 12 },
  animalsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginBottom: 24 },
  animalBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#38BDF8',
    alignItems: 'center',
    minWidth: 88,
  },
  selected: { backgroundColor: '#E0F2FE', borderColor: '#0EA5E9' },
  matched: { opacity: 0.6 },
  animalEmoji: { fontSize: 40, marginBottom: 4 },
  animalLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  habitatsRow: { flexDirection: 'row', gap: 16 },
  habitatBtn: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    borderWidth: 4,
    borderColor: '#38BDF8',
    alignItems: 'center',
    minWidth: 90,
  },
  habitatEmoji: { fontSize: 36, marginBottom: 8 },
  habitatLabel: { fontSize: 16, fontWeight: '800', color: '#0C4A6E' },
});
