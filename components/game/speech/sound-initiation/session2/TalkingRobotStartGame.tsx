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

function RobotPlay({
  sound,
  active,
  onAttempt,
}: {
  sound: SoundInitiationSense;
  active: boolean;
  onAttempt: (intensity: number, duration: number) => void;
}) {
  const [talking, setTalking] = useState(false);
  const [dance, setDance] = useState(false);

  useSoundPulseCounter(active, sound, (intensity, duration) => {
    setTalking(true);
    setDance(true);
    onAttempt(intensity, duration);
    setTimeout(() => {
      setTalking(false);
      setDance(false);
    }, 1000);
  });

  return (
    <View style={styles.stage}>
      <Text style={[styles.robot, dance && styles.robotDance]}>🤖</Text>
      <Text style={styles.bubble}>{talking ? 'Beep boop! I heard you!' : '…waiting quietly…'}</Text>
    </View>
  );
}

export function TalkingRobotStartGame({ onBack, onComplete }: Props) {
  const session = useSoundInitiationSession('talking-robot-start', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakSoundInitiation('The robot is quiet. Make any sound and it will talk back!');
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
        title="Talking Robot Start"
        subtitle="Any sound wakes the robot"
        skills="🤖 Vocal play • 🔊 Turn-taking"
        gradient={['#E0E7FF', '#F1F5F9']}
        accent="#4F46E5"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
      >
        {(sound) => (
          <RobotPlay sound={sound} active={canPlay && !session.gameFinished} onAttempt={onAttempt} />
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
  robot: { fontSize: 100 },
  robotDance: { transform: [{ rotate: '8deg' }, { scale: 1.06 }] },
  bubble: { marginTop: 12, fontSize: 18, fontWeight: '900', color: '#312E81', textAlign: 'center' },
});
