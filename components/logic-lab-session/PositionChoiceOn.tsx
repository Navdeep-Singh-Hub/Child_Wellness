/**
 * Game 1 — Where is the cup? (ON / under / in the table). Session 2: Preposition ON.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

type Position = 'on' | 'under' | 'in';
const OPTIONS: { id: Position; label: string; short: string }[] = [
  { id: 'on', label: 'Cup ON the table', short: 'On' },
  { id: 'under', label: 'Cup under the table', short: 'Under' },
  { id: 'in', label: 'Cup in the table', short: 'In' },
];
const CORRECT: Position = 'on';
const VOICE = 'Tap the picture where the cup is ON the table.';

export function PositionChoiceOn({ onComplete }: { onComplete: () => void }) {
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

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You found ON!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Where is the cup?"
      instruction="Tap the picture where the cup is ON the table."
      icon="🫙"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.prompt}>Which shows the cup ON the table?</Text>
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
                  {opt.id === 'on' && (
                    <>
                      <View style={styles.table} />
                      <View style={styles.cupOn} />
                    </>
                  )}
                  {opt.id === 'under' && (
                    <>
                      <View style={styles.cupUnder} />
                      <View style={styles.table} />
                    </>
                  )}
                  {opt.id === 'in' && (
                    <>
                      <View style={styles.table} />
                      <View style={styles.cupIn} />
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
    width: 64,
    height: 24,
    backgroundColor: '#D4A574',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#92400E',
  },
  cupOn: {
    position: 'absolute',
    top: -12,
    width: 22,
    height: 28,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#D97706',
    borderRadius: 4,
  },
  cupUnder: {
    position: 'absolute',
    top: 32,
    width: 22,
    height: 28,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#D97706',
    borderRadius: 4,
  },
  cupIn: {
    position: 'absolute',
    width: 22,
    height: 28,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#D97706',
    borderRadius: 4,
  },
  optionLabel: { fontSize: 18, fontWeight: '800', color: '#1f2937' },
});
