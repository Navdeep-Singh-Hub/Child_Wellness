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

export function WindmillFreezeGame({ onBack, onComplete }: Props) {
  const session = useBreathActivationGameSession('windmill-freeze', DEFAULT_ACTIVATION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakActivation('Windmill Freeze! Spin with your air, slow down when you stop.');
    return () => clearActivationSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakActivation('Breathe to spin the windmill friend!');
  }, [session.round, canPlay]);

  const onCycle = useCallback(
    (duration: number) => {
      const next = hits + 1;
      setHits(next);
      session.manager.recordCycle(duration);
      if (next >= ACTIVATION_CYCLES_PER_ROUND) {
        speakActivation('The windmill smiles! Great start and stop!');
        setTimeout(() => session.completeRound(), 1000);
      } else {
        speakActivation('Windmill slowed. Gentle stop!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <BreathActivationGameFrame
        title="Windmill Freeze"
        subtitle="Spin on · slow off"
        skills="🌬️ Air on • 🛑 Gentle stop • 😊 Friendly"
        gradient={['#FFFBEB', '#FEF3C7']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
      >
        {(breath) => (
          <WindmillPlay breath={breath} canPlay={canPlay} hits={hits} onCycle={onCycle} />
        )}
      </BreathActivationGameFrame>
      <ActivationGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const SPIN = ['🌬️', '🌀', '🌬️', '🌀'];

function WindmillPlay({
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
  const [frame, setFrame] = useState(0);
  const [smile, setSmile] = useState(false);

  useBreathCycleCounter(breath, canPlay, (duration) => {
    setSmile(true);
    setTimeout(() => setSmile(false), 600);
    onCycle(duration);
  });

  useEffect(() => {
    if (!canPlay || !breath.breathActive) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % SPIN.length), 400);
    return () => clearInterval(id);
  }, [canPlay, breath.breathActive]);

  const windmill = breath.breathActive ? SPIN[frame] : '🌬️';
  const face = smile || hits >= ACTIVATION_CYCLES_PER_ROUND ? '😊' : '🙂';

  return (
    <View style={styles.center}>
      <Text style={styles.windmill}>{windmill}</Text>
      <Text style={styles.face}>{face}</Text>
      <Text style={styles.hint}>
        {breath.breathActive ? 'Spinning with your air!' : 'Stopped — windmill rests'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  windmill: { fontSize: 88 },
  face: { fontSize: 48, marginTop: 8 },
  hint: { marginTop: 16, fontSize: 16, fontWeight: '700', color: '#92400E', textAlign: 'center' },
});
