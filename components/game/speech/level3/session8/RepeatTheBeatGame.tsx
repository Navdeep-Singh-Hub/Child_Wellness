import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  useListenRepeatSession,
  DEFAULT_VOICE_ROUNDS,
  VOICE_ACTIVE_THRESHOLD,
  SEQ_MA,
  SEQ_PA,
  SEQ_MOO,
  type SeqCue,
} from '@/components/game/speech/level3/shared/listenRepeatGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Phase = 'demo' | 'copy';

const BEATS = 4;
const BEAT_MS = 750;
const WINDOW_MS = 950;

/** Prosody pattern: long-short-long-hold */
const PROSODY: SeqCue[] = [SEQ_MA, SEQ_PA, SEQ_MA, SEQ_MOO];

export function RepeatTheBeatGame({ onBack, onComplete }: Props) {
  const session = useListenRepeatSession('repeat-the-beat', DEFAULT_VOICE_ROUNDS);
  const [phase, setPhase] = useState<Phase>('demo');
  const [lit, setLit] = useState(-1);
  const [beatsDone, setBeatsDone] = useState(0);
  const voiceRef = useRef({ level: 0, active: false });
  const beatStartRef = useRef(0);
  const roundDoneRef = useRef(false);
  const wave = useRef(new Animated.Value(0)).current;

  const pulseWave = () => {
    wave.setValue(0);
    Animated.timing(wave, { toValue: 1, duration: BEAT_MS, useNativeDriver: true }).start();
  };

  const runDemo = () => {
    setPhase('demo');
    setBeatsDone(0);
    setLit(-1);
    let i = 0;
    const tick = () => {
      if (i >= BEATS) {
        scheduleGameSpeech('Copy the beat with your voice!', 400);
        setTimeout(() => {
          setPhase('copy');
          setBeatsDone(0);
          setLit(0);
          beatStartRef.current = Date.now();
          speakGame(PROSODY[0].speak);
          pulseWave();
        }, 600);
        return;
      }
      setLit(i);
      speakGame(PROSODY[i].speak);
      pulseWave();
      i += 1;
      setTimeout(tick, BEAT_MS);
    };
    tick();
  };

  useEffect(() => {
    speakGame('Repeat the rhythmic syllables!');
    runDemo();
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    roundDoneRef.current = false;
    runDemo();
  }, [session.round]);

  useEffect(() => {
    if (phase !== 'copy' || session.gameFinished || roundDoneRef.current) return;
    const tick = setInterval(() => {
      const elapsed = Date.now() - beatStartRef.current;
      const v = voiceRef.current;
      if (elapsed > WINDOW_MS) {
        setLit(-1);
        speakGame('Try the beat again!');
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
          speakGame('Beautiful prosody!');
          setTimeout(() => session.completeRound(), 900);
          return;
        }
        setLit(next);
        beatStartRef.current = Date.now();
        speakGame(PROSODY[next].speak);
        pulseWave();
      }
    }, 50);
    return () => clearInterval(tick);
  }, [phase, session, beatsDone]);

  const waveH = wave.interpolate({ inputRange: [0, 1], outputRange: [8, 48] });

  return (
    <>
      <VoiceGameFrame
        title="Repeat the Beat"
        subtitle="Rhythmic syllables"
        skills="🎵 Prosody • 🥁 Rhythm • 🗣️ Syllables"
        gradient={['#FCE7F3', '#FBCFE8']}
        accent="#DB2777"
        onBack={onBack}
        progress={phase === 'copy' ? beatsDone : 0}
        progressTotal={BEATS}
        roundLabel={`Beat ${phase === 'copy' ? beatsDone : 0}/${BEATS} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <View style={styles.waveRow}>
                {PROSODY.map((c, i) => (
                  <View key={i} style={styles.beatCol}>
                    <Animated.View
                      style={[
                        styles.waveBar,
                        { height: lit === i ? waveH : 12 },
                        lit === i && styles.waveLit,
                      ]}
                    />
                    <Text style={[styles.syl, lit === i && styles.sylLit]}>{c.label}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.hint}>
                {phase === 'demo' ? 'Listen to the beat…' : 'Say each syllable on the beat!'}
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
  waveRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-end', height: 100 },
  beatCol: { alignItems: 'center' },
  waveBar: { width: 28, backgroundColor: 'rgba(219,39,119,0.25)', borderRadius: 6 },
  waveLit: { backgroundColor: '#EC4899' },
  syl: { fontSize: 18, fontWeight: '800', color: '#9D174D', marginTop: 8 },
  sylLit: { color: '#BE185D', fontSize: 22 },
  hint: { marginTop: 24, fontSize: 18, fontWeight: '800', color: '#9D174D' },
});
