import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useWordGameSession,
  DEFAULT_VOICE_ROUNDS,
  WORD_BALL,
  tickWordMatch,
  useSpeechHitCounter,
  createBurstDetector,
} from '@/components/game/speech/level3/shared/wordGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ACTIVATIONS = 4;

export function SayBallGame({ onBack, onComplete }: Props) {
  const session = useWordGameSession('say-ball', DEFAULT_VOICE_ROUNDS);
  const [hits, setHits] = useState(0);
  const [progress, setProgress] = useState(0);
  const speech = useSpeechHitCounter(true, WORD_BALL.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 500 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const ballY = useRef(new Animated.Value(0)).current;
  const ballScale = useRef(new Animated.Value(1)).current;
  const roundDoneRef = useRef(false);
  const lockRef = useRef(false);

  useEffect(() => {
    speakGame('Say ball to play!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setHits(0);
    setProgress(0);
    roundDoneRef.current = false;
    lockRef.current = false;
    burstRef.current.reset();
    holdRef.current = null;
    speech.resetHits();
    ballY.setValue(0);
    ballScale.setValue(1);
    speakGame('Say ball!');
  }, [session.round, ballY, ballScale]);

  const bounceBall = () => {
    if (roundDoneRef.current || lockRef.current) return;
    lockRef.current = true;
    holdRef.current = null;
    setProgress(0);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    speakGame('Ball!');
    Animated.parallel([
      Animated.sequence([
        Animated.timing(ballY, { toValue: -80, duration: 220, useNativeDriver: true }),
        Animated.timing(ballY, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(ballScale, { toValue: 1.2, duration: 110, useNativeDriver: true }),
        Animated.timing(ballScale, { toValue: 1, duration: 110, useNativeDriver: true }),
      ]),
    ]).start();
    setHits((h) => {
      const next = h + 1;
      if (next >= ACTIVATIONS) {
        roundDoneRef.current = true;
        speakGame('Great ball game!');
        setTimeout(() => session.completeRound(), 900);
      }
      return next;
    });
    setTimeout(() => {
      lockRef.current = false;
    }, 600);
  };

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current || lockRef.current) return;
      const { progress: p, matched } = tickWordMatch(
        WORD_BALL,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
        600,
      );
      setProgress(p);
      if (matched) bounceBall();
    }, 50);
    return () => clearInterval(tick);
  }, [session, speech.useSpeech]);

  return (
    <>
      <VoiceGameFrame
        title='Say "Ball"'
        subtitle="Word activates the game"
        skills="⚽ Word association • 🗣️ Ball • 🎮 Play"
        gradient={['#DBEAFE', '#BFDBFE']}
        accent="#2563EB"
        onBack={onBack}
        progress={hits}
        progressTotal={ACTIVATIONS}
        roundLabel={`Ball ${hits}/${ACTIVATIONS} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Animated.Text
                style={[
                  styles.ball,
                  { transform: [{ translateY: ballY }, { scale: ballScale }] },
                ]}
              >
                ⚽
              </Animated.Text>
              <Text style={styles.word}>Ball</Text>
              <View style={styles.bar}>
                <View style={[styles.fill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.hint}>Say “Ball!” to bounce it</Text>
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
  ball: { fontSize: 96 },
  word: { fontSize: 44, fontWeight: '900', color: '#1D4ED8', marginTop: 16 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 8 },
  hint: { marginTop: 10, fontWeight: '800', color: '#1E40AF' },
});
