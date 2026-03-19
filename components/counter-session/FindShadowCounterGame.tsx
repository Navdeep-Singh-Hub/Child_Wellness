/**
 * Level 5 Counter — Session 4, Game 4: Find the Shadow
 * Match object to its shadow. Show ball; three shadow options (circle = ball shadow, square, triangle). Correct: circle.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const OBJECT = { emoji: '⚽', label: 'Ball' };
const SHADOWS = [
  { id: 'circle', label: 'Circle', isCorrect: true },
  { id: 'square', label: 'Square', isCorrect: false },
  { id: 'triangle', label: 'Triangle', isCorrect: false },
];
const CORRECT_ID = 'circle';

export interface FindShadowCounterGameProps {
  onComplete: () => void;
}

export function FindShadowCounterGame({ onComplete }: FindShadowCounterGameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Match the ball to its shadow. Which shadow matches the ball?', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. The ball is round. Find the round shadow.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === CORRECT_ID) {
        speak('Correct! The circle is the ball\'s shadow!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        triggerWrong();
      }
    },
    [onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Great Job!"
        subtitle="You found the shadow!"
        badgeEmoji="👤"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Find the Shadow"
      instruction="Match the object to its shadow."
      icon="🌑"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Which shadow matches the ball?</Text>
        <View style={styles.objectRow}>
          <Text style={styles.objectEmoji}>{OBJECT.emoji}</Text>
          <Text style={styles.objectLabel}>{OBJECT.label}</Text>
        </View>
        <Text style={styles.tapLabel}>Tap the matching shadow</Text>
        <Animated.View style={[styles.shadowsRow, { transform: [{ translateX: shakeX }] }]}>
          <Pressable
            onPress={() => handleTap('circle')}
            style={({ pressed }) => [styles.shadowBtn, pressed && styles.pressed]}
            accessibilityLabel="Circle shadow"
          >
            <View style={styles.shadowCircle} />
            <Text style={styles.shadowLabel}>Circle</Text>
          </Pressable>
          <Pressable
            onPress={() => handleTap('square')}
            style={({ pressed }) => [styles.shadowBtn, pressed && styles.pressed]}
            accessibilityLabel="Square shadow"
          >
            <View style={styles.shadowSquare} />
            <Text style={styles.shadowLabel}>Square</Text>
          </Pressable>
          <Pressable
            onPress={() => handleTap('triangle')}
            style={({ pressed }) => [styles.shadowBtn, pressed && styles.pressed]}
            accessibilityLabel="Triangle shadow"
          >
            <View style={styles.shadowTriangle} />
            <Text style={styles.shadowLabel}>Triangle</Text>
          </Pressable>
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 22, fontWeight: '800', color: '#0369A1', marginBottom: 16, textAlign: 'center' },
  objectRow: { alignItems: 'center', marginBottom: 28 },
  objectEmoji: { fontSize: 64, marginBottom: 8 },
  objectLabel: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  shadowsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, justifyContent: 'center' },
  shadowBtn: {
    minWidth: 100,
    paddingVertical: 20,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#38BDF8',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  shadowCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#475569',
    marginBottom: 8,
  },
  shadowSquare: {
    width: 44,
    height: 44,
    backgroundColor: '#475569',
    borderRadius: 6,
    marginBottom: 8,
  },
  shadowTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 24,
    borderRightWidth: 24,
    borderBottomWidth: 42,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#475569',
    marginBottom: 8,
  },
  shadowLabel: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  pressed: { opacity: 0.9, backgroundColor: '#E0F2FE' },
});
