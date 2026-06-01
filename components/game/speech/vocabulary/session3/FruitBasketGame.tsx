import {
  VocabTile,
  VocabularyOverlays,
  VocabularyShell,
  clearVocabSpeech,
  DEFAULT_VOCAB_ROUNDS,
  hapticVocabSuccess,
  speakVocab,
  useVocabularySession,
} from '@/components/game/speech/vocabulary/shared/vocabularyShared';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type ItemId = 'apple' | 'banana' | 'ball' | 'car';

const ITEMS: { id: ItemId; label: string; emoji: string; fruit: boolean; imageKey?: 'apple' | 'banana' | 'volleyball' | 'car' }[] = [
  { id: 'apple', label: 'Apple', emoji: '🍎', fruit: true, imageKey: 'apple' },
  { id: 'banana', label: 'Banana', emoji: '🍌', fruit: true, imageKey: 'banana' },
  { id: 'ball', label: 'Ball', emoji: '⚽', fruit: false, imageKey: 'volleyball' },
  { id: 'car', label: 'Car', emoji: '🚗', fruit: false, imageKey: 'car' },
];

export function FruitBasketGame({ onBack, onComplete }: Props) {
  const session = useVocabularySession('fruit-basket', DEFAULT_VOCAB_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [sorted, setSorted] = useState<Set<ItemId>>(new Set());

  useEffect(() => {
    speakVocab('Sort the fruits into the basket! Tap a fruit, then tap the basket.');
    return () => clearVocabSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setSorted(new Set());
    speakVocab('Put all the fruits in the basket!');
  }, [session.round, canPlay]);

  const fruitsLeft = ITEMS.filter((i) => i.fruit && !sorted.has(i.id)).length;

  const onFruit = (item: (typeof ITEMS)[number]) => {
    if (!item.fruit || sorted.has(item.id)) return;
    hapticVocabSuccess();
    const next = new Set(sorted);
    next.add(item.id);
    setSorted(next);
    speakVocab(`${item.label} in the basket!`);
    if (ITEMS.filter((i) => i.fruit).every((f) => next.has(f.id))) {
      setTimeout(() => session.completeRound(), 800);
    }
  };

  return (
    <>
      <VocabularyShell
        title="Fruit Basket"
        subtitle="Sort fruits into the basket"
        skills="🍎 Categorization"
        gradient={['#FEF3C7', '#FCD34D']}
        accent="#D97706"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Fruits left: ${fruitsLeft} — tap each fruit`}
      >
        <View style={styles.basket}>
          <Text style={styles.basketEmoji}>🧺</Text>
          <Text style={styles.basketLabel}>Fruit basket ({sorted.size}/2)</Text>
        </View>
        <View style={styles.grid}>
          {ITEMS.map((item) => (
            <VocabTile
              key={item.id}
              label={item.label}
              emoji={item.emoji}
              imageKey={item.imageKey}
              accent="#D97706"
              onPress={() => {
                if (item.fruit && !sorted.has(item.id)) onFruit(item);
                else if (!item.fruit) speakVocab('That is not a fruit!');
                else speakVocab('Already in the basket!');
              }}
            />
          ))}
        </View>
      </VocabularyShell>
      <VocabularyOverlays
        showRoundSuccess={session.showRoundSuccess}
        gameFinished={session.gameFinished}
        finalStats={session.finalStats}
        onBack={onBack}
        onComplete={onComplete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  basket: {
    alignSelf: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: '#D97706',
    alignItems: 'center',
    marginBottom: 12,
  },
  basketEmoji: { fontSize: 48 },
  basketLabel: { fontWeight: '800', color: '#92400E' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
