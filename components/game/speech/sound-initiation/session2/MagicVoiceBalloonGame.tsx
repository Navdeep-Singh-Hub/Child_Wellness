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

function BalloonPlay({
  sound,
  active,
  onAttempt,
}: {
  sound: SoundInitiationSense;
  active: boolean;
  onAttempt: (intensity: number, duration: number) => void;
}) {
  const [size, setSize] = useState(0.35);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      if (sound.soundDetected) {
        setSize((s) => Math.min(1, s + 0.04 + sound.intensity * 0.06));
      } else {
        setSize((s) => Math.max(0.35, s - 0.02));
      }
    }, 80);
    return () => clearInterval(id);
  }, [active, sound.soundDetected, sound.intensity]);

  useSoundPulseCounter(active, sound, (intensity, duration) => {
    onAttempt(intensity, duration);
    if (size > 0.85) {
      setPop(true);
      setTimeout(() => {
        setPop(false);
        setSize(0.35);
      }, 900);
    }
  });

  const scale = 0.6 + size * 0.9;

  return (
    <View style={styles.stage}>
      <Text style={[styles.balloon, { fontSize: 72 * scale }]}>{pop ? '🎉' : '🎈'}</Text>
      <Text style={styles.hint}>{pop ? 'Balloon party!' : 'Make sounds to grow the balloon'}</Text>
    </View>
  );
}

export function MagicVoiceBalloonGame({ onBack, onComplete }: Props) {
  const session = useSoundInitiationSession('magic-voice-balloon', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakSoundInitiation('Your voice inflates the balloon. Longer sounds make it bigger!');
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
        title="Magic Voice Balloon"
        subtitle="Sounds inflate the balloon"
        skills="🎈 Sound confidence • ⏱️ Duration play"
        gradient={['#FCE7F3', '#E0F2FE']}
        accent="#EC4899"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
      >
        {(sound) => (
          <BalloonPlay sound={sound} active={canPlay && !session.gameFinished} onAttempt={onAttempt} />
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
  balloon: { lineHeight: 100 },
  hint: { marginTop: 16, fontSize: 16, fontWeight: '800', color: '#831843', textAlign: 'center' },
});
