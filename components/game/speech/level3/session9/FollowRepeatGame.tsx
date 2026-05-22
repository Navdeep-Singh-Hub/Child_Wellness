import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useTwoPartSession,
  DEFAULT_VOICE_ROUNDS,
  matchStep,
  playSoundSequence,
  useSpeechHitCounter,
  createBurstDetector,
  TWO_STEP_PHRASES,
  type SeqCue,
} from '@/components/game/speech/level3/shared/twoPartVerbalGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Phase = 'listen' | 'say' | 'success';

const PHRASES_PER_ROUND = 3;

export function FollowRepeatGame({ onBack, onComplete }: Props) {
  const session = useTwoPartSession('follow-repeat', DEFAULT_VOICE_ROUNDS);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phrasesDone, setPhrasesDone] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('listen');
  const [progress, setProgress] = useState(0);
  const phrase = TWO_STEP_PHRASES[phraseIndex % TWO_STEP_PHRASES.length];
  const currentCue: SeqCue = phrase.steps[stepIndex];
  const speech = useSpeechHitCounter(phase === 'say', currentCue.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 450 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const busyRef = useRef(false);

  const playPhrase = (steps: SeqCue[]) => {
    busyRef.current = true;
    setPhase('listen');
    setStepIndex(0);
    setProgress(0);
    speakGame('Listen to both steps!');
    playSoundSequence(steps, () => {
      setPhase('say');
      speech.resetHits();
      burstRef.current.reset();
      holdRef.current = null;
      busyRef.current = false;
      speakGame(`First: ${steps[0].label}!`);
    }, 850);
  };

  useEffect(() => {
    speakGame('Follow and repeat two-step phrases!');
    playPhrase(TWO_STEP_PHRASES[0].steps);
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setPhraseIndex(0);
    setPhrasesDone(0);
    roundDoneRef.current = false;
    playPhrase(TWO_STEP_PHRASES[(session.round - 1) % TWO_STEP_PHRASES.length].steps);
  }, [session.round]);

  useEffect(() => {
    speech.resetHits();
    burstRef.current.reset();
    holdRef.current = null;
  }, [stepIndex, phraseIndex]);

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
      setPhase('success');
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      setTimeout(() => {
        if (stepIndex + 1 < phrase.steps.length) {
          const nextStep = stepIndex + 1;
          setStepIndex(nextStep);
          setPhase('say');
          setProgress(0);
          speech.resetHits();
          burstRef.current.reset();
          holdRef.current = null;
          speakGame(`Now: ${phrase.steps[nextStep].label}!`);
          busyRef.current = false;
          return;
        }
        const nextPhrases = phrasesDone + 1;
        setPhrasesDone(nextPhrases);
        if (nextPhrases >= PHRASES_PER_ROUND) {
          roundDoneRef.current = true;
          speakGame('Great memory!');
          setTimeout(() => session.completeRound(), 800);
        } else {
          const nextIdx = phraseIndex + 1;
          setPhraseIndex(nextIdx);
          playPhrase(TWO_STEP_PHRASES[nextIdx % TWO_STEP_PHRASES.length].steps);
        }
        busyRef.current = false;
      }, 550);
    }, 50);
    return () => clearInterval(tick);
  }, [phase, session, currentCue, stepIndex, phrase, phrasesDone, phraseIndex, speech.useSpeech]);

  return (
    <>
      <VoiceGameFrame
        title="Follow & Repeat"
        subtitle="Hear a 2-step phrase"
        skills="🧠 Memory • 👂 Listen • 🔁 Two steps"
        gradient={['#FCE7F3', '#FBCFE8']}
        accent="#DB2777"
        onBack={onBack}
        progress={phrasesDone}
        progressTotal={PHRASES_PER_ROUND}
        roundLabel={`Phrases ${phrasesDone}/${PHRASES_PER_ROUND} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Text style={styles.icon}>{phase === 'listen' ? '👂' : '🎤'}</Text>
              <Text style={styles.label}>{phrase.label}</Text>
              {phase !== 'listen' && (
                <>
                  <Text style={styles.step}>
                    Step {stepIndex + 1}: {currentCue.label}
                  </Text>
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
  icon: { fontSize: 72 },
  label: { fontSize: 28, fontWeight: '900', color: '#9D174D', marginTop: 8 },
  step: { fontSize: 22, fontWeight: '800', color: '#BE185D', marginTop: 12 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 16,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#EC4899', borderRadius: 8 },
});
