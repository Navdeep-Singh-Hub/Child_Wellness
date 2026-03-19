/**
 * Game 2 — Place objects BETWEEN. Zones: between two trees, between two chairs. Items: cat, ball. Session 6: Preposition BETWEEN.
 */
import { speak } from '@/utils/tts';
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ITEMS = [
  { id: 'cat', label: 'Cat', emoji: '🐱' },
  { id: 'ball', label: 'Ball', emoji: '⚽' },
];
const ZONES = [
  { id: 'trees', label: 'Between two trees', emoji: '🌳', emoji2: '🌳' },
  { id: 'chairs', label: 'Between two chairs', emoji: '🪑', emoji2: '🪑' },
];
const VOICE = 'Place the object BETWEEN the two items. Tap cat or ball, then tap a zone.';

export function DragBetweenObjects({ onComplete }: { onComplete: () => void }) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    speak(VOICE, 0.75);
  }, []);

  const handleZoneTap = (zoneId: string) => {
    if (!selectedItem) {
      speak('Tap an object first.');
      return;
    }
    speak('Between!');
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

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="All BETWEEN!" />;

  return (
    <GameLayout
      title="Place the object BETWEEN"
      instruction="Tap an object, then tap a zone to put it BETWEEN the two items."
      icon="📦"
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
        {selectedItem ? <Text style={styles.hint}>Now tap where to put it BETWEEN</Text> : null}
        <View style={styles.zonesRow}>
          <Pressable onPress={() => handleZoneTap('trees')} style={styles.zoneCard}>
            <Text style={styles.zoneEmoji}>🌳</Text>
            <View style={styles.zoneGap} />
            <Text style={styles.zoneEmoji}>🌳</Text>
            <Text style={styles.zoneLabel}>Between two trees</Text>
          </Pressable>
          <Pressable onPress={() => handleZoneTap('chairs')} style={styles.zoneCard}>
            <Text style={styles.zoneEmoji}>🪑</Text>
            <View style={styles.zoneGap} />
            <Text style={styles.zoneEmoji}>🪑</Text>
            <Text style={styles.zoneLabel}>Between two chairs</Text>
          </Pressable>
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
  zonesRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', justifyContent: 'center' },
  zoneCard: {
    backgroundColor: '#E0E7FF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 4,
    borderColor: '#4F46E5',
    alignItems: 'center',
    minWidth: 140,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  zoneEmoji: { fontSize: 36 },
  zoneGap: { width: 24 },
  zoneLabel: { width: '100%', fontSize: 14, fontWeight: '800', color: '#3730A3', marginTop: 8, textAlign: 'center' },
});
