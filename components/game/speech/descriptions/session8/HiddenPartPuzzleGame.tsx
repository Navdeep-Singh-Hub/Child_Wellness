import {
  clearDescriptionSpeech,
  DEFAULT_DESCRIPTION_ROUNDS,
  DescriptionChoiceTile,
  DescriptionsOverlays,
  DescriptionsShell,
  hapticDescriptionSuccess,
  speakDescription,
  useDescriptionsSession,
} from '@/components/game/speech/descriptions/shared/descriptionsShared';
import { Level2Picture } from '@/components/game/speech/level2-shared/Level2Picture';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    partial: '🍎',
    partialImageKey: 'apple' as const,
    hint: 'Only part of a red fruit…',
    speak: 'I see part of a round red fruit. What is it?',
    choices: [
      { id: 'apple', emoji: '🍎', imageKey: 'apple' as const, label: 'Apple', correct: true },
      { id: 'car', emoji: '🚗', imageKey: 'car' as const, label: 'Car', correct: false },
      { id: 'moon', emoji: '🌙', imageKey: 'moon' as const, label: 'Moon', correct: false },
      { id: 'ball', emoji: '🔴', label: 'Ball', correct: false },
    ],
  },
  {
    partial: '🐾',
    hint: 'Furry feet with claws…',
    speak: 'I see furry paws. What animal?',
    choices: [
      { id: 'cat', emoji: '🐱', imageKey: 'cat' as const, label: 'Cat', correct: true },
      { id: 'fish', emoji: '🐟', imageKey: 'fish' as const, label: 'Fish', correct: false },
      { id: 'bird', emoji: '🐦', imageKey: 'bird' as const, label: 'Bird', correct: false },
      { id: 'flower', emoji: '🌸', imageKey: 'flower' as const, label: 'Flower', correct: false },
    ],
  },
  {
    partial: '✂️',
    partialImageKey: 'scissors' as const,
    hint: 'Sharp blades for cutting…',
    speak: 'I see metal blades. What tool?',
    choices: [
      { id: 'spoon', emoji: '🥄', imageKey: 'spoon' as const, label: 'Spoon', correct: false },
      { id: 'scissors', emoji: '✂️', imageKey: 'scissors' as const, label: 'Scissors', correct: true },
      { id: 'brush', emoji: '🖌️', imageKey: 'paint-brush' as const, label: 'Brush', correct: false },
      { id: 'phone', emoji: '📱', imageKey: 'phone' as const, label: 'Phone', correct: false },
    ],
  },
];

export function HiddenPartPuzzleGame({ onBack, onComplete }: Props) {
  const session = useDescriptionsSession('hidden-part-puzzle', DEFAULT_DESCRIPTION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakDescription('Hidden part puzzle! Guess the whole object.');
    return () => clearDescriptionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    speakDescription(round.speak);
  }, [session.round, canPlay, round.speak]);

  const onPick = (correct: boolean) => {
    if (correct) {
      hapticDescriptionSuccess();
      speakDescription('You figured it out!');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakDescription('Look at the hidden part again!');
    }
  };

  return (
    <>
      <DescriptionsShell
        title="Hidden Part Puzzle"
        subtitle="Guess from partial image"
        skills="🧩 Visual reasoning"
        gradient={['#E0F2FE', '#7DD3FC']}
        accent="#0284C7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={round.hint}
      >
        <View style={styles.partialWrap}>
          <Level2Picture imageKey={round.partialImageKey} emoji={round.partial} size={80} />
          <Text style={styles.partialLabel}>Hidden part</Text>
        </View>
        <View style={styles.grid}>
          {round.choices.map((c) => (
            <DescriptionChoiceTile
              key={c.id}
              label={c.label}
              emoji={c.emoji}
              imageKey={c.imageKey}
              accent="#0284C7"
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
  partialWrap: { alignItems: 'center', marginBottom: 12 },
  partial: { fontSize: 80 },
  partialLabel: { fontSize: 14, fontWeight: '800', color: '#0284C7', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
