/**
 * FarmCountingGame.tsx — Game 4: Counting Objects (Drag and Count)
 * 3 apples scattered; child drags (or taps) apples into basket. Voice counts "1", "2", "3".
 * Uses tap-to-collect for reliability on tablets; optional drag can be added via gesture-handler.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
} from 'react-native';
import { GameLayout } from './GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const APPLE_IMAGE = 'https://placehold.co/80x80/ef4444/ffffff?text=🍎';
const BASKET_IMAGE = 'https://placehold.co/160x100/92400e/ffffff?text=Basket';
const TOTAL_APPLES = 3;
const COUNT_WORDS = ['One', 'Two', 'Three'];

export function FarmCountingGame({ onComplete }: { onComplete: () => void }) {
  const [collected, setCollected] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [visibleApples, setVisibleApples] = useState(TOTAL_APPLES);

  const collectApple = useCallback(() => {
    if (collected >= TOTAL_APPLES) return;
    const next = collected + 1;
    setCollected(next);
    setVisibleApples((v) => Math.max(0, v - 1));
    speak(COUNT_WORDS[next - 1], 0.7);
    if (next === TOTAL_APPLES) {
      speak('Great job!');
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2200);
    }
  }, [collected, onComplete]);

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Great Job!"
        subtitle="3 apples in the basket!"
      >
        <Text style={styles.finalNumber}>{TOTAL_APPLES}</Text>
      </SuccessCelebration>
    );
  }

  return (
    <GameLayout
      title="Count the Apples"
      instruction="Drag apples into the basket. Count: One, Two, Three!"
    >
      <View style={styles.content}>
        <View style={styles.applesRow}>
          {Array.from({ length: visibleApples }, (_, i) => (
            <Pressable
              key={i}
              onPress={collectApple}
              style={({ pressed }) => [
                styles.appleWrap,
                pressed && styles.pressed,
              ]}
              accessibilityLabel={`Apple ${i + 1}`}
            >
              <Image source={{ uri: APPLE_IMAGE }} style={styles.appleImg} />
            </Pressable>
          ))}
        </View>
        <View style={styles.basketArea}>
          <View style={styles.basketWrap}>
            <Image source={{ uri: BASKET_IMAGE }} style={styles.basketImg} />
            {collected > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{collected}</Text>
              </View>
            )}
          </View>
          {collected < TOTAL_APPLES && (
            <Text style={styles.hint}>
              Tap an apple to add it to the basket
            </Text>
          )}
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingVertical: 16,
  },
  applesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 32,
    minHeight: 100,
  },
  appleWrap: {
    padding: 8,
  },
  pressed: { opacity: 0.8 },
  appleImg: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  basketArea: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  basketWrap: {
    position: 'relative',
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#f59e0b',
  },
  basketImg: {
    width: 160,
    height: 100,
    borderRadius: 12,
  },
  countBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#22c55e',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  finalNumber: {
    fontSize: 72,
    fontWeight: '800',
    color: '#4CAF50',
    marginBottom: 8,
  },
  finalLabel: {
    fontSize: 22,
    color: '#2E7D32',
    marginBottom: 24,
  },
  hint: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
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
});
