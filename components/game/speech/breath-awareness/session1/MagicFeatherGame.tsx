import {
  BREATH_INTERACTIONS_PER_ROUND,
  BreathGameFrame,
  BreathGameOverlays,
  DEFAULT_BREATH_ROUNDS,
  clearBreathSpeech,
  speakBreath,
  useBreathGameSession,
  useBreathInteractionCounter,
} from '@/components/game/speech/breath-awareness/shared/breathAwarenessShared';
import type { BreathAwarenessSense } from '@/hooks/useBreathAwareness';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function MagicFeatherGame({ onBack, onComplete }: Props) {
  const session = useBreathGameSession('magic-feather', DEFAULT_BREATH_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakBreath('Magic Feather! Your soft breath can move the feather.');
    return () => clearBreathSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakBreath('Blow softly — watch the feather move!');
  }, [session.round, canPlay]);

  const onInteraction = useCallback(
    (intensity: number) => {
      const next = hits + 1;
      setHits(next);
      session.manager.recordInteraction(intensity);
      speakBreath(next >= BREATH_INTERACTIONS_PER_ROUND ? 'Beautiful breath!' : 'The feather moved!');
      if (next >= BREATH_INTERACTIONS_PER_ROUND) {
        setTimeout(() => session.completeRound(), 900);
      } else if (session.manager.getAnalytics().breathAttempts > 2) {
        session.manager.engine.lowerDifficulty();
      }
    },
    [hits, session],
  );

  return (
    <>
      <BreathGameFrame
        title="Magic Feather"
        subtitle="Soft breath moves the feather"
        skills="💨 Air awareness • ✨ Cause & effect"
        gradient={['#F0F9FF', '#E0F2FE']}
        accent="#0284C7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
      >
        {(breath) => (
          <MagicFeatherPlay breath={breath} canPlay={canPlay} hits={hits} onInteraction={onInteraction} />
        )}
      </BreathGameFrame>
      <BreathGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function MagicFeatherPlay({
  breath,
  canPlay,
  hits,
  onInteraction,
}: {
  breath: BreathAwarenessSense;
  canPlay: boolean;
  hits: number;
  onInteraction: (intensity: number) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [sparkle, setSparkle] = useState(false);

  useBreathInteractionCounter(breath, canPlay, (intensity) => {
    setSparkle(true);
    setTimeout(() => setSparkle(false), 450);
    setOffset((o) => Math.min(130, o + 28 + intensity * 40));
    onInteraction(intensity);
  });

  return (
    <View style={styles.center}>
      <Text style={styles.floor}>— — —</Text>
      <Text style={[styles.feather, { marginLeft: offset }]}>{sparkle ? '🪶✨' : '🪶'}</Text>
      <Text style={styles.hint}>
        {breath.breathDetected ? 'Nice gentle air!' : 'Try a soft breath toward the tablet'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  floor: { fontSize: 28, color: '#94A3B8', marginBottom: 24, letterSpacing: 6 },
  feather: { fontSize: 88 },
  hint: { marginTop: 20, fontSize: 16, fontWeight: '700', color: '#0369A1', textAlign: 'center' },
});
