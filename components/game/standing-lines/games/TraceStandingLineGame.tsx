// Game 2: Trace the Standing Line
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakFeedback, stopAllAudio } from '../utils/audio';
import { LINE_PATTERNS } from '../utils/gameData';
import { isPointOnPath, Point } from '@/utils/pathUtils';

interface TraceStandingLineGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

export default function TraceStandingLineGame({ onComplete, onBack }: TraceStandingLineGameProps) {
  const { width, height } = useWindowDimensions();
  const CANVAS_WIDTH = width * 0.9;
  const CANVAS_HEIGHT = height * 0.5;
  const TOLERANCE = 40;

  const [round, setRound] = useState(0);
  const [currentPattern, setCurrentPattern] = useState(LINE_PATTERNS[0]);
  const [isTracing, setIsTracing] = useState(false);
  const [tracedPath, setTracedPath] = useState<Point[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const [score, setScore] = useState(0);
  const TOTAL_ROUNDS = 3;

  useEffect(() => {
    setCurrentPattern(LINE_PATTERNS[round % LINE_PATTERNS.length]);
    setTracedPath([]);
    setRoundComplete(false);
    setAccuracy(0);
    speakFeedback('Trace the standing line from top to bottom.');
    return () => stopAllAudio();
  }, [round]);

  const calculateAccuracy = (path: Point[]): number => {
    if (path.length === 0) return 0;
    let correctPoints = 0;
    const targetPath: Point[] = currentPattern.dots;

    path.forEach((point) => {
      if (isPointOnPath(point, targetPath, TOLERANCE)) {
        correctPoints++;
      }
    });

    return (correctPoints / path.length) * 100;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (roundComplete) return;
        const { locationX, locationY } = evt.nativeEvent;
        setIsTracing(true);
        setTracedPath([{ x: locationX, y: locationY }]);
        playSoundEffect('tracing');
      },
      onPanResponderMove: (evt) => {
        if (!isTracing || roundComplete) return;
        const { locationX, locationY } = evt.nativeEvent;
        setTracedPath((prev) => {
          const newPath = [...prev, { x: locationX, y: locationY }];
          const acc = calculateAccuracy(newPath);
          setAccuracy(acc);
          if (acc >= 80 && !roundComplete) {
            setRoundComplete(true);
            setScore((prev) => prev + 1);
            playSoundEffect('celebration');
            speakFeedback('Great tracing!');
          }
          return newPath;
        });
      },
      onPanResponderRelease: () => {
        setIsTracing(false);
        if (!roundComplete && tracedPath.length > 0) {
          const finalAcc = calculateAccuracy(tracedPath);
          setAccuracy(finalAcc);
          if (finalAcc >= 80) {
            setRoundComplete(true);
            setScore((prev) => prev + 1);
            playSoundEffect('celebration');
            speakFeedback('Great tracing!');
          } else {
            playSoundEffect('incorrect');
            speakFeedback('Try to trace closer to the line!');
          }
        }
      },
    })
  ).current;

  const pathToSvgString = (points: Point[]): string => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  };

  const handleNext = () => {
    if (round < TOTAL_ROUNDS - 1) {
      setRound((prev) => prev + 1);
    } else {
      const finalAccuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy: finalAccuracy,
        gameId: 'trace-standing-line',
      });
    }
  };

  // Scale pattern to canvas
  const scaleX = CANVAS_WIDTH / 400;
  const scaleY = CANVAS_HEIGHT / 500;
  const offsetX = (width - CANVAS_WIDTH) / 2;
  const offsetY = height * 0.2;

  const scaledDots = currentPattern.dots.map((dot) => ({
    x: dot.x * scaleX + offsetX,
    y: dot.y * scaleY + offsetY,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#93C5FD', '#FBCFE8', '#A7F3D0'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Trace the Standing Line</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Drawing Canvas */}
      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <Svg width={width} height={CANVAS_HEIGHT} style={styles.svg} pointerEvents="none">
          {/* Dotted line to trace */}
          {scaledDots.map((dot, idx) => (
            <Circle key={idx} cx={dot.x} cy={dot.y} r={6} fill="#D1D5DB" />
          ))}
          {/* Traced path */}
          {tracedPath.length > 0 && (
            <Path
              d={pathToSvgString(tracedPath)}
              stroke="#3B82F6"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
        </Svg>
        <Text style={styles.accuracyText}>Accuracy: {Math.round(accuracy)}%</Text>
        {roundComplete && <Text style={styles.successText}>Great job!</Text>}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable style={styles.nextButton} onPress={handleNext} disabled={!roundComplete}>
          <Text style={[styles.nextButtonText, !roundComplete && styles.nextButtonTextDisabled]}>
            {round < TOTAL_ROUNDS - 1 ? 'Next' : 'Finish'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={roundComplete ? '#fff' : '#9CA3AF'} />
        </Pressable>
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
  canvasContainer: {
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
  accuracyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
    marginTop: 16,
  },
  successText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 8,
  },
  controls: {
    padding: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
    opacity: 1,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  nextButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
