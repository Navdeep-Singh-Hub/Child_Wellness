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

const HOLD_MS = 1000;
const SWITCHES_PER_ROUND = 4;

type Phase = 'A' | 'O';

export function VowelSwitchGame({ onBack, onComplete }: Props) {
  const session = useVoiceGameSession('vowel-switch', DEFAULT_VOICE_ROUNDS);
  const [phase, setPhase] = useState<Phase>('A');
  const [switches, setSwitches] = useState(0);
  const [progress, setProgress] = useState(0);
  const holdRef = useRef<number | null>(null);
  const senseRef = useRef<VowelSense | null>(null);
  const roundDoneRef = useRef(false);

  useEffect(() => {
    speakGame('Switch between Aaa and Ooo!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setPhase('A');
    setSwitches(0);
    setProgress(0);
    roundDoneRef.current = false;
    holdRef.current = null;
    speakGame('First say Aaa, then Ooo!');
  }, [session.round]);

  useEffect(() => {
    const tick = setInterval(() => {
      const sense = senseRef.current;
      if (!sense || session.gameFinished || roundDoneRef.current) return;
      const { progress: p, matched } = vowelMatch(sense, phase, HOLD_MS, holdRef);
      setProgress(p);
      if (!matched) return;
      holdRef.current = null;
      setProgress(0);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      const nextCount = switches + 1;
      setSwitches(nextCount);
      if (nextCount >= SWITCHES_PER_ROUND) {
        roundDoneRef.current = true;
        speakGame('Great switching!');
        setTimeout(() => session.completeRound(), 900);
        return;
      }
      const nextPhase: Phase = phase === 'A' ? 'O' : 'A';
      setPhase(nextPhase);
      speakGame(nextPhase === 'A' ? 'Now Aaa!' : 'Now Ooo!');
    }, 50);
    return () => clearInterval(tick);
  }, [session, phase, switches]);

  return (
    <>
      <VowelGameFrame
        title="Vowel Switch"
        subtitle="Alternate Aaa ↔ Ooo"
        skills="🔄 Oral transitions • 🅰️🅾️ A ↔ O • 🗣️ Vowel control"
        gradient={['#EDE9FE', '#DDD6FE']}
        accent="#7C3AED"
        onBack={onBack}
        progress={switches}
        progressTotal={SWITCHES_PER_ROUND}
        roundLabel={`Switch ${switches}/${SWITCHES_PER_ROUND} · Round ${session.round}/${session.rounds}`}
      >
        {(sense) => {
          senseRef.current = sense;
          return (
            <View style={styles.center}>
              <Text style={styles.targetLabel}>Now:</Text>
              <Text style={styles.letter}>{phase}</Text>
              <Text style={styles.emoji}>{phase === 'A' ? '😮' : '🐟'}</Text>
              <Text style={styles.word}>{phase === 'A' ? '“Aaa”' : '“Ooo”'}</Text>
              <Text style={styles.hint}>
                {Platform.OS === 'web' && sense.isDetecting
                  ? `Match ${phase} shape + sound`
                  : `Say ${phase === 'A' ? 'Aaa' : 'Ooo'}`}
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
  targetLabel: { fontSize: 16, fontWeight: '700', color: '#6D28D9' },
  letter: { fontSize: 80, fontWeight: '900', color: '#5B21B6' },
  emoji: { fontSize: 72 },
  word: { fontSize: 28, fontWeight: '900', color: '#4C1D95' },
  hint: { marginTop: 8, fontSize: 15, fontWeight: '800', color: '#6D28D9' },
  bar: {
    width: '85%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#8B5CF6', borderRadius: 8 },
});
