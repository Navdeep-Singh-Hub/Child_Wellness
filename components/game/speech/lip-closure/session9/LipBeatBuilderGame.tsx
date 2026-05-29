import {
  coordinationDifficulty,
} from '@/components/game/speech/lip-closure/modules/LipCoordinationSessionManager';
import { beatBuilderSequence } from '@/components/game/speech/lip-closure/session9/coordinationSequences';
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

export function LipBeatBuilderGame({ onBack, onComplete }: Props) {
  const session = useCoordinationGameSession('lip-beat-builder', DEFAULT_COORDINATION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const coord = useCoordinationSense(canPlay, session.manager.engine);
  const sequence = useMemo(() => beatBuilderSequence(session.round), [session.round]);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    speakCoordination('Beat Builder! Switch mouth shapes on each beat cue.');
    return () => clearCoordinationSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setCelebrate(false);
    session.manager.startRound(sequence, coordinationDifficulty(session.round));
    speakCoordination('Build the beat with your lips!');
  }, [session.round, canPlay, sequence]);

  const onSuccess = useCallback(async () => {
    setCelebrate(true);
    speakCoordination('Beat celebration!');
    await session.manager.recordSuccess(coord.coordinationScore, 0.82);
    setTimeout(() => session.completeRound(), 900);
  }, [session, coord.coordinationScore]);

  useCoordinationSuccessWatcher(coord, session.manager.engine, canPlay && !celebrate, onSuccess);

  return (
    <>
      <CoordinationGameShell
        title="Beat Builder"
        subtitle="Timed lip transitions"
        skills="🥁 Beat timing • 🔄 Switches"
        gradient={['#ECFDF5', '#D1FAE5']}
        accent="#059669"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        coord={coord}
        expectedPose={session.manager.engine.sequenceTracker.expected}
        showBeat
      >
        <View style={styles.center}>
          <Text style={[styles.drum, coord.beatPulse && styles.drumHit]}>🎶</Text>
          <Text style={styles.pose}>{poseEmoji(coord.effectivePose)}</Text>
          {celebrate ? <Text style={styles.party}>🎉🥁🎉</Text> : null}
        </View>
      </CoordinationGameShell>
      <CoordinationGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  drum: { fontSize: 52, marginBottom: 8, opacity: 0.6 },
  drumHit: { opacity: 1, transform: [{ scale: 1.1 }] },
  pose: { fontSize: 72 },
  party: { fontSize: 36, marginTop: 12 },
});
