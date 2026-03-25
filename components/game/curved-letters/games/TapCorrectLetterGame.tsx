// Game 2: Tap the Correct Letter
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../utils/audio';
import { RECOGNITION_LETTERS } from '../utils/gameData';

interface TapCorrectLetterGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

export default function TapCorrectLetterGame({ onComplete, onBack }: TapCorrectLetterGameProps) {
  const { width, height } = useWindowDimensions();
  const [round, setRound] = useState(0);
  const [options, setOptions] = useState<typeof RECOGNITION_LETTERS>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const TOTAL_ROUNDS = 5;
  const TARGET_LETTER = 'C';

  useEffect(() => {
    // Create options: 1 letter C + 3 other letters
    const target = RECOGNITION_LETTERS.find((l) => l.letter === TARGET_LETTER)!;
    const others = RECOGNITION_LETTERS.filter((l) => l.letter !== TARGET_LETTER);
    const shuffled = [target, ...others.slice(0, 3)].sort(() => Math.random() - 0.5);
    setOptions(shuffled);
    setSelectedId(null);
    setIsCorrect(null);
    speakInstruction('Tap the letter C.');
    return () => stopAllAudio();
  }, [round]);

  const handleSelect = (letter: string) => {
    if (selectedId) return;
    const correct = letter === TARGET_LETTER;
    setSelectedId(letter);
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
      playSoundEffect('correct');
      speakFeedback('Correct! That is the letter C!');
    } else {
      playSoundEffect('incorrect');
      speakFeedback('Try again! Look for the letter C.');
    }

    // Move to next round after delay
    setTimeout(() => {
      if (round < TOTAL_ROUNDS - 1) {
        setRound((prev) => prev + 1);
      } else {
        const accuracy = (score / TOTAL_ROUNDS) * 100;
        onComplete({
          correct: score,
          total: TOTAL_ROUNDS,
          accuracy,
          gameId: 'tap-correct-letter',
        });
      }
    }, 2000);
  };

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (selectedId) return;
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#93C5FD', '#FBCFE8', '#A7F3D0'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Tap the Correct Letter</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Tap the letter C</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((letterOption) => {
          const isSelected = selectedId === letterOption.letter;
          const isTarget = letterOption.letter === TARGET_LETTER;
          const showCorrect = isSelected && isCorrect !== null;

          return (
            <Animated.View key={letterOption.letter} style={[styles.optionWrapper, animatedStyle]}>
              <Pressable
                style={[
                  styles.optionCard,
                  isSelected && isCorrect && styles.optionCardCorrect,
                  isSelected && !isCorrect && styles.optionCardIncorrect,
                  showCorrect && isTarget && styles.optionCardHighlight,
                ]}
                onPress={() => handleSelect(letterOption.letter)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={!!selectedId}
              >
                <View style={styles.letterDisplay}>
                  <Text style={[styles.letterText, isSelected && isTarget && styles.letterTextCorrect, isSelected && !isTarget && styles.letterTextIncorrect]}>
                    {letterOption.letter}
                  </Text>
                </View>
                {showCorrect && isTarget && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                  </View>
                )}
                {showCorrect && !isTarget && (
                  <View style={styles.checkmark}>
                    <Ionicons name="close-circle" size={32} color="#EF4444" />
                  </View>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  roundText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  instructionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  optionsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  optionWrapper: {
    width: '22%',
    minWidth: 140,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#E2E8F0',
    minHeight: 200,
  },
  optionCardCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  optionCardIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  optionCardHighlight: {
    borderWidth: 4,
  },
  letterDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    fontSize: 120,
    fontWeight: '900',
    color: '#3B82F6',
  },
  letterTextCorrect: {
    color: '#10B981',
  },
  letterTextIncorrect: {
    color: '#EF4444',
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
