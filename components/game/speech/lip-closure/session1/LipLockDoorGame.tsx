import {
  DEFAULT_LIP_ROUNDS,
  LipGameOverlays,
  LipGameShell,
  LipProgressRing,
  clearLipSpeech,
  speakLip,
  useLipGameSession,
  useLipHoldProgress,
  useLipSense,
} from '@/components/game/speech/lip-closure/shared/lipClosureShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const TARGET_MS = 4000;

export function LipLockDoorGame({ onBack, onComplete }: Props) {
  const session = useLipGameSession('lip-lock-door', DEFAULT_LIP_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipSense(canPlay);
  const [energy, setEnergy] = useState(1);

  useEffect(() => {
    speakLip('Lip Lock Door! Closed lips power the magic lock.');
    return () => clearLipSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setEnergy(1);
    speakLip('Keep lips closed to hold the lock.');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setEnergy((e) => {
        if (lip.lipsClosed) return Math.min(1, e + 0.012);
        return Math.max(0.15, e - 0.006);
      });
    }, 50);
    return () => clearInterval(id);
  }, [canPlay, lip.lipsClosed]);

  const progress = useLipHoldProgress(lip, TARGET_MS, canPlay, () => {
    speakLip('Treasure unlocked!');
    void session.manager.markSuccess(lip.holdDuration);
    setTimeout(() => session.completeRound(), 900);
  });

  return (
    <>
      <LipGameShell
        title="Lip Lock Door"
        subtitle="Power the magic lock with lip seal"
        skills="🚪 Sustained lock • ✨ Magic focus"
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
          <Text style={styles.door}>🚪✨</Text>
          <View style={styles.energyBar}>
            <View style={[styles.energyFill, { width: `${energy * 100}%` }]} />
          </View>
          <LipProgressRing progress={progress} accent="#7C3AED" label="" />
        </View>
      </LipGameShell>
      <LipGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  door: { fontSize: 72, marginBottom: 12 },
  energyBar: {
    width: '80%',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.85)',
    overflow: 'hidden',
    marginBottom: 16,
  },
  energyFill: { height: '100%', backgroundColor: '#A78BFA', borderRadius: 6 },
});
