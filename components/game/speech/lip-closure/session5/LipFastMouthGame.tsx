import { fastSequence } from '@/components/game/speech/lip-closure/session5/transitionSequences';
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

export function LipFastMouthGame({ onBack, onComplete }: Props) {
  const session = useLipTransitionGameSession('lip-fast-mouth', DEFAULT_TRANSITION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipTransitionSense(canPlay);
  const sequence = useMemo(() => fastSequence(session.round), [session.round]);
  const [race, setRace] = useState(0);
  const [finish, setFinish] = useState(false);

  useEffect(() => {
    speakTransition('Fast Mouth! Switch shapes a little faster each round.');
    return () => clearTransitionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setRace(0);
    setFinish(false);
    speakTransition('Go! Switch O and E smoothly!');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setRace((r) => Math.min(100, r + (lip.lastTransition ? 8 : 2)));
    }, 200);
    return () => clearInterval(id);
  }, [canPlay, lip.lastTransition]);

  const { progress, expected } = useTransitionSequence(lip, sequence, canPlay, () => {
    setFinish(true);
    speakTransition('Race finish! Amazing fast switching!');
    void session.manager.markSuccess(0.9, 900);
    setTimeout(() => session.completeRound(), 900);
  });

  return (
    <>
      <LipTransitionGameShell
        title="Fast Mouth"
        subtitle="Practice faster alternation"
        skills="⚡ Speed • 🔄 O ↔ E"
        gradient={['#FFEDD5', '#FED7AA']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={styles.race}>{finish ? '🏁🎉' : '🏃💨'}</Text>
          <Text style={styles.next}>{expected ? poseEmoji(expected) : '✓'}</Text>
          <Text style={styles.you}>You: {poseEmoji(lip.effectivePose)}</Text>
          <View style={styles.track}>
            <View style={[styles.trackFill, { width: `${race}%` }]} />
          </View>
          <LipTransitionProgressRing progress={progress} accent="#EA580C" />
        </View>
      </LipTransitionGameShell>
      <LipTransitionGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  race: { fontSize: 56, marginBottom: 8 },
  next: { fontSize: 64, marginBottom: 6 },
  you: { fontSize: 18, fontWeight: '700', color: '#C2410C', marginBottom: 10 },
  track: {
    width: '85%',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  trackFill: { height: '100%', backgroundColor: '#FB923C', borderRadius: 6 },
});
