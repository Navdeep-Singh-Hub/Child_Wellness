import {
  clearPositionSpeech,
  DEFAULT_POSITION_ROUNDS,
  hapticPositionSuccess,
  PositionZone,
  PositionsOverlays,
  PositionsShell,
  speakPosition,
  usePositionsSession,
} from '@/components/game/speech/positions/shared/positionsShared';
import { Level2Picture } from '@/components/game/speech/level2-shared/Level2Picture';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  { item: '⚽', itemImageKey: 'ball-big' as const, itemLabel: 'Ball', table: '🪑', tableImageKey: 'dining-table' as const },
  { item: '🐕', itemImageKey: 'dog' as const, itemLabel: 'Puppy', table: '🍽️', tableImageKey: 'dining-table' as const },
  { item: '📚', itemImageKey: 'books-many' as const, itemLabel: 'Books', table: '🛋️', tableImageKey: 'sofa' as const },
] as const;

export function UnderTheTableGame({ onBack, onComplete }: Props) {
  const session = usePositionsSession('under-the-table', DEFAULT_POSITION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [selected, setSelected] = useState(false);
  const [placed, setPlaced] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakPosition('Under the table! Put things under where they belong.');
    return () => clearPositionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setSelected(false);
    setPlaced(false);
    speakPosition(`Put the ${round.itemLabel.toLowerCase()} under the table!`);
  }, [session.round, canPlay, round.itemLabel]);

  const onUnder = () => {
    if (!selected) {
      speakPosition(`Tap the ${round.itemLabel.toLowerCase()} first!`);
      return;
    }
    hapticPositionSuccess();
    setPlaced(true);
    speakPosition('Under the table!');
    setTimeout(() => session.completeRound(), 800);
  };

  return (
    <>
      <PositionsShell
        title="Under the Table"
        subtitle="Place object under the table"
        skills="⬇️ Spatial understanding"
        gradient={['#E0E7FF', '#A5B4FC']}
        accent="#4F46E5"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={placed ? 'Perfect spot!' : selected ? 'Tap UNDER' : 'Tap the object'}
      >
        <View style={styles.scene}>
          <Level2Picture imageKey={round.tableImageKey} emoji={round.table} size={72} />
          <Text style={styles.tableLabel}>Table</Text>
          <PositionZone
            label="UNDER"
            accent="#4F46E5"
            onPress={onUnder}
            active={selected && !placed}
            done={placed}
            style={styles.underZone}
            emoji={placed ? round.item : '⬇️'}
            imageKey={placed ? round.itemImageKey : undefined}
          />
          {!placed ? (
            <Pressable
              style={[styles.item, selected && styles.itemOn]}
              onPress={() => {
                setSelected(true);
                speakPosition('Now tap under!');
              }}
            >
              <Level2Picture imageKey={round.itemImageKey} emoji={round.item} size={48} />
            </Pressable>
          ) : null}
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
  scene: { flex: 1, alignItems: 'center', minHeight: 240 },
  table: { fontSize: 72, marginTop: 8 },
  tableLabel: { fontSize: 14, fontWeight: '800', color: '#475569' },
  underZone: { marginTop: 16, minWidth: 160, minHeight: 88 },
  item: {
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  itemOn: { borderColor: '#4F46E5', borderWidth: 3 },
  itemEmoji: { fontSize: 48 },
});
