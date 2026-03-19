/**
 * Game 1 — Where is the boy? (BEHIND tree / under tree / on tree). Session 5: Preposition BEHIND.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

type Position = 'behind' | 'under' | 'on';
const OPTIONS: { id: Position; label: string; short: string }[] = [
  { id: 'behind', label: 'Boy behind tree', short: 'Behind' },
  { id: 'under', label: 'Boy under tree', short: 'Under' },
  { id: 'on', label: 'Boy on tree', short: 'On' },
];
const CORRECT: Position = 'behind';
const VOICE = 'Tap the picture where the boy is BEHIND the tree.';

export function PositionChoiceBehind({ onComplete }: { onComplete: () => void }) {
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

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You found BEHIND!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Where is the boy?"
      instruction="Tap the picture where the boy is BEHIND the tree."
      icon="🌳"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.prompt}>Which shows the boy BEHIND the tree?</Text>
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
                  {opt.id === 'behind' && (
                    <>
                      <View style={styles.tree} />
                      <View style={styles.boyBehind} />
                    </>
                  )}
                  {opt.id === 'under' && (
                    <>
                      <View style={styles.boyUnder} />
                      <View style={styles.tree} />
                    </>
                  )}
                  {opt.id === 'on' && (
                    <>
                      <View style={styles.boyOn} />
                      <View style={styles.tree} />
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
  tree: {
    position: 'absolute',
    width: 36,
    height: 52,
    backgroundColor: '#22C55E',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#166534',
  },
  boyBehind: {
    position: 'absolute',
    left: 22,
    width: 24,
    height: 32,
    backgroundColor: '#93C5FD',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1D4ED8',
  },
  boyUnder: {
    position: 'absolute',
    top: 42,
    width: 24,
    height: 32,
    backgroundColor: '#93C5FD',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1D4ED8',
  },
  boyOn: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 32,
    backgroundColor: '#93C5FD',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1D4ED8',
  },
  optionLabel: { fontSize: 16, fontWeight: '800', color: '#1f2937' },
});
