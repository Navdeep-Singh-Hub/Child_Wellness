// Game 2: Sentence Arrange - Arrange words to make the sentence
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Draggable from 'react-native-draggable';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../reader/utils/audio';
import { CORRECT_ORDER_SESSION6, MIXED_WORDS_SESSION6 } from './gameData';

interface SentenceArrangeGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function SentenceArrangeGameScreen({ onComplete, onBack }: SentenceArrangeGameScreenProps) {
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null]);
  const [completed, setCompleted] = useState(false);

  const slotScales = slots.map(() => useSharedValue(1));

  useEffect(() => {
    speakInstruction('Arrange the words to make the sentence').catch(() => {});
    return () => stopAllAudio();
  }, []);

  const checkOrder = () => {
    const currentOrder = slots.filter(s => s !== null) as string[];
    const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(CORRECT_ORDER_SESSION6);

    if (isCorrect && slots.every(s => s !== null)) {
      handleCorrect();
    }
  };

  const handleCorrect = async () => {
    await playSoundEffect('correct');
    await speakFeedback('Perfect! You made the sentence!');
    setCompleted(true);
  };

  const handleWordDrop = (word: string, slotIndex: number) => {
    if (slots[slotIndex] !== null) return; // Slot already filled

    const newSlots = [...slots];
    newSlots[slotIndex] = word;
    setSlots(newSlots);

    slotScales[slotIndex].value = withSpring(1.2, {}, () => {
      slotScales[slotIndex].value = withSpring(1);
    });

    setTimeout(checkOrder, 300);
  };

  const handleRemoveWord = (slotIndex: number) => {
    const newSlots = [...slots];
    newSlots[slotIndex] = null;
    setSlots(newSlots);
  };

  const slotAnimatedStyles = slotScales.map((scale) =>
    useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }))
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Sentence Arrange</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Arrange the words to make the sentence</Text>
      </View>

      {/* Word Slots */}
      <View style={styles.slotsContainer}>
        {slots.map((word, index) => (
          <Animated.View key={index} style={[styles.slot, slotAnimatedStyles[index]]} entering={FadeInDown.delay(200 + index * 100)}>
            {word ? (
              <Pressable onPress={() => handleRemoveWord(index)} style={styles.filledSlot}>
                <LinearGradient
                  colors={['#22C55E', '#16A34A']}
                  style={styles.filledSlotGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.slotText}>{word}</Text>
                  <Ionicons name="close-circle" size={20} color="#FFFFFF" style={styles.removeIcon} />
                </LinearGradient>
              </Pressable>
            ) : (
              <View style={styles.emptySlot}>
                <Text style={styles.slotNumber}>{index + 1}</Text>
              </View>
            )}
          </Animated.View>
        ))}
      </View>

      {/* Draggable Words */}
      <View style={styles.wordsContainer}>
        {MIXED_WORDS_SESSION6.map((word, index) => {
          const isUsed = slots.includes(word);
          if (isUsed) return null;

          return (
            <Draggable
              key={word}
              x={50 + index * 80}
              y={100}
              onDragRelease={(event, gestureState, bounds) => {
                // Check which slot the word was dropped on
                const slotY = 200; // Approximate Y position of slots
                const slotWidth = 150;
                const slotIndex = Math.floor((gestureState.moveX - 20) / slotWidth);
                if (slotIndex >= 0 && slotIndex < slots.length) {
                  handleWordDrop(word, slotIndex);
                }
              }}
            >
              <Animated.View entering={FadeInDown.delay(600 + index * 100)} style={styles.wordCard}>
                <LinearGradient
                  colors={['#C7D2FE', '#A5B4FC']}
                  style={styles.wordCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.wordCardText}>{word}</Text>
                </LinearGradient>
              </Animated.View>
            </Draggable>
          );
        })}
      </View>

      {/* Next Button */}
      {completed && (
        <Animated.View entering={FadeInDown.delay(1000)} style={styles.buttonContainer}>
          <Pressable onPress={onComplete} style={styles.nextButton}>
            <LinearGradient
              colors={['#6C9EFF', '#818CF8']}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.nextButtonText}>Next →</Text>
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
  instructionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  slotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 30,
    flexWrap: 'wrap',
  },
  slot: {
    width: 150,
    height: 80,
  },
  emptySlot: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filledSlot: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  filledSlotGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  slotText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  slotNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#C7D2FE',
  },
  removeIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  wordsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  wordCard: {
    width: 120,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  wordCardGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordCardText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nextButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
