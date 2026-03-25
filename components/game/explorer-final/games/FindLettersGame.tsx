// Game 1: Find Letters
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
import { LETTERS_GRID } from '../utils/gameData';

interface FindLettersGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

export default function FindLettersGame({ onComplete, onBack }: FindLettersGameProps) {
  const { width, height } = useWindowDimensions();
  const [round, setRound] = useState(0);
  const [targetLetter, setTargetLetter] = useState('');
  const [foundLetters, setFoundLetters] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const TOTAL_ROUNDS = 5;

  // Flatten grid and get unique letters
  const allLetters = Array.from(new Set(LETTERS_GRID.flat()));
  const targetLetters = allLetters.slice(0, TOTAL_ROUNDS);

  useEffect(() => {
    setTargetLetter(targetLetters[round]);
    setFoundLetters(new Set());
    speakInstruction(`Find all the letter ${targetLetters[round]}.`);
    return () => stopAllAudio();
  }, [round]);

  const handleLetterTap = (letter: string, row: number, col: number) => {
    if (letter === targetLetter && !foundLetters.has(`${row}-${col}`)) {
      setFoundLetters((prev) => new Set([...prev, `${row}-${col}`]));
      const count = LETTERS_GRID.flat().filter((l) => l === targetLetter).length;
      if (foundLetters.size + 1 === count) {
        setScore((prev) => prev + 1);
        playSoundEffect('correct');
        speakFeedback(`Great! You found all ${targetLetter}s!`);
        setTimeout(() => {
          if (round < TOTAL_ROUNDS - 1) {
            setRound((prev) => prev + 1);
          } else {
            const accuracy = (score / TOTAL_ROUNDS) * 100;
            onComplete({
              correct: score,
              total: TOTAL_ROUNDS,
              accuracy,
              gameId: 'find-letters',
            });
          }
        }, 2000);
      } else {
        playSoundEffect('correct');
      }
    } else if (letter !== targetLetter) {
      playSoundEffect('incorrect');
      speakFeedback(`That's not ${targetLetter}. Try again!`);
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
        <Text style={styles.title}>Find Letters</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Find all the letter {targetLetter}</Text>
      </View>

      {/* Grid */}
      <View style={styles.gridContainer}>
        {LETTERS_GRID.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((letter, colIdx) => {
              const isFound = foundLetters.has(`${rowIdx}-${colIdx}`);
              const isTarget = letter === targetLetter;
              return (
                <Animated.View key={`${rowIdx}-${colIdx}`} style={[styles.cellWrapper, animatedStyle]}>
                  <Pressable
                    style={[
                      styles.cell,
                      isFound && styles.cellFound,
                      isTarget && !isFound && styles.cellTarget,
                    ]}
                    onPress={() => handleLetterTap(letter, rowIdx, colIdx)}
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
                      {letter}
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
    fontSize: 32,
    fontWeight: '900',
    color: '#3B82F6',
  },
  cellTextFound: {
    color: '#10B981',
  },
});
