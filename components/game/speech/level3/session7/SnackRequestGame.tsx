import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useWordGameSession,
  DEFAULT_VOICE_ROUNDS,
  SNACK_CUES,
  tickWordMatch,
  useSpeechHitCounter,
  createBurstDetector,
  type WordCue,
} from '@/components/game/speech/level3/shared/wordGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const SNACKS_PER_ROUND = 3;
const HOLD_MS = 900;

export function SnackRequestGame({ onBack, onComplete }: Props) {
  const session = useWordGameSession('snack-request', DEFAULT_VOICE_ROUNDS);
  const [snackIndex, setSnackIndex] = useState(0);
  const [served, setServed] = useState(0);
  const [progress, setProgress] = useState(0);
  const cue: WordCue =
    SNACK_CUES[(session.round - 1 + snackIndex) % SNACK_CUES.length] ?? SNACK_CUES[0];
  const speech = useSpeechHitCounter(true, cue.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 600 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const lockRef = useRef(false);

  useEffect(() => {
    speakGame('Ask for a snack with your voice!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setSnackIndex(0);
    setServed(0);
    setProgress(0);
    roundDoneRef.current = false;
    lockRef.current = false;
    burstRef.current.reset();
    holdRef.current = null;
    speech.resetHits();
    speakGame(`Say ${SNACK_CUES[(session.round - 1) % SNACK_CUES.length].label}!`);
  }, [session.round]);

  useEffect(() => {
    speech.resetHits();
    burstRef.current.reset();
    holdRef.current = null;
  }, [snackIndex, cue.label]);

  const onRequest = () => {
    if (roundDoneRef.current || lockRef.current) return;
    lockRef.current = true;
    holdRef.current = null;
    setProgress(0);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    speakGame(`${cue.label}! Yum!`);
    const nextServed = served + 1;
    setServed(nextServed);
    if (nextServed >= SNACKS_PER_ROUND) {
      roundDoneRef.current = true;
      speakGame('All snacks served! Great asking!');
      setTimeout(() => session.completeRound(), 900);
    } else {
      const nextIdx = snackIndex + 1;
      setSnackIndex(nextIdx);
      const nextCue = SNACK_CUES[(session.round - 1 + nextIdx) % SNACK_CUES.length];
      setTimeout(() => {
        speakGame(`Now say ${nextCue.label}!`);
        lockRef.current = false;
      }, 700);
      return;
    }
    setTimeout(() => {
      lockRef.current = false;
    }, 650);
  };

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current || lockRef.current) return;
      const { progress: p, matched } = tickWordMatch(
        cue,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
        HOLD_MS,
      );
      setProgress(p);
      if (matched) onRequest();
    }, 50);
    return () => clearInterval(tick);
  }, [session, speech.useSpeech, cue, served, snackIndex]);

  return (
    <>
      <VoiceGameFrame
        title="Snack Request"
        subtitle="Say simple food words"
        skills="🍎 Requesting • 🗣️ Food words • 💬 Communication"
        gradient={['#FFEDD5', '#FED7AA']}
        accent="#EA580C"
        onBack={onBack}
        progress={served}
        progressTotal={SNACKS_PER_ROUND}
        roundLabel={`Snacks ${served}/${SNACKS_PER_ROUND} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Text style={styles.plate}>🍽️</Text>
              <Text style={styles.snack}>{cue.emoji}</Text>
              <Text style={styles.word}>{cue.label}</Text>
              <View style={styles.bar}>
                <View style={[styles.fill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.hint}>Say “{cue.label}” to get your snack</Text>
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
  plate: { fontSize: 56, marginBottom: 4 },
  snack: { fontSize: 88 },
  word: { fontSize: 40, fontWeight: '900', color: '#C2410C', marginTop: 8 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#F97316', borderRadius: 8 },
  hint: { marginTop: 10, fontWeight: '800', color: '#9A3412', textAlign: 'center', paddingHorizontal: 16 },
});
