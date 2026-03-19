/**
 * Game 1 — Where is the dog? (NEXT TO boy / under boy / on boy). Session 4: Preposition NEXT TO.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

type Position = 'nextto' | 'under' | 'on';
const OPTIONS: { id: Position; label: string; short: string }[] = [
  { id: 'nextto', label: 'Dog next to boy', short: 'Next to' },
  { id: 'under', label: 'Dog under boy', short: 'Under' },
  { id: 'on', label: 'Dog on boy', short: 'On' },
];
const CORRECT: Position = 'nextto';
const VOICE = 'Tap the picture where the dog is NEXT TO the boy.';

export function PositionChoiceNextTo({ onComplete }: { onComplete: () => void }) {
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

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You found NEXT TO!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Where is the dog?"
      instruction="Tap the picture where the dog is NEXT TO the boy."
      icon="🐕"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.prompt}>Which shows the dog NEXT TO the boy?</Text>
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
                  {opt.id === 'nextto' && (
                    <>
                      <View style={styles.boy} />
                      <View style={styles.dogNextTo} />
                    </>
                  )}
                  {opt.id === 'under' && (
                    <>
                      <View style={styles.dogUnder} />
                      <View style={styles.boy} />
                    </>
                  )}
                  {opt.id === 'on' && (
                    <>
                      <View style={styles.dogOn} />
                      <View style={styles.boy} />
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
  boy: {
    position: 'absolute',
    width: 28,
    height: 36,
    backgroundColor: '#93C5FD',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1D4ED8',
  },
  dogNextTo: {
    position: 'absolute',
    left: 36,
    width: 26,
    height: 22,
    backgroundColor: '#FCD34D',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D97706',
  },
  dogUnder: {
    position: 'absolute',
    top: 38,
    width: 26,
    height: 22,
    backgroundColor: '#FCD34D',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D97706',
  },
  dogOn: {
    position: 'absolute',
    top: -6,
    width: 26,
    height: 22,
    backgroundColor: '#FCD34D',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D97706',
  },
  optionLabel: { fontSize: 16, fontWeight: '800', color: '#1f2937' },
});
