import {
  clearPositionSpeech,
  DEFAULT_POSITION_ROUNDS,
  DragIntoZone,
  PositionsOverlays,
  PositionsShell,
  speakPosition,
  usePositionsSession,
} from '@/components/game/speech/positions/shared/positionsShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  { item: '🧸', itemImageKey: 'teddy' as const, box: '📦', zoneImageKey: 'box' as const, say: 'Put teddy in the box!' },
  { item: '🐱', itemImageKey: 'cat' as const, box: '🧺', zoneImageKey: 'crate' as const, say: 'Put the kitten in the basket!' },
  { item: '🚗', itemImageKey: 'car' as const, box: '🏠', zoneImageKey: 'car-in-garage' as const, say: 'Drive the car into the garage!' },
] as const;

export function PutTeddyInTheBoxGame({ onBack, onComplete }: Props) {
  const session = usePositionsSession('put-teddy-in-box', DEFAULT_POSITION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [done, setDone] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakPosition('Put teddy in the box! Drag the toy inside.');
    return () => clearPositionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setDone(false);
    speakPosition(round.say);
  }, [session.round, canPlay, round.say]);

  return (
    <>
      <PositionsShell
        title="Put Teddy In the Box"
        subtitle="Drag item into the box"
        skills="📦 In / out"
        gradient={['#FEF3C7', '#FCD34D']}
        accent="#D97706"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={done ? 'Inside!' : 'Drag into the box'}
      >
        {canPlay && !done ? (
          <DragIntoZone
            key={`${session.round}-${round.item}`}
            itemEmoji={round.item}
            itemImageKey={round.itemImageKey}
            zoneLabel="IN"
            zoneEmoji={round.box}
            zoneImageKey={round.zoneImageKey}
            accent="#D97706"
            onSuccess={() => {
              setDone(true);
              setTimeout(() => session.completeRound(), 900);
            }}
          />
        ) : done ? (
          <View style={styles.doneWrap}>
            <Text style={styles.doneBox}>{round.box}</Text>
            <Text style={styles.doneItem}>{round.item}</Text>
            <Text style={styles.doneText}>Inside!</Text>
          </View>
        ) : null}
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
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  doneBox: { fontSize: 72 },
  doneItem: { fontSize: 48, marginTop: 8 },
  doneText: { fontSize: 20, fontWeight: '900', color: '#D97706', marginTop: 12 },
});
