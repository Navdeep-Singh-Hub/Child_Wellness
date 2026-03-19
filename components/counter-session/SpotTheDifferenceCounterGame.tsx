/**
 * Level 5 Counter — Session 6, Game 1: Spot the Difference
 * Two images with 3 differences. User taps each difference on the right picture.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PICTURE_LEFT = ['🍎', '🌙', '⭐', '🐱'];
const PICTURE_RIGHT = ['🍊', '☀️', '⭐', '🐕'];
const DIFFERENCE_INDICES = [0, 1, 3];

export interface SpotTheDifferenceCounterGameProps {
  onComplete: () => void;
}

export function SpotTheDifferenceCounterGame({ onComplete }: SpotTheDifferenceCounterGameProps) {
  const [found, setFound] = useState<Set<number>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Find 3 differences. Look at both pictures. Tap each difference on the right.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Find what is different on the right picture.', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (index: number) => {
      if (found.has(index)) return;
      if (DIFFERENCE_INDICES.includes(index)) {
        setFound((prev) => {
          const next = new Set(prev).add(index);
          if (next.size >= 3) {
            speak('You found all 3 differences!', 0.75);
            setShowSuccess(true);
            setTimeout(() => onComplete(), 2200);
          } else {
            speak('Good! Find the next difference.', 0.7);
          }
          return next;
        });
      } else {
        triggerWrong();
      }
    },
    [found, onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Great Job!"
        subtitle="You found all 3 differences!"
        badgeEmoji="🔍"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Spot the Difference"
      instruction="Find 3 differences. Tap each one on the right picture."
      icon="🔍"
      backgroundVariant="ocean"
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
                  style={[
                    styles.item,
                    styles.tappable,
                    found.has(i) && styles.found,
                    { opacity: found.has(i) ? 0.5 : 1 },
                  ]}
                  accessibilityLabel={found.has(i) ? 'Found' : `Item ${i + 1}`}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                  {found.has(i) ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              ))}
            </Animated.View>
          </View>
        </View>
        <Text style={styles.hint}>Tap the 3 differences in Picture B ({found.size}/3)</Text>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  picturesRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  pictureBox: {
    backgroundColor: '#E0F2FE',
    borderRadius: 16,
    padding: 12,
    borderWidth: 3,
    borderColor: '#38BDF8',
  },
  pictureLabel: { fontSize: 14, fontWeight: '800', color: '#0369A1', marginBottom: 8, textAlign: 'center' },
  itemsRow: { flexDirection: 'row', gap: 8 },
  item: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  tappable: {},
  found: { borderWidth: 3, borderColor: '#22C55E', borderRadius: 10 },
  emoji: { fontSize: 28 },
  check: { position: 'absolute', bottom: 2, right: 4, fontSize: 14, color: '#22C55E', fontWeight: '800' },
  hint: { fontSize: 16, fontWeight: '700', color: '#64748B' },
});
