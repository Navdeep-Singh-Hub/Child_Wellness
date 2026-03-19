/**
 * Level 5 Counter — Session 3, Game 4: Drag Parts — Assemble a house (roof, walls, door)
 * Tap part then slot to place. Same pattern as builder DragToBuildHouseGame with ocean theme.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PARTS = [
  { id: 'roof', label: 'Roof', emoji: '🏠' },
  { id: 'wall', label: 'Wall', emoji: '🧱' },
  { id: 'door', label: 'Door', emoji: '🚪' },
] as const;

type PartId = typeof PARTS[number]['id'];

export interface DragPartsHouseCounterGameProps {
  onComplete: () => void;
}

export function DragPartsHouseCounterGame({ onComplete }: DragPartsHouseCounterGameProps) {
  const [slots, setSlots] = useState<Record<PartId, boolean>>({ roof: false, wall: false, door: false });
  const [selectedPart, setSelectedPart] = useState<PartId | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Assemble the house. Tap a part, then tap where it goes: roof on top, wall in middle, door at bottom.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Place roof, wall, and door to build the house.', 0.7);
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
        speak('You built a house!', 0.75);
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
        subtitle="You assembled the house!"
        badgeEmoji="🏠"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const placedCount = Object.values(slots).filter(Boolean).length;

  return (
    <GameLayout
      title="Assemble the House"
      instruction="Tap a part, then tap where it goes."
      icon="🏠"
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
        <Text style={styles.label}>House</Text>
        <View style={styles.houseFrame}>
          <Pressable
            style={[styles.slot, slots.roof && styles.slotFilled]}
            onPress={() => handleSlotTap('roof')}
            accessibilityLabel="Roof slot"
          >
            <Text style={styles.slotText}>{slots.roof ? '🏠' : '?'}</Text>
          </Pressable>
          <Pressable
            style={[styles.slot, slots.wall && styles.slotFilled]}
            onPress={() => handleSlotTap('wall')}
            accessibilityLabel="Wall slot"
          >
            <Text style={styles.slotText}>{slots.wall ? '🧱' : '?'}</Text>
          </Pressable>
          <Pressable
            style={[styles.slot, slots.door && styles.slotFilled]}
            onPress={() => handleSlotTap('door')}
            accessibilityLabel="Door slot"
          >
            <Text style={styles.slotText}>{slots.door ? '🚪' : '?'}</Text>
          </Pressable>
        </View>
        {selectedPart ? (
          <Text style={styles.hint}>Tap a slot to place the {PARTS.find((p) => p.id === selectedPart)?.label.toLowerCase()}</Text>
        ) : null}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#0369A1', marginBottom: 12 },
  partsRow: { flexDirection: 'row', gap: 14, marginBottom: 24 },
  partBtn: {
    width: 84,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#38BDF8',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  partEmoji: { fontSize: 34, marginBottom: 4 },
  partLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  selected: { borderColor: '#22C55E', backgroundColor: '#DCFCE7' },
  placed: { opacity: 0.5 },
  houseFrame: {
    width: 160,
    borderWidth: 3,
    borderColor: '#94A3B8',
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#F1F5F9',
  },
  slot: {
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotFilled: { backgroundColor: '#DCFCE7', borderColor: '#22C55E' },
  slotText: { fontSize: 28 },
  hint: { marginTop: 20, fontSize: 16, color: '#64748B', fontWeight: '600' },
});
