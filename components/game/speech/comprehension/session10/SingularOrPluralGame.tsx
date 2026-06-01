import {
  clearComprehensionSpeech,
  ComprehensionChoiceTile,
  ComprehensionOverlays,
  ComprehensionShell,
  DEFAULT_COMPREHENSION_ROUNDS,
  hapticComprehensionSuccess,
  speakComprehension,
  useComprehensionSession,
} from '@/components/game/speech/comprehension/shared/comprehensionShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    prompt: 'one cat',
    speak: 'Tap one cat. Not many cats.',
    answer: 'singular',
    choices: [
      { id: 'one', emoji: '🐱', imageKey: 'cats-one' as const, label: 'One cat', kind: 'singular' as const },
      { id: 'many', emoji: '🐱🐱🐱', imageKey: 'cats-many' as const, label: 'Many cats', kind: 'plural' as const },
    ],
  },
  {
    prompt: 'many dogs',
    speak: 'Tap many dogs. More than one.',
    answer: 'plural',
    choices: [
      { id: 'one', emoji: '🐕', imageKey: 'dogs-one' as const, label: 'One dog', kind: 'singular' as const },
      { id: 'many', emoji: '🐕🐕🐕', imageKey: 'dogs-many' as const, label: 'Many dogs', kind: 'plural' as const },
    ],
  },
  {
    prompt: 'one book',
    speak: 'Tap one book.',
    answer: 'singular',
    choices: [
      { id: 'one', emoji: '📖', imageKey: 'books-one' as const, label: 'One book', kind: 'singular' as const },
      { id: 'many', emoji: '📚', imageKey: 'books-many' as const, label: 'Many books', kind: 'plural' as const },
    ],
  },
];

export function SingularOrPluralGame({ onBack, onComplete }: Props) {
  const session = useComprehensionSession('singular-or-plural', DEFAULT_COMPREHENSION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakComprehension('Singular or plural? One or many?');
    return () => clearComprehensionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    speakComprehension(round.speak);
  }, [session.round, canPlay, round.speak]);

  const onPick = (kind: 'singular' | 'plural') => {
    if (kind === round.answer) {
      hapticComprehensionSuccess();
      speakComprehension(kind === 'singular' ? 'One!' : 'Many!');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakComprehension(round.speak);
    }
  };

  return (
    <>
      <ComprehensionShell
        title="Singular or Plural"
        subtitle="Choose the correct image"
        skills="1️⃣ Language concepts"
        gradient={['#FEF9C3', '#FDE047']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={round.prompt}
      >
        <View style={styles.row}>
          {round.choices.map((c) => (
            <ComprehensionChoiceTile
              key={c.id}
              label={c.label}
              emoji={c.emoji}
              imageKey={c.imageKey}
              accent="#CA8A04"
              onPress={() => onPick(c.kind)}
            />
          ))}
        </View>
      </ComprehensionShell>
      <ComprehensionOverlays
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
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
