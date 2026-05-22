import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useListenRepeatSession,
  DEFAULT_VOICE_ROUNDS,
  matchStep,
  playListenThenSay,
  useSpeechHitCounter,
  createBurstDetector,
  LISTEN_WORD_POOL,
  type ListenPhase,
  type SeqCue,
} from '@/components/game/speech/level3/shared/listenRepeatGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const REPEATS = 4;

export function HearAndSayGame({ onBack, onComplete }: Props) {
  const session = useListenRepeatSession('hear-and-say', DEFAULT_VOICE_ROUNDS);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(0);
  const [phase, setPhase] = useState<ListenPhase>('listen');
  const [progress, setProgress] = useState(0);
  const cue: SeqCue = LISTEN_WORD_POOL[index % LISTEN_WORD_POOL.length];
  const speech = useSpeechHitCounter(phase === 'say', cue.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 500 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const busyRef = useRef(false);
  const earPulse = useRef(new Animated.Value(1)).current;

  const playHear = (c: SeqCue) => {
    busyRef.current = true;
    setPhase('listen');
    setProgress(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(earPulse, { toValue: 1.15, duration: 400, useNativeDriver: true }),
        Animated.timing(earPulse, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ).start();
    playListenThenSay(c, () => {
      earPulse.stopAnimation();
      earPulse.setValue(1);
      setPhase('say');
      speech.resetHits();
      burstRef.current.reset();
      holdRef.current = null;
      busyRef.current = false;
      speakGame('Now you say it!');
    });
  };

  useEffect(() => {
    speakGame('Hear the word, then say it back!');
    playHear(LISTEN_WORD_POOL[0]);
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setIndex(0);
    setDone(0);
    roundDoneRef.current = false;
    playHear(LISTEN_WORD_POOL[0]);
  }, [session.round]);

  useEffect(() => {
    if (phase !== 'say' || session.gameFinished || roundDoneRef.current || busyRef.current) return;
    const tick = setInterval(() => {
      const { progress: p, matched } = matchStep(
        cue,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
      );
      setProgress(p);
      if (!matched) return;
      busyRef.current = true;
      setPhase('success');
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      speakGame('Perfect!');
      setTimeout(() => {
        const next = done + 1;
        setDone(next);
        if (next >= REPEATS) {
          roundDoneRef.current = true;
          setTimeout(() => session.completeRound(), 800);
        } else {
          const nextIdx = index + 1;
          setIndex(nextIdx);
          playHear(LISTEN_WORD_POOL[nextIdx % LISTEN_WORD_POOL.length]);
        }
        busyRef.current = false;
      }, 600);
    }, 50);
    return () => clearInterval(tick);
  }, [phase, session, cue, done, index, speech.useSpeech]);

  return (
    <>
      <VoiceGameFrame
        title="Hear & Say"
        subtitle="Repeat the heard word"
        skills="👂 Auditory processing • 🗣️ Repeat • 🧠 Listen"
        gradient={['#E0F2FE', '#BAE6FD']}
        accent="#0284C7"
        onBack={onBack}
        progress={done}
        progressTotal={REPEATS}
        roundLabel={`Heard ${done}/${REPEATS} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Animated.Text
                style={[
                  styles.ear,
                  phase === 'listen' && { transform: [{ scale: earPulse }] },
                ]}
              >
                {phase === 'listen' ? '👂' : '🎤'}
              </Animated.Text>
              <Text style={styles.label}>{cue.label}</Text>
              <Text style={styles.phase}>
                {phase === 'listen' ? 'Listen…' : phase === 'say' ? 'Your turn!' : '✓'}
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
  ear: { fontSize: 80 },
  label: { fontSize: 48, fontWeight: '900', color: '#0369A1', marginTop: 12 },
  phase: { fontSize: 20, fontWeight: '800', color: '#0C4A6E', marginTop: 8 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#0EA5E9', borderRadius: 8 },
});
