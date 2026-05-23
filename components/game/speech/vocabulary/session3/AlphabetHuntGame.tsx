import {
  VocabularyOverlays,
  VocabularyShell,
  clearVocabSpeech,
  DEFAULT_VOCAB_ROUNDS,
  hapticVocabSuccess,
  speakVocab,
  useVocabularySession,
} from '@/components/game/speech/vocabulary/shared/vocabularyShared';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  { letter: 'B', pool: ['A', 'B', 'C', 'D'] },
  { letter: 'M', pool: ['K', 'M', 'P', 'S'] },
  { letter: 'T', pool: ['R', 'T', 'W', 'Z'] },
] as const;

export function AlphabetHuntGame({ onBack, onComplete }: Props) {
  const session = useVocabularySession('alphabet-hunt', DEFAULT_VOCAB_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakVocab('Alphabet hunt! Find the letter you hear!');
    return () => clearVocabSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    speakVocab(`Find the letter ${round.letter}!`);
  }, [session.round, canPlay, round.letter]);

  return (
    <>
      <VocabularyShell
        title="Alphabet Hunt"
        subtitle="Find the spoken letter"
        skills="🔤 Symbol recognition"
        gradient={['#EDE9FE', '#C4B5FD']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Find letter ${round.letter}!`}
      >
        <View style={styles.grid}>
          {round.pool.map((ch) => (
            <Pressable
              key={ch}
              style={styles.letterBtn}
              onPress={() => {
                if (ch === round.letter) {
                  hapticVocabSuccess();
                  speakVocab(`Yes! Letter ${ch}!`);
                  setTimeout(() => session.completeRound(), 700);
                } else {
                  speakVocab('Listen for the letter again!');
                }
              }}
            >
              <Text style={styles.letter}>{ch}</Text>
            </Pressable>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  letterBtn: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C4B5FD',
  },
  letter: { fontSize: 36, fontWeight: '900', color: '#5B21B6' },
});
