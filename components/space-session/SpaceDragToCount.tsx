/**
 * SpaceDragToCount — Game 4: Count the Stars (1–8)
 * Tap stars/planets into spaceship; count aloud One through Eight. Spaceship lights up when full.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '../farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const TOTAL_ITEMS = 8;
const COUNT_WORDS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];

export function SpaceDragToCount({ onComplete }: { onComplete: () => void }) {
  const [collected, setCollected] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [visibleCount, setVisibleCount] = useState(TOTAL_ITEMS);
  const [shipGlow] = useState(() => new Animated.Value(0));

  const collectOne = useCallback(() => {
    if (collected >= TOTAL_ITEMS) return;
    const next = collected + 1;
    setCollected(next);
    setVisibleCount((v) => Math.max(0, v - 1));
    speak(COUNT_WORDS[next - 1], 0.7);
    if (next === TOTAL_ITEMS) {
      speak('Great job!');
      Animated.timing(shipGlow, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2200);
    }
  }, [collected, onComplete, shipGlow]);

  if (showSuccess) {
    return (
      <SuccessCelebration variant="indigo" title="Great Job!" subtitle={`${TOTAL_ITEMS} stars in the spaceship!`} />
    );
  }

  const glowOpacity = shipGlow.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });

  return (
    <GameLayout
      title="Count the Stars"
      instruction="Tap each star to put it in the spaceship. Count with me!"
    >
      <View style={styles.content}>
        <View style={styles.starsRow}>
          {Array.from({ length: visibleCount }, (_, i) => (
            <Pressable
              key={i}
              onPress={collectOne}
              style={({ pressed }) => [styles.starWrap, pressed && styles.pressed]}
              accessibilityLabel={`Star ${i + 1}`}
            >
              <Text style={styles.starEmoji}>⭐</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.shipArea}>
          <Animated.View style={[styles.shipWrap, { opacity: collected > 0 ? 1 : 0.7 }]}>
            <Text style={styles.shipEmoji}>🚀</Text>
            <Text style={styles.shipLabel}>Spaceship</Text>
            {collected > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{collected}</Text>
              </View>
            )}
          </Animated.View>
          {collected < TOTAL_ITEMS && (
            <Text style={styles.hint}>Tap a star to add it to the spaceship</Text>
          )}
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingVertical: 16 },
  starsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 28,
    minHeight: 100,
  },
  starWrap: { padding: 8 },
  pressed: { opacity: 0.8 },
  starEmoji: { fontSize: 40 },
  shipArea: { alignItems: 'center', marginTop: 'auto' },
  shipWrap: {
    position: 'relative',
    padding: 20,
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#1E3A8A',
  },
  shipEmoji: { fontSize: 56 },
  shipLabel: { fontSize: 18, fontWeight: '700', color: '#1E3A8A', marginTop: 4 },
  countBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#8B5CF6',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  hint: { marginTop: 12, fontSize: 16, color: '#6b7280' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  finalNumber: { fontSize: 72, fontWeight: '800', color: '#1E3A8A', marginBottom: 8 },
  finalLabel: { fontSize: 22, color: '#3730A3', marginBottom: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#1E3A8A' },
});
