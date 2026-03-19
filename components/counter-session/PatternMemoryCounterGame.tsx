/**
 * Level 5 Counter — Session 7, Game 1: Pattern Memory
 * Remember pattern then repeat it. Show sequence (e.g. red, blue, green), then user taps same order.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PATTERN = ['red', 'blue', 'green'];
const OPTIONS = [
  { id: 'red', label: 'Red', color: '#EF4444' },
  { id: 'blue', label: 'Blue', color: '#3B82F6' },
  { id: 'green', label: 'Green', color: '#22C55E' },
];

export interface PatternMemoryCounterGameProps {
  onComplete: () => void;
}

export function PatternMemoryCounterGame({ onComplete }: PatternMemoryCounterGameProps) {
  const [phase, setPhase] = useState<'show' | 'repeat'>('show');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [userIndex, setUserIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('Watch the pattern. Then tap the colors in the same order.', 0.75);
  }, []);

  useEffect(() => {
    if (phase !== 'show') return;
    let i = 0;
    const run = () => {
      if (i >= PATTERN.length) {
        setHighlightIndex(-1);
        speak('Your turn! Tap red, then blue, then green.', 0.8);
        setPhase('repeat');
        return;
      }
      setHighlightIndex(i);
      i += 1;
      setTimeout(run, 700);
    };
    const t = setTimeout(run, 800);
    return () => clearTimeout(t);
  }, [phase]);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Remember: red, blue, green.', 0.7);
    setUserIndex(0);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (phase !== 'repeat') return;
      const expected = PATTERN[userIndex];
      if (id === expected) {
        const next = userIndex + 1;
        setUserIndex(next);
        speak(id, 0.5);
        if (next >= PATTERN.length) {
          speak('Correct! You repeated the pattern!', 0.75);
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2200);
        }
      } else {
        triggerWrong();
      }
    },
    [phase, userIndex, onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Great Job!"
        subtitle="You remembered the pattern!"
        badgeEmoji="🧠"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Pattern Memory"
      instruction="Watch the pattern, then tap the colors in the same order."
      icon="🧠"
      backgroundVariant="ocean"
    >
      <View style={styles.container}>
        {phase === 'show' ? (
          <>
            <Text style={styles.prompt}>Watch the pattern</Text>
            <View style={styles.patternRow}>
              {PATTERN.map((id, i) => {
                const opt = OPTIONS.find((o) => o.id === id);
                return (
                  <View
                    key={i}
                    style={[
                      styles.patternDot,
                      { backgroundColor: opt?.color ?? '#999' },
                      highlightIndex === i && styles.patternDotHighlight,
                    ]}
                  />
                );
              })}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.prompt}>Your turn! Tap in order: Red, Blue, Green</Text>
            <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
              {OPTIONS.map((opt) => (
                <Pressable
                  key={opt.id}
                  onPress={() => handleTap(opt.id)}
                  style={({ pressed }) => [
                    styles.optionBtn,
                    { backgroundColor: opt.color },
                    pressed && styles.pressed,
                  ]}
                  accessibilityLabel={opt.label}
                >
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                </Pressable>
              ))}
            </Animated.View>
          </>
        )}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 18, fontWeight: '700', color: '#0369A1', marginBottom: 24, textAlign: 'center' },
  patternRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  patternDot: { width: 56, height: 56, borderRadius: 28, opacity: 0.6 },
  patternDotHighlight: { opacity: 1, transform: [{ scale: 1.15 }] },
  optionsRow: { flexDirection: 'row', gap: 16 },
  optionBtn: {
    minWidth: 88,
    paddingVertical: 20,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
  },
  optionLabel: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  pressed: { opacity: 0.9 },
});
