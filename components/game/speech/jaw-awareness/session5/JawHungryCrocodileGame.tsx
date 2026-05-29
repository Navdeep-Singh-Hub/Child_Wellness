import {
  DEFAULT_JAW_ROUNDS,
  JAW_INTERACTIONS_PER_ROUND,
  JawAwarenessGameFrame,
  JawGameOverlays,
  JawGoodTryButtons,
  JawMouthDisplay,
  JawTapTarget,
  clearJawSpeech,
  hapticJawSuccess,
  speakJaw,
  useJawAwarenessGameSession,
} from '@/components/game/speech/jaw-awareness/shared/jawAwarenessShared';
import type { JawAwarenessSense } from '@/hooks/useJawAwareness';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function JawHungryCrocodileGame({ onBack, onComplete }: Props) {
  const session = useJawAwarenessGameSession('jaw-hungry-crocodile', DEFAULT_JAW_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakJaw('Hungry Crocodile! Open your mouth, then tap the food!');
    return () => clearJawSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakJaw('Watch the crocodile open wide!');
  }, [session.round, canPlay]);

  const onFed = useCallback(() => {
    const next = hits + 1;
    setHits(next);
    session.manager.recordInteraction('feed');
    hapticJawSuccess();
    if (next >= JAW_INTERACTIONS_PER_ROUND) {
      speakJaw('Yum yum! Crocodile is happy!');
      setTimeout(() => session.completeRound(), 1000);
    } else {
      speakJaw('Open wide again!');
    }
  }, [hits, session]);

  return (
    <>
      <JawAwarenessGameFrame
        title="Hungry Crocodile"
        subtitle="Open mouth · tap food"
        skills="🐊 Big open • 🍎 Feed • 😊 No fail"
        gradient={['#ECFDF5', '#D1FAE5']}
        accent="#059669"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        startEmoji="🐊"
      >
        {(jaw) => (
          <CrocPlay jaw={jaw} canPlay={canPlay} hits={hits} roundKey={session.round} onFed={onFed} />
        )}
      </JawAwarenessGameFrame>
      <JawGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function CrocPlay({
  jaw,
  canPlay,
  hits,
  roundKey,
  onFed,
}: {
  jaw: JawAwarenessSense;
  canPlay: boolean;
  hits: number;
  roundKey: number;
  onFed: () => void;
}) {
  const [phase, setPhase] = useState<'open' | 'feed'>('open');
  const [ate, setAte] = useState(false);

  useEffect(() => {
    if (!canPlay) return;
    setPhase('open');
    setAte(false);
    jaw.engine.reset();
    jaw.startPrompt('open');
    speakJaw('Open your mouth like the crocodile!');
  }, [canPlay, roundKey]);

  const handleGoodTry = () => {
    if (jaw.state !== 'WAITING_FOR_INTERACTION' && jaw.state !== 'HELPING') return;
    jaw.confirmInteraction();
    hapticJawSuccess();
    setPhase('feed');
    speakJaw('Now tap the food into the mouth!');
  };

  const handleFeed = () => {
    jaw.registerTap();
    setAte(true);
    setTimeout(() => {
      setAte(false);
      onFed();
      if (hits + 1 < JAW_INTERACTIONS_PER_ROUND) {
        setPhase('open');
        jaw.startPrompt('open');
      }
    }, 500);
  };

  const croc = phase === 'open' ? '🐊😮' : ate ? '🐊😋' : '🐊';

  return (
    <View style={styles.center}>
      <Text style={styles.croc}>{croc}</Text>
      {phase === 'open' ? (
        <>
          <JawMouthDisplay pose="open" large helper={jaw.showHelper} />
          <JawGoodTryButtons accent="#059669" jaw={jaw} onGoodTry={handleGoodTry} />
        </>
      ) : (
        <JawTapTarget accent="#059669" emoji="🍎" label="Tap food!" onTap={handleFeed} glow={ate} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  croc: { fontSize: 72, textAlign: 'center', marginBottom: 8 },
});
