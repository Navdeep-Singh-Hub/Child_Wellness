/**
 * Game 2 — Put the objects IN: Drag (tap) objects into containers.
 * Containers: box, basket. Items: apple, toy, ball. Any item can go in any container (IN).
 * Tap item then container to place. AAC-friendly.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const CONTAINERS = [
  { id: 'box', label: 'Box', emoji: '📦' },
  { id: 'basket', label: 'Basket', emoji: '🧺' },
];
const ITEMS = [
  { id: 'apple', label: 'Apple', emoji: '🍎' },
  { id: 'toy', label: 'Toy', emoji: '🧸' },
  { id: 'ball', label: 'Ball', emoji: '⚽' },
];
const VOICE = 'Put the objects IN the containers. Tap an object, then tap a container.';

export function DragIntoContainer({ onComplete }: { onComplete: () => void }) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [snapAnim] = useState(() => new Animated.Value(0));
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak(VOICE, 0.75);
  }, []);

  const triggerSnap = useCallback(() => {
    snapAnim.setValue(0);
    Animated.timing(snapAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [snapAnim]);
  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [wrongShake]);

  const handleContainerTap = useCallback(
    (containerId: string) => {
      if (!selectedItem) {
        speak('Tap an object first.');
        return;
      }
      speak('In!');
      triggerSnap();
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
    },
    [selectedItem, onComplete, triggerSnap]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="All objects are IN!" />;

  return (
    <GameLayout
      title="Put the objects IN"
      instruction="Tap an object, then tap a container to put it IN."
      icon="📦"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <View style={styles.itemsRow}>
          {ITEMS.map((item) => {
            const isPlaced = placed.has(item.id);
            const isSelected = selectedItem === item.id;
            if (isPlaced) return null;
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
        {selectedItem ? (
          <Text style={styles.hint}>Now tap a container to put it IN</Text>
        ) : null}
        <View style={styles.containersRow}>
          {CONTAINERS.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => handleContainerTap(c.id)}
              style={({ pressed }) => [styles.containerCard, pressed && styles.pressed]}
              accessibilityLabel={`Put in ${c.label}`}
            >
              <Text style={styles.containerEmoji}>{c.emoji}</Text>
              <Text style={styles.containerLabel}>{c.label}</Text>
              {ITEMS.filter((i) => placed.has(i.id)).length > 0 && (
                <View style={styles.placedPreview}>
                  {ITEMS.filter((i) => placed.has(i.id)).map((i) => (
                    <Text key={i.id} style={styles.placedEmoji}>{i.emoji}</Text>
                  ))}
                </View>
              )}
            </Pressable>
          ))}
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
  containersRow: { flexDirection: 'row', gap: 20, flexWrap: 'wrap', justifyContent: 'center' },
  containerCard: {
    backgroundColor: '#E0E7FF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 4,
    borderColor: '#4F46E5',
    alignItems: 'center',
    minWidth: 120,
  },
  pressed: { opacity: 0.9 },
  containerEmoji: { fontSize: 48, marginBottom: 8 },
  containerLabel: { fontSize: 18, fontWeight: '800', color: '#3730A3' },
  placedPreview: { flexDirection: 'row', marginTop: 8, gap: 4 },
  placedEmoji: { fontSize: 24 },
});
