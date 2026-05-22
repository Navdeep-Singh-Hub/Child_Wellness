import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useAnimalSoundSession,
  DEFAULT_VOICE_ROUNDS,
  SOUND_VROOM,
  tickSoundMatch,
  useSpeechHitCounter,
  createBurstDetector,
} from '@/components/game/speech/level3/shared/animalSoundGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const RACE_MS = 2800;

export function CarEngineRaceGame({ onBack, onComplete }: Props) {
  const session = useAnimalSoundSession('car-engine-race', DEFAULT_VOICE_ROUNDS);
  const [progress, setProgress] = useState(0);
  const [finished, setFinished] = useState(false);
  const speech = useSpeechHitCounter(true, SOUND_VROOM.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 600 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const carX = useRef(new Animated.Value(0)).current;
  const roundDoneRef = useRef(false);

  useEffect(() => {
    speakGame('Say vroom to race the car!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setProgress(0);
    setFinished(false);
    roundDoneRef.current = false;
    carX.setValue(0);
    burstRef.current.reset();
    holdRef.current = null;
    speech.resetHits();
    speakGame('Vroooom!');
  }, [session.round, carX]);

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current) return;
      const { progress: p, matched } = tickSoundMatch(
        SOUND_VROOM,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
        RACE_MS,
      );
      setProgress(p);
      carX.setValue(p);
      if (matched && !roundDoneRef.current) {
        roundDoneRef.current = true;
        setFinished(true);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        speakGame('You won the race!');
        setTimeout(() => session.completeRound(), 1000);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [session, speech.useSpeech, carX]);

  const translateX = carX.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '70%'],
  });

  return (
    <>
      <VoiceGameFrame
        title="Car Engine Race"
        subtitle='Say “vroom” to move the car'
        skills="🚗 Sustained sound • 💨 Vroom • 🏁 Fun play"
        gradient={['#FEE2E2', '#FECACA']}
        accent="#DC2626"
        onBack={onBack}
        progress={session.round}
        progressTotal={session.rounds}
        roundLabel={`Race ${session.round}/${session.rounds} · Hold vroom!`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.scene}>
              <Text style={styles.flag}>🏁</Text>
              <View style={styles.track}>
                <Animated.Text style={[styles.car, { transform: [{ translateX }] }]}>
                  🚗💨
                </Animated.Text>
              </View>
              <View style={styles.bar}>
                <View style={[styles.fill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.hint}>{finished ? 'Winner!' : 'Vroooom!'}</Text>
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
  scene: { flex: 1, justifyContent: 'center' },
  flag: { alignSelf: 'flex-end', fontSize: 32, marginRight: 16 },
  track: {
    height: 64,
    marginVertical: 24,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  car: { fontSize: 44 },
  bar: {
    height: 12,
    marginHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#EF4444', borderRadius: 8 },
  hint: { textAlign: 'center', marginTop: 12, fontWeight: '900', color: '#B91C1C', fontSize: 18 },
});
