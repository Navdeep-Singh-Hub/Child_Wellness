/**
 * OceanRhymeGame — Game 2: I Spy Rhyming (Ocean)
 * Rounds: wave→cave, fish→dish, shell→bell, boat→goat. One correct answer per round.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '../farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

type Round = { promptWord: string; correctId: string; items: { id: string; label: string; image: string }[] };

const ROUNDS: Round[] = [
  {
    promptWord: 'wave',
    correctId: 'cave',
    items: [
      { id: 'cave', label: 'Cave', image: 'https://placehold.co/120x120/BAE6FD/0369A1?text=Cave' },
      { id: 'ship', label: 'Ship', image: 'https://placehold.co/120x120/FECACA/991B1B?text=Ship' },
      { id: 'star', label: 'Star', image: 'https://placehold.co/120x120/FDE68A/92400E?text=Star' },
      { id: 'fish', label: 'Fish', image: 'https://placehold.co/120x120/BFDBFE/1E40AF?text=Fish' },
    ],
  },
  {
    promptWord: 'fish',
    correctId: 'dish',
    items: [
      { id: 'dish', label: 'Dish', image: 'https://placehold.co/120x120/BAE6FD/0369A1?text=Dish' },
      { id: 'wave', label: 'Wave', image: 'https://placehold.co/120x120/FECACA/991B1B?text=Wave' },
      { id: 'shell', label: 'Shell', image: 'https://placehold.co/120x120/FDE68A/92400E?text=Shell' },
      { id: 'boat', label: 'Boat', image: 'https://placehold.co/120x120/BFDBFE/1E40AF?text=Boat' },
    ],
  },
  {
    promptWord: 'shell',
    correctId: 'bell',
    items: [
      { id: 'bell', label: 'Bell', image: 'https://placehold.co/120x120/BAE6FD/0369A1?text=Bell' },
      { id: 'fish', label: 'Fish', image: 'https://placehold.co/120x120/FECACA/991B1B?text=Fish' },
      { id: 'cave', label: 'Cave', image: 'https://placehold.co/120x120/FDE68A/92400E?text=Cave' },
      { id: 'star', label: 'Star', image: 'https://placehold.co/120x120/BFDBFE/1E40AF?text=Star' },
    ],
  },
  {
    promptWord: 'boat',
    correctId: 'goat',
    items: [
      { id: 'goat', label: 'Goat', image: 'https://placehold.co/120x120/BAE6FD/0369A1?text=Goat' },
      { id: 'ship', label: 'Ship', image: 'https://placehold.co/120x120/FECACA/991B1B?text=Ship' },
      { id: 'wave', label: 'Wave', image: 'https://placehold.co/120x120/FDE68A/92400E?text=Wave' },
      { id: 'dish', label: 'Dish', image: 'https://placehold.co/120x120/BFDBFE/1E40AF?text=Dish' },
    ],
  },
].map((r) => ({ ...r, items: r.items.sort(() => Math.random() - 0.5) }));

export function OceanRhymeGame({ onComplete }: { onComplete: () => void }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [found, setFound] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const round = ROUNDS[roundIndex];
  const [shakeAnims] = useState(() =>
    ROUNDS.flatMap((r) => r.items).reduce((acc, i) => ({ ...acc, [i.id]: new Animated.Value(0) }), {} as Record<string, Animated.Value>)
  );
  const [bounceAnims] = useState(() =>
    ROUNDS.flatMap((r) => r.items).reduce((acc, i) => ({ ...acc, [i.id]: new Animated.Value(0) }), {} as Record<string, Animated.Value>)
  );

  const instruction = `I spy something that rhymes with ${round.promptWord}`;

  useEffect(() => {
    speak(instruction, 0.75);
  }, [roundIndex]);

  const triggerShake = useCallback((id: string) => {
    const a = shakeAnims[id];
    if (!a) return;
    Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnims]);

  const triggerBounce = useCallback((id: string) => {
    const a = bounceAnims[id];
    if (!a) return;
    a.setValue(0);
    Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [bounceAnims]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === round.correctId) {
        speak('Correct!');
        triggerBounce(id);
        setFound(true);
        if (roundIndex + 1 >= ROUNDS.length) {
          speak('Great job!');
          setShowSuccess(true);
          setTimeout(() => onComplete(), 1800);
        } else {
          speak('Next round!');
          setRoundIndex((r) => r + 1);
          setFound(false);
        }
      } else {
        speak('Try again');
        triggerShake(id);
      }
    },
    [round, roundIndex, onComplete, triggerShake, triggerBounce]
  );

  if (showSuccess) {
    return <SuccessCelebration variant="ocean" title="Great Job!" subtitle="All ocean rhymes found!" />;
  }

  return (
    <GameLayout title="I Spy Rhymes" instruction={instruction}>
      <View style={styles.roundBadge}>
        <Text style={styles.roundText}>Round {roundIndex + 1} of {ROUNDS.length}</Text>
      </View>
      <View style={styles.grid}>
        {round.items.map((item) => {
          const chosen = found && item.id === round.correctId;
          const shake = shakeAnims[item.id];
          const bounce = bounceAnims[item.id];
          const translateX = shake?.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }) ?? 0;
          const scale = bounce?.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) ?? 1;
          return (
            <Animated.View
              key={item.id}
              style={[styles.itemWrap, chosen && styles.itemChosen, { transform: [{ translateX }, { scale }] }]}
            >
              <Pressable
                onPress={() => handleTap(item.id)}
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                accessibilityLabel={item.label}
              >
                <Image source={{ uri: item.image }} style={styles.image} />
                <Text style={[styles.label, chosen && styles.labelHighlight]}>{item.label}</Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  roundBadge: { marginBottom: 16, alignItems: 'center' },
  roundText: { fontSize: 16, fontWeight: '700', color: '#38BDF8' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  itemWrap: { width: '45%', maxWidth: 140 },
  item: {
    backgroundColor: '#E0F2FE',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#38BDF8',
    minHeight: 120,
  },
  itemPressed: { opacity: 0.9 },
  itemChosen: { borderColor: '#34D399', backgroundColor: '#D1FAE5' },
  image: { width: 64, height: 64, borderRadius: 10, marginBottom: 6 },
  label: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  labelHighlight: { color: '#047857', textDecorationLine: 'underline' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#0EA5E9' },
});
