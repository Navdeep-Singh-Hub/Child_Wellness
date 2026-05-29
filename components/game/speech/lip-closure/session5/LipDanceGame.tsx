import { danceSequence } from '@/components/game/speech/lip-closure/session5/transitionSequences';
import {
  DEFAULT_TRANSITION_ROUNDS,
  LipTransitionGameOverlays,
  LipTransitionGameShell,
  LipTransitionProgressRing,
  clearTransitionSpeech,
  poseEmoji,
  speakTransition,
  useLipTransitionGameSession,
  useLipTransitionSense,
  useTransitionSequence,
} from '@/components/game/speech/lip-closure/shared/lipTransitionShared';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function LipDanceGame({ onBack, onComplete }: Props) {
  const session = useLipTransitionGameSession('lip-dance', DEFAULT_TRANSITION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipTransitionSense(canPlay);
  const sequence = useMemo(() => danceSequence(session.round), [session.round]);
  const [party, setParty] = useState(false);

  useEffect(() => {
    speakTransition('Lip Dance! Switch mouth shapes for the dance party.');
    return () => clearTransitionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setParty(false);
    speakTransition('Dance with your mouth shapes!');
  }, [session.round, canPlay]);

  const { progress, expected } = useTransitionSequence(lip, sequence, canPlay, () => {
    setParty(true);
    speakTransition('Dance party! Woo hoo!');
    void session.manager.markSuccess(0.86, 1300);
    setTimeout(() => session.completeRound(), 1000);
  });

  const dancer = party ? '🕺🎉💃' : `🕺${poseEmoji(lip.effectivePose)}`;

  return (
    <>
      <LipTransitionGameShell
        title="Lip Dance"
        subtitle="Dance using mouth shape changes"
        skills="💃 Playful switches • 🔄 Coordination"
        gradient={['#F0FDF4', '#DCFCE7']}
        accent="#16A34A"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={styles.dancer}>{dancer}</Text>
          <Text style={styles.next}>Next: {expected ? poseEmoji(expected) : '🎊'}</Text>
          <LipTransitionProgressRing progress={progress} accent="#16A34A" />
        </View>
      </LipTransitionGameShell>
      <LipTransitionGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dancer: { fontSize: 76, marginBottom: 12 },
  next: { fontSize: 20, fontWeight: '800', color: '#15803D', marginBottom: 10 },
});
