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

export function FishMouthGame({ onBack, onComplete }: Props) {
  const session = useLipRoundGameSession('lip-fish-mouth', DEFAULT_ROUND_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipRoundSense(canPlay);
  const target = roundDifficultyMs(roundRoundDifficulty(session.round));
  const [fishX, setFishX] = useState(0);
  const [food, setFood] = useState(0.2);

  useEffect(() => {
    speakRound('Fish Mouth! Make an O shape to feed the fish.');
    return () => clearRoundSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setFishX(0);
    setFood(0.2);
    speakRound('Round lips make fish food!');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setFood((f) => {
        if (lip.roundedLips) return Math.min(1, f + 0.016);
        return Math.max(0.1, f - 0.006);
      });
      setFishX((x) => {
        if (lip.confirmedRounded) return Math.min(120, x + 2.5);
        return Math.max(0, x - 0.8);
      });
      if (lip.confirmedRounded) session.manager.onRounded();
      else if (!lip.inGracePeriod) session.manager.onWarning();
    }, 60);
    return () => clearInterval(id);
  }, [canPlay, lip.roundedLips, lip.confirmedRounded, lip.inGracePeriod]);

  const progress = useLipRoundProgress(lip, target, canPlay, () => {
    speakRound('Fish celebration! Yummy O shape!');
    void session.manager.markSuccess(lip.holdDuration, lip.roundnessScore);
    setTimeout(() => session.completeRound(), 900);
  });

  return (
    <>
      <LipRoundGameShell
        title="Fish Mouth"
        subtitle="O shape feeds the fish"
        skills="🐟 Lip rounding • ⭕ O shape"
        gradient={['#E0F7FA', '#B2EBF2']}
        accent="#0891B2"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={styles.food}>🍤{food > 0.5 ? '✨' : ''}</Text>
          <Text style={[styles.fish, { transform: [{ translateX: fishX }] }]}>🐠</Text>
          <LipRoundProgressRing progress={progress} accent="#0891B2" />
          <Text style={styles.hint}>Hold O shape to feed the fish</Text>
        </View>
      </LipRoundGameShell>
      <LipRoundGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  food: { fontSize: 40, marginBottom: 8 },
  fish: { fontSize: 72, marginBottom: 12 },
  hint: { marginTop: 12, fontSize: 15, fontWeight: '700', color: '#0E7490' },
});
