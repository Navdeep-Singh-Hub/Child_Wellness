import {
  VowelGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useVoiceGameSession,
  DEFAULT_VOICE_ROUNDS,
  vowelMatch,
  type VowelSense,
} from '@/components/game/speech/level3/shared/vowelGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const HOLD_MS = 1200;

export function HappyEeeSmileGame({ onBack, onComplete }: Props) {
  const session = useVoiceGameSession('happy-eee-smile', DEFAULT_VOICE_ROUNDS);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const holdRef = useRef<number | null>(null);
  const roundDoneRef = useRef(false);
  const senseRef = useRef<VowelSense | null>(null);

  useEffect(() => {
    speakGame('Smile and say Eee!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setProgress(0);
    setDone(false);
    roundDoneRef.current = false;
    holdRef.current = null;
    speakGame('Show a happy smile and say Eee!');
  }, [session.round]);

  useEffect(() => {
    const tick = setInterval(() => {
      const sense = senseRef.current;
      if (!sense || session.gameFinished || roundDoneRef.current) return;
      const { progress: p, matched } = vowelMatch(sense, 'E', HOLD_MS, holdRef);
      setProgress(p);
      if (matched) {
        roundDoneRef.current = true;
        setDone(true);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        speakGame('Beautiful Eee smile!');
        setTimeout(() => session.completeRound(), 1000);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [session]);

  return (
    <>
      <VowelGameFrame
        title='Happy "Eee" Smile'
        subtitle="Smile wide + say Eee"
        skills="😊 Lip spreading • 🅴 Vowel E • 🗣️ Stable vowel"
        gradient={['#FCE7F3', '#FBCFE8']}
        accent="#DB2777"
        onBack={onBack}
        progress={session.round}
        progressTotal={session.rounds}
        roundLabel={`Eee ${session.round} / ${session.rounds}`}
      >
        {(sense) => {
          senseRef.current = sense;
          return (
            <View style={styles.center}>
              <Text style={styles.letter}>E</Text>
              <Text style={styles.emoji}>{done ? '😁✨' : '😁'}</Text>
              <Text style={styles.hint}>
                {Platform.OS === 'web' && sense.isDetecting
                  ? 'Smile + say “Eee”'
                  : 'Smile big and say “Eee”'}
              </Text>
              <View style={styles.bar}>
                <View style={[styles.fill, { width: `${progress * 100}%` }]} />
              </View>
            </View>
          );
        }}
      </VowelGameFrame>
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
  letter: { fontSize: 72, fontWeight: '900', color: '#BE185D' },
  emoji: { fontSize: 88, marginVertical: 8 },
  hint: { fontSize: 16, fontWeight: '800', color: '#9D174D', textAlign: 'center' },
  bar: {
    width: '85%',
    height: 14,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#EC4899', borderRadius: 8 },
});
