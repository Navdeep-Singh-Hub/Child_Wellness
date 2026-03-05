// Game 4: Subtraction Builder
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
import { playSoundEffect, speakNumber, countWithVoice, speakFeedback, stopAllAudio } from '../utils/audio';
import { SUBTRACTION_DATA, getSubtractionOptions } from '../utils/gameData';

interface SubtractionBuilderGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;

// Object component
function ObjectIcon({ type, size = 40 }: { type: string; size?: number }) {
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

export default function SubtractionBuilderGame({ onComplete, onBack }: SubtractionBuilderGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState<typeof SUBTRACTION_DATA[0] | null>(null);
  const [options, setOptions] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);
  const [objects, setObjects] = useState<Array<{ id: number }>>([]);
  const [removedObjects, setRemovedObjects] = useState<Set<number>>(new Set());
  const [isCounting, setIsCounting] = useState(false);

  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0);
  const soundTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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
        gameId: 'subtraction-builder',
      });
      return;
    }

    const item = SUBTRACTION_DATA[round % SUBTRACTION_DATA.length];
    const opts = getSubtractionOptions(item.answer);
    const objs = Array.from({ length: item.total }, (_, i) => ({ id: i }));
    
    setCurrentItem(item);
    setOptions(opts);
    setObjects(objs);
    setRemovedObjects(new Set());
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCanSelect(true);
    setIsCounting(false);
    cardScale.value = 1;
    cardGlow.value = 0;
  };

  const handleObjectTap = async (objId: number) => {
    if (!canSelect || !currentItem || removedObjects.size >= currentItem.remove) return;

    setRemovedObjects(prev => new Set([...prev, objId]));
    await playSoundEffect('click');
  };

  const handleCountTogether = async () => {
    if (isCounting || removedObjects.size < currentItem.remove || !currentItem) return;

    setIsCounting(true);
    setCanSelect(false);

    // Count remaining objects
    const remaining = currentItem.total - removedObjects.size;
    for (let i = 1; i <= remaining; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await countWithVoice(i);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    await speakNumber(remaining);
    await speakFeedback('What is the answer?');
    
    setIsCounting(false);
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
  const canCount = removedObjects.size === currentItem.remove;

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
        <Text style={styles.instructionsText}>Tap objects to remove them, then count together</Text>
      </View>

      {/* Equation Display */}
      <View style={styles.equationContainer}>
        <Text style={styles.equationText}>
          {currentItem.total} - {currentItem.remove} = ?
        </Text>
      </View>

      {/* Objects Display */}
      <View style={styles.objectsContainer}>
        <Text style={styles.objectsLabel}>
          Tap {currentItem.remove} to remove ({removedObjects.size}/{currentItem.remove})
        </Text>
        <View style={styles.objectsGrid}>
          {objects.map((obj) => {
            const isRemoved = removedObjects.has(obj.id);
            return (
              <Pressable
                key={obj.id}
                onPress={() => handleObjectTap(obj.id)}
                disabled={isRemoved || !canSelect}
                style={styles.objectButton}
              >
                <Animated.View
                  style={[
                    styles.objectWrapper,
                    isRemoved && { opacity: 0 },
                  ]}
                  exiting={FadeOut.duration(300)}
                >
                  {!isRemoved && <ObjectIcon type={currentItem.objectType} size={50} />}
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
        {canCount && (
          <Pressable
            onPress={handleCountTogether}
            disabled={isCounting || !canSelect}
            style={styles.countButton}
          >
            <LinearGradient
              colors={['#BFDBFE', '#93C5FD']}
              style={styles.countGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="calculator" size={20} color="#FFFFFF" />
              <Text style={styles.countButtonText}>Count Together</Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>

      {/* Answer Options */}
      {canCount && !isCounting && (
        <View style={styles.optionsContainer}>
          <Text style={styles.optionsLabel}>Select the answer:</Text>
          <View style={styles.optionsRow}>
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
                          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                        </View>
                      )}
                      {showIncorrect && (
                        <View style={styles.feedbackIcon}>
                          <Ionicons name="close-circle" size={24} color="#FFFFFF" />
                        </View>
                      )}
                    </LinearGradient>
                  </Animated.View>
                </Pressable>
              );
            })}
          </View>
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
  equationContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  equationText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
  },
  objectsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  objectsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  objectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  objectButton: {
    marginBottom: 4,
  },
  objectWrapper: {
    marginBottom: 4,
  },
  objectIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  countButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
  },
  countGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  countButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  optionsLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  optionWrapper: {
    flex: 1,
  },
  answerButton: {
    borderRadius: 20,
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
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    position: 'relative',
  },
  answerText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  feedbackIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
});
