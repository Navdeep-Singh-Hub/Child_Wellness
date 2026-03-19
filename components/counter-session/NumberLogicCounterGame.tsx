/**
 * Level 5 Counter — Session 9, Game 1: Number Logic
 * Which number comes next: 2, 4, 6, ? → Answer: 8.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PATTERN = [2, 4, 6];
const OPTIONS = [6, 7, 8, 9];
const CORRECT = 8;

export interface NumberLogicCounterGameProps {
  onComplete: () => void;
}

export function NumberLogicCounterGame({ onComplete }: NumberLogicCounterGameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('What number comes next? 2, 4, 6, what?', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Count by twos: 2, 4, 6...', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (num: number) => {
      if (num === CORRECT) {
        speak('Correct! 8 comes next!', 0.75);
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
        variant="ocean"
        title="Great Job!"
        subtitle="You found the next number!"
        badgeEmoji="🔢"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Number Logic"
      instruction="What number comes next? 2, 4, 6, ?"
      icon="🔢"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>2, 4, 6, ?</Text>
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
        <Text style={styles.tapLabel}>Tap the next number</Text>
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
          {OPTIONS.map((num) => (
            <Pressable
              key={num}
              onPress={() => handleTap(num)}
              style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
              accessibilityLabel={`Number ${num}`}
            >
              <Text style={styles.optionText}>{num}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 22, fontWeight: '800', color: '#0369A1', marginBottom: 16 },
  patternRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 },
  patternBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    borderWidth: 4,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternNum: { fontSize: 26, fontWeight: '800', color: '#0C4A6E' },
  questionBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: { fontSize: 24, fontWeight: '800', color: '#64748B' },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center' },
  optionBtn: {
    minWidth: 64,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#38BDF8',
    alignItems: 'center',
  },
  optionText: { fontSize: 28, fontWeight: '800', color: '#0C4A6E' },
  pressed: { opacity: 0.9, backgroundColor: '#E0F2FE' },
});
