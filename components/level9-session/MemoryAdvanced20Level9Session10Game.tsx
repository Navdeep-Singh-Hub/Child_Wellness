/**
 * Level 9 (Clockwise) — Session 10, Game 2: Advanced Memory
 * Match 20 cards (10 pairs). Flip two at a time.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PAIRS = [
  { pairId: 'apple', emoji: '🍎', label: 'Apple' },
  { pairId: 'book', emoji: '📚', label: 'Book' },
  { pairId: 'car', emoji: '🚗', label: 'Car' },
  { pairId: 'dog', emoji: '🐕', label: 'Dog' },
  { pairId: 'house', emoji: '🏠', label: 'House' },
  { pairId: 'star', emoji: '⭐', label: 'Star' },
  { pairId: 'ball', emoji: '⚽', label: 'Ball' },
  { pairId: 'sun', emoji: '☀️', label: 'Sun' },
  { pairId: 'heart', emoji: '❤️', label: 'Heart' },
  { pairId: 'tree', emoji: '🌳', label: 'Tree' },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface MemoryAdvanced20Level9Session10GameProps {
  onComplete: () => void;
}

export function MemoryAdvanced20Level9Session10Game({ onComplete }: MemoryAdvanced20Level9Session10GameProps) {
  const cards = useMemo(
    () =>
      shuffle(
        PAIRS.flatMap((p) => [
          { id: `${p.pairId}-a`, pairId: p.pairId, emoji: p.emoji, label: p.label },
          { id: `${p.pairId}-b`, pairId: p.pairId, emoji: p.emoji, label: p.label },
        ])
      ),
    []
  );

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [lock, setLock] = useState(false);

  useEffect(() => {
    speak('Match 10 pairs. Flip two cards at a time. 20 cards.', 0.75);
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
        variant="indigo"
        title="Great Job!"
        subtitle="You matched all 10 pairs!"
        badgeEmoji="🎴"
      />
    );
  }

  return (
    <GameLayout
      title="Advanced Memory"
      instruction="Tap two cards to find matching pairs. 20 cards, 10 pairs."
      icon="🎴"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <View style={styles.grid}>
          {cards.map((card, index) => {
            const isOpen = flipped.includes(index) || matched.has(card.pairId);
            return (
              <Pressable
                key={card.id}
                onPress={() => handleCardTap(index)}
                style={[styles.card, isOpen && styles.cardFlipped]}
                accessibilityLabel={isOpen ? `${card.label}` : 'Card'}
              >
                <Text style={styles.cardText}>{isOpen ? card.emoji : '❔'}</Text>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    maxWidth: 340,
  },
  card: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#C7D2FE',
    borderWidth: 3,
    borderColor: '#818CF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFlipped: { backgroundColor: '#EEF2FF' },
  cardText: { fontSize: 22 },
});
