import {
  ClueCard,
  clearDescriptionSpeech,
  DEFAULT_DESCRIPTION_ROUNDS,
  DescriptionChoiceTile,
  DescriptionsOverlays,
  DescriptionsShell,
  hapticDescriptionSuccess,
  speakDescription,
  useDescriptionsSession,
} from '@/components/game/speech/descriptions/shared/descriptionsShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    answer: 'apple',
    clues: ['It is a fruit.', 'It can be red or green.', 'It grows on a tree.'],
    speakClues: 'I am a fruit. I can be red or green. I grow on a tree.',
    choices: [
      { id: 'apple', emoji: '🍎', label: 'Apple', correct: true },
      { id: 'car', emoji: '🚗', label: 'Car', correct: false },
      { id: 'shoe', emoji: '👟', label: 'Shoe', correct: false },
      { id: 'sun', emoji: '☀️', label: 'Sun', correct: false },
    ],
  },
  {
    answer: 'dog',
    clues: ['It is a pet.', 'It says woof.', 'It has a tail.'],
    speakClues: 'I am a pet. I say woof. I have a tail.',
    choices: [
      { id: 'fish', emoji: '🐟', label: 'Fish', correct: false },
      { id: 'dog', emoji: '🐕', label: 'Dog', correct: true },
      { id: 'book', emoji: '📖', label: 'Book', correct: false },
      { id: 'tree', emoji: '🌳', label: 'Tree', correct: false },
    ],
  },
  {
    answer: 'umbrella',
    clues: ['You use it in rain.', 'It opens up.', 'It keeps you dry.'],
    speakClues: 'You use me in rain. I open up. I keep you dry.',
    choices: [
      { id: 'hat', emoji: '🎩', label: 'Hat', correct: false },
      { id: 'ball', emoji: '⚽', label: 'Ball', correct: false },
      { id: 'umbrella', emoji: '☂️', label: 'Umbrella', correct: true },
      { id: 'cup', emoji: '☕', label: 'Cup', correct: false },
    ],
  },
];

export function GuessTheObjectGame({ onBack, onComplete }: Props) {
  const session = useDescriptionsSession('guess-the-object', DEFAULT_DESCRIPTION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakDescription('Guess the object from the clues!');
    return () => clearDescriptionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    speakDescription(round.speakClues);
  }, [session.round, canPlay, round.speakClues]);

  const onPick = (correct: boolean) => {
    if (correct) {
      hapticDescriptionSuccess();
      speakDescription('You guessed it!');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakDescription('Read the clues again!');
    }
  };

  return (
    <>
      <DescriptionsShell
        title="Guess the Object"
        subtitle="Identify from clues"
        skills="👂 Listening comprehension"
        gradient={['#EDE9FE', '#C4B5FD']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="What is it?"
      >
        <ClueCard clues={round.clues} accent="#7C3AED" />
        <View style={styles.grid}>
          {round.choices.map((c) => (
            <DescriptionChoiceTile
              key={c.id}
              label={c.label}
              emoji={c.emoji}
              accent="#7C3AED"
              onPress={() => onPick(c.correct)}
            />
          ))}
        </View>
      </DescriptionsShell>
      <DescriptionsOverlays
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
