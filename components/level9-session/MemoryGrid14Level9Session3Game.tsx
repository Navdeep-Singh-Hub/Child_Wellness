/**
 * Level 9 (Clockwise) — Session 3, Game 2: Memory Grid
 * Match 14 cards (7 pairs).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PAIRS = [
  { pairId: 'sun', emoji: '☀️', label: 'Sun' },
  { pairId: 'moon', emoji: '🌙', label: 'Moon' },
  { pairId: 'star', emoji: '⭐', label: 'Star' },
  { pairId: 'heart', emoji: '❤️', label: 'Heart' },
  { pairId: 'flower', emoji: '🌸', label: 'Flower' },
  { pairId: 'fish', emoji: '🐟', label: 'Fish' },
  { pairId: 'bird', emoji: '🐦', label: 'Bird' },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface MemoryGrid14Level9Session3GameProps {
  onComplete: () => void;
}

export function MemoryGrid14Level9Session3Game({ onComplete }: MemoryGrid14Level9Session3GameProps) {
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
    speak('Match 7 pairs. Flip two cards at a time. 14 cards.', 0.75);
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
        subtitle="You matched all 7 pairs!"
        badgeEmoji="🎴"
      />
    );
  }

  return (
    <GameLayout
      title="Memory Grid"
      instruction="Tap two cards to find matching pairs. 14 cards, 7 pairs."
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
    gap: 10,
    maxWidth: 340,
  },
  card: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#C7D2FE',
    borderWidth: 3,
    borderColor: '#818CF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFlipped: { backgroundColor: '#EEF2FF' },
  cardText: { fontSize: 28 },
});
