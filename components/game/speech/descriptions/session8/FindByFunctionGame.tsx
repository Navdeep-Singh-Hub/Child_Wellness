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
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    functionText: 'Used for cutting',
    speak: 'What is used for cutting?',
    choices: [
      { id: 'scissors', emoji: '✂️', imageKey: 'scissors' as const, label: 'Scissors', correct: true },
      { id: 'spoon', emoji: '🥄', imageKey: 'spoon' as const, label: 'Spoon', correct: false },
      { id: 'ball', emoji: '⚽', label: 'Ball', correct: false },
      { id: 'hat', emoji: '🎩', imageKey: 'hat-top-hat' as const, label: 'Hat', correct: false },
    ],
  },
  {
    functionText: 'Used for writing',
    speak: 'What is used for writing?',
    choices: [
      { id: 'pencil', emoji: '✏️', label: 'Pencil', correct: true },
      { id: 'fork', emoji: '🍴', imageKey: 'fork' as const, label: 'Fork', correct: false },
      { id: 'shoe', emoji: '👟', label: 'Shoe', correct: false },
      { id: 'clock', emoji: '⏰', label: 'Clock', correct: false },
    ],
  },
  {
    functionText: 'Used for brushing teeth',
    speak: 'What is used for brushing teeth?',
    choices: [
      { id: 'toothbrush', emoji: '🪥', imageKey: 'toothbrush' as const, label: 'Toothbrush', correct: true },
      { id: 'comb', emoji: '💇', imageKey: 'comb' as const, label: 'Comb', correct: false },
      { id: 'pan', emoji: '🍳', imageKey: 'pan' as const, label: 'Pan', correct: false },
      { id: 'key', emoji: '🔑', label: 'Key', correct: false },
    ],
  },
];

export function FindByFunctionGame({ onBack, onComplete }: Props) {
  const session = useDescriptionsSession('find-by-function', DEFAULT_DESCRIPTION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakDescription('Find by function! What do we use it for?');
    return () => clearDescriptionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    speakDescription(round.speak);
  }, [session.round, canPlay, round.speak]);

  const onPick = (correct: boolean) => {
    if (correct) {
      hapticDescriptionSuccess();
      speakDescription('That is what we use!');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakDescription(round.speak);
    }
  };

  return (
    <>
      <DescriptionsShell
        title="Find by Function"
        subtitle="Match what it is used for"
        skills="🔧 Functional comprehension"
        gradient={['#FFEDD5', '#FDBA74']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={round.functionText}
      >
        <Text style={styles.function}>{round.functionText}</Text>
        <View style={styles.grid}>
          {round.choices.map((c) => (
            <DescriptionChoiceTile
              key={c.id}
              label={c.label}
              emoji={c.emoji}
              imageKey={c.imageKey}
              accent="#EA580C"
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
  function: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#EA580C',
    marginBottom: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
