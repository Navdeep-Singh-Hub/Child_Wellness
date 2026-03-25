// Game 4: Find the Letter
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
import { LETTER_GRID } from '../utils/gameData';

interface FindTheLetterGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

export default function FindTheLetterGame({ onComplete, onBack }: FindTheLetterGameProps) {
  const { width, height } = useWindowDimensions();
  const TARGET_LETTER = 'I';
  const [round, setRound] = useState(0);
  const [foundLetters, setFoundLetters] = useState<Set<string>>(new Set());
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const TOTAL_ROUNDS = 3;

  // Count target letters in grid
  const targetCount = LETTER_GRID.flat().filter((letter) => letter === TARGET_LETTER).length;

  useEffect(() => {
    setFoundLetters(new Set());
    setSelectedCell(null);
    speakInstruction('Find all the letter I.');
    return () => stopAllAudio();
  }, [round]);

  const handleCellPress = (row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    if (selectedCell === cellKey || foundLetters.has(cellKey)) return;

    const letter = LETTER_GRID[row][col];
    const isTarget = letter === TARGET_LETTER;

    setSelectedCell(cellKey);

    if (isTarget) {
      setFoundLetters((prev) => new Set([...prev, cellKey]));
      setScore((prev) => prev + 1);
      playSoundEffect('correct');
      speakFeedback('Great! You found the letter I!');

      // Check if all letters found
      if (foundLetters.size + 1 === targetCount) {
        setTimeout(() => {
          if (round < TOTAL_ROUNDS - 1) {
            setRound((prev) => prev + 1);
          } else {
            const accuracy = (score / (targetCount * TOTAL_ROUNDS)) * 100;
            onComplete({
              correct: score,
              total: targetCount * TOTAL_ROUNDS,
              accuracy,
              gameId: 'find-the-letter',
            });
          }
        }, 2000);
      }
    } else {
      playSoundEffect('incorrect');
      speakFeedback('That is not the letter I. Try again!');
      setTimeout(() => setSelectedCell(null), 1000);
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
        <Text style={styles.title}>Find the Letter</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Find all the letter I</Text>
        <Text style={styles.progressText}>
          Found: {foundLetters.size} / {targetCount}
        </Text>
      </View>

      {/* Grid */}
      <View style={styles.gridContainer}>
        {LETTER_GRID.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {row.map((letter, colIndex) => {
              const cellKey = `${rowIndex}-${colIndex}`;
              const isFound = foundLetters.has(cellKey);
              const isSelected = selectedCell === cellKey;
              const isTarget = letter === TARGET_LETTER;

              return (
                <Animated.View key={colIndex} style={[styles.cellWrapper, animatedStyle]}>
                  <Pressable
                    style={[
                      styles.cell,
                      isFound && styles.cellFound,
                      isSelected && isTarget && styles.cellCorrect,
                      isSelected && !isTarget && styles.cellIncorrect,
                    ]}
                    onPress={() => handleCellPress(rowIndex, colIndex)}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={isFound || !!selectedCell}
                  >
                    <Text
                      style={[
                        styles.cellLetter,
                        isFound && styles.cellLetterFound,
                        isSelected && isTarget && styles.cellLetterCorrect,
                        isSelected && !isTarget && styles.cellLetterIncorrect,
                      ]}
                    >
                      {letter}
                    </Text>
                    {isFound && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                      </View>
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
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  cellWrapper: {
    width: 80,
    height: 80,
  },
  cell: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFound: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  cellCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  cellIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  cellLetter: {
    fontSize: 48,
    fontWeight: '900',
    color: '#3B82F6',
  },
  cellLetterFound: {
    color: '#10B981',
  },
  cellLetterCorrect: {
    color: '#10B981',
  },
  cellLetterIncorrect: {
    color: '#EF4444',
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
});
