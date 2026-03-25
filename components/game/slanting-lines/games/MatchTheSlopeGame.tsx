// Game 3: Match the Slope
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakFeedback, stopAllAudio } from '../utils/audio';
import { LINE_TYPES } from '../utils/gameData';

interface MatchTheSlopeGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

export default function MatchTheSlopeGame({ onComplete, onBack }: MatchTheSlopeGameProps) {
  const { width, height } = useWindowDimensions();
  const [round, setRound] = useState(0);
  const [options, setOptions] = useState<typeof LINE_TYPES>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const TOTAL_ROUNDS = 5;

  useEffect(() => {
    // Create options: 1 diagonal line + 2 non-diagonal lines
    const diagonal = LINE_TYPES.find((l) => l.type === 'diagonal')!;
    const nonDiagonal = LINE_TYPES.filter((l) => l.type !== 'diagonal');
    const shuffled = [diagonal, ...nonDiagonal.slice(0, 2)].sort(() => Math.random() - 0.5);
    setOptions(shuffled);
    setSelectedId(null);
    setIsCorrect(null);
    speakFeedback('Tap the slanting line.');
    return () => stopAllAudio();
  }, [round]);

  const handleSelect = (lineId: string) => {
    if (selectedId) return;
    const selected = options.find((l) => l.id === lineId);
    const correct = selected?.type === 'diagonal';
    setSelectedId(lineId);
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
      playSoundEffect('correct');
      speakFeedback('Correct! That is a slanting line!');
    } else {
      playSoundEffect('incorrect');
      speakFeedback('Try again! Look for the slanting line.');
    }

    // Move to next round after delay
    setTimeout(() => {
      if (round < TOTAL_ROUNDS - 1) {
        setRound((prev) => prev + 1);
      } else {
        const accuracy = (score / TOTAL_ROUNDS) * 100;
        onComplete({
          correct: score,
          total: TOTAL_ROUNDS,
          accuracy,
          gameId: 'match-the-slope',
        });
      }
    }, 2000);
  };

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (lineId: string) => {
    if (selectedId) return;
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#93C5FD', '#FBCFE8', '#A7F3D0'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Match the Slope</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Tap the slanting line</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((line, index) => {
          const isSelected = selectedId === line.id;
          const isDiagonal = line.type === 'diagonal';
          const showCorrect = isSelected && isCorrect !== null;

          return (
            <Animated.View key={line.id} style={[styles.optionWrapper, animatedStyle]}>
              <Pressable
                style={[
                  styles.optionCard,
                  isSelected && isCorrect && styles.optionCardCorrect,
                  isSelected && !isCorrect && styles.optionCardIncorrect,
                  showCorrect && isDiagonal && styles.optionCardHighlight,
                ]}
                onPress={() => handleSelect(line.id)}
                onPressIn={() => handlePressIn(line.id)}
                onPressOut={handlePressOut}
                disabled={!!selectedId}
              >
                <Svg width={200} height={300} style={styles.lineSvg}>
                  <Line
                    x1={line.type === 'diagonal' ? (line.angle > 0 ? 50 : 150) : 100}
                    y1={line.type === 'diagonal' ? 50 : line.type === 'vertical' ? 50 : 150}
                    x2={line.type === 'diagonal' ? (line.angle > 0 ? 150 : 50) : 100}
                    y2={line.type === 'diagonal' ? 250 : line.type === 'vertical' ? 250 : 150}
                    stroke={isSelected && isDiagonal ? '#10B981' : isSelected ? '#EF4444' : '#3B82F6'}
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </Svg>
                {showCorrect && isDiagonal && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                  </View>
                )}
                {showCorrect && !isDiagonal && (
                  <View style={styles.checkmark}>
                    <Ionicons name="close-circle" size={32} color="#EF4444" />
                  </View>
                )}
              </Pressable>
            </Animated.View>
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
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  roundText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  instructionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  optionsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  optionWrapper: {
    width: '30%',
    minWidth: 150,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#E2E8F0',
    minHeight: 200,
  },
  optionCardCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  optionCardIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  optionCardHighlight: {
    borderWidth: 4,
  },
  lineSvg: {
    flex: 1,
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
