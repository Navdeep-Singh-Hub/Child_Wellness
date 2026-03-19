/**
 * Game 1 — Find the Correct Position: Where is the ball? (IN / on / under the box)
 * Tap the picture where the ball is IN the box. AAC-friendly, spatial understanding.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

type Position = 'in' | 'on' | 'under';
const OPTIONS: { id: Position; label: string; short: string }[] = [
  { id: 'in', label: 'Ball IN the box', short: 'In' },
  { id: 'on', label: 'Ball on the box', short: 'On' },
  { id: 'under', label: 'Ball under the box', short: 'Under' },
];
const CORRECT: Position = 'in';
const VOICE = 'Tap the picture where the ball is IN the box.';

export function PositionChoice({ onComplete }: { onComplete: () => void }) {
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

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You found IN!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Where is the ball?"
      instruction="Tap the picture where the ball is IN the box."
      icon="📦"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.prompt}>Which shows the ball IN the box?</Text>
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
                  {opt.id === 'in' && (
                    <>
                      <View style={styles.box} />
                      <View style={styles.ballIn} />
                    </>
                  )}
                  {opt.id === 'on' && (
                    <>
                      <View style={styles.box} />
                      <View style={styles.ballOn} />
                    </>
                  )}
                  {opt.id === 'under' && (
                    <>
                      <View style={styles.ballUnder} />
                      <View style={styles.box} />
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
  box: {
    position: 'absolute',
    width: 56,
    height: 48,
    backgroundColor: '#DDD6FE',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#5B21B6',
  },
  ballIn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#B91C1C',
  },
  ballOn: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#B91C1C',
  },
  ballUnder: {
    position: 'absolute',
    top: 28,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#B91C1C',
  },
  optionLabel: { fontSize: 18, fontWeight: '800', color: '#1f2937' },
});
