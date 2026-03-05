// Game 5: Speed Sort Mini Challenge
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
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakWord, speakFeedback, stopAllAudio } from '../utils/audio';
import { WORD_FAMILIES, WordFamily, getAllWords, getWordFamily, shuffleArray } from '../utils/gameData';

interface SpeedSortGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_WORDS = 8;
const WORD_FALL_DURATION = 4000; // 4 seconds - slow and gentle

export default function SpeedSortGame({ onComplete, onBack }: SpeedSortGameProps) {
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [wordPosition, setWordPosition] = useState({ y: 0, x: 50 });
  const [gameWords, setGameWords] = useState<string[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [streak, setStreak] = useState(0);

  const wordY = useSharedValue(-100);
  const wordX = useSharedValue(50);
  const wordScale = useSharedValue(1);

  useEffect(() => {
    startGame();
  }, []);

  const startGame = () => {
    const allWords = getAllWords();
    const shuffled = shuffleArray(allWords).slice(0, TOTAL_WORDS);
    setGameWords(shuffled);
    setWordIndex(0);
    setScore(0);
    setTotalAttempts(0);
    setStreak(0);
    setGameActive(true);
    loadNextWord(0);
  };

  const loadNextWord = (currentIndex: number) => {
    if (currentIndex >= gameWords.length) {
      // Game complete
      setGameActive(false);
      const accuracy = totalAttempts > 0 ? (score / totalAttempts) * 100 : 0;
      onComplete({
        correct: score,
        total: totalAttempts,
        accuracy,
        gameId: 'speed-sort',
      });
      return;
    }

    const word = gameWords[currentIndex];
    setCurrentWord(word);
    
    // Reset word position to top
    wordY.value = -100;
    wordX.value = Math.random() * 60 + 20; // Random horizontal position
    wordScale.value = 1;

    // Animate word falling
    wordY.value = withTiming(85, { duration: WORD_FALL_DURATION }, (finished) => {
      if (finished) {
        // Word reached bottom without being sorted - mark as missed
        runOnJS(handleWordMissed)(currentIndex);
      }
    });

    // Play word sound
    setTimeout(() => {
      speakWord(word).catch(() => {});
    }, 500);
  };

  const handleWordMissed = (currentIndex: number) => {
    setTotalAttempts(prev => prev + 1);
    playSoundEffect('error');
    setStreak(0);
    
    // Move to next word
    const nextIndex = currentIndex + 1;
    setWordIndex(nextIndex);
    setTimeout(() => {
      if (nextIndex < gameWords.length) {
        loadNextWord(nextIndex);
      } else {
        setGameActive(false);
        const accuracy = totalAttempts + 1 > 0 ? (score / (totalAttempts + 1)) * 100 : 0;
        onComplete({
          correct: score,
          total: totalAttempts + 1,
          accuracy,
          gameId: 'speed-sort',
        });
      }
    }, 1000);
  };

  const handleFamilySelect = async (family: WordFamily) => {
    if (!currentWord || !gameActive) return;

    const correct = getWordFamily(currentWord) === family;
    const newTotalAttempts = totalAttempts + 1;
    setTotalAttempts(newTotalAttempts);

    // Stop word animation
    wordY.value = withTiming(wordY.value, { duration: 0 });

    if (correct) {
      const newScore = score + 1;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      await playSoundEffect('success');
      wordScale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withTiming(0, { duration: 300 })
      );
      
      const nextIndex = wordIndex + 1;
      setTimeout(() => {
        setWordIndex(nextIndex);
        if (nextIndex < gameWords.length) {
          loadNextWord(nextIndex);
        } else {
          setGameActive(false);
          const accuracy = newTotalAttempts > 0 ? (newScore / newTotalAttempts) * 100 : 0;
          onComplete({
            correct: newScore,
            total: newTotalAttempts,
            accuracy,
            gameId: 'speed-sort',
          });
        }
      }, 800);
    } else {
      await playSoundEffect('error');
      setStreak(0);
      wordScale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withSpring(1, { damping: 10 })
      );
      // Word continues falling
    }
  };

  const wordAnimatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: `${wordY.value}%`,
    left: `${wordX.value}%`,
    transform: [{ scale: wordScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Speed Sort</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBadge}>
            <Text style={styles.statText}>✓ {score}</Text>
          </View>
          {streak > 0 && (
            <View style={[styles.statBadge, styles.streakBadge]}>
              <Text style={styles.statText}>🔥 {streak}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Catch the falling word and sort it into the correct family!
        </Text>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {/* Falling Word */}
        {currentWord && gameActive && (
          <Animated.View style={[styles.fallingWord, wordAnimatedStyle]}>
            <LinearGradient
              colors={['#A5B4FC', '#818CF8']}
              style={styles.fallingWordGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.fallingWordText}>{currentWord.toUpperCase()}</Text>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Family Boxes at Bottom */}
        <View style={styles.familiesContainer}>
          {WORD_FAMILIES.map((familyData) => (
            <Pressable
              key={familyData.family}
              onPress={() => handleFamilySelect(familyData.family)}
              disabled={!gameActive}
              style={styles.familyBox}
            >
              <View style={[styles.familyBoxInner, { borderColor: familyData.color }]}>
                <View style={[styles.familyLabel, { backgroundColor: `${familyData.color}20` }]}>
                  <Text style={[styles.familyText, { color: familyData.color }]}>
                    {familyData.family}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
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
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    backgroundColor: '#A5B4FC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  streakBadge: {
    backgroundColor: '#F59E0B',
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 14,
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
  gameArea: {
    flex: 1,
    position: 'relative',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  fallingWord: {
    width: 120,
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#A5B4FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fallingWordGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallingWordText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  familiesContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  familyBox: {
    flex: 1,
  },
  familyBoxInner: {
    aspectRatio: 0.9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  familyLabel: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  familyText: {
    fontSize: 24,
    fontWeight: '800',
  },
});
