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

export function TunnelAirGame({ onBack, onComplete }: Props) {
  const session = useLipRoundGameSession('tunnel-air', DEFAULT_ROUND_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipRoundSense(canPlay);
  const target = roundDifficultyMs(roundRoundDifficulty(session.round));
  const [energy, setEnergy] = useState(0.15);

  useEffect(() => {
    speakRound('Tunnel Air! Round lips power the airflow tunnel.');
    return () => clearRoundSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setEnergy(0.15);
    speakRound('Hold O shape to fill the tunnel!');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setEnergy((e) => {
        if (lip.confirmedRounded) return Math.min(1, e + 0.014);
        if (lip.roundedLips) return Math.min(1, e + 0.006);
        return Math.max(0.08, e - 0.007);
      });
    }, 55);
    return () => clearInterval(id);
  }, [canPlay, lip.confirmedRounded, lip.roundedLips]);

  const progress = useLipRoundProgress(lip, target, canPlay, () => {
    speakRound('Fireworks! Tunnel fully powered!');
    void session.manager.markSuccess(lip.holdDuration, lip.roundnessScore);
    setTimeout(() => session.completeRound(), 900);
  });

  const tunnel = energy > 0.85 ? '🌀✨🎆' : energy > 0.5 ? '🌀💨' : '🌀';

  return (
    <>
      <LipRoundGameShell
        title="Tunnel Air"
        subtitle="O shape activates airflow"
        skills="💨 Air shaping • ⭕ Round lips"
        gradient={['#E0E7FF', '#C7D2FE']}
        accent="#4F46E5"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={styles.tunnel}>{tunnel}</Text>
          <View style={styles.energyBar}>
            <View style={[styles.energyFill, { width: `${energy * 100}%` }]} />
          </View>
          <LipRoundProgressRing progress={progress} accent="#4F46E5" />
        </View>
      </LipRoundGameShell>
      <LipRoundGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tunnel: { fontSize: 80, marginBottom: 16 },
  energyBar: {
    width: '80%',
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.75)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  energyFill: { height: '100%', backgroundColor: '#818CF8', borderRadius: 7 },
});
