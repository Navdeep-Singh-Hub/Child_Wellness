/**
 * Level 5 Counter — Session 5, Game 1: Direction Game
 * Move character LEFT, RIGHT, UP, DOWN on a grid to reach the target.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ROWS = 3;
const COLS = 3;
const START = { row: 1, col: 1 };
const TARGET = { row: 0, col: 2 };

export interface DirectionGameCounterGameProps {
  onComplete: () => void;
}

export function DirectionGameCounterGame({ onComplete }: DirectionGameCounterGameProps) {
  const [pos, setPos] = useState(START);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    speak('Move the character to the star. Use LEFT, RIGHT, UP, and DOWN.', 0.75);
  }, []);

  const move = useCallback(
    (dr: number, dc: number) => {
      const row = Math.max(0, Math.min(ROWS - 1, pos.row + dr));
      const col = Math.max(0, Math.min(COLS - 1, pos.col + dc));
      setPos({ row, col });
      if (row === TARGET.row && col === TARGET.col) {
        speak('You reached the star! Great job!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [pos, onComplete]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Great Job!"
        subtitle="You moved to the star!"
        badgeEmoji="⭐"
      />
    );
  }

  return (
    <GameLayout
      title="Direction Game"
      instruction="Move the character to the star using the arrows."
      icon="🧭"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>Move to the star ⭐</Text>
        <View style={styles.grid}>
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => (
              <View key={`${r}-${c}`} style={styles.cell}>
                {r === pos.row && c === pos.col ? (
                  <Text style={styles.character}>🧒</Text>
                ) : r === TARGET.row && c === TARGET.col ? (
                  <Text style={styles.target}>⭐</Text>
                ) : null}
              </View>
            ))
          )}
        </View>
        <View style={styles.arrows}>
          <View style={styles.arrowRow}>
            <View style={styles.arrowSpacer} />
            <Pressable
              onPress={() => move(-1, 0)}
              style={({ pressed }) => [styles.arrowBtn, pressed && styles.pressed]}
              accessibilityLabel="Move up"
            >
              <Text style={styles.arrowText}>▲</Text>
              <Text style={styles.arrowLabel}>UP</Text>
            </Pressable>
            <View style={styles.arrowSpacer} />
          </View>
          <View style={styles.arrowRow}>
            <Pressable
              onPress={() => move(0, -1)}
              style={({ pressed }) => [styles.arrowBtn, pressed && styles.pressed]}
              accessibilityLabel="Move left"
            >
              <Text style={styles.arrowText}>◀</Text>
              <Text style={styles.arrowLabel}>LEFT</Text>
            </Pressable>
            <View style={styles.arrowSpacer} />
            <Pressable
              onPress={() => move(0, 1)}
              style={({ pressed }) => [styles.arrowBtn, pressed && styles.pressed]}
              accessibilityLabel="Move right"
            >
              <Text style={styles.arrowText}>▶</Text>
              <Text style={styles.arrowLabel}>RIGHT</Text>
            </Pressable>
          </View>
          <View style={styles.arrowRow}>
            <View style={styles.arrowSpacer} />
            <Pressable
              onPress={() => move(1, 0)}
              style={({ pressed }) => [styles.arrowBtn, pressed && styles.pressed]}
              accessibilityLabel="Move down"
            >
              <Text style={styles.arrowText}>▼</Text>
              <Text style={styles.arrowLabel}>DOWN</Text>
            </Pressable>
            <View style={styles.arrowSpacer} />
          </View>
        </View>
      </View>
    </GameLayout>
  );
}

const CELL_SIZE = 56;

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 18, fontWeight: '700', color: '#0369A1', marginBottom: 16 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: COLS * CELL_SIZE,
    height: ROWS * CELL_SIZE,
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#38BDF8',
    marginBottom: 24,
    overflow: 'hidden',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  character: { fontSize: 32 },
  target: { fontSize: 28 },
  arrows: { gap: 8 },
  arrowRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  arrowSpacer: { width: 72 },
  arrowBtn: {
    width: 72,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#38BDF8',
    alignItems: 'center',
  },
  arrowText: { fontSize: 24, color: '#0EA5E9', marginBottom: 2 },
  arrowLabel: { fontSize: 12, fontWeight: '800', color: '#0369A1' },
  pressed: { opacity: 0.9, backgroundColor: '#E0F2FE' },
});
