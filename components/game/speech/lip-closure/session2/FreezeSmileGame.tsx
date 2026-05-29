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

const POSES = ['🙂', '😐', '😊'];

export function FreezeSmileGame({ onBack, onComplete }: Props) {
  const session = useLipHoldGameSession('freeze-smile', DEFAULT_HOLD_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipHoldSense(canPlay);
  const target = holdDifficultyMs(holdRoundDifficulty(session.round));
  const targetPose = POSES[(session.round - 1) % POSES.length];
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    speakHold('Freeze Smile! Copy the face and hold still.');
    return () => clearHoldSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setFlash(false);
    speakHold('Match the smile and freeze your lips.');
  }, [session.round, canPlay]);

  const progress = useLipStabilityProgress(lip, target, canPlay, () => {
    setFlash(true);
    speakHold('Flash! Perfect freeze!');
    void session.manager.markSuccess(lip.holdDuration, lip.stabilityScore);
    setTimeout(() => session.completeRound(), 1100);
  });

  return (
    <>
      <LipHoldGameShell
        title="Freeze Smile"
        subtitle="Copy the pose and hold still"
        skills="🙂 Lip posture • 📸 Freeze hold"
        gradient={['#FCE7F3', '#FBCFE8']}
        accent="#DB2777"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={[styles.center, flash && styles.flash]}>
          <Text style={styles.label}>Copy this:</Text>
          <Text style={styles.target}>{targetPose}</Text>
          <Text style={styles.you}>You:</Text>
          <Text style={styles.mirror}>{lip.stableHold ? targetPose : '🙂'}</Text>
          <LipHoldProgressRing progress={progress} accent="#DB2777" />
        </View>
      </LipHoldGameShell>
      <LipHoldGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flash: { backgroundColor: 'rgba(255,255,255,0.35)' },
  label: { fontSize: 16, fontWeight: '700', color: '#9D174D' },
  target: { fontSize: 72, marginVertical: 8 },
  you: { fontSize: 14, fontWeight: '700', color: '#831843', marginTop: 8 },
  mirror: { fontSize: 64, marginBottom: 12 },
});
