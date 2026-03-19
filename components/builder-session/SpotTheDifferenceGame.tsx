/**
 * Builder Session 9 — Game 1: Spot the Difference
 * Find the difference between two pictures. Left: sun, cloud, star. Right: sun, cloud, moon. Tap the different one.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PICTURE_LEFT = ['🌞', '☁️', '⭐'];
const PICTURE_RIGHT = ['🌞', '☁️', '🌙']; // difference at index 2
const CORRECT_INDEX = 2;

export interface SpotTheDifferenceGameProps {
  onComplete: () => void;
}

export function SpotTheDifferenceGame({ onComplete }: SpotTheDifferenceGameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Find the difference. Look at both pictures. Tap the one that is different on the right.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Look at the right picture and find what is different.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (index: number) => {
      if (index === CORRECT_INDEX) {
        speak('Correct! The moon is different!', 0.75);
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
        variant="mint"
        title="Great Job!"
        subtitle="You found the difference!"
        badgeEmoji="🔍"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Spot the Difference"
      instruction="Tap the picture on the right that is different."
      icon="🔍"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <View style={styles.picturesRow}>
          <View style={styles.pictureBox}>
            <Text style={styles.pictureLabel}>Picture A</Text>
            <View style={styles.itemsRow}>
              {PICTURE_LEFT.map((emoji, i) => (
                <View key={i} style={styles.item}>
                  <Text style={styles.emoji}>{emoji}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.pictureBox}>
            <Text style={styles.pictureLabel}>Picture B</Text>
            <Animated.View style={[styles.itemsRow, { transform: [{ translateX: shakeX }] }]}>
              {PICTURE_RIGHT.map((emoji, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleTap(i)}
                  style={({ pressed }) => [styles.item, styles.tappable, pressed && styles.pressed]}
                  accessibilityLabel={`Item ${i + 1}: ${emoji}`}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </Pressable>
              ))}
            </Animated.View>
          </View>
        </View>
        <Text style={styles.hint}>Tap the one in Picture B that is different</Text>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  picturesRow: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  pictureBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 3,
    borderColor: '#A78BFA',
    minWidth: 130,
  },
  pictureLabel: { fontSize: 14, fontWeight: '800', color: '#5B21B6', marginBottom: 12, textAlign: 'center' },
  itemsRow: { flexDirection: 'row', gap: 8 },
  item: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tappable: { borderWidth: 3, borderColor: '#A78BFA' },
  emoji: { fontSize: 28 },
  pressed: { opacity: 0.8, backgroundColor: '#DDD6FE' },
  hint: { fontSize: 16, color: '#6B7280', fontWeight: '600', textAlign: 'center' },
});
