/**
 * Builder Session 3 — Game 1: Memory Card Flip
 * Match identical picture cards. Flip two at a time to find pairs.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PAIRS = [
  { pairId: 'cat', emoji: '🐱', label: 'Cat' },
  { pairId: 'dog', emoji: '🐕', label: 'Dog' },
  { pairId: 'sun', emoji: '☀️', label: 'Sun' },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface MemoryCardGameProps {
  onComplete: () => void;
}

export function MemoryCardGame({ onComplete }: MemoryCardGameProps) {
  const cards = useMemo(
    () =>
      shuffle(
        PAIRS.flatMap((p) => [
          { id: `${p.pairId}-a`, pairId: p.pairId, emoji: p.emoji },
          { id: `${p.pairId}-b`, pairId: p.pairId, emoji: p.emoji },
        ])
      ),
    []
  );

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [lock, setLock] = useState(false);

  useEffect(() => {
    speak('Flip two cards to find matching pairs. Tap a card to flip it.', 0.75);
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
        subtitle="You found all the pairs!"
        badgeEmoji="🃏"
      />
    );
  }

  return (
    <GameLayout
      title="Memory Card Flip"
      instruction="Tap two cards to find matching pairs."
      icon="🃏"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Find the matching pairs</Text>
        <View style={styles.grid}>
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index) || matched.has(card.pairId);
            return (
              <Pressable
                key={card.id}
                onPress={() => handleCardTap(index)}
                style={[styles.card, isFlipped && styles.cardFlipped]}
                accessibilityLabel={isFlipped ? card.emoji : 'Card face down'}
              >
                <Text style={styles.emoji}>{isFlipped ? card.emoji : '?'}</Text>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 280 },
  card: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#A78BFA',
    borderWidth: 4,
    borderColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFlipped: { backgroundColor: '#FFF', borderColor: '#22C55E' },
  emoji: { fontSize: 36 },
});
