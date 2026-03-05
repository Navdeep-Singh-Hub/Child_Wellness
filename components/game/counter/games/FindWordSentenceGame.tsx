// Game 2: Find the Word in a Sentence
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
import { playSoundEffect, speakWord, speakFeedback, stopAllAudio } from '../utils/audio';
import { SENTENCE_DATA, shuffleArray } from '../utils/gameData';

interface FindWordSentenceGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;

export default function FindWordSentenceGame({ onComplete, onBack }: FindWordSentenceGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState<typeof SENTENCE_DATA[0] | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);

  const wordGlow = useSharedValue(0);
  const shakeX = useSharedValue(0);
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
        await new Promise(resolve => setTimeout(resolve, 200));
        // Speak the sentence first
        await speakWord(currentItem.sentence).catch(() => {});
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Then ask for the target word
        await speakWord(`Tap the word: ${currentItem.targetWord}`).catch(() => {});
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
        gameId: 'find-word-sentence',
      });
      return;
    }

    const item = SENTENCE_DATA[round % SENTENCE_DATA.length];
    
    setCurrentItem(item);
    setSelectedWord(null);
    setIsCorrect(null);
    setCanSelect(true);
    wordGlow.value = 0;
    shakeX.value = 0;
  };

  const handleWordSelect = async (word: string) => {
    if (!canSelect || !currentItem) return;

    setCanSelect(false);
    setSelectedWord(word);
    const normalizedWord = word.toLowerCase().replace(/[.,!?]/g, '');
    const correct = normalizedWord === currentItem.targetWord.toLowerCase();
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      wordGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakWord(word);
      await speakFeedback('Perfect!');
    } else {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 2000);
  };

  const handleReplay = () => {
    if (currentItem) {
      speakWord(currentItem.sentence);
      setTimeout(() => {
        speakWord(`Tap the word: ${currentItem.targetWord}`);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  if (!currentItem) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

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
        <Text style={styles.instructionsText}>Tap the word you hear in the sentence</Text>
      </View>

      {/* Replay Button */}
      <View style={styles.replayContainer}>
        <Pressable onPress={handleReplay} style={styles.replayButton}>
          <LinearGradient
            colors={['#C4B5FD', '#A78BFA']}
            style={styles.replayGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="volume-high" size={24} color="#FFFFFF" />
            <Text style={styles.replayText}>Replay</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Sentence Display */}
      <Animated.View style={[styles.sentenceContainer, animatedStyle]}>
        <View style={styles.sentenceBox}>
          <Text style={styles.sentenceLabel}>Tap the word: {currentItem.targetWord}</Text>
          <View style={styles.wordsRow}>
            {currentItem.words.map((word, index) => {
              const normalizedWord = word.toLowerCase().replace(/[.,!?]/g, '');
              const isTarget = normalizedWord === currentItem.targetWord.toLowerCase();
              const isSelected = selectedWord === word;
              const showCorrect = isSelected && isCorrect === true;
              const showIncorrect = isSelected && isCorrect === false;

              return (
                <Pressable
                  key={index}
                  onPress={() => handleWordSelect(word)}
                  disabled={!canSelect}
                  style={styles.wordWrapper}
                >
                  <View
                    style={[
                      styles.wordChip,
                      isTarget && styles.targetWordChip,
                      showCorrect && styles.correctWordChip,
                      showIncorrect && styles.incorrectWordChip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.wordChipText,
                        isTarget && styles.targetWordText,
                        showCorrect && styles.correctWordText,
                        showIncorrect && styles.incorrectWordText,
                      ]}
                    >
                      {word}
                    </Text>
                    {showCorrect && (
                      <View style={styles.feedbackBadge}>
                        <Ionicons name="checkmark-circle" size={20} color="#86EFAC" />
                      </View>
                    )}
                    {showIncorrect && (
                      <View style={styles.feedbackBadge}>
                        <Ionicons name="close-circle" size={20} color="#FBCFE8" />
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Animated.View>
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
    shadowColor: '#C4B5FD',
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
  replayContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  replayButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  replayGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  replayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sentenceContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sentenceBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#C4B5FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  sentenceLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  targetWordChip: {
    borderColor: '#C4B5FD',
    backgroundColor: '#F3E8FF',
  },
  correctWordChip: {
    borderColor: '#86EFAC',
    backgroundColor: '#ECFDF5',
  },
  incorrectWordChip: {
    borderColor: '#FBCFE8',
    backgroundColor: '#FDF2F8',
  },
  wordChipText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
  },
  targetWordText: {
    color: '#C4B5FD',
  },
  correctWordText: {
    color: '#16A34A',
  },
  incorrectWordText: {
    color: '#EC4899',
  },
  feedbackBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
});
