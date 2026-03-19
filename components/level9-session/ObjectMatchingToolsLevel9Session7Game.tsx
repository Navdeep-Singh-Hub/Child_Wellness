/**
 * Level 9 (Clockwise) — Session 7, Game 4: Object Matching
 * Match tools with their functions. "What do we use for measuring?" → Ruler.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const QUESTION = { prompt: 'What do we use for measuring?', correctId: 'ruler', useLabel: 'Measuring' };
const OBJECTS = [
  { id: 'ruler', label: 'Ruler', emoji: '📏' },
  { id: 'hammer', label: 'Hammer', emoji: '🔨' },
  { id: 'glue', label: 'Glue', emoji: '🧴' },
];

export interface ObjectMatchingToolsLevel9Session7GameProps {
  onComplete: () => void;
}

export function ObjectMatchingToolsLevel9Session7Game({ onComplete }: ObjectMatchingToolsLevel9Session7GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('What do we use for measuring? Tap the tool we use to measure.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Which tool do we use for measuring?', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === QUESTION.correctId) {
        speak('Correct! We use a ruler for measuring!', 0.75);
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
        subtitle="You matched the tool to its function!"
        badgeEmoji="📏"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Object Matching"
      instruction="Match the tool to its function. What do we use for measuring?"
      icon="📏"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>{QUESTION.prompt}</Text>
        <View style={styles.useBox}>
          <Text style={styles.useEmoji}>📏</Text>
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
