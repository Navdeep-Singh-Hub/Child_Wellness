import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useBilabialGameSession,
  DEFAULT_VOICE_ROUNDS,
  createBurstDetector,
  useSpeechHitCounter,
} from '@/components/game/speech/level3/shared/bilabialGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const BOUNCES_NEEDED = 5;

export function BallBounceBuhGame({ onBack, onComplete }: Props) {
  const session = useBilabialGameSession('ball-bounce-buh', DEFAULT_VOICE_ROUNDS);
  const [bounces, setBounces] = useState(0);
  const burstRef = useRef(createBurstDetector({ minDelta: 0.1, minLevel: 0.18, cooldownMs: 550 }));
  const speech = useSpeechHitCounter(true, ['buh', 'b', 'ba', 'ball', 'boo']);
  const voiceRef = useRef({ level: 0, active: false });
  const ballY = useRef(new Animated.Value(0)).current;
  const roundDoneRef = useRef(false);

  useEffect(() => {
    speakGame('Say buh to make the ball bounce!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setBounces(0);
    roundDoneRef.current = false;
    burstRef.current.reset();
    speech.resetHits();
    ballY.setValue(0);
    speakGame('Buh! Each sound makes the ball jump!');
  }, [session.round, ballY]);

  const bounceBall = () => {
    if (roundDoneRef.current) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    Animated.sequence([
      Animated.timing(ballY, { toValue: -120, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(ballY, { toValue: 0, duration: 280, easing: Easing.bounce, useNativeDriver: true }),
    ]).start();
    setBounces((b) => {
      const next = b + 1;
      if (next >= BOUNCES_NEEDED) {
        roundDoneRef.current = true;
        speakGame('Super buh bounces!');
        setTimeout(() => session.completeRound(), 900);
      }
      return next;
    });
  };

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current) return;
      const v = voiceRef.current;
      if (speech.useSpeech && speech.consumeHit()) {
        bounceBall();
        return;
      }
      if (burstRef.current.tick(v.level, v.active)) bounceBall();
    }, 50);
    return () => clearInterval(tick);
  }, [session, speech.useSpeech, ballY]);

  return (
    <>
      <VoiceGameFrame
        title='Ball Bounce "Buh"'
        subtitle='Say “buh” to bounce the ball'
        skills="⚽ Voiced B • 👄 Bilabial • 🗣️ Consonant"
        gradient={['#FFEDD5', '#FED7AA']}
        accent="#EA580C"
        onBack={onBack}
        progress={bounces}
        progressTotal={BOUNCES_NEEDED}
        roundLabel={`Bounces ${bounces}/${BOUNCES_NEEDED} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.scene}>
              <View style={styles.ground} />
              <Animated.Text style={[styles.ball, { transform: [{ translateY: ballY }] }]}>
                ⚽
              </Animated.Text>
              <Text style={styles.hint}>Say “Buh!”</Text>
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
  scene: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 48 },
  ground: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    height: 8,
    backgroundColor: '#9A3412',
    borderRadius: 4,
  },
  ball: { fontSize: 72, marginBottom: 48 },
  hint: { fontSize: 18, fontWeight: '900', color: '#C2410C', marginTop: 16 },
});
