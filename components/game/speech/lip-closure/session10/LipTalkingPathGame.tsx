import { talkingPathSteps } from '@/components/game/speech/lip-closure/session10/functionalSequences';
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

export function LipTalkingPathGame({ onBack, onComplete }: Props) {
  const session = useFunctionalGameSession('lip-talking-path', DEFAULT_FUNCTIONAL_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const seq = useFunctionalSense(canPlay, session.manager.engine);
  const steps = useMemo(() => talkingPathSteps(session.round), [session.round]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    speakFunctional('Talking Path! Follow the lip shapes to move forward.');
    return () => clearFunctionalSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setDone(false);
    session.manager.startRound(steps);
    speakFunctional('Round lips, then spread — move along the path!');
  }, [session.round, canPlay, steps]);

  const onSuccess = useCallback(async () => {
    setDone(true);
    speakFunctional('Path complete! Celebration!');
    await session.manager.recordSuccess(seq.transitionSmoothness, seq.sequenceProgress);
    setTimeout(() => session.completeRound(), 1000);
  }, [session, seq.transitionSmoothness, seq.sequenceProgress]);

  useFunctionalSuccessWatcher(seq, session.manager.engine, canPlay && !done, onSuccess);

  const walk = Math.min(72, seq.sequenceProgress * 72);

  return (
    <>
      <FunctionalGameShell
        title="Talking Path"
        subtitle="Lip sequence moves you forward"
        skills="🛤️ Sequences • 👄 Lip flow"
        gradient={['#EFF6FF', '#DBEAFE']}
        accent="#2563EB"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        seq={seq}
      >
        <View style={styles.scene}>
          <Text style={styles.goal}>{done ? '🏁✨' : '🏁'}</Text>
          <Text style={[styles.hero, { marginLeft: `${walk}%` }]}>{done ? '🦸✨' : '🚶'}</Text>
          <Text style={styles.you}>You: {poseEmoji(seq.effectivePose)}</Text>
        </View>
      </FunctionalGameShell>
      <FunctionalGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  scene: { flex: 1, justifyContent: 'center', paddingHorizontal: 16, paddingTop: 48 },
  goal: { fontSize: 36, alignSelf: 'flex-end', marginBottom: 16 },
  hero: { fontSize: 52 },
  you: { marginTop: 20, fontWeight: '800', color: '#1D4ED8', fontSize: 17, textAlign: 'center' },
});
