/**
 * Builder Session 6 — Game 1: Memory Game
 * Match colored cards. Flip two at a time to find matching color pairs.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PAIRS = [
  { pairId: 'red', color: '#EF4444', label: 'Red' },
  { pairId: 'blue', color: '#3B82F6', label: 'Blue' },
  { pairId: 'green', color: '#22C55E', label: 'Green' },
  { pairId: 'yellow', color: '#FBBF24', label: 'Yellow' },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface MemoryColoredGameProps {
  onComplete: () => void;
}

export function MemoryColoredGame({ onComplete }: MemoryColoredGameProps) {
  const cards = useMemo(
    () =>
      shuffle(
        PAIRS.flatMap((p) => [
          { id: `${p.pairId}-a`, pairId: p.pairId, color: p.color },
          { id: `${p.pairId}-b`, pairId: p.pairId, color: p.color },
        ])
      ),
    []
  );

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [lock, setLock] = useState(false);

  useEffect(() => {
    speak('Flip two cards to find matching colors. Tap a card to flip it.', 0.75);
  }, []);

  const handleCardTap = useCallback(
    (index: number) => {
      if (lock || matched.has(cards[index].pairId) || flipped.includes(index)) return;
      const nextFlipped = flipped.length === 2 ? [index] : [...flipped, index];
      setFlipped(nextFlipped);

      if (nextFlipped.length === 2) {
        setLock(true);
        const [a, b] = nextFlipped;
        const match = cards[a].pairId === cards[b].pairId;
        if (match) {
          const pairId = cards[a].pairId;
          setMatched((m) => {
            const next = new Set(m).add(pairId);
            if (next.size >= PAIRS.length) {
              setShowSuccess(true);
              setTimeout(() => onComplete(), 2200);
            }
            return next;
          });
          setFlipped([]);
          speak('Match!', 0.7);
          setLock(false);
        } else {
          speak('Try again.', 0.6);
          setTimeout(() => {
            setFlipped([]);
            setLock(false);
          }, 800);
        }
      }
    },
    [cards, flipped, lock, onComplete]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Great Job!"
        subtitle="You found all the color pairs!"
        badgeEmoji="🎨"
      />
    );
  }

  return (
    <GameLayout
      title="Memory Game"
      instruction="Tap two cards to find matching colors."
      icon="🎨"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Find the matching colors</Text>
        <View style={styles.grid}>
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index) || matched.has(card.pairId);
            return (
              <Pressable
                key={card.id}
                onPress={() => handleCardTap(index)}
                style={[
                  styles.card,
                  isFlipped && [styles.cardFlipped, { backgroundColor: card.color }],
                ]}
                accessibilityLabel={isFlipped ? card.pairId : 'Card face down'}
              >
                {!isFlipped && <Text style={styles.cardBack}>?</Text>}
              </Pressable>
            );
          })}
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#4F46E5', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 260 },
  card: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#A78BFA',
    borderWidth: 3,
    borderColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFlipped: { borderColor: 'rgba(0,0,0,0.2)' },
  cardBack: { fontSize: 28, fontWeight: '800', color: '#FFF' },
});
