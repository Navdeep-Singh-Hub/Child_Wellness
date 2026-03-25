// Game 4: Match Curved Letters
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../utils/audio';
import { DRAGGABLE_LETTERS } from '../utils/gameData';

interface DraggableLetterState {
  id: string;
  letter: string;
  isCurved: boolean;
  x: number;
  y: number;
  svgPath: string;
  isDragging: boolean;
  inBox: boolean;
}

interface MatchCurvedLettersGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

export default function MatchCurvedLettersGame({ onComplete, onBack }: MatchCurvedLettersGameProps) {
  const { width, height } = useWindowDimensions();
  const BOX_X = width * 0.7;
  const BOX_Y = height * 0.6;
  const BOX_WIDTH = width * 0.25;
  const BOX_HEIGHT = height * 0.3;

  const [letters, setLetters] = useState<DraggableLetterState[]>(
    DRAGGABLE_LETTERS.map((letterOption, idx) => ({
      id: `letter-${idx}`,
      letter: letterOption.letter,
      isCurved: letterOption.data.isCurved,
      x: (idx % 3) * (width / 4) + width * 0.1,
      y: Math.floor(idx / 3) * 120 + height * 0.15,
      svgPath: letterOption.data.svgPath,
      isDragging: false,
      inBox: false,
    }))
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const TOTAL_ROUNDS = 3;

  useEffect(() => {
    // Reset letters for new round
    setLetters(
      DRAGGABLE_LETTERS.map((letterOption, idx) => ({
        id: `letter-${idx}`,
        letter: letterOption.letter,
        isCurved: letterOption.data.isCurved,
        x: (idx % 3) * (width / 4) + width * 0.1,
        y: Math.floor(idx / 3) * 120 + height * 0.15,
        svgPath: letterOption.data.svgPath,
        isDragging: false,
        inBox: false,
      }))
    );
    setDraggedId(null);
    speakInstruction('Drag the curved letters into the box.');
    return () => stopAllAudio();
  }, [round]);

  const isPointInBox = (x: number, y: number): boolean => {
    return x >= BOX_X && x <= BOX_X + BOX_WIDTH && y >= BOX_Y && y <= BOX_Y + BOX_HEIGHT;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      const { locationX, locationY } = evt.nativeEvent;
      // Check if touch started on a letter
      const letter = letters.find((l) => {
        const dist = Math.sqrt(Math.pow(locationX - l.x, 2) + Math.pow(locationY - l.y, 2));
        return dist < 80; // Touch tolerance
      });
      if (letter) {
        setDraggedId(letter.id);
        setLetters((prev) =>
          prev.map((l) => (l.id === letter.id ? { ...l, isDragging: true } : l))
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
      setLetters((prev) =>
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
      const letter = letters.find((l) => l.id === draggedId);
      if (letter) {
        const isCurved = letter.isCurved;
        const inBox = letter.inBox;

        if (inBox && isCurved) {
          setScore((prev) => prev + 1);
          playSoundEffect('correct');
          speakFeedback(`Great! The letter ${letter.letter} is curved!`);
        } else if (inBox && !isCurved) {
          playSoundEffect('incorrect');
          speakFeedback('That is not a curved letter. Try again!');
          // Move letter back
          const originalIndex = DRAGGABLE_LETTERS.findIndex((l) => l.letter === letter.letter);
          setLetters((prev) =>
            prev.map((l) =>
              l.id === draggedId
                ? {
                    ...l,
                    x: (originalIndex % 3) * (width / 4) + width * 0.1,
                    y: Math.floor(originalIndex / 3) * 120 + height * 0.15,
                    isDragging: false,
                    inBox: false,
                  }
                : l
            )
          );
        } else {
          // Not in box, move back
          const originalIndex = DRAGGABLE_LETTERS.findIndex((l) => l.letter === letter.letter);
          setLetters((prev) =>
            prev.map((l) =>
              l.id === draggedId
                ? {
                    ...l,
                    x: (originalIndex % 3) * (width / 4) + width * 0.1,
                    y: Math.floor(originalIndex / 3) * 120 + height * 0.15,
                    isDragging: false,
                    inBox: false,
                  }
                : l
            )
          );
        }
      }
      setDraggedId(null);
      setLetters((prev) => prev.map((l) => ({ ...l, isDragging: false })));

      // Check if all curved letters are in box
      const curvedLetters = letters.filter((l) => l.isCurved);
      const curvedInBox = letters.filter((l) => l.isCurved && l.inBox);
      if (curvedInBox.length === curvedLetters.length && curvedLetters.length > 0) {
        setTimeout(() => {
          if (round < TOTAL_ROUNDS - 1) {
            setRound((prev) => prev + 1);
          } else {
            const accuracy = (score / TOTAL_ROUNDS) * 100;
            onComplete({
              correct: score,
              total: TOTAL_ROUNDS,
              accuracy,
              gameId: 'match-curved-letters',
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
        gameId: 'match-curved-letters',
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
        <Text style={styles.title}>Match Curved Letters</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Drag curved letters into the box</Text>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea} {...panResponder.panHandlers}>
        {/* Letters */}
        {letters.map((letter) => (
          <View
            key={letter.id}
            style={[
              styles.letterContainer,
              {
                left: letter.x - 40,
                top: letter.y - 40,
                opacity: letter.inBox && letter.isCurved ? 0.5 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.letterText,
                { color: letter.isCurved ? '#3B82F6' : '#9CA3AF' },
              ]}
            >
              {letter.letter}
            </Text>
          </View>
        ))}

        {/* Box */}
        <View
          style={[
            styles.box,
            {
              left: BOX_X,
              top: BOX_Y,
              width: BOX_WIDTH,
              height: BOX_HEIGHT,
            },
          ]}
        >
          <View style={[styles.boxLabel, { top: -30 }]}>
            <Text style={styles.boxLabelText}>Curved Letters</Text>
          </View>
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
    position: 'relative',
  },
  letterContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    fontSize: 64,
    fontWeight: '900',
  },
  box: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: '#10B981',
    borderStyle: 'dashed',
    borderRadius: 16,
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
