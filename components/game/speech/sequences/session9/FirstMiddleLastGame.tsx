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
import { StyleSheet, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    target: 'first' as const,
    prompt: 'Tap FIRST!',
    positions: [
      { id: 'first', emoji: '🥇', imageKey: 'medal-first' as const, label: 'First', slot: 'first' as const },
      { id: 'middle', emoji: '2️⃣', imageKey: 'number-2' as const, label: 'Middle', slot: 'middle' as const },
      { id: 'last', emoji: '🏁', imageKey: 'finish-flag' as const, label: 'Last', slot: 'last' as const },
    ],
  },
  {
    target: 'middle' as const,
    prompt: 'Tap MIDDLE!',
    positions: [
      { id: 'first', emoji: '🌅', imageKey: 'sunrise' as const, label: 'Morning', slot: 'first' as const },
      { id: 'middle', emoji: '☀️', imageKey: 'sun-noon' as const, label: 'Noon', slot: 'middle' as const },
      { id: 'last', emoji: '🌙', imageKey: 'moon-night' as const, label: 'Night', slot: 'last' as const },
    ],
  },
  {
    target: 'last' as const,
    prompt: 'Tap LAST!',
    positions: [
      { id: 'first', emoji: '1️⃣', imageKey: 'number-1' as const, label: 'One', slot: 'first' as const },
      { id: 'middle', emoji: '2️⃣', imageKey: 'number-2' as const, label: 'Two', slot: 'middle' as const },
      { id: 'last', emoji: '3️⃣', imageKey: 'number-3' as const, label: 'Three', slot: 'last' as const },
    ],
  },
];

export function FirstMiddleLastGame({ onBack, onComplete }: Props) {
  const session = useSequencesSession('first-middle-last', DEFAULT_SEQUENCE_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakSequence('First, middle, or last? Tap the right position!');
    return () => clearSequenceSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    speakSequence(round.prompt);
  }, [session.round, canPlay, round.prompt]);

  const onPick = (slot: 'first' | 'middle' | 'last') => {
    if (slot === round.target) {
      hapticSequenceSuccess();
      speakSequence(`Yes, ${round.target}!`);
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakSequence(round.prompt);
    }
  };

  return (
    <>
      <SequencesShell
        title="First-Middle-Last"
        subtitle="Choose the correct position"
        skills="1️⃣ Order concepts"
        gradient={['#FCE7F3', '#F9A8D4']}
        accent="#DB2777"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={round.prompt}
      >
        <View style={styles.row}>
          {round.positions.map((p) => (
            <SequenceChoiceTile
              key={p.id}
              label={p.label}
              emoji={p.emoji}
              imageKey={p.imageKey}
              accent="#DB2777"
              onPress={() => onPick(p.slot)}
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
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
