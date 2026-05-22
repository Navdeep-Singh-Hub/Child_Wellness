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

const HOLD_MS = 1400;

export function OpenMouthAaaGame({ onBack, onComplete }: Props) {
  const session = useVoiceGameSession('open-mouth-aaa', DEFAULT_VOICE_ROUNDS);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const holdRef = useRef<number | null>(null);
  const roundDoneRef = useRef(false);
  const senseRef = useRef<VowelSense | null>(null);

  useEffect(() => {
    speakGame('Open your mouth wide and say Aaa!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setProgress(0);
    setDone(false);
    roundDoneRef.current = false;
    holdRef.current = null;
    speakGame('Match the big open mouth — say Aaa!');
  }, [session.round]);

  useEffect(() => {
    const tick = setInterval(() => {
      const sense = senseRef.current;
      if (!sense || session.gameFinished || roundDoneRef.current) return;
      const { progress: p, matched } = vowelMatch(sense, 'A', HOLD_MS, holdRef);
      setProgress(p);
      if (matched) {
        roundDoneRef.current = true;
        setDone(true);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        speakGame('Great Aaa!');
        setTimeout(() => session.completeRound(), 1000);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [session]);

  return (
    <>
      <VowelGameFrame
        title='Open Mouth "Aaa"'
        subtitle="Wide open mouth + Aaa sound"
        skills="🅰️ Vowel A • 👄 Mouth shaping • 🗣️ Phonation"
        gradient={['#FEF3C7', '#FDE68A']}
        accent="#D97706"
        onBack={onBack}
        progress={session.round}
        progressTotal={session.rounds}
        roundLabel={`Aaa ${session.round} / ${session.rounds}`}
      >
        {(sense) => {
          senseRef.current = sense;
          return (
            <View style={styles.center}>
              <Text style={styles.letter}>A</Text>
              <Text style={styles.emoji}>{done ? '😮✨' : '😮'}</Text>
              <Text style={styles.hint}>
                {Platform.OS === 'web' && sense.isDetecting
                  ? 'Open wide + say “Aaa”'
                  : 'Say “Aaa” and hold your voice'}
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
  letter: { fontSize: 72, fontWeight: '900', color: '#B45309' },
  emoji: { fontSize: 88, marginVertical: 8 },
  hint: { fontSize: 16, fontWeight: '800', color: '#92400E', textAlign: 'center' },
  bar: {
    width: '85%',
    height: 14,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 8 },
});
