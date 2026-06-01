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
import type { Level2ImageKey } from '@/components/game/speech/level2-shared/speechLevel2Assets';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type OddItem = {
  id: string;
  label: string;
  emoji: string;
  odd: boolean;
  imageKey?: Level2ImageKey;
};

const ROUNDS: { items: OddItem[] }[] = [
  {
    items: [
      { id: 'a', label: 'Apple', emoji: '🍎', odd: false, imageKey: 'apple' },
      { id: 'b', label: 'Banana', emoji: '🍌', odd: false, imageKey: 'banana' },
      { id: 'c', label: 'Grapes', emoji: '🍇', odd: false, imageKey: 'grapes' },
      { id: 'x', label: 'Car', emoji: '🚗', odd: true, imageKey: 'car' },
    ],
  },
  {
    items: [
      { id: 'd', label: 'Dog', emoji: '🐕', odd: false, imageKey: 'dog' },
      { id: 'e', label: 'Cat', emoji: '🐱', odd: false, imageKey: 'cat' },
      { id: 'f', label: 'Cow', emoji: '🐄', odd: false, imageKey: 'cow' },
      { id: 'y', label: 'Shoe', emoji: '👟', odd: true, imageKey: 'shoe' },
    ],
  },
  {
    items: [
      { id: 'g', label: 'Red', emoji: '🔴', odd: false },
      { id: 'h', label: 'Blue', emoji: '🔵', odd: false },
      { id: 'i', label: 'Green', emoji: '🟢', odd: false },
      { id: 'z', label: 'Star', emoji: '⭐', odd: true, imageKey: 'star' },
    ],
  },
];

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
              imageKey={item.imageKey}
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
