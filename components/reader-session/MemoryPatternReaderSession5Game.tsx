/**
 * Level 7 Reader — Session 5, Game 1: Memory Pattern
 * Show sequence of colors, then user repeats it. Simon-says style.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const PATTERN = ['red', 'blue', 'green', 'yellow'];
const OPTIONS = [
  { id: 'red', label: 'Red', color: '#EF4444' },
  { id: 'blue', label: 'Blue', color: '#3B82F6' },
  { id: 'green', label: 'Green', color: '#22C55E' },
  { id: 'yellow', label: 'Yellow', color: '#EAB308' },
];

export interface MemoryPatternReaderSession5GameProps {
  onComplete: () => void;
}

export function MemoryPatternReaderSession5Game({ onComplete }: MemoryPatternReaderSession5GameProps) {
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
        speak('Your turn! Tap the colors in the same order.', 0.8);
        setPhase('repeat');
        return;
      }
      setHighlightIndex(i);
      i += 1;
      setTimeout(run, 650);
    };
    const t = setTimeout(run, 700);
    return () => clearTimeout(t);
  }, [phase]);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Watch and remember the order.', 0.7);
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
        variant="indigo"
        title="Great Job!"
        subtitle="You remembered the pattern!"
        badgeEmoji="🧠"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Memory Pattern"
      instruction="Watch the pattern, then tap the colors in the same order."
      icon="🧠"
      backgroundVariant="indigo"
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
            <Text style={styles.prompt}>Your turn! Tap in the same order</Text>
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
  prompt: { fontSize: 18, fontWeight: '700', color: '#4338CA', marginBottom: 24, textAlign: 'center' },
  patternRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  patternDot: { width: 48, height: 48, borderRadius: 24, borderWidth: 4, borderColor: '#C7D2FE' },
  patternDotHighlight: { borderColor: '#FFF', transform: [{ scale: 1.15 }] },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center' },
  optionBtn: {
    minWidth: 72,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
  },
  optionLabel: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  pressed: { opacity: 0.9 },
});
