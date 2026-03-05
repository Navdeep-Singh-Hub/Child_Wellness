// Game 3: Count & Add (Concrete Objects)
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
  FadeIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakNumber, countWithVoice, speakFeedback, stopAllAudio } from '../utils/audio';
import { COUNTING_DATA, getCountingOptions } from '../utils/gameData';

interface CountAddObjectsGameProps {
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

export default function CountAddObjectsGame({ onComplete, onBack }: CountAddObjectsGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState<typeof COUNTING_DATA[0] | null>(null);
  const [options, setOptions] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);
  const [objects, setObjects] = useState<Array<{ id: number; group: number }>>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0);
  const soundTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadRound();
  }, [round]);

  useEffect(() => {
    if (currentItem && !isAnimating) {
      animateObjects();
    }
  }, [currentItem]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'count-add-objects',
      });
      return;
    }

    const item = COUNTING_DATA[round % COUNTING_DATA.length];
    const opts = getCountingOptions(item.total);
    
    setCurrentItem(item);
    setOptions(opts);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCanSelect(true);
    setObjects([]);
    setIsAnimating(false);
    cardScale.value = 1;
    cardGlow.value = 0;
  };

  const animateObjects = async () => {
    if (!currentItem) return;
    
    setIsAnimating(true);
    setObjects([]);
    
    // Animate group 1
    for (let i = 0; i < currentItem.group1; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setObjects(prev => [...prev, { id: prev.length, group: 1 }]);
      await countWithVoice(i + 1);
    }
    
    // Small pause
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Animate group 2
    for (let i = 0; i < currentItem.group2; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setObjects(prev => [...prev, { id: prev.length, group: 2 }]);
      await countWithVoice(currentItem.group1 + i + 1);
    }
    
    setIsAnimating(false);
    
    // Ask the question
    await new Promise(resolve => setTimeout(resolve, 500));
    await speakNumber(currentItem.total);
    await speakFeedback('How many?');
  };

  const handleAnswerSelect = async (answer: number) => {
    if (!canSelect || !currentItem || isAnimating) return;

    setCanSelect(false);
    setSelectedAnswer(answer);
    const correct = answer === currentItem.total;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      cardGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakNumber(answer);
      await speakFeedback('Excellent counting!');
    } else {
      cardScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 8 })
      );
      await playSoundEffect('incorrect');
      await speakFeedback('Let\'s count together!');
      // Replay animation
      setTimeout(() => {
        animateObjects();
      }, 1000);
      setTimeout(() => {
        setCanSelect(true);
        setSelectedAnswer(null);
        setIsCorrect(null);
      }, 3000);
      return;
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 2000);
  };

  const handleReplay = () => {
    if (currentItem && !isAnimating) {
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

  if (!currentItem) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

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
        <Text style={styles.instructionsText}>Count the objects and find the total</Text>
      </View>

      {/* Objects Display */}
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
          {objects.map((obj, index) => (
            <Animated.View
              key={obj.id}
              entering={FadeIn.duration(300)}
              style={styles.objectWrapper}
            >
              <ObjectIcon type={currentItem.objectType} size={60} />
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>How many {currentItem.objectType}s?</Text>
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
  objectsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    minHeight: 200,
  },
  replayButton: {
    marginBottom: 16,
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
