/**
 * Level 7 Reader — Session 5, Game 4: Drag Construction — Build a simple bridge using blocks
 * Parts: left pillar, right pillar, top deck. Tap part then slot.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PARTS = [
  { id: 'left', label: 'Left block', emoji: '🟫' },
  { id: 'right', label: 'Right block', emoji: '🟫' },
  { id: 'top', label: 'Top block', emoji: '🟧' },
] as const;

type PartId = (typeof PARTS)[number]['id'];

export interface BridgeConstructionReaderSession5GameProps {
  onComplete: () => void;
}

export function BridgeConstructionReaderSession5Game({ onComplete }: BridgeConstructionReaderSession5GameProps) {
  const [slots, setSlots] = useState<Record<PartId, boolean>>({
    left: false,
    right: false,
    top: false,
  });
  const [selectedPart, setSelectedPart] = useState<PartId | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Build the bridge. Tap a block, then tap where it goes: two pillars and the top.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Place all blocks to build the bridge.', 0.7);
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
        speak('You built a bridge!', 0.75);
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
        subtitle="You built the bridge!"
        badgeEmoji="🌉"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const placedCount = Object.values(slots).filter(Boolean).length;

  return (
    <GameLayout
      title="Build the Bridge"
      instruction="Tap a block, then tap a slot to build the bridge."
      icon="🌉"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Blocks</Text>
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
        <Text style={styles.label}>Bridge</Text>
        <View style={styles.bridgeFrame}>
          <View style={styles.deckRow}>
            <Pressable
              style={[styles.slot, styles.slotTop, slots.top && styles.slotFilled]}
              onPress={() => handleSlotTap('top')}
              accessibilityLabel="Top deck slot"
            >
              <Text style={styles.slotText}>{slots.top ? '🟧' : '?'}</Text>
            </Pressable>
          </View>
          <View style={styles.pillarsRow}>
            <Pressable
              style={[styles.slot, styles.slotPillar, slots.left && styles.slotFilled]}
              onPress={() => handleSlotTap('left')}
              accessibilityLabel="Left pillar slot"
            >
              <Text style={styles.slotText}>{slots.left ? '🟫' : '?'}</Text>
            </Pressable>
            <Pressable
              style={[styles.slot, styles.slotPillar, slots.right && styles.slotFilled]}
              onPress={() => handleSlotTap('right')}
              accessibilityLabel="Right pillar slot"
            >
              <Text style={styles.slotText}>{slots.right ? '🟫' : '?'}</Text>
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
    minWidth: 88,
  },
  selected: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
  placed: { opacity: 0.6 },
  partEmoji: { fontSize: 36, marginBottom: 4 },
  partLabel: { fontSize: 14, fontWeight: '700', color: '#4338CA' },
  bridgeFrame: {
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 4,
    borderColor: '#6366F1',
    alignItems: 'center',
    gap: 14,
  },
  deckRow: { flexDirection: 'row', justifyContent: 'center' },
  pillarsRow: { flexDirection: 'row', gap: 40 },
  slot: {
    borderRadius: 12,
    backgroundColor: '#C7D2FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#818CF8',
  },
  slotTop: { width: 120, height: 40 },
  slotPillar: { width: 56, height: 64 },
  slotFilled: { backgroundColor: '#EEF2FF' },
  slotText: { fontSize: 24 },
});
