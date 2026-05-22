import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  useSequenceSession,
  DEFAULT_VOICE_ROUNDS,
  VOICE_ACTIVE_THRESHOLD,
  SEQ_MA,
  SEQ_PA,
  type SeqCue,
} from '@/components/game/speech/level3/shared/sequenceGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Phase = 'demo' | 'copy' | 'success';

const BEATS = 4;
const BEAT_MS = 700;
const WINDOW_MS = 900;

const RHYTHM_CUES: SeqCue[] = [SEQ_MA, SEQ_MA, SEQ_PA, SEQ_MA];

export function RhythmRepeatGame({ onBack, onComplete }: Props) {
  const session = useSequenceSession('rhythm-repeat', DEFAULT_VOICE_ROUNDS);
  const [phase, setPhase] = useState<Phase>('demo');
  const [beatIndex, setBeatIndex] = useState(0);
  const [beatsDone, setBeatsDone] = useState(0);
  const [lit, setLit] = useState(-1);
  const voiceRef = useRef({ level: 0, active: false });
  const beatStartRef = useRef(0);
  const roundDoneRef = useRef(false);
  const drumScale = useRef(new Animated.Value(1)).current;
  const roundsRef = useRef(0);

  const pulse = () => {
    Animated.sequence([
      Animated.timing(drumScale, { toValue: 1.2, duration: 80, useNativeDriver: true }),
      Animated.timing(drumScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const runDemo = () => {
    setPhase('demo');
    setBeatIndex(0);
    setBeatsDone(0);
    let i = 0;
    const tick = () => {
      if (i >= BEATS) {
        scheduleGameSpeech('Now you copy the rhythm!', 400);
        setTimeout(() => {
          setPhase('copy');
          setBeatIndex(0);
          setBeatsDone(0);
          beatStartRef.current = Date.now();
          setLit(0);
          speakGame(RHYTHM_CUES[0].speak);
          pulse();
        }, 600);
        return;
      }
      setLit(i);
      speakGame(RHYTHM_CUES[i].speak);
      pulse();
      i += 1;
      setTimeout(tick, BEAT_MS);
    };
    tick();
  };

  useEffect(() => {
    speakGame('Copy the speech rhythm!');
    runDemo();
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    roundDoneRef.current = false;
    roundsRef.current = 0;
    runDemo();
  }, [session.round]);

  useEffect(() => {
    if (phase !== 'copy' || session.gameFinished || roundDoneRef.current) return;
    const tick = setInterval(() => {
      const now = Date.now();
      const elapsed = now - beatStartRef.current;
      const v = voiceRef.current;
      if (elapsed > WINDOW_MS) {
        setLit(-1);
        speakGame('Try the rhythm again!');
        setTimeout(runDemo, 800);
        return;
      }
      if (v.active && v.level >= VOICE_ACTIVE_THRESHOLD && elapsed > 80) {
        const next = beatsDone + 1;
        setBeatsDone(next);
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}
        if (next >= BEATS) {
          roundDoneRef.current = true;
          setPhase('success');
          speakGame('Perfect rhythm!');
          setTimeout(() => session.completeRound(), 900);
          return;
        }
        const ni = beatIndex + 1;
        setBeatIndex(ni);
        setBeatsDone(next);
        beatStartRef.current = now;
        setLit(ni);
        speakGame(RHYTHM_CUES[ni].speak);
        pulse();
      }
    }, 40);
    return () => clearInterval(tick);
  }, [phase, beatIndex, beatsDone, session, drumScale]);

  return (
    <>
      <VoiceGameFrame
        title="Rhythm Repeat"
        subtitle="Match the speech rhythm"
        skills="🥁 Timing • 👂 Listen & copy • 🎵 Rhythm"
        gradient={['#FEF3C7', '#FDE68A']}
        accent="#D97706"
        onBack={onBack}
        progress={beatsDone}
        progressTotal={BEATS}
        roundLabel={`Beats ${beatsDone}/${BEATS} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Animated.Text style={[styles.drum, { transform: [{ scale: drumScale }] }]}>
                🥁
              </Animated.Text>
              <View style={styles.dots}>
                {RHYTHM_CUES.map((_, i) => (
                  <View key={i} style={[styles.dot, lit === i && styles.dotOn]} />
                ))}
              </View>
              <Text style={styles.hint}>
                {phase === 'demo' ? 'Listen to the rhythm…' : 'Say each beat on time!'}
              </Text>
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
  drum: { fontSize: 72 },
  dots: { flexDirection: 'row', gap: 12, marginTop: 24 },
  dot: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.15)' },
  dotOn: { backgroundColor: '#F59E0B', transform: [{ scale: 1.3 }] },
  hint: { marginTop: 16, fontWeight: '800', color: '#92400E' },
});
