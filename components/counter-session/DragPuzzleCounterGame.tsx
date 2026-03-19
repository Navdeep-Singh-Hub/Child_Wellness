/**
 * Level 5 Counter — Session 6, Game 3: Drag Puzzle
 * Complete a simple animal puzzle. Place 3 parts (top, middle, bottom) to form the dog.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PARTS = [
  { id: 'top', label: 'Top', emoji: '🐕' },
  { id: 'mid', label: 'Middle', emoji: '🐾' },
  { id: 'bottom', label: 'Bottom', emoji: '🐕' },
] as const;

type PartId = (typeof PARTS)[number]['id'];

export interface DragPuzzleCounterGameProps {
  onComplete: () => void;
}

export function DragPuzzleCounterGame({ onComplete }: DragPuzzleCounterGameProps) {
  const [slots, setSlots] = useState<Record<PartId, boolean>>({ top: false, mid: false, bottom: false });
  const [selectedPart, setSelectedPart] = useState<PartId | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Complete the dog puzzle. Tap a part, then tap a slot to place it.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Place all three parts to complete the puzzle.', 0.7);
  }, [wrongShake]);

  const handlePartTap = useCallback((id: PartId) => {
    const placed = Object.values(slots).filter(Boolean).length;
    if (placed >= 3) return;
    setSelectedPart(id);
    const part = PARTS.find((p) => p.id === id);
    speak(part?.label ?? id, 0.6);
  }, [slots]);

  const handleSlotTap = useCallback(
    (slotId: PartId) => {
      if (!selectedPart || slots[slotId]) return;
      const next = { ...slots, [slotId]: true };
      setSlots(next);
      setSelectedPart(null);
      const allFilled = (PARTS as readonly { id: PartId }[]).every((p) => next[p.id]);
      if (allFilled) {
        speak('You completed the dog puzzle!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [selectedPart, slots, onComplete]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Great Job!"
        subtitle="You completed the animal puzzle!"
        badgeEmoji="🐕"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const placedCount = Object.values(slots).filter(Boolean).length;

  return (
    <GameLayout
      title="Animal Puzzle"
      instruction="Tap a part, then tap a slot to complete the dog."
      icon="🐕"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Puzzle parts</Text>
        <Animated.View style={[styles.partsRow, { transform: [{ translateX: shakeX }] }]}>
          {PARTS.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => handlePartTap(p.id)}
              style={[
                styles.partBtn,
                selectedPart === p.id && styles.selected,
                placedCount >= PARTS.length && styles.placed,
              ]}
              accessibilityLabel={p.label}
            >
              <Text style={styles.partEmoji}>{p.emoji}</Text>
              <Text style={styles.partLabel}>{p.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
        <Text style={styles.label}>Put the dog together</Text>
        <View style={styles.puzzleFrame}>
          <Pressable
            style={[styles.slot, slots.top && styles.slotFilled]}
            onPress={() => handleSlotTap('top')}
            accessibilityLabel="Top slot"
          >
            <Text style={styles.slotText}>{slots.top ? '🐕' : '?'}</Text>
          </Pressable>
          <Pressable
            style={[styles.slot, slots.mid && styles.slotFilled]}
            onPress={() => handleSlotTap('mid')}
            accessibilityLabel="Middle slot"
          >
            <Text style={styles.slotText}>{slots.mid ? '🐾' : '?'}</Text>
          </Pressable>
          <Pressable
            style={[styles.slot, slots.bottom && styles.slotFilled]}
            onPress={() => handleSlotTap('bottom')}
            accessibilityLabel="Bottom slot"
          >
            <Text style={styles.slotText}>{slots.bottom ? '🐕' : '?'}</Text>
          </Pressable>
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#0369A1', marginBottom: 12 },
  partsRow: { flexDirection: 'row', gap: 14, marginBottom: 24 },
  partBtn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#38BDF8',
    alignItems: 'center',
    minWidth: 80,
  },
  selected: { backgroundColor: '#E0F2FE', borderColor: '#0EA5E9' },
  placed: { opacity: 0.6 },
  partEmoji: { fontSize: 36, marginBottom: 4 },
  partLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  puzzleFrame: {
    backgroundColor: '#E0F2FE',
    borderRadius: 18,
    padding: 20,
    borderWidth: 4,
    borderColor: '#38BDF8',
    gap: 12,
  },
  slot: {
    width: 100,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#7DD3FC',
  },
  slotFilled: { backgroundColor: '#E0F2FE' },
  slotText: { fontSize: 32 },
});
