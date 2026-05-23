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
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const VEGGIES = [
  { id: 'carrot', label: 'Carrot', emoji: '🥕' },
  { id: 'corn', label: 'Corn', emoji: '🌽' },
  { id: 'tomato', label: 'Tomato', emoji: '🍅' },
  { id: 'broccoli', label: 'Broccoli', emoji: '🥦' },
] as const;

export function VegetableFarmGame({ onBack, onComplete }: Props) {
  const session = useVocabularySession('vegetable-farm', DEFAULT_VOCAB_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [targetId, setTargetId] = useState<(typeof VEGGIES)[number]['id']>('carrot');

  useEffect(() => {
    speakVocab('Welcome to the vegetable farm! Pick what I ask for!');
    return () => clearVocabSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    const target = VEGGIES[(session.round - 1) % VEGGIES.length];
    setTargetId(target.id);
    speakVocab(`Pick the ${target.label.toLowerCase()}!`);
  }, [session.round, canPlay]);

  const target = VEGGIES.find((v) => v.id === targetId)!;

  return (
    <>
      <VocabularyShell
        title="Vegetable Farm"
        subtitle="Collect the vegetable you hear"
        skills="🥕 Listening"
        gradient={['#FFEDD5', '#FDBA74']}
        accent="#C2410C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Pick the ${target.label.toLowerCase()}!`}
      >
        <Text style={styles.farm}>🌾 Farm 🌾</Text>
        <View style={styles.grid}>
          {VEGGIES.map((v) => (
            <VocabTile
              key={v.id}
              label={v.label}
              emoji={v.emoji}
              accent="#C2410C"
              onPress={() => {
                if (v.id === targetId) {
                  hapticVocabSuccess();
                  speakVocab(`Fresh ${v.label}!`);
                  setTimeout(() => session.completeRound(), 700);
                } else {
                  speakVocab('Listen again — which vegetable?');
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
  farm: { textAlign: 'center', fontSize: 22, fontWeight: '900', marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
