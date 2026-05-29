import type { LipPose } from '@/components/game/speech/lip-awareness/modules/lipAwarenessTypes';
import {
  DEFAULT_LIP_ROUNDS,
  LIP_INTERACTIONS_PER_ROUND,
  LipAwarenessGameFrame,
  LipFaceDisplay,
  LipGameOverlays,
  LipGoodTryButtons,
  clearLipSpeech,
  speakLip,
  useLipAwarenessGameSession,
  useLipCopyRoundLoop,
} from '@/components/game/speech/lip-awareness/shared/lipAwarenessShared';
import type { LipAwarenessSense } from '@/hooks/useLipAwareness';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const POSES: LipPose[] = ['smile-big', 'closed', 'smile-small', 'funny'];

export function HappyLipsMirrorGame({ onBack, onComplete }: Props) {
  const session = useLipAwarenessGameSession('happy-lips-mirror', DEFAULT_LIP_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakLip('Happy Lips Mirror! Watch the lip shapes and copy playfully.');
    return () => clearLipSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakLip('Look at the happy lips in the mirror!');
  }, [session.round, canPlay]);

  const onHit = useCallback(
    (pose: LipPose) => {
      const next = hits + 1;
      setHits(next);
      session.manager.recordInteraction(pose);
      if (next >= LIP_INTERACTIONS_PER_ROUND) {
        speakLip('Sparkly happy lips! Wonderful!');
        setTimeout(() => session.completeRound(), 1000);
      } else {
        speakLip('Nice lip play!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <LipAwarenessGameFrame
        title="Happy Lips Mirror"
        subtitle="Watch lip shapes — copy for fun"
        skills="😁 Big smile • 😐 Closed • ✨ No pressure"
        gradient={['#FFF1F2', '#FFE4E6']}
        accent="#E11D48"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        startEmoji="🪞"
      >
        {(lip) => (
          <HappyMirrorPlay lip={lip} canPlay={canPlay} hits={hits} roundKey={session.round} onHit={onHit} />
        )}
      </LipAwarenessGameFrame>
      <LipGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function HappyMirrorPlay({
  lip,
  canPlay,
  hits,
  roundKey,
  onHit,
}: {
  lip: LipAwarenessSense;
  canPlay: boolean;
  hits: number;
  roundKey: number;
  onHit: (pose: LipPose) => void;
}) {
  const [sparkle, setSparkle] = useState(false);
  const { handleGoodTry } = useLipCopyRoundLoop({
    lip,
    canPlay,
    poses: POSES,
    hits,
    onHit: (pose) => {
      setSparkle(true);
      setTimeout(() => setSparkle(false), 500);
      onHit(pose);
    },
    roundKey,
  });

  return (
    <View style={styles.center}>
      <Text style={styles.mirror}>🪞 Mirror</Text>
      <LipFaceDisplay
        characterEmoji="😊"
        pose={lip.lipPrompt}
        sparkle={sparkle}
        helper={lip.showHelper}
      />
      <Text style={styles.hint}>
        {lip.state === 'SHOWING_ANIMATION' ? 'Watch the lips…' : 'Copy with your lips!'}
      </Text>
      <LipGoodTryButtons accent="#E11D48" lip={lip} onGoodTry={handleGoodTry} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  mirror: { fontSize: 20, fontWeight: '800', color: '#BE123C', textAlign: 'center', marginBottom: 4 },
  hint: { fontSize: 16, fontWeight: '700', color: '#9F1239', textAlign: 'center', marginBottom: 10 },
});
