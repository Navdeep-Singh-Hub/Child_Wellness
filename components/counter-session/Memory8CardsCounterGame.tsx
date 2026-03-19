/**
 * Level 5 Counter — Session 3, Game 3: Memory Game (8 cards, 4 pairs)
 * Flip two cards at a time to match pairs.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PAIRS = [
  { pairId: 'apple', emoji: '🍎', label: 'Apple' },
  { pairId: 'ball', emoji: '⚽', label: 'Ball' },
  { pairId: 'cat', emoji: '🐱', label: 'Cat' },
  { pairId: 'dog', emoji: '🐕', label: 'Dog' },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface Memory8CardsCounterGameProps {
  onComplete: () => void;
}

export function Memory8CardsCounterGame({ onComplete }: Memory8CardsCounterGameProps) {
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
    speak('Match 4 pairs. Flip two cards at a time to find matching pictures.', 0.75);
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
          setMatched((m) => {
            const next = new Set(m).add(cards[a].pairId);
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
    [cards, flipped, lock, matched, onComplete]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Great Job!"
        subtitle="You matched all 4 pairs!"
        badgeEmoji="🎴"
      />
    );
  }

  return (
    <GameLayout
      title="Memory Game"
      instruction="Tap two cards to find matching pairs. 8 cards, 4 pairs."
      icon="🎴"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Find 4 matching pairs</Text>
        <View style={styles.grid}>
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index) || matched.has(card.pairId);
            return (
              <Pressable
                key={card.id}
                onPress={() => handleCardTap(index)}
                style={[styles.card, isFlipped && styles.cardFlipped]}
                accessibilityLabel={isFlipped ? card.pairId : 'Card face down'}
              >
                {!isFlipped && <Text style={styles.cardBack}>?</Text>}
                {isFlipped && <Text style={styles.cardEmoji}>{card.emoji}</Text>}
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
  label: { fontSize: 18, fontWeight: '700', color: '#0369A1', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 280 },
  card: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#38BDF8',
    borderWidth: 4,
    borderColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFlipped: { backgroundColor: '#FFF', borderColor: '#22C55E' },
  cardBack: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  cardEmoji: { fontSize: 32 },
});
