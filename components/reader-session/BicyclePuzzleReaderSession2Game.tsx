/**
 * Level 7 Reader — Session 2, Game 4: Drag Puzzle — Assemble a bicycle
 * Parts: frame, wheel, wheel, handlebars. Tap part then slot.
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

export interface BicyclePuzzleReaderSession2GameProps {
  onComplete: () => void;
}

export function BicyclePuzzleReaderSession2Game({ onComplete }: BicyclePuzzleReaderSession2GameProps) {
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
        <Text style={styles.label}>Bicycle</Text>
        <View style={styles.bikeFrame}>
          <View style={styles.bikeRow}>
            <Pressable
              style={[styles.slot, styles.slotFrame, slots.frame && styles.slotFilled]}
              onPress={() => handleSlotTap('frame')}
              accessibilityLabel="Frame slot"
            >
              <Text style={styles.slotText}>{slots.frame ? '🔲' : '?'}</Text>
            </Pressable>
            <Pressable
              style={[styles.slot, styles.slotHandlebars, slots.handlebars && styles.slotFilled]}
              onPress={() => handleSlotTap('handlebars')}
              accessibilityLabel="Handlebars slot"
            >
              <Text style={styles.slotText}>{slots.handlebars ? '〰️' : '?'}</Text>
            </Pressable>
          </View>
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
  label: { fontSize: 18, fontWeight: '700', color: '#4338CA', marginBottom: 12 },
  partsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 24 },
  partBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#818CF8',
    alignItems: 'center',
    minWidth: 76,
  },
  selected: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
  placed: { opacity: 0.6 },
  partEmoji: { fontSize: 32, marginBottom: 4 },
  partLabel: { fontSize: 14, fontWeight: '700', color: '#4338CA' },
  bikeFrame: {
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 4,
    borderColor: '#6366F1',
    alignItems: 'center',
    gap: 14,
  },
  bikeRow: { flexDirection: 'row', gap: 20, alignItems: 'center' },
  wheelsRow: { flexDirection: 'row', gap: 24 },
  slot: {
    borderRadius: 14,
    backgroundColor: '#C7D2FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#818CF8',
  },
  slotFrame: { width: 80, height: 48 },
  slotHandlebars: { width: 56, height: 48 },
  slotWheel: { width: 52, height: 52 },
  slotFilled: { backgroundColor: '#EEF2FF' },
  slotText: { fontSize: 26 },
});
