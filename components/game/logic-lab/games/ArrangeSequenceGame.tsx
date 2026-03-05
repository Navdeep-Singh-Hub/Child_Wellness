// Game 4: Arrange the Sequence
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakFeedback, stopAllAudio } from '../utils/audio';
import { SEQUENCE_DATA, Sequence, SequenceItem, shuffleArray } from '../utils/gameData';

interface ArrangeSequenceGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;

export default function ArrangeSequenceGame({ onComplete, onBack }: ArrangeSequenceGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentSequence, setCurrentSequence] = useState<Sequence | null>(null);
  const [shuffledItems, setShuffledItems] = useState<SequenceItem[]>([]);
  const [arrangedItems, setArrangedItems] = useState<SequenceItem[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0);
  const soundTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadRound();
  }, [round]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'arrange-sequence',
      });
      return;
    }

    const sequence = SEQUENCE_DATA[round % SEQUENCE_DATA.length];
    const shuffled = shuffleArray([...sequence.items]);
    
    setCurrentSequence(sequence);
    setShuffledItems(shuffled);
    setArrangedItems([]);
    setIsCorrect(null);
    setCanSelect(true);
    setWrongAttempts(0);
    cardScale.value = 1;
    cardGlow.value = 0;
  };

  const handleItemSelect = async (item: SequenceItem) => {
    if (!canSelect || !currentSequence) return;

    const newArranged = [...arrangedItems, item];
    setArrangedItems(newArranged);
    setShuffledItems(shuffledItems.filter(i => i.id !== item.id));

    // Check if sequence is complete
    if (newArranged.length === currentSequence.items.length) {
      setCanSelect(false);
      const correct = newArranged.every((item, index) => 
        item.step === currentSequence.items[index].step
      );
      setIsCorrect(correct);

      if (correct) {
        setScore((s) => s + 1);
        cardGlow.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(0, { duration: 400 })
        );
        await playSoundEffect('correct');
        await speakFeedback('Perfect sequence!');
        setTimeout(() => {
          setRound((r) => r + 1);
        }, 2000);
      } else {
        const newWrongAttempts = wrongAttempts + 1;
        setWrongAttempts(newWrongAttempts);
        cardScale.value = withSequence(
          withTiming(0.95, { duration: 100 }),
          withSpring(1, { damping: 8 })
        );
        await playSoundEffect('incorrect');
        
        if (newWrongAttempts >= 2) {
          await speakFeedback('Let me show you the correct order!');
          // Show hint: reset with correct order
          setTimeout(() => {
            setShuffledItems([...currentSequence.items]);
            setArrangedItems([]);
            setWrongAttempts(0);
            setCanSelect(true);
            setIsCorrect(null);
          }, 2000);
        } else {
          await speakFeedback('Try again!');
          setTimeout(() => {
            setShuffledItems([...currentSequence.items]);
            setArrangedItems([]);
            setCanSelect(true);
            setIsCorrect(null);
          }, 2000);
        }
      }
    }
  };

  const handleRemoveItem = (item: SequenceItem) => {
    if (!canSelect) return;
    setArrangedItems(arrangedItems.filter(i => i.id !== item.id));
    setShuffledItems([...shuffledItems, item]);
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    shadowOpacity: cardGlow.value * 0.5,
  }));

  if (!currentSequence) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#EFF6FF', '#F0F9FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
          <Text style={styles.headerSubtitle}>Score: {score}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>Arrange the pictures in the correct order</Text>
        <Text style={styles.sequenceTitle}>{currentSequence.title}</Text>
      </View>

      {/* Arranged Sequence */}
      <View style={styles.arrangedContainer}>
        <Text style={styles.arrangedLabel}>Your Sequence:</Text>
        <View style={styles.arrangedRow}>
          {arrangedItems.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => handleRemoveItem(item)}
              style={styles.arrangedItem}
            >
              <View style={styles.sequenceCard}>
                <Text style={styles.sequenceEmoji}>{item.emoji}</Text>
                <Text style={styles.sequenceNumber}>{index + 1}</Text>
              </View>
            </Pressable>
          ))}
          {arrangedItems.length < currentSequence.items.length && (
            <View style={[styles.sequenceCard, styles.sequenceCardEmpty]}>
              <Text style={styles.sequencePlaceholder}>?</Text>
            </View>
          )}
        </View>
      </View>

      {/* Available Items */}
      <View style={styles.availableContainer}>
        <Text style={styles.availableLabel}>Tap to add:</Text>
        <View style={styles.availableRow}>
          {shuffledItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleItemSelect(item)}
              disabled={!canSelect}
              style={styles.availableItem}
            >
              <Animated.View style={[styles.sequenceCard, cardAnimatedStyle]}>
                <Text style={styles.sequenceEmoji}>{item.emoji}</Text>
                <Text style={styles.sequenceDescription}>{item.description}</Text>
              </Animated.View>
            </Pressable>
          ))}
        </View>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#93C5FD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  headerRight: {
    width: 40,
  },
  instructions: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 8,
  },
  sequenceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  arrangedContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  arrangedLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  arrangedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  availableContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  availableLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  availableRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  arrangedItem: {
    marginBottom: 8,
  },
  availableItem: {
    marginBottom: 8,
  },
  sequenceCard: {
    width: 100,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#93C5FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#93C5FD',
  },
  sequenceCardEmpty: {
    backgroundColor: '#F3F4F6',
    borderStyle: 'dashed',
    borderColor: '#9CA3AF',
  },
  sequenceEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  sequenceNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#93C5FD',
  },
  sequenceDescription: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  sequencePlaceholder: {
    fontSize: 36,
    color: '#9CA3AF',
  },
});
