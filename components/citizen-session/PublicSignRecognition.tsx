/**
 * Game 1 — Tap the correct sign. Display TOILET, MEN, WOMEN. Instruction: "Tap the TOILET sign." Session 2: Public Place Signs.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const SIGNS = [
  { id: 'TOILET', label: 'TOILET', color: '#1E40AF', bg: '#DBEAFE' },
  { id: 'MEN', label: 'MEN', color: '#1E3A8A', bg: '#BFDBFE' },
  { id: 'WOMEN', label: 'WOMEN', color: '#831843', bg: '#FBCFE8' },
];
const CORRECT = 'TOILET';
const VOICE = 'Tap the TOILET sign.';

export function PublicSignRecognition({ onComplete }: { onComplete: () => void }) {
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

  const handleTap = useCallback(
    (id: string) => {
      if (id !== CORRECT) {
        speak('Try again.');
        triggerShake();
        return;
      }
      speak('Correct!');
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2200);
    },
    [onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You found TOILET!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Tap the correct sign"
      instruction="Tap the TOILET sign."
      icon="🚻"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.prompt}>Which one is the TOILET sign?</Text>
        <View style={styles.signsRow}>
          {SIGNS.map((sign) => (
            <Animated.View
              key={sign.id}
              style={[
                styles.signCard,
                { backgroundColor: sign.bg, borderColor: sign.color },
                sign.id === CORRECT && { borderWidth: 4 },
                { transform: [{ translateX: sign.id === CORRECT ? 0 : shakeX }] },
              ]}
            >
              <Pressable
                onPress={() => handleTap(sign.id)}
                style={({ pressed }) => [styles.signTouch, pressed && styles.pressed]}
                accessibilityLabel={sign.label}
              >
                <Text style={[styles.signText, { color: sign.color }]}>{sign.label}</Text>
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
  prompt: { fontSize: 20, fontWeight: '800', color: '#374151', marginBottom: 24, textAlign: 'center' },
  signsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  signCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  signTouch: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.9 },
  signText: { fontSize: 20, fontWeight: '800' },
});
