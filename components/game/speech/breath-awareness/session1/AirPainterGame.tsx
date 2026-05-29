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

const COLORS = ['#FCA5A5', '#FDE68A', '#86EFAC', '#93C5FD', '#C4B5FD'];

export function AirPainterGame({ onBack, onComplete }: Props) {
  const session = useBreathGameSession('air-painter', DEFAULT_BREATH_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakBreath('Air Painter! Your breath paints colors on the canvas.');
    return () => clearBreathSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakBreath('Blow to paint with air!');
  }, [session.round, canPlay]);

  const onInteraction = useCallback(
    (intensity: number) => {
      const next = hits + 1;
      setHits(next);
      session.manager.recordInteraction(intensity);
      if (next >= BREATH_INTERACTIONS_PER_ROUND) {
        speakBreath('Rainbow celebration! You painted with air!');
        setTimeout(() => session.completeRound(), 1100);
      } else {
        speakBreath('More color!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <BreathGameFrame
        title="Air Painter"
        subtitle="Breath reveals colors"
        skills="🎨 Creative air • 🌈 Gentle reward"
        gradient={['#FAF5FF', '#F3E8FF']}
        accent="#9333EA"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
      >
        {(breath) => (
          <AirPainterPlay breath={breath} canPlay={canPlay} hits={hits} onInteraction={onInteraction} />
        )}
      </BreathGameFrame>
      <BreathGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function AirPainterPlay({
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
  const [fill, setFill] = useState(0);

  useBreathInteractionCounter(breath, canPlay, (intensity) => {
    setFill((f) => Math.min(1, f + 0.22 + intensity * 0.12));
    onInteraction(intensity);
  });

  const painted = Math.round(fill * 100);
  const rainbow = hits >= BREATH_INTERACTIONS_PER_ROUND;

  return (
    <View style={styles.center}>
      <View style={[styles.canvas, { backgroundColor: `rgba(255,255,255,${1 - fill * 0.15})` }]}>
        <View style={[styles.swatch, { width: `${painted}%`, backgroundColor: COLORS[hits % COLORS.length] }]} />
      </View>
      <Text style={styles.emoji}>{rainbow ? '🌈✨' : '🎨'}</Text>
      <Text style={styles.hint}>{rainbow ? 'Beautiful air painting!' : 'Blow to add color'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  canvas: {
    width: '90%',
    height: 120,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#E9D5FF',
    overflow: 'hidden',
    marginBottom: 16,
  },
  swatch: { height: '100%', borderRadius: 12 },
  emoji: { fontSize: 56 },
  hint: { marginTop: 12, fontSize: 16, fontWeight: '700', color: '#7E22CE' },
});
