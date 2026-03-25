// Game 3: Build the Word
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, speakWord, stopAllAudio } from '../utils/audio';
import { WORD_CAT } from '../utils/gameData';

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
  const SLOT_START_X = (width - (SLOT_SPACING * (WORD_CAT.letters.length - 1) + SLOT_WIDTH)) / 2;

  const [letters, setLetters] = useState<LetterState[]>(
    WORD_CAT.letters.map((letter, idx) => ({
      id: `letter-${letter}-${idx}`,
      letter,
      x: (idx % 3) * (width / 4) + width * 0.1,
      y: height * 0.7,
      isDragging: false,
      slotIndex: null,
    }))
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const draggedIdRef = React.useRef<string | null>(null);
  const containerLayoutRef = React.useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const lettersRef = React.useRef(letters);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const TOTAL_ROUNDS = 3;

  React.useEffect(() => {
    draggedIdRef.current = draggedId;
  }, [draggedId]);

  React.useEffect(() => {
    lettersRef.current = letters;
  }, [letters]);

  useEffect(() => {
    // Reset for new round
    setLetters(
      WORD_CAT.letters.map((letter, idx) => ({
        id: `letter-${letter}-${idx}`,
        letter,
        x: (idx % 3) * (width / 4) + width * 0.1,
        y: height * 0.7,
        isDragging: false,
        slotIndex: null,
      }))
    );
    setDraggedId(null);
    speakInstruction('Drag the letters to spell CAT.');
    return () => stopAllAudio();
  }, [round]);

  const getSlotX = (slotIndex: number): number => {
    return SLOT_START_X + slotIndex * SLOT_SPACING;
  };

  const isPointInSlot = (x: number, y: number, slotIndex: number): boolean => {
    const slotX = getSlotX(slotIndex);
    return x >= slotX && x <= slotX + SLOT_WIDTH && y >= SLOT_Y && y <= SLOT_Y + SLOT_WIDTH;
  };

  const checkWord = (): boolean => {
    const sortedSlots = letters
      .filter((l) => l.slotIndex !== null)
      .sort((a, b) => (a.slotIndex || 0) - (b.slotIndex || 0));
    
    if (sortedSlots.length !== WORD_CAT.letters.length) return false;
    
    return sortedSlots.every((l, idx) => l.letter === WORD_CAT.letters[idx]);
  };

  const panResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      evt.preventDefault?.();
      const { locationX, locationY } = evt.nativeEvent;
      const containerLayout = containerLayoutRef.current;
      if (!containerLayout) return false;
      
      // Convert container-relative coordinates to absolute
      const absX = containerLayout.x + locationX;
      const absY = containerLayout.y + locationY;
      
      const currentLetters = lettersRef.current;
      const letter = currentLetters.find((l) => {
        // Letter card is 80x80, centered at l.x, l.y
        // So bounds are: left: l.x - 40, right: l.x + 40, top: l.y - 40, bottom: l.y + 40
        const distX = Math.abs(absX - l.x);
        const distY = Math.abs(absY - l.y);
        return distX < 40 && distY < 40;
      });
      
      if (letter && letter.slotIndex === null) {
        draggedIdRef.current = letter.id;
        setDraggedId(letter.id);
        setLetters((prev) =>
          prev.map((l) => (l.id === letter.id ? { ...l, isDragging: true } : l))
        );
        playSoundEffect('click');
        return true;
      }
      return false;
    },
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: () => {
      return draggedIdRef.current !== null;
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (evt) => {
      evt.preventDefault?.();
    },
    onPanResponderMove: (evt) => {
      evt.preventDefault?.();
      const currentDraggedId = draggedIdRef.current;
      if (!currentDraggedId) return;
      
      const { locationX, locationY } = evt.nativeEvent;
      const containerLayout = containerLayoutRef.current;
      if (!containerLayout) return;
      
      // Convert container-relative coordinates to absolute
      const absX = containerLayout.x + locationX;
      const absY = containerLayout.y + locationY;
      
      setLetters((prev) =>
        prev.map((l) => {
          if (l.id === currentDraggedId) {
            // Check if in any slot
            let slotIndex: number | null = null;
            for (let i = 0; i < WORD_CAT.letters.length; i++) {
              if (isPointInSlot(absX, absY, i)) {
                // Check if slot is empty
                const slotOccupied = prev.some((other) => other.slotIndex === i && other.id !== currentDraggedId);
                if (!slotOccupied) {
                  slotIndex = i;
                  break;
                }
              }
            }
            return { ...l, x: absX, y: absY, slotIndex };
          }
          return l;
        })
      );
    },
    onPanResponderRelease: () => {
      const currentDraggedId = draggedIdRef.current;
      if (!currentDraggedId) return;
      
      const letter = lettersRef.current.find((l) => l.id === currentDraggedId);
      if (letter && letter.slotIndex !== null) {
        // Snap to slot
        const slotX = getSlotX(letter.slotIndex);
        setLetters((prev) => {
          const updated = prev.map((l) =>
            l.id === currentDraggedId
              ? { ...l, x: slotX + SLOT_WIDTH / 2, y: SLOT_Y + SLOT_WIDTH / 2, isDragging: false, slotIndex: letter.slotIndex }
              : l
          );
          
          // Check if word is complete
          const sortedSlots = updated
            .filter((l) => l.slotIndex !== null)
            .sort((a, b) => (a.slotIndex || 0) - (b.slotIndex || 0));
          
          if (sortedSlots.length === WORD_CAT.letters.length) {
            const isCorrect = sortedSlots.every((l, idx) => l.letter === WORD_CAT.letters[idx]);
            if (isCorrect) {
              setTimeout(() => {
                setScore((prev) => prev + 1);
                playSoundEffect('celebration');
                speakWord(WORD_CAT.word);
                speakFeedback('Great! You spelled CAT!');
                
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
        const originalIndex = WORD_CAT.letters.findIndex((l, idx) => 
          lettersRef.current.find((letter) => letter.id === currentDraggedId)?.letter === l
        );
        setLetters((prev) =>
          prev.map((l) =>
            l.id === currentDraggedId
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
      draggedIdRef.current = null;
      setDraggedId(null);
    },
  }), [letters, round, score]);

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
        <Text style={styles.instructionText} selectable={false}>Drag letters to spell CAT</Text>
      </View>

      {/* Interactive Area - covers entire screen for drag handling */}
      <View 
        style={styles.interactiveArea} 
        {...panResponder.panHandlers}
        collapsable={false}
        onLayout={(evt) => {
          const { x, y, width, height } = evt.nativeEvent.layout;
          containerLayoutRef.current = { x, y, width, height };
        }}
      >
        {/* Slots */}
        <View style={styles.slotsContainer} pointerEvents="none">
          {WORD_CAT.letters.map((letter, idx) => {
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
                  <Text style={styles.slotLetter} selectable={false}>{letterInSlot.letter}</Text>
                ) : (
                  <Text style={styles.slotPlaceholder} selectable={false}>?</Text>
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
            pointerEvents="none"
          >
            <Text style={styles.letterText} selectable={false}>{letter.letter}</Text>
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
    userSelect: 'none',
  },
  interactiveArea: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
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
    userSelect: 'none',
  },
  slotPlaceholder: {
    fontSize: 48,
    fontWeight: '900',
    color: '#D1D5DB',
    userSelect: 'none',
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
    userSelect: 'none',
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
