// Game 1: Word Family Sort (-at, -in, -un)
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
import { WORD_FAMILIES, WordFamily, shuffleArray, getWordFamily } from '../utils/gameData';

interface WordFamilySortGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 6;

export default function WordFamilySortGame({ onComplete, onBack }: WordFamilySortGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<WordFamily | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());

  const wordScale = useSharedValue(1);
  const basketGlow = useSharedValue(0);

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
        gameId: 'word-family-sort',
      });
      return;
    }

    // Get all words and filter out used ones
    const allWords = WORD_FAMILIES.flatMap(f => f.words);
    const availableWords = allWords.filter(w => !usedWords.has(w));
    
    if (availableWords.length === 0) {
      // Reset if all words used
      setUsedWords(new Set());
      const shuffled = shuffleArray(allWords);
      setCurrentWord(shuffled[0]);
      setUsedWords(new Set([shuffled[0]]));
    } else {
      const shuffled = shuffleArray(availableWords);
      setCurrentWord(shuffled[0]);
      setUsedWords(prev => new Set([...prev, shuffled[0]]));
    }

    setSelectedFamily(null);
    setIsCorrect(null);
    setCanSelect(true);
    wordScale.value = 1;
    basketGlow.value = 0;
  };

  const handleFamilySelect = async (family: WordFamily) => {
    if (!canSelect || !currentWord) return;

    setCanSelect(false);
    setSelectedFamily(family);
    const correct = getWordFamily(currentWord) === family;

    if (correct) {
      setIsCorrect(true);
      setScore(score + 1);
      await playSoundEffect('success');
      await speakWord(currentWord);
      basketGlow.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 500 })
      );
      setTimeout(() => {
        setRound(round + 1);
      }, 2000);
    } else {
      setIsCorrect(false);
      await playSoundEffect('error');
      await speakFeedback('Try again!');
      setTimeout(() => {
        setSelectedFamily(null);
        setIsCorrect(null);
        setCanSelect(true);
      }, 1500);
    }
  };

  const handleWordTap = async () => {
    if (!currentWord) return;
    await speakWord(currentWord);
  };

  const wordAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: wordScale.value }],
  }));

  // Create animated styles for each family - must be called unconditionally
  const atBasketStyle = useAnimatedStyle(() => {
    const isSelected = selectedFamily === '-at';
    const showGlow = isSelected && isCorrect === true;
    return {
      transform: [{ scale: showGlow ? 1.05 : 1 }],
      opacity: basketGlow.value * 0.3 + (showGlow ? 1 : 0.9),
    };
  });

  const inBasketStyle = useAnimatedStyle(() => {
    const isSelected = selectedFamily === '-in';
    const showGlow = isSelected && isCorrect === true;
    return {
      transform: [{ scale: showGlow ? 1.05 : 1 }],
      opacity: basketGlow.value * 0.3 + (showGlow ? 1 : 0.9),
    };
  });

  const unBasketStyle = useAnimatedStyle(() => {
    const isSelected = selectedFamily === '-un';
    const showGlow = isSelected && isCorrect === true;
    return {
      transform: [{ scale: showGlow ? 1.05 : 1 }],
      opacity: basketGlow.value * 0.3 + (showGlow ? 1 : 0.9),
    };
  });

  // Map family to its animated style
  const getBasketStyle = (family: WordFamily) => {
    switch (family) {
      case '-at':
        return atBasketStyle;
      case '-in':
        return inBasketStyle;
      case '-un':
        return unBasketStyle;
    }
  };

  if (!currentWord) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Word Family Sort</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}/{TOTAL_ROUNDS}</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Tap the word to hear it, then choose the correct word family basket
        </Text>
      </View>

      {/* Current Word */}
      <View style={styles.wordContainer}>
        <Pressable onPress={handleWordTap} style={styles.wordCardWrapper}>
          <Animated.View style={[styles.wordCard, wordAnimatedStyle]}>
            <LinearGradient
              colors={['#A5B4FC', '#818CF8']}
              style={styles.wordGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.wordText}>{currentWord.toUpperCase()}</Text>
              <View style={styles.soundIcon}>
                <Ionicons name="volume-high" size={20} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </Animated.View>
        </Pressable>
        <Text style={styles.tapHint}>Tap to hear the word</Text>
      </View>

      {/* Word Family Baskets */}
      <View style={styles.basketsContainer}>
        {WORD_FAMILIES.map((familyData) => {
          const isSelected = selectedFamily === familyData.family;
          const showFeedback = isSelected && isCorrect !== null;
          const isCorrectFamily = isSelected && isCorrect === true;

          return (
            <Pressable
              key={familyData.family}
              onPress={() => handleFamilySelect(familyData.family)}
              disabled={!canSelect}
              style={styles.basketWrapper}
            >
              <Animated.View
                style={[
                  styles.basket,
                  { borderColor: familyData.color },
                  getBasketStyle(familyData.family),
                  showFeedback && isCorrectFamily && styles.correctBasket,
                  showFeedback && !isCorrectFamily && styles.incorrectBasket,
                ]}
              >
                <View style={[styles.basketLabel, { backgroundColor: `${familyData.color}20` }]}>
                  <Text style={[styles.familyText, { color: familyData.color }]}>
                    {familyData.family}
                  </Text>
                </View>
                {showFeedback && (
                  <View style={styles.feedbackIcon}>
                    <Ionicons
                      name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                      size={32}
                      color={isCorrect ? '#22C55E' : '#EF4444'}
                    />
                  </View>
                )}
              </Animated.View>
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
  wordContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  wordCardWrapper: {
    marginBottom: 12,
  },
  wordCard: {
    width: 200,
    height: 120,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#A5B4FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  wordGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  wordText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  soundIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 4,
  },
  tapHint: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  basketsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'flex-end',
  },
  basketWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  basket: {
    aspectRatio: 0.8,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  correctBasket: {
    borderWidth: 4,
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  incorrectBasket: {
    borderWidth: 4,
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  basketLabel: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  familyText: {
    fontSize: 28,
    fontWeight: '800',
  },
  feedbackIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});
