/**
 * Game 2 — Place objects ON surfaces. Chair & table; cat, book, ball. Session 2: Preposition ON.
 */
import { speak } from '@/utils/tts';
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const SURFACES = [
  { id: 'chair', label: 'Chair', emoji: '🪑' },
  { id: 'table', label: 'Table', emoji: '🪑' },
];
const ITEMS = [
  { id: 'cat', label: 'Cat', emoji: '🐱' },
  { id: 'book', label: 'Book', emoji: '📖' },
  { id: 'ball', label: 'Ball', emoji: '⚽' },
];
const VOICE = 'Place the objects ON the surfaces. Tap an object, then tap a surface.';

export function DragOnSurface({ onComplete }: { onComplete: () => void }) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    speak(VOICE, 0.75);
  }, []);

  const handleSurfaceTap = (surfaceId: string) => {
    if (!selectedItem) {
      speak('Tap an object first.');
      return;
    }
    speak('On!');
    setPlaced((prev) => {
      const next = new Set(prev).add(selectedItem);
      setSelectedItem(null);
      if (next.size === ITEMS.length) {
        speak('Great job!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
      return next;
    });
  };

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="All objects are ON!" />;

  return (
    <GameLayout
      title="Place objects ON surfaces"
      instruction="Tap an object, then tap a surface to put it ON."
      icon="🪑"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.itemsRow}>
          {ITEMS.map((item) => {
            if (placed.has(item.id)) return null;
            const isSelected = selectedItem === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedItem(isSelected ? null : item.id)}
                style={[styles.itemCard, isSelected && styles.itemSelected]}
                accessibilityLabel={`${item.label}, ${isSelected ? 'selected' : 'tap to select'}`}
              >
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <Text style={styles.itemLabel}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {selectedItem ? <Text style={styles.hint}>Now tap a surface to put it ON</Text> : null}
        <View style={styles.surfacesRow}>
          <View style={styles.surfaceCard}>
            <Text style={styles.surfaceEmoji}>🪑</Text>
            <Text style={styles.surfaceLabel}>Chair</Text>
            <Pressable onPress={() => handleSurfaceTap('chair')} style={styles.surfaceTouch} />
          </View>
          <View style={styles.surfaceCard}>
            <Text style={styles.surfaceEmoji}>🪵</Text>
            <Text style={styles.surfaceLabel}>Table</Text>
            <Pressable onPress={() => handleSurfaceTap('table')} style={styles.surfaceTouch} />
          </View>
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 8, alignItems: 'center' },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 24 },
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 4,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    minWidth: 90,
  },
  itemSelected: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  itemEmoji: { fontSize: 40, marginBottom: 4 },
  itemLabel: { fontSize: 16, fontWeight: '700', color: '#374151' },
  hint: { fontSize: 16, color: '#4F46E5', fontWeight: '600', marginBottom: 16 },
  surfacesRow: { flexDirection: 'row', gap: 20, flexWrap: 'wrap', justifyContent: 'center' },
  surfaceCard: {
    backgroundColor: '#E0E7FF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 4,
    borderColor: '#4F46E5',
    alignItems: 'center',
    minWidth: 120,
    position: 'relative',
  },
  surfaceEmoji: { fontSize: 48, marginBottom: 8 },
  surfaceLabel: { fontSize: 18, fontWeight: '800', color: '#3730A3' },
  surfaceTouch: { ...StyleSheet.absoluteFillObject },
});
