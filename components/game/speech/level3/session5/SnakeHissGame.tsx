import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useAnimalSoundSession,
  DEFAULT_VOICE_ROUNDS,
  SOUND_HISS,
  tickSoundMatch,
  useSpeechHitCounter,
  createBurstDetector,
} from '@/components/game/speech/level3/shared/animalSoundGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const GROW_MS = 3000;

export function SnakeHissGame({ onBack, onComplete }: Props) {
  const session = useAnimalSoundSession('snake-hiss', DEFAULT_VOICE_ROUNDS);
  const [progress, setProgress] = useState(0);
  const speech = useSpeechHitCounter(true, SOUND_HISS.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 600 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const snakeLen = useRef(new Animated.Value(0.2)).current;
  const roundDoneRef = useRef(false);

  useEffect(() => {
    speakGame('Say ssss to grow the snake!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setProgress(0);
    roundDoneRef.current = false;
    snakeLen.setValue(0.2);
    burstRef.current.reset();
    holdRef.current = null;
    speech.resetHits();
    speakGame('Sssss!');
  }, [session.round, snakeLen]);

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current) return;
      const { progress: p, matched } = tickSoundMatch(
        SOUND_HISS,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
        GROW_MS,
      );
      setProgress(p);
      snakeLen.setValue(0.2 + p * 0.8);
      if (matched) {
        roundDoneRef.current = true;
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        speakGame('Long snake!');
        setTimeout(() => session.completeRound(), 900);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [session, speech.useSpeech, snakeLen]);

  const scaleX = snakeLen;

  return (
    <>
      <VoiceGameFrame
        title="Snake Hiss"
        subtitle='Say “ssss”'
        skills="🐍 Fricatives • 🗣️ Continuous sound • 😌 Calm play"
        gradient={['#ECFCCB', '#D9F99D']}
        accent="#65A30D"
        onBack={onBack}
        progress={session.round}
        progressTotal={session.rounds}
        roundLabel={`Snake ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Animated.Text style={[styles.snake, { transform: [{ scaleX }] }]}>
                🐍
              </Animated.Text>
              <Text style={styles.label}>Sssss</Text>
              <View style={styles.bar}>
                <View style={[styles.fill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.hint}>Soft long hiss</Text>
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
  snake: { fontSize: 72 },
  label: { fontSize: 36, fontWeight: '900', color: '#4D7C0F', marginTop: 12 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#84CC16', borderRadius: 8 },
  hint: { marginTop: 10, fontWeight: '800', color: '#3F6212' },
});
