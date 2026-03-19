/**
 * MusicDragToCount — Game 4: Count the Musical Notes (1–10)
 * Tap notes into music box; count aloud One through Ten. Notes glow on completion.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '../farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const TOTAL_ITEMS = 10;
const COUNT_WORDS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

export function MusicDragToCount({ onComplete }: { onComplete: () => void }) {
  const [collected, setCollected] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [visibleCount, setVisibleCount] = useState(TOTAL_ITEMS);
  const [boxGlow] = useState(() => new Animated.Value(0));

  const collectOne = useCallback(() => {
    if (collected >= TOTAL_ITEMS) return;
    const next = collected + 1;
    setCollected(next);
    setVisibleCount((v) => Math.max(0, v - 1));
    speak(COUNT_WORDS[next - 1], 0.7);
    if (next === TOTAL_ITEMS) {
      speak('Great job!');
      Animated.timing(boxGlow, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      setShowSuccess(true);
      setTimeout(() => onComplete(), 2200);
    }
  }, [collected, onComplete, boxGlow]);

  if (showSuccess) return <SuccessCelebration variant="sunset" title="Great Job!" subtitle={`${TOTAL_ITEMS} notes in the music box!`} />;

  return (
    <GameLayout
      title="Count the Musical Notes"
      instruction="Tap each note to put it in the music box. Count with me!"
    >
      <View style={styles.content}>
        <View style={styles.notesRow}>
          {Array.from({ length: visibleCount }, (_, i) => (
            <Pressable
              key={i}
              onPress={collectOne}
              style={({ pressed }) => [styles.noteWrap, pressed && styles.pressed]}
              accessibilityLabel={`Note ${i + 1}`}
            >
              <Text style={styles.noteEmoji}>🎵</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.boxArea}>
          <Animated.View style={[styles.boxWrap, { opacity: collected > 0 ? 1 : 0.7 }]}>
            <Text style={styles.boxEmoji}>🎶</Text>
            <Text style={styles.boxLabel}>Music box</Text>
            {collected > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{collected}</Text>
              </View>
            )}
          </Animated.View>
          {collected < TOTAL_ITEMS && (
            <Text style={styles.hint}>Tap a note to add it to the music box</Text>
          )}
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingVertical: 16 },
  notesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
    minHeight: 100,
  },
  noteWrap: { padding: 6 },
  pressed: { opacity: 0.8 },
  noteEmoji: { fontSize: 36 },
  boxArea: { alignItems: 'center', marginTop: 'auto' },
  boxWrap: {
    position: 'relative',
    padding: 20,
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#8B5CF6',
    alignItems: 'center',
    minWidth: 160,
  },
  boxEmoji: { fontSize: 48, marginBottom: 8 },
  boxLabel: { fontSize: 18, fontWeight: '700', color: '#5B21B6' },
  countBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#3B82F6',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  hint: { fontSize: 16, color: '#6b7280', marginTop: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  finalNumber: { fontSize: 56, fontWeight: '800', color: '#8B5CF6' },
  finalLabel: { fontSize: 22, color: '#5B21B6', marginTop: 8 },
  successText: { fontSize: 32, fontWeight: '800', color: '#6D28D9', marginTop: 16 },
});
