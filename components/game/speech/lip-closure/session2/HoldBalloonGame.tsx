import { holdDifficultyMs, holdRoundDifficulty } from '@/components/game/speech/lip-closure/modules/LipHoldSessionManager';
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

export function HoldBalloonGame({ onBack, onComplete }: Props) {
  const session = useLipHoldGameSession('hold-balloon', DEFAULT_HOLD_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipHoldSense(canPlay);
  const target = holdDifficultyMs(holdRoundDifficulty(session.round));
  const [floatY, setFloatY] = useState(0);

  useEffect(() => {
    speakHold('Hold Balloon! Keep lips steady to keep the balloon floating.');
    return () => clearHoldSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setFloatY(0);
    speakHold('Hold your lips still!');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setFloatY((y) => {
        if (lip.stableHold) return Math.min(80, y + 2);
        return Math.max(-40, y - 1.2);
      });
      if (lip.stableHold) session.manager.onStable();
      else if (!lip.inGracePeriod) session.manager.onWarning();
    }, 60);
    return () => clearInterval(id);
  }, [canPlay, lip.stableHold, lip.inGracePeriod]);

  const progress = useLipStabilityProgress(lip, target, canPlay, () => {
    speakHold('Balloon celebration! You did it!');
    void session.manager.markSuccess(lip.holdDuration, lip.stabilityScore);
    setTimeout(() => session.completeRound(), 900);
  });

  return (
    <>
      <LipHoldGameShell
        title="Hold Balloon"
        subtitle="Steady lips keep the balloon up"
        skills="🎈 Lip posture • ⏱ Endurance"
        gradient={['#FEF9C3', '#FDE68A']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={[styles.balloon, { transform: [{ translateY: -floatY }] }]}>🎈</Text>
          <LipHoldProgressRing progress={progress} accent="#CA8A04" />
          <Text style={styles.hint}>Keep lips steady to fill the bar</Text>
        </View>
      </LipHoldGameShell>
      <LipHoldGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  balloon: { fontSize: 88, marginBottom: 8 },
  hint: { marginTop: 12, fontSize: 15, fontWeight: '700', color: '#A16207' },
});
