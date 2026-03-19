/**
 * Builder Session 8 — Game 4: Animal Habitat
 * Match animals to habitat. Tap animal then tap correct habitat (fish→water, bird→sky, dog→house).
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

export interface AnimalHabitatGameProps {
  onComplete: () => void;
}

export function AnimalHabitatGame({ onComplete }: AnimalHabitatGameProps) {
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
        variant="mint"
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
      title="Animal Habitat"
      instruction="Match each animal to where it lives."
      icon="🐾"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Animals</Text>
        <Animated.View style={[styles.animalsRow, { transform: [{ translateX: shakeX }] }]}>
          {PAIRS.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => handleAnimalTap(p.id)}
              style={[styles.animalBtn, selectedId === p.id && styles.selected, matched.has(p.id) && styles.matched]}
              accessibilityLabel={p.animal}
            >
              <Text style={styles.emoji}>{p.animalEmoji}</Text>
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
              style={styles.habitatBtn}
              accessibilityLabel={`${h.label} habitat`}
            >
              <Text style={styles.habitatEmoji}>{h.emoji}</Text>
              <Text style={styles.habitatLabel}>{h.label}</Text>
            </Pressable>
          ))}
        </View>
        {selectedId ? (
          <Text style={styles.hint}>Tap where the {PAIRS.find((p) => p.id === selectedId)?.animal.toLowerCase()} lives</Text>
        ) : null}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#4F46E5', marginBottom: 12 },
  animalsRow: { flexDirection: 'row', gap: 12, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' },
  animalBtn: {
    width: 90,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#A78BFA',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  emoji: { fontSize: 36, marginBottom: 4 },
  animalLabel: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  selected: { borderColor: '#22C55E', backgroundColor: '#DCFCE7' },
  matched: { opacity: 0.5 },
  habitatsRow: { flexDirection: 'row', gap: 12 },
  habitatBtn: {
    width: 88,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#A78BFA',
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
  },
  habitatEmoji: { fontSize: 32, marginBottom: 4 },
  habitatLabel: { fontSize: 14, fontWeight: '800', color: '#5B21B6' },
  hint: { marginTop: 20, fontSize: 16, color: '#6B7280', fontWeight: '600' },
});
