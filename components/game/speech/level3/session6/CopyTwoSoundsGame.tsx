import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useSequenceSession,
  DEFAULT_VOICE_ROUNDS,
  matchStep,
  playSoundSequence,
  useSpeechHitCounter,
  createBurstDetector,
  TWO_SOUND_PAIRS,
  type SeqCue,
} from '@/components/game/speech/level3/shared/sequenceGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Phase = 'listen' | 'say' | 'success';

const PAIRS_PER_ROUND = 3;

export function CopyTwoSoundsGame({ onBack, onComplete }: Props) {
  const session = useSequenceSession('copy-two-sounds', DEFAULT_VOICE_ROUNDS);
  const [pairIndex, setPairIndex] = useState(0);
  const [pairsDone, setPairsDone] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('listen');
  const [progress, setProgress] = useState(0);
  const pair = TWO_SOUND_PAIRS[pairIndex % TWO_SOUND_PAIRS.length];
  const currentCue: SeqCue = pair[stepIndex];
  const speech = useSpeechHitCounter(phase === 'say', currentCue.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 450 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const busyRef = useRef(false);

  const playPair = (p: SeqCue[]) => {
    busyRef.current = true;
    setPhase('listen');
    setStepIndex(0);
    setProgress(0);
    playSoundSequence(p, () => {
      setPhase('say');
      speech.resetHits();
      burstRef.current.reset();
      holdRef.current = null;
      busyRef.current = false;
    });
  };

  useEffect(() => {
    speakGame('Copy two sounds in a row!');
    playPair(TWO_SOUND_PAIRS[0]);
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setPairIndex(0);
    setPairsDone(0);
    roundDoneRef.current = false;
    playPair(TWO_SOUND_PAIRS[0]);
  }, [session.round]);

  useEffect(() => {
    speech.resetHits();
    burstRef.current.reset();
    holdRef.current = null;
  }, [stepIndex, pairIndex]);

  useEffect(() => {
    if (phase !== 'say' || session.gameFinished || roundDoneRef.current || busyRef.current) return;
    const tick = setInterval(() => {
      const { progress: p, matched } = matchStep(
        currentCue,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
      );
      setProgress(p);
      if (!matched) return;
      busyRef.current = true;
      holdRef.current = null;
      burstRef.current.reset();
      speech.resetHits();
      const nextStep = stepIndex + 1;
      if (nextStep < pair.length) {
        setStepIndex(nextStep);
        setProgress(0);
        speakGame(pair[nextStep].speak);
        busyRef.current = false;
        return;
      }
      setPhase('success');
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      speakGame('Two sounds!');
      setTimeout(() => {
        const nextPairs = pairsDone + 1;
        setPairsDone(nextPairs);
        if (nextPairs >= PAIRS_PER_ROUND) {
          roundDoneRef.current = true;
          setTimeout(() => session.completeRound(), 800);
        } else {
          const nextPi = pairIndex + 1;
          setPairIndex(nextPi);
          playPair(TWO_SOUND_PAIRS[nextPi % TWO_SOUND_PAIRS.length]);
        }
        busyRef.current = false;
      }, 600);
    }, 50);
    return () => clearInterval(tick);
  }, [phase, session, currentCue, stepIndex, pair, pairsDone, pairIndex, speech.useSpeech]);

  return (
    <>
      <VoiceGameFrame
        title="Copy 2 Sounds"
        subtitle='Hear “ma-ba” → repeat both'
        skills="🔢 Sequencing • 👂 Memory • 🗣️ Imitation"
        gradient={['#FCE7F3', '#FBCFE8']}
        accent="#DB2777"
        onBack={onBack}
        progress={pairsDone}
        progressTotal={PAIRS_PER_ROUND}
        roundLabel={`Pairs ${pairsDone}/${PAIRS_PER_ROUND} · Now: ${pair.map((p) => p.label).join('-')}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Text style={styles.icon}>{phase === 'listen' ? '👂' : '🎤'}</Text>
              <Text style={styles.seq}>
                {pair.map((p, i) => (
                  <Text key={p.label} style={i === stepIndex && phase === 'say' ? styles.active : undefined}>
                    {p.label}
                    {i < pair.length - 1 ? ' · ' : ''}
                  </Text>
                ))}
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
  icon: { fontSize: 64 },
  seq: { fontSize: 36, fontWeight: '900', color: '#9D174D', marginTop: 12 },
  active: { color: '#DB2777', textDecorationLine: 'underline' },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#EC4899', borderRadius: 8 },
});
