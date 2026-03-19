/**
 * Level 5 Counter — Session 9, Game 2: Memory Grid
 * Match 10 tiles (5 pairs). Flip two at a time to find matches.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PAIRS = [
  { pairId: 'heart', emoji: '❤️', label: 'Heart' },
  { pairId: 'star', emoji: '⭐', label: 'Star' },
  { pairId: 'sun', emoji: '☀️', label: 'Sun' },
  { pairId: 'moon', emoji: '🌙', label: 'Moon' },
  { pairId: 'cloud', emoji: '☁️', label: 'Cloud' },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface MemoryGridCounterGameProps {
  onComplete: () => void;
}

export function MemoryGridCounterGame({ onComplete }: MemoryGridCounterGameProps) {
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
    speak('Match 5 pairs. Flip two tiles at a time to find matching pictures.', 0.75);
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
        subtitle="You matched all 5 pairs!"
        badgeEmoji="🎴"
      />
    );
  }

  return (
    <GameLayout
      title="Memory Grid"
      instruction="Tap two tiles to find matching pairs. 10 tiles, 5 pairs."
      icon="🎴"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <View style={styles.grid}>
          {cards.map((card, index) => (
            <Pressable
              key={card.id}
              onPress={() => handleCardTap(index)}
              style={[styles.card, (flipped.includes(index) || matched.has(card.pairId)) && styles.cardFlipped]}
              accessibilityLabel={matched.has(card.pairId) ? `${card.pairId} matched` : 'Tile'}
            >
              {flipped.includes(index) || matched.has(card.pairId) ? (
                <Text style={styles.emoji}>{card.emoji}</Text>
              ) : (
                <Text style={styles.back}>?</Text>
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 280 },
  card: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#38BDF8',
    borderWidth: 3,
    borderColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFlipped: { backgroundColor: '#E0F2FE' },
  emoji: { fontSize: 32 },
  back: { fontSize: 24, fontWeight: '800', color: '#FFF' },
});
