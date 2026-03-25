// Game 1: Intro to Sleeping Line
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../utils/audio';

interface IntroSleepingLineGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const AnimatedLine = Animated.createAnimatedComponent(Line);

export default function IntroSleepingLineGame({ onComplete, onBack }: IntroSleepingLineGameProps) {
  const { width, height } = useWindowDimensions();
  const [hasStarted, setHasStarted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const lineWidth = useSharedValue(0);
  const centerY = height / 2;
  const startX = width * 0.2;
  const endX = width * 0.8;
  const lineLength = endX - startX;

  useEffect(() => {
    speakInstruction('Draw a sleeping line from left to right.');
    return () => stopAllAudio();
  }, []);

  useEffect(() => {
    if (hasStarted && !hasCompleted) {
      // Animate line drawing from left to right
      lineWidth.value = withTiming(
        lineLength,
        {
          duration: 2000,
          easing: Easing.out(Easing.ease),
        },
        () => {
          setHasCompleted(true);
          playSoundEffect('celebration');
          speakFeedback('Great! This is a sleeping line!');
        }
      );
    }
  }, [hasStarted]);

  const animatedLineProps = useAnimatedProps(() => {
    return {
      x2: startX + lineWidth.value,
    };
  });

  const handleStart = () => {
    setHasStarted(true);
    playSoundEffect('click');
  };

  const handleContinue = () => {
    onComplete({
      correct: 1,
      total: 1,
      accuracy: 100,
      gameId: 'intro-sleeping-line',
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
        <Text style={styles.title}>Intro to Sleeping Line</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Draw a sleeping line from left to right</Text>
      </View>

      {/* Drawing Area */}
      <View style={styles.drawingArea}>
        <Svg width={width} height={height * 0.5} style={styles.svg}>
          {hasStarted && (
            <AnimatedLine
              x1={startX}
              y1={centerY}
              x2={startX}
              animatedProps={animatedLineProps}
              y2={centerY}
              stroke="#3B82F6"
              strokeWidth="8"
              strokeLinecap="round"
            />
          )}
          {!hasStarted && (
            <Line
              x1={startX}
              y1={centerY}
              x2={startX}
              y2={centerY}
              stroke="#D1D5DB"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="10,5"
            />
          )}
        </Svg>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {!hasStarted ? (
          <Pressable style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>Start Animation</Text>
            <Ionicons name="play" size={20} color="#fff" />
          </Pressable>
        ) : hasCompleted ? (
          <Pressable style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>Watch the line draw...</Text>
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
  drawingArea: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    flex: 1,
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
