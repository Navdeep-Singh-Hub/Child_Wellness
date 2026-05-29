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

export function LipPushBattleGame({ onBack, onComplete }: Props) {
  const session = useLipResistanceGameSession('lip-push-battle', DEFAULT_RESISTANCE_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipResistanceSense(canPlay);
  const target = resistanceDifficultyMs(resistanceRoundDifficulty(session.round));
  const [power, setPower] = useState(0.1);
  const [hero, setHero] = useState(false);

  useEffect(() => {
    speakResistance('Lip Push Battle! Steady lips fill the power meter.');
    return () => clearResistanceSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setPower(0.1);
    setHero(false);
    speakResistance('Push with strong steady lips!');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setPower((p) => {
        if (lip.stableHold) return Math.min(1, p + lip.resistanceScore * 0.02 + 0.008);
        return Math.max(0.08, p - 0.006);
      });
    }, 55);
    return () => clearInterval(id);
  }, [canPlay, lip.stableHold, lip.resistanceScore]);

  const progress = useLipResistanceProgress(lip, target, canPlay, () => {
    setHero(true);
    speakResistance('Hero celebration! You win the push battle!');
    void session.manager.markSuccess(lip.holdDuration, lip.stabilityScore);
    setTimeout(() => session.completeRound(), 900);
  });

  return (
    <>
      <LipResistanceGameShell
        title="Lip Push Battle"
        subtitle="Stable posture fills the power bar"
        skills="💪 Strength • ⏱ Endurance"
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
          <Text style={styles.hero}>{hero ? '🦸✨' : '💪'}</Text>
          <View style={styles.bar}>
            <View style={[styles.fill, { width: `${power * 100}%` }]} />
          </View>
          <LipResistanceProgressRing progress={progress} accent="#DC2626" />
        </View>
      </LipResistanceGameShell>
      <LipResistanceGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { fontSize: 80, marginBottom: 12 },
  bar: {
    width: '85%',
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  fill: { height: '100%', backgroundColor: '#F87171', borderRadius: 8 },
});
