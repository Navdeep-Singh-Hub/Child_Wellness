import type { FacePose } from '@/components/game/speech/facial-imitation/modules/facialImitationTypes';
import {
  DEFAULT_FACE_ROUNDS,
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

const POSES: FacePose[] = ['smile-big', 'open', 'funny'];

export function MirrorDanceFacesGame({ onBack, onComplete }: Props) {
  const session = useFacialGameSession('mirror-dance-faces', DEFAULT_FACE_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    speakFace('Mirror Dance Faces! Slow face dance — smile, open, funny!');
    return () => clearFaceSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    setStars(0);
    speakFace('Dance your face slowly!');
  }, [session.round, canPlay]);

  const onHit = useCallback(
    (pose: FacePose) => {
      const next = hits + 1;
      setHits(next);
      setStars((s) => s + 1);
      session.manager.recordInteraction(pose);
      if (next >= 3) {
        speakFace('Dance stars for your face!');
        setTimeout(() => session.completeRound(), 1000);
      }
    },
    [hits, session],
  );

  return (
    <>
      <FacialImitationGameFrame
        title="Mirror Dance Faces"
        subtitle="Slow smile · open · funny dance"
        skills="💃 Slow rhythm • 🪞 Mirror • ⭐ Stars"
        gradient={['#FDF2F8', '#FCE7F3']}
        accent="#DB2777"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        startEmoji="💃"
      >
        {(face) => (
          <DancePlay face={face} canPlay={canPlay} hits={hits} stars={stars} roundKey={session.round} onHit={onHit} />
        )}
      </FacialImitationGameFrame>
      <FaceGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function DancePlay({
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
  const beat = face.state === 'SHOWING_ANIMATION' ? '🎵' : '🎶';

  return (
    <View style={styles.center}>
      <Text style={styles.music}>{beat} 🪞 {beat}</Text>
      <Text style={styles.stars}>{'⭐'.repeat(Math.min(stars, 3))}</Text>
      <FaceDisplay avatarEmoji="🕺" pose={face.facePrompt} helper={face.showHelper} large />
      <Text style={styles.hint}>Slow face dance — copy when ready!</Text>
      <FaceGoodTryButtons accent="#DB2777" face={face} onGoodTry={handleGoodTry} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  music: { fontSize: 22, textAlign: 'center' },
  stars: { fontSize: 24, textAlign: 'center', minHeight: 32 },
  hint: { fontSize: 16, fontWeight: '700', color: '#9D174D', textAlign: 'center', marginBottom: 10 },
});
