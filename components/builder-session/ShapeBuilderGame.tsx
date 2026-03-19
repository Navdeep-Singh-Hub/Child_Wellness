/**
 * Builder Session 7 — Game 4: Shape Builder
 * Build a square from sticks. Place 4 sticks into the 4 sides of a square (tap stick then slot).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const SIDES = ['top', 'right', 'bottom', 'left'] as const;

export interface ShapeBuilderGameProps {
  onComplete: () => void;
}

export function ShapeBuilderGame({ onComplete }: ShapeBuilderGameProps) {
  const [slots, setSlots] = useState<Record<string, boolean>>({ top: false, right: false, bottom: false, left: false });
  const [selectedStick, setSelectedStick] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Build the square. Tap a stick, then tap a side to place it.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Place each stick on a side of the square.', 0.7);
  }, [wrongShake]);

  const handleStickTap = useCallback((index: number) => {
    const placed = Object.values(slots).filter(Boolean).length;
    if (placed >= 4) return;
    setSelectedStick(index);
    speak(`Stick ${index + 1}`, 0.6);
  }, [slots]);

  const handleSlotTap = useCallback(
    (side: typeof SIDES[number]) => {
      if (selectedStick === null || slots[side]) return;
      const next = { ...slots, [side]: true };
      setSlots(next);
      setSelectedStick(null);
      const allFilled = SIDES.every((s) => next[s]);
      if (allFilled) {
        speak('You built a square!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [selectedStick, slots, onComplete]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Great Job!"
        subtitle="You built the square!"
        badgeEmoji="⬜"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  const placedCount = Object.values(slots).filter(Boolean).length;

  return (
    <GameLayout
      title="Shape Builder"
      instruction="Tap a stick, then tap a side to build the square."
      icon="⬜"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Sticks</Text>
        <Animated.View style={[styles.sticksRow, { transform: [{ translateX: shakeX }] }]}>
          {[0, 1, 2, 3].map((i) => (
            <Pressable
              key={i}
              onPress={() => handleStickTap(i)}
              style={[
                styles.stick,
                selectedStick === i && styles.stickSelected,
                placedCount > i && styles.stickPlaced,
              ]}
              accessibilityLabel={`Stick ${i + 1}`}
            >
              <View style={styles.stickLine} />
            </Pressable>
          ))}
        </Animated.View>
        <Text style={styles.label}>Square</Text>
        <View style={styles.squareFrame}>
          <Pressable
            style={[styles.slot, styles.slotTop, slots.top && styles.slotFilled]}
            onPress={() => handleSlotTap('top')}
            accessibilityLabel="Top side"
          />
          <Pressable
            style={[styles.slot, styles.slotRight, slots.right && styles.slotFilled]}
            onPress={() => handleSlotTap('right')}
            accessibilityLabel="Right side"
          />
          <Pressable
            style={[styles.slot, styles.slotBottom, slots.bottom && styles.slotFilled]}
            onPress={() => handleSlotTap('bottom')}
            accessibilityLabel="Bottom side"
          />
          <Pressable
            style={[styles.slot, styles.slotLeft, slots.left && styles.slotFilled]}
            onPress={() => handleSlotTap('left')}
            accessibilityLabel="Left side"
          />
        </View>
        {selectedStick !== null ? (
          <Text style={styles.hint}>Tap a side of the square to place the stick</Text>
        ) : null}
      </View>
    </GameLayout>
  );
}

const frameSize = 120;

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#4F46E5', marginBottom: 12 },
  sticksRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  stick: {
    width: 48,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    borderWidth: 3,
    borderColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickLine: { width: 36, height: 4, backgroundColor: '#5B21B6', borderRadius: 2 },
  stickSelected: { borderColor: '#22C55E', backgroundColor: '#A78BFA' },
  stickPlaced: { opacity: 0.4 },
  squareFrame: {
    width: frameSize + 40,
    height: frameSize + 40,
    position: 'relative',
  },
  slot: {
    position: 'absolute',
    backgroundColor: '#E5E7EB',
    borderWidth: 4,
    borderColor: '#9CA3AF',
    borderRadius: 8,
  },
  slotTop: { top: 0, left: 20, width: 80, height: 24 },
  slotRight: { top: 48, right: 0, width: 24, height: 80 },
  slotBottom: { bottom: 0, left: 20, width: 80, height: 24 },
  slotLeft: { top: 48, left: 0, width: 24, height: 80 },
  slotFilled: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  hint: { marginTop: 20, fontSize: 16, color: '#6B7280', fontWeight: '600' },
});
