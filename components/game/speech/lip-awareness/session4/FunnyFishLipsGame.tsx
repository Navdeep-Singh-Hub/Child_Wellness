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

const POSES: LipPose[] = ['round', 'funny', 'smile-big'];

export function FunnyFishLipsGame({ onBack, onComplete }: Props) {
  const session = useLipAwarenessGameSession('funny-fish-lips', DEFAULT_LIP_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakLip('Funny Fish Lips! The fish shows silly lip shapes.');
    return () => clearLipSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakLip('Copy the fish lips when you are ready!');
  }, [session.round, canPlay]);

  const onHit = useCallback(
    (pose: LipPose) => {
      const next = hits + 1;
      setHits(next);
      session.manager.recordInteraction(pose);
      if (next >= LIP_INTERACTIONS_PER_ROUND) {
        speakLip('The fish swims happily! Splash!');
        setTimeout(() => session.completeRound(), 1000);
      } else {
        speakLip('Silly fish lips!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <LipAwarenessGameFrame
        title="Funny Fish Lips"
        subtitle="Fish lip shapes — copy for fun"
        skills="🐡 Round lips • 😝 Silly • 🌊 Happy swim"
        gradient={['#E0F2FE', '#BAE6FD']}
        accent="#0284C7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        startEmoji="🐡"
      >
        {(lip) => (
          <FishPlay lip={lip} canPlay={canPlay} hits={hits} roundKey={session.round} onHit={onHit} />
        )}
      </LipAwarenessGameFrame>
      <LipGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function FishPlay({
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
  const [swim, setSwim] = useState(false);
  const { handleGoodTry } = useLipCopyRoundLoop({
    lip,
    canPlay,
    poses: POSES,
    hits,
    onHit: (pose) => {
      setSwim(true);
      setTimeout(() => setSwim(false), 600);
      onHit(pose);
    },
    roundKey,
  });

  return (
    <View style={styles.center}>
      <Text style={styles.fish}>{swim ? '🐡💨' : '🐡'}</Text>
      <LipFaceDisplay pose={lip.lipPrompt} sparkle={swim} helper={lip.showHelper} lipOnly />
      <Text style={styles.hint}>
        {lip.state === 'SHOWING_ANIMATION' ? 'Fish shows lips…' : 'Copy the fish lips!'}
      </Text>
      <LipGoodTryButtons accent="#0284C7" lip={lip} onGoodTry={handleGoodTry} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  fish: { fontSize: 64, textAlign: 'center', marginBottom: 4 },
  hint: { fontSize: 16, fontWeight: '700', color: '#0369A1', textAlign: 'center', marginBottom: 10 },
});
