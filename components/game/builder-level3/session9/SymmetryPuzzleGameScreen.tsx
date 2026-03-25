// Game 4: Symmetry Puzzle - Complete mirrored half
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../builder/utils/audio';
import { SYMMETRY_PUZZLES } from './gameData';

interface SymmetryPuzzleGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

interface Point {
  x: number;
  y: number;
}

export default function SymmetryPuzzleGameScreen({ onComplete, onBack }: SymmetryPuzzleGameScreenProps) {
  const { width, height } = useWindowDimensions();
  const CANVAS_WIDTH = width - 40;
  const CANVAS_HEIGHT = height * 0.5;
  const CENTER_X = CANVAS_WIDTH / 2;

  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [drawingPath, setDrawingPath] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completedPuzzles, setCompletedPuzzles] = useState(0);

  const currentPuzzle = SYMMETRY_PUZZLES[currentPuzzleIndex];

  // Refs to avoid closure issues
  const isDrawingRef = React.useRef(false);
  const completedRef = React.useRef(false);
  const drawingPathRef = React.useRef<Point[]>([]);
  const currentPuzzleIndexRef = React.useRef(0);
  
  React.useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);
  
  React.useEffect(() => {
    completedRef.current = completed;
  }, [completed]);
  
  React.useEffect(() => {
    drawingPathRef.current = drawingPath;
  }, [drawingPath]);
  
  React.useEffect(() => {
    currentPuzzleIndexRef.current = currentPuzzleIndex;
  }, [currentPuzzleIndex]);

  useEffect(() => {
    speakInstruction('Complete the mirrored half on the right side.').catch(() => {});
    return () => stopAllAudio();
  }, [currentPuzzleIndex]);

  const panResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (evt) => {
      evt.preventDefault?.();
      if (completedRef.current) return;
      const { locationX, locationY } = evt.nativeEvent;
      // Only allow drawing on the right half
      if (locationX > CENTER_X && locationX < CANVAS_WIDTH) {
        isDrawingRef.current = true;
        setIsDrawing(true);
        const newPath = [{ x: locationX, y: locationY }];
        drawingPathRef.current = newPath;
        setDrawingPath(newPath);
        playSoundEffect('click');
      }
    },
    onPanResponderMove: (evt) => {
      evt.preventDefault?.();
      if (!isDrawingRef.current || completedRef.current) return;
      const { locationX, locationY } = evt.nativeEvent;
      // Only allow drawing on the right half
      if (locationX > CENTER_X && locationX < CANVAS_WIDTH) {
        const newPath = [...drawingPathRef.current, { x: locationX, y: locationY }];
        drawingPathRef.current = newPath;
        setDrawingPath(newPath);
      }
    },
    onPanResponderRelease: async () => {
      if (!isDrawingRef.current || completedRef.current) return;
      isDrawingRef.current = false;
      setIsDrawing(false);
      
      const currentPath = drawingPathRef.current;
      
      // Simple check: if path has enough points, consider it drawn
      if (currentPath.length > 10) {
        await playSoundEffect('correct');
        await speakFeedback('Perfect! You completed the mirror!');
        
        setCompletedPuzzles((prev) => {
          const newCount = prev + 1;
          if (newCount >= SYMMETRY_PUZZLES.length) {
            setTimeout(() => {
              setCompleted(true);
              playSoundEffect('celebration');
              speakFeedback('Excellent! You completed all symmetry puzzles!');
              setTimeout(() => {
                onComplete();
              }, 2000);
            }, 1000);
          } else {
            setTimeout(() => {
              setCurrentPuzzleIndex(newCount);
              setDrawingPath([]);
              drawingPathRef.current = [];
            }, 1500);
          }
          return newCount;
        });
      } else {
        await playSoundEffect('incorrect');
        await speakFeedback('Try drawing more!');
        setTimeout(() => {
          setDrawingPath([]);
          drawingPathRef.current = [];
        }, 1000);
      }
    },
  }), [CENTER_X, CANVAS_WIDTH, onComplete]);

  const pathString = drawingPath.length > 0
    ? drawingPath.reduce((acc, point, index) => {
        return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
      }, '')
    : '';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Symmetry Puzzle</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Puzzle {currentPuzzleIndex + 1} of {SYMMETRY_PUZZLES.length}
        </Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Complete the mirrored half</Text>
        <Text style={styles.instructionSubtext}>Draw on the right side to match the left</Text>
      </View>

      {/* Drawing Canvas */}
      <View style={styles.canvasContainer}>
        <View style={styles.canvasWrapper} {...panResponder.panHandlers}>
          <View style={styles.canvas}>
            {/* Left Half - Reference */}
            <View style={[styles.halfCanvas, styles.leftHalf]}>
              <Text style={styles.halfLabel}>Left Side</Text>
              <View style={styles.shapeDisplay}>
                <Text style={styles.shapeEmoji}>{currentPuzzle.halfEmoji}</Text>
              </View>
            </View>

            {/* Center Line */}
            <View style={styles.centerLine}>
              <View style={styles.line} />
            </View>

            {/* Right Half - Drawing Area */}
            <View style={[styles.halfCanvas, styles.rightHalf]}>
              <Text style={styles.halfLabel}>Right Side - Draw Here</Text>
              <View style={styles.drawingArea}>
                <Svg width={CANVAS_WIDTH / 2} height={CANVAS_HEIGHT * 0.6} style={styles.svg}>
                  <Path
                    d={pathString}
                    stroke="#6C9EFF"
                    strokeWidth={4}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                {drawingPath.length === 0 && (
                  <Text style={styles.drawHint}>Draw here to complete the mirror</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Clear Button */}
      {drawingPath.length > 0 && !completed && (
        <Animated.View entering={FadeInDown.delay(200)} style={styles.clearContainer}>
          <Pressable
            onPress={() => setDrawingPath([])}
            style={styles.clearButton}
          >
            <LinearGradient
              colors={['#FFB6C1', '#FF9EC4']}
              style={styles.clearButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.clearButtonText}>Clear</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  instructionSubtext: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
  },
  canvasContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  canvasWrapper: {
    flex: 1,
  },
  canvas: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  halfCanvas: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftHalf: {
    backgroundColor: '#F0F4FF',
  },
  rightHalf: {
    backgroundColor: '#FEF3F8',
  },
  halfLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  shapeDisplay: {
    width: 120,
    height: 120,
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
  shapeEmoji: {
    fontSize: 64,
  },
  centerLine: {
    width: 4,
    backgroundColor: '#6C9EFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    width: 4,
    height: '100%',
    backgroundColor: '#6C9EFF',
  },
  drawingArea: {
    width: '100%',
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  drawHint: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
  },
  clearContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  clearButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  clearButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
