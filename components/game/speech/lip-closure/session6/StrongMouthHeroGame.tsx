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

const POWERS = ['⭐', '🛡️', '⚡', '🦸', '🌟'];

export function StrongMouthHeroGame({ onBack, onComplete }: Props) {
  const session = useLipResistanceGameSession('strong-mouth-hero', DEFAULT_RESISTANCE_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipResistanceSense(canPlay);
  const target = resistanceDifficultyMs(resistanceRoundDifficulty(session.round));
  const [powers, setPowers] = useState(0);
  const [party, setParty] = useState(false);

  useEffect(() => {
    speakResistance('Strong Mouth Hero! Hold steady to unlock powers.');
    return () => clearResistanceSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setPowers(0);
    setParty(false);
    speakResistance('Longer hold unlocks more hero powers!');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      const unlocked = Math.min(
        POWERS.length,
        Math.floor((lip.holdDuration / target) * POWERS.length) + (lip.stableHold ? 1 : 0),
      );
      setPowers(unlocked);
    }, 200);
    return () => clearInterval(id);
  }, [canPlay, lip.stableHold, lip.holdDuration, target]);

  const progress = useLipResistanceProgress(lip, target, canPlay, () => {
    setParty(true);
    speakResistance('Superhero dance party! All powers unlocked!');
    void session.manager.markSuccess(lip.holdDuration, lip.stabilityScore);
    setTimeout(() => session.completeRound(), 1000);
  });

  const hero = party ? '🦸🎉✨' : '🦸';

  return (
    <>
      <LipResistanceGameShell
        title="Strong Mouth Hero"
        subtitle="Longer hold = more powers"
        skills="🦸 Endurance • 💪 Lip strength"
        gradient={['#EDE9FE', '#DDD6FE']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={styles.hero}>{hero}</Text>
          <Text style={styles.powers}>{POWERS.slice(0, powers).join(' ')}</Text>
          <LipResistanceProgressRing progress={progress} accent="#7C3AED" />
        </View>
      </LipResistanceGameShell>
      <LipResistanceGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { fontSize: 88, marginBottom: 8 },
  powers: { fontSize: 32, marginBottom: 12, letterSpacing: 4 },
});
