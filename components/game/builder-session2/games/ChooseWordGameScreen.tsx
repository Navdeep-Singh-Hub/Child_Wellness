// Game 2: Choose the Word
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
import { WORD_OPTIONS, WORD_BAT } from '../utils/gameData';

interface ChooseWordGameScreenProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

// Shuffle array function
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function ChooseWordGameScreen({ onComplete, onBack }: ChooseWordGameScreenProps) {
  const { width, height } = useWindowDimensions();
  const [round, setRound] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState(() => shuffleArray(WORD_OPTIONS));
  const TOTAL_ROUNDS = 5;
  const TARGET_WORD = 'BAT';

  useEffect(() => {
    setSelectedWord(null);
    setIsCorrect(null);
    setShuffledOptions(shuffleArray(WORD_OPTIONS));
    speakInstruction('Tap the word BAT.');
    return () => stopAllAudio();
  }, [round]);

  const handleSelect = (word: string) => {
    if (selectedWord) return;
    const correct = word === TARGET_WORD;
    setSelectedWord(word);
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
      playSoundEffect('correct');
      speakFeedback('Correct! That spells BAT!');
    } else {
      playSoundEffect('incorrect');
      speakFeedback('Try again! Look for the word BAT.');
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
          gameId: 'choose-word',
        });
      }
    }, 2000);
  };

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (selectedWord) return;
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#6C9EFF', '#FFB6C1', '#7FE7CC'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Choose the Word</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Tap the word BAT</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {shuffledOptions.map((option) => {
          const isSelected = selectedWord === option.word;
          const isTarget = option.word === TARGET_WORD;
          const showCorrect = isSelected && isCorrect !== null;

          return (
            <Animated.View key={option.word} style={[styles.optionWrapper, animatedStyle]}>
              <Pressable
                style={[
                  styles.optionCard,
                  isSelected && isCorrect && styles.optionCardCorrect,
                  isSelected && !isCorrect && styles.optionCardIncorrect,
                  showCorrect && isTarget && styles.optionCardHighlight,
                ]}
                onPress={() => handleSelect(option.word)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={!!selectedWord}
              >
                <Text style={styles.optionEmoji}>{option.image}</Text>
                <Text
                  style={[
                    styles.optionText,
                    isSelected && isTarget && styles.optionTextCorrect,
                    isSelected && !isTarget && styles.optionTextIncorrect,
                  ]}
                >
                  {option.word}
                </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  optionWrapper: {
    width: '80%',
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#E2E8F0',
    minHeight: 180,
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
    borderWidth: 6,
  },
  optionEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  optionText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#6C9EFF',
  },
  optionTextCorrect: {
    color: '#10B981',
  },
  optionTextIncorrect: {
    color: '#EF4444',
  },
  checkmark: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});
