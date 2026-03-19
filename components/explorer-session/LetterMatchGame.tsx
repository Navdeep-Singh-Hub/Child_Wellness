/**
 * Game 2 — Match Letter to Object: A → Apple, B → Ball.
 * Tap to match (tap letter then picture, or show pairs). AAC-friendly: large targets.
 * Simplified: show "A" and "Apple" / "B" and "Ball"; tap the matching pair (A then Apple, or one card that says "A - Apple").
 * We use two rows: letters A, B. Two pictures: Apple, Ball. Instruction: "Drag the letter to the correct picture."
 * For touch reliability we do tap-to-match: tap a letter, then tap the correct picture. If match correct, show success for that pair.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

const DEFAULT_PAIRS: { letter: string; object: string; emoji: string }[] = [
  { letter: 'A', object: 'Apple', emoji: '🍎' },
  { letter: 'B', object: 'Ball', emoji: '⚽' },
];

export interface LetterMatchGameProps {
  onComplete: () => void;
  pairs?: { letter: string; object: string; emoji: string }[];
}

export function LetterMatchGame({ onComplete, pairs = DEFAULT_PAIRS }: LetterMatchGameProps) {
  const voice = 'Match the letter to the correct picture.';
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongShake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    speak(voice, 0.75);
  }, [voice]);

  const triggerWrong = useCallback(() => {
    wrongShake.setValue(0);
    Animated.sequence([
      Animated.timing(wrongShake, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(wrongShake, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [wrongShake]);

  const handleLetterTap = useCallback((letter: string) => {
    setSelectedLetter(letter);
    speak(letter, 0.7);
  }, []);

  const handleObjectTap = useCallback(
    (letter: string, object: string) => {
      if (matched.has(letter)) return;
      if (selectedLetter !== letter) {
        speak('Try again. Match the letter to the picture.');
        triggerWrong();
        setSelectedLetter(null);
        return;
      }
      speak(`Correct! ${letter} for ${object}!`);
      setMatched((m) => new Set(m).add(letter));
      setSelectedLetter(null);
      if (matched.size + 1 >= pairs.length) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [selectedLetter, matched, onComplete, triggerWrong]
  );

  const lettersLabel = pairs.map((p) => p.letter).join(' and ');
  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Great Job!"
        subtitle={`You matched ${lettersLabel}!`}
        badgeEmoji="⭐"
      />
    );
  }

  const shakeX = wrongShake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <GameLayout
      title="Match the letter to the picture"
      instruction="Tap a letter, then tap the picture that goes with it."
      icon="🔗"
      backgroundVariant="indigo"
    >
      <View style={styles.container}>
        <Text style={styles.label}>Letters</Text>
        <View style={styles.letterRow}>
          {pairs.map(({ letter }) => (
            <Pressable
              key={letter}
              onPress={() => handleLetterTap(letter)}
              style={[
                styles.letterBtn,
                selectedLetter === letter && styles.letterBtnSelected,
                matched.has(letter) && styles.letterBtnMatched,
              ]}
              accessibilityLabel={`Letter ${letter}`}
            >
              <Text style={styles.letterText}>{letter}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Pictures</Text>
        <Animated.View style={[styles.objectRow, { transform: [{ translateX: shakeX }] }]}>
          {pairs.map(({ letter, object, emoji }) => (
            <Pressable
              key={letter}
              onPress={() => handleObjectTap(letter, object)}
              style={[
                styles.objectBtn,
                matched.has(letter) && styles.objectBtnMatched,
              ]}
              accessibilityLabel={`${object}, matches ${letter}`}
            >
              <Text style={styles.emoji}>{emoji}</Text>
              <Text style={styles.objectText}>{object}</Text>
            </Pressable>
          ))}
        </Animated.View>
        {selectedLetter ? (
          <Text style={styles.hint}>Now tap the picture for {selectedLetter}</Text>
        ) : null}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  label: { fontSize: 18, fontWeight: '700', color: '#4F46E5', marginBottom: 12 },
  letterRow: { flexDirection: 'row', gap: 20, marginBottom: 28 },
  letterBtn: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#E0E7FF',
    borderWidth: 4,
    borderColor: '#818CF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterBtnSelected: { borderColor: '#22C55E', backgroundColor: '#DCFCE7' },
  letterBtnMatched: { borderColor: '#22C55E', backgroundColor: '#BBF7D0', opacity: 0.9 },
  letterText: { fontSize: 36, fontWeight: '800', color: '#4F46E5' },
  objectRow: { flexDirection: 'row', gap: 24 },
  objectBtn: {
    width: 100,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  objectBtnMatched: { borderColor: '#22C55E', backgroundColor: '#DCFCE7' },
  emoji: { fontSize: 40, marginBottom: 8 },
  objectText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  hint: { marginTop: 20, fontSize: 16, color: '#6B7280', fontWeight: '600' },
});
