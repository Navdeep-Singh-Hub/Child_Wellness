import { mouthMemorySequence } from '@/components/game/speech/lip-closure/session9/coordinationSequences';
import {
  CoordinationGameOverlays,
  CoordinationGameShell,
  DEFAULT_COORDINATION_ROUNDS,
  clearCoordinationSpeech,
  poseEmoji,
  speakCoordination,
  useCoordinationGameSession,
  useCoordinationSense,
  useCoordinationSuccessWatcher,
  usePoseDemoPhase,
} from '@/components/game/speech/lip-closure/shared/lipCoordinationShared';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function LipMouthMemoryGame({ onBack, onComplete }: Props) {
  const session = useCoordinationGameSession('lip-mouth-memory', DEFAULT_COORDINATION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [phase, setPhase] = useState<'demo' | 'repeat'>('demo');
  const coord = useCoordinationSense(phase === 'repeat', session.manager.engine);
  const sequence = useMemo(() => mouthMemorySequence(session.round), [session.round]);
  const [stars, setStars] = useState(false);

  const { playing, demoPose } = usePoseDemoPhase(sequence, canPlay && phase === 'demo', () => {
    setPhase('repeat');
    session.manager.startRound(sequence);
    speakCoordination('Now repeat the sequence!');
  });

  useEffect(() => {
    speakCoordination('Mouth Memory! Watch the lip pattern, then repeat it.');
    return () => clearCoordinationSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setPhase('demo');
    setStars(false);
    speakCoordination('Remember the mouth shapes…');
  }, [session.round, canPlay, sequence]);

  const onSuccess = useCallback(async () => {
    setStars(true);
    speakCoordination('Memory stars! You remembered!');
    await session.manager.recordSuccess(coord.coordinationScore, 0.9);
    setTimeout(() => session.completeRound(), 900);
  }, [session, coord.coordinationScore]);

  useCoordinationSuccessWatcher(coord, session.manager.engine, phase === 'repeat' && !stars, onSuccess);

  return (
    <>
      <CoordinationGameShell
        title="Mouth Memory"
        subtitle="Watch → repeat lip sequence"
        skills="🧠 Memory • 👄 Sequences"
        gradient={['#FEF3C7', '#FDE68A']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        coord={coord}
        expectedPose={
          phase === 'repeat'
            ? session.manager.engine.sequenceTracker.expected
            : demoPose
        }
      >
        <View style={styles.center}>
          <Text style={styles.brain}>{stars ? '🧠⭐✨' : '🧠'}</Text>
          <Text style={styles.pose}>
            {playing && demoPose
              ? poseEmoji(demoPose)
              : phase === 'repeat'
                ? poseEmoji(coord.effectivePose)
                : '👀'}
          </Text>
          {phase === 'repeat' && (
            <Text style={styles.hint}>Repeat: step {session.manager.engine.sequenceTracker.stepsDone + 1}</Text>
          )}
        </View>
      </CoordinationGameShell>
      <CoordinationGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brain: { fontSize: 56, marginBottom: 12 },
  pose: { fontSize: 72 },
  hint: { marginTop: 12, fontWeight: '700', color: '#854D0E', fontSize: 15 },
});
