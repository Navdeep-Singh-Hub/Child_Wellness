// Game 4: Simple Symmetry
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
import { SYMMETRY_DATA, shuffleArray } from '../utils/gameData';

interface SimpleSymmetryGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;

// Half shape component
function HalfShape({ shape, side, size = 100 }: { shape: 'circle' | 'square' | 'triangle'; side: 'left' | 'right'; size?: number }) {
  if (shape === 'circle') {
    return (
      <View style={[styles.halfShape, { width: size, height: size }]}>
        <View
          style={[
            styles.circleHalf,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: '#A5B4FC',
              borderTopRightRadius: side === 'left' ? size / 2 : 0,
              borderBottomRightRadius: side === 'left' ? size / 2 : 0,
              borderTopLeftRadius: side === 'right' ? size / 2 : 0,
              borderBottomLeftRadius: side === 'right' ? size / 2 : 0,
            },
          ]}
        />
      </View>
    );
  } else if (shape === 'square') {
    return (
      <View style={[styles.halfShape, { width: size, height: size }]}>
        <View
          style={[
            styles.squareHalf,
            {
              width: size,
              height: size,
              backgroundColor: '#A5B4FC',
              borderTopRightRadius: side === 'left' ? 0 : 8,
              borderBottomRightRadius: side === 'left' ? 0 : 8,
              borderTopLeftRadius: side === 'right' ? 0 : 8,
              borderBottomLeftRadius: side === 'right' ? 0 : 8,
            },
          ]}
        />
      </View>
    );
  } else {
    // Triangle
    return (
      <View style={[styles.halfShape, { width: size, height: size }]}>
        <View
          style={[
            styles.triangleHalf,
            {
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderLeftWidth: side === 'left' ? size / 2 : 0,
              borderRightWidth: side === 'right' ? size / 2 : 0,
              borderBottomWidth: size,
              borderLeftColor: side === 'left' ? '#A5B4FC' : 'transparent',
              borderRightColor: side === 'right' ? '#A5B4FC' : 'transparent',
              borderBottomColor: '#A5B4FC',
            },
          ]}
        />
      </View>
    );
  }
}

export default function SimpleSymmetryGame({ onComplete, onBack }: SimpleSymmetryGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState<typeof SYMMETRY_DATA[0] | null>(null);
  const [options, setOptions] = useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);

  const halfScale = useSharedValue(1);
  const matchScale = useSharedValue(1);

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
        gameId: 'simple-symmetry',
      });
      return;
    }

    const item = SYMMETRY_DATA[round % SYMMETRY_DATA.length];
    const shuffled = shuffleArray([0, 1]);
    
    setCurrentItem(item);
    setOptions(shuffled);
    setSelectedIndex(null);
    setIsCorrect(null);
    setCanSelect(true);
    halfScale.value = 1;
    matchScale.value = 1;
  };

  const handleSelect = async (index: number) => {
    if (!canSelect || !currentItem) return;

    setCanSelect(false);
    setSelectedIndex(index);
    const correct = options[index] === currentItem.correctHalf;

    if (correct) {
      setIsCorrect(true);
      setScore(score + 1);
      await playSoundEffect('success');
      await speakFeedback('Perfect match!');
      matchScale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 10 })
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

  const halfAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: halfScale.value }],
  }));

  const matchAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: matchScale.value }],
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
        <Text style={styles.headerTitle}>Simple Symmetry</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}/{TOTAL_ROUNDS}</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Find the matching half to complete the shape
        </Text>
      </View>

      {/* Half Shape Display */}
      <View style={styles.halfContainer}>
        <Animated.View style={[styles.halfDisplay, halfAnimatedStyle]}>
          <HalfShape shape={currentItem.shape} side="left" size={120} />
          <View style={styles.mirrorLine} />
          <View style={styles.missingHalf}>
            <Text style={styles.missingText}>?</Text>
          </View>
        </Animated.View>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((halfIndex, index) => {
          const isSelected = selectedIndex === index;
          const showFeedback = isSelected && isCorrect !== null;
          const isCorrectOption = halfIndex === currentItem.correctHalf;

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
                  matchAnimatedStyle,
                  showFeedback && isCorrect && styles.correctCard,
                  showFeedback && !isCorrect && styles.incorrectCard,
                ]}
              >
                <HalfShape shape={currentItem.shape} side={halfIndex === 0 ? 'right' : 'left'} size={100} />
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
  halfContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  halfDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#A5B4FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  mirrorLine: {
    width: 3,
    height: 120,
    backgroundColor: '#A5B4FC',
    marginHorizontal: 8,
  },
  missingHalf: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A5B4FC',
    borderStyle: 'dashed',
  },
  missingText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#A5B4FC',
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
  halfShape: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleHalf: {},
  squareHalf: {},
  triangleHalf: {},
});
