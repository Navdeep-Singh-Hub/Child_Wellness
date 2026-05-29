import { soundBuilderSteps } from '@/components/game/speech/lip-closure/session10/functionalSequences';
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

export function LipSoundBuilderGame({ onBack, onComplete }: Props) {
  const session = useFunctionalGameSession('lip-sound-builder', DEFAULT_FUNCTIONAL_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const seq = useFunctionalSense(canPlay, session.manager.engine);
  const steps = useMemo(() => soundBuilderSteps(session.round), [session.round]);
  const [magic, setMagic] = useState(false);

  useEffect(() => {
    speakFunctional('Sound Builder! Close, burst, round — build the magic sound pattern.');
    return () => clearFunctionalSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setMagic(false);
    session.manager.startRound(steps);
    speakFunctional('Close lips, burst, then round!');
  }, [session.round, canPlay, steps]);

  const onSuccess = useCallback(async () => {
    setMagic(true);
    speakFunctional('Magic sound machine!');
    await session.manager.recordSuccess(seq.transitionSmoothness, 0.88);
    setTimeout(() => session.completeRound(), 1000);
  }, [session, seq.transitionSmoothness]);

  useFunctionalSuccessWatcher(seq, session.manager.engine, canPlay && !magic, onSuccess);

  return (
    <>
      <FunctionalGameShell
        title="Sound Builder"
        subtitle="Close → burst → round pattern"
        skills="💥 Bilabial prep • 😮 Shapes"
        gradient={['#FEF3C7', '#FDE68A']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        seq={seq}
      >
        <View style={styles.center}>
          <Text style={styles.machine}>{magic ? '🎛️✨🎵' : '🎛️'}</Text>
          <Text style={styles.pose}>{poseEmoji(seq.effectivePose)}</Text>
          {seq.audioSpike && <Text style={styles.spark}>💫</Text>}
        </View>
      </FunctionalGameShell>
      <FunctionalGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  machine: { fontSize: 72, marginBottom: 12 },
  pose: { fontSize: 56 },
  spark: { fontSize: 32, marginTop: 8 },
});
