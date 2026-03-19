/**
 * SpaceCleanUp — Game 1: Clean It Up (Initial Sound /s/)
 * Space: tap sun, satellite, star (correct); rocket, moon, planet (wrong).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '../farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const CORRECT_ITEMS = [
  { id: 'sun', label: 'Sun', image: 'https://placehold.co/140x140/FEF08A/854D0E?text=Sun' },
  { id: 'satellite', label: 'Satellite', image: 'https://placehold.co/140x140/E0E7FF/4338CA?text=Sat' },
  { id: 'star', label: 'Star', image: 'https://placehold.co/140x140/FEF08A/92400E?text=Star' },
];
const WRONG_ITEMS = [
  { id: 'rocket', label: 'Rocket', image: 'https://placehold.co/140x140/FECACA/991B1B?text=Rocket' },
  { id: 'moon', label: 'Moon', image: 'https://placehold.co/140x140/E5E7EB/374151?text=Moon' },
  { id: 'planet', label: 'Planet', image: 'https://placehold.co/140x140/A78BFA/5B21B6?text=Planet' },
];
const ALL_ITEMS = [...CORRECT_ITEMS, ...WRONG_ITEMS].sort(() => Math.random() - 0.5);
const VOICE_INSTRUCTION = 'Help the astronaut collect space items that start with the s sound.';

export function SpaceCleanUp({ onComplete }: { onComplete: () => void }) {
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

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="Space clean-up complete!" />;

  return (
    <GameLayout
      title="Space Clean-Up"
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
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#1E3A8A',
    minHeight: 140,
  },
  itemPressed: { opacity: 0.9 },
  itemChosen: { borderColor: '#8B5CF6', backgroundColor: '#EDE9FE' },
  image: { width: 80, height: 80, borderRadius: 12, marginBottom: 8 },
  label: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#1E3A8A' },
  confettiWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 16 },
  confettiEmoji: { fontSize: 28 },
});
