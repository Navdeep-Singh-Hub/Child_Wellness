/**
 * Level 9 (Clockwise) — Session 2, Game 1: Number Pattern
 * 2, 6, 10, 14, ? → 18 (+4 each time).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PATTERN = [2, 6, 10, 14];
const OPTIONS = [16, 17, 18, 19];
const CORRECT = 18;

export interface NumberPatternLevel9Session2GameProps {
  onComplete: () => void;
}

export function NumberPatternLevel9Session2Game({ onComplete }: NumberPatternLevel9Session2GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('What number comes next? 2, 6, 10, 14. Add 4 each time.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. 2, 6, 10, 14 — add 4 each time.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (num: number) => {
      if (num === CORRECT) {
        speak('Correct! 18 comes next!', 0.75);
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
        subtitle="You found the pattern!"
        badgeEmoji="🔢"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Number Pattern"
      instruction="2, 6, 10, 14, ? — add 4 each time. Tap the next number."
      icon="🔢"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>2, 6, 10, 14, ?</Text>
        <View style={styles.patternRow}>
          {PATTERN.map((n, i) => (
            <View key={i} style={styles.patternBox}>
              <Text style={styles.patternNum}>{n}</Text>
            </View>
          ))}
          <View style={styles.questionBox}>
            <Text style={styles.questionText}>?</Text>
          </View>
        </View>
        <Text style={styles.chooseLabel}>Tap the next number</Text>
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
          {OPTIONS.map((num) => (
            <Pressable
              key={num}
              onPress={() => handleTap(num)}
              style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
              accessibilityLabel={`Number ${num}`}
            >
              <Text style={styles.optionNum}>{num}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 22, fontWeight: '800', color: '#4338CA', marginBottom: 20 },
  patternRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' },
  patternBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderWidth: 3,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternNum: { fontSize: 22, fontWeight: '800', color: '#4338CA' },
  questionBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#C7D2FE',
    borderWidth: 3,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: { fontSize: 22, fontWeight: '800', color: '#4338CA' },
  chooseLabel: { fontSize: 18, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  optionBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#818CF8',
    minWidth: 68,
    alignItems: 'center',
  },
  pressed: { opacity: 0.9 },
  optionNum: { fontSize: 24, fontWeight: '800', color: '#4338CA' },
});
