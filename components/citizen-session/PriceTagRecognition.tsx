/**
 * Game 3 — Find the price. Display price tags ₹10, ₹20, ₹50. Instruction: "Tap the ₹20 price tag." Session 4: Store Signs.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PRICE_TAGS = [
  { id: '₹10', label: '₹10', color: '#1E40AF', bg: '#DBEAFE' },
  { id: '₹20', label: '₹20', color: '#166534', bg: '#DCFCE7' },
  { id: '₹50', label: '₹50', color: '#831843', bg: '#FBCFE8' },
];
const CORRECT = '₹20';
const VOICE = 'Tap the twenty rupees price tag.';

export function PriceTagRecognition({ onComplete }: { onComplete: () => void }) {
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
      if (id !== CORRECT) {
        speak('Try again.');
        triggerShake();
        return;
      }
      speak('Correct! Twenty rupees!');
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2200);
    },
    [onComplete, triggerShake]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="You found ₹20!" />;

  const shakeX = shakeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <GameLayout
      title="Find the price"
      instruction="Tap the ₹20 price tag."
      icon="🏷️"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.prompt}>Which price tag is ₹20?</Text>
        <View style={styles.tagsRow}>
          {PRICE_TAGS.map((tag) => (
            <Animated.View
              key={tag.id}
              style={[
                styles.tagCard,
                { backgroundColor: tag.bg, borderColor: tag.color },
                tag.id === CORRECT && { borderWidth: 4 },
                { transform: [{ translateX: tag.id === CORRECT ? 0 : shakeX }] },
              ]}
            >
              <Pressable
                onPress={() => handleTap(tag.id)}
                style={({ pressed }) => [styles.tagTouch, pressed && styles.pressed]}
                accessibilityLabel={`Price ${tag.label}`}
              >
                <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
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
  prompt: { fontSize: 20, fontWeight: '800', color: '#374151', marginBottom: 24, textAlign: 'center' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  tagCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  tagTouch: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.9 },
  tagText: { fontSize: 22, fontWeight: '800' },
});
