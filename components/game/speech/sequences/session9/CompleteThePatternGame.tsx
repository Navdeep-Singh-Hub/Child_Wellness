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
    pattern: ['🔴', '🔵', '🔴', '🔵', '❓'],
    answer: 'red',
    choices: [
      { id: 'red', emoji: '🔴', imageKey: 'apple' as const, label: 'Red', correct: true },
      { id: 'blue', emoji: '🔵', imageKey: 'ball-small' as const, label: 'Blue', correct: false },
      { id: 'green', emoji: '🟢', label: 'Green', correct: false },
      { id: 'yellow', emoji: '🟡', label: 'Yellow', correct: false },
    ],
  },
  {
    pattern: ['⭐', '🌙', '⭐', '🌙', '❓'],
    answer: 'star',
    choices: [
      { id: 'sun', emoji: '☀️', imageKey: 'sun' as const, label: 'Sun', correct: false },
      { id: 'star', emoji: '⭐', imageKey: 'star' as const, label: 'Star', correct: true },
      { id: 'cloud', emoji: '☁️', label: 'Cloud', correct: false },
      { id: 'rain', emoji: '🌧️', label: 'Rain', correct: false },
    ],
  },
  {
    pattern: ['🐱', '🐶', '🐱', '🐶', '❓'],
    answer: 'cat',
    choices: [
      { id: 'cat', emoji: '🐱', imageKey: 'cat' as const, label: 'Cat', correct: true },
      { id: 'dog', emoji: '🐶', imageKey: 'dog' as const, label: 'Dog', correct: false },
      { id: 'bird', emoji: '🐦', imageKey: 'bird' as const, label: 'Bird', correct: false },
      { id: 'fish', emoji: '🐟', imageKey: 'fish' as const, label: 'Fish', correct: false },
    ],
  },
];

export function CompleteThePatternGame({ onBack, onComplete }: Props) {
  const session = useSequencesSession('complete-the-pattern', DEFAULT_SEQUENCE_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakSequence('Complete the pattern! What comes next?');
    return () => clearSequenceSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    speakSequence('What comes next in the pattern?');
  }, [session.round, canPlay]);

  const onPick = (correct: boolean) => {
    if (correct) {
      hapticSequenceSuccess();
      speakSequence('The pattern continues!');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakSequence('Look at what repeats!');
    }
  };

  return (
    <>
      <SequencesShell
        title="Complete the Pattern"
        subtitle="Finish the visual pattern"
        skills="🔁 Logic"
        gradient={['#DCFCE7', '#86EFAC']}
        accent="#16A34A"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="What comes next?"
      >
        <View style={styles.patternRow}>
          {round.pattern.map((p, i) => (
            <Text key={i} style={styles.patternItem}>
              {p}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {round.choices.map((c) => (
            <SequenceChoiceTile
              key={c.id}
              label={c.label}
              emoji={c.emoji}
              imageKey={c.imageKey}
              accent="#16A34A"
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
  patternRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  patternItem: { fontSize: 36 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
