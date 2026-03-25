// Game 4: Shape Match - Triangle Objects
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../utils/audio';
import { TRIANGLE_OBJECTS } from '../utils/gameData';

interface ObjectState {
  id: string;
  name: string;
  emoji: string;
  isTriangle: boolean;
  x: number;
  y: number;
  isDragging: boolean;
  inBox: boolean;
}

interface ShapeMatchGameScreenProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

export default function ShapeMatchGameScreen({ onComplete, onBack }: ShapeMatchGameScreenProps) {
  const { width, height } = useWindowDimensions();
  const BOX_X = width * 0.1;
  const BOX_Y = height * 0.3;
  const BOX_WIDTH = width * 0.8;
  const BOX_HEIGHT = height * 0.4;

  const [objects, setObjects] = useState<ObjectState[]>(
    TRIANGLE_OBJECTS.map((obj, idx) => ({
      ...obj,
      x: (idx % 2) * (width / 3) + width * 0.2,
      y: Math.floor(idx / 2) * 120 + height * 0.7,
      isDragging: false,
      inBox: false,
    }))
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const TOTAL_ROUNDS = 3;

  useEffect(() => {
    // Reset for new round
    setObjects(
      TRIANGLE_OBJECTS.map((obj, idx) => ({
        ...obj,
        x: (idx % 2) * (width / 3) + width * 0.2,
        y: Math.floor(idx / 2) * 120 + height * 0.7,
        isDragging: false,
        inBox: false,
      }))
    );
    setDraggedId(null);
    speakInstruction('Drag triangle objects into the triangle box.');
    return () => stopAllAudio();
  }, [round]);

  const isPointInBox = (x: number, y: number): boolean => {
    return x >= BOX_X && x <= BOX_X + BOX_WIDTH && y >= BOX_Y && y <= BOX_Y + BOX_HEIGHT;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      const { locationX, locationY } = evt.nativeEvent;
      const obj = objects.find((o) => {
        const dist = Math.sqrt(Math.pow(locationX - o.x, 2) + Math.pow(locationY - o.y, 2));
        return dist < 80;
      });
      if (obj && !obj.inBox) {
        setDraggedId(obj.id);
        setObjects((prev) =>
          prev.map((o) => (o.id === obj.id ? { ...o, isDragging: true } : o))
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
      setObjects((prev) =>
        prev.map((o) => {
          if (o.id === draggedId) {
            const inBox = isPointInBox(locationX, locationY);
            return { ...o, x: locationX, y: locationY, inBox };
          }
          return o;
        })
      );
    },
    onPanResponderRelease: () => {
      if (!draggedId) return;
      const obj = objects.find((o) => o.id === draggedId);
      if (obj) {
        const isCorrect = obj.isTriangle && obj.inBox;
        
        if (isCorrect) {
          setScore((prev) => prev + 1);
          playSoundEffect('correct');
          speakFeedback(`Great! ${obj.name} is a triangle!`);
          
          setObjects((prev) =>
            prev.map((o) =>
              o.id === draggedId ? { ...o, isDragging: false } : o
            )
          );
          
          // Check if all triangles are in box
          const allTrianglesInBox = objects.every((o) => 
            o.id === draggedId || 
            (o.isTriangle && o.inBox) ||
            !o.isTriangle
          );
          
          if (allTrianglesInBox) {
            setTimeout(() => {
              if (round < TOTAL_ROUNDS - 1) {
                setRound((prev) => prev + 1);
              } else {
                const accuracy = (score / (TRIANGLE_OBJECTS.filter((o) => o.isTriangle).length * TOTAL_ROUNDS)) * 100;
                onComplete({
                  correct: score,
                  total: TRIANGLE_OBJECTS.filter((o) => o.isTriangle).length * TOTAL_ROUNDS,
                  accuracy,
                  gameId: 'shape-match',
                });
              }
            }, 2000);
          }
        } else if (obj.inBox && !obj.isTriangle) {
          playSoundEffect('incorrect');
          speakFeedback(`${obj.name} is not a triangle. Try again!`);
          
          // Move back
          const originalIndex = TRIANGLE_OBJECTS.findIndex((o) => o.id === obj.id);
          setObjects((prev) =>
            prev.map((o) =>
              o.id === draggedId
                ? {
                    ...o,
                    x: (originalIndex % 2) * (width / 3) + width * 0.2,
                    y: Math.floor(originalIndex / 2) * 120 + height * 0.7,
                    isDragging: false,
                    inBox: false,
                  }
                : o
            )
          );
        } else {
          // Not in box, move back
          const originalIndex = TRIANGLE_OBJECTS.findIndex((o) => o.id === obj.id);
          setObjects((prev) =>
            prev.map((o) =>
              o.id === draggedId
                ? {
                    ...o,
                    x: (originalIndex % 2) * (width / 3) + width * 0.2,
                    y: Math.floor(originalIndex / 2) * 120 + height * 0.7,
                    isDragging: false,
                    inBox: false,
                  }
                : o
            )
          );
        }
      }
      setDraggedId(null);
    },
  });

  const handleNext = () => {
    if (round < TOTAL_ROUNDS - 1) {
      setRound((prev) => prev + 1);
    } else {
      const accuracy = (score / (TRIANGLE_OBJECTS.filter((o) => o.isTriangle).length * TOTAL_ROUNDS)) * 100;
      onComplete({
        correct: score,
        total: TRIANGLE_OBJECTS.filter((o) => o.isTriangle).length * TOTAL_ROUNDS,
        accuracy,
        gameId: 'shape-match',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#6C9EFF', '#FFB6C1', '#7FE7CC'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Shape Match</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Drag triangle objects into the triangle box</Text>
      </View>

      {/* Triangle Box */}
      <View style={styles.gameArea} {...panResponder.panHandlers}>
        <View
          style={[
            styles.triangleBox,
            {
              left: BOX_X,
              top: BOX_Y,
              width: BOX_WIDTH,
              height: BOX_HEIGHT,
            },
          ]}
        >
          <Text style={styles.boxLabel}>Triangle Objects</Text>
          <View style={styles.boxContent}>
            {objects.filter((o) => o.inBox && o.isTriangle).map((obj) => (
              <Text key={obj.id} style={styles.boxEmoji}>
                {obj.emoji}
              </Text>
            ))}
          </View>
        </View>

        {/* Objects */}
        {objects.filter((o) => !o.inBox).map((obj) => (
          <View
            key={obj.id}
            style={[
              styles.objectCard,
              {
                left: obj.x - 50,
                top: obj.y - 50,
              },
            ]}
          >
            <Text style={styles.objectEmoji}>{obj.emoji}</Text>
            <Text style={styles.objectName}>{obj.name}</Text>
          </View>
        ))}
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
    position: 'relative',
  },
  triangleBox: {
    position: 'absolute',
    backgroundColor: '#ECFDF5',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#10B981',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  boxLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 16,
  },
  boxContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  boxEmoji: {
    fontSize: 64,
  },
  objectCard: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#6C9EFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  objectEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  objectName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  controls: {
    padding: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7FE7CC',
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
