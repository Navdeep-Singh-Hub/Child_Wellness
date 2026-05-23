import {
  ActionChoiceTile,
  ActionsOverlays,
  ActionsShell,
  clearActionSpeech,
  DEFAULT_ACTION_ROUNDS,
  hapticActionSuccess,
  speakAction,
  useActionsSession,
} from '@/components/game/speech/actions/shared/actionsShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  { food: '🥣', foodLabel: 'soup', answer: 'spoon', items: [
    { id: 'spoon', emoji: '🥄', label: 'Spoon', correct: true },
    { id: 'hammer', emoji: '🔨', label: 'Hammer', correct: false },
    { id: 'brush', emoji: '🖌️', label: 'Brush', correct: false },
    { id: 'ball', emoji: '⚽', label: 'Ball', correct: false },
  ]},
  { food: '🍚', foodLabel: 'rice', answer: 'spoon', items: [
    { id: 'spoon', emoji: '🥄', label: 'Spoon', correct: true },
    { id: 'scissors', emoji: '✂️', label: 'Scissors', correct: false },
    { id: 'key', emoji: '🔑', label: 'Key', correct: false },
    { id: 'phone', emoji: '📱', label: 'Phone', correct: false },
  ]},
  { food: '🥣', foodLabel: 'cereal', answer: 'spoon', items: [
    { id: 'spoon', emoji: '🥄', label: 'Spoon', correct: true },
    { id: 'ruler', emoji: '📏', label: 'Ruler', correct: false },
    { id: 'umbrella', emoji: '☂️', label: 'Umbrella', correct: false },
    { id: 'guitar', emoji: '🎸', label: 'Guitar', correct: false },
  ]},
];

export function WhatDoWeEatWithGame({ onBack, onComplete }: Props) {
  const session = useActionsSession('what-do-we-eat-with', DEFAULT_ACTION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakAction('What do we eat with? Pick the right tool!');
    return () => clearActionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    speakAction(`What do we eat ${round.foodLabel} with?`);
  }, [session.round, canPlay, round.foodLabel]);

  const onPick = (correct: boolean) => {
    if (correct) {
      hapticActionSuccess();
      speakAction('We eat with a spoon!');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakAction('We eat with a spoon — try again!');
    }
  };

  return (
    <>
      <ActionsShell
        title="What Do We Eat With?"
        subtitle="Choose the spoon"
        skills="🥄 Object function"
        gradient={['#FEF9C3', '#FDE047']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Tap the spoon"
      >
        <Text style={styles.food}>{round.food}</Text>
        <Text style={styles.foodLabel}>Eating {round.foodLabel}</Text>
        <View style={styles.grid}>
          {round.items.map((c) => (
            <ActionChoiceTile
              key={c.id}
              label={c.label}
              emoji={c.emoji}
              accent="#CA8A04"
              onPress={() => onPick(c.correct)}
            />
          ))}
        </View>
      </ActionsShell>
      <ActionsOverlays
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
  food: { textAlign: 'center', fontSize: 64, marginBottom: 4 },
  foodLabel: { textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#713F12', marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
