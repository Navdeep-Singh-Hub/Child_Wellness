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
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = {
  onBack: () => void;
  onComplete?: () => void;
};

const HOLD_MS = 2500;

export function VoiceMatchLightGame({ onBack, onComplete }: Props) {
  const session = useVoiceGameSession('voice-match-light', DEFAULT_VOICE_ROUNDS);
  const [holdProgress, setHoldProgress] = useState(0);
  const [lit, setLit] = useState(false);
  const holdStartRef = useRef<number | null>(null);
  const glow = useRef(new Animated.Value(0.15)).current;
  const voiceRef = useRef({ level: 0, active: false });

  useEffect(() => {
    speakGame('Hold your voice to keep the light glowing!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setHoldProgress(0);
    setLit(false);
    holdStartRef.current = null;
    glow.setValue(0.15);
    speakGame('Keep making sound until the light stays bright!');
  }, [session.round, glow]);

  useEffect(() => {
    const tick = setInterval(() => {
      const { level, active } = voiceRef.current;
      if (!active || session.gameFinished || lit) {
        holdStartRef.current = null;
        setHoldProgress(0);
        Animated.timing(glow, { toValue: 0.15, duration: 200, useNativeDriver: false }).start();
        return;
      }
      if (level >= VOICE_ACTIVE_THRESHOLD) {
        const now = Date.now();
        if (!holdStartRef.current) holdStartRef.current = now;
        const held = now - holdStartRef.current;
        const pct = Math.min(1, held / HOLD_MS);
        setHoldProgress(pct);
        Animated.timing(glow, {
          toValue: 0.2 + pct * 0.85,
          duration: 100,
          useNativeDriver: false,
        }).start();
        if (held >= HOLD_MS) {
          setLit(true);
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {}
          speakGame('The light is glowing! Great sustained voice!');
          setTimeout(() => session.completeRound(), 1000);
        }
      } else {
        holdStartRef.current = null;
        setHoldProgress(0);
        Animated.timing(glow, { toValue: 0.15, duration: 150, useNativeDriver: false }).start();
      }
    }, 50);
    return () => clearInterval(tick);
  }, [session.gameFinished, lit, glow, session]);

  const bg = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(253,224,71,0.1)', 'rgba(253,224,71,0.95)'],
  });

  return (
    <>
      <VoiceGameFrame
        title="Voice Match Light"
        subtitle="Hold your voice to keep the light on"
        skills="💡 Sustained phonation • 🗣️ Voice control • ⏱️ Endurance"
        gradient={['#422006', '#713F12']}
        accent="#FACC15"
        onBack={onBack}
        progress={session.round}
        progressTotal={session.rounds}
        roundLabel={`Light ${session.round} / ${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Animated.View style={[styles.bulbGlow, { backgroundColor: bg }]}>
                <Text style={styles.bulb}>{lit ? '💡' : '🔦'}</Text>
              </Animated.View>
              <View style={styles.holdBar}>
                <View style={[styles.holdFill, { width: `${holdProgress * 100}%` }]} />
              </View>
              <Text style={styles.hint}>
                {lit ? 'Bright!' : 'Keep your voice going…'}
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
  bulbGlow: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulb: { fontSize: 88 },
  holdBar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    marginTop: 28,
    overflow: 'hidden',
  },
  holdFill: { height: '100%', backgroundColor: '#FACC15', borderRadius: 8 },
  hint: { marginTop: 14, color: '#FEF08A', fontWeight: '800', fontSize: 16 },
});
