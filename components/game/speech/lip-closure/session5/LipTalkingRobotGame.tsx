import { robotSequence } from '@/components/game/speech/lip-closure/session5/transitionSequences';
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

export function LipTalkingRobotGame({ onBack, onComplete }: Props) {
  const session = useLipTransitionGameSession('lip-talking-robot', DEFAULT_TRANSITION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipTransitionSense(canPlay);
  const sequence = useMemo(() => robotSequence(), [session.round]);
  const [dance, setDance] = useState(false);

  useEffect(() => {
    speakTransition('Talking Robot! Copy the robot mouth shapes.');
    return () => clearTransitionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setDance(false);
    speakTransition('Follow O, E, O like the robot!');
  }, [session.round, canPlay]);

  const { progress, expected } = useTransitionSequence(lip, sequence, canPlay, () => {
    setDance(true);
    speakTransition('Robot dance! You did it!');
    void session.manager.markSuccess(0.88, 1100);
    setTimeout(() => session.completeRound(), 900);
  });

  const robot = dance ? '🤖💃✨' : expected ? `🤖${poseEmoji(expected)}` : '🤖';

  return (
    <>
      <LipTransitionGameShell
        title="Talking Robot"
        subtitle="Copy robot mouth transitions"
        skills="🤖 O → E → O • 🔄 Sequences"
        gradient={['#E0E7FF', '#C7D2FE']}
        accent="#4F46E5"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={styles.robot}>{robot}</Text>
          <Text style={styles.you}>You: {poseEmoji(lip.effectivePose)}</Text>
          <LipTransitionProgressRing progress={progress} accent="#4F46E5" />
        </View>
      </LipTransitionGameShell>
      <LipTransitionGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  robot: { fontSize: 80, marginBottom: 12 },
  you: { fontSize: 18, fontWeight: '700', color: '#4338CA', marginBottom: 8 },
});
