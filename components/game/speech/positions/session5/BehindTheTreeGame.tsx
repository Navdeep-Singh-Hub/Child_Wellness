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
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  { item: '🐻', itemLabel: 'Bear', tree: '🌳' },
  { item: '🐰', itemLabel: 'Bunny', tree: '🌲' },
  { item: '🦊', itemLabel: 'Fox', tree: '🌴' },
] as const;

export function BehindTheTreeGame({ onBack, onComplete }: Props) {
  const session = usePositionsSession('behind-the-tree', DEFAULT_POSITION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [selected, setSelected] = useState(false);
  const [hidden, setHidden] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakPosition('Behind the tree! Hide the friend behind the tree.');
    return () => clearPositionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setSelected(false);
    setHidden(false);
    speakPosition(`Hide the ${round.itemLabel.toLowerCase()} behind the tree!`);
  }, [session.round, canPlay, round.itemLabel]);

  const onBehind = () => {
    if (!selected) {
      speakPosition(`Tap the ${round.itemLabel.toLowerCase()} first!`);
      return;
    }
    hapticPositionSuccess();
    setHidden(true);
    speakPosition('Behind the tree!');
    setTimeout(() => session.completeRound(), 800);
  };

  return (
    <>
      <PositionsShell
        title="Behind the Tree"
        subtitle="Hide object behind the tree"
        skills="🌳 Prepositions"
        gradient={['#D1FAE5', '#6EE7B7']}
        accent="#059669"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={hidden ? 'Hidden!' : selected ? 'Tap BEHIND' : 'Tap who to hide'}
      >
        <View style={styles.scene}>
          <View style={styles.treeRow}>
            <PositionZone
              label="BEHIND"
              accent="#059669"
              onPress={onBehind}
              active={selected && !hidden}
              done={hidden}
              style={styles.behindZone}
              emoji={hidden ? round.item : '👀'}
            />
            <Text style={styles.tree}>{round.tree}</Text>
          </View>
          {!hidden ? (
            <Pressable
              style={[styles.item, selected && styles.itemOn]}
              onPress={() => {
                setSelected(true);
                speakPosition('Now tap behind the tree!');
              }}
            >
              <Text style={styles.itemEmoji}>{round.item}</Text>
              <Text style={styles.itemLabel}>{round.itemLabel}</Text>
            </Pressable>
          ) : (
            <Text style={styles.peek}>Peek! {round.item} is behind the tree!</Text>
          )}
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
  scene: { flex: 1, alignItems: 'center' },
  treeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  tree: { fontSize: 88 },
  behindZone: { minWidth: 100, minHeight: 100 },
  item: {
    marginTop: 28,
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  itemOn: { borderColor: '#059669', borderWidth: 3 },
  itemEmoji: { fontSize: 48 },
  itemLabel: { fontSize: 14, fontWeight: '800', color: '#059669', marginTop: 4 },
  peek: { marginTop: 24, fontSize: 16, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
});
