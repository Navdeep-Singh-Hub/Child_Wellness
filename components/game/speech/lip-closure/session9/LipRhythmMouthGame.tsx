import { coordinationDifficulty } from '@/components/game/speech/lip-closure/modules/LipCoordinationSessionManager';
import { rhythmMouthSequence } from '@/components/game/speech/lip-closure/session9/coordinationSequences';
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

export function LipRhythmMouthGame({ onBack, onComplete }: Props) {
  const session = useCoordinationGameSession('lip-rhythm-mouth', DEFAULT_COORDINATION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const coord = useCoordinationSense(canPlay, session.manager.engine);
  const sequence = useMemo(() => rhythmMouthSequence(session.round), [session.round]);
  const [stars, setStars] = useState(false);

  useEffect(() => {
    speakCoordination('Rhythm Mouth! Change your mouth shape when the ring pulses.');
    return () => clearCoordinationSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setStars(false);
    session.manager.startRound(sequence, coordinationDifficulty(session.round));
    speakCoordination('Move lips on the beat!');
  }, [session.round, canPlay, sequence]);

  const onSuccess = useCallback(async () => {
    setStars(true);
    speakCoordination('Musical stars! Great rhythm!');
    await session.manager.recordSuccess(coord.coordinationScore, coord.beatActive ? 0.85 : 0.7);
    setTimeout(() => session.completeRound(), 900);
  }, [session, coord.coordinationScore, coord.beatActive]);

  useCoordinationSuccessWatcher(coord, session.manager.engine, canPlay && !stars, onSuccess);

  const expected = session.manager.engine.sequenceTracker.expected;

  return (
    <>
      <CoordinationGameShell
        title="Rhythm Mouth"
        subtitle="Switch shapes on the beat"
        skills="🎵 Rhythm • 👄 Lip timing"
        gradient={['#FCE7F3', '#FBCFE8']}
        accent="#DB2777"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        coord={coord}
        expectedPose={expected}
        showBeat
      >
        <View style={styles.center}>
          <Text style={[styles.beat, coord.beatPulse && styles.beatOn]}>🥁</Text>
          <Text style={styles.cue}>{expected ? poseEmoji(expected) : '🎵'}</Text>
          <Text style={styles.you}>You: {poseEmoji(coord.effectivePose)}</Text>
          {stars ? <Text style={styles.stars}>⭐🎵⭐</Text> : null}
        </View>
      </CoordinationGameShell>
      <CoordinationGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  beat: { fontSize: 48, marginBottom: 8, opacity: 0.55 },
  beatOn: { opacity: 1, transform: [{ scale: 1.12 }] },
  cue: { fontSize: 72, marginBottom: 8 },
  you: { fontSize: 18, fontWeight: '700', color: '#BE185D' },
  stars: { fontSize: 36, marginTop: 8 },
});
