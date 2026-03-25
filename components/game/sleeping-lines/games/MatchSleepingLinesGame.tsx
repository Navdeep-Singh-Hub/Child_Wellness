// Game 4: Match the Sleeping Lines
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakFeedback, stopAllAudio } from '../utils/audio';
import { DRAGGABLE_LINES } from '../utils/gameData';

interface DraggableLineState {
  id: string;
  type: 'horizontal' | 'vertical' | 'diagonal';
  x: number;
  y: number;
  angle: number;
  isDragging: boolean;
  inBox: boolean;
}

interface MatchSleepingLinesGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

export default function MatchSleepingLinesGame({ onComplete, onBack }: MatchSleepingLinesGameProps) {
  const { width, height } = useWindowDimensions();
  const BOX_X = width * 0.7;
  const BOX_Y = height * 0.6;
  const BOX_WIDTH = width * 0.25;
  const BOX_HEIGHT = height * 0.3;

  const [lines, setLines] = useState<DraggableLineState[]>(
    DRAGGABLE_LINES.map((line) => ({
      ...line,
      isDragging: false,
      inBox: false,
    }))
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const TOTAL_ROUNDS = 3;

  useEffect(() => {
    // Reset lines for new round
    setLines(
      DRAGGABLE_LINES.map((line) => ({
        ...line,
        x: line.x % width,
        y: line.y % (height * 0.4) + height * 0.1,
        isDragging: false,
        inBox: false,
      }))
    );
    setDraggedId(null);
    speakFeedback('Drag the sleeping lines into the box.');
    return () => stopAllAudio();
  }, [round]);

  const isPointInBox = (x: number, y: number): boolean => {
    return x >= BOX_X && x <= BOX_X + BOX_WIDTH && y >= BOX_Y && y <= BOX_Y + BOX_HEIGHT;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      const { locationX, locationY } = evt.nativeEvent;
      // Check if touch started on a line
      const line = lines.find((l) => {
        const dist = Math.sqrt(Math.pow(locationX - l.x, 2) + Math.pow(locationY - l.y, 2));
        return dist < 50; // Touch tolerance
      });
      if (line) {
        setDraggedId(line.id);
        setLines((prev) =>
          prev.map((l) => (l.id === line.id ? { ...l, isDragging: true } : l))
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
      setLines((prev) =>
        prev.map((l) => {
          if (l.id === draggedId) {
            const inBox = isPointInBox(locationX, locationY);
            return { ...l, x: locationX, y: locationY, inBox };
          }
          return l;
        })
      );
    },
    onPanResponderRelease: () => {
      if (!draggedId) return;
      const line = lines.find((l) => l.id === draggedId);
      if (line) {
        const isHorizontal = line.type === 'horizontal';
        const inBox = line.inBox;

        if (inBox && isHorizontal) {
          setScore((prev) => prev + 1);
          playSoundEffect('correct');
          speakFeedback('Great! That is a sleeping line!');
        } else if (inBox && !isHorizontal) {
          playSoundEffect('incorrect');
          speakFeedback('That is not a sleeping line. Try again!');
          // Move line back
          setLines((prev) =>
            prev.map((l) =>
              l.id === draggedId
                ? { ...l, x: DRAGGABLE_LINES.find((dl) => dl.id === l.id)!.x, y: DRAGGABLE_LINES.find((dl) => dl.id === l.id)!.y, isDragging: false, inBox: false }
                : l
            )
          );
        } else {
          // Not in box, move back
          setLines((prev) =>
            prev.map((l) =>
              l.id === draggedId
                ? { ...l, x: DRAGGABLE_LINES.find((dl) => dl.id === l.id)!.x, y: DRAGGABLE_LINES.find((dl) => dl.id === l.id)!.y, isDragging: false, inBox: false }
                : l
            )
          );
        }
      }
      setDraggedId(null);
      setLines((prev) => prev.map((l) => ({ ...l, isDragging: false })));

      // Check if all horizontal lines are in box
      const horizontalLines = lines.filter((l) => l.type === 'horizontal');
      const horizontalInBox = lines.filter((l) => l.type === 'horizontal' && l.inBox);
      if (horizontalInBox.length === horizontalLines.length && horizontalLines.length > 0) {
        setTimeout(() => {
          if (round < TOTAL_ROUNDS - 1) {
            setRound((prev) => prev + 1);
          } else {
            const accuracy = (score / TOTAL_ROUNDS) * 100;
            onComplete({
              correct: score,
              total: TOTAL_ROUNDS,
              accuracy,
              gameId: 'match-sleeping-lines',
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
        gameId: 'match-sleeping-lines',
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
        <Text style={styles.title}>Match the Sleeping Lines</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Drag sleeping lines into the box</Text>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea} {...panResponder.panHandlers}>
        <Svg width={width} height={height * 0.6} style={styles.svg} pointerEvents="none">
          {/* Lines */}
          {lines.map((line) => {
            const isHorizontal = line.type === 'horizontal';
            const startX = line.x;
            const startY = line.y;
            let endX = startX + 100;
            let endY = startY;

            if (line.type === 'vertical') {
              endX = startX;
              endY = startY + 100;
            } else if (line.type === 'diagonal') {
              endX = startX + (line.angle > 0 ? 100 : -100);
              endY = startY + 100;
            }

            return (
              <Line
                key={line.id}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={isHorizontal ? '#3B82F6' : '#9CA3AF'}
                strokeWidth="6"
                strokeLinecap="round"
                opacity={line.inBox && isHorizontal ? 0.5 : 1}
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
          <Text style={styles.boxLabelText}>Sleeping Lines</Text>
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
