/**
 * Builder Session 1 — Game 3: Drag & Drop Matching
 * Match objects with their shadows. Tap object then tap correct shadow (touch-friendly).
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PAIRS = [
  { id: 'apple', emoji: '🍎', label: 'Apple' },
  { id: 'ball', emoji: '⚽', label: 'Ball' },
  { id: 'star', emoji: '⭐', label: 'Star' },
];

export interface ShadowMatchGameProps {
  onComplete: () => void;
}

export function ShadowMatchGame({ onComplete }: ShadowMatchGameProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Match each object to its shadow. Tap an object, then tap its shadow.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Match the object to its shadow.', 0.7);
  }, [wrongShake]);

  const handleObjectTap = useCallback((id: string) => {
    if (matched.has(id)) return;
    setSelectedId(id);
    speak(PAIRS.find((p) => p.id === id)?.label ?? id, 0.7);
  }, [matched]);

  const handleShadowTap = useCallback(
    (id: string) => {
      if (matched.has(id)) return;
      if (selectedId !== id) {
        triggerWrong();
        setSelectedId(null);
        return;
      }
      speak(`Correct! ${PAIRS.find((p) => p.id === id)?.label} matches!`, 0.7);
      setMatched((m) => new Set(m).add(id));
      setSelectedId(null);
      if (matched.size + 1 >= PAIRS.length) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [selectedId, matched, onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Great Job!"
        subtitle="You matched all the shadows!"
        badgeEmoji="⭐"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Match to Shadows"
      instruction="Tap an object, then tap its shadow."
      icon="🖼️"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Objects</Text>
        <Animated.View style={[styles.row, { transform: [{ translateX: shakeX }] }]}>
          {PAIRS.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => handleObjectTap(p.id)}
              style={[
                styles.objectCard,
                selectedId === p.id && styles.objectCardSelected,
                matched.has(p.id) && styles.objectCardMatched,
              ]}
              accessibilityLabel={`${p.label}`}
            >
              <Text style={styles.emoji}>{p.emoji}</Text>
              <Text style={styles.objectLabel}>{p.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
        <Text style={styles.label}>Shadows</Text>
        <View style={styles.row}>
          {PAIRS.map((p) => (
            <Pressable
              key={`shadow-${p.id}`}
              onPress={() => handleShadowTap(p.id)}
              style={[
                styles.shadowCard,
                matched.has(p.id) && styles.shadowCardMatched,
              ]}
              accessibilityLabel={`Shadow of ${p.label}`}
            >
              <View style={styles.shadowOutline}>
                <Text style={styles.shadowEmoji}>{p.emoji}</Text>
              </View>
            </Pressable>
          ))}
        </View>
        {selectedId ? (
          <Text style={styles.hint}>Now tap the shadow for {PAIRS.find((p) => p.id === selectedId)?.label}</Text>
        ) : null}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#4F46E5', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 16, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' },
  objectCard: {
    width: 96,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#A78BFA',
    alignItems: 'center',
  },
  objectCardSelected: { borderColor: '#22C55E', backgroundColor: '#DCFCE7' },
  objectCardMatched: { borderColor: '#22C55E', backgroundColor: '#BBF7D0', opacity: 0.9 },
  emoji: { fontSize: 40, marginBottom: 6 },
  objectLabel: { fontSize: 14, fontWeight: '700', color: '#5B21B6' },
  shadowCard: {
    width: 96,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 4,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  shadowCardMatched: { borderColor: '#22C55E', backgroundColor: '#DCFCE7' },
  shadowOutline: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowEmoji: { fontSize: 32, opacity: 0.9 },
  hint: { marginTop: 16, fontSize: 16, color: '#6B7280', fontWeight: '600' },
});
