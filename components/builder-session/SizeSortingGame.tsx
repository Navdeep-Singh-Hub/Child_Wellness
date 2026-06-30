/**
 * Builder Session 7 — Game 1: Size Sorting
 * Sort objects by size: small, medium, large. Tap item then tap correct bin.
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

export interface SizeSortingGameProps {
  onComplete: () => void;
}

export function SizeSortingGame({ onComplete }: SizeSortingGameProps) {
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
        variant="mint"
        title="Great Job!"
        subtitle="You sorted by size!"
        badgeEmoji="📏"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Size Sorting"
      instruction="Put each ball in the correct size box."
      icon="📏"
      backgroundVariant="indigo"
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
          <Pressable onPress={() => handleBinTap('small')} style={[styles.bin, styles.smallBin]} accessibilityLabel="Small box">
            <Text style={styles.binLabel}>Small</Text>
          </Pressable>
          <Pressable onPress={() => handleBinTap('medium')} style={[styles.bin, styles.mediumBin]} accessibilityLabel="Medium box">
            <Text style={styles.binLabel}>Medium</Text>
          </Pressable>
          <Pressable onPress={() => handleBinTap('large')} style={[styles.bin, styles.largeBin]} accessibilityLabel="Large box">
            <Text style={styles.binLabel}>Large</Text>
          </Pressable>
        </View>
        {selectedId ? (
          <Text style={styles.hint}>Tap the {ITEMS.find((i) => i.id === selectedId)?.label.toLowerCase()} box</Text>
        ) : null}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#4F46E5', marginBottom: 12 },
  itemsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 20, marginBottom: 28, height: 100 },
  itemBtn: {
    borderRadius: 999,
    borderWidth: 4,
    borderColor: '#A78BFA',
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtn: { width: 50, height: 50 },
  mediumBtn: { width: 70, height: 70 },
  largeBtn: { width: 90, height: 90 },
  emoji: { fontSize: 28 },
  selected: { borderColor: '#22C55E', backgroundColor: '#DCFCE7' },
  sorted: { opacity: 0.5 },
  binsRow: { flexDirection: 'row', gap: 12 },
  bin: {
    width: 80,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 4,
    alignItems: 'center',
  },
  smallBin: { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
  mediumBin: { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' },
  largeBin: { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
  binLabel: { fontSize: 14, fontWeight: '800', color: '#1F2937' },
  hint: { marginTop: 20, fontSize: 16, color: '#6B7280', fontWeight: '600' },
});
