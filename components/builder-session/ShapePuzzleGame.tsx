/**
 * Builder Session 2 — Game 4: Shape Puzzle
 * User completes a simple 2x2 square puzzle: place 4 pieces in the correct slots.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PIECES = [
  { id: 'tl', label: 'Top-left', color: '#FBBF24' },
  { id: 'tr', label: 'Top-right', color: '#3B82F6' },
  { id: 'bl', label: 'Bottom-left', color: '#10B981' },
  { id: 'br', label: 'Bottom-right', color: '#EF4444' },
];
const CORRECT_ORDER = ['tl', 'tr', 'bl', 'br']; // top-left, top-right, bottom-left, bottom-right

export interface ShapePuzzleGameProps {
  onComplete: () => void;
}

export function ShapePuzzleGame({ onComplete }: ShapePuzzleGameProps) {
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null]);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Complete the square. Tap a piece, then tap a slot to place it.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Place the pieces to make a square.', 0.7);
  }, [wrongShake]);

  const handlePieceTap = useCallback((id: string) => {
    const inSlot = slots.some((s, i) => s === id);
    if (inSlot) return; // already placed
    setSelectedPiece(id);
    speak(PIECES.find((p) => p.id === id)?.label ?? id, 0.6);
  }, [slots]);

  const handleSlotTap = useCallback(
    (slotIndex: number) => {
      if (!selectedPiece) return;
      const next = [...slots];
      next[slotIndex] = selectedPiece;
      setSlots(next);
      setSelectedPiece(null);
      const allFilled = next.every((s) => s !== null);
      if (allFilled) {
        const correct = next.every((piece, i) => piece === CORRECT_ORDER[i]);
        if (correct) {
          speak('You completed the square!', 0.75);
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2200);
        } else {
          triggerWrong();
          setSlots([null, null, null, null]);
        }
      }
    },
    [selectedPiece, slots, onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Great Job!"
        subtitle="You completed the square!"
        badgeEmoji="⬜"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Shape Puzzle"
      instruction="Tap a piece, then tap a slot to complete the square."
      icon="⬜"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Pieces</Text>
        <Animated.View style={[styles.piecesRow, { transform: [{ translateX: shakeX }] }]}>
          {PIECES.map((p) => {
            const inSlot = slots.some((s) => s === p.id);
            return (
              <Pressable
                key={p.id}
                onPress={() => handlePieceTap(p.id)}
                style={[
                  styles.piece,
                  { backgroundColor: p.color },
                  selectedPiece === p.id && styles.pieceSelected,
                  inSlot && styles.piecePlaced,
                ]}
                accessibilityLabel={p.label}
              />
            );
          })}
        </Animated.View>
        <Text style={styles.label}>Square</Text>
        <View style={styles.grid}>
          {[0, 1, 2, 3].map((i) => (
            <Pressable
              key={i}
              onPress={() => handleSlotTap(i)}
              style={[
                styles.slot,
                slots[i] && { backgroundColor: PIECES.find((p) => p.id === slots[i])?.color ?? '#E5E7EB' },
              ]}
              accessibilityLabel={`Slot ${i + 1}`}
            >
              {slots[i] ? null : <Text style={styles.slotHint}>?</Text>}
            </Pressable>
          ))}
        </View>
        {selectedPiece ? (
          <Text style={styles.hint}>Tap a slot to place the piece</Text>
        ) : null}
      </View>
    </GameLayout>
  );
}

const slotSize = 70;

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#4F46E5', marginBottom: 12 },
  piecesRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  piece: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  pieceSelected: { borderColor: '#22C55E', borderWidth: 5 },
  piecePlaced: { opacity: 0.4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: slotSize * 2 + 12,
  },
  slot: {
    width: slotSize,
    height: slotSize,
    margin: 3,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    borderWidth: 4,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotHint: { fontSize: 24, fontWeight: '800', color: '#9CA3AF' },
  hint: { marginTop: 20, fontSize: 16, color: '#6B7280', fontWeight: '600' },
});
