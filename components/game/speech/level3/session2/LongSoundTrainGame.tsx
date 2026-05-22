import {
  VoiceGameFrame,
  VoiceGameOverlays,
  VOICE_ACTIVE_THRESHOLD,
  clearGameSpeech,
  speakGame,
  useVoiceGameSession,
  DEFAULT_VOICE_ROUNDS,
} from '@/components/game/speech/level3/shared/vowelGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const HOLD_MS = 2800;

export function LongSoundTrainGame({ onBack, onComplete }: Props) {
  const session = useVoiceGameSession('long-sound-train', DEFAULT_VOICE_ROUNDS);
  const [holdProgress, setHoldProgress] = useState(0);
  const [arrived, setArrived] = useState(false);
  const holdRef = useRef<number | null>(null);
  const roundDoneRef = useRef(false);
  const voiceRef = useRef({ level: 0, active: false });
  const trainX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    speakGame('Hold any vowel sound to move the train!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setHoldProgress(0);
    setArrived(false);
    roundDoneRef.current = false;
    holdRef.current = null;
    trainX.setValue(0);
    speakGame('Keep your voice going to the station!');
  }, [session.round, trainX]);

  useEffect(() => {
    const tick = setInterval(() => {
      const { level, active } = voiceRef.current;
      if (!active || session.gameFinished || roundDoneRef.current) {
        holdRef.current = null;
        setHoldProgress(0);
        return;
      }
      if (level >= VOICE_ACTIVE_THRESHOLD) {
        const now = Date.now();
        if (!holdRef.current) holdRef.current = now;
        const held = now - holdRef.current;
        const pct = Math.min(1, held / HOLD_MS);
        setHoldProgress(pct);
        trainX.setValue(pct);
        if (held >= HOLD_MS) {
          roundDoneRef.current = true;
          setArrived(true);
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {}
          speakGame('Train arrived! Great long sound!');
          setTimeout(() => session.completeRound(), 1000);
        }
      } else {
        holdRef.current = null;
        setHoldProgress(0);
        trainX.setValue(0);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [session, trainX]);

  const translateX = trainX.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '72%'],
  });

  return (
    <>
      <VoiceGameFrame
        title="Long Sound Train"
        subtitle="Hold a vowel to move the train"
        skills="🚂 Sustained vowel • 💨 Breath + voice • ⏱️ Phonation"
        gradient={['#ECFDF5', '#A7F3D0']}
        accent="#059669"
        onBack={onBack}
        progress={session.round}
        progressTotal={session.rounds}
        roundLabel={`Trip ${session.round} / ${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.scene}>
              <Text style={styles.station}>🏁 Station</Text>
              <View style={styles.track}>
                <Animated.Text style={[styles.train, { transform: [{ translateX }] }]}>
                  🚂
                </Animated.Text>
              </View>
              <View style={styles.bar}>
                <View style={[styles.fill, { width: `${holdProgress * 100}%` }]} />
              </View>
              <Text style={styles.hint}>{arrived ? 'Choo choo!' : 'Hold Aaa, Eee, Ooo, or Uuu…'}</Text>
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
  scene: { flex: 1, justifyContent: 'center', paddingBottom: 24 },
  station: { alignSelf: 'flex-end', fontSize: 18, fontWeight: '900', color: '#047857', marginRight: 8 },
  track: {
    height: 56,
    marginVertical: 24,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  train: { fontSize: 48 },
  bar: {
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#10B981', borderRadius: 8 },
  hint: { textAlign: 'center', marginTop: 14, fontWeight: '800', color: '#065F46', fontSize: 16 },
});
