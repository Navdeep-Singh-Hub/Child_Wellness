import {
  clearSequenceSpeech,
  DEFAULT_SEQUENCE_ROUNDS,
  hapticSequenceSuccess,
  SequenceChoiceTile,
  SequencesOverlays,
  SequencesShell,
  speakSequence,
  useSequencesSession,
} from '@/components/game/speech/sequences/shared/sequencesShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    shown: ['🍎', '🍌', '❓', '🍇'],
    missing: { id: 'orange', emoji: '🍊', label: 'Orange' },
    choices: [
      { id: 'orange', emoji: '🍊', label: 'Orange', correct: true },
      { id: 'car', emoji: '🚗', label: 'Car', correct: false },
      { id: 'hat', emoji: '🎩', label: 'Hat', correct: false },
      { id: 'fish', emoji: '🐟', label: 'Fish', correct: false },
    ],
  },
  {
    shown: ['🐕', '🐱', '❓', '🐰'],
    missing: { id: 'cow', emoji: '🐄', label: 'Cow' },
    choices: [
      { id: 'bird', emoji: '🐦', label: 'Bird', correct: false },
      { id: 'cow', emoji: '🐄', label: 'Cow', correct: true },
      { id: 'tree', emoji: '🌳', label: 'Tree', correct: false },
      { id: 'cup', emoji: '☕', label: 'Cup', correct: false },
    ],
  },
  {
    shown: ['🔴', '🔵', '❓', '🟢'],
    missing: { id: 'yellow', emoji: '🟡', label: 'Yellow' },
    choices: [
      { id: 'yellow', emoji: '🟡', label: 'Yellow', correct: true },
      { id: 'star', emoji: '⭐', label: 'Star', correct: false },
      { id: 'moon', emoji: '🌙', label: 'Moon', correct: false },
      { id: 'shoe', emoji: '👟', label: 'Shoe', correct: false },
    ],
  },
];

export function WhatIsMissingGame({ onBack, onComplete }: Props) {
  const session = useSequencesSession('what-is-missing', DEFAULT_SEQUENCE_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakSequence('What is missing? Find the item that belongs in the empty spot.');
    return () => clearSequenceSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    speakSequence('What is missing from the row?');
  }, [session.round, canPlay]);

  const onPick = (correct: boolean) => {
    if (correct) {
      hapticSequenceSuccess();
      speakSequence('You found what was missing!');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakSequence('Look at the empty spot again!');
    }
  };

  return (
    <>
      <SequencesShell
        title="What Is Missing?"
        subtitle="Identify the missing item"
        skills="👁️ Visual memory"
        gradient={['#E0F2FE', '#7DD3FC']}
        accent="#0284C7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="What belongs in the ❓ spot?"
      >
        <View style={styles.row}>
          {round.shown.map((e, i) => (
            <Text key={i} style={styles.shown}>
              {e}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {round.choices.map((c) => (
            <SequenceChoiceTile
              key={c.id}
              label={c.label}
              emoji={c.emoji}
              accent="#0284C7"
              onPress={() => onPick(c.correct)}
            />
          ))}
        </View>
      </SequencesShell>
      <SequencesOverlays
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
  row: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  shown: { fontSize: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
