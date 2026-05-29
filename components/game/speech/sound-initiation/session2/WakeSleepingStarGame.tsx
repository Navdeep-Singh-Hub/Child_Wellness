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

function StarPlay({
  sound,
  active,
  onAttempt,
}: {
  sound: SoundInitiationSense;
  active: boolean;
  onAttempt: (intensity: number, duration: number) => void;
}) {
  const [awake, setAwake] = useState(false);
  const [glow, setGlow] = useState(0);

  useSoundPulseCounter(active, sound, (intensity, duration) => {
    setAwake(true);
    setGlow(Math.min(1, 0.35 + intensity + duration / 2500));
    onAttempt(intensity, duration);
    setTimeout(() => {
      setAwake(false);
      setGlow(0);
    }, 1200);
  });

  return (
    <View style={styles.stage}>
      <Text style={styles.zzz}>{awake ? '✨ ✨ ✨' : '💤 💤'}</Text>
      <Text style={styles.star}>{awake ? '🌟' : '⭐'}</Text>
      <View style={styles.glowBar}>
        <View style={[styles.glowFill, { width: `${glow * 100}%` }]} />
      </View>
      <Text style={styles.hint}>{awake ? 'Sparkles!' : 'Hum, ahh, or any sound…'}</Text>
    </View>
  );
}

export function WakeSleepingStarGame({ onBack, onComplete }: Props) {
  const session = useSoundInitiationSession('wake-sleeping-star', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakSoundInitiation('The star is sleeping. Make any sound to wake it up!');
  }, [canPlay, session.round]);

  const onAttempt = useCallback(
    (intensity: number, duration: number) => {
      session.manager.recordSound(intensity, duration);
      setHits((h) => {
        const next = h + 1;
        if (next >= SOUND_INTERACTIONS_PER_ROUND) {
          setTimeout(() => session.completeRound(), 800);
        }
        return next;
      });
    },
    [session],
  );

  return (
    <>
      <SoundInitiationFrame
        title="Wake the Sleeping Star"
        subtitle="Any sound wakes the star"
        skills="⭐ Sound initiation • 🔊 Vocal confidence"
        gradient={['#1E1B4B', '#312E81']}
        accent="#A78BFA"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
      >
        {(sound) => (
          <StarPlay sound={sound} active={canPlay && !session.gameFinished} onAttempt={onAttempt} />
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
  zzz: { fontSize: 28, marginBottom: 8, color: '#C4B5FD' },
  star: { fontSize: 110 },
  glowBar: {
    width: '80%',
    maxWidth: 280,
    height: 12,
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  glowFill: { height: '100%', backgroundColor: '#FDE047' },
  hint: { marginTop: 14, fontSize: 16, fontWeight: '800', color: '#E9D5FF', textAlign: 'center' },
});
