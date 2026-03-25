// Game 3: Build the Word - Drag and drop letters
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playLetterSound, playSoundEffect, speakInstruction, speakFeedback, speakWord, stopAllAudio } from '../../builder/utils/audio';
import { WORD_CAT } from '../../builder/utils/gameData';

interface LetterState {
  id: string;
  letter: string;
  x: number;
  y: number;
  isDragging: boolean;
  slotIndex: number | null;
}

interface BuildWordGameScreenProps {
  onComplete: () => void;
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
  const [completed, setCompleted] = useState(false);
  const containerLayoutRef = React.useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  
  // Keep ref in sync with state
  React.useEffect(() => {
    draggedIdRef.current = draggedId;
  }, [draggedId]);

  useEffect(() => {
    speakInstruction('Drag the letters to spell CAT.').catch(() => {});
    return () => stopAllAudio();
  }, []);

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

  const lettersRef = React.useRef(letters);
  React.useEffect(() => {
    lettersRef.current = letters;
  }, [letters]);

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
      
      if (letter && !completed && letter.slotIndex === null) {
        draggedIdRef.current = letter.id;
        setDraggedId(letter.id);
        return true;
      }
      return false;
    },
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return draggedIdRef.current !== null;
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (evt) => {
      evt.preventDefault?.();
      const currentDraggedId = draggedIdRef.current;
      if (currentDraggedId) {
        setLetters((prev) =>
          prev.map((l) => (l.id === currentDraggedId ? { ...l, isDragging: true } : l))
        );
        playSoundEffect('click');
      }
    },
    onPanResponderMove: (evt) => {
      evt.preventDefault?.();
      const currentDraggedId = draggedIdRef.current;
      if (!currentDraggedId || completed) return;
      
      const { locationX, locationY } = evt.nativeEvent;
      const containerLayout = containerLayoutRef.current;
      if (!containerLayout) return;
      
      // Convert container-relative coordinates to absolute
      const absX = containerLayout.x + locationX;
      const absY = containerLayout.y + locationY;
      
      setLetters((prev) =>
        prev.map((l) => {
          if (l.id === currentDraggedId) {
            let slotIndex: number | null = null;
            for (let i = 0; i < WORD_CAT.letters.length; i++) {
              if (isPointInSlot(absX, absY, i)) {
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
      if (!currentDraggedId || completed) return;
      const letter = letters.find((l) => l.id === currentDraggedId);
      if (letter && letter.slotIndex !== null) {
        const slotX = getSlotX(letter.slotIndex);
        setLetters((prev) => {
          const updated = prev.map((l) =>
            l.id === currentDraggedId
              ? { ...l, x: slotX + SLOT_WIDTH / 2, y: SLOT_Y + SLOT_WIDTH / 2, isDragging: false, slotIndex: letter.slotIndex }
              : l
          );
          
          const sortedSlots = updated
            .filter((l) => l.slotIndex !== null)
            .sort((a, b) => (a.slotIndex || 0) - (b.slotIndex || 0));
          
          if (sortedSlots.length === WORD_CAT.letters.length) {
            const isCorrect = sortedSlots.every((l, idx) => l.letter === WORD_CAT.letters[idx]);
            if (isCorrect) {
              setCompleted(true);
              setTimeout(async () => {
                await playSoundEffect('celebration');
                await speakWord('CAT');
                await speakFeedback('Great! You spelled CAT!');
                setTimeout(() => {
                  onComplete();
                }, 2000);
              }, 100);
            }
          }
          
          return updated;
        });
      } else {
        const originalIndex = WORD_CAT.letters.findIndex((l, idx) => 
          letters.find((letter) => letter.id === currentDraggedId)?.letter === l
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
  }), [letters, completed]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Build the Word</Text>
        <View style={{ width: 40 }} />
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
            <LinearGradient
              colors={letter.slotIndex !== null ? ['#10B981', '#16A34A'] : ['#6C9EFF', '#818CF8']}
              style={styles.letterGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.letterText} selectable={false}>{letter.letter}</Text>
            </LinearGradient>
          </View>
        ))}
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
  instructionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
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
    borderRadius: 20,
    borderWidth: 4,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterCard: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  letterGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    userSelect: 'none',
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
  instructionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    userSelect: 'none',
  },
});
