import {
  CategoriesOverlays,
  CategoriesShell,
  CategoryTile,
  clearCategorySpeech,
  DEFAULT_CATEGORY_ROUNDS,
  hapticCategorySuccess,
  speakCategory,
  useCategoriesSession,
} from '@/components/game/speech/categories/shared/categoriesShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    name: 'Animals',
    items: [
      { id: 'dog', label: 'Dog', emoji: '🐕', match: true },
      { id: 'cat', label: 'Cat', emoji: '🐱', match: true },
      { id: 'apple', label: 'Apple', emoji: '🍎', match: false },
      { id: 'car', label: 'Car', emoji: '🚗', match: false },
    ],
  },
  {
    name: 'Food',
    items: [
      { id: 'bread', label: 'Bread', emoji: '🍞', match: true },
      { id: 'milk', label: 'Milk', emoji: '🥛', match: true },
      { id: 'tree', label: 'Tree', emoji: '🌳', match: false },
      { id: 'ball', label: 'Ball', emoji: '⚽', match: false },
    ],
  },
  {
    name: 'Clothes',
    items: [
      { id: 'shirt', label: 'Shirt', emoji: '👕', match: true },
      { id: 'hat', label: 'Hat', emoji: '🧢', match: true },
      { id: 'fish', label: 'Fish', emoji: '🐟', match: false },
      { id: 'cup', label: 'Cup', emoji: '☕', match: false },
    ],
  },
] as const;

export function SameCategoryGame({ onBack, onComplete }: Props) {
  const session = useCategoriesSession('same-category', DEFAULT_CATEGORY_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakCategory('Tap everything in the same group!');
    return () => clearCategorySpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setMatched(new Set());
    speakCategory(`Find all the ${round.name.toLowerCase()}!`);
  }, [session.round, canPlay, round.name]);

  const need = round.items.filter((i) => i.match);
  const left = need.filter((i) => !matched.has(i.id)).length;

  const onTap = (item: (typeof round.items)[number]) => {
    if (item.match) {
      if (matched.has(item.id)) return;
      hapticCategorySuccess();
      const next = new Set(matched);
      next.add(item.id);
      setMatched(next);
      speakCategory('Same group!');
      if (need.every((n) => next.has(n.id))) {
        setTimeout(() => session.completeRound(), 800);
      }
    } else {
      speakCategory('That does not belong in this group!');
    }
  };

  return (
    <>
      <CategoriesShell
        title="Same Category"
        subtitle="Match related objects"
        skills="🗂️ Categorization"
        gradient={['#E0F2FE', '#7DD3FC']}
        accent="#0284C7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`${round.name}: ${left} left to find`}
      >
        <View style={styles.grid}>
          {round.items.map((item) => (
            <CategoryTile
              key={item.id}
              label={item.label}
              emoji={item.emoji}
              accent="#0284C7"
              dimmed={matched.has(item.id)}
              onPress={() => onTap(item)}
            />
          ))}
        </View>
      </CategoriesShell>
      <CategoriesOverlays
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
