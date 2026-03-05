// Game 5: Reading + Counting Mix
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
import { playSoundEffect, speakWord, speakNumber, countWithVoice, speakFeedback, stopAllAudio } from '../utils/audio';
import { SIGHT_WORD_DATA, COUNTING_DATA, getCountingOptions, shuffleArray } from '../utils/gameData';

interface ReadingCountingMixGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 6; // 3 reading + 3 counting

type RoundType = 'reading' | 'counting';

export default function ReadingCountingMixGame({ onComplete, onBack }: ReadingCountingMixGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [roundType, setRoundType] = useState<RoundType>('reading');
  const [currentWordItem, setCurrentWordItem] = useState<typeof SIGHT_WORD_DATA[0] | null>(null);
  const [currentCountingItem, setCurrentCountingItem] = useState<typeof COUNTING_DATA[0] | null>(null);
  const [wordOptions, setWordOptions] = useState<string[]>([]);
  const [countingOptions, setCountingOptions] = useState<number[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);
  const [objects, setObjects] = useState<Array<{ id: number }>>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0);
  const soundTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadRound();
  }, [round]);

  useEffect(() => {
    if (roundType === 'counting' && currentCountingItem && !isAnimating) {
      animateObjects();
    } else if (roundType === 'reading' && currentWordItem) {
      if (soundTimeoutRef.current) {
        clearTimeout(soundTimeoutRef.current);
        soundTimeoutRef.current = null;
      }

      stopAllAudio();
      soundTimeoutRef.current = setTimeout(async () => {
        stopAllAudio();
        await new Promise(resolve => setTimeout(resolve, 150));
        await speakWord(currentWordItem.word).catch(() => {});
        soundTimeoutRef.current = null;
      }, 600);
    }
  }, [roundType, currentWordItem, currentCountingItem]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'reading-counting-mix',
      });
      return;
    }

    // Alternate between reading and counting
    const type: RoundType = round % 2 === 0 ? 'reading' : 'counting';
    setRoundType(type);

    if (type === 'reading') {
      const item = SIGHT_WORD_DATA[Math.floor(round / 2) % SIGHT_WORD_DATA.length];
      const shuffled = shuffleArray([...item.options]);
      setCurrentWordItem(item);
      setWordOptions(shuffled);
      setCurrentCountingItem(null);
      setCountingOptions([]);
    } else {
      const item = COUNTING_DATA[Math.floor(round / 2) % COUNTING_DATA.length];
      const opts = getCountingOptions(item.total);
      setCurrentCountingItem(item);
      setCountingOptions(opts);
      setCurrentWordItem(null);
      setWordOptions([]);
      setObjects([]);
    }

    setSelectedWord(null);
    setSelectedNumber(null);
    setIsCorrect(null);
    setCanSelect(true);
    setIsAnimating(false);
    cardScale.value = 1;
    cardGlow.value = 0;
  };

  const animateObjects = async () => {
    if (!currentCountingItem) return;
    
    setIsAnimating(true);
    setObjects([]);
    
    // Animate group 1
    for (let i = 0; i < currentCountingItem.group1; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setObjects(prev => [...prev, { id: prev.length }]);
      await countWithVoice(i + 1);
    }
    
    // Small pause
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Animate group 2
    for (let i = 0; i < currentCountingItem.group2; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setObjects(prev => [...prev, { id: prev.length }]);
      await countWithVoice(currentCountingItem.group1 + i + 1);
    }
    
    setIsAnimating(false);
    
    // Ask the question
    await new Promise(resolve => setTimeout(resolve, 500));
    await speakNumber(currentCountingItem.total);
    await speakFeedback('How many?');
  };

  const handleWordSelect = async (word: string) => {
    if (!canSelect || !currentWordItem) return;

    setCanSelect(false);
    setSelectedWord(word);
    const correct = word === currentWordItem.word;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      cardGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakWord(word);
    } else {
      cardScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 8 })
      );
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 2000);
  };

  const handleNumberSelect = async (number: number) => {
    if (!canSelect || !currentCountingItem || isAnimating) return;

    setCanSelect(false);
    setSelectedNumber(number);
    const correct = number === currentCountingItem.total;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      cardGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakNumber(number);
      await speakFeedback('Great counting!');
    } else {
      cardScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 8 })
      );
      await playSoundEffect('incorrect');
      await speakFeedback('Let\'s count again!');
      setTimeout(() => {
        animateObjects();
      }, 1000);
      setTimeout(() => {
        setCanSelect(true);
        setSelectedNumber(null);
        setIsCorrect(null);
      }, 3000);
      return;
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 2000);
  };

  const handleReplay = () => {
    if (roundType === 'reading' && currentWordItem) {
      speakWord(currentWordItem.word);
    } else if (roundType === 'counting' && currentCountingItem && !isAnimating) {
      animateObjects();
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    shadowOpacity: cardGlow.value * 0.5,
  }));

  const getRoundTitle = () => {
    if (roundType === 'reading') return 'Round ' + (round + 1) + ': Reading';
    return 'Round ' + (round + 1) + ': Counting';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{getRoundTitle()}</Text>
          <Text style={styles.headerSubtitle}>Score: {score}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Reading Round */}
      {roundType === 'reading' && currentWordItem && (
        <>
          <View style={styles.instructions}>
            <Text style={styles.instructionsText}>Listen and tap the word you hear</Text>
          </View>

          <View style={styles.targetContainer}>
            <Pressable onPress={handleReplay} style={styles.replayButton}>
              <LinearGradient
                colors={['#C4B5FD', '#A78BFA']}
                style={styles.replayGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="volume-high" size={32} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>
            <Text style={styles.tapHint}>Tap to hear the word</Text>
          </View>

          <View style={styles.optionsContainer}>
            {wordOptions.map((word, index) => {
              const isSelected = selectedWord === word;
              const showCorrect = isSelected && isCorrect === true;
              const showIncorrect = isSelected && isCorrect === false;

              return (
                <Pressable
                  key={index}
                  onPress={() => handleWordSelect(word)}
                  disabled={!canSelect}
                  style={styles.optionWrapper}
                >
                  <Animated.View
                    style={[
                      styles.wordButton,
                      cardAnimatedStyle,
                      showCorrect && styles.wordButtonCorrect,
                      showIncorrect && styles.wordButtonIncorrect,
                    ]}
                  >
                    <LinearGradient
                      colors={showCorrect ? ['#86EFAC', '#4ADE80'] : showIncorrect ? ['#FBCFE8', '#F9A8D4'] : ['#C4B5FD', '#A78BFA']}
                      style={styles.wordGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.wordText}>{word.toUpperCase()}</Text>
                      {showCorrect && (
                        <View style={styles.feedbackIcon}>
                          <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
                        </View>
                      )}
                      {showIncorrect && (
                        <View style={styles.feedbackIcon}>
                          <Ionicons name="close-circle" size={32} color="#FFFFFF" />
                        </View>
                      )}
                    </LinearGradient>
                  </Animated.View>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {/* Counting Round */}
      {roundType === 'counting' && currentCountingItem && (
        <>
          <View style={styles.instructions}>
            <Text style={styles.instructionsText}>Count the objects and find the total</Text>
          </View>

          <View style={styles.objectsContainer}>
            <Pressable onPress={handleReplay} disabled={isAnimating} style={styles.replayButton}>
              <LinearGradient
                colors={['#C4B5FD', '#A78BFA']}
                style={styles.replayGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="refresh" size={24} color="#FFFFFF" />
                <Text style={styles.replayText}>Count Again</Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.objectsGrid}>
              {objects.map((obj) => (
                <View key={obj.id} style={styles.objectWrapper}>
                  <Text style={{ fontSize: 50 }}>
                    {currentCountingItem.objectType === 'apple' ? '🍎' :
                     currentCountingItem.objectType === 'ball' ? '⚽' :
                     currentCountingItem.objectType === 'star' ? '⭐' :
                     currentCountingItem.objectType === 'heart' ? '❤️' : '⭕'}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>How many?</Text>
          </View>

          <View style={styles.optionsContainer}>
            {countingOptions.map((option, index) => {
              const isSelected = selectedNumber === option;
              const showCorrect = isSelected && isCorrect === true;
              const showIncorrect = isSelected && isCorrect === false;

              return (
                <Pressable
                  key={index}
                  onPress={() => handleNumberSelect(option)}
                  disabled={!canSelect || isAnimating}
                  style={styles.optionWrapper}
                >
                  <Animated.View
                    style={[
                      styles.answerButton,
                      cardAnimatedStyle,
                      showCorrect && styles.answerButtonCorrect,
                      showIncorrect && styles.answerButtonIncorrect,
                    ]}
                  >
                    <LinearGradient
                      colors={showCorrect ? ['#86EFAC', '#4ADE80'] : showIncorrect ? ['#FBCFE8', '#F9A8D4'] : ['#C4B5FD', '#A78BFA']}
                      style={styles.answerGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.answerText}>{option}</Text>
                      {showCorrect && (
                        <View style={styles.feedbackIcon}>
                          <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
                        </View>
                      )}
                      {showIncorrect && (
                        <View style={styles.feedbackIcon}>
                          <Ionicons name="close-circle" size={32} color="#FFFFFF" />
                        </View>
                      )}
                    </LinearGradient>
                  </Animated.View>
                </Pressable>
              );
            })}
          </View>
        </>
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
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C4B5FD',
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
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  targetContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  replayButton: {
    marginBottom: 12,
  },
  replayGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C4B5FD',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  replayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tapHint: {
    fontSize: 14,
    color: '#64748B',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  optionWrapper: {
    marginBottom: 16,
  },
  wordButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#C4B5FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  wordButtonCorrect: {
    borderWidth: 4,
    borderColor: '#86EFAC',
  },
  wordButtonIncorrect: {
    borderWidth: 4,
    borderColor: '#FBCFE8',
  },
  wordGradient: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    position: 'relative',
  },
  wordText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  objectsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    minHeight: 200,
  },
  objectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  objectWrapper: {
    marginBottom: 8,
  },
  questionContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  answerButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#C4B5FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  answerButtonCorrect: {
    borderWidth: 4,
    borderColor: '#86EFAC',
  },
  answerButtonIncorrect: {
    borderWidth: 4,
    borderColor: '#FBCFE8',
  },
  answerGradient: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    position: 'relative',
  },
  answerText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  feedbackIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
