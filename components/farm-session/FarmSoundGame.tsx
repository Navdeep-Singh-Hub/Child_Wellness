/**
 * FarmSoundGame.tsx — Game 1: Clean It Up! (Initial Sound /c/)
 * Find things that start with the /c/ sound. Correct: cow, cat, carrot. Wrong: dog, pig, barn.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
import { GameLayout } from './GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const CORRECT_ITEMS = [
  { id: 'cow', label: 'Cow', image: 'https://placehold.co/140x140/86efac/166534?text=Cow' },
  { id: 'cat', label: 'Cat', image: 'https://placehold.co/140x140/86efac/166534?text=Cat' },
  { id: 'carrot', label: 'Carrot', image: 'https://placehold.co/140x140/fde047/92400e?text=Carrot' },
];
const WRONG_ITEMS = [
  { id: 'dog', label: 'Dog', image: 'https://placehold.co/140x140/fecaca/991b1b?text=Dog' },
  { id: 'pig', label: 'Pig', image: 'https://placehold.co/140x140/fecaca/991b1b?text=Pig' },
  { id: 'barn', label: 'Barn', image: 'https://placehold.co/140x140/fecaca/991b1b?text=Barn' },
];
const ALL_ITEMS = [...CORRECT_ITEMS, ...WRONG_ITEMS].sort(() => Math.random() - 0.5);
const VOICE_INSTRUCTION = 'Find things that start with the c sound.';

export function FarmSoundGame({ onComplete }: { onComplete: () => void }) {
  const [selectedCorrect, setSelectedCorrect] = useState<Set<string>>(new Set());
  const [wrongTaps, setWrongTaps] = useState<Record<string, number>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    speak(VOICE_INSTRUCTION, 0.75);
  }, []);

  const [shakeAnims] = useState(() =>
    ALL_ITEMS.reduce((acc, i) => ({ ...acc, [i.id]: new Animated.Value(0) }), {} as Record<string, Animated.Value>)
  );
  const [sparkleAnims] = useState(() =>
    CORRECT_ITEMS.reduce((acc, i) => ({ ...acc, [i.id]: new Animated.Value(0) }), {} as Record<string, Animated.Value>)
  );

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
        setWrongTaps((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
      }
    },
    [selectedCorrect, onComplete, triggerShake, triggerSparkle]
  );

  if (showSuccess) {
    return <SuccessCelebration variant="mint" title="Great Job!" subtitle="You found all the /c/ words!" />;
  }

  return (
    <GameLayout
      title="Clean It Up!"
      instruction="Find things that start with the /c/ sound."
    >
      <View style={styles.grid}>
        {ALL_ITEMS.map((item) => {
          const isCorrect = CORRECT_ITEMS.some((c) => c.id === item.id);
          const chosen = selectedCorrect.has(item.id);
          const shake = shakeAnims[item.id];
          const spin = sparkleAnims[item.id];
          const translateX = shake
            ? shake.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 8],
              })
            : 0;
          const scale = spin
            ? spin.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.15],
              })
            : 1;
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
                style={({ pressed }) => [
                  styles.item,
                  pressed && styles.itemPressed,
                ]}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  itemWrap: {
    width: '45%',
    maxWidth: 160,
  },
  item: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#f59e0b',
    minHeight: 140,
  },
  itemPressed: { opacity: 0.9 },
  itemChosen: { opacity: 0.85 },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#4CAF50',
  },
  confettiWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  confettiEmoji: { fontSize: 28 },
});
