/**
 * Game 1 — Story picture: child brushing teeth. Choose correct sentence. Session 4: Daily Stories.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const OPTIONS = ['I brush my teeth', 'I eat a shoe', 'I jump in water'];
const CORRECT = 'I brush my teeth';
const VOICE = 'Look at the picture and choose the correct sentence.';

export function PictureSentenceBrushTeeth({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak(VOICE, 0.75);
  }, []);

  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleChoice = useCallback(
    (sentence: string) => {
      if (sentence !== CORRECT) {
        speak('Try again.');
        triggerShake();
        return;
      }
      speak('Correct! I brush my teeth!');
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2200);
    },
    [onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You chose the right sentence!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Choose the correct sentence"
      instruction="Look at the picture and choose the correct sentence."
      icon="📖"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.pictureBox}>
          <Text style={styles.pictureEmoji}>🪥</Text>
          <Text style={styles.pictureCaption}>A child brushing teeth in the morning</Text>
        </View>
        <Text style={styles.prompt}>What is happening?</Text>
        <View style={styles.optionsColumn}>
          {OPTIONS.map((opt) => (
            <Animated.View key={opt} style={{ transform: [{ translateX: opt === CORRECT ? 0 : shakeX }] }}>
              <Pressable
                onPress={() => handleChoice(opt)}
                style={({ pressed }) => [styles.optionCard, pressed && styles.pressed]}
                accessibilityLabel={opt}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 8, alignItems: 'center' },
  pictureBox: {
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    padding: 28,
    borderWidth: 3,
    borderColor: '#8B5CF6',
    marginBottom: 20,
    alignItems: 'center',
    minWidth: 260,
  },
  pictureEmoji: { fontSize: 64, marginBottom: 12 },
  pictureCaption: { fontSize: 16, fontWeight: '700', color: '#5B21B6' },
  prompt: { fontSize: 18, fontWeight: '800', color: '#374151', marginBottom: 20 },
  optionsColumn: { gap: 12, width: '100%', maxWidth: 300 },
  optionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 4,
    borderColor: '#E5E7EB',
  },
  pressed: { opacity: 0.85 },
  optionText: { fontSize: 17, fontWeight: '700', color: '#1f2937' },
});
