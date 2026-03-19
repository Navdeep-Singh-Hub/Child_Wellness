/**
 * Level 5 Counter — Session 9, Game 3: Drag Sorting
 * Sort objects by size: small, medium, large. Tap item then correct bin.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ITEMS = [
  { id: 'small', size: 'small' as const, label: 'Small', emoji: '🔵' },
  { id: 'medium', size: 'medium' as const, label: 'Medium', emoji: '🔵' },
  { id: 'large', size: 'large' as const, label: 'Large', emoji: '🔵' },
];

export interface DragSortingCounterGameProps {
  onComplete: () => void;
}

export function DragSortingCounterGame({ onComplete }: DragSortingCounterGameProps) {
  const [sorted, setSorted] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Sort by size. Put each ball in the correct size box. Tap a ball, then tap the matching box.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Match the size: small, medium, or large.', 0.7);
  }, [wrongShake]);

  const handleItemTap = useCallback((id: string) => {
    if (sorted.has(id)) return;
    setSelectedId(id);
    const item = ITEMS.find((i) => i.id === id);
    speak(item?.label ?? id, 0.7);
  }, [sorted]);

  const handleBinTap = useCallback(
    (size: 'small' | 'medium' | 'large') => {
      if (!selectedId) return;
      const item = ITEMS.find((i) => i.id === selectedId);
      if (!item || item.size !== size) {
        triggerWrong();
        setSelectedId(null);
        return;
      }
      speak(`Correct! ${item.label}!`, 0.7);
      setSorted((s) => new Set(s).add(selectedId));
      setSelectedId(null);
      if (sorted.size + 1 >= ITEMS.length) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [selectedId, sorted, onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Great Job!"
        subtitle="You sorted by size!"
        badgeEmoji="📏"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Drag Sorting"
      instruction="Put each ball in the correct size box."
      icon="📏"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Balls</Text>
        <Animated.View style={[styles.itemsRow, { transform: [{ translateX: shakeX }] }]}>
          {ITEMS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleItemTap(item.id)}
              style={[
                styles.itemBtn,
                item.size === 'small' && styles.smallBtn,
                item.size === 'medium' && styles.mediumBtn,
                item.size === 'large' && styles.largeBtn,
                selectedId === item.id && styles.selected,
                sorted.has(item.id) && styles.sorted,
              ]}
              accessibilityLabel={item.label}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
            </Pressable>
          ))}
        </Animated.View>
        <Text style={styles.label}>Boxes</Text>
        <View style={styles.binsRow}>
          <Pressable
            onPress={() => handleBinTap('small')}
            style={[styles.binBtn, styles.smallBin]}
            accessibilityLabel="Small"
          >
            <Text style={styles.binLabel}>Small</Text>
          </Pressable>
          <Pressable
            onPress={() => handleBinTap('medium')}
            style={[styles.binBtn, styles.mediumBin]}
            accessibilityLabel="Medium"
          >
            <Text style={styles.binLabel}>Medium</Text>
          </Pressable>
          <Pressable
            onPress={() => handleBinTap('large')}
            style={[styles.binBtn, styles.largeBin]}
            accessibilityLabel="Large"
          >
            <Text style={styles.binLabel}>Large</Text>
          </Pressable>
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#0369A1', marginBottom: 12 },
  itemsRow: { flexDirection: 'row', gap: 20, marginBottom: 24 },
  itemBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    borderWidth: 4,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtn: { width: 44, height: 44, borderRadius: 22 },
  mediumBtn: { width: 56, height: 56, borderRadius: 28 },
  largeBtn: { width: 72, height: 72, borderRadius: 36 },
  selected: { borderColor: '#0EA5E9', backgroundColor: '#60A5FA' },
  sorted: { opacity: 0.5 },
  emoji: { fontSize: 28 },
  binsRow: { flexDirection: 'row', gap: 12 },
  binBtn: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#38BDF8',
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    minWidth: 88,
  },
  smallBin: {},
  mediumBin: {},
  largeBin: {},
  binLabel: { fontSize: 16, fontWeight: '800', color: '#0C4A6E' },
});
