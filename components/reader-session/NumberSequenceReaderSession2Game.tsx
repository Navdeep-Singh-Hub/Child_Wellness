/**
 * Level 7 Reader — Session 2, Game 1: Number Sequence
 * 3, 6, 9, ? → Answer: 12 (add 3 each time).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PATTERN = [3, 6, 9];
const OPTIONS = [10, 11, 12, 13];
const CORRECT = 12;

export interface NumberSequenceReaderSession2GameProps {
  onComplete: () => void;
}

export function NumberSequenceReaderSession2Game({ onComplete }: NumberSequenceReaderSession2GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('What number comes next? 3, 6, 9, what?', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Count by threes: 3, 6, 9...', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (num: number) => {
      if (num === CORRECT) {
        speak('Correct! 12 comes next!', 0.75);
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
        subtitle="You found the next number!"
        badgeEmoji="🔢"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Number Sequence"
      instruction="What number comes next? 3, 6, 9, ?"
      icon="🔢"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>3, 6, 9, ?</Text>
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
  patternRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  patternBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderWidth: 3,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternNum: { fontSize: 24, fontWeight: '800', color: '#4338CA' },
  questionBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#C7D2FE',
    borderWidth: 3,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: { fontSize: 24, fontWeight: '800', color: '#4338CA' },
  chooseLabel: { fontSize: 18, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  optionBtn: {
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#818CF8',
    minWidth: 72,
    alignItems: 'center',
  },
  pressed: { opacity: 0.9 },
  optionNum: { fontSize: 26, fontWeight: '800', color: '#4338CA' },
});
