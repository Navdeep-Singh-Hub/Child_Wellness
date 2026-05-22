import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useWordGameSession,
  DEFAULT_VOICE_ROUNDS,
  WORD_MAMA,
  tickWordMatch,
  useSpeechHitCounter,
  createBurstDetector,
} from '@/components/game/speech/level3/shared/wordGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const CALLS_NEEDED = 3;
const HOLD_MS = 1000;

export function CallMamaGame({ onBack, onComplete }: Props) {
  const session = useWordGameSession('call-mama', DEFAULT_VOICE_ROUNDS);
  const [calls, setCalls] = useState(0);
  const [progress, setProgress] = useState(0);
  const speech = useSpeechHitCounter(true, WORD_MAMA.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 600 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const reveal = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0)).current;
  const roundDoneRef = useRef(false);
  const lockRef = useRef(false);

  useEffect(() => {
    speakGame('Call Mama to see her!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setCalls(0);
    setProgress(0);
    roundDoneRef.current = false;
    lockRef.current = false;
    burstRef.current.reset();
    holdRef.current = null;
    speech.resetHits();
    reveal.setValue(0);
    heartScale.setValue(0);
    speakGame('Say Mama!');
  }, [session.round, reveal, heartScale]);

  const onCall = () => {
    if (roundDoneRef.current || lockRef.current) return;
    lockRef.current = true;
    holdRef.current = null;
    setProgress(0);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    speakGame('Mama!');
    const nextReveal = Math.min(1, (calls + 1) / CALLS_NEEDED);
    Animated.spring(reveal, { toValue: nextReveal, useNativeDriver: true }).start();
    if (calls + 1 >= CALLS_NEEDED) {
      Animated.sequence([
        Animated.spring(heartScale, { toValue: 1.2, useNativeDriver: true }),
        Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
      ]).start();
    }
    setCalls((c) => {
      const next = c + 1;
      if (next >= CALLS_NEEDED) {
        roundDoneRef.current = true;
        speakGame('Mama is here! Wonderful!');
        setTimeout(() => session.completeRound(), 1000);
      }
      return next;
    });
    setTimeout(() => {
      lockRef.current = false;
    }, 700);
  };

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current || lockRef.current) return;
      const { progress: p, matched } = tickWordMatch(
        WORD_MAMA,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
        HOLD_MS,
      );
      setProgress(p);
      if (matched) onCall();
    }, 50);
    return () => clearInterval(tick);
  }, [session, speech.useSpeech, calls]);

  const curtainOpacity = reveal.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <>
      <VoiceGameFrame
        title="Call Mama"
        subtitle='Say “Mama” to reveal Mom'
        skills="❤️ Emotional speech • 👩 Mama • 💬 Connection"
        gradient={['#FCE7F3', '#FBCFE8']}
        accent="#DB2777"
        onBack={onBack}
        progress={calls}
        progressTotal={CALLS_NEEDED}
        roundLabel={`Calls ${calls}/${CALLS_NEEDED} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.scene}>
              <View style={styles.stage}>
                <Text style={styles.mamaFull}>👩‍👧</Text>
                <Animated.View style={[styles.curtain, { opacity: curtainOpacity }]}>
                  <Text style={styles.curtainText}>🚪</Text>
                  <Text style={styles.shadow}>?</Text>
                </Animated.View>
              </View>
              <Animated.Text style={[styles.heart, { transform: [{ scale: heartScale }] }]}>
                ❤️
              </Animated.Text>
              <Text style={styles.word}>Mama</Text>
              <View style={styles.bar}>
                <View style={[styles.fill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.hint}>Say “Mama!” clearly</Text>
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
  scene: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stage: { width: 160, height: 140, alignItems: 'center', justifyContent: 'center' },
  mamaFull: { fontSize: 88, position: 'absolute' },
  curtain: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(190,24,93,0.25)',
    borderRadius: 16,
  },
  curtainText: { fontSize: 48 },
  shadow: { fontSize: 40, marginTop: 4 },
  heart: { fontSize: 36, marginTop: 8 },
  word: { fontSize: 40, fontWeight: '900', color: '#BE185D', marginTop: 8 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 16,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#EC4899', borderRadius: 8 },
  hint: { marginTop: 10, fontWeight: '800', color: '#9D174D' },
});
