/**
 * Level 7 Reader — Session 4, Game 3: Object Function
 * Match object with its function. "What do we use for writing?" → Pencil.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const QUESTION = { prompt: 'What do we use for writing?', correctId: 'pencil', useLabel: 'Writing' };
const OBJECTS = [
  { id: 'pencil', label: 'Pencil', emoji: '✏️' },
  { id: 'cup', label: 'Cup', emoji: '🥤' },
  { id: 'hat', label: 'Hat', emoji: '🧢' },
];

export interface ObjectFunctionReaderSession4GameProps {
  onComplete: () => void;
}

export function ObjectFunctionReaderSession4Game({ onComplete }: ObjectFunctionReaderSession4GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak('What do we use for writing? Tap the object we use to write.', 0.75);
  }, []);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    speak('Try again. Which one do we use for writing?', 0.7);
  }, [wrongShake]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === QUESTION.correctId) {
        speak('Correct! We use a pencil for writing!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        triggerWrong();
      }
    },
    [onComplete, triggerWrong]
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You matched the object to its use!"
        badgeEmoji="✏️"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Object Function"
      instruction="Match the object to its use. What do we use for writing?"
      icon="✏️"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>{QUESTION.prompt}</Text>
        <View style={styles.useBox}>
          <Text style={styles.useEmoji}>📝</Text>
          <Text style={styles.useText}>{QUESTION.useLabel}</Text>
        </View>
        <Text style={styles.tapLabel}>Tap the object</Text>
        <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeX }] }]}>
          {OBJECTS.map((obj) => (
            <Pressable
              key={obj.id}
              onPress={() => handleTap(obj.id)}
              style={({ pressed }) => [styles.optionBtn, pressed && styles.pressed]}
              accessibilityLabel={obj.label}
            >
              <Text style={styles.objEmoji}>{obj.emoji}</Text>
              <Text style={styles.objLabel}>{obj.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  prompt: { fontSize: 22, fontWeight: '800', color: '#4338CA', marginBottom: 16, textAlign: 'center' },
  useBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderWidth: 3,
    borderColor: '#818CF8',
    marginBottom: 20,
  },
  useEmoji: { fontSize: 32 },
  useText: { fontSize: 20, fontWeight: '800', color: '#4338CA' },
  tapLabel: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  optionBtn: {
    minWidth: 100,
    paddingVertical: 18,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#818CF8',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  objEmoji: { fontSize: 44, marginBottom: 8 },
  objLabel: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  pressed: { opacity: 0.9, backgroundColor: '#EEF2FF' },
});
