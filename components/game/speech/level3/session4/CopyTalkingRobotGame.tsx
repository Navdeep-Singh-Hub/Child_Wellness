import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  useSyllableGameSession,
  DEFAULT_VOICE_ROUNDS,
  tickSyllableMatch,
  useSpeechHitCounter,
  createBurstDetector,
  type SyllableCue,
  SYLLABLE_MA,
  SYLLABLE_PA,
  SYLLABLE_MOO,
  SYLLABLE_PEE,
  SYLLABLE_BA,
} from '@/components/game/speech/level3/shared/syllableGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROBOT_SYLLABLES: SyllableCue[] = [
  SYLLABLE_MA,
  SYLLABLE_PA,
  SYLLABLE_BA,
  SYLLABLE_MOO,
  SYLLABLE_PEE,
];

type Phase = 'robot' | 'child' | 'success';

export function CopyTalkingRobotGame({ onBack, onComplete }: Props) {
  const session = useSyllableGameSession('copy-talking-robot', DEFAULT_VOICE_ROUNDS);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(0);
  const [phase, setPhase] = useState<Phase>('robot');
  const [progress, setProgress] = useState(0);
  const cue = ROBOT_SYLLABLES[index % ROBOT_SYLLABLES.length];
  const speech = useSpeechHitCounter(phase === 'child', cue.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 500 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const busyRef = useRef(false);

  const playRobot = (c: SyllableCue) => {
    busyRef.current = true;
    setPhase('robot');
    setProgress(0);
    holdRef.current = null;
    speakGame(c.speak);
    scheduleGameSpeech('Your turn!', 1200);
    setTimeout(() => {
      setPhase('child');
      speech.resetHits();
      burstRef.current.reset();
      busyRef.current = false;
    }, 1300);
  };

  useEffect(() => {
    speakGame('Copy the talking robot!');
    playRobot(ROBOT_SYLLABLES[0]);
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setIndex(0);
    setDone(0);
    roundDoneRef.current = false;
    playRobot(ROBOT_SYLLABLES[0]);
  }, [session.round]);

  useEffect(() => {
    if (phase !== 'child' || session.gameFinished || roundDoneRef.current || busyRef.current) return;
    const tick = setInterval(() => {
      const { progress: p, matched } = tickSyllableMatch(
        cue,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
        cue.mode === 'hold' ? 850 : 700,
      );
      setProgress(p);
      if (!matched) return;
      busyRef.current = true;
      setPhase('success');
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      speakGame('Robot happy!');
      setTimeout(() => {
        const nextDone = done + 1;
        setDone(nextDone);
        if (nextDone >= ROBOT_SYLLABLES.length) {
          roundDoneRef.current = true;
          setTimeout(() => session.completeRound(), 800);
        } else {
          const nextIdx = index + 1;
          setIndex(nextIdx);
          playRobot(ROBOT_SYLLABLES[nextIdx]);
        }
      }, 600);
    }, 50);
    return () => clearInterval(tick);
  }, [phase, session, cue, index, done, speech.useSpeech]);

  return (
    <>
      <VoiceGameFrame
        title="Copy the Talking Robot"
        subtitle="Repeat the robot’s syllables"
        skills="🤖 Auditory-motor • 👂 Listen & copy • 🗣️ Syllables"
        gradient={['#E0E7FF', '#C7D2FE']}
        accent="#4F46E5"
        onBack={onBack}
        progress={done}
        progressTotal={ROBOT_SYLLABLES.length}
        roundLabel={`Copied ${done}/${ROBOT_SYLLABLES.length} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Text style={styles.robot}>🤖</Text>
              <Text style={styles.phase}>
                {phase === 'robot' ? 'Listen…' : phase === 'child' ? `You say: ${cue.label}` : '✓'}
              </Text>
              <Text style={styles.syllable}>{cue.label}</Text>
              {phase === 'child' && (
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
  robot: { fontSize: 88 },
  phase: { fontSize: 18, fontWeight: '800', color: '#4338CA', marginTop: 8 },
  syllable: { fontSize: 52, fontWeight: '900', color: '#312E81', marginTop: 12 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#6366F1', borderRadius: 8 },
});
