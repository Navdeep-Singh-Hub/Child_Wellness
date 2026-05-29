import {
  DEFAULT_IMITATION_ROUNDS,
  IMITATION_CYCLES_PER_ROUND,
  ImitationActionButtons,
  ImitationGameFrame,
  ImitationGameOverlays,
  MouthFaceDisplay,
  clearImitationSpeech,
  speakImitation,
  useImitationGameSession,
  useImitationRoundLoop,
} from '@/components/game/speech/mouth-imitation/shared/mouthImitationShared';
import type { MouthPose } from '@/components/game/speech/mouth-imitation/modules/imitationTypes';
import type { ImitationSense } from '@/hooks/useImitation';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const POSES: MouthPose[] = ['open', 'close', 'open'];

export function CopyHappyMouthGame({ onBack, onComplete }: Props) {
  const session = useImitationGameSession('copy-happy-mouth', DEFAULT_IMITATION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    speakImitation('Copy Happy Mouth! Watch open and close, then copy.');
    return () => clearImitationSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    setStars(0);
    speakImitation('Watch the happy face, then copy!');
  }, [session.round, canPlay]);

  const onHit = useCallback(
    (pose: MouthPose) => {
      const next = hits + 1;
      setHits(next);
      setStars((s) => s + 1);
      session.manager.recordAttempt(pose);
      if (next >= IMITATION_CYCLES_PER_ROUND) {
        speakImitation('Wonderful copying! Happy stars for you!');
        setTimeout(() => session.completeRound(), 1000);
      } else {
        speakImitation(pose === 'open' ? 'Great open mouth!' : 'Nice closed lips!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <ImitationGameFrame
        title="Copy Happy Mouth"
        subtitle="Open and close — copy the face"
        skills="😮 Mouth open • 😐 Mouth close • ⭐ No pressure"
        gradient={['#FFF7ED', '#FFEDD5']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        startEmoji="😊"
        startTitle="Copy happy open & close"
      >
        {(imitation) => (
          <CopyHappyPlay
            imitation={imitation}
            canPlay={canPlay}
            hits={hits}
            stars={stars}
            roundKey={session.round}
            onHit={onHit}
          />
        )}
      </ImitationGameFrame>
      <ImitationGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function CopyHappyPlay({
  imitation,
  canPlay,
  hits,
  stars,
  roundKey,
  onHit,
}: {
  imitation: ImitationSense;
  canPlay: boolean;
  hits: number;
  stars: number;
  roundKey: number;
  onHit: (pose: MouthPose) => void;
}) {
  const { handleGoodTry } = useImitationRoundLoop({
    imitation,
    canPlay,
    poses: POSES,
    hits,
    onHit,
    roundKey,
  });
  const [sparkle, setSparkle] = useState(false);

  useEffect(() => {
    if (imitation.state !== 'REWARDING') return;
    setSparkle(true);
    const t = setTimeout(() => setSparkle(false), 500);
    return () => clearTimeout(t);
  }, [imitation.interactionCount, imitation.state]);

  return (
    <View style={styles.center}>
      <Text style={styles.stars}>{'⭐'.repeat(Math.min(stars, 3))}</Text>
      <MouthFaceDisplay
        characterEmoji="😊"
        pose={imitation.imitationPrompt}
        sparkle={sparkle}
        helper={imitation.showHelper}
      />
      <Text style={styles.hint}>
        {imitation.state === 'SHOWING_ANIMATION' ? 'Watch…' : 'Copy with your mouth!'}
      </Text>
      <ImitationActionButtons accent="#EA580C" imitation={imitation} onGoodTry={handleGoodTry} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  stars: { fontSize: 28, textAlign: 'center', marginBottom: 4, minHeight: 36 },
  hint: { fontSize: 16, fontWeight: '700', color: '#9A3412', textAlign: 'center', marginBottom: 12 },
});
