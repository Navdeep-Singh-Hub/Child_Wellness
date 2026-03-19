/**
 * Game 4 — Count the Objects: One apple shown, question "How many apples?" Options 1, 2, 3. Correct: 1.
 * Instruction: "Count the apples and choose the number."
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const DEFAULT_OPTIONS = ['1', '2', '3'];
const DEFAULT_CORRECT = '1';

export interface ObjectCountGameProps {
  onComplete: () => void;
  /** Emoji(s) to display, e.g. '🍎' or '🐶🐶' */
  objectDisplay?: string;
  /** Label for question, e.g. 'apples' or 'dogs' */
  objectLabel?: string;
  /** Icon for GameLayout header, e.g. '🍎' '🐶' '🐟' */
  icon?: string;
  options?: string[];
  correct?: string;
}

export function ObjectCountGame({
  onComplete,
  objectDisplay = '🍎',
  objectLabel = 'apples',
  icon = '🔢',
  options = DEFAULT_OPTIONS,
  correct = DEFAULT_CORRECT,
}: ObjectCountGameProps) {
  const voice = `Count the ${objectLabel} and choose the number.`;
  const question = `How many ${objectLabel}?`;
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeAnim] = useState(() => new Animated.Value(0));
  const [glowAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak(voice, 0.75);
  }, [voice]);

  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const triggerGlow = useCallback(() => {
    glowAnim.setValue(0);
    Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.6, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [glowAnim]);

  const handleTap = useCallback(
    (num: string) => {
      if (num === correct) {
        speak(`Correct! ${correct} ${objectLabel}!`);
        triggerGlow();
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        speak(`Try again. Count the ${objectLabel}.`);
        triggerShake();
      }
    },
    [correct, objectLabel, onComplete, triggerShake, triggerGlow]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Great Job!"
        subtitle={`You counted ${correct} ${objectLabel}!`}
        badgeEmoji="⭐"
      />
    );
  }

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });
  const glowScale = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });

  return (
    <GameLayout
      title={`Count the ${objectLabel}`}
      instruction={`${question} Tap the number.`}
      icon={icon}
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <View style={styles.appleWrap}>
          <Text style={styles.apple}>{objectDisplay}</Text>
          <Text style={styles.question}>{question}</Text>
        </View>
        <View style={styles.optionsRow}>
          {options.map((num) => {
            const isCorrect = num === correct;
            return (
              <Animated.View
                key={num}
                style={[
                  styles.optionWrap,
                  { transform: isCorrect ? [{ scale: glowScale }] : [{ translateX: shakeX }] },
                ]}
              >
                <Pressable
                  onPress={() => handleTap(num)}
                  style={({ pressed }) => [
                    styles.optionBtn,
                    isCorrect && styles.optionBtnCorrect,
                    pressed && styles.pressed,
                  ]}
                  accessibilityLabel={`Number ${num}`}
                >
                  <Text style={styles.optionText}>{num}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  appleWrap: {
    marginBottom: 32,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  apple: { fontSize: 72, marginBottom: 12 },
  question: { fontSize: 20, fontWeight: '800', color: '#374151' },
  optionsRow: { flexDirection: 'row', gap: 20 },
  optionWrap: {},
  optionBtn: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#E0E7FF',
    borderWidth: 4,
    borderColor: '#818CF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBtnCorrect: { borderColor: '#4F46E5', backgroundColor: '#C7D2FE' },
  optionText: { fontSize: 32, fontWeight: '800', color: '#4F46E5' },
  pressed: { opacity: 0.9 },
});
