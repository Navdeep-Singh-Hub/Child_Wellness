// Game 3: Take Away (Visual Subtraction)
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
  FadeOut,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakNumber, countWithVoice, speakFeedback, stopAllAudio } from '../utils/audio';
import { SUBTRACTION_DATA, getSubtractionOptions } from '../utils/gameData';

interface TakeAwayGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;

// Object component
function ObjectIcon({ type, size = 50 }: { type: string; size?: number }) {
  const getIcon = () => {
    switch (type) {
      case 'apple':
        return '🍎';
      case 'ball':
        return '⚽';
      case 'star':
        return '⭐';
      case 'heart':
        return '❤️';
      case 'circle':
        return '⭕';
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

export default function TakeAwayGame({ onComplete, onBack }: TakeAwayGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState<typeof SUBTRACTION_DATA[0] | null>(null);
  const [options, setOptions] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);
  const [objects, setObjects] = useState<Array<{ id: number }>>([]);
  const [removedObjects, setRemovedObjects] = useState<Set<number>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);

  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0);
  const soundTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadRound();
  }, [round]);

  useEffect(() => {
    if (currentItem && !isAnimating) {
      initializeObjects();
    }
  }, [currentItem]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'take-away',
      });
      return;
    }

    const item = SUBTRACTION_DATA[round % SUBTRACTION_DATA.length];
    const opts = getSubtractionOptions(item.answer);
    
    setCurrentItem(item);
    setOptions(opts);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCanSelect(true);
    setObjects([]);
    setRemovedObjects(new Set());
    setIsAnimating(false);
    cardScale.value = 1;
    cardGlow.value = 0;
  };

  const initializeObjects = () => {
    if (!currentItem) return;
    const objs = Array.from({ length: currentItem.total }, (_, i) => ({ id: i }));
    setObjects(objs);
  };

  const handleTakeAway = async () => {
    if (!currentItem || isAnimating || removedObjects.size >= currentItem.remove) return;

    setIsAnimating(true);
    setCanSelect(false);

    // Animate removal
    for (let i = 0; i < currentItem.remove; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const objToRemove = objects.find(obj => !removedObjects.has(obj.id));
      if (objToRemove) {
        setRemovedObjects(prev => new Set([...prev, objToRemove.id]));
        await speakInstruction('Take away').catch(() => {});
      }
    }

    // Count remaining
    await new Promise(resolve => setTimeout(resolve, 500));
    const remaining = currentItem.total - currentItem.remove;
    for (let i = 1; i <= remaining; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      await countWithVoice(i);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    await speakNumber(remaining);
    await speakInstruction('How many are left?');
    
    setIsAnimating(false);
    setCanSelect(true);
  };

  const handleAnswerSelect = async (answer: number) => {
    if (!canSelect || !currentItem || removedObjects.size < currentItem.remove) return;

    setCanSelect(false);
    setSelectedAnswer(answer);
    const correct = answer === currentItem.answer;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      cardGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakNumber(answer);
      await speakFeedback('Perfect subtraction!');
    } else {
      cardScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 8 })
      );
      await playSoundEffect('incorrect');
      await speakFeedback('Let\'s count again!');
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
    if (currentItem && !isAnimating) {
      handleTakeAway();
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

  if (!currentItem) return null;

  const remainingCount = currentItem.total - removedObjects.size;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#EFF6FF', '#F0F9FF']} style={StyleSheet.absoluteFill} />

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
        <Text style={styles.instructionsText}>Take away objects and find how many are left</Text>
      </View>

      {/* Take Away Button */}
      {removedObjects.size < currentItem.remove && (
        <View style={styles.actionContainer}>
          <Pressable
            onPress={handleTakeAway}
            disabled={isAnimating}
            style={styles.takeAwayButton}
          >
            <LinearGradient
              colors={['#BFDBFE', '#93C5FD']}
              style={styles.takeAwayGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="remove-circle" size={24} color="#FFFFFF" />
              <Text style={styles.takeAwayText}>
                Take Away {currentItem.remove} {currentItem.objectType}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}

      {/* Objects Display */}
      <View style={styles.objectsContainer}>
        <View style={styles.objectsGrid}>
          {objects.map((obj) => {
            const isRemoved = removedObjects.has(obj.id);
            return (
              <Animated.View
                key={obj.id}
                style={[
                  styles.objectWrapper,
                  isRemoved && { opacity: 0 },
                ]}
                exiting={FadeOut.duration(300)}
              >
                {!isRemoved && <ObjectIcon type={currentItem.objectType} size={60} />}
              </Animated.View>
            );
          })}
        </View>
        {removedObjects.size >= currentItem.remove && (
          <Text style={styles.remainingText}>
            {remainingCount} {remainingCount === 1 ? 'left' : 'left'}
          </Text>
        )}
      </View>

      {/* Question */}
      {removedObjects.size >= currentItem.remove && (
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>How many are left?</Text>
        </View>
      )}

      {/* Answer Options */}
      {removedObjects.size >= currentItem.remove && (
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
                    colors={showCorrect ? ['#A7F3D0', '#6EE7B7'] : showIncorrect ? ['#FBCFE8', '#F9A8D4'] : ['#BFDBFE', '#93C5FD']}
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
    shadowColor: '#BFDBFE',
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
  actionContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  takeAwayButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  takeAwayGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  takeAwayText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
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
  objectIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  remainingText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
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
    shadowColor: '#BFDBFE',
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
