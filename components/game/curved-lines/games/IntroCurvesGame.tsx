// Game 1: Intro to Curves
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../utils/audio';

interface IntroCurvesGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function IntroCurvesGame({ onComplete, onBack }: IntroCurvesGameProps) {
  const { width, height } = useWindowDimensions();
  const [hasStarted, setHasStarted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const pathProgress = useSharedValue(0);
  
  // Curved line path (left curve like "(")
  const startX = width * 0.2;
  const startY = height * 0.5;
  const controlX = width * 0.5;
  const controlY = height * 0.3;
  const endX = width * 0.8;
  const endY = height * 0.5;

  useEffect(() => {
    speakInstruction('Draw a curved line like this.');
    return () => stopAllAudio();
  }, []);

  useEffect(() => {
    if (hasStarted && !hasCompleted) {
      // Animate curve drawing
      pathProgress.value = withTiming(
        1,
        {
          duration: 2000,
          easing: Easing.out(Easing.ease),
        },
        () => {
          setHasCompleted(true);
          playSoundEffect('celebration');
          speakFeedback('Great! This is a curved line!');
        }
      );
    }
  }, [hasStarted]);

  const animatedPathProps = useAnimatedProps(() => {
    // Calculate intermediate points for the curve
    const t = pathProgress.value;
    const currentX = startX + (endX - startX) * t;
    const currentY = startY + (endY - startY) * t;
    const controlYCurrent = controlY + (controlY - startY) * (1 - t);
    
    // Create quadratic bezier path
    const path = `M ${startX} ${startY} Q ${controlX} ${controlYCurrent}, ${currentX} ${currentY}`;
    return { d: path };
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
      gameId: 'intro-curves',
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
        <Text style={styles.title}>Intro to Curves</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Draw a curved line like this</Text>
      </View>

      {/* Drawing Area */}
      <View style={styles.drawingArea}>
        <Svg width={width} height={height * 0.5} style={styles.svg}>
          {hasStarted && (
            <AnimatedPath
              animatedProps={animatedPathProps}
              stroke="#3B82F6"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
          )}
          {!hasStarted && (
            <Path
              d={`M ${startX} ${startY} Q ${controlX} ${controlY}, ${endX} ${endY}`}
              stroke="#D1D5DB"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="10,5"
              fill="none"
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
            <Text style={styles.waitingText}>Watch the curve draw...</Text>
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
