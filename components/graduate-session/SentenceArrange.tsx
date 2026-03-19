/**
 * Game 1 — Arrange the sentences. Tap in order: I wake up (1), I brush teeth (2), I go to school (3). Session 2: Story Sentences.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const SENTENCES = [
  { id: 'wake', label: 'I wake up', correctOrder: 1 },
  { id: 'brush', label: 'I brush teeth', correctOrder: 2 },
  { id: 'school', label: 'I go to school', correctOrder: 3 },
];
const VOICE = 'Arrange the sentences to make a story. Tap them in order.';

export function SentenceArrange({ onComplete }: { onComplete: () => void }) {
  const [nextSlot, setNextSlot] = useState(1);
  const [order, setOrder] = useState<Record<string, number>>({});
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
      const step = SENTENCES.find((s) => s.id === id);
      if (!step || step.correctOrder !== nextSlot) {
        speak('Try again.');
        triggerShake();
        return;
      }
      speak(`${nextSlot}. ${step.label}!`);
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

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="Story in order!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });
  const remaining = SENTENCES.filter((s) => !order[s.id]);

  return (
    <GameLayout
      title="Put the actions in order"
      instruction="Arrange the sentences to make a story. Tap them in order."
      icon="📖"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.prompt}>What is step number {nextSlot}?</Text>
        <View style={styles.slots}>
          {[1, 2, 3].map((n) => (
            <View key={n} style={styles.slot}>
              <Text style={styles.slotNum}>{n}</Text>
              {SENTENCES.find((s) => order[s.id] === n) ? (
                <Text style={styles.slotLabel}>{SENTENCES.find((s) => order[s.id] === n)!.label}</Text>
              ) : (
                <Text style={styles.slotEmpty}>—</Text>
              )}
            </View>
          ))}
        </View>
        <View style={styles.sentencesRow}>
          {remaining.map((s) => (
            <Animated.View key={s.id} style={{ transform: [{ translateX: shakeX }] }}>
              <Pressable
                onPress={() => handleTap(s.id)}
                style={({ pressed }) => [styles.sentenceCard, pressed && styles.pressed]}
                accessibilityLabel={s.label}
              >
                <Text style={styles.sentenceLabel}>{s.label}</Text>
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
    padding: 16,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4F46E5',
  },
  slotNum: { fontSize: 12, fontWeight: '800', color: '#4F46E5', marginBottom: 4 },
  slotLabel: { fontSize: 14, fontWeight: '700', color: '#374151', textAlign: 'center' },
  slotEmpty: { fontSize: 16, color: '#9CA3AF' },
  sentencesRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  sentenceCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 4,
    borderColor: '#E5E7EB',
  },
  pressed: { opacity: 0.85 },
  sentenceLabel: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
});
