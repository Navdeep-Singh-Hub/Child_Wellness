/**
 * Family Hunt — Find family words (cat, sun, pin, top). Game 1 for Grouper Session 10 (Grouper Master).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const CORRECT = [
  { id: 'cat', label: 'cat', image: 'https://placehold.co/140x140/FED7AA/9A3412?text=cat' },
  { id: 'sun', label: 'sun', image: 'https://placehold.co/140x140/FEF9C3/854D0E?text=sun' },
  { id: 'pin', label: 'pin', image: 'https://placehold.co/140x140/DBEAFE/1E40AF?text=pin' },
  { id: 'top', label: 'top', image: 'https://placehold.co/140x140/E0E7FF/4338CA?text=top' },
];
const WRONG = [
  { id: 'dog', label: 'dog', image: 'https://placehold.co/140x140/FDE68A/92400E?text=dog' },
  { id: 'cup', label: 'cup', image: 'https://placehold.co/140x140/FEF3C7/B45309?text=cup' },
];
const ALL = [...CORRECT, ...WRONG].sort(() => Math.random() - 0.5);

export function FamilyHuntMaster({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeAnims] = useState(() =>
    ALL.reduce((acc, i) => ({ ...acc, [i.id]: new Animated.Value(0) }), {} as Record<string, Animated.Value>)
  );
  const [glowAnims] = useState(() =>
    CORRECT.reduce((acc, i) => ({ ...acc, [i.id]: new Animated.Value(0) }), {} as Record<string, Animated.Value>)
  );

  useEffect(() => {
    speak('Tap the words that belong to the word families.', 0.75);
  }, []);

  const triggerShake = useCallback((id: string) => {
    const a = shakeAnims[id];
    if (!a) return;
    Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [shakeAnims]);

  const triggerGlow = useCallback((id: string) => {
    const a = glowAnims[id];
    if (!a) return;
    a.setValue(0);
    Animated.timing(a, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [glowAnims]);

  const handleTap = useCallback(
    (item: { id: string; label: string }) => {
      const isCorrect = CORRECT.some((c) => c.id === item.id);
      if (isCorrect) {
        if (selected.has(item.id)) return;
        speak('Correct!');
        triggerGlow(item.id);
        const next = new Set(selected).add(item.id);
        setSelected(next);
        if (next.size === CORRECT.length) {
          speak('Great job!');
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2000);
        }
      } else {
        speak('Try again.');
        triggerShake(item.id);
      }
    },
    [selected, onComplete, triggerShake, triggerGlow]
  );

  if (showSuccess) {
    return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You found all the family words!" />;
  }

  return (
    <GameLayout
      title="Find the family words"
      instruction="Tap the words that belong to the word families."
    >
      <View style={styles.grid}>
        {ALL.map((item) => {
          const chosen = selected.has(item.id);
          const isCorrect = CORRECT.some((c) => c.id === item.id);
          const shake = shakeAnims[item.id];
          const glow = glowAnims[item.id];
          const translateX = shake?.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }) ?? 0;
          const scale = glow?.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) ?? 1;
          return (
            <Animated.View
              key={item.id}
              style={[
                styles.cardWrap,
                chosen && isCorrect && styles.cardChosen,
                { transform: [{ translateX }, { scale }] },
              ]}
            >
              <Pressable
                onPress={() => handleTap(item)}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                accessibilityLabel={item.label}
              >
                <Image source={{ uri: item.image }} style={styles.image} />
                <Text style={styles.label}>{item.label}</Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  cardWrap: { width: '45%', maxWidth: 160 },
  card: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#4F46E5',
    minHeight: 140,
  },
  cardPressed: { opacity: 0.9 },
  cardChosen: { borderColor: '#22C55E', backgroundColor: '#DCFCE7' },
  image: { width: 80, height: 80, borderRadius: 12, marginBottom: 8 },
  label: { fontSize: 22, fontWeight: '800', color: '#1f2937' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#22C55E' },
});
