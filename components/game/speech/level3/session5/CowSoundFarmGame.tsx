import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useAnimalSoundSession,
  DEFAULT_VOICE_ROUNDS,
  SOUND_MOO,
  tickSoundMatch,
  useSpeechHitCounter,
  createBurstDetector,
} from '@/components/game/speech/level3/shared/animalSoundGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const MOOS_NEEDED = 4;

export function CowSoundFarmGame({ onBack, onComplete }: Props) {
  const session = useAnimalSoundSession('cow-sound-farm', DEFAULT_VOICE_ROUNDS);
  const [moos, setMoos] = useState(0);
  const [progress, setProgress] = useState(0);
  const speech = useSpeechHitCounter(true, SOUND_MOO.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 500 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const lockRef = useRef(false);

  useEffect(() => {
    speakGame('Welcome to the cow farm! Say moo!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setMoos(0);
    setProgress(0);
    roundDoneRef.current = false;
    lockRef.current = false;
    burstRef.current.reset();
    holdRef.current = null;
    speech.resetHits();
    speakGame('Moooo!');
  }, [session.round]);

  const onMoo = () => {
    if (roundDoneRef.current || lockRef.current) return;
    lockRef.current = true;
    holdRef.current = null;
    setProgress(0);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setMoos((m) => {
      const next = m + 1;
      if (next >= MOOS_NEEDED) {
        roundDoneRef.current = true;
        speakGame('Happy cows!');
        setTimeout(() => session.completeRound(), 900);
      }
      return next;
    });
    setTimeout(() => {
      lockRef.current = false;
    }, 650);
  };

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current || lockRef.current) return;
      const { progress: p, matched } = tickSoundMatch(
        SOUND_MOO,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
        850,
      );
      setProgress(p);
      if (matched) onMoo();
    }, 50);
    return () => clearInterval(tick);
  }, [session, speech.useSpeech]);

  return (
    <>
      <VoiceGameFrame
        title="Cow Sound Farm"
        subtitle='Say “moo”'
        skills="🐄 Vocal imitation • 🗣️ Fun sounds • 😊 Low pressure"
        gradient={['#DCFCE7', '#BBF7D0']}
        accent="#16A34A"
        onBack={onBack}
        progress={moos}
        progressTotal={MOOS_NEEDED}
        roundLabel={`Moos ${moos}/${MOOS_NEEDED} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Text style={styles.cow}>🐄</Text>
              <Text style={styles.sound}>Moo!</Text>
              <View style={styles.bar}>
                <View style={[styles.fill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.hint}>Hold “Moooo”</Text>
            </View>
          );
        }}
      </VoiceGameFrame>
      <VoiceGameOverlays
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cow: { fontSize: 100 },
  sound: { fontSize: 40, fontWeight: '900', color: '#15803D', marginTop: 8 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 8 },
  hint: { marginTop: 10, fontWeight: '800', color: '#166534' },
});
