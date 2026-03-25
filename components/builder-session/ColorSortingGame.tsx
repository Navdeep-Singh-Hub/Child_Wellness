/**
 * Builder Session 8 — Game 2: Color Sorting
 * Sort objects by color. Tap item then tap correct color bin (red, blue, green).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ITEMS = [
  { id: 'red', color: 'red' as const, label: 'Red', emoji: '🔴' },
  { id: 'blue', color: 'blue' as const, label: 'Blue', emoji: '🔵' },
  { id: 'green', color: 'green' as const, label: 'Green', emoji: '🟢' },
];

const BINS = [
  { id: 'red' as const, label: 'Red' },
  { id: 'blue' as const, label: 'Blue' },
  { id: 'green' as const, label: 'Green' },
];

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function shuffleWithoutSameColumn<T extends { id: string }>(base: T[], source: T[]): T[] {
  if (source.length <= 1) return [...source];
  let candidate = shuffleArray(source);
  let tries = 0;
  while (candidate.some((item, i) => item.id === base[i]?.id) && tries < 20) {
    candidate = shuffleArray(source);
    tries += 1;
  }
  if (candidate.some((item, i) => item.id === base[i]?.id)) {
    return [...source.slice(1), source[0]];
  }
  return candidate;
}

export interface ColorSortingGameProps {
  onComplete: () => void;
}

export function ColorSortingGame({ onComplete }: ColorSortingGameProps) {
  const [itemOrder] = useState(() => shuffleArray(ITEMS));
  const [binOrder] = useState(() => shuffleWithoutSameColumn(itemOrder, BINS));
  const [sorted, setSorted] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Sort by color. Put each ball in the correct color box. Tap a ball, then tap the matching box.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Match the color: red, blue, or green.', 0.7);
  }, [wrongShake]);

  const handleItemTap = useCallback((id: string) => {
    if (sorted.has(id)) return;
    setSelectedId(id);
    const item = ITEMS.find((i) => i.id === id);
    speak(item?.label ?? id, 0.7);
  }, [sorted]);

  const handleBinTap = useCallback(
    (color: 'red' | 'blue' | 'green') => {
      if (!selectedId) return;
      const item = ITEMS.find((i) => i.id === selectedId);
      if (!item || item.color !== color) {
        triggerWrong();
        setSelectedId(null);
        return;
      }
      speak(`Correct! ${item.label}!`, 0.7);
      setSorted((s) => new Set(s).add(selectedId));
      setSelectedId(null);
      if (sorted.size + 1 >= itemOrder.length) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [selectedId, sorted, onComplete, triggerWrong, itemOrder.length]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Great Job!"
        subtitle="You sorted by color!"
        badgeEmoji="🎨"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Color Sorting"
      instruction="Put each ball in the correct color box."
      icon="🎨"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Balls</Text>
        <Animated.View style={[styles.itemsRow, { transform: [{ translateX: shakeX }] }]}>
          {itemOrder.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleItemTap(item.id)}
              style={[
                styles.itemBtn,
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
          {binOrder.map((bin) => (
            <Pressable
              key={bin.id}
              onPress={() => handleBinTap(bin.id)}
              style={[
                styles.bin,
                bin.id === 'red' ? styles.redBin : bin.id === 'blue' ? styles.blueBin : styles.greenBin,
              ]}
              accessibilityLabel={`${bin.label} box`}
            >
              <Text style={styles.binLabel}>{bin.label}</Text>
            </Pressable>
          ))}
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
  itemsRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 28 },
  itemBtn: {
    width: 70,
    height: 70,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: '#A78BFA',
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 36 },
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
  redBin: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  blueBin: { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' },
  greenBin: { backgroundColor: '#D1FAE5', borderColor: '#22C55E' },
  binLabel: { fontSize: 14, fontWeight: '800', color: '#1F2937' },
  hint: { marginTop: 20, fontSize: 16, color: '#6B7280', fontWeight: '600' },
});
