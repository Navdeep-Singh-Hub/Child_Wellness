import type { JawPose } from '@/components/game/speech/jaw-awareness/modules/jawAwarenessTypes';
import {
  DEFAULT_JAW_ROUNDS,
  JAW_INTERACTIONS_PER_ROUND,
  JawAwarenessGameFrame,
  JawGameOverlays,
  JawGoodTryButtons,
  JawMouthDisplay,
  clearJawSpeech,
  speakJaw,
  useJawAwarenessGameSession,
  useJawCopyRoundLoop,
} from '@/components/game/speech/jaw-awareness/shared/jawAwarenessShared';
import type { JawAwarenessSense } from '@/hooks/useJawAwareness';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const POSES: JawPose[] = ['open', 'yawn', 'sleepy'];

export function SleepyLionMouthGame({ onBack, onComplete }: Props) {
  const session = useJawAwarenessGameSession('sleepy-lion-mouth', DEFAULT_JAW_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakJaw('Sleepy Lion! Open when awake, close when sleepy.');
    return () => clearJawSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakJaw('Copy the lion mouth moves!');
  }, [session.round, canPlay]);

  const onHit = useCallback(
    (pose: JawPose) => {
      const next = hits + 1;
      setHits(next);
      session.manager.recordInteraction(pose);
      if (next >= JAW_INTERACTIONS_PER_ROUND) {
        speakJaw('The lion yawns and smiles! So cozy!');
        setTimeout(() => session.completeRound(), 1000);
      } else {
        speakJaw(pose === 'open' ? 'Wide awake!' : 'Sleepy lion!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <JawAwarenessGameFrame
        title="Sleepy Lion Mouth"
        subtitle="Open · yawn · sleepy close"
        skills="🦁 Awake open • 🥱 Yawn • 😴 Sleepy"
        gradient={['#FFFBEB', '#FEF3C7']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        startEmoji="🦁"
      >
        {(jaw) => (
          <LionPlay jaw={jaw} canPlay={canPlay} hits={hits} roundKey={session.round} onHit={onHit} />
        )}
      </JawAwarenessGameFrame>
      <JawGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function LionPlay({
  jaw,
  canPlay,
  hits,
  roundKey,
  onHit,
}: {
  jaw: JawAwarenessSense;
  canPlay: boolean;
  hits: number;
  roundKey: number;
  onHit: (pose: JawPose) => void;
}) {
  const [happy, setHappy] = useState(false);
  const { handleGoodTry } = useJawCopyRoundLoop({
    jaw,
    canPlay,
    poses: POSES,
    hits,
    onHit: (pose) => {
      setHappy(true);
      setTimeout(() => setHappy(false), 500);
      onHit(pose);
    },
    roundKey,
  });

  return (
    <View style={styles.center}>
      <Text style={styles.lion}>{happy ? '🦁😊' : '🦁'}</Text>
      <JawMouthDisplay pose={jaw.jawPrompt} sparkle={happy} helper={jaw.showHelper} large />
      <Text style={styles.hint}>
        {jaw.state === 'SHOWING_ANIMATION' ? 'Watch the lion…' : 'Copy with your jaw!'}
      </Text>
      <JawGoodTryButtons accent="#CA8A04" jaw={jaw} onGoodTry={handleGoodTry} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  lion: { fontSize: 64, textAlign: 'center' },
  hint: { fontSize: 16, fontWeight: '700', color: '#92400E', textAlign: 'center', marginBottom: 10 },
});
