// Game 3: Complete the Pattern
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
import { playSoundEffect, speakFeedback, stopAllAudio } from '../utils/audio';
import { PATTERN_DATA, Pattern, PatternItem } from '../utils/gameData';

interface CompletePatternGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;

export default function CompletePatternGame({ onComplete, onBack }: CompletePatternGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState<Pattern | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<PatternItem | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);

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
        gameId: 'complete-pattern',
      });
      return;
    }

    const item = PATTERN_DATA[round % PATTERN_DATA.length];
    
    setCurrentItem(item);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCanSelect(true);
    cardScale.value = 1;
    cardGlow.value = 0;
  };

  const handleAnswerSelect = async (answer: PatternItem) => {
    if (!canSelect || !currentItem) return;

    setCanSelect(false);
    setSelectedAnswer(answer);
    const correct = answer === currentItem.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      cardGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakFeedback('Great pattern thinking!');
    } else {
      cardScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 8 })
      );
      await playSoundEffect('incorrect');
      await speakFeedback('Look at the pattern again!');
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
        <Text style={styles.instructionsText}>Find the shape that completes the pattern</Text>
      </View>

      {/* Pattern Display */}
      <View style={styles.patternContainer}>
        <View style={styles.patternBox}>
          <Text style={styles.patternLabel}>Pattern:</Text>
          <View style={styles.patternRow}>
            {currentItem.sequence.map((item, index) => (
              <View key={index} style={styles.patternItem}>
                <Text style={styles.patternEmoji}>{item}</Text>
              </View>
            ))}
            <View style={[styles.patternItem, styles.patternItemEmpty]}>
              <Text style={styles.patternEmoji}>?</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Answer Options */}
      <View style={styles.optionsContainer}>
        <Text style={styles.optionsLabel}>What comes next?</Text>
        <View style={styles.optionsRow}>
          {currentItem.options.map((option, index) => {
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
                    showCorrect && styles.correctButton,
                    showIncorrect && styles.incorrectButton,
                  ]}
                >
                  <LinearGradient
                    colors={showCorrect ? ['#A7F3D0', '#6EE7B7'] : showIncorrect ? ['#FBCFE8', '#F9A8D4'] : ['#93C5FD', '#60A5FA']}
                    style={styles.answerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.answerEmoji}>{option}</Text>
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
    shadowColor: '#93C5FD',
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
  patternContainer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  patternBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#93C5FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    minWidth: '100%',
  },
  patternLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  patternItem: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#93C5FD',
  },
  patternItemEmpty: {
    backgroundColor: '#F3F4F6',
    borderStyle: 'dashed',
    borderColor: '#9CA3AF',
  },
  patternEmoji: {
    fontSize: 36,
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  optionsLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
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
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#93C5FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  correctButton: {
    borderWidth: 4,
    borderColor: '#A7F3D0',
  },
  incorrectButton: {
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
  answerEmoji: {
    fontSize: 48,
  },
  feedbackIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
