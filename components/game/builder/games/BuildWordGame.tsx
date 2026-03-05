// Game 2: Build the Word (Guided CVC)
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playLetterSound, playSoundEffect, speakWord, speakFeedback, stopAllAudio } from '../utils/audio';
import { BUILD_WORD_DATA, shuffleArray } from '../utils/gameData';

interface BuildWordGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;

// Letter Card Component (separate component to avoid hooks in map)
function LetterCard({ letter, isNextLetter, onPress }: { letter: string; isNextLetter: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderWidth: isNextLetter ? 4 : 0,
    borderColor: isNextLetter ? '#A5B4FC' : 'transparent',
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.9);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
    >
      <Animated.View style={[styles.letterCard, animatedStyle]}>
        <LinearGradient
          colors={isNextLetter ? ['#A5B4FC', '#818CF8'] : ['#C7D2FE', '#A5B4FC']}
          style={styles.letterGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.letterText}>{letter.toUpperCase()}</Text>
          {isNextLetter && (
            <View style={styles.highlightBadge}>
              <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export default function BuildWordGame({ onComplete, onBack }: BuildWordGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState<typeof BUILD_WORD_DATA[0] | null>(null);
  const [wordBoxes, setWordBoxes] = useState<(string | null)[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const soundTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadRound();
  }, [round]);

  useEffect(() => {
    if (soundTimeoutRef.current) {
      clearTimeout(soundTimeoutRef.current);
      soundTimeoutRef.current = null;
    }

    if (currentItem) {
      stopAllAudio();
      soundTimeoutRef.current = setTimeout(async () => {
        stopAllAudio();
        await new Promise(resolve => setTimeout(resolve, 200));
        await speakWord(currentItem.word).catch(() => {});
        soundTimeoutRef.current = null;
      }, 800);
    }

    return () => {
      if (soundTimeoutRef.current) {
        clearTimeout(soundTimeoutRef.current);
        soundTimeoutRef.current = null;
      }
      stopAllAudio();
    };
  }, [currentItem]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'build-word',
      });
      return;
    }

    const item = BUILD_WORD_DATA[round % BUILD_WORD_DATA.length];
    const shuffled = shuffleArray([...item.letters]);
    
    setCurrentItem(item);
    setWordBoxes([null, null, null]);
    setAvailableLetters(shuffled);
    setCurrentLetterIndex(0);
    setIsComplete(false);
  };

  const handleLetterTap = async (letter: string) => {
    if (!currentItem || isComplete) return;
    
    const expectedLetter = currentItem.letters[currentLetterIndex];
    const isCorrect = letter === expectedLetter;

    if (isCorrect) {
      const newBoxes = [...wordBoxes];
      newBoxes[currentLetterIndex] = letter;
      setWordBoxes(newBoxes);
      
      const newAvailable = availableLetters.filter((l) => l !== letter);
      setAvailableLetters(newAvailable);

      await playSoundEffect('success');
      await playLetterSound(letter);

      if (currentLetterIndex === currentItem.letters.length - 1) {
        // Word complete
        setIsComplete(true);
        setScore(score + 1);
        await speakFeedback('Great job!');
        await speakWord(currentItem.word);
        setTimeout(() => {
          setRound(round + 1);
        }, 2000);
      } else {
        setCurrentLetterIndex(currentLetterIndex + 1);
      }
    } else {
      await playSoundEffect('error');
      await speakFeedback('Try again!');
    }
  };

  if (!currentItem) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Build the Word</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}/{TOTAL_ROUNDS}</Text>
        </View>
      </View>

      {/* Picture */}
      <View style={styles.pictureContainer}>
        <Image source={{ uri: currentItem.image }} style={styles.picture} resizeMode="cover" />
      </View>

      {/* Word Boxes */}
      <View style={styles.wordBoxesContainer}>
        <Text style={styles.instructionText}>Drag letters to build the word</Text>
        <View style={styles.boxesRow}>
          {wordBoxes.map((letter, index) => {
            const isHighlighted = index === currentLetterIndex && !letter;
            const isFilled = letter !== null;

            return (
              <View
                key={index}
                style={[
                  styles.wordBox,
                  isHighlighted && styles.highlightedBox,
                  isFilled && styles.filledBox,
                ]}
              >
                {letter && (
                  <Text style={styles.boxLetter}>{letter.toUpperCase()}</Text>
                )}
                {isHighlighted && (
                  <View style={styles.highlightIndicator}>
                    <Ionicons name="arrow-down" size={20} color="#A5B4FC" />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Available Letters */}
      <View style={styles.lettersContainer}>
        {availableLetters.map((letter, index) => {
          const isNextLetter = letter === currentItem.letters[currentLetterIndex];

          return (
            <LetterCard
              key={`${letter}-${index}`}
              letter={letter}
              isNextLetter={isNextLetter}
              onPress={() => handleLetterTap(letter)}
            />
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
  pictureContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  picture: {
    width: 200,
    height: 200,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  wordBoxesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  instructionText: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 16,
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  wordBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  highlightedBox: {
    borderColor: '#A5B4FC',
    backgroundColor: '#F0F4FF',
  },
  filledBox: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  boxLetter: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1E293B',
  },
  highlightIndicator: {
    position: 'absolute',
    top: -30,
  },
  lettersContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  letterCard: {
    width: 80,
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#A5B4FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  letterGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  letterText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  highlightBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 2,
  },
});
