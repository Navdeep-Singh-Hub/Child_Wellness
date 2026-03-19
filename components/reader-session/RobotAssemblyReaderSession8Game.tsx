/**
 * Level 7 Reader — Session 8, Game 4: Drag Assembly — Build a robot using pieces
 * Parts: head, body, left arm, right arm. Tap part then slot.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PARTS = [
  { id: 'head', label: 'Head', emoji: '🤖' },
  { id: 'body', label: 'Body', emoji: '🟦' },
  { id: 'armL', label: 'Left arm', emoji: '🦾' },
  { id: 'armR', label: 'Right arm', emoji: '🦾' },
] as const;

type PartId = (typeof PARTS)[number]['id'];

export interface RobotAssemblyReaderSession8GameProps {
  onComplete: () => void;
}

export function RobotAssemblyReaderSession8Game({ onComplete }: RobotAssemblyReaderSession8GameProps) {
  const [slots, setSlots] = useState<Record<PartId, boolean>>({
    head: false,
    body: false,
    armL: false,
    armR: false,
  });
  const [selectedPart, setSelectedPart] = useState<PartId | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Build the robot. Tap a piece, then tap where it goes: head on top, body in the middle, arms on the sides.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Place all pieces to build the robot.', 0.7);
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
        speak('You built a robot!', 0.75);
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
        subtitle="You built the robot!"
        badgeEmoji="🤖"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const placedCount = Object.values(slots).filter(Boolean).length;

  return (
    <GameLayout
      title="Build the Robot"
      instruction="Tap a piece, then tap a slot to build the robot."
      icon="🤖"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Pieces</Text>
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
        <Text style={styles.label}>Robot</Text>
        <View style={styles.robotFrame}>
          <Pressable
            style={[styles.slot, styles.slotHead, slots.head && styles.slotFilled]}
            onPress={() => handleSlotTap('head')}
            accessibilityLabel="Head slot"
          >
            <Text style={styles.slotText}>{slots.head ? '🤖' : '?'}</Text>
          </Pressable>
          <View style={styles.armsRow}>
            <Pressable
              style={[styles.slot, styles.slotArm, slots.armL && styles.slotFilled]}
              onPress={() => handleSlotTap('armL')}
              accessibilityLabel="Left arm slot"
            >
              <Text style={styles.slotText}>{slots.armL ? '🦾' : '?'}</Text>
            </Pressable>
            <Pressable
              style={[styles.slot, styles.slotBody, slots.body && styles.slotFilled]}
              onPress={() => handleSlotTap('body')}
              accessibilityLabel="Body slot"
            >
              <Text style={styles.slotText}>{slots.body ? '🟦' : '?'}</Text>
            </Pressable>
            <Pressable
              style={[styles.slot, styles.slotArm, slots.armR && styles.slotFilled]}
              onPress={() => handleSlotTap('armR')}
              accessibilityLabel="Right arm slot"
            >
              <Text style={styles.slotText}>{slots.armR ? '🦾' : '?'}</Text>
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
  partsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 24 },
  partBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#818CF8',
    alignItems: 'center',
    minWidth: 76,
  },
  selected: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
  placed: { opacity: 0.6 },
  partEmoji: { fontSize: 32, marginBottom: 4 },
  partLabel: { fontSize: 12, fontWeight: '700', color: '#4338CA' },
  robotFrame: {
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 4,
    borderColor: '#6366F1',
    alignItems: 'center',
    gap: 12,
  },
  slot: {
    borderRadius: 12,
    backgroundColor: '#C7D2FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#818CF8',
  },
  slotHead: { width: 64, height: 56 },
  slotBody: { width: 80, height: 56 },
  slotArm: { width: 48, height: 48 },
  armsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  slotFilled: { backgroundColor: '#EEF2FF' },
  slotText: { fontSize: 26 },
});
