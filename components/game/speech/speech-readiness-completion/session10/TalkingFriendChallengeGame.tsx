import {
  SpeechReadinessFrame,
  SpeechReadinessOverlays,
  speakSpeechReadiness,
  useSpeechReadinessSession,
} from '@/components/game/speech/speech-readiness-completion/shared/speechReadinessCompletionShared';
import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useReadinessInteraction,
} from '@/components/game/speech/speech-readiness-completion/session10/useReadinessInteraction';
import type { SpeechReadinessCompletionSessionManager } from '@/components/game/speech/speech-readiness-completion/modules/SpeechReadinessCompletionSessionManager';
import type { SpeechReadinessCompletionSense } from '@/hooks/useSpeechReadinessCompletion';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

function FriendPlay({
  sense,
  active,
  hits,
  setHits,
  manager,
  onRoundComplete,
  friendPhase,
}: {
  sense: SpeechReadinessCompletionSense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: SpeechReadinessCompletionSessionManager;
  onRoundComplete: () => void;
  friendPhase: boolean;
}) {
  const [dance, setDance] = useState(false);

  const { mouth, target } = useReadinessInteraction(
    sense,
    active && !friendPhase,
    hits,
    setHits,
    manager,
    onRoundComplete,
    'ooo',
  );

  useEffect(() => {
    if (hits > 0) {
      setDance(true);
      const t = setTimeout(() => setDance(false), 1200);
      return () => clearTimeout(t);
    }
  }, [hits]);

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active && !friendPhase} />
      <Level6MirrorPreview sense={mouth} active={active && !friendPhase} />
      <Level6StatusPill sense={mouth} target={target} accent="#0284C7" />
      <Text style={styles.friend}>🐼</Text>
      <Text style={styles.bubble}>
        {friendPhase ? 'Watch my mouth… OOO' : 'Your turn — copy or any sound!'}
      </Text>
      {dance && <Text style={styles.dance}>Friend celebration! 🎉</Text>}
    </View>
  );
}

export function TalkingFriendChallengeGame({ onBack, onComplete }: Props) {
  const session = useSpeechReadinessSession('talking-friend-challenge', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [friendPhase, setFriendPhase] = useState(true);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    setFriendPhase(true);
    speakSpeechReadiness('Hi friend! Watch my mouth, then you try — mouth or sound!');
    const t = setTimeout(() => setFriendPhase(false), 2400);
    return () => clearTimeout(t);
  }, [canPlay, session.round]);

  return (
    <>
      <SpeechReadinessFrame
        title="Talking Friend Challenge"
        subtitle="Imitation + sound"
        skills="🐼 Mouth model • 💬 Your try"
        gradient={['#ECFDF5', '#E0F2FE']}
        accent="#0284C7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        progressLabel="challenges"
      >
        {(sense) => (
          <FriendPlay
            sense={sense}
            active={canPlay && !session.gameFinished}
            hits={hits}
            setHits={setHits}
            manager={session.manager}
            onRoundComplete={session.completeRound}
            friendPhase={friendPhase}
          />
        )}
      </SpeechReadinessFrame>
      <SpeechReadinessOverlays
        showRoundSuccess={session.showRoundSuccess}
        gameFinished={session.gameFinished}
        finalStats={session.finalStats}
        onBack={onBack}
        onComplete={onComplete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  stage: { minHeight: 300, alignItems: 'center', padding: 12 },
  friend: { fontSize: 92 },
  bubble: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    fontSize: 17,
    fontWeight: '900',
    color: '#0369A1',
    textAlign: 'center',
  },
  dance: { marginTop: 14, fontSize: 20, fontWeight: '900', color: '#0284C7' },
});
