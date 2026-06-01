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
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type ColorId = 'red' | 'blue' | 'yellow';

type TrainItem = {
  id: string;
  label: string;
  emoji: string;
  color: ColorId;
  imageKey?: Level2ImageKey;
};

const ROUNDS: { color: ColorId; name: string; train: string; items: TrainItem[] }[] = [
  {
    color: 'red',
    name: 'red',
    train: '🚂',
    items: [
      { id: 'r1', label: 'Apple', emoji: '🍎', color: 'red', imageKey: 'apple' },
      { id: 'r2', label: 'Balloon', emoji: '🎈', color: 'red', imageKey: 'ballon' },
      { id: 'b1', label: 'Sky', emoji: '🌊', color: 'blue' },
      { id: 'y1', label: 'Sun', emoji: '☀️', color: 'yellow', imageKey: 'sun' },
    ],
  },
  {
    color: 'blue',
    name: 'blue',
    train: '🚃',
    items: [
      { id: 'b2', label: 'Fish', emoji: '🐟', color: 'blue', imageKey: 'fish' },
      { id: 'b3', label: 'Ball', emoji: '🔵', color: 'blue', imageKey: 'volleyball' },
      { id: 'r3', label: 'Heart', emoji: '❤️', color: 'red', imageKey: 'heart' },
      { id: 'y2', label: 'Banana', emoji: '🍌', color: 'yellow', imageKey: 'banana' },
    ],
  },
  {
    color: 'yellow',
    name: 'yellow',
    train: '🚋',
    items: [
      { id: 'y3', label: 'Star', emoji: '⭐', color: 'yellow', imageKey: 'star' },
      { id: 'y4', label: 'Duck', emoji: '🦆', color: 'yellow' },
      { id: 'r4', label: 'Car', emoji: '🚗', color: 'red', imageKey: 'car' },
      { id: 'b4', label: 'Jeans', emoji: '👖', color: 'blue', imageKey: 'clothing-pants' },
    ],
  },
];

export function ColorMatchTrainGame({ onBack, onComplete }: Props) {
  const session = useCategoriesSession('color-match-train', DEFAULT_CATEGORY_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [onTrain, setOnTrain] = useState<Set<string>>(new Set());
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakCategory('Color match train! Load the train with the same color!');
    return () => clearCategorySpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setOnTrain(new Set());
    speakCategory(`Load the ${round.name} train car!`);
  }, [session.round, canPlay, round.name]);

  const need = round.items.filter((i) => i.color === round.color);
  const left = need.filter((i) => !onTrain.has(i.id)).length;

  return (
    <>
      <CategoriesShell
        title="Color Match Train"
        subtitle="Group by color on the train"
        skills="🌈 Visual attributes"
        gradient={['#FEE2E2', '#FCA5A5']}
        accent="#DC2626"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`${round.train} ${round.name} car — ${left} to load`}
      >
        <Text style={styles.train}>{round.train}🟥🟦🟨</Text>
        <View style={styles.grid}>
          {round.items.map((item) => (
            <CategoryTile
              key={item.id}
              label={item.label}
              emoji={item.emoji}
              imageKey={item.imageKey}
              accent="#DC2626"
              dimmed={onTrain.has(item.id)}
              onPress={() => {
                if (item.color === round.color) {
                  if (onTrain.has(item.id)) return;
                  hapticCategorySuccess();
                  const next = new Set(onTrain);
                  next.add(item.id);
                  setOnTrain(next);
                  speakCategory('On the train!');
                  if (need.every((n) => next.has(n.id))) {
                    setTimeout(() => session.completeRound(), 800);
                  }
                } else {
                  speakCategory(`Wrong color — find ${round.name}!`);
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
  train: { textAlign: 'center', fontSize: 36, marginBottom: 8, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
