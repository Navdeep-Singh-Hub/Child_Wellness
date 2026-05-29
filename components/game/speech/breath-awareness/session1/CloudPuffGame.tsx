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

export function CloudPuffGame({ onBack, onComplete }: Props) {
  const session = useBreathGameSession('cloud-puff', DEFAULT_BREATH_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakBreath('Cloud Puff! Your breath can push the little cloud.');
    return () => clearBreathSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakBreath('Blow and watch the cloud float!');
  }, [session.round, canPlay]);

  const onInteraction = useCallback(
    (intensity: number) => {
      const next = hits + 1;
      setHits(next);
      session.manager.recordInteraction(intensity);
      if (next >= BREATH_INTERACTIONS_PER_ROUND) {
        speakBreath('The sun came out! Lovely breath!');
        setTimeout(() => session.completeRound(), 1000);
      } else {
        speakBreath('The cloud is moving!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <BreathGameFrame
        title="Cloud Puff"
        subtitle="Breath moves the cloud"
        skills="☁️ Air movement • ☀️ Cause & effect"
        gradient={['#F8FAFC', '#E2E8F0']}
        accent="#64748B"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
      >
        {(breath) => (
          <CloudPuffPlay breath={breath} canPlay={canPlay} hits={hits} onInteraction={onInteraction} />
        )}
      </BreathGameFrame>
      <BreathGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function CloudPuffPlay({
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
  const [cloudX, setCloudX] = useState(0);
  const showSun = hits >= BREATH_INTERACTIONS_PER_ROUND;

  useBreathInteractionCounter(breath, canPlay, (intensity) => {
    setCloudX((x) => Math.min(140, x + 35 + intensity * 50));
    onInteraction(intensity);
  });

  return (
    <View style={styles.center}>
      <Text style={styles.sky}>{showSun ? '☀️' : '🌤️'}</Text>
      <Text style={[styles.cloud, { marginLeft: cloudX }]}>☁️</Text>
      <Text style={styles.hint}>Soft breath pushes the cloud</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sky: { fontSize: 56, marginBottom: 16 },
  cloud: { fontSize: 80 },
  hint: { marginTop: 20, fontSize: 16, fontWeight: '700', color: '#475569' },
});
