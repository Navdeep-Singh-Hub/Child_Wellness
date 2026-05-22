import {
  clearGameSpeech,
  DEFAULT_VOICE_ROUNDS,
  speakGame,
  useVoiceGameSession,
  VOICE_LOUD_THRESHOLD,
  VoiceGameFrame,
  VoiceGameOverlays,
} from '@/components/game/speech/level3/shared/voiceGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = {
  onBack: () => void;
  onComplete?: () => void;
};

const TARGET_Y = 0.12;
const HOLD_AT_TOP_MS = 900;

export function VoiceRocketGame({ onBack, onComplete }: Props) {
  const session = useVoiceGameSession('voice-rocket', DEFAULT_VOICE_ROUNDS);
  const [reachedTop, setReachedTop] = useState(false);
  const rocketY = useRef(new Animated.Value(1)).current;
  const topHoldRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });

  useEffect(() => {
    speakGame('Use a louder voice to lift the rocket!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setReachedTop(false);
    topHoldRef.current = null;
    rocketY.setValue(1);
    speakGame('Louder voice makes the rocket go higher!');
  }, [session.round, rocketY]);

  useEffect(() => {
    const tick = setInterval(() => {
      const { level, active } = voiceRef.current;
      if (session.gameFinished || reachedTop || !active) return;
      const lift = Math.max(0, (level - 0.08) / 0.55);
      const target = 1 - lift * 0.88;
      Animated.timing(rocketY, {
        toValue: target,
        duration: 80,
        useNativeDriver: true,
      }).start();

      if (target <= TARGET_Y + 0.05 && level >= VOICE_LOUD_THRESHOLD) {
        const now = Date.now();
        if (!topHoldRef.current) topHoldRef.current = now;
        if (now - topHoldRef.current >= HOLD_AT_TOP_MS) {
          setReachedTop(true);
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          } catch {}
          speakGame('Rocket reached the stars!');
          setTimeout(() => session.completeRound(), 1000);
        }
      } else {
        topHoldRef.current = null;
      }
    }, 50);
    return () => clearInterval(tick);
  }, [session.gameFinished, reachedTop, rocketY, session]);

  const translateY = rocketY.interpolate({
    inputRange: [0, 1],
    outputRange: ['8%', '78%'],
  });

  return (
    <>
      <VoiceGameFrame
        title="Voice Rocket"
        subtitle="Louder voice → rocket rises"
        skills="📢 Vocal intensity • 🎚️ Volume control • 🚀 Fun feedback"
        gradient={['#0C4A6E', '#0369A1']}
        accent="#38BDF8"
        onBack={onBack}
        progress={session.round}
        progressTotal={session.rounds}
        roundLabel={`Launch ${session.round} / ${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.scene}>
              <View style={styles.targetZone}>
                <Text style={styles.targetLabel}>⭐ Star zone</Text>
              </View>
              <Animated.View style={[styles.rocketWrap, { transform: [{ translateY }] }]}>
                <Text style={styles.rocket}>🚀</Text>
              </Animated.View>
              <Text style={styles.hint}>
                {reachedTop ? 'Blast off!' : 'Get louder to reach the stars!'}
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
  scene: { flex: 1, position: 'relative' },
  targetZone: {
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    height: 56,
    borderWidth: 2,
    borderColor: '#FCD34D',
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(252,211,77,0.15)',
  },
  targetLabel: { color: '#FDE68A', fontWeight: '800' },
  rocketWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  rocket: { fontSize: 72 },
  hint: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#BAE6FD',
    fontWeight: '800',
    fontSize: 16,
  },
});
