/**
 * OceanCleanUp — Game 1: Clean It Up (Initial Sound /f/)
 * Beach scene: tap fish, frog, flag (correct); crab, whale, shell (wrong).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '../farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const CORRECT_ITEMS = [
  { id: 'fish', label: 'Fish', image: 'https://placehold.co/140x140/BAE6FD/0369A1?text=Fish' },
  { id: 'frog', label: 'Frog', image: 'https://placehold.co/140x140/86EFAC/166534?text=Frog' },
  { id: 'flag', label: 'Flag', image: 'https://placehold.co/140x140/FECACA/991B1B?text=Flag' },
];
const WRONG_ITEMS = [
  { id: 'crab', label: 'Crab', image: 'https://placehold.co/140x140/FED7AA/9A3412?text=Crab' },
  { id: 'whale', label: 'Whale', image: 'https://placehold.co/140x140/BFDBFE/1E40AF?text=Whale' },
  { id: 'shell', label: 'Shell', image: 'https://placehold.co/140x140/FDE68A/92400E?text=Shell' },
];
const ALL_ITEMS = [...CORRECT_ITEMS, ...WRONG_ITEMS].sort(() => Math.random() - 0.5);
const VOICE_INSTRUCTION = 'The beach is messy! Find things that start with the f sound.';

export function OceanCleanUp({ onComplete }: { onComplete: () => void }) {
  const [selectedCorrect, setSelectedCorrect] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeAnims] = useState(() =>
    ALL_ITEMS.reduce((acc, i) => ({ ...acc, [i.id]: new Animated.Value(0) }), {} as Record<string, Animated.Value>)
  );
  const [sparkleAnims] = useState(() =>
    CORRECT_ITEMS.reduce((acc, i) => ({ ...acc, [i.id]: new Animated.Value(0) }), {} as Record<string, Animated.Value>)
  );

  useEffect(() => {
    speak(VOICE_INSTRUCTION, 0.75);
  }, []);

  const triggerShake = useCallback((id: string) => {
    const anim = shakeAnims[id];
    if (!anim) return;
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [shakeAnims]);

  const triggerSparkle = useCallback((id: string) => {
    const anim = sparkleAnims[id];
    if (!anim) return;
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [sparkleAnims]);

  const handleTap = useCallback(
    (item: { id: string; label: string }) => {
      const isCorrect = CORRECT_ITEMS.some((c) => c.id === item.id);
      if (isCorrect) {
        if (selectedCorrect.has(item.id)) return;
        speak('Correct!');
        triggerSparkle(item.id);
        const next = new Set(selectedCorrect).add(item.id);
        setSelectedCorrect(next);
        if (next.size === CORRECT_ITEMS.length) {
          speak('Great job!');
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2200);
        }
      } else {
        speak('Try again');
        triggerShake(item.id);
      }
    },
    [selectedCorrect, onComplete, triggerShake, triggerSparkle]
  );

  if (showSuccess) {
    return <SuccessCelebration variant="ocean" title="Great Job!" subtitle="Beach cleaned up!" />;
  }

  return (
    <GameLayout
      title="Clean the Beach"
      instruction="Find things that start with the /f/ sound."
    >
      <View style={styles.grid}>
        {ALL_ITEMS.map((item) => {
          const isCorrect = CORRECT_ITEMS.some((c) => c.id === item.id);
          const chosen = selectedCorrect.has(item.id);
          const shake = shakeAnims[item.id];
          const spin = sparkleAnims[item.id];
          const translateX = shake?.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }) ?? 0;
          const scale = spin?.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) ?? 1;
          return (
            <Animated.View
              key={item.id}
              style={[
                styles.itemWrap,
                chosen && isCorrect && styles.itemChosen,
                { transform: [{ translateX }, { scale }] },
              ]}
            >
              <Pressable
                onPress={() => handleTap(item)}
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
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
  itemWrap: { width: '45%', maxWidth: 160 },
  item: {
    backgroundColor: '#E0F2FE',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#38BDF8',
    minHeight: 140,
  },
  itemPressed: { opacity: 0.9 },
  itemChosen: { borderColor: '#34D399', backgroundColor: '#D1FAE5' },
  image: { width: 80, height: 80, borderRadius: 12, marginBottom: 8 },
  label: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#0EA5E9' },
  confettiWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 16 },
  confettiEmoji: { fontSize: 28 },
});
