// Game 3: Odd One Out (Sorting Logic)
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
import { playSoundEffect, speakWord, speakFeedback, stopAllAudio } from '../utils/audio';
import { ODD_ONE_OUT_DATA, shuffleArray } from '../utils/gameData';

interface OddOneOutGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;

export default function OddOneOutGame({ onComplete, onBack }: OddOneOutGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState<typeof ODD_ONE_OUT_DATA[0] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);

  const cardScale = useSharedValue(1);
  const explanationOpacity = useSharedValue(0);

  useEffect(() => {
    loadRound();
  }, [round]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'odd-one-out',
      });
      return;
    }

    const item = ODD_ONE_OUT_DATA[round % ODD_ONE_OUT_DATA.length];
    const shuffled = shuffleArray([...item.words]);
    
    setCurrentItem(item);
    setOptions(shuffled);
    setSelectedWord(null);
    setIsCorrect(null);
    setCanSelect(true);
    setShowExplanation(false);
    cardScale.value = 1;
    explanationOpacity.value = 0;
  };

  const handleWordSelect = async (word: string) => {
    if (!canSelect || !currentItem) return;

    setCanSelect(false);
    setSelectedWord(word);
    const correct = word === currentItem.oddWord;

    if (correct) {
      setIsCorrect(true);
      setScore(score + 1);
      await playSoundEffect('success');
      await speakFeedback('Great job!');
      
      // Show explanation
      setShowExplanation(true);
      explanationOpacity.value = withTiming(1, { duration: 500 });
      
      setTimeout(() => {
        setRound(round + 1);
      }, 3000);
    } else {
      setIsCorrect(false);
      await playSoundEffect('error');
      await speakFeedback('Try again!');
      setTimeout(() => {
        setSelectedWord(null);
        setIsCorrect(null);
        setCanSelect(true);
      }, 1500);
    }
  };

  const handleWordTap = async (word: string) => {
    await speakWord(word);
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const explanationAnimatedStyle = useAnimatedStyle(() => ({
    opacity: explanationOpacity.value,
  }));

  if (!currentItem) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Odd One Out</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}/{TOTAL_ROUNDS}</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Find the word that does NOT belong to the group
        </Text>
      </View>

      {/* Word Cards */}
      <View style={styles.wordsContainer}>
        {options.map((word, index) => {
          const isSelected = selectedWord === word;
          const showFeedback = isSelected && isCorrect !== null;
          const isOddWord = word === currentItem.oddWord;

          return (
            <Pressable
              key={index}
              onPress={() => handleWordSelect(word)}
              onLongPress={() => handleWordTap(word)}
              disabled={!canSelect}
              style={styles.wordWrapper}
            >
              <Animated.View
                style={[
                  styles.wordCard,
                  cardAnimatedStyle,
                  showFeedback && isOddWord && styles.correctCard,
                  showFeedback && !isOddWord && styles.incorrectCard,
                ]}
              >
                <LinearGradient
                  colors={showFeedback && isOddWord ? ['#22C55E', '#16A34A'] : showFeedback && !isOddWord ? ['#EF4444', '#DC2626'] : ['#A5B4FC', '#818CF8']}
                  style={styles.wordGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.wordText}>{word.toUpperCase()}</Text>
                  {showFeedback && (
                    <View style={styles.feedbackIcon}>
                      <Ionicons
                        name={isOddWord ? 'checkmark-circle' : 'close-circle'}
                        size={32}
                        color="#FFFFFF"
                      />
                    </View>
                  )}
                </LinearGradient>
              </Animated.View>
              <Text style={styles.tapHint}>Tap to select • Long press to hear</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Explanation */}
      {showExplanation && currentItem && (
        <Animated.View style={[styles.explanationContainer, explanationAnimatedStyle]}>
          <View style={styles.explanationCard}>
            <Ionicons name="bulb" size={24} color="#F59E0B" />
            <Text style={styles.explanationText}>
              "{currentItem.oddWord.toUpperCase()}" does not rhyme with the other words!
            </Text>
          </View>
        </Animated.View>
      )}
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
    paddingTop: 16,
    paddingBottom: 12,
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  scoreContainer: {
    backgroundColor: '#A5B4FC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  wordsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  wordWrapper: {
    width: '45%',
    alignItems: 'center',
  },
  wordCard: {
    width: '100%',
    aspectRatio: 1.2,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#A5B4FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 8,
  },
  wordGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  wordText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  feedbackIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  tapHint: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  correctCard: {
    borderWidth: 4,
    borderColor: '#22C55E',
  },
  incorrectCard: {
    borderWidth: 4,
    borderColor: '#EF4444',
  },
  explanationContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  explanationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  explanationText: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
});
