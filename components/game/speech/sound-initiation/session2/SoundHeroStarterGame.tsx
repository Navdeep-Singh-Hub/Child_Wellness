import {
  SOUND_INTERACTIONS_PER_ROUND,
  SoundInitiationFrame,
  SoundInitiationOverlays,
  speakSoundInitiation,
  useSoundInitiationSession,
  useSoundPulseCounter,
} from '@/components/game/speech/sound-initiation/shared/soundInitiationShared';
import type { SoundInitiationSense } from '@/hooks/useSoundInitiation';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const STEPS = ['Make a sound', 'Watch reaction', 'Try again'] as const;

function HeroPlay({
  sound,
  active,
  hits,
  onAttempt,
}: {
  sound: SoundInitiationSense;
  active: boolean;
  hits: number;
  onAttempt: (intensity: number, duration: number) => void;
}) {
  const [flash, setFlash] = useState(false);
  const step = STEPS[Math.min(hits, STEPS.length - 1)] ?? STEPS[0];

  useSoundPulseCounter(active, sound, (intensity, duration) => {
    setFlash(true);
    onAttempt(intensity, duration);
    setTimeout(() => setFlash(false), 700);
  });

  return (
    <View style={styles.stage}>
      <Text style={styles.hero}>🦸</Text>
      <Text style={styles.step}>{step}</Text>
      <Text style={styles.emoji}>{flash ? '🎉' : '🔊'}</Text>
      <Text style={styles.hint}>Any sound counts — hero celebration!</Text>
    </View>
  );
}

export function SoundHeroStarterGame({ onBack, onComplete }: Props) {
  const session = useSoundInitiationSession('sound-hero-starter', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakSoundInitiation('Sound hero starter! Make sounds and watch the celebration.');
  }, [canPlay, session.round]);

  const onAttempt = useCallback(
    (intensity: number, duration: number) => {
      session.manager.recordSound(intensity, duration);
      setHits((h) => {
        const next = h + 1;
        if (next >= SOUND_INTERACTIONS_PER_ROUND) setTimeout(() => session.completeRound(), 800);
        return next;
      });
    },
    [session],
  );

  return (
    <>
      <SoundInitiationFrame
        title="Sound Hero Starter"
        subtitle="Integrate sound initiation"
        skills="🦸 Vocal hero • 🔊 Confidence"
        gradient={['#FEF3C7', '#E0E7FF']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
      >
        {(sound) => (
          <HeroPlay
            sound={sound}
            active={canPlay && !session.gameFinished}
            hits={hits}
            onAttempt={onAttempt}
          />
        )}
      </SoundInitiationFrame>
      <SoundInitiationOverlays
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
  stage: { minHeight: 340, alignItems: 'center', justifyContent: 'center' },
  hero: { fontSize: 56 },
  step: { fontSize: 18, fontWeight: '900', color: '#9A3412', marginVertical: 8 },
  emoji: { fontSize: 72 },
  hint: { marginTop: 12, fontSize: 15, fontWeight: '800', color: '#C2410C', textAlign: 'center' },
});
