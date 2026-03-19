/**
 * Level 7 Reader — Session 8, Game 1: Spot the Pattern
 * Red, blue, red, blue, ? → Red.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PATTERN = ['red', 'blue', 'red', 'blue'];
const OPTIONS = [
  { id: 'red', label: 'Red', color: '#EF4444' },
  { id: 'blue', label: 'Blue', color: '#3B82F6' },
  { id: 'green', label: 'Green', color: '#22C55E' },
];
const CORRECT_ID = 'red';

export interface SpotThePatternRedBlueReaderSession8GameProps {
  onComplete: () => void;
}

export function SpotThePatternRedBlueReaderSession8Game({ onComplete }: SpotThePatternRedBlueReaderSession8GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('What comes next? Red, blue, red, blue. Tap the next color.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Red, blue, red, blue. What comes next?', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! Red comes next!', 0.75);
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
        subtitle="You spotted the pattern!"
        badgeEmoji="🔴"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Spot the Pattern"
      instruction="Red, blue, red, blue. What comes next?"
      icon="🔴"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Pattern</Text>
        <View style={styles.patternRow}>
          {PATTERN.map((id, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: id === 'red' ? '#EF4444' : '#3B82F6' }]} />
          ))}
          <View style={styles.questionDot} />
        </View>
        <Text style={styles.tapLabel}>Tap the next color</Text>
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => handleTap(opt.id)}
              style={({ pressed }) => [styles.optionBtn, { borderColor: opt.color }, pressed && styles.pressed]}
              accessibilityLabel={opt.label}
            >
              <View style={[styles.optionDot, { backgroundColor: opt.color }]} />
              <Text style={styles.optionLabel}>{opt.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#4338CA', marginBottom: 16 },
  patternRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  dot: { width: 44, height: 44, borderRadius: 22 },
  questionDot: { width: 44, height: 44, borderRadius: 22, borderWidth: 4, borderStyle: 'dashed', borderColor: '#818CF8' },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center' },
  optionBtn: {
    minWidth: 90,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 4,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  optionDot: { width: 36, height: 36, borderRadius: 18, marginBottom: 8 },
  optionLabel: { fontSize: 14, fontWeight: '700', color: '#4338CA' },
  pressed: { opacity: 0.9, backgroundColor: '#EEF2FF' },
});
