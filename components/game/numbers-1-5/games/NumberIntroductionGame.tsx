// Game 1: Number Introduction
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakNumber, stopAllAudio } from '../utils/audio';
import { NUMBERS } from '../utils/gameData';

interface NumberIntroductionGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

export default function NumberIntroductionGame({ onComplete, onBack }: NumberIntroductionGameProps) {
  const { width, height } = useWindowDimensions();
  const [currentNumberIndex, setCurrentNumberIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const currentNumber = NUMBERS[currentNumberIndex];

  useEffect(() => {
    if (hasStarted && !hasCompleted) {
      scale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1, { damping: 10, stiffness: 100 })
      );
      opacity.value = withTiming(1, { duration: 300 });
      speakNumber(currentNumber.number);
    }
  }, [currentNumberIndex, hasStarted]);

  useEffect(() => {
    if (hasStarted && currentNumberIndex < NUMBERS.length - 1) {
      const timer = setTimeout(() => {
        setCurrentNumberIndex((prev) => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (hasStarted && currentNumberIndex === NUMBERS.length - 1) {
      const timer = setTimeout(() => {
        setHasCompleted(true);
        playSoundEffect('celebration');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentNumberIndex, hasStarted]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleStart = () => {
    setHasStarted(true);
    playSoundEffect('click');
  };

  const handleContinue = () => {
    onComplete({
      correct: NUMBERS.length,
      total: NUMBERS.length,
      accuracy: 100,
      gameId: 'number-introduction',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#93C5FD', '#FBCFE8', '#A7F3D0'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Number Introduction</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Learn numbers 1 to 5</Text>
      </View>

      {/* Number Display */}
      <View style={styles.displayArea}>
        {hasStarted && (
          <Animated.View style={[styles.numberContainer, animatedStyle]}>
            <Text style={styles.numberText}>{currentNumber.number}</Text>
            <View style={styles.objectsContainer}>
              {Array.from({ length: currentNumber.number }).map((_, idx) => (
                <Text key={idx} style={styles.objectEmoji}>
                  {currentNumber.emoji}
                </Text>
              ))}
            </View>
          </Animated.View>
        )}
        {!hasStarted && (
          <View style={styles.numberContainer}>
            <Text style={styles.numberTextPlaceholder}>1</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {!hasStarted ? (
          <Pressable style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>Start</Text>
            <Ionicons name="play" size={20} color="#fff" />
          </Pressable>
        ) : hasCompleted ? (
          <Pressable style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>
              Number {currentNumberIndex + 1} of {NUMBERS.length}
            </Text>
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
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
  displayArea: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 200,
    fontWeight: '900',
    color: '#3B82F6',
    marginBottom: 32,
  },
  numberTextPlaceholder: {
    fontSize: 200,
    fontWeight: '900',
    color: '#D1D5DB',
  },
  objectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  objectEmoji: {
    fontSize: 64,
  },
  controls: {
    padding: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  waitingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  waitingText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
});
