import { roundDifficultyMs, roundRoundDifficulty } from '@/components/game/speech/lip-closure/modules/LipRoundSessionManager';
import {
  DEFAULT_ROUND_ROUNDS,
  LipRoundGameOverlays,
  LipRoundGameShell,
  LipRoundProgressRing,
  clearRoundSpeech,
  speakRound,
  useLipRoundGameSession,
  useLipRoundProgress,
  useLipRoundSense,
} from '@/components/game/speech/lip-closure/shared/lipRoundShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function BubbleCannonGame({ onBack, onComplete }: Props) {
  const session = useLipRoundGameSession('bubble-cannon', DEFAULT_ROUND_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipRoundSense(canPlay);
  const target = roundDifficultyMs(roundRoundDifficulty(session.round));
  const [charge, setCharge] = useState(0.15);
  const [exploded, setExploded] = useState(false);

  useEffect(() => {
    speakRound('Bubble Cannon! Round lips charge the cannon.');
    return () => clearRoundSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setCharge(0.15);
    setExploded(false);
    speakRound('Hold O shape — longer charge means bigger bubbles!');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setCharge((c) => {
        if (lip.confirmedRounded) return Math.min(1, c + 0.016);
        if (lip.roundedLips) return Math.min(1, c + 0.005);
        return Math.max(0.1, c - 0.006);
      });
    }, 55);
    return () => clearInterval(id);
  }, [canPlay, lip.confirmedRounded, lip.roundedLips]);

  const progress = useLipRoundProgress(lip, target, canPlay, () => {
    setExploded(true);
    speakRound('Bubble explosion! Amazing O shape!');
    void session.manager.markSuccess(lip.holdDuration, lip.roundnessScore);
    setTimeout(() => session.completeRound(), 900);
  });

  const cannon = exploded
    ? '🫧🫧🫧✨'
    : charge > 0.7
      ? '🔫🫧🫧'
      : charge > 0.35
        ? '🔫🫧'
        : '🔫';

  return (
    <>
      <LipRoundGameShell
        title="Bubble Cannon"
        subtitle="O shape launches bubbles"
        skills="🫧 Round lips • 💪 Hold power"
        gradient={['#FCE7F3', '#FBCFE8']}
        accent="#EC4899"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={[styles.cannon, { transform: [{ scale: 0.8 + charge * 0.4 }] }]}>{cannon}</Text>
          <LipRoundProgressRing progress={progress} accent="#EC4899" />
        </View>
      </LipRoundGameShell>
      <LipRoundGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cannon: { fontSize: 76, marginBottom: 16 },
});
