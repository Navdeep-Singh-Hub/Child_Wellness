import {
  clearPositionSpeech,
  DEFAULT_POSITION_ROUNDS,
  hapticPositionSuccess,
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
  {
    answer: 'near' as const,
    near: '🐦',
    nearImageKey: 'bird' as const,
    far: '🦅',
    nearLabel: 'Bird',
    farLabel: 'Eagle',
  },
  {
    answer: 'far' as const,
    near: '🐱',
    nearImageKey: 'cat' as const,
    far: '🐯',
    farImageKey: 'tiger' as const,
    nearLabel: 'Kitten',
    farLabel: 'Tiger',
  },
  {
    answer: 'near' as const,
    near: '🌸',
    nearImageKey: 'flower' as const,
    far: '🌲',
    farImageKey: 'forest-trees' as const,
    nearLabel: 'Flower',
    farLabel: 'Forest',
  },
];

export function NearOrFarGame({ onBack, onComplete }: Props) {
  const session = usePositionsSession('near-or-far', DEFAULT_POSITION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakPosition('Near or far? Tap what is close or far away!');
    return () => clearPositionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    speakPosition(`Tap what is ${round.answer}!`);
  }, [session.round, canPlay, round.answer]);

  const onPick = (which: 'near' | 'far') => {
    if (which === round.answer) {
      hapticPositionSuccess();
      speakPosition(which === 'near' ? 'That is near!' : 'That is far!');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakPosition(which === 'near' ? 'That one is far — try again!' : 'That one is near — try again!');
    }
  };

  return (
    <>
      <PositionsShell
        title="Near or Far"
        subtitle="Select the correct distance"
        skills="🔭 Spatial reasoning"
        gradient={['#FCE7F3', '#F9A8D4']}
        accent="#DB2777"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Tap the ${round.answer} one`}
      >
        <View style={styles.scene}>
          <Pressable style={styles.nearBtn} onPress={() => onPick('near')}>
            <Level2Picture imageKey={round.nearImageKey} emoji={round.near} size={72} />
            <Text style={styles.nearLabel}>{round.nearLabel} — NEAR</Text>
          </Pressable>
          <Pressable style={styles.farBtn} onPress={() => onPick('far')}>
            <Level2Picture imageKey={round.farImageKey} emoji={round.far} size={36} />
            <Text style={styles.farLabel}>{round.farLabel} — FAR</Text>
          </Pressable>
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
  scene: { flex: 1, justifyContent: 'space-around', paddingVertical: 12 },
  nearBtn: {
    alignSelf: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  nearEmoji: { fontSize: 72 },
  nearLabel: { fontSize: 16, fontWeight: '800', color: '#DB2777', marginTop: 8 },
  farBtn: {
    alignSelf: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    opacity: 0.92,
  },
  farEmoji: { fontSize: 36 },
  farLabel: { fontSize: 13, fontWeight: '800', color: '#64748B', marginTop: 4 },
});
