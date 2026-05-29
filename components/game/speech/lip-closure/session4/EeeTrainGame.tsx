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

export function EeeTrainGame({ onBack, onComplete }: Props) {
  const session = useLipSpreadGameSession('eee-train', DEFAULT_SPREAD_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipSpreadSense(canPlay);
  const target = spreadDifficultyMs(spreadRoundDifficulty(session.round));
  const [trainX, setTrainX] = useState(0);
  const [party, setParty] = useState(false);

  useEffect(() => {
    speakSpread('EEE Train! Spread lips to power the train.');
    return () => clearSpreadSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setTrainX(0);
    setParty(false);
    speakSpread('Smile like EEE to move the train!');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setTrainX((x) => {
        if (lip.confirmedSpread) return Math.min(140, x + 3);
        if (lip.lipsSpread) return Math.min(140, x + 1);
        return Math.max(0, x - 0.6);
      });
    }, 60);
    return () => clearInterval(id);
  }, [canPlay, lip.confirmedSpread, lip.lipsSpread]);

  const progress = useLipSpreadProgress(lip, target, canPlay, () => {
    setParty(true);
    speakSpread('Balloon party at the station!');
    void session.manager.markSuccess(lip.holdDuration, lip.spreadScore);
    setTimeout(() => session.completeRound(), 1000);
  });

  return (
    <>
      <LipSpreadGameShell
        title="EEE Train"
        subtitle="Smile mouth moves the train"
        skills="🚂 EEE shape • 😁 Lip spread"
        gradient={['#FEE2E2', '#FECACA']}
        accent="#DC2626"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={styles.station}>{party ? '🎈🚉🎈' : '🚉'}</Text>
          <Text style={[styles.train, { transform: [{ translateX: trainX - 70 }] }]}>
            🚂💨
          </Text>
          <LipSpreadProgressRing progress={progress} accent="#DC2626" />
        </View>
      </LipSpreadGameShell>
      <LipSpreadGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  station: { fontSize: 48, marginBottom: 16 },
  train: { fontSize: 56, marginBottom: 12 },
});
