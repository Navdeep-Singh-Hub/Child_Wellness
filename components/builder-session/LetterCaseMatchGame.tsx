/**
 * Builder Session 6 — Game 3: Letter Match
 * Match uppercase A with lowercase a. Tap uppercase then tap matching lowercase.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PAIRS = [
  { id: 'a', upper: 'A', lower: 'a' },
  { id: 'b', upper: 'B', lower: 'b' },
  { id: 'c', upper: 'C', lower: 'c' },
];

export interface LetterCaseMatchGameProps {
  onComplete: () => void;
}

export function LetterCaseMatchGame({ onComplete }: LetterCaseMatchGameProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Match the big letter with the small letter. Tap a big letter, then tap its small letter.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Match the big letter to the small letter.', 0.7);
  }, [wrongShake]);

  const handleUpperTap = useCallback((id: string) => {
    if (matched.has(id)) return;
    setSelectedId(id);
    const p = PAIRS.find((x) => x.id === id);
    speak(p?.upper ?? id, 0.7);
  }, [matched]);

  const handleLowerTap = useCallback(
    (id: string) => {
      if (!selectedId) return;
      if (selectedId !== id) {
        triggerWrong();
        setSelectedId(null);
        return;
      }
      const p = PAIRS.find((x) => x.id === id);
      speak(`${p?.upper} and ${p?.lower}!`, 0.7);
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
        subtitle="You matched A, B, and C!"
        badgeEmoji="🔤"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Letter Match"
      instruction="Match the big letter with the small letter."
      icon="🔤"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Big letters</Text>
        <Animated.View style={[styles.row, { transform: [{ translateX: shakeX }] }]}>
          {PAIRS.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => handleUpperTap(p.id)}
              style={[
                styles.letterBtn,
                styles.upperBtn,
                selectedId === p.id && styles.selected,
                matched.has(p.id) && styles.matched,
              ]}
              accessibilityLabel={`Letter ${p.upper}`}
            >
              <Text style={styles.upperText}>{p.upper}</Text>
            </Pressable>
          ))}
        </Animated.View>
        <Text style={styles.label}>Small letters</Text>
        <View style={styles.row}>
          {PAIRS.map((p) => (
            <Pressable
              key={`lower-${p.id}`}
              onPress={() => handleLowerTap(p.id)}
              style={[
                styles.letterBtn,
                styles.lowerBtn,
                matched.has(p.id) && styles.matched,
              ]}
              accessibilityLabel={`Letter ${p.lower}`}
            >
              <Text style={styles.lowerText}>{p.lower}</Text>
            </Pressable>
          ))}
        </View>
        {selectedId ? (
          <Text style={styles.hint}>Tap the small letter for {PAIRS.find((x) => x.id === selectedId)?.upper}</Text>
        ) : null}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#4F46E5', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 20, marginBottom: 24 },
  letterBtn: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upperBtn: { backgroundColor: '#EDE9FE', borderColor: '#8B5CF6' },
  lowerBtn: { backgroundColor: '#FFF', borderColor: '#A78BFA' },
  upperText: { fontSize: 36, fontWeight: '800', color: '#5B21B6' },
  lowerText: { fontSize: 32, fontWeight: '800', color: '#5B21B6' },
  selected: { borderColor: '#22C55E', backgroundColor: '#DCFCE7' },
  matched: { borderColor: '#22C55E', backgroundColor: '#BBF7D0', opacity: 0.9 },
  hint: { marginTop: 16, fontSize: 16, color: '#6B7280', fontWeight: '600' },
});
