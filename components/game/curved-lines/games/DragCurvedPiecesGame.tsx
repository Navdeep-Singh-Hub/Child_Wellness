// Game 4: Drag Curved Pieces
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakFeedback, stopAllAudio } from '../utils/audio';
import { DRAGGABLE_SHAPES } from '../utils/gameData';

interface DraggableShapeState {
  id: string;
  type: 'curved' | 'straight';
  x: number;
  y: number;
  svgPath: string;
  isDragging: boolean;
  inBox: boolean;
}

interface DragCurvedPiecesGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

export default function DragCurvedPiecesGame({ onComplete, onBack }: DragCurvedPiecesGameProps) {
  const { width, height } = useWindowDimensions();
  const BOX_X = width * 0.7;
  const BOX_Y = height * 0.6;
  const BOX_WIDTH = width * 0.25;
  const BOX_HEIGHT = height * 0.3;

  const [shapes, setShapes] = useState<DraggableShapeState[]>(
    DRAGGABLE_SHAPES.map((shape) => ({
      ...shape,
      isDragging: false,
      inBox: false,
    }))
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const TOTAL_ROUNDS = 3;

  useEffect(() => {
    // Reset shapes for new round
    setShapes(
      DRAGGABLE_SHAPES.map((shape) => ({
        ...shape,
        x: shape.x % width,
        y: shape.y % (height * 0.4) + height * 0.1,
        isDragging: false,
        inBox: false,
      }))
    );
    setDraggedId(null);
    speakFeedback('Drag the curved shapes into the box.');
    return () => stopAllAudio();
  }, [round]);

  const isPointInBox = (x: number, y: number): boolean => {
    return x >= BOX_X && x <= BOX_X + BOX_WIDTH && y >= BOX_Y && y <= BOX_Y + BOX_HEIGHT;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      const { locationX, locationY } = evt.nativeEvent;
      // Check if touch started on a shape
      const shape = shapes.find((s) => {
        const dist = Math.sqrt(Math.pow(locationX - s.x, 2) + Math.pow(locationY - s.y, 2));
        return dist < 60; // Touch tolerance
      });
      if (shape) {
        setDraggedId(shape.id);
        setShapes((prev) =>
          prev.map((s) => (s.id === shape.id ? { ...s, isDragging: true } : s))
        );
        playSoundEffect('click');
        return true;
      }
      return false;
    },
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt) => {
      if (!draggedId) return;
      const { locationX, locationY } = evt.nativeEvent;
      setShapes((prev) =>
        prev.map((s) => {
          if (s.id === draggedId) {
            const inBox = isPointInBox(locationX, locationY);
            return { ...s, x: locationX, y: locationY, inBox };
          }
          return s;
        })
      );
    },
    onPanResponderRelease: () => {
      if (!draggedId) return;
      const shape = shapes.find((s) => s.id === draggedId);
      if (shape) {
        const isCurved = shape.type === 'curved';
        const inBox = shape.inBox;

        if (inBox && isCurved) {
          setScore((prev) => prev + 1);
          playSoundEffect('correct');
          speakFeedback('Great! That is a curved line!');
        } else if (inBox && !isCurved) {
          playSoundEffect('incorrect');
          speakFeedback('That is not a curved line. Try again!');
          // Move shape back
          setShapes((prev) =>
            prev.map((s) =>
              s.id === draggedId
                ? { ...s, x: DRAGGABLE_SHAPES.find((ds) => ds.id === s.id)!.x, y: DRAGGABLE_SHAPES.find((ds) => ds.id === s.id)!.y, isDragging: false, inBox: false }
                : s
            )
          );
        } else {
          // Not in box, move back
          setShapes((prev) =>
            prev.map((s) =>
              s.id === draggedId
                ? { ...s, x: DRAGGABLE_SHAPES.find((ds) => ds.id === s.id)!.x, y: DRAGGABLE_SHAPES.find((ds) => ds.id === s.id)!.y, isDragging: false, inBox: false }
                : s
            )
          );
        }
      }
      setDraggedId(null);
      setShapes((prev) => prev.map((s) => ({ ...s, isDragging: false })));

      // Check if all curved shapes are in box
      const curvedShapes = shapes.filter((s) => s.type === 'curved');
      const curvedInBox = shapes.filter((s) => s.type === 'curved' && s.inBox);
      if (curvedInBox.length === curvedShapes.length && curvedShapes.length > 0) {
        setTimeout(() => {
          if (round < TOTAL_ROUNDS - 1) {
            setRound((prev) => prev + 1);
          } else {
            const accuracy = (score / TOTAL_ROUNDS) * 100;
            onComplete({
              correct: score,
              total: TOTAL_ROUNDS,
              accuracy,
              gameId: 'drag-curved-pieces',
            });
          }
        }, 2000);
      }
    },
  });

  const handleNext = () => {
    if (round < TOTAL_ROUNDS - 1) {
      setRound((prev) => prev + 1);
    } else {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'drag-curved-pieces',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#93C5FD', '#FBCFE8', '#A7F3D0'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Drag Curved Pieces</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Drag curved shapes into the box</Text>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea} {...panResponder.panHandlers}>
        <Svg width={width} height={height * 0.6} style={styles.svg} pointerEvents="none">
          {/* Shapes */}
          {shapes.map((shape) => {
            const isCurved = shape.type === 'curved';
            // Adjust path coordinates relative to shape position
            const pathData = shape.svgPath.replace(/M (\d+) (\d+)/, `M ${shape.x} ${shape.y}`);
            
            return (
              <Path
                key={shape.id}
                d={pathData}
                stroke={isCurved ? '#3B82F6' : '#9CA3AF'}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                opacity={shape.inBox && isCurved ? 0.5 : 1}
              />
            );
          })}

          {/* Box */}
          <Line
            x1={BOX_X}
            y1={BOX_Y}
            x2={BOX_X + BOX_WIDTH}
            y2={BOX_Y}
            stroke="#10B981"
            strokeWidth="4"
            strokeDasharray="10,5"
          />
          <Line
            x1={BOX_X + BOX_WIDTH}
            y1={BOX_Y}
            x2={BOX_X + BOX_WIDTH}
            y2={BOX_Y + BOX_HEIGHT}
            stroke="#10B981"
            strokeWidth="4"
            strokeDasharray="10,5"
          />
          <Line
            x1={BOX_X + BOX_WIDTH}
            y1={BOX_Y + BOX_HEIGHT}
            x2={BOX_X}
            y2={BOX_Y + BOX_HEIGHT}
            stroke="#10B981"
            strokeWidth="4"
            strokeDasharray="10,5"
          />
          <Line
            x1={BOX_X}
            y1={BOX_Y + BOX_HEIGHT}
            x2={BOX_X}
            y2={BOX_Y}
            stroke="#10B981"
            strokeWidth="4"
            strokeDasharray="10,5"
          />
        </Svg>
        <View style={[styles.boxLabel, { left: BOX_X, top: BOX_Y - 30 }]}>
          <Text style={styles.boxLabelText}>Curved Lines</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  gameArea: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 24,
    overflow: 'hidden',
  },
  svg: {
    flex: 1,
  },
  boxLabel: {
    position: 'absolute',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  boxLabelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
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
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
