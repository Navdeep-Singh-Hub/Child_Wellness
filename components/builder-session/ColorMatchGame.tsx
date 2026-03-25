/**
 * Builder Session 1 — Game 4: Color Match
 * Drag colored objects into correct colored boxes. (Tap-to-match: tap object then tap box.)
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const COLORS = [
  { id: 'red', label: 'Red', color: '#EF4444', emoji: '🔴' },
  { id: 'blue', label: 'Blue', color: '#3B82F6', emoji: '🔵' },
  { id: 'yellow', label: 'Yellow', color: '#FBBF24', emoji: '🟡' },
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

export interface ColorMatchGameProps {
  onComplete: () => void;
}

export function ColorMatchGame({ onComplete }: ColorMatchGameProps) {
  const [colorOrder] = useState(() => shuffleArray(COLORS));
  const [boxOrder] = useState(() => shuffleWithoutSameColumn(colorOrder, COLORS));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Put each color in the matching box. Tap a color, then tap its box.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Match the color to its box.', 0.7);
  }, [wrongShake]);

  const handleColorTap = useCallback((id: string) => {
    if (matched.has(id)) return;
    setSelectedId(id);
    speak(COLORS.find((c) => c.id === id)?.label ?? id, 0.7);
  }, [matched]);

  const handleBoxTap = useCallback(
    (id: string) => {
      if (matched.has(id)) return;
      if (selectedId !== id) {
        triggerWrong();
        setSelectedId(null);
        return;
      }
      speak(`Correct! ${COLORS.find((c) => c.id === id)?.label} matches!`, 0.7);
      setMatched((m) => new Set(m).add(id));
      setSelectedId(null);
      if (matched.size + 1 >= colorOrder.length) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [selectedId, matched, onComplete, triggerWrong, colorOrder.length]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Great Job!"
        subtitle="You matched all the colors!"
        badgeEmoji="🎨"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Color Match"
      instruction="Tap a color, then tap the matching box."
      icon="🎨"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Colors</Text>
        <Animated.View style={[styles.row, { transform: [{ translateX: shakeX }] }]}>
          {colorOrder.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => handleColorTap(c.id)}
              style={[
                styles.colorCard,
                { backgroundColor: c.color },
                selectedId === c.id && styles.colorCardSelected,
                matched.has(c.id) && styles.colorCardMatched,
              ]}
              accessibilityLabel={c.label}
            >
              <Text style={styles.emoji}>{c.emoji}</Text>
              <Text style={styles.colorLabel}>{c.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
        <Text style={styles.label}>Boxes</Text>
        <View style={styles.row}>
          {boxOrder.map((c) => (
            <Pressable
              key={`box-${c.id}`}
              onPress={() => handleBoxTap(c.id)}
              style={[
                styles.box,
                { borderColor: c.color },
                matched.has(c.id) && [styles.boxMatched, { backgroundColor: c.color }],
              ]}
              accessibilityLabel={`${c.label} box`}
            >
              {matched.has(c.id) ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text style={[styles.boxLabel, { color: c.color }]}>{c.label}</Text>
              )}
            </Pressable>
          ))}
        </View>
        {selectedId ? (
          <Text style={styles.hint}>Now tap the {COLORS.find((c) => c.id === selectedId)?.label} box</Text>
        ) : null}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#4F46E5', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 20, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' },
  colorCard: {
    width: 90,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
  },
  colorCardSelected: { borderColor: '#22C55E', borderWidth: 5 },
  colorCardMatched: { opacity: 0.85 },
  emoji: { fontSize: 36, marginBottom: 6 },
  colorLabel: { fontSize: 14, fontWeight: '800', color: '#1F2937' },
  box: {
    width: 90,
    height: 90,
    borderRadius: 16,
    borderWidth: 4,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxMatched: { opacity: 0.95 },
  boxLabel: { fontSize: 14, fontWeight: '800' },
  checkmark: { fontSize: 32, fontWeight: '800', color: '#FFF' },
  hint: { marginTop: 16, fontSize: 16, color: '#6B7280', fontWeight: '600' },
});
