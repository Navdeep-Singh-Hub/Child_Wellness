/**
 * Builder Session 4 — Game 2: Drag & Drop Shapes
 * Place shapes into correct holes. Tap shape then tap matching hole.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const SHAPES = [
  { id: 'circle', label: 'Circle', shape: 'circle' as const, color: '#8B5CF6', emoji: '⭕' },
  { id: 'square', label: 'Square', shape: 'square' as const, color: '#F59E0B', emoji: '⬜' },
  { id: 'triangle', label: 'Triangle', shape: 'triangle' as const, color: '#10B981', emoji: '🔺' },
];

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface ShapeHolesGameProps {
  onComplete: () => void;
}

export function ShapeHolesGame({ onComplete }: ShapeHolesGameProps) {
  const [shuffledShapes] = useState(() => shuffleArray(SHAPES));
  const [shuffledHoles] = useState(() => shuffleArray(SHAPES));
  const [placed, setPlaced] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Place each shape in its matching hole. Tap a shape, then tap the correct hole.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Match the shape to its hole.', 0.7);
  }, [wrongShake]);

  const handleShapeTap = useCallback((id: string) => {
    if (placed.has(id)) return;
    setSelectedId(id);
    speak(SHAPES.find((s) => s.id === id)?.label ?? id, 0.7);
  }, [placed]);

  const handleHoleTap = useCallback(
    (holeId: string) => {
      if (!selectedId) return;
      if (selectedId !== holeId) {
        triggerWrong();
        setSelectedId(null);
        return;
      }
      speak(`Correct! ${SHAPES.find((s) => s.id === selectedId)?.label} fits!`, 0.7);
      setPlaced((p) => new Set(p).add(selectedId));
      setSelectedId(null);
      if (placed.size + 1 >= shuffledShapes.length) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [selectedId, placed, onComplete, triggerWrong, shuffledShapes.length]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Great Job!"
        subtitle="You placed all the shapes!"
        badgeEmoji="⬜"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Place Shapes"
      instruction="Tap a shape, then tap the matching hole."
      icon="⬜"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Shapes</Text>
        <Animated.View style={[styles.shapesRow, { transform: [{ translateX: shakeX }] }]}>
          {shuffledShapes.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => handleShapeTap(s.id)}
              style={[
                styles.shapeBtn,
                selectedId === s.id && styles.shapeSelected,
                placed.has(s.id) && styles.shapePlaced,
              ]}
              accessibilityLabel={s.label}
            >
              <Text style={styles.shapeEmoji}>{s.emoji}</Text>
            </Pressable>
          ))}
        </Animated.View>
        <Text style={styles.label}>Holes</Text>
        <View style={styles.holesRow}>
          {shuffledHoles.map((s) => (
            <View key={`hole-${s.id}`} style={styles.holeWrap}>
              <Pressable
                onPress={() => handleHoleTap(s.id)}
                style={[
                  styles.hole,
                  placed.has(s.id) && styles.holeFilled,
                ]}
                accessibilityLabel={`${s.label} hole`}
              >
                {placed.has(s.id) ? (
                  <Text style={styles.filledEmoji}>{s.emoji}</Text>
                ) : (
                  <Text style={styles.holeGhostEmoji}>{s.emoji}</Text>
                )}
              </Pressable>
              <Text style={styles.holeLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
        {selectedId ? (
          <Text style={styles.hint}>Tap the {SHAPES.find((s) => s.id === selectedId)?.label.toLowerCase()} hole</Text>
        ) : (
          <Text style={styles.hint}>First tap a shape, then tap the same hole.</Text>
        )}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#4F46E5', marginBottom: 12 },
  shapesRow: { flexDirection: 'row', gap: 20, marginBottom: 28 },
  shapeBtn: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shapeEmoji: { fontSize: 36 },
  shapeSelected: { borderColor: '#22C55E', backgroundColor: '#DCFCE7' },
  shapePlaced: { opacity: 0.4 },
  holesRow: { flexDirection: 'row', gap: 24 },
  holeWrap: { alignItems: 'center', gap: 6 },
  hole: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    borderWidth: 4,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  holeFilled: { backgroundColor: '#F3F4F6' },
  holeGhostEmoji: { fontSize: 30, opacity: 0.35 },
  holeLabel: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  filledEmoji: { fontSize: 32 },
  hint: { marginTop: 14, fontSize: 16, fontWeight: '600', color: '#6B7280' },
});
