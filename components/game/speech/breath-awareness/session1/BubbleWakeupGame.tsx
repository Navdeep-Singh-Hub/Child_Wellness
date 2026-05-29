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

const BUBBLES = ['😴', '😴', '😴'];

export function BubbleWakeupGame({ onBack, onComplete }: Props) {
  const session = useBreathGameSession('bubble-wakeup', DEFAULT_BREATH_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakBreath('Bubble Wake Up! Your breath wakes the sleepy bubbles.');
    return () => clearBreathSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakBreath('Blow gently to wake each bubble!');
  }, [session.round, canPlay]);

  const onInteraction = useCallback(
    (intensity: number) => {
      const next = hits + 1;
      setHits(next);
      session.manager.recordInteraction(intensity);
      if (next >= BREATH_INTERACTIONS_PER_ROUND) {
        speakBreath('All the bubbles are awake! Happy faces!');
        setTimeout(() => session.completeRound(), 1000);
      } else {
        speakBreath('A bubble woke up!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <BreathGameFrame
        title="Bubble Wake-Up"
        subtitle="Breath wakes the bubbles"
        skills="🫧 Gentle air • 😊 Playful feedback"
        gradient={['#ECFEFF', '#CFFAFE']}
        accent="#0891B2"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
      >
        {(breath) => (
          <BubbleWakeupPlay breath={breath} canPlay={canPlay} hits={hits} onInteraction={onInteraction} />
        )}
      </BreathGameFrame>
      <BreathGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function BubbleWakeupPlay({
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
  useBreathInteractionCounter(breath, canPlay, onInteraction);

  return (
    <View style={styles.row}>
      {BUBBLES.map((b, i) => (
        <Text key={i} style={styles.bubble}>
          {i < hits ? '🫧😊' : b}
        </Text>
      ))}
      <Text style={styles.hint}>
        {breath.breathDetected ? 'Wake another bubble!' : 'Soft breath toward the screen'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bubble: { fontSize: 64, marginHorizontal: 8, marginBottom: 16 },
  hint: { fontSize: 16, fontWeight: '700', color: '#0E7490', textAlign: 'center' },
});
