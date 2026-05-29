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
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function StartStopCloudGame({ onBack, onComplete }: Props) {
  const session = useBreathActivationGameSession('start-stop-cloud', DEFAULT_ACTIVATION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakActivation('Start Stop Cloud! The cloud moves only while your air is on.');
    return () => clearActivationSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakActivation('Start your breath — cloud moves. Stop — cloud pauses.');
  }, [session.round, canPlay]);

  const onCycle = useCallback(
    (duration: number) => {
      const next = hits + 1;
      setHits(next);
      session.manager.recordCycle(duration);
      if (next >= ACTIVATION_CYCLES_PER_ROUND) {
        speakActivation('Sunshine! You started and stopped your air!');
        setTimeout(() => session.completeRound(), 1000);
      } else {
        speakActivation('Cloud paused. Nice stop!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <BreathActivationGameFrame
        title="Start–Stop Cloud"
        subtitle="Cloud moves while air is on"
        skills="☁️ Start air • ⏸ Pause • ☀️ Sunshine"
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
          <StartStopCloudPlay breath={breath} canPlay={canPlay} hits={hits} onCycle={onCycle} />
        )}
      </BreathActivationGameFrame>
      <ActivationGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

function StartStopCloudPlay({
  breath,
  canPlay,
  hits,
  onCycle,
}: {
  breath: BreathActivationSense;
  canPlay: boolean;
  hits: number;
  onCycle: (duration: number) => void;
}) {
  const [cloudX, setCloudX] = useState(0);
  const rafRef = useRef<number | null>(null);

  useBreathCycleCounter(breath, canPlay, (duration) => onCycle(duration));

  useEffect(() => {
    if (!canPlay) return;
    const tick = () => {
      if (breath.breathActive) {
        setCloudX((x) => Math.min(150, x + 1.2 + breath.intensity * 2));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [canPlay, breath.breathActive, breath.intensity]);

  const showSun = hits >= ACTIVATION_CYCLES_PER_ROUND;

  return (
    <View style={styles.center}>
      <Text style={styles.sky}>{showSun ? '☀️' : breath.breathActive ? '🌤️' : '🌥️'}</Text>
      <Text style={[styles.cloud, { marginLeft: cloudX }]}>
        {breath.breathActive ? '☁️💨' : '☁️'}
      </Text>
      <Text style={styles.hint}>
        {breath.breathActive ? 'Cloud is moving…' : 'Cloud is waiting for your air'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sky: { fontSize: 56, marginBottom: 16 },
  cloud: { fontSize: 80 },
  hint: { marginTop: 20, fontSize: 16, fontWeight: '700', color: '#475569', textAlign: 'center' },
});
