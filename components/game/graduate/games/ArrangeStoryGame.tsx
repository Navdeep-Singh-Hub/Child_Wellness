// Game 1: Arrange the Story
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
import { playSoundEffect, speakStory, speakFeedback, stopAllAudio } from '../utils/audio';
import { STORY_SEQUENCES, StorySequence, shuffleArray } from '../utils/gameData';

interface ArrangeStoryGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 4;

export default function ArrangeStoryGame({ onComplete, onBack }: ArrangeStoryGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentStory, setCurrentStory] = useState<StorySequence | null>(null);
  const [arrangedParts, setArrangedParts] = useState<number[]>([]);
  const [availableParts, setAvailableParts] = useState<typeof STORY_SEQUENCES[0]['parts']>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);

  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0);

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
        gameId: 'arrange-story',
      });
      return;
    }

    const story = STORY_SEQUENCES[round % STORY_SEQUENCES.length];
    const shuffled = shuffleArray([...story.parts]);
    
    setCurrentStory(story);
    setAvailableParts(shuffled);
    setArrangedParts([]);
    setIsCorrect(null);
    setCanSelect(true);
    cardScale.value = 1;
    cardGlow.value = 0;
  };

  const handlePartSelect = (partId: number) => {
    if (!canSelect || !currentStory) return;

    const part = availableParts.find(p => p.id === partId);
    if (!part) return;

    setArrangedParts(prev => [...prev, partId]);
    setAvailableParts(prev => prev.filter(p => p.id !== partId));

    // Check if story is complete
    if (arrangedParts.length + 1 === currentStory.parts.length) {
      const newArranged = [...arrangedParts, partId];
      checkStoryOrder(newArranged);
    }
  };

  const handlePartRemove = (partId: number) => {
    if (!canSelect || !currentStory) return;

    const part = currentStory.parts.find(p => p.id === partId);
    if (!part) return;

    setArrangedParts(prev => prev.filter(id => id !== partId));
    setAvailableParts(prev => [...prev, part]);
  };

  const checkStoryOrder = async (arranged: number[]) => {
    if (!currentStory) return;

    setCanSelect(false);
    const correct = arranged.every((id, index) => id === currentStory.correctOrder[index]);
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      cardGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      const storyText = currentStory.parts.map(p => p.text);
      await speakStory(storyText);
      await speakFeedback('Perfect story order!');
    } else {
      cardScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 8 })
      );
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
      setTimeout(() => {
        setArrangedParts([]);
        setAvailableParts([...currentStory.parts]);
        setCanSelect(true);
        setIsCorrect(null);
      }, 2000);
      return;
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 3000);
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

  if (!currentStory) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3C7', '#FEF9E7']} style={StyleSheet.absoluteFill} />

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
        <Text style={styles.instructionsText}>Arrange the story in the correct order</Text>
      </View>

      {/* Story Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.storyTitle}>{currentStory.title}</Text>
      </View>

      {/* Arranged Story */}
      <View style={styles.arrangedContainer}>
        <Text style={styles.arrangedLabel}>Your Story:</Text>
        <View style={styles.arrangedBox}>
          {arrangedParts.map((partId, index) => {
            const part = currentStory.parts.find(p => p.id === partId);
            if (!part) return null;
            return (
              <Pressable
                key={`${partId}-${index}`}
                onPress={() => handlePartRemove(partId)}
                style={styles.arrangedPartCard}
              >
                <Animated.View style={[styles.partCard, cardAnimatedStyle]}>
                  <LinearGradient
                    colors={['#FDE68A', '#FCD34D']}
                    style={styles.partGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.partEmoji}>{part.emoji}</Text>
                    <Text style={styles.partText}>{part.text}</Text>
                  </LinearGradient>
                </Animated.View>
              </Pressable>
            );
          })}
          {arrangedParts.length < currentStory.parts.length && (
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderText}>?</Text>
            </View>
          )}
        </View>
      </View>

      {/* Available Parts */}
      <View style={styles.availableContainer}>
        <Text style={styles.availableLabel}>Tap to add:</Text>
        <View style={styles.availablePartsRow}>
          {availableParts.map((part) => (
            <Pressable
              key={part.id}
              onPress={() => handlePartSelect(part.id)}
              disabled={!canSelect}
              style={styles.availablePartWrapper}
            >
              <Animated.View style={[styles.partCard, cardAnimatedStyle]}>
                <LinearGradient
                  colors={['#BFDBFE', '#93C5FD']}
                  style={styles.partGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.partEmoji}>{part.emoji}</Text>
                  <Text style={styles.partText}>{part.text}</Text>
                </LinearGradient>
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
    shadowColor: '#FDE68A',
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
  },
  instructionsText: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  arrangedContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  arrangedLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  arrangedBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    minHeight: 120,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#FDE68A',
    borderStyle: 'dashed',
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  arrangedPartCard: {
    marginBottom: 4,
  },
  placeholderBox: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#9CA3AF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    color: '#9CA3AF',
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
    marginBottom: 12,
    textAlign: 'center',
  },
  availablePartsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  availablePartWrapper: {
    marginBottom: 8,
  },
  partCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    width: 120,
  },
  partGradient: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  partEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  partText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
});
