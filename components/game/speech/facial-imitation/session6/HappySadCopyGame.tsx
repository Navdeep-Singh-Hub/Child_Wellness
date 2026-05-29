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

const POSES: FacePose[] = ['happy', 'surprised', 'sleepy'];

export function HappySadCopyGame({ onBack, onComplete }: Props) {
  const session = useFacialGameSession('happy-sad-copy', DEFAULT_FACE_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    speakFace('Happy Sad Copy! Simple faces — happy, surprised, sleepy.');
    return () => clearFaceSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    setStars(0);
    speakFace('Watch the face change slowly.');
  }, [session.round, canPlay]);

  const onHit = useCallback(
    (pose: FacePose) => {
      const next = hits + 1;
      setHits(next);
      setStars((s) => s + 1);
      session.manager.recordInteraction(pose);
      if (next >= FACE_INTERACTIONS_PER_ROUND) {
        speakFace('Stars and smiles for you!');
        setTimeout(() => session.completeRound(), 1000);
      }
    },
    [hits, session],
  );

  return (
    <>
      <FacialImitationGameFrame
        title="Happy–Sad Copy"
        subtitle="Happy · surprised · sleepy"
        skills="😄 Gentle feelings • ⭐ Stars • 💛 Calm"
        gradient={['#F0F9FF', '#E0F2FE']}
        accent="#0284C7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        startHint="Simple, calm faces only. Copy when ready — no pressure."
      >
        {(face) => (
          <HappyPlay face={face} canPlay={canPlay} hits={hits} stars={stars} roundKey={session.round} onHit={onHit} />
        )}
      </FacialImitationGameFrame>
      <FaceGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function HappyPlay({
  face,
  canPlay,
  hits,
  stars,
  roundKey,
  onHit,
}: {
  face: FacialImitationSense;
  canPlay: boolean;
  hits: number;
  stars: number;
  roundKey: number;
  onHit: (pose: FacePose) => void;
}) {
  const { handleGoodTry } = useFaceCopyRoundLoop({ face, canPlay, poses: POSES, hits, onHit, roundKey });

  return (
    <View style={styles.center}>
      <Text style={styles.stars}>{'⭐'.repeat(Math.min(stars, 3))}</Text>
      <FaceDisplay pose={face.facePrompt} helper={face.showHelper} large />
      <Text style={styles.hint}>Copy the gentle face</Text>
      <FaceGoodTryButtons accent="#0284C7" face={face} onGoodTry={handleGoodTry} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  stars: { fontSize: 28, textAlign: 'center', minHeight: 36 },
  hint: { fontSize: 16, fontWeight: '700', color: '#0369A1', textAlign: 'center', marginBottom: 10 },
});
