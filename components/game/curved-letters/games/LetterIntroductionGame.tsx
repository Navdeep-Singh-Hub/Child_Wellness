// Game 1: Letter Introduction
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
import { playSoundEffect, speakLetter, stopAllAudio } from '../utils/audio';
import { LETTER_C } from '../utils/gameData';

interface LetterIntroductionGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function LetterIntroductionGame({ onComplete, onBack }: LetterIntroductionGameProps) {
  const { width, height } = useWindowDimensions();
  const [hasStarted, setHasStarted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const pathProgress = useSharedValue(0);
  
  const CANVAS_WIDTH = width * 0.8;
  const CANVAS_HEIGHT = height * 0.5;
  const scaleX = CANVAS_WIDTH / 400;
  const scaleY = CANVAS_HEIGHT / 400;
  const offsetX = (width - CANVAS_WIDTH) / 2;
  const offsetY = height * 0.3;

  useEffect(() => {
    speakLetter('C');
    return () => stopAllAudio();
  }, []);

  useEffect(() => {
    if (hasStarted && !hasCompleted) {
      // Animate curved letter drawing
      pathProgress.value = withTiming(
        1,
        {
          duration: 2500,
          easing: Easing.out(Easing.ease),
        },
        () => {
          setHasCompleted(true);
          playSoundEffect('celebration');
          speakLetter('C');
        }
      );
    }
  }, [hasStarted]);

  const animatedPathProps = useAnimatedProps(() => {
    // Calculate path progress for curved letter C
    const t = pathProgress.value;
    const dots = LETTER_C.dots;
    const currentIndex = Math.floor(t * (dots.length - 1));
    const nextIndex = Math.min(currentIndex + 1, dots.length - 1);
    const localT = (t * (dots.length - 1)) % 1;
    
    const currentDot = dots[currentIndex];
    const nextDot = dots[nextIndex];
    
    const x = currentDot.x + (nextDot.x - currentDot.x) * localT;
    const y = currentDot.y + (nextDot.y - currentDot.y) * localT;
    
    // Build path up to current point
    let path = `M ${dots[0].x * scaleX + offsetX} ${dots[0].y * scaleY + offsetY}`;
    for (let i = 1; i <= currentIndex; i++) {
      path += ` L ${dots[i].x * scaleX + offsetX} ${dots[i].y * scaleY + offsetY}`;
    }
    if (localT > 0) {
      path += ` L ${x * scaleX + offsetX} ${y * scaleY + offsetY}`;
    }
    
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
      gameId: 'letter-introduction',
    });
  };

  const fullPath = LETTER_C.dots.map((dot, idx) => {
    if (idx === 0) return `M ${dot.x * scaleX + offsetX} ${dot.y * scaleY + offsetY}`;
    return `L ${dot.x * scaleX + offsetX} ${dot.y * scaleY + offsetY}`;
  }).join(' ');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#93C5FD', '#FBCFE8', '#A7F3D0'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Letter Introduction</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>This is the letter C</Text>
      </View>

      {/* Drawing Area */}
      <View style={styles.drawingArea}>
        <Svg width={width} height={CANVAS_HEIGHT} style={styles.svg}>
          {hasStarted && (
            <AnimatedPath
              animatedProps={animatedPathProps}
              stroke="#3B82F6"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
          )}
          {!hasStarted && (
            <Path
              d={fullPath}
              stroke="#D1D5DB"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="10,5"
              fill="none"
            />
          )}
        </Svg>
        {/* Large letter display */}
        <View style={styles.letterDisplay}>
          <Text style={styles.letterText}>C</Text>
        </View>
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
            <Text style={styles.waitingText}>Watch the letter draw...</Text>
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
  letterDisplay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterText: {
    fontSize: 200,
    fontWeight: '900',
    color: '#3B82F6',
    opacity: 0.2,
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
