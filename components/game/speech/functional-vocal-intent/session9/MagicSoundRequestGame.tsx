import {
  FunctionalVocalIntentFrame,
  FunctionalVocalIntentOverlays,
  speakFunctionalVocalIntent,
  useFunctionalVocalIntentSession,
  VOCAL_INTENT_INTERACTIONS_PER_ROUND,
  useVocalIntentPulseCounter,
} from '@/components/game/speech/functional-vocal-intent/shared/functionalVocalIntentShared';
import type { FunctionalVocalIntentSense } from '@/hooks/useFunctionalVocalIntent';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

function RequestPlay({
  sense,
  active,
  onAttempt,
}: {
  sense: FunctionalVocalIntentSense;
  active: boolean;
  onAttempt: (intensity: number, duration: number) => void;
}) {
  const [gift, setGift] = useState(false);

  useVocalIntentPulseCounter(active, sense, (intensity, duration) => {
    setGift(true);
    onAttempt(intensity, duration);
    setTimeout(() => setGift(false), 1400);
  });

  return (
    <View style={styles.stage}>
      <Text style={styles.character}>🧙</Text>
      <Text style={styles.waiting}>{gift ? 'Thank you!' : 'Waiting for your sound…'}</Text>
      <Text style={styles.gift}>{gift ? '🎁 ✨' : '❓'}</Text>
      <Text style={styles.hint}>Any sound makes the gift appear!</Text>
    </View>
  );
}

export function MagicSoundRequestGame({ onBack, onComplete }: Props) {
  const session = useFunctionalVocalIntentSession('magic-sound-request', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakFunctionalVocalIntent('The friend is waiting. Make any sound — your sound is like asking!');
  }, [canPlay, session.round]);

  const onAttempt = useCallback(
    (intensity: number, duration: number) => {
      session.manager.recordInteraction(intensity, duration);
      setHits((h) => {
        const next = h + 1;
        if (next >= VOCAL_INTENT_INTERACTIONS_PER_ROUND) setTimeout(() => session.completeRound(), 800);
        return next;
      });
    },
    [session],
  );

  return (
    <>
      <FunctionalVocalIntentFrame
        title="Magic Sound Request"
        subtitle="Sound = action"
        skills="💬 Vocal intent • ✨ Communication play"
        gradient={['#F0FDFA', '#E0E7FF']}
        accent="#0D9488"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        progressLabel="requests"
      >
        {(sense) => (
          <RequestPlay sense={sense} active={canPlay && !session.gameFinished} onAttempt={onAttempt} />
        )}
      </FunctionalVocalIntentFrame>
      <FunctionalVocalIntentOverlays
        showRoundSuccess={session.showRoundSuccess}
        gameFinished={session.gameFinished}
        finalStats={session.finalStats}
        onBack={onBack}
        onComplete={onComplete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  stage: { minHeight: 320, alignItems: 'center', justifyContent: 'center' },
  character: { fontSize: 88 },
  waiting: { fontSize: 18, fontWeight: '800', color: '#0F766E', marginTop: 10 },
  gift: { fontSize: 64, marginVertical: 12 },
  hint: { fontSize: 15, fontWeight: '700', color: '#64748B' },
});
