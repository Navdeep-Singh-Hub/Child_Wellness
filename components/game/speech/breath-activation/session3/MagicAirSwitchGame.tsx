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

export function MagicAirSwitchGame({ onBack, onComplete }: Props) {
  const session = useBreathActivationGameSession('magic-air-switch', DEFAULT_ACTIVATION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    speakActivation('Magic Air Switch! Your breath powers the glowing magic.');
    return () => clearActivationSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    speakActivation('Start air — glow on. Stop — glow fades slowly.');
  }, [session.round, canPlay]);

  const onCycle = useCallback(
    (duration: number) => {
      const next = hits + 1;
      setHits(next);
      session.manager.recordCycle(duration);
      if (next >= ACTIVATION_CYCLES_PER_ROUND) {
        speakActivation('Magic sparkles! You switched the air!');
        setTimeout(() => session.completeRound(), 1000);
      } else {
        speakActivation('Glow faded. Power it again!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <BreathActivationGameFrame
        title="Magic Air Switch"
        subtitle="Breath powers the glow"
        skills="✨ Magic glow • 💨 Air on/off • 🌟 Sparkles"
        gradient={['#F5F3FF', '#EDE9FE']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
      >
        {(breath) => (
          <MagicSwitchPlay breath={breath} canPlay={canPlay} hits={hits} onCycle={onCycle} />
        )}
      </BreathActivationGameFrame>
      <ActivationGameOverlays
        {...session}
        onBack={onBack}
        onComplete={onComplete}
        message="Magic air master!"
      />
    </>
  );
}

function MagicSwitchPlay({
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
  const [glow, setGlow] = useState(0.15);
  const [sparkle, setSparkle] = useState(false);

  useBreathCycleCounter(breath, canPlay, (duration) => {
    setSparkle(true);
    setTimeout(() => setSparkle(false), 500);
    onCycle(duration);
  });

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      if (breath.breathActive) {
        setGlow((g) => Math.min(1, g + 0.06 + breath.intensity * 0.08));
      } else {
        setGlow((g) => Math.max(0.12, g - 0.025));
      }
    }, 80);
    return () => clearInterval(id);
  }, [canPlay, breath.breathActive, breath.intensity]);

  const orb =
    glow > 0.7 ? (sparkle ? '🔮✨' : '🔮') : glow > 0.35 ? '💜' : '🌑';

  return (
    <View style={styles.center}>
      <View
        style={[
          styles.glowRing,
          {
            opacity: 0.25 + glow * 0.75,
            transform: [{ scale: 0.85 + glow * 0.35 }],
          },
        ]}
      />
      <Text style={styles.orb}>{orb}</Text>
      <Text style={styles.hint}>
        {breath.breathActive ? 'Magic is glowing!' : 'Glow fading softly…'}
      </Text>
      <Text style={styles.sparkles}>{sparkle ? '✨⭐✨' : ' '}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#A78BFA',
  },
  orb: { fontSize: 88, zIndex: 1 },
  hint: { marginTop: 20, fontSize: 16, fontWeight: '700', color: '#5B21B6', textAlign: 'center' },
  sparkles: { fontSize: 24, marginTop: 8, minHeight: 32 },
});
