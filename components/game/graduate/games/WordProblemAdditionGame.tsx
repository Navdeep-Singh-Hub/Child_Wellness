// Game 3: Visual Word Problem (Addition)
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
import { playSoundEffect, speakWordProblem, speakNumber, speakFeedback, stopAllAudio } from '../utils/audio';
import { ADDITION_WORD_PROBLEMS, getWordProblemOptions } from '../utils/gameData';

interface WordProblemAdditionGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 4;

// Object component
function ObjectIcon({ type, size = 50 }: { type: string; size?: number }) {
  const getIcon = () => {
    switch (type) {
      case 'apple':
        return '🍎';
      case 'ball':
        return '⚽';
      case 'bird':
        return '🐦';
      case 'book':
        return '📚';
      case 'star':
        return '⭐';
      default:
        return '🔵';
    }
  };

  return (
    <View style={[styles.objectIcon, { width: size, height: size }]}>
      <Text style={{ fontSize: size * 0.8 }}>{getIcon()}</Text>
    </View>
  );
}

export default function WordProblemAdditionGame({ onComplete, onBack }: WordProblemAdditionGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<typeof ADDITION_WORD_PROBLEMS[0] | null>(null);
  const [options, setOptions] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);
  const [showObjects, setShowObjects] = useState(false);

  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const soundTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadRound();
  }, [round]);

  useEffect(() => {
    if (soundTimeoutRef.current) {
      clearTimeout(soundTimeoutRef.current);
      soundTimeoutRef.current = null;
    }

    if (currentProblem) {
      stopAllAudio();
      soundTimeoutRef.current = setTimeout(async () => {
        stopAllAudio();
        await new Promise(resolve => setTimeout(resolve, 150));
        await speakWordProblem(currentProblem.problem).catch(() => {});
        setShowObjects(true);
        soundTimeoutRef.current = null;
      }, 600);
    }

    return () => {
      if (soundTimeoutRef.current) {
        clearTimeout(soundTimeoutRef.current);
        soundTimeoutRef.current = null;
      }
      stopAllAudio();
    };
  }, [currentProblem]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'word-problem-addition',
      });
      return;
    }

    const problem = ADDITION_WORD_PROBLEMS[round % ADDITION_WORD_PROBLEMS.length];
    const opts = getWordProblemOptions(problem.answer, 10);
    
    setCurrentProblem(problem);
    setOptions(opts);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCanSelect(true);
    setShowObjects(false);
    cardScale.value = 1;
    cardGlow.value = 0;
    shakeX.value = 0;
  };

  const handleAnswerSelect = async (answer: number) => {
    if (!canSelect || !currentProblem) return;

    setCanSelect(false);
    setSelectedAnswer(answer);
    const correct = answer === currentProblem.answer;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      cardGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakNumber(answer);
      await speakFeedback('Perfect!');
    } else {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
      setTimeout(() => {
        setCanSelect(true);
        setSelectedAnswer(null);
        setIsCorrect(null);
      }, 2000);
      return;
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 2000);
  };

  const handleReplay = () => {
    if (currentProblem) {
      speakWordProblem(currentProblem.problem);
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cardScale.value },
      { translateX: shakeX.value },
    ],
    shadowOpacity: cardGlow.value * 0.5,
  }));

  if (!currentProblem) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3C7', '#FEF9E7']} style={StyleSheet.absoluteFill} />

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
        <Text style={styles.instructionsText}>Read the problem and solve it</Text>
      </View>

      {/* Word Problem Display */}
      <View style={styles.problemContainer}>
        <View style={styles.problemBox}>
          <Text style={styles.problemText}>{currentProblem.problem}</Text>
        </View>
      </View>

      {/* Visual Objects */}
      {showObjects && (
        <View style={styles.objectsContainer}>
          <View style={styles.objectsRow}>
            <Text style={styles.objectsLabel}>{currentProblem.start}</Text>
            {Array.from({ length: currentProblem.start }).map((_, i) => (
              <ObjectIcon key={`start-${i}`} type={currentProblem.objectType} size={40} />
            ))}
          </View>
          <View style={styles.plusSign}>
            <Text style={styles.plusText}>+</Text>
          </View>
          <View style={styles.objectsRow}>
            <Text style={styles.objectsLabel}>{currentProblem.add}</Text>
            {Array.from({ length: currentProblem.add }).map((_, i) => (
              <ObjectIcon key={`add-${i}`} type={currentProblem.objectType} size={40} />
            ))}
          </View>
        </View>
      )}

      {/* Replay Button */}
      <View style={styles.replayContainer}>
        <Pressable onPress={handleReplay} style={styles.replayButton}>
          <LinearGradient
            colors={['#FDE68A', '#FCD34D']}
            style={styles.replayGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="volume-high" size={24} color="#FFFFFF" />
            <Text style={styles.replayText}>Replay</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Answer Options */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const showCorrect = isSelected && isCorrect === true;
          const showIncorrect = isSelected && isCorrect === false;

          return (
            <Pressable
              key={index}
              onPress={() => handleAnswerSelect(option)}
              disabled={!canSelect}
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
                  colors={showCorrect ? ['#A7F3D0', '#6EE7B7'] : showIncorrect ? ['#FBCFE8', '#F9A8D4'] : ['#FDE68A', '#FCD34D']}
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
    shadowColor: '#FDE68A',
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
  problemContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  problemBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    minWidth: '90%',
  },
  problemText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 28,
  },
  objectsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  objectsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  objectsLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 8,
  },
  objectIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusSign: {
    marginVertical: 8,
  },
  plusText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
  },
  replayContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  replayButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  replayGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  replayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  optionsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 40,
  },
  optionWrapper: {
    flex: 1,
  },
  answerButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  answerButtonCorrect: {
    borderWidth: 4,
    borderColor: '#A7F3D0',
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
