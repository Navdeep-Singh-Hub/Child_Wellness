/**
 * Level 5 Counter — Session 7, Game 4: Build Object
 * Drag parts to build a car. Parts: body, wheel, wheel. Tap part then slot.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PARTS = [
  { id: 'body', label: 'Body', emoji: '🚗' },
  { id: 'wheel1', label: 'Wheel', emoji: '⚙️' },
  { id: 'wheel2', label: 'Wheel', emoji: '⚙️' },
] as const;

type PartId = (typeof PARTS)[number]['id'];

export interface BuildCarCounterGameProps {
  onComplete: () => void;
}

export function BuildCarCounterGame({ onComplete }: BuildCarCounterGameProps) {
  const [slots, setSlots] = useState<Record<PartId, boolean>>({ body: false, wheel1: false, wheel2: false });
  const [selectedPart, setSelectedPart] = useState<PartId | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Build the car. Tap a part, then tap where it goes: body in the middle, wheels on the sides.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Place body and both wheels to build the car.', 0.7);
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
        speak('You built a car!', 0.75);
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
        subtitle="You built the car!"
        badgeEmoji="🚗"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const placedCount = Object.values(slots).filter(Boolean).length;

  return (
    <GameLayout
      title="Build the Car"
      instruction="Tap a part, then tap a slot to build the car."
      icon="🚗"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Parts</Text>
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
        <Text style={styles.label}>Car</Text>
        <View style={styles.carFrame}>
          <Pressable
            style={[styles.slot, styles.slotBody, slots.body && styles.slotFilled]}
            onPress={() => handleSlotTap('body')}
            accessibilityLabel="Body slot"
          >
            <Text style={styles.slotText}>{slots.body ? '🚗' : '?'}</Text>
          </Pressable>
          <View style={styles.wheelsRow}>
            <Pressable
              style={[styles.slot, styles.slotWheel, slots.wheel1 && styles.slotFilled]}
              onPress={() => handleSlotTap('wheel1')}
              accessibilityLabel="Wheel slot"
            >
              <Text style={styles.slotText}>{slots.wheel1 ? '⚙️' : '?'}</Text>
            </Pressable>
            <Pressable
              style={[styles.slot, styles.slotWheel, slots.wheel2 && styles.slotFilled]}
              onPress={() => handleSlotTap('wheel2')}
              accessibilityLabel="Wheel slot"
            >
              <Text style={styles.slotText}>{slots.wheel2 ? '⚙️' : '?'}</Text>
            </Pressable>
          </View>
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
  carFrame: {
    backgroundColor: '#E0F2FE',
    borderRadius: 18,
    padding: 20,
    borderWidth: 4,
    borderColor: '#38BDF8',
    alignItems: 'center',
    gap: 12,
  },
  slot: {
    borderRadius: 14,
    backgroundColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#7DD3FC',
  },
  slotBody: { width: 120, height: 56 },
  wheelsRow: { flexDirection: 'row', gap: 24 },
  slotWheel: { width: 56, height: 56 },
  slotFilled: { backgroundColor: '#E0F2FE' },
  slotText: { fontSize: 28 },
});
