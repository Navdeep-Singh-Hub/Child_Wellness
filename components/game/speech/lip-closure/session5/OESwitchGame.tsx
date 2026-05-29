import { alternationSequence } from '@/components/game/speech/lip-closure/session5/transitionSequences';
import {
  DEFAULT_TRANSITION_ROUNDS,
  LipTransitionGameOverlays,
  LipTransitionGameShell,
  LipTransitionProgressRing,
  clearTransitionSpeech,
  poseEmoji,
  poseLabel,
  speakTransition,
  useLipTransitionGameSession,
  useLipTransitionSense,
  useTransitionSequence,
} from '@/components/game/speech/lip-closure/shared/lipTransitionShared';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function OESwitchGame({ onBack, onComplete }: Props) {
  const session = useLipTransitionGameSession('o-e-switch', DEFAULT_TRANSITION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipTransitionSense(canPlay);
  const sequence = useMemo(() => alternationSequence(session.round), [session.round]);
  const [fireworks, setFireworks] = useState(false);

  useEffect(() => {
    speakTransition('O E Switch! Copy O then E mouth shapes.');
    return () => clearTransitionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setFireworks(false);
    speakTransition('Switch from O to E smoothly!');
  }, [session.round, canPlay]);

  const { progress, expected } = useTransitionSequence(lip, sequence, canPlay, () => {
    setFireworks(true);
    speakTransition('Mouth fireworks! Great switching!');
    void session.manager.markSuccess(0.85, 1200);
    setTimeout(() => session.completeRound(), 900);
  });

  return (
    <>
      <LipTransitionGameShell
        title="O ↔ E Switch"
        subtitle="Switch between O and smile mouth"
        skills="🔄 O → E • 😁 Lip alternation"
        gradient={['#DBEAFE', '#BFDBFE']}
        accent="#2563EB"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={styles.label}>Next: {expected ? poseLabel(expected) : 'Done!'}</Text>
          <Text style={styles.avatar}>{expected ? poseEmoji(expected) : '🎆'}</Text>
          <Text style={styles.you}>You: {poseEmoji(lip.effectivePose)}</Text>
          {fireworks ? <Text style={styles.fx}>🎆✨🎆</Text> : null}
          <LipTransitionProgressRing progress={progress} accent="#2563EB" />
        </View>
      </LipTransitionGameShell>
      <LipTransitionGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 16, fontWeight: '800', color: '#1D4ED8' },
  avatar: { fontSize: 72, marginVertical: 10 },
  you: { fontSize: 18, fontWeight: '700', color: '#1E40AF', marginBottom: 8 },
  fx: { fontSize: 40, marginBottom: 8 },
});
