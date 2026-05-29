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

export function MouthElevatorGame({ onBack, onComplete }: Props) {
  const session = useJawAwarenessGameSession('mouth-elevator', DEFAULT_JAW_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakJaw('Mouth Elevator! Open lifts up, close stops.');
    return () => clearJawSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakJaw('Open your mouth — elevator goes up!');
  }, [session.round, canPlay]);

  const onHit = useCallback(
    (pose: JawPose) => {
      const next = hits + 1;
      setHits(next);
      session.manager.recordInteraction(pose);
      if (next >= JAW_INTERACTIONS_PER_ROUND) {
        speakJaw('Celebration at the top! Great jaw moves!');
        setTimeout(() => session.completeRound(), 1000);
      }
    },
    [hits, session],
  );

  return (
    <>
      <JawAwarenessGameFrame
        title="Mouth Elevator"
        subtitle="Open up · close stop"
        skills="🛗 Jaw open • ⏸ Close • 🎉 Celebrate"
        gradient={['#EEF2FF', '#E0E7FF']}
        accent="#4F46E5"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        startEmoji="🛗"
      >
        {(jaw) => (
          <ElevatorPlay jaw={jaw} canPlay={canPlay} hits={hits} roundKey={session.round} onHit={onHit} />
        )}
      </JawAwarenessGameFrame>
      <JawGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function ElevatorPlay({
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
  const [lift, setLift] = useState(0);
  const { handleGoodTry } = useJawCopyRoundLoop({
    jaw,
    canPlay,
    poses: POSES,
    hits,
    onHit: (pose) => {
      if (pose === 'open') setLift((l) => Math.min(120, l + 40));
      else setLift((l) => Math.max(0, l - 20));
      onHit(pose);
    },
    roundKey,
  });

  return (
    <View style={styles.center}>
      <View style={styles.shaft}>
        <Text style={[styles.car, { marginTop: 140 - lift }]}>🧒🛗</Text>
      </View>
      <JawMouthDisplay characterEmoji="🛗" pose={jaw.jawPrompt} helper={jaw.showHelper} />
      <Text style={styles.hint}>
        {jaw.jawPrompt === 'open' ? 'Mouth open — going up!' : 'Mouth closed — stopped'}
      </Text>
      <JawGoodTryButtons accent="#4F46E5" jaw={jaw} onGoodTry={handleGoodTry} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  shaft: {
    height: 160,
    width: 80,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  car: { fontSize: 40, textAlign: 'center' },
  hint: { fontSize: 15, fontWeight: '700', color: '#4338CA', marginBottom: 8, textAlign: 'center' },
});
