import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  useBilabialGameSession,
  DEFAULT_VOICE_ROUNDS,
  sustainedVoice,
  useSpeechHitCounter,
  VOICE_ACTIVE_THRESHOLD,
} from '@/components/game/speech/level3/shared/bilabialGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const HOLD_MS = 900;
const CATCHES_PER_ROUND = 3;

type Phase = 'listen' | 'your-turn' | 'success';

export function SoundCatchGame({ onBack, onComplete }: Props) {
  const session = useBilabialGameSession('sound-catch', DEFAULT_VOICE_ROUNDS);
  const [phase, setPhase] = useState<Phase>('listen');
  const [catches, setCatches] = useState(0);
  const [progress, setProgress] = useState(0);
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const speech = useSpeechHitCounter(phase === 'your-turn', ['mmm', 'mm', 'ma', 'mum']);
  const roundDoneRef = useRef(false);
  const catchingRef = useRef(false);

  const playModel = () => {
    catchingRef.current = false;
    setPhase('listen');
    setProgress(0);
    holdRef.current = null;
    speakGame('Mmmmmm');
    scheduleGameSpeech('Now you say mmm!', 1600);
    setTimeout(() => {
      setPhase('your-turn');
      speech.resetHits();
    }, 1700);
  };

  useEffect(() => {
    speakGame('Listen, then copy the sound!');
    playModel();
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setCatches(0);
    roundDoneRef.current = false;
    playModel();
  }, [session.round]);

  useEffect(() => {
    if (phase !== 'your-turn' || session.gameFinished || roundDoneRef.current) return;
    const tick = setInterval(() => {
      const v = voiceRef.current;
      if (speech.useSpeech && speech.consumeHit()) {
        finishCatch();
        return;
      }
      const { progress: p, done } = sustainedVoice(v.level, v.active, HOLD_MS, holdRef, VOICE_ACTIVE_THRESHOLD);
      setProgress(p);
      if (done) finishCatch();
    }, 50);
    return () => clearInterval(tick);
  }, [phase, session, speech.useSpeech]);

  const finishCatch = () => {
    if (catchingRef.current) return;
    catchingRef.current = true;
    holdRef.current = null;
    setProgress(0);
    setPhase('success');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    speakGame('You caught it!');
    setTimeout(() => {
      setCatches((c) => {
        const next = c + 1;
        if (next >= CATCHES_PER_ROUND) {
          roundDoneRef.current = true;
          setTimeout(() => session.completeRound(), 800);
        } else {
          playModel();
        }
        return next;
      });
    }, 700);
  };

  return (
    <>
      <VoiceGameFrame
        title="Sound Catch"
        subtitle="Hear “mmm” → repeat it"
        skills="👂 Auditory imitation • 🅼 Sound M • 🗣️ Listening"
        gradient={['#F3E8FF', '#E9D5FF']}
        accent="#9333EA"
        onBack={onBack}
        progress={catches}
        progressTotal={CATCHES_PER_ROUND}
        roundLabel={`Caught ${catches}/${CATCHES_PER_ROUND} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Text style={styles.icon}>{phase === 'listen' ? '🔊' : phase === 'your-turn' ? '🎤' : '⭐'}</Text>
              <Text style={styles.label}>
                {phase === 'listen' ? 'Listen…' : phase === 'your-turn' ? 'Your turn — say Mmm!' : 'Great!'}
              </Text>
              {phase === 'your-turn' && (
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
  icon: { fontSize: 80 },
  label: { fontSize: 22, fontWeight: '900', color: '#6B21A8', marginTop: 12 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 24,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#A855F7', borderRadius: 8 },
});
