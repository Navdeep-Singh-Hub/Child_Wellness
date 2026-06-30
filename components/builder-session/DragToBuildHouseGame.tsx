/**
 * Builder Session 9 — Game 3: Drag to Build House
 * Arrange parts to form a house. Tap part (roof, wall, door) then tap slot to place.
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

export interface DragToBuildHouseGameProps {
  onComplete: () => void;
}

export function DragToBuildHouseGame({ onComplete }: DragToBuildHouseGameProps) {
  const [slots, setSlots] = useState<Record<PartId, boolean>>({ roof: false, wall: false, door: false });
  const [selectedPart, setSelectedPart] = useState<PartId | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Build the house. Tap a part, then tap where it goes: roof on top, wall in middle, door at bottom.', 0.75);
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
        variant="mint"
        title="Great Job!"
        subtitle="You built the house!"
        badgeEmoji="🏠"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const placedCount = Object.values(slots).filter(Boolean).length;

  return (
    <GameLayout
      title="Build the House"
      instruction="Tap a part, then tap where it goes."
      icon="🏠"
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
        <Text style={styles.label}>House</Text>
        <View style={styles.houseFrame}>
          <Pressable
            style={[styles.slot, styles.slotRoof, slots.roof && styles.slotFilled]}
            onPress={() => handleSlotTap('roof')}
            accessibilityLabel="Roof slot"
          >
            <Text style={styles.slotText}>{slots.roof ? '🏠' : '?'}</Text>
          </Pressable>
          <Pressable
            style={[styles.slot, styles.slotWall, slots.wall && styles.slotFilled]}
            onPress={() => handleSlotTap('wall')}
            accessibilityLabel="Wall slot"
          >
            <Text style={styles.slotText}>{slots.wall ? '🧱' : '?'}</Text>
          </Pressable>
          <Pressable
            style={[styles.slot, styles.slotDoor, slots.door && styles.slotFilled]}
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
  label: { fontSize: 18, fontWeight: '700', color: '#4F46E5', marginBottom: 12 },
  partsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  partBtn: {
    width: 80,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#A78BFA',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  partEmoji: { fontSize: 32, marginBottom: 4 },
  partLabel: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  selected: { borderColor: '#22C55E', backgroundColor: '#DCFCE7' },
  placed: { opacity: 0.5 },
  houseFrame: {
    width: 160,
    borderWidth: 3,
    borderColor: '#9CA3AF',
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#F3F4F6',
  },
  slot: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotRoof: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  slotWall: {},
  slotDoor: { marginBottom: 0 },
  slotFilled: { backgroundColor: '#DCFCE7', borderColor: '#22C55E' },
  slotText: { fontSize: 28 },
  hint: { marginTop: 20, fontSize: 16, color: '#6B7280', fontWeight: '600' },
});
