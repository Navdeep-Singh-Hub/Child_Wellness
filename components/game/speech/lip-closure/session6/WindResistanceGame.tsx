import {
  resistanceDifficultyMs,
  resistanceRoundDifficulty,
} from '@/components/game/speech/lip-closure/modules/LipResistanceSessionManager';
import {
  DEFAULT_RESISTANCE_ROUNDS,
  LipResistanceGameOverlays,
  LipResistanceGameShell,
  LipResistanceProgressRing,
  clearResistanceSpeech,
  speakResistance,
  useLipResistanceGameSession,
  useLipResistanceProgress,
  useLipResistanceSense,
} from '@/components/game/speech/lip-closure/shared/lipResistanceShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function WindResistanceGame({ onBack, onComplete }: Props) {
  const session = useLipResistanceGameSession('wind-resistance', DEFAULT_RESISTANCE_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipResistanceSense(canPlay);
  const target = resistanceDifficultyMs(resistanceRoundDifficulty(session.round));
  const [wind, setWind] = useState(0.6);
  const [rainbow, setRainbow] = useState(false);

  useEffect(() => {
    speakResistance('Wind Resistance! Stay strong against the wind.');
    return () => clearResistanceSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setWind(0.6);
    setRainbow(false);
    speakResistance('Hold lips steady to resist the wind!');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setWind((w) => {
        if (lip.stableHold) return Math.max(0.1, w - 0.014);
        return Math.min(1, w + 0.008);
      });
    }, 60);
    return () => clearInterval(id);
  }, [canPlay, lip.stableHold]);

  const progress = useLipResistanceProgress(lip, target, canPlay, () => {
    setRainbow(true);
    speakResistance('The wind stops! Rainbow time!');
    void session.manager.markSuccess(lip.holdDuration, lip.stabilityScore);
    setTimeout(() => session.completeRound(), 1000);
  });

  const scene = rainbow ? '🌈☀️' : wind > 0.5 ? '💨🎈💨' : '🎈';

  return (
    <>
      <LipResistanceGameShell
        title="Wind Resistance"
        subtitle="Steady lips resist the wind"
        skills="💨 Endurance • 💪 Stability"
        gradient={['#E0F2FE', '#BAE6FD']}
        accent="#0284C7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={styles.scene}>{scene}</Text>
          <LipResistanceProgressRing progress={progress} accent="#0284C7" />
        </View>
      </LipResistanceGameShell>
      <LipResistanceGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scene: { fontSize: 76, marginBottom: 16 },
});
