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
  ONE_SOUND_POOL,
  type SeqCue,
} from '@/components/game/speech/level3/shared/sequenceGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Phase = 'listen' | 'say' | 'success';

const COPIES_PER_ROUND = 4;

export function CopyOneSoundGame({ onBack, onComplete }: Props) {
  const session = useSequenceSession('copy-one-sound', DEFAULT_VOICE_ROUNDS);
  const [index, setIndex] = useState(0);
  const [copies, setCopies] = useState(0);
  const [phase, setPhase] = useState<Phase>('listen');
  const [progress, setProgress] = useState(0);
  const cue: SeqCue = ONE_SOUND_POOL[index % ONE_SOUND_POOL.length];
  const speech = useSpeechHitCounter(phase === 'say', cue.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 500 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const busyRef = useRef(false);

  const playModel = (c: SeqCue) => {
    busyRef.current = true;
    setPhase('listen');
    setProgress(0);
    playSoundSequence([c], () => {
      setPhase('say');
      speech.resetHits();
      burstRef.current.reset();
      holdRef.current = null;
      busyRef.current = false;
    }, 400);
  };

  useEffect(() => {
    speakGame('Copy one sound!');
    playModel(ONE_SOUND_POOL[0]);
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setIndex(0);
    setCopies(0);
    roundDoneRef.current = false;
    playModel(ONE_SOUND_POOL[0]);
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
      speakGame('Great copy!');
      setTimeout(() => {
        const next = copies + 1;
        setCopies(next);
        if (next >= COPIES_PER_ROUND) {
          roundDoneRef.current = true;
          setTimeout(() => session.completeRound(), 800);
        } else {
          const nextIdx = index + 1;
          setIndex(nextIdx);
          playModel(ONE_SOUND_POOL[nextIdx % ONE_SOUND_POOL.length]);
        }
        busyRef.current = false;
      }, 600);
    }, 50);
    return () => clearInterval(tick);
  }, [phase, session, cue, copies, index, speech.useSpeech]);

  return (
    <>
      <VoiceGameFrame
        title="Copy 1 Sound"
        subtitle="Hear → repeat one sound"
        skills="👂 Immediate imitation • 🗣️ Copy • ⚡ Memory"
        gradient={['#E0E7FF', '#C7D2FE']}
        accent="#4F46E5"
        onBack={onBack}
        progress={copies}
        progressTotal={COPIES_PER_ROUND}
        roundLabel={`Copied ${copies}/${COPIES_PER_ROUND} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Text style={styles.icon}>{phase === 'listen' ? '👂' : '🎤'}</Text>
              <Text style={styles.label}>{cue.label}</Text>
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
  icon: { fontSize: 72 },
  label: { fontSize: 48, fontWeight: '900', color: '#4338CA', marginTop: 12 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 24,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#6366F1', borderRadius: 8 },
});
