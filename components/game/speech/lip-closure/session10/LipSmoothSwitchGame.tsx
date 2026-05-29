import { smoothSwitchSteps } from '@/components/game/speech/lip-closure/session10/functionalSequences';
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

export function LipSmoothSwitchGame({ onBack, onComplete }: Props) {
  const session = useFunctionalGameSession('lip-smooth-switch', DEFAULT_FUNCTIONAL_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const seq = useFunctionalSense(canPlay, session.manager.engine);
  const steps = useMemo(() => smoothSwitchSteps(session.round), [session.round]);
  const [stars, setStars] = useState(false);

  useEffect(() => {
    speakFunctional('Smooth Switch! Transition between mouth shapes smoothly.');
    return () => clearFunctionalSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setStars(false);
    session.manager.startRound(steps);
    speakFunctional('Switch smooth and steady!');
  }, [session.round, canPlay, steps]);

  const onSuccess = useCallback(async () => {
    setStars(true);
    speakFunctional('Speed stars! Smooth transitions!');
    await session.manager.recordSuccess(seq.transitionSmoothness, 0.9);
    setTimeout(() => session.completeRound(), 1000);
  }, [session, seq.transitionSmoothness]);

  useFunctionalSuccessWatcher(seq, session.manager.engine, canPlay && !stars, onSuccess);

  const smoothPct = Math.round(seq.transitionSmoothness * 100);

  return (
    <>
      <FunctionalGameShell
        title="Smooth Switch"
        subtitle="Smooth shape transitions"
        skills="⚡ Timing • 🔄 Fluency"
        gradient={['#F5F3FF', '#EDE9FE']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        seq={seq}
      >
        <View style={styles.center}>
          <Text style={styles.pose}>{poseEmoji(seq.effectivePose)}</Text>
          <Text style={styles.smooth}>Smoothness: {smoothPct}%</Text>
          {stars ? <Text style={styles.stars}>⭐⚡⭐</Text> : null}
        </View>
      </FunctionalGameShell>
      <FunctionalGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 44 },
  pose: { fontSize: 72 },
  smooth: { marginTop: 12, fontWeight: '700', color: '#5B21B6', fontSize: 16 },
  stars: { fontSize: 36, marginTop: 12 },
});
