import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useAnimalSoundSession,
  DEFAULT_VOICE_ROUNDS,
  SOUND_CHOO,
  tickSoundMatch,
  useSpeechHitCounter,
  createBurstDetector,
} from '@/components/game/speech/level3/shared/animalSoundGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const CHOOS_NEEDED = 4;

export function TrainChooChooGame({ onBack, onComplete }: Props) {
  const session = useAnimalSoundSession('train-choo-choo', DEFAULT_VOICE_ROUNDS);
  const [choos, setChoos] = useState(0);
  const speech = useSpeechHitCounter(true, SOUND_CHOO.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 450 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const trainX = useRef(new Animated.Value(0)).current;
  const roundDoneRef = useRef(false);
  const lockRef = useRef(false);

  useEffect(() => {
    speakGame('Say choo choo for the train!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setChoos(0);
    roundDoneRef.current = false;
    lockRef.current = false;
    trainX.setValue(0);
    burstRef.current.reset();
    speech.resetHits();
    speakGame('Choo choo!');
  }, [session.round, trainX]);

  const onChoo = () => {
    if (roundDoneRef.current || lockRef.current) return;
    lockRef.current = true;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    speakGame('Choo!');
    setChoos((c) => {
      const next = c + 1;
      Animated.timing(trainX, {
        toValue: next / CHOOS_NEEDED,
        duration: 300,
        useNativeDriver: true,
      }).start();
      if (next >= CHOOS_NEEDED) {
        roundDoneRef.current = true;
        setTimeout(() => {
          speakGame('Train is moving!');
          setTimeout(() => session.completeRound(), 900);
        }, 300);
      }
      return next;
    });
    setTimeout(() => {
      lockRef.current = false;
    }, 500);
  };

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current || lockRef.current) return;
      const { matched } = tickSoundMatch(
        SOUND_CHOO,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
        500,
      );
      if (matched) onChoo();
    }, 50);
    return () => clearInterval(tick);
  }, [session, speech.useSpeech, trainX]);

  const translateX = trainX.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '65%'],
  });

  return (
    <>
      <VoiceGameFrame
        title="Train Choo-Choo"
        subtitle='Say “choo choo”'
        skills="🚂 Sequencing • 🔁 Repetition • 🗣️ Fun imitation"
        gradient={['#DBEAFE', '#BFDBFE']}
        accent="#2563EB"
        onBack={onBack}
        progress={choos}
        progressTotal={CHOOS_NEEDED}
        roundLabel={`Choo ${choos}/${CHOOS_NEEDED} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.scene}>
              <View style={styles.track}>
                <Animated.Text style={[styles.train, { transform: [{ translateX }] }]}>
                  🚂
                </Animated.Text>
              </View>
              <Text style={styles.word}>Choo · Choo</Text>
              <Text style={styles.hint}>Each “choo” moves the train!</Text>
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
  track: {
    height: 56,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 10,
    justifyContent: 'center',
    marginBottom: 24,
  },
  train: { fontSize: 52 },
  word: { fontSize: 32, fontWeight: '900', color: '#1D4ED8', textAlign: 'center' },
  hint: { textAlign: 'center', marginTop: 8, fontWeight: '700', color: '#1E40AF' },
});
