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

export function WakeFeatherGame({ onBack, onComplete }: Props) {
  const session = useBreathActivationGameSession('wake-feather', DEFAULT_ACTIVATION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakActivation('Wake the Feather! Start your breath to wake it, stop to let it rest.');
    return () => clearActivationSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakActivation('Breathe to wake the feather, then stop.');
  }, [session.round, canPlay]);

  const onCycle = useCallback(
    (duration: number, _intensity: number) => {
      const next = hits + 1;
      setHits(next);
      session.manager.recordCycle(duration);
      if (next >= ACTIVATION_CYCLES_PER_ROUND) {
        speakActivation('Happy feather! You woke and rested three times!');
        setTimeout(() => session.completeRound(), 1000);
      } else {
        speakActivation('The feather rested softly. Try again!');
      }
      if (session.manager.getAnalytics().breathAttempts > 2) {
        session.manager.engine.lowerDifficulty();
      }
    },
    [hits, session],
  );

  return (
    <>
      <BreathActivationGameFrame
        title="Wake the Feather"
        subtitle="Start air to wake · stop to rest"
        skills="💤 Sleep & wake • ✨ Soft tries • 🪶 Gentle air"
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
          <WakeFeatherPlay breath={breath} canPlay={canPlay} hits={hits} onCycle={onCycle} />
        )}
      </BreathActivationGameFrame>
      <ActivationGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function WakeFeatherPlay({
  breath,
  canPlay,
  hits,
  onCycle,
}: {
  breath: BreathActivationSense;
  canPlay: boolean;
  hits: number;
  onCycle: (duration: number, intensity: number) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [sparkle, setSparkle] = useState(false);

  useBreathCycleCounter(breath, canPlay, (duration, intensity) => {
    setSparkle(true);
    setTimeout(() => setSparkle(false), 500);
    onCycle(duration, intensity);
  });

  useEffect(() => {
    if (!canPlay) return;
    if (breath.breathActive) {
      setOffset((o) => Math.min(80, o + 4));
    } else {
      setOffset((o) => Math.max(0, o - 2));
    }
  }, [breath.breathActive, breath.smoothedLevel, canPlay]);

  const awake = breath.breathActive;
  const feather = awake ? (sparkle ? '🪶✨' : '🪶') : '💤🪶';

  return (
    <View style={styles.center}>
      <Text style={styles.label}>{awake ? 'Feather is awake!' : 'Feather is resting…'}</Text>
      <Text style={[styles.feather, { marginLeft: offset }]}>{feather}</Text>
      <Text style={styles.hint}>
        {breath.breathActive ? 'Stop your air to let it rest' : 'Start soft air to wake it'}
      </Text>
      <Text style={styles.count}>{hits} / {ACTIVATION_CYCLES_PER_ROUND} wake & rest</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 18, fontWeight: '800', color: '#0369A1', marginBottom: 12 },
  feather: { fontSize: 88 },
  hint: { marginTop: 16, fontSize: 16, fontWeight: '700', color: '#0C4A6E', textAlign: 'center' },
  count: { marginTop: 8, fontSize: 14, color: '#64748B', fontWeight: '600' },
});
