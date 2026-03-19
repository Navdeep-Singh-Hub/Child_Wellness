/**
 * Game 1 — Where is the cat? (UNDER table / on table / in box). Session 3: Preposition UNDER.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

type Position = 'under' | 'on' | 'in';
const OPTIONS: { id: Position; label: string; short: string }[] = [
  { id: 'under', label: 'Cat under table', short: 'Under' },
  { id: 'on', label: 'Cat on table', short: 'On' },
  { id: 'in', label: 'Cat in box', short: 'In' },
];
const CORRECT: Position = 'under';
const VOICE = 'Tap the picture where the cat is UNDER the table.';

export function PositionChoiceUnder({ onComplete }: { onComplete: () => void }) {
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

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You found UNDER!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Where is the cat?"
      instruction="Tap the picture where the cat is UNDER the table."
      icon="🐱"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.prompt}>Which shows the cat UNDER the table?</Text>
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
                  {opt.id === 'under' && (
                    <>
                      <View style={styles.catUnder} />
                      <View style={styles.table} />
                    </>
                  )}
                  {opt.id === 'on' && (
                    <>
                      <View style={styles.catOn} />
                      <View style={styles.table} />
                    </>
                  )}
                  {opt.id === 'in' && (
                    <>
                      <View style={styles.box} />
                      <View style={styles.catIn} />
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
  optionVisual: { width: 80, height: 80, marginBottom: 8, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  table: {
    position: 'absolute',
    bottom: 0,
    width: 64,
    height: 24,
    backgroundColor: '#D4A574',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#92400E',
  },
  catUnder: {
    position: 'absolute',
    bottom: 26,
    width: 32,
    height: 24,
    backgroundColor: '#FCD34D',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D97706',
  },
  catOn: {
    position: 'absolute',
    top: -4,
    width: 32,
    height: 24,
    backgroundColor: '#FCD34D',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D97706',
  },
  box: {
    position: 'absolute',
    width: 48,
    height: 44,
    backgroundColor: '#DDD6FE',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#5B21B6',
  },
  catIn: {
    position: 'absolute',
    width: 24,
    height: 18,
    backgroundColor: '#FCD34D',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D97706',
  },
  optionLabel: { fontSize: 18, fontWeight: '800', color: '#1f2937' },
});
