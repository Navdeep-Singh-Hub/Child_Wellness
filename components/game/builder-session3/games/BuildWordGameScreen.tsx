// Game 3: Build the Word
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, speakWord, stopAllAudio } from '../utils/audio';
import { WORD_DOG } from '../utils/gameData';

interface LetterState {
  id: string;
  letter: string;
  x: number;
  y: number;
  isDragging: boolean;
  slotIndex: number | null;
}

interface BuildWordGameScreenProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

export default function BuildWordGameScreen({ onComplete, onBack }: BuildWordGameScreenProps) {
  const { width, height } = useWindowDimensions();
  const SLOT_Y = height * 0.4;
  const SLOT_WIDTH = 100;
  const SLOT_SPACING = 120;
  const SLOT_START_X = (width - (SLOT_SPACING * (WORD_DOG.letters.length - 1) + SLOT_WIDTH)) / 2;

  const [letters, setLetters] = useState<LetterState[]>(
    WORD_DOG.letters.map((letter, idx) => ({
      id: `letter-${letter}-${idx}`,
      letter,
      x: (idx % 3) * (width / 4) + width * 0.1,
      y: height * 0.7,
      isDragging: false,
      slotIndex: null,
    }))
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const TOTAL_ROUNDS = 3;

  useEffect(() => {
    // Reset for new round
    setLetters(
      WORD_DOG.letters.map((letter, idx) => ({
        id: `letter-${letter}-${idx}`,
        letter,
        x: (idx % 3) * (width / 4) + width * 0.1,
        y: height * 0.7,
        isDragging: false,
        slotIndex: null,
      }))
    );
    setDraggedId(null);
    speakInstruction('Drag the letters to spell DOG.');
    return () => stopAllAudio();
  }, [round]);

  const getSlotX = (slotIndex: number): number => {
    return SLOT_START_X + slotIndex * SLOT_SPACING;
  };

  const isPointInSlot = (x: number, y: number, slotIndex: number): boolean => {
    const slotX = getSlotX(slotIndex);
    return x >= slotX && x <= slotX + SLOT_WIDTH && y >= SLOT_Y && y <= SLOT_Y + SLOT_WIDTH;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      const { locationX, locationY } = evt.nativeEvent;
      const letter = letters.find((l) => {
        const dist = Math.sqrt(Math.pow(locationX - l.x, 2) + Math.pow(locationY - l.y, 2));
        return dist < 60;
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
            // Check if in any slot
            let slotIndex: number | null = null;
            for (let i = 0; i < WORD_DOG.letters.length; i++) {
              if (isPointInSlot(locationX, locationY, i)) {
                // Check if slot is empty
                const slotOccupied = prev.some((other) => other.slotIndex === i && other.id !== draggedId);
                if (!slotOccupied) {
                  slotIndex = i;
                  break;
                }
              }
            }
            return { ...l, x: locationX, y: locationY, slotIndex };
          }
          return l;
        })
      );
    },
    onPanResponderRelease: () => {
      if (!draggedId) return;
      const letter = letters.find((l) => l.id === draggedId);
      if (letter && letter.slotIndex !== null) {
        // Snap to slot
        const slotX = getSlotX(letter.slotIndex);
        setLetters((prev) => {
          const updated = prev.map((l) =>
            l.id === draggedId
              ? { ...l, x: slotX + SLOT_WIDTH / 2, y: SLOT_Y + SLOT_WIDTH / 2, isDragging: false, slotIndex: letter.slotIndex }
              : l
          );
          
          // Check if word is complete
          const sortedSlots = updated
            .filter((l) => l.slotIndex !== null)
            .sort((a, b) => (a.slotIndex || 0) - (b.slotIndex || 0));
          
          if (sortedSlots.length === WORD_DOG.letters.length) {
            const isCorrect = sortedSlots.every((l, idx) => l.letter === WORD_DOG.letters[idx]);
            if (isCorrect) {
              setTimeout(() => {
                setScore((prev) => prev + 1);
                playSoundEffect('celebration');
                speakWord(WORD_DOG.word);
                speakFeedback('Great! You spelled DOG!');
                
                setTimeout(() => {
                  if (round < TOTAL_ROUNDS - 1) {
                    setRound((prev) => prev + 1);
                  } else {
                    const accuracy = ((score + 1) / TOTAL_ROUNDS) * 100;
                    onComplete({
                      correct: score + 1,
                      total: TOTAL_ROUNDS,
                      accuracy,
                      gameId: 'build-word',
                    });
                  }
                }, 2000);
              }, 100);
            }
          }
          
          return updated;
        });
      } else {
        // Move back to original position
        const originalIndex = WORD_DOG.letters.findIndex((l, idx) => 
          letters.find((letter) => letter.id === draggedId)?.letter === l
        );
        setLetters((prev) =>
          prev.map((l) =>
            l.id === draggedId
              ? {
                  ...l,
                  x: (originalIndex % 3) * (width / 4) + width * 0.1,
                  y: height * 0.7,
                  isDragging: false,
                  slotIndex: null,
                }
              : l
          )
        );
      }
      setDraggedId(null);
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
        gameId: 'build-word',
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
        <Text style={styles.title}>Build the Word</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Drag letters to spell DOG</Text>
      </View>

      {/* Slots */}
      <View style={styles.slotsContainer} {...panResponder.panHandlers}>
        {WORD_DOG.letters.map((letter, idx) => {
          const slotX = getSlotX(idx);
          const letterInSlot = letters.find((l) => l.slotIndex === idx);
          return (
            <View
              key={idx}
              style={[
                styles.slot,
                {
                  left: slotX,
                  top: SLOT_Y,
                  backgroundColor: letterInSlot ? '#ECFDF5' : '#F8FAFC',
                  borderColor: letterInSlot ? '#10B981' : '#E2E8F0',
                },
              ]}
            >
              {letterInSlot ? (
                <Text style={styles.slotLetter}>{letterInSlot.letter}</Text>
              ) : (
                <Text style={styles.slotPlaceholder}>?</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Letters */}
      {letters.map((letter) => (
        <View
          key={letter.id}
          style={[
            styles.letterCard,
            {
              left: letter.x - 40,
              top: letter.y - 40,
              opacity: letter.slotIndex !== null ? 0.5 : 1,
            },
          ]}
        >
          <Text style={styles.letterText}>{letter.letter}</Text>
        </View>
      ))}

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
  slotsContainer: {
    flex: 1,
    position: 'relative',
  },
  slot: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 16,
    borderWidth: 4,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotLetter: {
    fontSize: 64,
    fontWeight: '900',
    color: '#10B981',
  },
  slotPlaceholder: {
    fontSize: 48,
    fontWeight: '900',
    color: '#D1D5DB',
  },
  letterCard: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: '#6C9EFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  letterText: {
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
