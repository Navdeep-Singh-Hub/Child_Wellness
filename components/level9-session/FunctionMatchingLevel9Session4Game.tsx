/**
 * Level 9 (Clockwise) — Session 4, Game 3: Function Matching
 * Match tools with their use. One question: "What do we use for cutting?" → Scissors.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const QUESTION = { prompt: 'What do we use for cutting?', correctId: 'scissors', useLabel: 'Cutting' };
const OBJECTS = [
  { id: 'scissors', label: 'Scissors', emoji: '✂️' },
  { id: 'brush', label: 'Brush', emoji: '🖌️' },
  { id: 'key', label: 'Key', emoji: '🔑' },
];

export interface FunctionMatchingLevel9Session4GameProps {
  onComplete: () => void;
}

export function FunctionMatchingLevel9Session4Game({ onComplete }: FunctionMatchingLevel9Session4GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('What do we use for cutting? Tap the tool we use to cut.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Which tool do we use for cutting?', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === QUESTION.correctId) {
        speak('Correct! We use scissors for cutting!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        triggerWrong();
      }
    },
    [onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You matched the tool to its use!"
        badgeEmoji="✂️"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Function Matching"
      instruction="Match the tool to its use. What do we use for cutting?"
      icon="✂️"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>{QUESTION.prompt}</Text>
        <View style={styles.useBox}>
          <Text style={styles.useEmoji}>✂️</Text>
          <Text style={styles.useText}>{QUESTION.useLabel}</Text>
        </View>
        <Text style={styles.tapLabel}>Tap the tool</Text>
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
          {OBJECTS.map((obj) => (
            <Pressable
              key={obj.id}
              onPress={() => handleTap(obj.id)}
              style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
              accessibilityLabel={obj.label}
            >
              <Text style={styles.objEmoji}>{obj.emoji}</Text>
              <Text style={styles.objLabel}>{obj.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 20, fontWeight: '800', color: '#4338CA', marginBottom: 16, textAlign: 'center' },
  useBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#C7D2FE',
    marginBottom: 20,
  },
  useEmoji: { fontSize: 32 },
  useText: { fontSize: 18, fontWeight: '700', color: '#4338CA' },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  optionBtn: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#818CF8',
    alignItems: 'center',
    minWidth: 90,
  },
  pressed: { opacity: 0.9, backgroundColor: '#EEF2FF' },
  objEmoji: { fontSize: 40, marginBottom: 6 },
  objLabel: { fontSize: 14, fontWeight: '700', color: '#4338CA' },
});
