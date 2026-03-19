/**
 * Rhyme Match — Find the rhyme (fan → man). Game 2 for Grouper Session 6.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PROMPT_WORD = 'fan';
const CHOICES = [
  { id: 'man', label: 'man', correct: true, image: 'https://placehold.co/120x120/DBEAFE/1E40AF?text=man' },
  { id: 'dog', label: 'dog', correct: false, image: 'https://placehold.co/120x120/FDE68A/92400E?text=dog' },
  { id: 'cup', label: 'cup', correct: false, image: 'https://placehold.co/120x120/FEF3C7/B45309?text=cup' },
].sort(() => Math.random() - 0.5);

export function RhymeMatchAN({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeAnims] = useState(() =>
    CHOICES.reduce((acc, i) => ({ ...acc, [i.id]: new Animated.Value(0) }), {} as Record<string, Animated.Value>)
  );
  const [starScale] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak(`Find the word that rhymes with ${PROMPT_WORD}.`, 0.75);
  }, []);

  const triggerShake = useCallback((id: string) => {
    const a = shakeAnims[id];
    if (!a) return;
    Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnims]);

  const triggerStar = useCallback(() => {
    starScale.setValue(0);
    Animated.spring(starScale, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 8 }).start();
  }, [starScale]);

  const handleTap = useCallback(
    (choice: { id: string; correct: boolean }) => {
      if (choice.correct) {
        speak('Correct!');
        triggerStar();
        setShowSuccess(true);
        setTimeout(() => onComplete(), 1800);
      } else {
        speak('Try again.');
        triggerShake(choice.id);
      }
    },
    [onComplete, triggerShake, triggerStar]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" />;

  const starScaleVal = starScale.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] });

  return (
    <GameLayout
      title="Find the rhyme"
      instruction={`Find the word that rhymes with ${PROMPT_WORD}.`}
    >
      <View style={styles.content}>
        <View style={styles.promptBox}>
          <Text style={styles.promptWord}>{PROMPT_WORD}</Text>
        </View>
        <Text style={styles.hint}>Tap the word that rhymes:</Text>
        <View style={styles.choicesRow}>
          {CHOICES.map((c) => {
            const shake = shakeAnims[c.id];
            const translateX = shake?.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }) ?? 0;
            return (
              <Animated.View key={c.id} style={{ transform: [{ translateX }] }}>
                <Pressable
                  onPress={() => handleTap(c)}
                  style={({ pressed }) => [styles.choiceBtn, pressed && styles.pressed]}
                  accessibilityLabel={c.label}
                >
                  <Image source={{ uri: c.image }} style={styles.choiceImage} />
                  <Text style={styles.choiceLabel}>{c.label}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
        <Animated.View style={[styles.starWrap, { transform: [{ scale: starScaleVal }] }]}>
          <Text style={styles.starEmoji}>⭐</Text>
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', paddingVertical: 24 },
  promptBox: {
    backgroundColor: '#E0E7FF',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#4F46E5',
    marginBottom: 24,
  },
  promptWord: { fontSize: 32, fontWeight: '800', color: '#3730A3' },
  hint: { fontSize: 20, color: '#4b5563', marginBottom: 20 },
  choicesRow: { flexDirection: 'row', gap: 20, flexWrap: 'wrap', justifyContent: 'center' },
  choiceBtn: {
    backgroundColor: '#F3F4F6',
    padding: 20,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#4F46E5',
    alignItems: 'center',
    minWidth: 100,
  },
  pressed: { opacity: 0.9 },
  choiceImage: { width: 72, height: 72, borderRadius: 10, marginBottom: 8 },
  choiceLabel: { fontSize: 22, fontWeight: '800', color: '#1f2937' },
  starWrap: { marginTop: 24 },
  starEmoji: { fontSize: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#22C55E' },
});
