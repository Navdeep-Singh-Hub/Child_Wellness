// Game 3: Shape Match
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
import { SHAPE_MATCH_DATA, ShapeType, shuffleArray } from '../utils/gameData';

interface ShapeMatchGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;

// Shape component
function ShapeComponent({ type, size = 60, color = '#A5B4FC' }: { type: ShapeType; size?: number; color?: string }) {
  if (type === 'circle') {
    return <View style={[styles.shapeBase, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]} />;
  } else if (type === 'square') {
    return <View style={[styles.shapeBase, { width: size, height: size, backgroundColor: color }]} />;
  } else {
    // Triangle
    return (
      <View style={[styles.shapeBase, { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: size / 2, borderRightWidth: size / 2, borderBottomWidth: size, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }]} />
    );
  }
}

export default function ShapeMatchGame({ onComplete, onBack }: ShapeMatchGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState<typeof SHAPE_MATCH_DATA[0] | null>(null);
  const [options, setOptions] = useState<ShapeType[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);

  const targetScale = useSharedValue(1);
  const sparkleOpacity = useSharedValue(0);

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
        gameId: 'shape-match',
      });
      return;
    }

    const item = SHAPE_MATCH_DATA[round % SHAPE_MATCH_DATA.length];
    const shuffled = shuffleArray([...item.options]);
    
    setCurrentItem(item);
    setOptions(shuffled);
    setSelectedIndex(null);
    setIsCorrect(null);
    setCanSelect(true);
    targetScale.value = 1;
    sparkleOpacity.value = 0;
  };

  const handleSelect = async (index: number) => {
    if (!canSelect || !currentItem) return;

    setCanSelect(false);
    setSelectedIndex(index);
    const correct = options[index] === currentItem.targetShape;

    if (correct) {
      setIsCorrect(true);
      setScore(score + 1);
      await playSoundEffect('success');
      await speakFeedback('Great job!');
      targetScale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );
      sparkleOpacity.value = withSequence(
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
        setSelectedIndex(null);
        setIsCorrect(null);
        setCanSelect(true);
      }, 1500);
    }
  };

  const targetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: targetScale.value }],
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
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
        <Text style={styles.headerTitle}>Shape Match</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}/{TOTAL_ROUNDS}</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Find the matching shape
        </Text>
      </View>

      {/* Target Shape */}
      <View style={styles.targetContainer}>
        <Animated.View style={[styles.targetShape, targetAnimatedStyle]}>
          <View style={styles.targetOutline}>
            <ShapeComponent type={currentItem.targetShape} size={120} color="#A5B4FC" />
          </View>
          <Animated.View style={[styles.sparkleOverlay, sparkleAnimatedStyle]}>
            <Ionicons name="sparkles" size={48} color="#FBCFE8" />
          </Animated.View>
        </Animated.View>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((shape, index) => {
          const isSelected = selectedIndex === index;
          const showFeedback = isSelected && isCorrect !== null;
          const isCorrectOption = shape === currentItem.targetShape;

          return (
            <Pressable
              key={index}
              onPress={() => handleSelect(index)}
              disabled={!canSelect}
              style={styles.optionWrapper}
            >
              <Animated.View
                style={[
                  styles.optionCard,
                  showFeedback && isCorrect && styles.correctCard,
                  showFeedback && !isCorrect && styles.incorrectCard,
                ]}
              >
                <ShapeComponent type={shape} size={80} color={showFeedback && isCorrect ? '#22C55E' : showFeedback && !isCorrect ? '#EF4444' : '#A5B4FC'} />
                {showFeedback && (
                  <View style={styles.feedbackIcon}>
                    <Ionicons
                      name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                      size={40}
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
  targetContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  targetShape: {
    position: 'relative',
  },
  targetOutline: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A5B4FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#A5B4FC',
  },
  sparkleOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  optionWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  optionCard: {
    aspectRatio: 1,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#E2E8F0',
  },
  correctCard: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  incorrectCard: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  feedbackIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  shapeBase: {
    backgroundColor: '#A5B4FC',
  },
});
