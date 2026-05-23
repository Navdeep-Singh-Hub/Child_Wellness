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
    items: [
      { id: 'a', label: 'Apple', emoji: '🍎', odd: false },
      { id: 'b', label: 'Banana', emoji: '🍌', odd: false },
      { id: 'c', label: 'Grapes', emoji: '🍇', odd: false },
      { id: 'x', label: 'Car', emoji: '🚗', odd: true },
    ],
  },
  {
    items: [
      { id: 'd', label: 'Dog', emoji: '🐕', odd: false },
      { id: 'e', label: 'Cat', emoji: '🐱', odd: false },
      { id: 'f', label: 'Cow', emoji: '🐄', odd: false },
      { id: 'y', label: 'Shoe', emoji: '👟', odd: true },
    ],
  },
  {
    items: [
      { id: 'g', label: 'Red', emoji: '🔴', odd: false },
      { id: 'h', label: 'Blue', emoji: '🔵', odd: false },
      { id: 'i', label: 'Green', emoji: '🟢', odd: false },
      { id: 'z', label: 'Star', emoji: '⭐', odd: true },
    ],
  },
] as const;

export function PickTheDifferentOneGame({ onBack, onComplete }: Props) {
  const session = useCategoriesSession('pick-the-different-one', DEFAULT_CATEGORY_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakCategory('Which one does not belong?');
    return () => clearCategorySpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    speakCategory('Pick the different one!');
  }, [session.round, canPlay]);

  return (
    <>
      <CategoriesShell
        title="Pick the Different One"
        subtitle="Find the odd item"
        skills="🔍 Comparison"
        gradient={['#FCE7F3', '#F9A8D4']}
        accent="#DB2777"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Which one is different?"
      >
        <View style={styles.grid}>
          {round.items.map((item) => (
            <CategoryTile
              key={item.id}
              label={item.label}
              emoji={item.emoji}
              accent="#DB2777"
              onPress={() => {
                if (item.odd) {
                  hapticCategorySuccess();
                  speakCategory('You found it!');
                  setTimeout(() => session.completeRound(), 700);
                } else {
                  speakCategory('That one matches the others!');
                }
              }}
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
