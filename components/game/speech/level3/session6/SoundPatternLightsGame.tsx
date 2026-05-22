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
  LIGHT_COLORS,
  SEQ_MA,
  SEQ_PA,
  SEQ_MOO,
  type SeqCue,
} from '@/components/game/speech/level3/shared/sequenceGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Phase = 'listen' | 'say' | 'success';

const PATTERNS: SeqCue[][] = [
  [SEQ_MA, SEQ_PA, SEQ_MOO],
  [SEQ_PA, SEQ_MA, SEQ_MA],
  [SEQ_MOO, SEQ_PA, SEQ_MA],
];

const PATTERNS_PER_ROUND = 2;

export function SoundPatternLightsGame({ onBack, onComplete }: Props) {
  const session = useSequenceSession('sound-pattern-lights', DEFAULT_VOICE_ROUNDS);
  const [patternIndex, setPatternIndex] = useState(0);
  const [patternsDone, setPatternsDone] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('listen');
  const [progress, setProgress] = useState(0);
  const [activeLight, setActiveLight] = useState(-1);
  const pattern = PATTERNS[patternIndex % PATTERNS.length];
  const currentCue = pattern[stepIndex];
  const speech = useSpeechHitCounter(phase === 'say', currentCue.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 450 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const busyRef = useRef(false);

  const playPattern = (p: SeqCue[]) => {
    busyRef.current = true;
    setPhase('listen');
    setStepIndex(0);
    setActiveLight(-1);
    let i = 0;
    const flash = () => {
      if (i >= p.length) {
        setTimeout(() => {
          setPhase('say');
          setStepIndex(0);
          setActiveLight(0);
          speech.resetHits();
          burstRef.current.reset();
          busyRef.current = false;
          speakGame('Repeat the light pattern!');
        }, 400);
        return;
      }
      setActiveLight(i);
      speakGame(p[i].speak);
      i += 1;
      setTimeout(flash, 850);
    };
    flash();
  };

  useEffect(() => {
    speakGame('Watch the light pattern!');
    playPattern(PATTERNS[0]);
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setPatternIndex(0);
    setPatternsDone(0);
    roundDoneRef.current = false;
    playPattern(PATTERNS[0]);
  }, [session.round]);

  useEffect(() => {
    if (phase !== 'say' || session.gameFinished || roundDoneRef.current || busyRef.current) return;
    const tick = setInterval(() => {
      setActiveLight(stepIndex);
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
      if (nextStep < pattern.length) {
        setStepIndex(nextStep);
        setProgress(0);
        busyRef.current = false;
        return;
      }
      setPhase('success');
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      setTimeout(() => {
        const nextP = patternsDone + 1;
        setPatternsDone(nextP);
        if (nextP >= PATTERNS_PER_ROUND) {
          roundDoneRef.current = true;
          setTimeout(() => session.completeRound(), 800);
        } else {
          const nextPi = patternIndex + 1;
          setPatternIndex(nextPi);
          playPattern(PATTERNS[nextPi % PATTERNS.length]);
        }
        busyRef.current = false;
      }, 500);
    }, 50);
    return () => clearInterval(tick);
  }, [phase, session, currentCue, stepIndex, pattern, patternsDone, patternIndex, speech.useSpeech]);

  return (
    <>
      <VoiceGameFrame
        title="Sound Pattern Lights"
        subtitle="Repeat the sound order"
        skills="💡 Working memory • 🔢 Order • 👂 Sequence"
        gradient={['#1E293B', '#334155']}
        accent="#38BDF8"
        onBack={onBack}
        progress={patternsDone}
        progressTotal={PATTERNS_PER_ROUND}
        roundLabel={`Patterns ${patternsDone}/${PATTERNS_PER_ROUND} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <View style={styles.lights}>
                {pattern.map((c, i) => (
                  <View
                    key={`${c.label}-${i}`}
                    style={[
                      styles.light,
                      { backgroundColor: LIGHT_COLORS[i % LIGHT_COLORS.length] },
                      (activeLight === i || (phase === 'say' && stepIndex === i)) && styles.lightOn,
                    ]}
                  >
                    <Text style={styles.lightLabel}>{c.label}</Text>
                  </View>
                ))}
              </View>
              {phase === 'say' && (
                <View style={styles.bar}>
                  <View style={[styles.fill, { width: `${progress * 100}%` }]} />
                </View>
              )}
              <Text style={styles.hint}>{phase === 'listen' ? 'Watch & listen…' : `Say: ${currentCue.label}`}</Text>
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
  lights: { flexDirection: 'row', gap: 14 },
  light: {
    width: 72,
    height: 72,
    borderRadius: 16,
    opacity: 0.35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightOn: { opacity: 1, borderWidth: 3, borderColor: '#FFF' },
  lightLabel: { fontWeight: '900', color: '#FFF', fontSize: 18 },
  bar: {
    width: '80%',
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    marginTop: 24,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#38BDF8', borderRadius: 6 },
  hint: { marginTop: 12, color: '#E2E8F0', fontWeight: '700' },
});
