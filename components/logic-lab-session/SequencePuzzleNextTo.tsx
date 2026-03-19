/**
 * Game 4 — Wash your hands: 1 turn on water, 2 use soap, 3 rinse hands, 4 dry hands. Session 4: Preposition NEXT TO.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const STEPS = [
  { id: 'water', label: 'Turn on water', emoji: '🚿', correctOrder: 1 },
  { id: 'soap', label: 'Use soap', emoji: '🧼', correctOrder: 2 },
  { id: 'rinse', label: 'Rinse hands', emoji: '💧', correctOrder: 3 },
  { id: 'dry', label: 'Dry hands', emoji: '🧻', correctOrder: 4 },
];
const VOICE = 'Arrange the steps for washing hands. Turn on water, use soap, rinse, then dry.';

export function SequencePuzzleNextTo({ onComplete }: { onComplete: () => void }) {
  const [order, setOrder] = useState<Record<string, number>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeAnim] = useState(() => new Animated.Value(0));
  const [nextSlot, setNextSlot] = useState(1);

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

  const handleStepTap = useCallback(
    (id: string) => {
      const step = STEPS.find((s) => s.id === id);
      if (!step || step.correctOrder !== nextSlot) {
        speak('Try again.');
        triggerShake();
        return;
      }
      speak(`${nextSlot}. ${step.label}!`);
      setOrder((prev) => ({ ...prev, [id]: nextSlot }));
      if (nextSlot === 4) {
        speak('Great job!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setNextSlot((n) => n + 1);
      }
    },
    [nextSlot, onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="Hand washing steps in order!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });
  const remaining = STEPS.filter((s) => !order[s.id]);

  return (
    <GameLayout
      title="Wash your hands"
      instruction="Arrange the steps for washing hands in order."
      icon="🧼"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.prompt}>What is step number {nextSlot}?</Text>
        <View style={styles.slots}>
          {[1, 2, 3, 4].map((n) => (
            <View key={n} style={styles.slot}>
              <Text style={styles.slotNum}>{n}</Text>
              {STEPS.find((s) => order[s.id] === n) ? (
                <Text style={styles.slotEmoji}>{STEPS.find((s) => order[s.id] === n)!.emoji}</Text>
              ) : (
                <Text style={styles.slotEmpty}>—</Text>
              )}
            </View>
          ))}
        </View>
        <View style={styles.stepsRow}>
          {remaining.map((s) => (
            <Animated.View key={s.id} style={{ transform: [{ translateX: shakeX }] }}>
              <Pressable
                onPress={() => handleStepTap(s.id)}
                style={({ pressed }) => [styles.stepCard, pressed && styles.pressed]}
                accessibilityLabel={`${s.label}, step`}
              >
                <Text style={styles.stepEmoji}>{s.emoji}</Text>
                <Text style={styles.stepLabel}>{s.label}</Text>
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
  slots: { flexDirection: 'row', gap: 12, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' },
  slot: {
    backgroundColor: '#E0E7FF',
    borderRadius: 16,
    padding: 12,
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4F46E5',
  },
  slotNum: { fontSize: 14, fontWeight: '800', color: '#4F46E5', marginBottom: 4 },
  slotEmoji: { fontSize: 28 },
  slotEmpty: { fontSize: 18, color: '#9CA3AF' },
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  stepCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 4,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    minWidth: 90,
  },
  pressed: { opacity: 0.85 },
  stepEmoji: { fontSize: 40, marginBottom: 6 },
  stepLabel: { fontSize: 14, fontWeight: '800', color: '#374151' },
});
