import { mouthAdventureSteps } from '@/components/game/speech/lip-closure/session10/functionalSequences';
import {
  DEFAULT_FUNCTIONAL_ROUNDS,
  FunctionalGameOverlays,
  FunctionalGameShell,
  clearFunctionalSpeech,
  poseEmoji,
  speakFunctional,
  useFunctionalGameSession,
  useFunctionalSense,
  useFunctionalSuccessWatcher,
} from '@/components/game/speech/lip-closure/shared/functionalSequenceShared';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function LipMouthAdventureGame({ onBack, onComplete }: Props) {
  const session = useFunctionalGameSession('lip-mouth-adventure', DEFAULT_FUNCTIONAL_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const seq = useFunctionalSense(canPlay, session.manager.engine);
  const steps = useMemo(() => mouthAdventureSteps(session.round), [session.round]);
  const [treasure, setTreasure] = useState(false);

  useEffect(() => {
    speakFunctional('Mouth Adventure! Complete lip movement chains to unlock treasure.');
    return () => clearFunctionalSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setTreasure(false);
    session.manager.startRound(steps);
    speakFunctional('Follow the adventure path with your lips!');
  }, [session.round, canPlay, steps]);

  const onSuccess = useCallback(async () => {
    setTreasure(true);
    speakFunctional('Treasure unlocked!');
    await session.manager.recordSuccess(seq.transitionSmoothness, 0.85);
    setTimeout(() => session.completeRound(), 1000);
  }, [session, seq.transitionSmoothness]);

  useFunctionalSuccessWatcher(seq, session.manager.engine, canPlay && !treasure, onSuccess);

  return (
    <>
      <FunctionalGameShell
        title="Mouth Adventure"
        subtitle="Movement chain puzzles"
        skills="🗺️ Chains • 👄 Motor planning"
        gradient={['#ECFDF5', '#D1FAE5']}
        accent="#059669"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        seq={seq}
      >
        <View style={styles.center}>
          <Text style={styles.chest}>{treasure ? '🎁✨🏆' : '🔒🎁'}</Text>
          <Text style={styles.pose}>{poseEmoji(seq.effectivePose)}</Text>
          <Text style={styles.step}>
            Step {session.manager.engine.tracker.stepsDone + 1} / {steps.length}
          </Text>
        </View>
      </FunctionalGameShell>
      <FunctionalGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 44 },
  chest: { fontSize: 64, marginBottom: 12 },
  pose: { fontSize: 56 },
  step: { marginTop: 12, fontWeight: '800', color: '#047857', fontSize: 16 },
});
