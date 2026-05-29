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

const POSES: JawPose[] = ['open', 'close', 'open'];

export function JawOpenCloseDanceGame({ onBack, onComplete }: Props) {
  const session = useJawAwarenessGameSession('jaw-open-close-dance', DEFAULT_JAW_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    speakJaw('Open Close Dance! Slow jaw dance — open, close, open!');
    return () => clearJawSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    setStars(0);
    speakJaw('Dance your jaw slowly!');
  }, [session.round, canPlay]);

  const onHit = useCallback(
    (pose: JawPose) => {
      const next = hits + 1;
      setHits(next);
      setStars((s) => s + 1);
      session.manager.recordInteraction(pose);
      if (next >= JAW_INTERACTIONS_PER_ROUND) {
        speakJaw('Dance stars for your jaw!');
        setTimeout(() => session.completeRound(), 1000);
      } else {
        speakJaw('Nice dance move!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <JawAwarenessGameFrame
        title="Open–Close Dance"
        subtitle="Slow open · close · open rhythm"
        skills="💃 Slow dance • 😮 Open • 😌 Close"
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
        {(jaw) => (
          <DancePlay jaw={jaw} canPlay={canPlay} hits={hits} stars={stars} roundKey={session.round} onHit={onHit} />
        )}
      </JawAwarenessGameFrame>
      <JawGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function DancePlay({
  jaw,
  canPlay,
  hits,
  stars,
  roundKey,
  onHit,
}: {
  jaw: JawAwarenessSense;
  canPlay: boolean;
  hits: number;
  stars: number;
  roundKey: number;
  onHit: (pose: JawPose) => void;
}) {
  const { handleGoodTry } = useJawCopyRoundLoop({ jaw, canPlay, poses: POSES, hits, onHit, roundKey });
  const beat = jaw.state === 'SHOWING_ANIMATION' ? '🎵' : '🎶';

  return (
    <View style={styles.center}>
      <Text style={styles.music}>{beat} 💃 {beat}</Text>
      <Text style={styles.stars}>{'⭐'.repeat(Math.min(stars, 3))}</Text>
      <JawMouthDisplay characterEmoji="🕺" pose={jaw.jawPrompt} helper={jaw.showHelper} />
      <Text style={styles.hint}>Slow open… slow close… copy the dance!</Text>
      <JawGoodTryButtons accent="#DB2777" jaw={jaw} onGoodTry={handleGoodTry} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  music: { fontSize: 22, textAlign: 'center' },
  stars: { fontSize: 24, textAlign: 'center', minHeight: 32 },
  hint: { fontSize: 16, fontWeight: '700', color: '#9D174D', textAlign: 'center', marginBottom: 10 },
});
