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
import { Level2Picture } from '@/components/game/speech/level2-shared/Level2Picture';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const VEGGIES = [
  { id: 'carrot', label: 'Carrot', emoji: '🥕', imageKey: 'carrot' as const },
  { id: 'corn', label: 'Corn', emoji: '🌽', imageKey: 'corn' as const },
  { id: 'tomato', label: 'Tomato', emoji: '🍅', imageKey: 'tomato' as const },
  { id: 'broccoli', label: 'Broccoli', emoji: '🥦', imageKey: 'brocoli' as const },
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
        <View style={styles.farmRow}>
          <Level2Picture imageKey="place-farm" emoji="🌾" size={40} />
          <Text style={styles.farm}>Farm</Text>
          <Level2Picture imageKey="place-farm" emoji="🌾" size={40} />
        </View>
        <View style={styles.grid}>
          {VEGGIES.map((v) => (
            <VocabTile
              key={v.id}
              label={v.label}
              emoji={v.emoji}
              imageKey={v.imageKey}
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
  farmRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 },
  farm: { fontSize: 22, fontWeight: '900', color: '#C2410C' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
