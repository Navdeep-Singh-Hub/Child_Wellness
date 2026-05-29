import type { MouthPose } from '@/components/game/speech/mouth-imitation/modules/imitationTypes';
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
import type { ImitationSense } from '@/hooks/useImitation';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const POSES: MouthPose[] = ['open', 'close', 'round'];

export function MirrorMouthMatchGame({ onBack, onComplete }: Props) {
  const session = useImitationGameSession('mirror-mouth-match', DEFAULT_IMITATION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [sparkle, setSparkle] = useState(false);

  useEffect(() => {
    speakImitation('Mirror Mouth Match! Watch the avatar in the mirror.');
    return () => clearImitationSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    setSparkle(false);
    speakImitation('Slow mirror — copy when you are ready.');
  }, [session.round, canPlay]);

  const onHit = useCallback(
    (pose: MouthPose) => {
      const next = hits + 1;
      setHits(next);
      setSparkle(true);
      setTimeout(() => setSparkle(false), 600);
      session.manager.recordAttempt(pose);
      if (next >= IMITATION_CYCLES_PER_ROUND) {
        speakImitation('Mirror sparkles! Beautiful copying!');
        setTimeout(() => session.completeRound(), 1000);
      } else {
        speakImitation('Nice match!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <ImitationGameFrame
        title="Mirror Mouth Match"
        subtitle="Watch the avatar — copy slowly"
        skills="🪞 Visual copy • 👄 Mouth shapes • ✨ Gentle pace"
        gradient={['#F5F3FF', '#EDE9FE']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        startEmoji="🪞"
        startTitle="Mirror mouth match"
        startHint="Watch the avatar mouth in the mirror. Copy slowly. Grown-ups can tap Good try anytime."
      >
        {(imitation) => (
          <MirrorPlay
            imitation={imitation}
            canPlay={canPlay}
            hits={hits}
            sparkle={sparkle}
            roundKey={session.round}
            onHit={onHit}
          />
        )}
      </ImitationGameFrame>
      <ImitationGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function MirrorPlay({
  imitation,
  canPlay,
  hits,
  sparkle,
  roundKey,
  onHit,
}: {
  imitation: ImitationSense;
  canPlay: boolean;
  hits: number;
  sparkle: boolean;
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

  return (
    <View style={styles.center}>
      <View style={styles.mirrorFrame}>
        <Text style={styles.mirrorLabel}>🪞 Mirror</Text>
        <MouthFaceDisplay
          characterEmoji="🧒"
          pose={imitation.imitationPrompt}
          sparkle={sparkle}
          helper={imitation.showHelper}
        />
      </View>
      <Text style={styles.hint}>
        {imitation.state === 'SHOWING_ANIMATION' ? 'Watch the mouth…' : 'Copy in your mirror!'}
      </Text>
      <ImitationActionButtons accent="#7C3AED" imitation={imitation} onGoodTry={handleGoodTry} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  mirrorFrame: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 3,
    borderColor: '#C4B5FD',
    marginBottom: 8,
  },
  mirrorLabel: { fontSize: 18, fontWeight: '800', color: '#6D28D9', textAlign: 'center', marginBottom: 4 },
  hint: { fontSize: 16, fontWeight: '700', color: '#5B21B6', textAlign: 'center', marginBottom: 12 },
});
