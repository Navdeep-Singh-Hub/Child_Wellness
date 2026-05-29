import { holdRoundDifficulty, statueDifficultyMs } from '@/components/game/speech/lip-closure/modules/LipHoldSessionManager';
import {
  DEFAULT_HOLD_ROUNDS,
  LipHoldGameOverlays,
  LipHoldGameShell,
  LipHoldProgressRing,
  clearHoldSpeech,
  speakHold,
  useLipHoldGameSession,
  useLipHoldSense,
  useLipStabilityProgress,
} from '@/components/game/speech/lip-closure/shared/lipHoldShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function LipStatueGame({ onBack, onComplete }: Props) {
  const session = useLipHoldGameSession('lip-statue', DEFAULT_HOLD_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipHoldSense(canPlay);
  const target = statueDifficultyMs(holdRoundDifficulty(session.round));
  const [stone, setStone] = useState(0);

  useEffect(() => {
    speakHold('Lip Statue! Become still like a statue.');
    return () => clearHoldSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setStone(0);
    speakHold('Hold your lip posture without moving.');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setStone((s) => {
        if (lip.stableHold) return Math.min(1, s + 0.02);
        return Math.max(0, s - 0.008);
      });
    }, 60);
    return () => clearInterval(id);
  }, [canPlay, lip.stableHold]);

  const progress = useLipStabilityProgress(lip, target, canPlay, () => {
    const stars = target >= 8000 ? 3 : target >= 5000 ? 2 : 1;
    speakHold(stars >= 3 ? 'Golden statue! Amazing hold!' : 'Statue complete! Great steady lips!');
    void session.manager.markSuccess(lip.holdDuration, lip.stabilityScore);
    setTimeout(() => session.completeRound(), 900);
  });

  const emoji = stone > 0.7 ? '🗿✨' : stone > 0.35 ? '🗿' : '🙂';

  return (
    <>
      <LipHoldGameShell
        title="Lip Statue"
        subtitle="Longer still hold earns more stars"
        skills="🗿 Endurance • 💪 Control"
        gradient={['#E2E8F0', '#CBD5E1']}
        accent="#475569"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={styles.statue}>{emoji}</Text>
          <LipHoldProgressRing progress={progress} accent="#475569" />
          <Text style={styles.hint}>Stay still — longer hold = more stars</Text>
        </View>
      </LipHoldGameShell>
      <LipHoldGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statue: { fontSize: 88, marginBottom: 12 },
  hint: { marginTop: 12, fontSize: 15, fontWeight: '700', color: '#334155' },
});
