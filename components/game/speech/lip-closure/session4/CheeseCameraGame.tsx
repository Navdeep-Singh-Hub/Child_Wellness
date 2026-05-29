import { spreadDifficultyMs, spreadRoundDifficulty } from '@/components/game/speech/lip-closure/modules/LipSpreadSessionManager';
import {
  DEFAULT_SPREAD_ROUNDS,
  LipSpreadGameOverlays,
  LipSpreadGameShell,
  LipSpreadProgressRing,
  clearSpreadSpeech,
  speakSpread,
  useLipSpreadGameSession,
  useLipSpreadProgress,
  useLipSpreadSense,
} from '@/components/game/speech/lip-closure/shared/lipSpreadShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function CheeseCameraGame({ onBack, onComplete }: Props) {
  const session = useLipSpreadGameSession('cheese-camera', DEFAULT_SPREAD_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipSpreadSense(canPlay);
  const target = spreadDifficultyMs(spreadRoundDifficulty(session.round));
  const [meter, setMeter] = useState(0.1);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    speakSpread('Cheese Camera! Big smile powers the photo timer.');
    return () => clearSpreadSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setMeter(0.1);
    setFlash(false);
    speakSpread('Smile wide for the camera!');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setMeter((m) => {
        if (lip.confirmedSpread) return Math.min(1, m + 0.015);
        if (lip.lipsSpread) return Math.min(1, m + 0.005);
        return Math.max(0.08, m - 0.006);
      });
    }, 55);
    return () => clearInterval(id);
  }, [canPlay, lip.confirmedSpread, lip.lipsSpread]);

  const progress = useLipSpreadProgress(lip, target, canPlay, () => {
    setFlash(true);
    speakSpread('Cheese! Funny picture time!');
    void session.manager.markSuccess(lip.holdDuration, lip.spreadScore);
    setTimeout(() => session.completeRound(), 1000);
  });

  return (
    <>
      <LipSpreadGameShell
        title="Cheese Camera"
        subtitle="Smile fills the photo meter"
        skills="📸 Lip spread • 😁 Smile hold"
        gradient={['#FFF7ED', '#FFEDD5']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={[styles.center, flash && styles.flashBg]}>
          <Text style={styles.camera}>📷</Text>
          <Text style={styles.face}>{flash ? '😁📸✨' : meter > 0.5 ? '🙂' : '😐'}</Text>
          <View style={styles.meterBar}>
            <View style={[styles.meterFill, { width: `${meter * 100}%` }]} />
          </View>
          <LipSpreadProgressRing progress={progress} accent="#EA580C" />
        </View>
      </LipSpreadGameShell>
      <LipSpreadGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flashBg: { backgroundColor: 'rgba(255,255,255,0.4)' },
  camera: { fontSize: 56, marginBottom: 8 },
  face: { fontSize: 64, marginBottom: 12 },
  meterBar: {
    width: '80%',
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  meterFill: { height: '100%', backgroundColor: '#FB923C', borderRadius: 7 },
});
