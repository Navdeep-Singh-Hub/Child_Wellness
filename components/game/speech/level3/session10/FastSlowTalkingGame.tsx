import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  useFluentSession,
  DEFAULT_VOICE_ROUNDS,
  matchStep,
  useSpeechHitCounter,
  createBurstDetector,
  FLUENT_PHRASE,
} from '@/components/game/speech/level3/shared/fluentSpeechGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Phase = 'slow-demo' | 'slow-say' | 'fast-demo' | 'fast-say';

const SLOW_RATE = 0.5;
const FAST_RATE = 1.15;
const SLOW_HOLD = 1300;
const FAST_HOLD = 550;
const ROUNDS_FLOW = 2;

export function FastSlowTalkingGame({ onBack, onComplete }: Props) {
  const session = useFluentSession('fast-slow-talking', DEFAULT_VOICE_ROUNDS);
  const [flowsDone, setFlowsDone] = useState(0);
  const [phase, setPhase] = useState<Phase>('slow-demo');
  const [progress, setProgress] = useState(0);
  const speech = useSpeechHitCounter(phase === 'slow-say' || phase === 'fast-say', FLUENT_PHRASE.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 400 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const busyRef = useRef(false);

  const playDemo = (slow: boolean) => {
    busyRef.current = true;
    setProgress(0);
    speakGame(FLUENT_PHRASE.speak, slow ? SLOW_RATE : FAST_RATE);
    scheduleGameSpeech(slow ? 'Say it slowly and smoothly!' : 'Now say it faster!', slow ? 1500 : 800);
    setTimeout(() => {
      setPhase(slow ? 'slow-say' : 'fast-say');
      speech.resetHits();
      burstRef.current.reset();
      holdRef.current = null;
      busyRef.current = false;
    }, slow ? 1600 : 950);
  };

  const startFlow = () => {
    setPhase('slow-demo');
    playDemo(true);
  };

  useEffect(() => {
    speakGame('Practice slow and fast smooth talking!');
    startFlow();
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setFlowsDone(0);
    roundDoneRef.current = false;
    startFlow();
  }, [session.round]);

  useEffect(() => {
    const saying = phase === 'slow-say' || phase === 'fast-say';
    if (!saying || session.gameFinished || roundDoneRef.current || busyRef.current) return;
    const holdMs = phase === 'slow-say' ? SLOW_HOLD : FAST_HOLD;
    const tick = setInterval(() => {
      const { progress: p, matched } = matchStep(
        FLUENT_PHRASE,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
        holdMs,
      );
      setProgress(p);
      if (!matched) return;
      busyRef.current = true;
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      if (phase === 'slow-say') {
        speakGame('Smooth slow!');
        setTimeout(() => {
          setPhase('fast-demo');
          playDemo(false);
        }, 550);
        return;
      }
      speakGame('Great fast flow!');
      const next = flowsDone + 1;
      setFlowsDone(next);
      if (next >= ROUNDS_FLOW) {
        roundDoneRef.current = true;
        setTimeout(() => session.completeRound(), 800);
      } else {
        setTimeout(() => {
          busyRef.current = false;
          startFlow();
        }, 600);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [phase, session, flowsDone, speech.useSpeech]);

  const speedLabel =
    phase === 'slow-demo' || phase === 'slow-say' ? '🐢 Slow & smooth' : '🐇 Fast & clear';

  return (
    <>
      <VoiceGameFrame
        title="Fast-Slow Talking"
        subtitle="Adjust speaking speed"
        skills="⏱️ Speech control • 🌊 Smooth • 🗣️ Pace"
        gradient={['#E0F2FE', '#BAE6FD']}
        accent="#0284C7"
        onBack={onBack}
        progress={flowsDone}
        progressTotal={ROUNDS_FLOW}
        roundLabel={`Flows ${flowsDone}/${ROUNDS_FLOW} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Text style={styles.speed}>{speedLabel}</Text>
              <Text style={styles.wave}>{phase.includes('slow') ? '〰️〰️〰️' : '⚡⚡⚡'}</Text>
              <Text style={styles.phrase}>{FLUENT_PHRASE.label}</Text>
              <Text style={styles.hint}>{phase.includes('demo') ? 'Listen…' : 'Your turn!'}</Text>
              {(phase === 'slow-say' || phase === 'fast-say') && (
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
  speed: { fontSize: 28, fontWeight: '900', color: '#0369A1' },
  wave: { fontSize: 32, marginTop: 12, letterSpacing: 4 },
  phrase: { fontSize: 32, fontWeight: '900', color: '#0C4A6E', marginTop: 12 },
  hint: { fontSize: 18, fontWeight: '800', color: '#075985', marginTop: 8 },
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
