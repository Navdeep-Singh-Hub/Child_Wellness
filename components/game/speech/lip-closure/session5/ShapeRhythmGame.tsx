import { alternationSequence } from '@/components/game/speech/lip-closure/session5/transitionSequences';
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

export function ShapeRhythmGame({ onBack, onComplete }: Props) {
  const session = useLipTransitionGameSession('shape-rhythm', DEFAULT_TRANSITION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipTransitionSense(canPlay);
  const sequence = useMemo(() => alternationSequence(session.round), [session.round]);
  const [beat, setBeat] = useState(false);
  const [stars, setStars] = useState(false);
  const beatMs = session.round <= 1 ? 1800 : session.round === 2 ? 1400 : 1100;

  useEffect(() => {
    speakTransition('Shape Rhythm! Switch shapes to the beat.');
    return () => clearTransitionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setStars(false);
    speakTransition('Listen for the beat and switch!');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => setBeat((b) => !b), beatMs);
    return () => clearInterval(id);
  }, [canPlay, beatMs]);

  const { progress, expected } = useTransitionSequence(lip, sequence, canPlay, () => {
    setStars(true);
    speakTransition('Music stars! Rhythm master!');
    void session.manager.markSuccess(0.82, beatMs);
    setTimeout(() => session.completeRound(), 900);
  });

  return (
    <>
      <LipTransitionGameShell
        title="Shape Rhythm"
        subtitle="Switch shapes to the beat"
        skills="🎵 Rhythm • 🔄 Transitions"
        gradient={['#FCE7F3', '#FBCFE8']}
        accent="#DB2777"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={[styles.beat, beat && styles.beatOn]}>🥁</Text>
          <Text style={styles.cue}>{expected ? poseEmoji(expected) : '🎵'}</Text>
          <Text style={styles.you}>You: {poseEmoji(lip.effectivePose)}</Text>
          {stars ? <Text style={styles.stars}>⭐🎵⭐</Text> : null}
          <LipTransitionProgressRing progress={progress} accent="#DB2777" />
        </View>
      </LipTransitionGameShell>
      <LipTransitionGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  beat: { fontSize: 48, marginBottom: 8, opacity: 0.5 },
  beatOn: { opacity: 1, transform: [{ scale: 1.15 }] },
  cue: { fontSize: 72, marginBottom: 8 },
  you: { fontSize: 18, fontWeight: '700', color: '#BE185D', marginBottom: 8 },
  stars: { fontSize: 36, marginBottom: 8 },
});
