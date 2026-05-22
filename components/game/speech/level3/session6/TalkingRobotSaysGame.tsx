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
  SEQ_MA,
  SEQ_PA,
  SEQ_BA,
  SEQ_MOO,
  SEQ_CHOO,
  type SeqCue,
} from '@/components/game/speech/level3/shared/sequenceGameShared';
import { SOUND_MOO } from '@/components/game/speech/level3/shared/animalSoundGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Phase = 'robot' | 'child' | 'success';

const SILLY_COMBOS: SeqCue[][] = [
  [SEQ_MA, SOUND_MOO, SEQ_PA],
  [SEQ_CHOO, SEQ_BA, SEQ_MA],
  [SEQ_PA, SEQ_MOO, SEQ_BA],
  [SEQ_MOO, SEQ_MA, SEQ_CHOO],
];

const COMBOS_PER_ROUND = 3;

export function TalkingRobotSaysGame({ onBack, onComplete }: Props) {
  const session = useSequenceSession('talking-robot-says', DEFAULT_VOICE_ROUNDS);
  const [comboIndex, setComboIndex] = useState(0);
  const [combosDone, setCombosDone] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('robot');
  const [progress, setProgress] = useState(0);
  const combo = SILLY_COMBOS[comboIndex % SILLY_COMBOS.length];
  const currentCue = combo[stepIndex];
  const speech = useSpeechHitCounter(phase === 'child', currentCue.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 420 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const busyRef = useRef(false);

  const playCombo = (c: SeqCue[]) => {
    busyRef.current = true;
    setPhase('robot');
    setStepIndex(0);
    setProgress(0);
    playSoundSequence(c, () => {
      setPhase('child');
      setStepIndex(0);
      speech.resetHits();
      burstRef.current.reset();
      holdRef.current = null;
      busyRef.current = false;
      speakGame('Your turn! Copy the robot!');
    }, 650);
  };

  useEffect(() => {
    speakGame('The silly robot has a challenge!');
    playCombo(SILLY_COMBOS[0]);
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setComboIndex(0);
    setCombosDone(0);
    roundDoneRef.current = false;
    playCombo(SILLY_COMBOS[0]);
  }, [session.round]);

  useEffect(() => {
    if (phase !== 'child' || session.gameFinished || roundDoneRef.current || busyRef.current) return;
    const tick = setInterval(() => {
      const { progress: p, matched } = matchStep(
        currentCue,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
        650,
      );
      setProgress(p);
      if (!matched) return;
      busyRef.current = true;
      holdRef.current = null;
      burstRef.current.reset();
      speech.resetHits();
      const nextStep = stepIndex + 1;
      if (nextStep < combo.length) {
        setStepIndex(nextStep);
        setProgress(0);
        busyRef.current = false;
        return;
      }
      setPhase('success');
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      speakGame('Silly copy master!');
      setTimeout(() => {
        const nextC = combosDone + 1;
        setCombosDone(nextC);
        if (nextC >= COMBOS_PER_ROUND) {
          roundDoneRef.current = true;
          setTimeout(() => session.completeRound(), 800);
        } else {
          const nextCi = comboIndex + 1;
          setComboIndex(nextCi);
          playCombo(SILLY_COMBOS[nextCi % SILLY_COMBOS.length]);
        }
        busyRef.current = false;
      }, 600);
    }, 50);
    return () => clearInterval(tick);
  }, [phase, session, currentCue, stepIndex, combo, combosDone, comboIndex, speech.useSpeech]);

  return (
    <>
      <VoiceGameFrame
        title="Talking Robot Says"
        subtitle="Copy silly sound combos"
        skills="🤖 Flexibility • 🧠 Memory • 🗣️ Fun copy"
        gradient={['#EDE9FE', '#DDD6FE']}
        accent="#7C3AED"
        onBack={onBack}
        progress={combosDone}
        progressTotal={COMBOS_PER_ROUND}
        roundLabel={`Combos ${combosDone}/${COMBOS_PER_ROUND} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Text style={styles.robot}>🤖</Text>
              <Text style={styles.phase}>
                {phase === 'robot' ? 'Robot says…' : phase === 'child' ? 'You copy!' : '⭐'}
              </Text>
              <Text style={styles.combo}>{combo.map((c) => c.label).join(' · ')}</Text>
              {phase === 'child' && (
                <>
                  <Text style={styles.now}>Now: {currentCue.label}</Text>
                  <View style={styles.bar}>
                    <View style={[styles.fill, { width: `${progress * 100}%` }]} />
                  </View>
                </>
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
  robot: { fontSize: 80 },
  phase: { fontSize: 18, fontWeight: '800', color: '#5B21B6', marginTop: 8 },
  combo: { fontSize: 28, fontWeight: '900', color: '#6D28D9', marginTop: 12 },
  now: { fontSize: 22, fontWeight: '800', color: '#7C3AED', marginTop: 8 },
  bar: {
    width: '80%',
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 6,
    marginTop: 16,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#8B5CF6', borderRadius: 6 },
});
