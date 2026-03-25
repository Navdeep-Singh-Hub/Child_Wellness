// Game 2: Find Numbers
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../utils/audio';
import { NUMBERS_GRID } from '../utils/gameData';

interface FindNumbersGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

export default function FindNumbersGame({ onComplete, onBack }: FindNumbersGameProps) {
  const { width, height } = useWindowDimensions();
  const [round, setRound] = useState(0);
  const [targetNumber, setTargetNumber] = useState('');
  const [foundNumbers, setFoundNumbers] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const TOTAL_ROUNDS = 5;

  // Flatten grid and get unique numbers
  const allNumbers = Array.from(new Set(NUMBERS_GRID.flat()));
  const targetNumbers = allNumbers.slice(0, TOTAL_ROUNDS);

  useEffect(() => {
    setTargetNumber(targetNumbers[round]);
    setFoundNumbers(new Set());
    speakInstruction(`Find all the number ${targetNumbers[round]}.`);
    return () => stopAllAudio();
  }, [round]);

  const handleNumberTap = (number: string, row: number, col: number) => {
    if (number === targetNumber && !foundNumbers.has(`${row}-${col}`)) {
      setFoundNumbers((prev) => new Set([...prev, `${row}-${col}`]));
      const count = NUMBERS_GRID.flat().filter((n) => n === targetNumber).length;
      if (foundNumbers.size + 1 === count) {
        setScore((prev) => prev + 1);
        playSoundEffect('correct');
        speakFeedback(`Great! You found all ${targetNumber}s!`);
        setTimeout(() => {
          if (round < TOTAL_ROUNDS - 1) {
            setRound((prev) => prev + 1);
          } else {
            const accuracy = (score / TOTAL_ROUNDS) * 100;
            onComplete({
              correct: score,
              total: TOTAL_ROUNDS,
              accuracy,
              gameId: 'find-numbers',
            });
          }
        }, 2000);
      } else {
        playSoundEffect('correct');
      }
    } else if (number !== targetNumber) {
      playSoundEffect('incorrect');
      speakFeedback(`That's not ${targetNumber}. Try again!`);
    }
  };

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
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
        <Text style={styles.title}>Find Numbers</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Find all the number {targetNumber}</Text>
      </View>

      {/* Grid */}
      <View style={styles.gridContainer}>
        {NUMBERS_GRID.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((number, colIdx) => {
              const isFound = foundNumbers.has(`${rowIdx}-${colIdx}`);
              const isTarget = number === targetNumber;
              return (
                <Animated.View key={`${rowIdx}-${colIdx}`} style={[styles.cellWrapper, animatedStyle]}>
                  <Pressable
                    style={[
                      styles.cell,
                      isFound && styles.cellFound,
                      isTarget && !isFound && styles.cellTarget,
                    ]}
                    onPress={() => handleNumberTap(number, rowIdx, colIdx)}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={isFound}
                  >
                    <Text
                      style={[
                        styles.cellText,
                        isFound && styles.cellTextFound,
                      ]}
                    >
                      {number}
                    </Text>
                    {isFound && (
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        ))}
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
  gridContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 12,
  },
  cellWrapper: {
    width: '22%',
    aspectRatio: 1,
  },
  cell: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellTarget: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  cellFound: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  cellText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#3B82F6',
  },
  cellTextFound: {
    color: '#10B981',
  },
});
