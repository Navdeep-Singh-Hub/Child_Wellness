import type { FacePose } from '@/components/game/speech/facial-imitation/modules/facialImitationTypes';
import {
  DEFAULT_FACE_ROUNDS,
  FACE_INTERACTIONS_PER_ROUND,
  FaceDisplay,
  FaceGameOverlays,
  FaceGoodTryButtons,
  FacialImitationGameFrame,
  clearFaceSpeech,
  speakFace,
  useFaceCopyRoundLoop,
  useFacialGameSession,
} from '@/components/game/speech/facial-imitation/shared/facialImitationShared';
import type { FacialImitationSense } from '@/hooks/useFacialImitation';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const POSES: FacePose[] = ['smile-big', 'open', 'small', 'surprised'];

export function FunnyFaceMirrorGame({ onBack, onComplete }: Props) {
  const session = useFacialGameSession('funny-face-mirror', DEFAULT_FACE_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakFace('Funny Face Mirror! Watch silly faces and copy for fun!');
    return () => clearFaceSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakFace('Look in the mirror and copy!');
  }, [session.round, canPlay]);

  const onHit = useCallback(
    (pose: FacePose) => {
      const next = hits + 1;
      setHits(next);
      session.manager.recordInteraction(pose);
      if (next >= FACE_INTERACTIONS_PER_ROUND) {
        speakFace('Ha ha! The avatar laughs with you!');
        setTimeout(() => session.completeRound(), 1000);
      } else {
        speakFace('Silly face!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <FacialImitationGameFrame
        title="Funny Face Mirror"
        subtitle="Silly mirror faces — copy for fun"
        skills="🪞 Mirror • 😁 Big smile • 😲 Surprised"
        gradient={['#FFF7ED', '#FFEDD5']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
      >
        {(face) => (
          <MirrorPlay face={face} canPlay={canPlay} hits={hits} roundKey={session.round} onHit={onHit} />
        )}
      </FacialImitationGameFrame>
      <FaceGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function MirrorPlay({
  face,
  canPlay,
  hits,
  roundKey,
  onHit,
}: {
  face: FacialImitationSense;
  canPlay: boolean;
  hits: number;
  roundKey: number;
  onHit: (pose: FacePose) => void;
}) {
  const [laugh, setLaugh] = useState(false);
  const { handleGoodTry } = useFaceCopyRoundLoop({
    face,
    canPlay,
    poses: POSES,
    hits,
    onHit: (pose) => {
      setLaugh(true);
      setTimeout(() => setLaugh(false), 500);
      onHit(pose);
    },
    roundKey,
  });

  return (
    <View style={styles.center}>
      <Text style={styles.mirror}>🪞 {laugh ? '😂' : '🙂'}</Text>
      <FaceDisplay avatarEmoji="🧒" pose={face.facePrompt} sparkle={laugh} helper={face.showHelper} large />
      <Text style={styles.hint}>
        {face.state === 'SHOWING_ANIMATION' ? 'Watch the face…' : 'Copy the silly face!'}
      </Text>
      <FaceGoodTryButtons accent="#EA580C" face={face} onGoodTry={handleGoodTry} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  mirror: { fontSize: 28, fontWeight: '800', color: '#C2410C', textAlign: 'center', marginBottom: 4 },
  hint: { fontSize: 16, fontWeight: '700', color: '#9A3412', textAlign: 'center', marginBottom: 10 },
});
