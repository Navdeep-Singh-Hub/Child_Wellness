import { lipOrchestraSequence } from '@/components/game/speech/lip-closure/session9/coordinationSequences';
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
} from '@/components/game/speech/lip-closure/shared/lipCoordinationShared';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function LipOrchestraGame({ onBack, onComplete }: Props) {
  const session = useCoordinationGameSession('lip-orchestra', DEFAULT_COORDINATION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const coord = useCoordinationSense(canPlay, session.manager.engine);
  const sequence = useMemo(() => lipOrchestraSequence(session.round), [session.round]);
  const [concert, setConcert] = useState(false);

  useEffect(() => {
    speakCoordination('Lip Orchestra! Perform the full mouth movement routine.');
    return () => clearCoordinationSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setConcert(false);
    session.manager.startRound(sequence);
    speakCoordination('Follow the whole lip concert pattern!');
  }, [session.round, canPlay, sequence]);

  const onSuccess = useCallback(async () => {
    setConcert(true);
    speakCoordination('Concert celebration! Standing ovation!');
    await session.manager.recordSuccess(coord.coordinationScore, 0.92);
    setTimeout(() => session.completeRound(), 1100);
  }, [session, coord.coordinationScore]);

  useCoordinationSuccessWatcher(coord, session.manager.engine, canPlay && !concert, onSuccess);

  const musicians = concert ? '🎻🎺🥁✨' : '🎻🎺🥁';

  return (
    <>
      <CoordinationGameShell
        title="Lip Orchestra"
        subtitle="Full coordinated lip routine"
        skills="🎼 Sequences • 👄 Motor planning"
        gradient={['#EDE9FE', '#DDD6FE']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        coord={coord}
        expectedPose={session.manager.engine.sequenceTracker.expected}
      >
        <View style={styles.center}>
          <Text style={styles.orchestra}>{musicians}</Text>
          <Text style={styles.conductor}>🎼 {poseEmoji(coord.effectivePose)}</Text>
          <Text style={styles.steps}>
            Move {session.manager.engine.sequenceTracker.stepsDone + 1} / {sequence.length}
          </Text>
        </View>
      </CoordinationGameShell>
      <CoordinationGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orchestra: { fontSize: 40, marginBottom: 12 },
  conductor: { fontSize: 64 },
  steps: { marginTop: 12, fontWeight: '800', color: '#5B21B6', fontSize: 16 },
});
