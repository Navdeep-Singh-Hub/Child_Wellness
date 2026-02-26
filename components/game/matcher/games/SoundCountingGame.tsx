// Game 3: Sound Counting Match
import { playWord, playSoundEffect, speakFeedback, stopAllAudio } from '../utils/audio';
import { SOUND_COUNT_DATA, Difficulty } from '../utils/gameData';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SoundCountingGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;
const INITIAL_DIFFICULTY: Difficulty = 'hard';

export default function SoundCountingGame({ onComplete, onBack }: SoundCountingGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>(INITIAL_DIFFICULTY);
  const [currentItem, setCurrentItem] = useState<typeof SOUND_COUNT_DATA[0] | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const wordScale = useSharedValue(1);
  const dotsScale = useSharedValue(0);

  useEffect(() => {
    loadRound();
  }, [round, difficulty]);

  useEffect(() => {
    if (currentItem) {
      setTimeout(() => {
        playWord(currentItem.word);
      }, 500);
    }
  }, [currentItem]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'sound-counting',
      });
      return;
    }

    const item = SOUND_COUNT_DATA[round % SOUND_COUNT_DATA.length];
    setCurrentItem(item);
    setSelectedNumber(null);
    setIsCorrect(null);
    setCanSelect(true);
    setShowBreakdown(false);
    wordScale.value = 1;
    dotsScale.value = 0;
  };

  const handleSelect = async (number: number) => {
    if (!canSelect || !currentItem) return;

    setCanSelect(false);
    setSelectedNumber(number);
    const correct = number === currentItem.soundCount;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      setShowBreakdown(true);
      dotsScale.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(1.1, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
      await playSoundEffect('correct');
      await speakFeedback(true);
    } else {
      wordScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 8 })
      );
      await playSoundEffect('incorrect');
      await speakFeedback(false);
    }

    // Adjust difficulty
    const newScore = correct ? score + 1 : score;
    const accuracy = ((newScore + (correct ? 1 : 0)) / (round + 1)) * 100;
    if (accuracy > 85 && difficulty !== 'hard') {
      const nextDifficulty: Difficulty = difficulty === 'easy' ? 'medium' : 'hard';
      setDifficulty(nextDifficulty);
    } else if (accuracy < 50 && difficulty !== 'easy') {
      const prevDifficulty: Difficulty = difficulty === 'hard' ? 'medium' : 'easy';
      setDifficulty(prevDifficulty);
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 3000);
  };

  const handleReplay = () => {
    if (currentItem) {
      playWord(currentItem.word);
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  if (!currentItem) return null;

  const wordAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: wordScale.value }],
  }));

  const dotsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotsScale.value }],
    opacity: dotsScale.value,
  }));

  const numbers = [1, 2, 3, 4, 5];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#F0F9FF', '#E0F2FE']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
          <Text style={styles.headerSubtitle}>Score: {score}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>Count the sounds in the word</Text>
      </View>

      {/* Word Display */}
      <View style={styles.wordContainer}>
        <Pressable onPress={handleReplay} style={styles.wordButton}>
          <Animated.View style={[styles.wordCard, wordAnimatedStyle]}>
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              style={styles.wordGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.wordText}>{currentItem.word}</Text>
            </LinearGradient>
          </Animated.View>
        </Pressable>
        <Text style={styles.wordHint}>Tap to hear the word</Text>
      </View>

      {/* Sound Breakdown */}
      {showBreakdown && isCorrect && (
        <Animated.View style={[styles.breakdownContainer, dotsAnimatedStyle]}>
          <Text style={styles.breakdownTitle}>Sounds:</Text>
          <View style={styles.dotsContainer}>
            {currentItem.sounds.map((sound, idx) => (
              <View key={idx} style={styles.dot}>
                <Text style={styles.dotText}>{sound}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Number Options */}
      <View style={styles.numbersContainer}>
        {numbers.map((number) => {
          const isSelected = selectedNumber === number;
          const showCorrect = isSelected && isCorrect === true;
          const showIncorrect = isSelected && isCorrect === false;

          return (
            <Pressable
              key={number}
              onPress={() => handleSelect(number)}
              disabled={!canSelect}
              style={[
                styles.numberButton,
                showCorrect && styles.numberButtonCorrect,
                showIncorrect && styles.numberButtonIncorrect,
              ]}
            >
              <LinearGradient
                colors={
                  showCorrect
                    ? ['#22C55E', '#16A34A']
                    : showIncorrect
                    ? ['#EF4444', '#DC2626']
                    : ['#FFFFFF', '#F8F9FA']
                }
                style={styles.numberGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.numberText, (showCorrect || showIncorrect) && styles.numberTextWhite]}>
                  {number}
                </Text>
                {showCorrect && <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />}
                {showIncorrect && <Ionicons name="close-circle" size={24} color="#FFFFFF" />}
              </LinearGradient>
            </Pressable>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  headerRight: {
    width: 40,
  },
  instructions: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  instructionsText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  wordButton: {
    marginBottom: 12,
  },
  wordCard: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  wordGradient: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 20,
    minWidth: 150,
    alignItems: 'center',
  },
  wordText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  wordHint: {
    fontSize: 14,
    color: '#64748B',
  },
  breakdownContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 24,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dot: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
  numbersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  numberButton: {
    width: '18%',
    minWidth: 60,
    aspectRatio: 1,
  },
  numberButtonCorrect: {},
  numberButtonIncorrect: {},
  numberGradient: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  numberText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
  },
  numberTextWhite: {
    color: '#FFFFFF',
  },
});
