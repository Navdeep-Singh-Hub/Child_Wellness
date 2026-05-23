import {
  clearPositionSpeech,
  DEFAULT_POSITION_ROUNDS,
  hapticPositionSuccess,
  PositionChoiceTile,
  PositionsOverlays,
  PositionsShell,
  speakPosition,
  usePositionsSession,
} from '@/components/game/speech/positions/shared/positionsShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  { answer: 'left' as const, left: { emoji: '🍎', label: 'Apple' }, right: { emoji: '🚗', label: 'Car' } },
  { answer: 'right' as const, left: { emoji: '🐕', label: 'Dog' }, right: { emoji: '🎈', label: 'Balloon' } },
  { answer: 'left' as const, left: { emoji: '⭐', label: 'Star' }, right: { emoji: '🌳', label: 'Tree' } },
];

export function LeftOrRightGame({ onBack, onComplete }: Props) {
  const session = usePositionsSession('left-or-right', DEFAULT_POSITION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakPosition('Left or right? Tap the one on the correct side!');
    return () => clearPositionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    speakPosition(`Tap the one on the ${round.answer}!`);
  }, [session.round, canPlay, round.answer]);

  const onPick = (side: 'left' | 'right') => {
    if (side === round.answer) {
      hapticPositionSuccess();
      speakPosition(`Yes! On the ${round.answer}!`);
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakPosition(`Try the ${round.answer} side!`);
    }
  };

  return (
    <>
      <PositionsShell
        title="Left or Right?"
        subtitle="Choose the correct direction"
        skills="↔️ Direction concepts"
        gradient={['#DCFCE7', '#86EFAC']}
        accent="#16A34A"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Find the ${round.answer} one`}
      >
        <Text style={styles.center}>🧒</Text>
        <View style={styles.row}>
          <PositionChoiceTile
            label={`← ${round.left.label}`}
            emoji={round.left.emoji}
            accent="#16A34A"
            onPress={() => onPick('left')}
          />
          <PositionChoiceTile
            label={`${round.right.label} →`}
            emoji={round.right.emoji}
            accent="#16A34A"
            onPress={() => onPick('right')}
          />
        </View>
      </PositionsShell>
      <PositionsOverlays
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
  center: { textAlign: 'center', fontSize: 56, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
