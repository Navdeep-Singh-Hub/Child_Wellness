/**
 * Level 9 (Clockwise) — Session 2, Game 4: Object Assembly
 * Drag pieces to build a bicycle. Tap part then slot.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PARTS = [
  { id: 'frame', label: 'Frame', emoji: '🔲' },
  { id: 'wheel1', label: 'Wheel', emoji: '⚙️' },
  { id: 'wheel2', label: 'Wheel', emoji: '⚙️' },
  { id: 'handlebars', label: 'Handlebars', emoji: '〰️' },
] as const;

type PartId = (typeof PARTS)[number]['id'];

export interface BicycleAssemblyLevel9Session2GameProps {
  onComplete: () => void;
}

export function BicycleAssemblyLevel9Session2Game({ onComplete }: BicycleAssemblyLevel9Session2GameProps) {
  const [slots, setSlots] = useState<Record<PartId, boolean>>({
    frame: false,
    wheel1: false,
    wheel2: false,
    handlebars: false,
  });
  const [selectedPart, setSelectedPart] = useState<PartId | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Build the bicycle. Tap a part, then tap where it goes: frame, two wheels, and handlebars.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Place all parts to build the bicycle.', 0.7);
  }, [wrongShake]);

  const handlePartTap = useCallback((id: PartId) => {
    const placed = Object.values(slots).filter(Boolean).length;
    if (placed >= PARTS.length) return;
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
        speak('You built a bicycle!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [selectedPart, slots, onComplete]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You built the bicycle!"
        badgeEmoji="🚲"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const placedCount = Object.values(slots).filter(Boolean).length;

  return (
    <GameLayout
      title="Build the Bicycle"
      instruction="Tap a part, then tap a slot to assemble the bicycle."
      icon="🚲"
      backgroundVariant="indigo"
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
        <Text style={styles.label}>Slots — tap to place</Text>
        <View style={styles.slotsRow}>
          {PARTS.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => handleSlotTap(p.id)}
              style={[styles.slot, slots[p.id] && styles.slotFilled]}
              accessibilityLabel={`${p.label} slot`}
            >
              <Text style={styles.slotText}>{slots[p.id] ? p.emoji : '?'}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#4338CA', marginBottom: 12 },
  partsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 24 },
  partBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#818CF8',
    alignItems: 'center',
    minWidth: 72,
  },
  selected: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
  placed: { opacity: 0.6 },
  partEmoji: { fontSize: 30, marginBottom: 4 },
  partLabel: { fontSize: 12, fontWeight: '700', color: '#4338CA' },
  slotsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  slot: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#C7D2FE',
    borderWidth: 3,
    borderColor: '#818CF8',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotFilled: { backgroundColor: '#EEF2FF', borderStyle: 'solid' },
  slotText: { fontSize: 28 },
});
