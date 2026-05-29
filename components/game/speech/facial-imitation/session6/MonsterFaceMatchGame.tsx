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

const POSES: FacePose[] = ['open', 'small', 'silly', 'funny'];

export function MonsterFaceMatchGame({ onBack, onComplete }: Props) {
  const session = useFacialGameSession('monster-face-match', DEFAULT_FACE_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakFace('Monster Face Match! Big silly monster faces to copy!');
    return () => clearFaceSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakFace('Copy the friendly monster face!');
  }, [session.round, canPlay]);

  const onHit = useCallback(
    (pose: FacePose) => {
      const next = hits + 1;
      setHits(next);
      session.manager.recordInteraction(pose);
      if (next >= FACE_INTERACTIONS_PER_ROUND) {
        speakFace('Monster dance time! Woo!');
        setTimeout(() => session.completeRound(), 1000);
      }
    },
    [hits, session],
  );

  return (
    <>
      <FacialImitationGameFrame
        title="Monster Face Match"
        subtitle="Big silly monster faces"
        skills="👾 Exaggerated • 😝 Silly • 💃 Dance"
        gradient={['#F5F3FF', '#EDE9FE']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        startEmoji="👾"
      >
        {(face) => (
          <MonsterPlay face={face} canPlay={canPlay} hits={hits} roundKey={session.round} onHit={onHit} />
        )}
      </FacialImitationGameFrame>
      <FaceGameOverlays {...session} onBack={onBack} onComplete={onComplete} message="Monster face star!" />
    </>
  );
}

function MonsterPlay({
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
  const [dance, setDance] = useState(false);
  const { handleGoodTry } = useFaceCopyRoundLoop({
    face,
    canPlay,
    poses: POSES,
    hits,
    onHit: (pose) => {
      setDance(true);
      setTimeout(() => setDance(false), 600);
      onHit(pose);
    },
    roundKey,
  });

  return (
    <View style={styles.center}>
      <Text style={styles.monster}>{dance ? '👾💃' : '👾'}</Text>
      <FaceDisplay pose={face.facePrompt} sparkle={dance} helper={face.showHelper} large />
      <Text style={styles.hint}>Copy the big monster face!</Text>
      <FaceGoodTryButtons accent="#7C3AED" face={face} onGoodTry={handleGoodTry} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  monster: { fontSize: 64, textAlign: 'center' },
  hint: { fontSize: 16, fontWeight: '700', color: '#5B21B6', textAlign: 'center', marginBottom: 10 },
});
