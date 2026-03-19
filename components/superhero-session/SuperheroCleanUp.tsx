/**
 * SuperheroCleanUp — Game 1: Clean It Up (Initial Sound /s/)
 * Hero words: super, shield, spider (correct); bat, cape, mask (wrong).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '../farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const CORRECT_ITEMS = [
  { id: 'super', label: 'Super', image: 'https://placehold.co/140x140/FEE2E2/991B1B?text=Super' },
  { id: 'shield', label: 'Shield', image: 'https://placehold.co/140x140/DBEAFE/1E40AF?text=Shield' },
  { id: 'spider', label: 'Spider', image: 'https://placehold.co/140x140/1F2937/F3F4F6?text=Spider' },
];
const WRONG_ITEMS = [
  { id: 'bat', label: 'Bat', image: 'https://placehold.co/140x140/E5E7EB/374151?text=Bat' },
  { id: 'cape', label: 'Cape', image: 'https://placehold.co/140x140/DDD6FE/5B21B6?text=Cape' },
  { id: 'mask', label: 'Mask', image: 'https://placehold.co/140x140/FDE68A/92400E?text=Mask' },
];
const ALL_ITEMS = [...CORRECT_ITEMS, ...WRONG_ITEMS].sort(() => Math.random() - 0.5);
const VOICE_INSTRUCTION = 'Find hero items that start with the s sound. Super, shield, spider!';

export function SuperheroCleanUp({ onComplete }: { onComplete: () => void }) {
  const [selectedCorrect, setSelectedCorrect] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [confettiAnim] = useState(() => new Animated.Value(0));
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

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="Hero sounds complete!" />;

  return (
    <GameLayout
      title="Clean It Up!"
      instruction="Find objects that start with the /s/ sound."
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
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#EF4444',
    minHeight: 140,
  },
  itemPressed: { opacity: 0.9 },
  itemChosen: { borderColor: '#3B82F6', backgroundColor: '#DBEAFE' },
  image: { width: 80, height: 80, borderRadius: 12, marginBottom: 8 },
  label: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#B91C1C' },
  confettiWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 16 },
  confettiEmoji: { fontSize: 28 },
});
