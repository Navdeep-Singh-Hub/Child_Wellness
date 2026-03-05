// Game 4: Build the Addition
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
import { playSoundEffect, speakNumber, countWithVoice, speakFeedback, stopAllAudio } from '../utils/audio';
import { COUNTING_DATA, getCountingOptions } from '../utils/gameData';

interface BuildAdditionGameProps {
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

export default function BuildAdditionGame({ onComplete, onBack }: BuildAdditionGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState<typeof COUNTING_DATA[0] | null>(null);
  const [options, setOptions] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);
  const [group1Objects, setGroup1Objects] = useState<number[]>([]);
  const [group2Objects, setGroup2Objects] = useState<number[]>([]);
  const [countingArea, setCountingArea] = useState<Array<{ group: number; id: number }>>([]);
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
        gameId: 'build-addition',
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
    setGroup1Objects(Array.from({ length: item.group1 }, (_, i) => i));
    setGroup2Objects(Array.from({ length: item.group2 }, (_, i) => i));
    setCountingArea([]);
    setIsCounting(false);
    cardScale.value = 1;
    cardGlow.value = 0;
  };

  const handleObjectTap = async (group: number, index: number) => {
    if (isCounting || !currentItem) return;

    if (group === 1) {
      setGroup1Objects(prev => prev.filter(i => i !== index));
      setCountingArea(prev => [...prev, { group: 1, id: Date.now() + index }]);
    } else {
      setGroup2Objects(prev => prev.filter(i => i !== index));
      setCountingArea(prev => [...prev, { group: 2, id: Date.now() + index }]);
    }
  };

  const handleCountTogether = async () => {
    if (isCounting || countingArea.length === 0 || !currentItem) return;

    setIsCounting(true);
    setCanSelect(false);

    // Count together with voice
    for (let i = 0; i < countingArea.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await countWithVoice(i + 1);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    await speakNumber(countingArea.length);
    await speakFeedback('What is the total?');
    
    setIsCounting(false);
    setCanSelect(true);
  };

  const handleAnswerSelect = async (answer: number) => {
    if (!canSelect || !currentItem || countingArea.length === 0) return;

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
      await speakFeedback('Perfect addition!');
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
        <Text style={styles.instructionsText}>Tap objects to move them, then count together</Text>
      </View>

      {/* Equation Display */}
      <View style={styles.equationContainer}>
        <Text style={styles.equationText}>
          {currentItem.group1} + {currentItem.group2} = ?
        </Text>
      </View>

      {/* Groups */}
      <View style={styles.groupsContainer}>
        {/* Group 1 */}
        <View style={styles.groupBox}>
          <Text style={styles.groupLabel}>Group 1</Text>
          <View style={styles.objectsRow}>
            {group1Objects.map((index) => (
              <Pressable
                key={index}
                onPress={() => handleObjectTap(1, index)}
                disabled={isCounting}
                style={styles.objectButton}
              >
                <ObjectIcon type={currentItem.objectType} size={50} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Plus Sign */}
        <View style={styles.plusContainer}>
          <Text style={styles.plusText}>+</Text>
        </View>

        {/* Group 2 */}
        <View style={styles.groupBox}>
          <Text style={styles.groupLabel}>Group 2</Text>
          <View style={styles.objectsRow}>
            {group2Objects.map((index) => (
              <Pressable
                key={index}
                onPress={() => handleObjectTap(2, index)}
                disabled={isCounting}
                style={styles.objectButton}
              >
                <ObjectIcon type={currentItem.objectType} size={50} />
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Counting Area */}
      <View style={styles.countingArea}>
        <Text style={styles.countingLabel}>Counting Area</Text>
        <View style={styles.countingBox}>
          {countingArea.map((obj) => (
            <View key={obj.id} style={styles.countingObject}>
              <ObjectIcon type={currentItem.objectType} size={45} />
            </View>
          ))}
        </View>
        {countingArea.length > 0 && (
          <Pressable
            onPress={handleCountTogether}
            disabled={isCounting || !canSelect}
            style={styles.countButton}
          >
            <LinearGradient
              colors={['#C4B5FD', '#A78BFA']}
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
      {countingArea.length === currentItem.total && !isCounting && (
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
                      colors={showCorrect ? ['#86EFAC', '#4ADE80'] : showIncorrect ? ['#FBCFE8', '#F9A8D4'] : ['#C4B5FD', '#A78BFA']}
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
  groupsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  groupBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#C4B5FD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  objectsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  objectButton: {
    marginBottom: 4,
  },
  objectIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusContainer: {
    width: 40,
    alignItems: 'center',
  },
  plusText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#C4B5FD',
  },
  countingArea: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  countingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  countingBox: {
    backgroundColor: '#F3E8FF',
    borderRadius: 20,
    padding: 16,
    minHeight: 100,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#C4B5FD',
    borderStyle: 'dashed',
  },
  countingObject: {
    marginBottom: 4,
  },
  countButton: {
    borderRadius: 20,
    overflow: 'hidden',
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
