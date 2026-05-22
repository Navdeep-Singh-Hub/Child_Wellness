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

const WAKE_HOLD_MS = 1400;

export function WakeTheMonsterGame({ onBack, onComplete }: Props) {
  const session = useVoiceGameSession('wake-the-monster', DEFAULT_VOICE_ROUNDS);
  const [awake, setAwake] = useState(false);
  const [wakeProgress, setWakeProgress] = useState(0);
  const holdStartRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const monsterScale = useRef(new Animated.Value(1)).current;
  const monsterY = useRef(new Animated.Value(0)).current;
  const zzzOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    speakGame('Say aaa to wake the sleeping monster!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    if (session.gameFinished) return;
    setAwake(false);
    roundDoneRef.current = false;
    holdStartRef.current = null;
    setWakeProgress(0);
    holdStartRef.current = null;
    monsterScale.setValue(1);
    monsterY.setValue(0);
    zzzOpacity.setValue(1);
    speakGame('Make a long aaa sound to wake the monster!');
  }, [session.round, session.gameFinished, monsterScale, monsterY, zzzOpacity]);

  useEffect(() => {
    const tick = setInterval(() => {
      const { level, active } = voiceRef.current;
      if (session.gameFinished || awake || roundDoneRef.current || !active) {
        holdStartRef.current = null;
        setWakeProgress(0);
        return;
      }
      if (level < VOICE_ACTIVE_THRESHOLD) {
        holdStartRef.current = null;
        setWakeProgress(0);
        return;
      }
      const now = Date.now();
      if (!holdStartRef.current) holdStartRef.current = now;
      const held = now - holdStartRef.current;
      const pct = Math.min(1, held / WAKE_HOLD_MS);
      setWakeProgress(pct);
      if (held >= WAKE_HOLD_MS) {
        roundDoneRef.current = true;
        setAwake(true);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        speakGame('The monster woke up! Great voice!');
        zzzOpacity.setValue(0);
        Animated.parallel([
          Animated.spring(monsterScale, { toValue: 1.15, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(monsterY, { toValue: -18, duration: 200, useNativeDriver: true }),
            Animated.timing(monsterY, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]),
        ]).start();
        setTimeout(() => session.completeRound(), 1200);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [session.gameFinished, awake, monsterScale, monsterY, zzzOpacity, session]);

  return (
    <>
      <VoiceGameFrame
        title="Wake the Monster"
        subtitle="Say “aaa” to wake the sleeping monster"
        skills="🗣️ Voice initiation • 🔊 Vocal play • 👂 Cause & effect"
        gradient={['#1E1B4B', '#4C1D95']}
        accent="#A78BFA"
        onBack={onBack}
        progress={session.round}
        progressTotal={session.rounds}
        roundLabel={`Monster ${session.round} / ${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <View style={styles.cave}>
                <Animated.Text style={[styles.zzz, { opacity: zzzOpacity }]}>💤 💤 💤</Animated.Text>
                <Animated.View
                  style={{
                    transform: [{ scale: monsterScale }, { translateY: monsterY }],
                  }}
                >
                  <Text style={styles.monster}>{awake ? '😄' : '😴'}</Text>
                  <Text style={styles.monsterLabel}>{awake ? 'Awake!' : 'Sleeping…'}</Text>
                </Animated.View>
                <View style={styles.wakeBar}>
                  <View style={[styles.wakeFill, { width: `${wakeProgress * 100}%` }]} />
                </View>
                <Text style={styles.hint}>
                  {awake ? '🎉 You used your voice!' : 'Hold “aaa” until the bar fills'}
                </Text>
              </View>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cave: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  zzz: { fontSize: 28, marginBottom: 8 },
  monster: { fontSize: 100, textAlign: 'center' },
  monsterLabel: { fontSize: 22, fontWeight: '900', color: '#E9D5FF', textAlign: 'center' },
  wakeBar: {
    width: '100%',
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  wakeFill: { height: '100%', backgroundColor: '#A78BFA', borderRadius: 8 },
  hint: { marginTop: 12, color: '#DDD6FE', fontWeight: '700', fontSize: 15, textAlign: 'center' },
});
