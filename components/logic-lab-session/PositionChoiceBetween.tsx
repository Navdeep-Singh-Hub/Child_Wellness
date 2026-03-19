/**
 * Game 1 — Where is the cat? (BETWEEN two dogs / under a dog / on a dog). Session 6: Preposition BETWEEN.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

type Position = 'between' | 'under' | 'on';
const OPTIONS: { id: Position; label: string; short: string }[] = [
  { id: 'between', label: 'Cat between two dogs', short: 'Between' },
  { id: 'under', label: 'Cat under a dog', short: 'Under' },
  { id: 'on', label: 'Cat on a dog', short: 'On' },
];
const CORRECT: Position = 'between';
const VOICE = 'Tap the picture where the cat is BETWEEN the two dogs.';

export function PositionChoiceBetween({ onComplete }: { onComplete: () => void }) {
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
    (position: Position) => {
      if (position === CORRECT) {
        speak('Correct!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        speak('Try again.');
        triggerShake();
      }
    },
    [onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You found BETWEEN!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Where is the cat?"
      instruction="Tap the picture where the cat is BETWEEN the two dogs."
      icon="🐱"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.prompt}>Which shows the cat BETWEEN two dogs?</Text>
        <View style={styles.optionsRow}>
          {OPTIONS.map((opt) => (
            <Animated.View
              key={opt.id}
              style={[
                styles.optionCard,
                opt.id === CORRECT && { borderColor: '#22C55E' },
                { transform: opt.id === CORRECT ? [] : [{ translateX: shakeX }] },
              ]}
            >
              <Pressable
                onPress={() => handleTap(opt.id)}
                style={({ pressed }) => [styles.optionTouch, pressed && styles.pressed]}
                accessibilityLabel={opt.label}
              >
                <View style={styles.optionVisual}>
                  {opt.id === 'between' && (
                    <>
                      <View style={styles.dogLeft} />
                      <View style={styles.catBetween} />
                      <View style={styles.dogRight} />
                    </>
                  )}
                  {opt.id === 'under' && (
                    <>
                      <View style={styles.catUnder} />
                      <View style={styles.dogSingle} />
                    </>
                  )}
                  {opt.id === 'on' && (
                    <>
                      <View style={styles.catOn} />
                      <View style={styles.dogSingle} />
                    </>
                  )}
                </View>
                <Text style={styles.optionLabel}>{opt.short}</Text>
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
  prompt: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 20, textAlign: 'center' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  optionCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 4,
    borderColor: '#E5E7EB',
    minWidth: 100,
    alignItems: 'center',
  },
  optionTouch: { alignItems: 'center' },
  pressed: { opacity: 0.85 },
  optionVisual: { width: 80, height: 80, marginBottom: 8, position: 'relative', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  dogLeft: {
    position: 'absolute',
    left: 0,
    width: 22,
    height: 28,
    backgroundColor: '#FCD34D',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D97706',
  },
  catBetween: {
    width: 22,
    height: 26,
    backgroundColor: '#F472B6',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#BE185D',
  },
  dogRight: {
    position: 'absolute',
    right: 0,
    width: 22,
    height: 28,
    backgroundColor: '#FCD34D',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D97706',
  },
  catUnder: {
    position: 'absolute',
    top: 42,
    width: 22,
    height: 26,
    backgroundColor: '#F472B6',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#BE185D',
  },
  dogSingle: {
    position: 'absolute',
    width: 28,
    height: 36,
    backgroundColor: '#FCD34D',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D97706',
  },
  catOn: {
    position: 'absolute',
    top: -6,
    width: 22,
    height: 26,
    backgroundColor: '#F472B6',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#BE185D',
  },
  optionLabel: { fontSize: 15, fontWeight: '800', color: '#1f2937' },
});
