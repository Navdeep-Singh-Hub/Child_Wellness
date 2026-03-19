/**
 * Game 2 — Place the boy BEHIND tree or house. Session 5: Preposition BEHIND.
 */
import { speak } from '@/utils/tts';
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const VOICE = 'Place the boy BEHIND the object. Tap the boy, then tap tree or house.';

export function DragBehindObject({ onComplete }: { onComplete: () => void }) {
  const [selectedBoy, setSelectedBoy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    speak(VOICE, 0.75);
  }, []);

  const handleTargetTap = () => {
    if (!selectedBoy) {
      speak('Tap the boy first.');
      return;
    }
    speak('Behind!');
    setShowSuccess(true);
    setTimeout(() => onComplete(), 2200);
  };

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="Boy is BEHIND!" />;

  return (
    <GameLayout
      title="Place the character BEHIND"
      instruction="Tap the boy, then tap tree or house to put him BEHIND it."
      icon="👦"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.prompt}>Tap the boy, then tap where he should go BEHIND.</Text>
        <View style={styles.characterRow}>
          <Pressable
            onPress={() => setSelectedBoy((s) => !s)}
            style={[styles.boyCard, selectedBoy && styles.boySelected]}
            accessibilityLabel="Boy, tap to select"
          >
            <Text style={styles.boyEmoji}>👦</Text>
            <Text style={styles.boyLabel}>Boy</Text>
          </Pressable>
        </View>
        {selectedBoy ? <Text style={styles.hint}>Now tap tree or house</Text> : null}
        <View style={styles.targetsRow}>
          <View style={styles.targetCard}>
            <Text style={styles.targetEmoji}>🌳</Text>
            <Text style={styles.targetLabel}>Tree</Text>
            <Pressable onPress={handleTargetTap} style={styles.targetTouch} />
          </View>
          <View style={styles.targetCard}>
            <Text style={styles.targetEmoji}>🏠</Text>
            <Text style={styles.targetLabel}>House</Text>
            <Pressable onPress={handleTargetTap} style={styles.targetTouch} />
          </View>
        </View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 8, alignItems: 'center' },
  prompt: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 20, textAlign: 'center' },
  characterRow: { marginBottom: 24 },
  boyCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 4,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    minWidth: 120,
  },
  boySelected: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  boyEmoji: { fontSize: 56, marginBottom: 8 },
  boyLabel: { fontSize: 20, fontWeight: '800', color: '#374151' },
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
