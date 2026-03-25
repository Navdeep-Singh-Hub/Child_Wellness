/**
 * Builder Session 6 — Game 4: Sound Match
 * Match animal with its sound. Same mechanic as AnimalSoundMatchGame; different animals for variety.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ANIMALS = [
  { id: 'pig', emoji: '🐷', label: 'Pig', sound: 'Oink oink!', soundId: 'oink' },
  { id: 'duck', emoji: '🦆', label: 'Duck', sound: 'Quack quack!', soundId: 'quack' },
  { id: 'sheep', emoji: '🐑', label: 'Sheep', sound: 'Baa baa!', soundId: 'baa' },
];

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function shuffleWithoutSameColumn<T extends { id: string }>(base: T[], source: T[]): T[] {
  if (source.length <= 1) return [...source];
  let candidate = shuffleArray(source);
  let tries = 0;
  while (candidate.some((item, i) => item.id === base[i]?.id) && tries < 20) {
    candidate = shuffleArray(source);
    tries += 1;
  }
  if (candidate.some((item, i) => item.id === base[i]?.id)) {
    return [...source.slice(1), source[0]];
  }
  return candidate;
}

export interface SoundMatchGameProps {
  onComplete: () => void;
}

export function SoundMatchGame({ onComplete }: SoundMatchGameProps) {
  const [animalOrder] = useState(() => shuffleArray(ANIMALS));
  const [soundOrder] = useState(() => shuffleWithoutSameColumn(animalOrder, ANIMALS));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Match each animal to its sound. Tap an animal, then tap its sound.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Match the animal to its sound.', 0.7);
  }, [wrongShake]);

  const handleAnimalTap = useCallback((id: string) => {
    if (matched.has(id)) return;
    setSelectedId(id);
    const a = ANIMALS.find((x) => x.id === id);
    speak(a?.label ?? id, 0.7);
  }, [matched]);

  const handleSoundTap = useCallback(
    (soundId: string) => {
      if (!selectedId) return;
      const animal = ANIMALS.find((x) => x.id === selectedId);
      if (!animal || animal.soundId !== soundId) {
        triggerWrong();
        setSelectedId(null);
        return;
      }
      speak(animal.sound, 0.7);
      setMatched((m) => new Set(m).add(selectedId));
      setSelectedId(null);
      if (matched.size + 1 >= animalOrder.length) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [selectedId, matched, onComplete, triggerWrong, animalOrder.length]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Great Job!"
        subtitle="You matched all the animals and sounds!"
        badgeEmoji="🔊"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Sound Match"
      instruction="Match each animal to its sound."
      icon="🔊"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Animals</Text>
        <Animated.View style={[styles.row, { transform: [{ translateX: shakeX }] }]}>
          {animalOrder.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => handleAnimalTap(a.id)}
              style={[
                styles.animalCard,
                selectedId === a.id && styles.animalCardSelected,
                matched.has(a.id) && styles.animalCardMatched,
              ]}
              accessibilityLabel={a.label}
            >
              <Text style={styles.emoji}>{a.emoji}</Text>
              <Text style={styles.animalLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
        <Text style={styles.label}>Sounds</Text>
        <View style={styles.row}>
          {soundOrder.map((a) => (
            <Pressable
              key={a.soundId}
              onPress={() => handleSoundTap(a.soundId)}
              style={[
                styles.soundCard,
                matched.has(a.id) && styles.soundCardMatched,
              ]}
              accessibilityLabel={a.sound}
            >
              <Text style={styles.soundText}>{a.sound}</Text>
            </Pressable>
          ))}
        </View>
        {selectedId ? (
          <Text style={styles.hint}>Now tap the sound for {ANIMALS.find((x) => x.id === selectedId)?.label}</Text>
        ) : null}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#4F46E5', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' },
  animalCard: {
    width: 90,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#A78BFA',
    alignItems: 'center',
  },
  animalCardSelected: { borderColor: '#22C55E', backgroundColor: '#DCFCE7' },
  animalCardMatched: { borderColor: '#22C55E', backgroundColor: '#BBF7D0', opacity: 0.9 },
  emoji: { fontSize: 40, marginBottom: 6 },
  animalLabel: { fontSize: 14, fontWeight: '800', color: '#5B21B6' },
  soundCard: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 4,
    borderColor: '#E5E7EB',
  },
  soundCardMatched: { borderColor: '#22C55E', backgroundColor: '#DCFCE7' },
  soundText: { fontSize: 15, fontWeight: '800', color: '#374151' },
  hint: { marginTop: 16, fontSize: 16, color: '#6B7280', fontWeight: '600' },
});
