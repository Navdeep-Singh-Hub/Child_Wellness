/**
 * Level 9 (Clockwise) — Session 2, Game 2: Spot the Difference
 * Two pictures with 5 differences. User taps each difference on the right picture.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PICTURE_LEFT = ['🍎', '🐱', '☀️', '🌳', '📚', '🚗'];
const PICTURE_RIGHT = ['🍊', '🐕', '🌙', '🌸', '📖', '🚗'];
const DIFFERENCE_INDICES = [0, 1, 2, 3, 4];
const TOTAL_DIFFS = 5;

export interface SpotTheDifference5Level9Session2GameProps {
  onComplete: () => void;
}

export function SpotTheDifference5Level9Session2Game({ onComplete }: SpotTheDifference5Level9Session2GameProps) {
  const [found, setFound] = useState<Set<number>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Find 5 differences. Look at both pictures. Tap each difference on the right.', 0.75);
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
          if (next.size >= TOTAL_DIFFS) {
            speak('You found all 5 differences!', 0.75);
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
        variant="indigo"
        title="Great Job!"
        subtitle="You found all 5 differences!"
        badgeEmoji="🔍"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Spot the Difference"
      instruction="Find 5 differences. Tap each one on the right picture."
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
        <Text style={styles.hint}>Tap the 5 differences in Picture B ({found.size}/5)</Text>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  picturesRow: { flexDirection: 'row', gap: 16, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' },
  pictureBox: { alignItems: 'center' },
  pictureLabel: { fontSize: 14, fontWeight: '700', color: '#4338CA', marginBottom: 8 },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 160 },
  item: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  tappable: { borderWidth: 3, borderColor: '#818CF8' },
  found: { backgroundColor: '#C7D2FE' },
  emoji: { fontSize: 26 },
  check: { position: 'absolute', right: 2, top: 2, fontSize: 14, color: '#22C55E', fontWeight: '800' },
  hint: { fontSize: 16, fontWeight: '700', color: '#64748B' },
});
