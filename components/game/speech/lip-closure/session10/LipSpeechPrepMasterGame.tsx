import { speechPrepMasterSteps } from '@/components/game/speech/lip-closure/session10/functionalSequences';
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

export function LipSpeechPrepMasterGame({ onBack, onComplete }: Props) {
  const session = useFunctionalGameSession('lip-speech-prep-master', DEFAULT_FUNCTIONAL_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const seq = useFunctionalSense(canPlay, session.manager.engine);
  const steps = useMemo(() => speechPrepMasterSteps(session.round), [session.round]);
  const [hero, setHero] = useState(false);

  useEffect(() => {
    speakFunctional('Speech Prep Master! The final challenge — hold, burst, airflow, and shapes together.');
    return () => clearFunctionalSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setHero(false);
    session.manager.startRound(steps);
    speakFunctional('Master the full lip sequence!');
  }, [session.round, canPlay, steps]);

  const onSuccess = useCallback(async () => {
    setHero(true);
    speakFunctional('Hero celebration! You are speech ready!');
    await session.manager.recordSuccess(seq.transitionSmoothness, 0.95);
    setTimeout(() => session.completeRound(), 1200);
  }, [session, seq.transitionSmoothness]);

  useFunctionalSuccessWatcher(seq, session.manager.engine, canPlay && !hero, onSuccess);

  return (
    <>
      <FunctionalGameShell
        title="Speech Prep Master"
        subtitle="Integrated lip sequencing challenge"
        skills="🦸 Full prep • 👄 Speech readiness"
        gradient={['#FFF7ED', '#FFEDD5']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        seq={seq}
      >
        <View style={styles.center}>
          <Text style={styles.hero}>{hero ? '🦸‍♂️🎉✨' : '🦸‍♂️'}</Text>
          <Text style={styles.pose}>{poseEmoji(seq.effectivePose)}</Text>
          <Text style={styles.integrated}>
            {seq.lipsClosed && '👄 '}
            {seq.airflowActive && '💨 '}
            {seq.audioSpike && '💥 '}
            {!seq.lipsClosed && !seq.airflowActive && !seq.audioSpike && '✨ '}
            Integrated prep
          </Text>
        </View>
      </FunctionalGameShell>
      <FunctionalGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 44 },
  hero: { fontSize: 64, marginBottom: 8 },
  pose: { fontSize: 56 },
  integrated: { marginTop: 12, fontWeight: '700', color: '#C2410C', fontSize: 15 },
});
