/**
 * Level 7 Reader — Session 8, Game 3: Shape Puzzle
 * Fit shapes into complex board. Circle, square, triangle → matching holes.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const SHAPES = [
  { id: 'circle', label: 'Circle', symbol: '⭕' },
  { id: 'square', label: 'Square', symbol: '⬜' },
  { id: 'triangle', label: 'Triangle', symbol: '🔺' },
] as const;

type ShapeId = (typeof SHAPES)[number]['id'];

export interface ShapePuzzleComplexReaderSession8GameProps {
  onComplete: () => void;
}

export function ShapePuzzleComplexReaderSession8Game({ onComplete }: ShapePuzzleComplexReaderSession8GameProps) {
  const [slots, setSlots] = useState<Record<ShapeId, boolean>>({ circle: false, square: false, triangle: false });
  const [selectedShape, setSelectedShape] = useState<ShapeId | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Fit each shape into its matching hole on the board. Tap a shape, then tap the correct hole.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Each shape fits in its own hole.', 0.7);
  }, [wrongShake]);

  const handleShapeTap = useCallback((id: ShapeId) => {
    const placed = Object.values(slots).filter(Boolean).length;
    if (placed >= 3) return;
    setSelectedShape(id);
    const shape = SHAPES.find((s) => s.id === id);
    speak(shape?.label ?? id, 0.6);
  }, [slots]);

  const handleHoleTap = useCallback(
    (holeId: ShapeId) => {
      if (!selectedShape || slots[holeId]) return;
      if (selectedShape !== holeId) {
        triggerWrong();
        setSelectedShape(null);
        return;
      }
      const next = { ...slots, [holeId]: true };
      setSlots(next);
      setSelectedShape(null);
      speak('Correct!', 0.6);
      const allFilled = (SHAPES as readonly { id: ShapeId }[]).every((s) => next[s.id]);
      if (allFilled) {
        speak('You fitted all the shapes!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [selectedShape, slots, onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You fitted all the shapes!"
        badgeEmoji="🧩"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const placedCount = Object.values(slots).filter(Boolean).length;

  return (
    <GameLayout
      title="Shape Puzzle"
      instruction="Fit each shape into its matching hole on the board."
      icon="🧩"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Shapes</Text>
        <Animated.View style={[styles.shapesRow, { transform: [{ translateX: shakeX }] }]}>
          {SHAPES.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => handleShapeTap(s.id)}
              style={[
                styles.shapeBtn,
                selectedShape === s.id && styles.selected,
                placedCount >= 3 && styles.placed,
              ]}
              accessibilityLabel={s.label}
            >
              <Text style={styles.shapeSymbol}>{s.symbol}</Text>
              <Text style={styles.shapeLabel}>{s.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
        <Text style={styles.label}>Board — tap the matching hole</Text>
        <View style={styles.board}>
          <View style={styles.holesRow}>
            {SHAPES.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => handleHoleTap(s.id)}
                style={[styles.hole, slots[s.id] && styles.holeFilled]}
                accessibilityLabel={`${s.label} hole`}
              >
                <Text style={styles.holeSymbol}>{slots[s.id] ? s.symbol : '?'}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#4338CA', marginBottom: 12 },
  shapesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginBottom: 24 },
  shapeBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#818CF8',
    backgroundColor: '#FFF',
    alignItems: 'center',
    minWidth: 90,
  },
  selected: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
  placed: { opacity: 0.6 },
  shapeSymbol: { fontSize: 38, marginBottom: 6 },
  shapeLabel: { fontSize: 14, fontWeight: '700', color: '#4338CA' },
  board: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 4,
    borderColor: '#6366F1',
  },
  holesRow: { flexDirection: 'row', gap: 20, justifyContent: 'center' },
  hole: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#C7D2FE',
    borderWidth: 4,
    borderColor: '#818CF8',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  holeFilled: { backgroundColor: '#EEF2FF', borderStyle: 'solid' },
  holeSymbol: { fontSize: 32 },
});
