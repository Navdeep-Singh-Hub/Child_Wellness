// Game 4: Sorting Puzzle
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../utils/audio';
import { SORT_ITEMS } from '../utils/gameData';

interface DraggableItemState {
  id: string;
  type: 'letter' | 'number';
  value: string;
  x: number;
  y: number;
  isDragging: boolean;
  inBox: 'letters' | 'numbers' | null;
}

interface SortingPuzzleGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

export default function SortingPuzzleGame({ onComplete, onBack }: SortingPuzzleGameProps) {
  const { width, height } = useWindowDimensions();
  const LETTERS_BOX_X = width * 0.1;
  const LETTERS_BOX_Y = height * 0.3;
  const NUMBERS_BOX_X = width * 0.6;
  const NUMBERS_BOX_Y = height * 0.3;
  const BOX_WIDTH = width * 0.3;
  const BOX_HEIGHT = height * 0.4;

  const [items, setItems] = useState<DraggableItemState[]>(
    SORT_ITEMS.map((item, idx) => ({
      ...item,
      x: (idx % 3) * (width / 4) + width * 0.1,
      y: Math.floor(idx / 3) * 100 + height * 0.7,
      isDragging: false,
      inBox: null,
    }))
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const TOTAL_ROUNDS = 3;

  useEffect(() => {
    // Reset for new round
    setItems(
      SORT_ITEMS.map((item, idx) => ({
        ...item,
        x: (idx % 3) * (width / 4) + width * 0.1,
        y: Math.floor(idx / 3) * 100 + height * 0.7,
        isDragging: false,
        inBox: null,
      }))
    );
    setDraggedId(null);
    speakInstruction('Drag letters to the letters box and numbers to the numbers box.');
    return () => stopAllAudio();
  }, [round]);

  const isPointInBox = (x: number, y: number, boxX: number, boxY: number): boolean => {
    return x >= boxX && x <= boxX + BOX_WIDTH && y >= boxY && y <= boxY + BOX_HEIGHT;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      const { locationX, locationY } = evt.nativeEvent;
      const item = items.find((i) => {
        const dist = Math.sqrt(Math.pow(locationX - i.x, 2) + Math.pow(locationY - i.y, 2));
        return dist < 60;
      });
      if (item && !item.inBox) {
        setDraggedId(item.id);
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isDragging: true } : i))
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
      setItems((prev) =>
        prev.map((i) => {
          if (i.id === draggedId) {
            const inLettersBox = isPointInBox(locationX, locationY, LETTERS_BOX_X, LETTERS_BOX_Y);
            const inNumbersBox = isPointInBox(locationX, locationY, NUMBERS_BOX_X, NUMBERS_BOX_Y);
            return {
              ...i,
              x: locationX,
              y: locationY,
              inBox: inLettersBox ? 'letters' : inNumbersBox ? 'numbers' : null,
            };
          }
          return i;
        })
      );
    },
    onPanResponderRelease: () => {
      if (!draggedId) return;
      const item = items.find((i) => i.id === draggedId);
      if (item) {
        const isCorrect =
          (item.type === 'letter' && item.inBox === 'letters') ||
          (item.type === 'number' && item.inBox === 'numbers');

        if (isCorrect && item.inBox) {
          setScore((prev) => prev + 1);
          playSoundEffect('correct');
          speakFeedback(`Correct! ${item.value} is a ${item.type}!`);
          
          setItems((prev) =>
            prev.map((i) =>
              i.id === draggedId ? { ...i, isDragging: false } : i
            )
          );
          
          // Check if all items sorted
          const allSorted = items.every((i) => 
            i.id === draggedId || 
            (i.type === 'letter' && i.inBox === 'letters') ||
            (i.type === 'number' && i.inBox === 'numbers')
          );
          
          if (allSorted) {
            setTimeout(() => {
              if (round < TOTAL_ROUNDS - 1) {
                setRound((prev) => prev + 1);
              } else {
                const accuracy = (score / (SORT_ITEMS.length * TOTAL_ROUNDS)) * 100;
                onComplete({
                  correct: score,
                  total: SORT_ITEMS.length * TOTAL_ROUNDS,
                  accuracy,
                  gameId: 'sorting-puzzle',
                });
              }
            }, 2000);
          }
        } else {
          playSoundEffect('incorrect');
          speakFeedback(`Try again! ${item.value} should go in the ${item.type === 'letter' ? 'letters' : 'numbers'} box.`);
          
          // Move item back
          const originalIndex = SORT_ITEMS.findIndex((si) => si.id === item.id);
          setItems((prev) =>
            prev.map((i) =>
              i.id === draggedId
                ? {
                    ...i,
                    x: (originalIndex % 3) * (width / 4) + width * 0.1,
                    y: Math.floor(originalIndex / 3) * 100 + height * 0.7,
                    isDragging: false,
                    inBox: null,
                  }
                : i
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
      const accuracy = (score / (SORT_ITEMS.length * TOTAL_ROUNDS)) * 100;
      onComplete({
        correct: score,
        total: SORT_ITEMS.length * TOTAL_ROUNDS,
        accuracy,
        gameId: 'sorting-puzzle',
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
        <Text style={styles.title}>Sorting Puzzle</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Sort letters and numbers</Text>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea} {...panResponder.panHandlers}>
        {/* Boxes */}
        <View
          style={[
            styles.box,
            {
              left: LETTERS_BOX_X,
              top: LETTERS_BOX_Y,
              width: BOX_WIDTH,
              height: BOX_HEIGHT,
              borderColor: '#3B82F6',
            },
          ]}
        >
          <Text style={styles.boxLabel}>Letters</Text>
        </View>
        <View
          style={[
            styles.box,
            {
              left: NUMBERS_BOX_X,
              top: NUMBERS_BOX_Y,
              width: BOX_WIDTH,
              height: BOX_HEIGHT,
              borderColor: '#10B981',
            },
          ]}
        >
          <Text style={styles.boxLabel}>Numbers</Text>
        </View>

        {/* Items */}
        {items.map((item) => (
          <View
            key={item.id}
            style={[
              styles.itemCard,
              {
                left: item.x - 40,
                top: item.y - 40,
                backgroundColor: item.type === 'letter' ? '#3B82F6' : '#10B981',
                opacity: item.inBox ? 0.5 : 1,
              },
            ]}
          >
            <Text style={styles.itemText}>{item.value}</Text>
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
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  box: {
    position: 'absolute',
    borderWidth: 4,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  itemCard: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  itemText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
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
