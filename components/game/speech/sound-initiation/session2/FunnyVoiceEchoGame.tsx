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
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const CHARACTER_SOUNDS = ['Boing!', 'Wheee!', 'Honk!', 'Yay!'] as const;

function EchoPlay({
  sound,
  active,
  onAttempt,
  charIdx,
}: {
  sound: SoundInitiationSense;
  active: boolean;
  onAttempt: (intensity: number, duration: number) => void;
  charIdx: number;
}) {
  const [waitingChild, setWaitingChild] = useState(false);
  const [giggle, setGiggle] = useState(false);

  useSoundPulseCounter(active && waitingChild, sound, (intensity, duration) => {
    setGiggle(true);
    setWaitingChild(false);
    onAttempt(intensity, duration);
    setTimeout(() => setGiggle(false), 900);
  });

  return (
    <View style={styles.stage}>
      <Text style={styles.char}>🦊</Text>
      <Pressable
        style={styles.charBtn}
        onPress={() => {
          setWaitingChild(true);
          speakSoundInitiation('Your turn! Make any sound back.');
        }}
      >
        <Text style={styles.charSay}>{CHARACTER_SOUNDS[charIdx % CHARACTER_SOUNDS.length]}</Text>
        <Text style={styles.charHint}>Tap — then you echo</Text>
      </Pressable>
      <Text style={styles.status}>
        {giggle ? '😄 Giggles and stars!' : waitingChild ? '🎤 Your sound…' : 'Tap the funny sound'}
      </Text>
    </View>
  );
}

export function FunnyVoiceEchoGame({ onBack, onComplete }: Props) {
  const session = useSoundInitiationSession('funny-voice-echo', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakSoundInitiation('Funny echo! Tap the character, then make any sound back.');
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
        title="Funny Voice Echo"
        subtitle="Playful sound turn-taking"
        skills="😄 Echo play • 🔄 Vocal turn-taking"
        gradient={['#FEF9C3', '#DCFCE7']}
        accent="#16A34A"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
      >
        {(sound) => (
          <EchoPlay
            sound={sound}
            active={canPlay && !session.gameFinished}
            onAttempt={onAttempt}
            charIdx={session.round + hits}
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
  stage: { minHeight: 340, alignItems: 'center', padding: 12 },
  char: { fontSize: 64, marginBottom: 8 },
  charBtn: {
    width: '88%',
    maxWidth: 320,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 2,
    borderColor: 'rgba(22,163,74,0.35)',
    alignItems: 'center',
  },
  charSay: { fontSize: 22, fontWeight: '900', color: '#14532D' },
  charHint: { marginTop: 6, fontSize: 14, fontWeight: '700', color: '#166534' },
  status: { marginTop: 14, fontSize: 16, fontWeight: '800', color: '#15803D' },
});
