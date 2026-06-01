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
import { Level2Picture } from '@/components/game/speech/level2-shared/Level2Picture';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    group: 'Fruits',
    item: { emoji: '🍎', imageKey: 'apple' as const, label: 'Apple' },
    belongs: true,
    say: 'Does an apple belong with fruits?',
  },
  {
    group: 'Fruits',
    item: { emoji: '🚗', imageKey: 'car' as const, label: 'Car' },
    belongs: false,
    say: 'Does a car belong with fruits?',
  },
  {
    group: 'Animals',
    item: { emoji: '🐕', imageKey: 'dog' as const, label: 'Dog' },
    belongs: true,
    say: 'Does a dog belong with animals?',
  },
];

export function BelongsOrNotGame({ onBack, onComplete }: Props) {
  const session = useComprehensionSession('belongs-or-not', DEFAULT_COMPREHENSION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakComprehension('Belongs or not? Does it fit in the group?');
    return () => clearComprehensionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    speakComprehension(round.say);
  }, [session.round, canPlay, round.say]);

  const onPick = (belongs: boolean) => {
    if (belongs === round.belongs) {
      hapticComprehensionSuccess();
      speakComprehension(belongs ? 'Yes, it belongs!' : 'Right, it does not belong!');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakComprehension('Think about the group again!');
    }
  };

  return (
    <>
      <ComprehensionShell
        title="Belongs or Not?"
        subtitle="Category reasoning"
        skills="🗂️ Advanced categorization"
        gradient={['#EDE9FE', '#C4B5FD']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Group: ${round.group}`}
      >
        <Text style={styles.group}>{round.group}</Text>
        <Level2Picture imageKey={round.item.imageKey} emoji={round.item.emoji} size={64} />
        <Text style={styles.itemLabel}>{round.item.label}</Text>
        <View style={styles.row}>
          <ComprehensionChoiceTile
            label="Belongs ✓"
            emoji="✅"
            accent="#7C3AED"
            onPress={() => onPick(true)}
          />
          <ComprehensionChoiceTile
            label="Does not ✗"
            emoji="❌"
            accent="#7C3AED"
            onPress={() => onPick(false)}
          />
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
  group: { textAlign: 'center', fontSize: 20, fontWeight: '900', color: '#7C3AED', marginBottom: 8 },
  itemLabel: { textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
