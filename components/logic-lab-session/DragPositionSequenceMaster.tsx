/**
 * Game 2 — Place ball IN box, cup ON table, cat UNDER chair. Session 9: Sequence Master.
 */
import { speak } from '@/utils/tts';
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const ITEMS: { id: string; label: string; emoji: string; correctZone: string }[] = [
  { id: 'ball', label: 'Ball', emoji: '⚽', correctZone: 'inBox' },
  { id: 'cup', label: 'Cup', emoji: '☕', correctZone: 'onTable' },
  { id: 'cat', label: 'Cat', emoji: '🐱', correctZone: 'underChair' },
];
const VOICE = 'Place each object in the correct position. Ball in box, cup on table, cat under chair.';

export function DragPositionSequenceMaster({ onComplete }: { onComplete: () => void }) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake, setWrongShake] = useState(false);

  useEffect(() => {
    speak(VOICE, 0.75);
  }, []);

  const handleZoneTap = (zoneId: string) => {
    if (!selectedItem) {
      speak('Tap an object first.');
      return;
    }
    const item = ITEMS.find((i) => i.id === selectedItem);
    if (!item) return;
    const correct = item.correctZone === zoneId;
    if (correct) {
      const prep = item.correctZone === 'inBox' ? 'in' : item.correctZone === 'onTable' ? 'on' : 'under';
      speak(`${item.label} ${prep}!`);
      setPlacements((prev) => {
        const next = { ...prev, [selectedItem]: zoneId };
        setSelectedItem(null);
        if (Object.keys(next).length === ITEMS.length) {
          speak('Great job!');
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2200);
        }
        return next;
      });
    } else {
      speak('Try again. Find the right spot.');
      setWrongShake(true);
      setTimeout(() => setWrongShake(false), 400);
    }
  };

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="All in the right place!" />;

  const remaining = ITEMS.filter((i) => !placements[i.id]);

  return (
    <GameLayout
      title="Place the object correctly"
      instruction="Tap an object, then tap where it goes: ball IN box, cup ON table, cat UNDER chair."
      icon="📦"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.itemsRow}>
          {remaining.map((item) => {
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
        {selectedItem ? <Text style={styles.hint}>Now tap the correct position</Text> : null}
        <View style={styles.zonesColumn}>
          <Pressable
            onPress={() => handleZoneTap('inBox')}
            style={[styles.zoneCard, wrongShake && styles.zoneShake]}
          >
            <Text style={styles.zoneEmoji}>📦</Text>
            <Text style={styles.zoneLabel}>IN the box</Text>
            {Object.entries(placements).find(([, z]) => z === 'inBox') && (
              <Text style={styles.placedEmoji}>{ITEMS.find((i) => placements[i.id] === 'inBox')?.emoji}</Text>
            )}
          </Pressable>
          <Pressable
            onPress={() => handleZoneTap('onTable')}
            style={[styles.zoneCard, wrongShake && styles.zoneShake]}
          >
            <Text style={styles.zoneLabel}>ON the table</Text>
            {Object.entries(placements).find(([, z]) => z === 'onTable') && (
              <Text style={styles.placedEmoji}>{ITEMS.find((i) => placements[i.id] === 'onTable')?.emoji}</Text>
            )}
          </Pressable>
          <Pressable
            onPress={() => handleZoneTap('underChair')}
            style={[styles.zoneCard, wrongShake && styles.zoneShake]}
          >
            <Text style={styles.zoneEmoji}>🪑</Text>
            <Text style={styles.zoneLabel}>UNDER the chair</Text>
            {Object.entries(placements).find(([, z]) => z === 'underChair') && (
              <Text style={styles.placedEmoji}>{ITEMS.find((i) => placements[i.id] === 'underChair')?.emoji}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 8, alignItems: 'center' },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 20 },
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
  zonesColumn: { gap: 12, width: '100%', maxWidth: 320 },
  zoneCard: {
    backgroundColor: '#E0E7FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 4,
    borderColor: '#4F46E5',
    alignItems: 'center',
  },
  zoneShake: { opacity: 0.9 },
  zoneEmoji: { fontSize: 36, marginBottom: 4 },
  zoneLabel: { fontSize: 16, fontWeight: '800', color: '#3730A3' },
  placedEmoji: { fontSize: 28, marginTop: 4 },
});
