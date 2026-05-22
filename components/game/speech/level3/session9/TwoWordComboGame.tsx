import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useTwoPartSession,
  DEFAULT_VOICE_ROUNDS,
  useSpeechHitCounter,
  createBurstDetector,
  sustainedVoice,
  VOICE_ACTIVE_THRESHOLD,
  PHRASE_COMBOS,
  type PhraseCombo,
} from '@/components/game/speech/level3/shared/twoPartVerbalGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Phase = 'listen' | 'say';

const PHRASE_HOLD_MS = 1400;
const PHRASES_PER_ROUND = 3;

export function TwoWordComboGame({ onBack, onComplete }: Props) {
  const session = useTwoPartSession('two-word-combo', DEFAULT_VOICE_ROUNDS);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(0);
  const [phase, setPhase] = useState<Phase>('listen');
  const [progress, setProgress] = useState(0);
  const phrase: PhraseCombo = PHRASE_COMBOS[index % PHRASE_COMBOS.length];
  const speech = useSpeechHitCounter(phase === 'say', phrase.words);
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const lockRef = useRef(false);

  const playPhrase = (p: PhraseCombo) => {
    lockRef.current = true;
    setPhase('listen');
    setProgress(0);
    speakGame(p.speak);
    setTimeout(() => {
      setPhase('say');
      speech.resetHits();
      holdRef.current = null;
      speakGame('Say the two words!');
      lockRef.current = false;
    }, 1200);
  };

  useEffect(() => {
    speakGame('Say two-word phrases!');
    playPhrase(PHRASE_COMBOS[0]);
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setIndex(0);
    setDone(0);
    roundDoneRef.current = false;
    playPhrase(PHRASE_COMBOS[(session.round - 1) % PHRASE_COMBOS.length]);
  }, [session.round]);

  useEffect(() => {
    if (phase !== 'say' || session.gameFinished || roundDoneRef.current || lockRef.current) return;
    const tick = setInterval(() => {
      if (speech.useSpeech && speech.consumeHit()) {
        lockRef.current = true;
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        speakGame('Nice phrase!');
        const next = done + 1;
        setDone(next);
        if (next >= PHRASES_PER_ROUND) {
          roundDoneRef.current = true;
          setTimeout(() => session.completeRound(), 800);
        } else {
          const nextIdx = index + 1;
          setIndex(nextIdx);
          playPhrase(PHRASE_COMBOS[nextIdx % PHRASE_COMBOS.length]);
        }
        return;
      }
      const v = voiceRef.current;
      const { progress: p, done: held } = sustainedVoice(
        v.level,
        v.active,
        PHRASE_HOLD_MS,
        holdRef,
        VOICE_ACTIVE_THRESHOLD,
      );
      setProgress(p);
      if (!held) return;
      lockRef.current = true;
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      speakGame('Nice phrase!');
      const next = done + 1;
      setDone(next);
      if (next >= PHRASES_PER_ROUND) {
        roundDoneRef.current = true;
        setTimeout(() => session.completeRound(), 800);
      } else {
        const nextIdx = index + 1;
        setIndex(nextIdx);
        playPhrase(PHRASE_COMBOS[nextIdx % PHRASE_COMBOS.length]);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [phase, session, phrase, done, index, speech.useSpeech]);

  return (
    <>
      <VoiceGameFrame
        title="Two Word Combo"
        subtitle='Early phrases like “more juice”'
        skills="💬 Early phrases • 🔤 Two words • 🗣️ Combo"
        gradient={['#DCFCE7', '#BBF7D0']}
        accent="#16A34A"
        onBack={onBack}
        progress={done}
        progressTotal={PHRASES_PER_ROUND}
        roundLabel={`Phrases ${done}/${PHRASES_PER_ROUND} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Text style={styles.emoji}>{phrase.emoji}</Text>
              <Text style={styles.phrase}>{phrase.label}</Text>
              <Text style={styles.hint}>
                {phase === 'listen' ? 'Listen…' : 'Say both words!'}
              </Text>
              {phase === 'say' && (
                <View style={styles.bar}>
                  <View style={[styles.fill, { width: `${progress * 100}%` }]} />
                </View>
              )}
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
  emoji: { fontSize: 72 },
  phrase: { fontSize: 36, fontWeight: '900', color: '#15803D', marginTop: 12 },
  hint: { fontSize: 18, fontWeight: '800', color: '#166534', marginTop: 8 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 8 },
});
