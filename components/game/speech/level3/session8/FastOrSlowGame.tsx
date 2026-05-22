import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  useListenRepeatSession,
  DEFAULT_VOICE_ROUNDS,
  matchStep,
  useSpeechHitCounter,
  createBurstDetector,
  SEQ_MA,
  SEQ_PA,
  type SeqCue,
} from '@/components/game/speech/level3/shared/listenRepeatGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Phase = 'slow-demo' | 'slow-say' | 'fast-demo' | 'fast-say' | 'success';
type Speed = 'slow' | 'fast';

const SLOW_RATE = 0.55;
const FAST_RATE = 1.12;
const SLOW_HOLD = 1100;
const FAST_HOLD = 500;

const SPEED_CUES: SeqCue[] = [SEQ_MA, SEQ_PA];

export function FastOrSlowGame({ onBack, onComplete }: Props) {
  const session = useListenRepeatSession('fast-or-slow', DEFAULT_VOICE_ROUNDS);
  const [cueIndex, setCueIndex] = useState(0);
  const [pairsDone, setPairsDone] = useState(0);
  const [phase, setPhase] = useState<Phase>('slow-demo');
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState<Speed>('slow');
  const cue = SPEED_CUES[cueIndex % SPEED_CUES.length];
  const speech = useSpeechHitCounter(
    phase === 'slow-say' || phase === 'fast-say',
    cue.words,
  );
  const burstRef = useRef(createBurstDetector({ cooldownMs: 450 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const busyRef = useRef(false);

  const playDemo = (spd: Speed, c: SeqCue) => {
    busyRef.current = true;
    setSpeed(spd);
    setProgress(0);
    const rate = spd === 'slow' ? SLOW_RATE : FAST_RATE;
    speakGame(c.speak, rate);
    scheduleGameSpeech(
      spd === 'slow' ? 'Now say it slowly!' : 'Now say it fast!',
      spd === 'slow' ? 1400 : 700,
    );
    setTimeout(() => {
      setPhase(spd === 'slow' ? 'slow-say' : 'fast-say');
      speech.resetHits();
      burstRef.current.reset();
      holdRef.current = null;
      busyRef.current = false;
    }, spd === 'slow' ? 1500 : 900);
  };

  const startPair = (c: SeqCue) => {
    setPhase('slow-demo');
    playDemo('slow', c);
  };

  useEffect(() => {
    speakGame('Listen slow, then fast — and copy both!');
    startPair(SPEED_CUES[0]);
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setCueIndex(0);
    setPairsDone(0);
    roundDoneRef.current = false;
    startPair(SPEED_CUES[0]);
  }, [session.round]);

  useEffect(() => {
    const saying = phase === 'slow-say' || phase === 'fast-say';
    if (!saying || session.gameFinished || roundDoneRef.current || busyRef.current) return;
    const holdMs = phase === 'slow-say' ? SLOW_HOLD : FAST_HOLD;
    const tick = setInterval(() => {
      const { progress: p, matched } = matchStep(
        cue,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
        holdMs,
      );
      setProgress(p);
      if (!matched) return;
      busyRef.current = true;
      setPhase('success');
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      if (phase === 'slow-say') {
        speakGame('Good slow!');
        setTimeout(() => {
          setPhase('fast-demo');
          playDemo('fast', cue);
        }, 600);
        return;
      }
      speakGame('Good fast!');
      setTimeout(() => {
        const nextPairs = pairsDone + 1;
        setPairsDone(nextPairs);
        if (nextPairs >= SPEED_CUES.length) {
          roundDoneRef.current = true;
          setTimeout(() => session.completeRound(), 800);
        } else {
          const nextIdx = cueIndex + 1;
          setCueIndex(nextIdx);
          startPair(SPEED_CUES[nextIdx % SPEED_CUES.length]);
        }
        busyRef.current = false;
      }, 600);
    }, 50);
    return () => clearInterval(tick);
  }, [phase, session, cue, pairsDone, cueIndex, speech.useSpeech]);

  const speedLabel =
    phase === 'slow-demo' || phase === 'slow-say' ? '🐢 Slow' : '🐇 Fast';

  return (
    <>
      <VoiceGameFrame
        title="Fast or Slow?"
        subtitle="Repeat at different speeds"
        skills="⏱️ Speech control • 🐢 Slow • 🐇 Fast"
        gradient={['#ECFDF5', '#D1FAE5']}
        accent="#059669"
        onBack={onBack}
        progress={pairsDone}
        progressTotal={SPEED_CUES.length}
        roundLabel={`Pairs ${pairsDone}/${SPEED_CUES.length} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Text style={styles.speed}>{speedLabel}</Text>
              <Text style={styles.word}>{cue.label}</Text>
              <Text style={styles.phase}>
                {phase.includes('demo') ? 'Listen…' : 'Your turn!'}
              </Text>
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
  speed: { fontSize: 36, fontWeight: '900', color: '#047857' },
  word: { fontSize: 52, fontWeight: '900', color: '#065F46', marginTop: 12 },
  phase: { fontSize: 20, fontWeight: '800', color: '#064E3B', marginTop: 8 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#10B981', borderRadius: 8 },
});
