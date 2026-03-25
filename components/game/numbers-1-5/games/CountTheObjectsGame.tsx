// Game 2: Count the Objects
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
import { COUNTING_OBJECTS } from '../utils/gameData';

interface CountTheObjectsGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

export default function CountTheObjectsGame({ onComplete, onBack }: CountTheObjectsGameProps) {
  const { width, height } = useWindowDimensions();
  const [round, setRound] = useState(0);
  const [currentObject, setCurrentObject] = useState(COUNTING_OBJECTS[0]);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const TOTAL_ROUNDS = 5;

  useEffect(() => {
    const shuffled = [...COUNTING_OBJECTS].sort(() => Math.random() - 0.5);
    setCurrentObject(shuffled[round % shuffled.length]);
    setSelectedNumber(null);
    setIsCorrect(null);
    speakInstruction(`How many ${currentObject.emoji === '🍎' ? 'apples' : 'stars'}?`);
    return () => stopAllAudio();
  }, [round]);

  const handleSelect = (number: number) => {
    if (selectedNumber !== null) return;
    const correct = number === currentObject.count;
    setSelectedNumber(number);
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
      playSoundEffect('correct');
      speakFeedback(`Correct! There are ${number} ${currentObject.emoji === '🍎' ? 'apples' : 'stars'}!`);
    } else {
      playSoundEffect('incorrect');
      speakFeedback(`Try again! Count the ${currentObject.emoji === '🍎' ? 'apples' : 'stars'} carefully.`);
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
          gameId: 'count-the-objects',
        });
      }
    }, 2000);
  };

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (selectedNumber !== null) return;
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
        <Text style={styles.title}>Count the Objects</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          How many {currentObject.emoji === '🍎' ? 'apples' : 'stars'}?
        </Text>
      </View>

      {/* Objects Display */}
      <View style={styles.objectsContainer}>
        {Array.from({ length: currentObject.count }).map((_, idx) => (
          <Text key={idx} style={styles.objectEmoji}>
            {currentObject.emoji}
          </Text>
        ))}
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentObject.options.map((number) => {
          const isSelected = selectedNumber === number;
          const isCorrectAnswer = number === currentObject.count;
          const showCorrect = isSelected && isCorrect !== null;

          return (
            <Animated.View key={number} style={[styles.optionWrapper, animatedStyle]}>
              <Pressable
                style={[
                  styles.optionCard,
                  isSelected && isCorrect && styles.optionCardCorrect,
                  isSelected && !isCorrect && styles.optionCardIncorrect,
                  showCorrect && isCorrectAnswer && styles.optionCardHighlight,
                ]}
                onPress={() => handleSelect(number)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={selectedNumber !== null}
              >
                <Text
                  style={[
                    styles.optionNumber,
                    isSelected && isCorrect && styles.optionNumberCorrect,
                    isSelected && !isCorrect && styles.optionNumberIncorrect,
                  ]}
                >
                  {number}
                </Text>
                {showCorrect && isCorrectAnswer && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                  </View>
                )}
                {showCorrect && !isCorrectAnswer && (
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
  questionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  objectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
    minHeight: 150,
  },
  objectEmoji: {
    fontSize: 64,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  optionWrapper: {
    width: '25%',
    minWidth: 100,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#E2E8F0',
    minHeight: 120,
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
  optionNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: '#3B82F6',
  },
  optionNumberCorrect: {
    color: '#10B981',
  },
  optionNumberIncorrect: {
    color: '#EF4444',
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
