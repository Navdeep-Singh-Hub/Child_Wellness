// Game 2: Arrange the Sentence
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
import { playSoundEffect, speakSentence, speakFeedback, stopAllAudio } from '../utils/audio';
import { SENTENCE_ARRANGE_DATA, SentenceArrangement, shuffleArray } from '../utils/gameData';

interface ArrangeSentenceGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;

export default function ArrangeSentenceGame({ onComplete, onBack }: ArrangeSentenceGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState<SentenceArrangement | null>(null);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);

  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0);
  const soundTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadRound();
  }, [round]);

  useEffect(() => {
    if (soundTimeoutRef.current) {
      clearTimeout(soundTimeoutRef.current);
      soundTimeoutRef.current = null;
    }

    if (currentItem) {
      stopAllAudio();
      soundTimeoutRef.current = setTimeout(async () => {
        stopAllAudio();
        await new Promise(resolve => setTimeout(resolve, 150));
        await speakSentence('Arrange the words to make a sentence').catch(() => {});
        soundTimeoutRef.current = null;
      }, 600);
    }

    return () => {
      if (soundTimeoutRef.current) {
        clearTimeout(soundTimeoutRef.current);
        soundTimeoutRef.current = null;
      }
      stopAllAudio();
    };
  }, [currentItem]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'arrange-sentence',
      });
      return;
    }

    const item = SENTENCE_ARRANGE_DATA[round % SENTENCE_ARRANGE_DATA.length];
    const shuffled = shuffleArray([...item.words]);
    
    setCurrentItem(item);
    setShuffledWords(shuffled);
    setArrangedWords([]);
    setIsCorrect(null);
    setCanSelect(true);
    cardScale.value = 1;
    cardGlow.value = 0;
  };

  const handleWordSelect = async (word: string) => {
    if (!canSelect || !currentItem) return;

    const newArranged = [...arrangedWords, word];
    setArrangedWords(newArranged);
    setShuffledWords(shuffledWords.filter(w => w !== word));

    // Check if sentence is complete
    if (newArranged.length === currentItem.words.length) {
      setCanSelect(false);
      const correct = newArranged.every((word, index) => 
        word === currentItem.words[index]
      );
      setIsCorrect(correct);

      if (correct) {
        setScore((s) => s + 1);
        cardGlow.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(0, { duration: 400 })
        );
        await playSoundEffect('correct');
        await speakSentence(currentItem.sentence);
        await speakFeedback('Perfect sentence order!');
        setTimeout(() => {
          setRound((r) => r + 1);
        }, 2000);
      } else {
        cardScale.value = withSequence(
          withTiming(0.95, { duration: 100 }),
          withSpring(1, { damping: 8 })
        );
        await playSoundEffect('incorrect');
        await speakFeedback('Try again!');
        setTimeout(() => {
          setShuffledWords([...currentItem.words]);
          setArrangedWords([]);
          setCanSelect(true);
          setIsCorrect(null);
        }, 2000);
      }
    }
  };

  const handleRemoveWord = (word: string) => {
    if (!canSelect) return;
    setArrangedWords(arrangedWords.filter(w => w !== word));
    setShuffledWords([...shuffledWords, word]);
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

  if (!currentItem) return null;

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
        <Text style={styles.instructionsText}>Tap words to arrange them in the correct order</Text>
      </View>

      {/* Arranged Sentence */}
      <View style={styles.arrangedContainer}>
        <Text style={styles.arrangedLabel}>Your Sentence:</Text>
        <View style={styles.arrangedBox}>
          {arrangedWords.map((word, index) => (
            <Pressable
              key={`${word}-${index}`}
              onPress={() => handleRemoveWord(word)}
              style={styles.arrangedWordChip}
            >
              <Text style={styles.arrangedWordText}>{word}</Text>
            </Pressable>
          ))}
          {arrangedWords.length < currentItem.words.length && (
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderText}>?</Text>
            </View>
          )}
        </View>
      </View>

      {/* Available Words */}
      <View style={styles.availableContainer}>
        <Text style={styles.availableLabel}>Tap to add:</Text>
        <View style={styles.wordsRow}>
          {shuffledWords.map((word, index) => (
            <Pressable
              key={`${word}-${index}`}
              onPress={() => handleWordSelect(word)}
              disabled={!canSelect}
              style={styles.wordWrapper}
            >
              <Animated.View style={[styles.wordChip, cardAnimatedStyle]}>
                <LinearGradient
                  colors={['#BFDBFE', '#93C5FD']}
                  style={styles.wordChipGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.wordChipText}>{word}</Text>
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
    shadowColor: '#BFDBFE',
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
  arrangedBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    minHeight: 100,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  arrangedWordChip: {
    marginBottom: 4,
  },
  arrangedWordText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  placeholderBox: {
    width: 60,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#9CA3AF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
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
    marginBottom: 16,
    textAlign: 'center',
  },
  wordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  wordWrapper: {
    marginBottom: 8,
  },
  wordChip: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  wordChipGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  wordChipText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
