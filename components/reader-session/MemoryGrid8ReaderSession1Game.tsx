/**
 * Level 7 Reader — Session 1, Game 2: Memory Grid
 * Match 8 picture cards (4 pairs). Flip two at a time.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PAIRS = [
  { pairId: 'tree', emoji: '🌳', label: 'Tree' },
  { pairId: 'dog', emoji: '🐶', label: 'Dog' },
  { pairId: 'car', emoji: '🚗', label: 'Car' },
  { pairId: 'apple', emoji: '🍎', label: 'Apple' },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface MemoryGrid8ReaderSession1GameProps {
  onComplete: () => void;
}

export function MemoryGrid8ReaderSession1Game({ onComplete }: MemoryGrid8ReaderSession1GameProps) {
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
        variant="indigo"
        title="Great Job!"
        subtitle="You matched all 4 pairs!"
        badgeEmoji="🎴"
      />
    );
  }

  return (
    <GameLayout
      title="Memory Grid"
      instruction="Tap two cards to find matching pairs. 8 cards, 4 pairs."
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 280 },
  card: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: 'rgba(99,102,241,0.55)',
    borderWidth: 3,
    borderColor: 'rgba(99,102,241,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFlipped: { backgroundColor: 'rgba(99,102,241,0.12)' },
  cardText: { fontSize: 34 },
});

