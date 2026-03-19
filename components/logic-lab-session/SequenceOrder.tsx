/**
 * Game 4 — Put the steps in order: Planting a seed → 1 seed, 2 soil, 3 water.
 * Child assigns order by tapping slots 1, 2, 3 for each card. AAC-friendly, sequencing.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const STEPS = [
  { id: 'seed', label: 'Seed', emoji: '🌱', correctOrder: 1 },
  { id: 'soil', label: 'Soil', emoji: '🪴', correctOrder: 2 },
  { id: 'water', label: 'Water', emoji: '💧', correctOrder: 3 },
];
const VOICE = 'Arrange the steps in the correct order. First seed, then soil, then water.';

export function SequenceOrder({ onComplete }: { onComplete: () => void }) {
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
      const correctOrder = STEPS.find((s) => s.id === id)!.correctOrder;
      if (nextSlot !== correctOrder) {
        speak('Try again.');
        triggerShake();
        return;
      }
      speak(`${nextSlot}. ${STEPS.find((s) => s.id === id)!.label}!`);
      setOrder((prev) => ({ ...prev, [id]: nextSlot }));
      if (nextSlot === 3) {
        speak('Great job!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setNextSlot((n) => n + 1);
      }
    },
    [nextSlot, onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="Steps in order!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Put the steps in order"
      instruction="Tap the first step, then the second, then the third."
      icon="🌱"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.prompt}>Planting a seed. What is step number {nextSlot}?</Text>
        <View style={styles.slots}>
          {[1, 2, 3].map((n) => (
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
          {STEPS.filter((s) => !order[s.id]).map((s) => (
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
  slots: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  slot: {
    backgroundColor: '#E0E7FF',
    borderRadius: 16,
    padding: 16,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4F46E5',
  },
  slotNum: { fontSize: 14, fontWeight: '800', color: '#4F46E5', marginBottom: 4 },
  slotEmoji: { fontSize: 36 },
  slotEmpty: { fontSize: 20, color: '#9CA3AF' },
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  stepCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 4,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    minWidth: 100,
  },
  pressed: { opacity: 0.85 },
  stepEmoji: { fontSize: 48, marginBottom: 8 },
  stepLabel: { fontSize: 18, fontWeight: '800', color: '#374151' },
});
