/**
 * Game 2 — Place objects NEXT TO. Targets: plate, house. Items: cup, car, dog. Session 4: Preposition NEXT TO.
 */
import { speak } from '@/utils/tts';
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const TARGETS = [
  { id: 'plate', label: 'Plate', emoji: '🍽️' },
  { id: 'house', label: 'House', emoji: '🏠' },
];
const ITEMS = [
  { id: 'cup', label: 'Cup', emoji: '🥤' },
  { id: 'car', label: 'Car', emoji: '🚗' },
  { id: 'dog', label: 'Dog', emoji: '🐕' },
];
const VOICE = 'Place the objects NEXT TO the other object. Tap an object, then tap plate or house.';

export function DragNextTo({ onComplete }: { onComplete: () => void }) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    speak(VOICE, 0.75);
  }, []);

  const handleTargetTap = (targetId: string) => {
    if (!selectedItem) {
      speak('Tap an object first.');
      return;
    }
    speak('Next to!');
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

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="All objects are NEXT TO!" />;

  return (
    <GameLayout
      title="Place objects NEXT TO"
      instruction="Tap an object, then tap plate or house to put it NEXT TO."
      icon="🍽️"
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
        {selectedItem ? <Text style={styles.hint}>Now tap where to put it NEXT TO</Text> : null}
        <View style={styles.targetsRow}>
          <View style={styles.targetCard}>
            <Text style={styles.targetEmoji}>🍽️</Text>
            <Text style={styles.targetLabel}>Plate</Text>
            <Pressable onPress={() => handleTargetTap('plate')} style={styles.targetTouch} />
          </View>
          <View style={styles.targetCard}>
            <Text style={styles.targetEmoji}>🏠</Text>
            <Text style={styles.targetLabel}>House</Text>
            <Pressable onPress={() => handleTargetTap('house')} style={styles.targetTouch} />
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
  targetsRow: { flexDirection: 'row', gap: 20, flexWrap: 'wrap', justifyContent: 'center' },
  targetCard: {
    backgroundColor: '#E0E7FF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 4,
    borderColor: '#4F46E5',
    alignItems: 'center',
    minWidth: 120,
    position: 'relative',
  },
  targetEmoji: { fontSize: 48, marginBottom: 8 },
  targetLabel: { fontSize: 18, fontWeight: '800', color: '#3730A3' },
  targetTouch: { ...StyleSheet.absoluteFillObject },
});
