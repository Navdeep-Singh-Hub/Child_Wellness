import { copyAvatarSequence } from '@/components/game/speech/lip-closure/session9/coordinationSequences';
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

export function LipCopyAvatarGame({ onBack, onComplete }: Props) {
  const session = useCoordinationGameSession('lip-copy-avatar', DEFAULT_COORDINATION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [phase, setPhase] = useState<'demo' | 'copy'>('demo');
  const coord = useCoordinationSense(phase === 'copy', session.manager.engine);
  const sequence = useMemo(() => copyAvatarSequence(), []);
  const [dance, setDance] = useState(false);

  const { playing, demoPose } = usePoseDemoPhase(sequence, canPlay && phase === 'demo', () => {
    setPhase('copy');
    session.manager.startRound(sequence);
    speakCoordination('Your turn — copy the avatar!');
  });

  useEffect(() => {
    speakCoordination('Copy Avatar Lips! Watch the friendly face, then copy.');
    return () => clearCoordinationSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setPhase('demo');
    setDance(false);
    speakCoordination('Watch the avatar mouth shapes…');
  }, [session.round, canPlay]);

  const onSuccess = useCallback(async () => {
    setDance(true);
    speakCoordination('Avatar dance! You copied perfectly!');
    await session.manager.recordSuccess(coord.coordinationScore, 0.88);
    setTimeout(() => session.completeRound(), 900);
  }, [session, coord.coordinationScore]);

  useCoordinationSuccessWatcher(coord, session.manager.engine, phase === 'copy' && !dance, onSuccess);

  const avatar = dance
    ? '🧑‍🎤💃✨'
    : playing && demoPose
      ? `🧑‍🎤${poseEmoji(demoPose)}`
      : phase === 'copy'
        ? `🧑‍🎤${poseEmoji(session.manager.engine.sequenceTracker.expected ?? 'NEUTRAL')}`
        : '🧑‍🎤';

  return (
    <>
      <CoordinationGameShell
        title="Copy Avatar Lips"
        subtitle="Watch → imitate mouth shapes"
        skills="🧑‍🎤 Copy • 🔄 Coordination"
        gradient={['#E0E7FF', '#C7D2FE']}
        accent="#4F46E5"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        coord={coord}
        expectedPose={phase === 'copy' ? session.manager.engine.sequenceTracker.expected : demoPose}
      >
        <View style={styles.center}>
          <Text style={styles.avatar}>{avatar}</Text>
          {phase === 'copy' && (
            <Text style={styles.you}>You: {poseEmoji(coord.effectivePose)}</Text>
          )}
          {playing && <Text style={styles.watch}>Watch…</Text>}
        </View>
      </CoordinationGameShell>
      <CoordinationGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatar: { fontSize: 80, marginBottom: 12 },
  you: { fontSize: 18, fontWeight: '700', color: '#4338CA' },
  watch: { marginTop: 8, fontWeight: '700', color: '#6366F1', fontSize: 16 },
});
