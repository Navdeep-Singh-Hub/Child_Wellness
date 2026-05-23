import {
  VocabTile,
  VocabularyOverlays,
  VocabularyShell,
  clearVocabSpeech,
  DEFAULT_VOCAB_ROUNDS,
  hapticVocabSuccess,
  speakVocab,
  useVocabularySession,
} from '@/components/game/speech/vocabulary/shared/vocabularyShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ANIMALS = [
  { id: 'dog', label: 'Dog', emoji: '🐕' },
  { id: 'cat', label: 'Cat', emoji: '🐱' },
  { id: 'cow', label: 'Cow', emoji: '🐄' },
  { id: 'bird', label: 'Bird', emoji: '🐦' },
] as const;

export function FindTheAnimalGame({ onBack, onComplete }: Props) {
  const session = useVocabularySession('find-the-animal', DEFAULT_VOCAB_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [targetId, setTargetId] = useState<(typeof ANIMALS)[number]['id']>('dog');

  useEffect(() => {
    speakVocab('Find the animal I name!');
    return () => clearVocabSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    const target = ANIMALS[(session.round - 1) % ANIMALS.length];
    setTargetId(target.id);
    speakVocab(`Find the ${target.label.toLowerCase()}!`);
  }, [session.round, canPlay]);

  const target = ANIMALS.find((a) => a.id === targetId)!;

  return (
    <>
      <VocabularyShell
        title="Find the Animal"
        subtitle="Tap the named animal"
        skills="🐾 Vocabulary"
        gradient={['#DCFCE7', '#86EFAC']}
        accent="#16A34A"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Find the ${target.label.toLowerCase()}!`}
      >
        <View style={styles.grid}>
          {ANIMALS.map((a) => (
            <VocabTile
              key={a.id}
              label={a.label}
              emoji={a.emoji}
              accent="#16A34A"
              onPress={() => {
                if (a.id === targetId) {
                  hapticVocabSuccess();
                  speakVocab(`Yes! The ${a.label}!`);
                  setTimeout(() => session.completeRound(), 700);
                } else {
                  speakVocab('Try another animal!');
                }
              }}
            />
          ))}
        </View>
      </VocabularyShell>
      <VocabularyOverlays
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
