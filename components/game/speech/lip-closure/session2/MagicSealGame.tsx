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

export function MagicSealGame({ onBack, onComplete }: Props) {
  const session = useLipHoldGameSession('magic-seal', DEFAULT_HOLD_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipHoldSense(canPlay);
  const target = holdDifficultyMs(holdRoundDifficulty(session.round));
  const [charge, setCharge] = useState(0.2);

  useEffect(() => {
    speakHold('Magic Seal! Steady lips charge the shield.');
    return () => clearHoldSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setCharge(0.2);
    speakHold('Hold still to power the magic barrier!');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setCharge((c) => {
        if (lip.stableHold) return Math.min(1, c + 0.014);
        return Math.max(0.1, c - 0.007);
      });
      if (lip.stableHold) session.manager.onStable();
      else if (!lip.inGracePeriod) session.manager.onWarning();
    }, 55);
    return () => clearInterval(id);
  }, [canPlay, lip.stableHold, lip.inGracePeriod]);

  const progress = useLipStabilityProgress(lip, target, canPlay, () => {
    speakHold('Magic explosion! Shield complete!');
    void session.manager.markSuccess(lip.holdDuration, lip.stabilityScore);
    setTimeout(() => session.completeRound(), 900);
  });

  const shield = charge > 0.75 ? '🛡️✨' : charge > 0.4 ? '🛡️' : '🛡️💫';

  return (
    <>
      <LipHoldGameShell
        title="Magic Seal"
        subtitle="Steady lips charge the force field"
        skills="✨ Lip control • 🛡️ Endurance"
        gradient={['#EDE9FE', '#C4B5FD']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={[styles.shield, { opacity: 0.4 + charge * 0.6 }]}>{shield}</Text>
          <View style={styles.chargeBar}>
            <View style={[styles.chargeFill, { width: `${charge * 100}%` }]} />
          </View>
          <LipHoldProgressRing progress={progress} accent="#7C3AED" />
        </View>
      </LipHoldGameShell>
      <LipHoldGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  shield: { fontSize: 80, marginBottom: 16 },
  chargeBar: {
    width: '80%',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  chargeFill: { height: '100%', backgroundColor: '#A78BFA', borderRadius: 6 },
});
