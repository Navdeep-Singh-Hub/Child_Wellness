import {
  ACTIVATION_CYCLES_PER_ROUND,
  ActivationGameOverlays,
  BreathActivationGameFrame,
  DEFAULT_ACTIVATION_ROUNDS,
  clearActivationSpeech,
  speakActivation,
  useBreathActivationGameSession,
  useBreathCycleCounter,
} from '@/components/game/speech/breath-activation/shared/breathActivationShared';
import type { BreathActivationSense } from '@/hooks/useBreathActivation';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function BalloonBreathGame({ onBack, onComplete }: Props) {
  const session = useBreathActivationGameSession('balloon-breath', DEFAULT_ACTIVATION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [floated, setFloated] = useState(false);

  useEffect(() => {
    speakActivation('Balloon Breath! Inflate with air, pause when you stop. No pop!');
    return () => clearActivationSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    setFloated(false);
    speakActivation('Start breath to fill the balloon. Stop to pause.');
  }, [session.round, canPlay]);

  const onCycle = useCallback(
    (duration: number) => {
      const next = hits + 1;
      setHits(next);
      session.manager.recordCycle(duration);
      if (next >= ACTIVATION_CYCLES_PER_ROUND) {
        setFloated(true);
        speakActivation('Balloon floats away happily! No pop, just joy!');
        setTimeout(() => session.completeRound(), 1100);
      } else {
        speakActivation('Balloon paused. Fill it again!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <BreathActivationGameFrame
        title="Balloon Breath"
        subtitle="Fill · pause · float away"
        skills="🎈 Inflate • ⏸ Pause • 🎈 No fail"
        gradient={['#FDF2F8', '#FCE7F3']}
        accent="#DB2777"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
      >
        {(breath) => (
          <BalloonPlay
            breath={breath}
            canPlay={canPlay}
            hits={hits}
            floated={floated}
            roundKey={session.round}
            onCycle={onCycle}
          />
        )}
      </BreathActivationGameFrame>
      <ActivationGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function BalloonPlay({
  breath,
  canPlay,
  hits,
  floated,
  roundKey,
  onCycle,
}: {
  breath: BreathActivationSense;
  canPlay: boolean;
  hits: number;
  floated: boolean;
  roundKey: number;
  onCycle: (duration: number) => void;
}) {
  const [size, setSize] = useState(48);

  useEffect(() => {
    setSize(48);
  }, [roundKey, canPlay]);

  useBreathCycleCounter(breath, canPlay, onCycle);

  useEffect(() => {
    if (!canPlay || floated) return;
    if (breath.breathActive) {
      setSize((s) => Math.min(120, s + 2 + breath.intensity * 3));
    }
  }, [breath.breathActive, breath.intensity, canPlay, floated]);


  if (floated) {
    return (
      <View style={styles.center}>
        <Text style={styles.float}>🎈↑✨</Text>
        <Text style={styles.hint}>Happy float away!</Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={[styles.balloon, { fontSize: size }]}>🎈</Text>
      <Text style={styles.hint}>
        {breath.breathActive ? 'Filling… stop to pause' : 'Start breath to inflate'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  balloon: { lineHeight: 130 },
  float: { fontSize: 72 },
  hint: { marginTop: 20, fontSize: 16, fontWeight: '700', color: '#9D174D', textAlign: 'center' },
});
