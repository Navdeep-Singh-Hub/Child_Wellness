import {
  clearGameSpeech,
  DEFAULT_VOICE_ROUNDS,
  speakGame,
  useVoiceGameSession,
  VOICE_ACTIVE_THRESHOLD,
  VoiceGameFrame,
  VoiceGameOverlays,
} from '@/components/game/speech/level3/shared/voiceGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

type Props = {
  onBack: () => void;
  onComplete?: () => void;
};

type Ripple = { id: number; scale: Animated.Value; opacity: Animated.Value };

const ECHOES_NEEDED = 5;
const SPIKE_COOLDOWN_MS = 700;

export function EchoCaveGame({ onBack, onComplete }: Props) {
  const session = useVoiceGameSession('echo-cave', DEFAULT_VOICE_ROUNDS);
  const [echoCount, setEchoCount] = useState(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const idRef = useRef(0);
  const lastSpikeRef = useRef(0);
  const prevLevelRef = useRef(0);
  const voiceRef = useRef({ level: 0, active: false });

  useEffect(() => {
    speakGame('Make a sound in the cave and hear the echo!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setEchoCount(0);
    setRipples([]);
    speakGame('Say anything — the cave will echo back!');
  }, [session.round]);

  useEffect(() => {
    const tick = setInterval(() => {
      const { level, active } = voiceRef.current;
      if (!active || session.gameFinished) return;

      const rising =
        level >= VOICE_ACTIVE_THRESHOLD && prevLevelRef.current < VOICE_ACTIVE_THRESHOLD - 0.05;
      prevLevelRef.current = level;

      if (!rising) return;
      const now = Date.now();
      if (now - lastSpikeRef.current < SPIKE_COOLDOWN_MS) return;
      lastSpikeRef.current = now;

      const scale = new Animated.Value(0.2);
      const opacity = new Animated.Value(0.9);
      const ripple: Ripple = { id: idRef.current++, scale, opacity };
      setRipples((r) => [...r.slice(-6), ripple]);

      Animated.parallel([
        Animated.timing(scale, {
          toValue: 2.8,
          duration: 1200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start();

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
      speakGame('Echo!');

      setEchoCount((c) => {
        const next = c + 1;
        if (next >= ECHOES_NEEDED) {
          setTimeout(() => session.completeRound(), 900);
        }
        return next;
      });
    }, 50);
    return () => clearInterval(tick);
  }, [session.gameFinished, session]);

  return (
    <>
      <VoiceGameFrame
        title="Echo Cave"
        subtitle="Make a sound → cave echoes it"
        skills="🔊 Vocal experimentation • 👂 Listening • 🎵 Play"
        gradient={['#134E4A', '#115E59']}
        accent="#2DD4BF"
        onBack={onBack}
        progress={echoCount}
        progressTotal={ECHOES_NEEDED}
        roundLabel={`Echoes ${echoCount} / ${ECHOES_NEEDED} · Cave ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.cave}>
              <Text style={styles.caveEmoji}>🕳️</Text>
              <Text style={styles.title}>Echo Cave</Text>
              {ripples.map((r) => (
                <Animated.View
                  key={r.id}
                  pointerEvents="none"
                  style={[
                    styles.ripple,
                    { opacity: r.opacity, transform: [{ scale: r.scale }] },
                  ]}
                />
              ))}
              <Text style={styles.hint}>Make a sound to create an echo ripple</Text>
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
  cave: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  caveEmoji: { fontSize: 64, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '900', color: '#CCFBF1' },
  ripple: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#5EEAD4',
  },
  hint: { marginTop: 24, color: '#99F6E4', fontWeight: '700', fontSize: 15 },
});
