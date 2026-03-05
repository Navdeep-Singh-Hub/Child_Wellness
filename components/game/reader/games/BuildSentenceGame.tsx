// Game 1: Build the Sentence
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
import { playSoundEffect, speakSentence, speakWord, speakFeedback, stopAllAudio } from '../utils/audio';
import { SENTENCE_BUILD_DATA, shuffleArray } from '../utils/gameData';

interface BuildSentenceGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;

// Picture emoji mapping
const PICTURE_EMOJIS: Record<string, string> = {
  cat: '🐱',
  dog: '🐶',
  sun: '☀️',
  ball: '⚽',
  car: '🚗',
  tree: '🌳',
};

export default function BuildSentenceGame({ onComplete, onBack }: BuildSentenceGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState<typeof SENTENCE_BUILD_DATA[0] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);

  const wordScale = useSharedValue(1);
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
        await new Promise(resolve => setTimeout(resolve, 150));
        await speakSentence('I see a').catch(() => {});
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
        gameId: 'build-sentence',
      });
      return;
    }

    const item = SENTENCE_BUILD_DATA[round % SENTENCE_BUILD_DATA.length];
    const shuffled = shuffleArray([...item.options]);
    
    setCurrentItem(item);
    setOptions(shuffled);
    setSelectedWord(null);
    setIsCorrect(null);
    setCanSelect(true);
    wordScale.value = 1;
    wordGlow.value = 0;
    shakeX.value = 0;
  };

  const handleWordSelect = async (word: string) => {
    if (!canSelect || !currentItem) return;

    setCanSelect(false);
    setSelectedWord(word);
    const correct = word === currentItem.missingWord;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      wordGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakSentence(currentItem.sentence);
      await speakFeedback('Perfect sentence!');
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
      setTimeout(() => {
        setCanSelect(true);
        setSelectedWord(null);
        setIsCorrect(null);
      }, 2000);
      return;
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 2000);
  };

  const handleReplay = () => {
    if (currentItem) {
      speakSentence('I see a');
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const wordAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: wordScale.value },
      { translateX: shakeX.value },
    ],
    shadowOpacity: wordGlow.value * 0.5,
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
        <Text style={styles.instructionsText}>Complete the sentence by choosing the correct word</Text>
      </View>

      {/* Picture Display */}
      <View style={styles.pictureContainer}>
        <View style={styles.pictureBox}>
          <Text style={styles.pictureEmoji}>{PICTURE_EMOJIS[currentItem.picture] || '🖼️'}</Text>
          <Text style={styles.pictureLabel}>{currentItem.picture}</Text>
        </View>
      </View>

      {/* Sentence Display */}
      <View style={styles.sentenceContainer}>
        <View style={styles.sentenceBox}>
          <Text style={styles.sentenceText}>
            I see a <Text style={styles.blankText}>____</Text>.
          </Text>
        </View>
      </View>

      {/* Replay Button */}
      <View style={styles.replayContainer}>
        <Pressable onPress={handleReplay} style={styles.replayButton}>
          <LinearGradient
            colors={['#BFDBFE', '#93C5FD']}
            style={styles.replayGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="volume-high" size={24} color="#FFFFFF" />
            <Text style={styles.replayText}>Replay</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Word Options */}
      <View style={styles.optionsContainer}>
        {options.map((word, index) => {
          const isSelected = selectedWord === word;
          const showCorrect = isSelected && isCorrect === true;
          const showIncorrect = isSelected && isCorrect === false;

          return (
            <Pressable
              key={index}
              onPress={() => handleWordSelect(word)}
              disabled={!canSelect}
              style={styles.optionWrapper}
            >
              <Animated.View
                style={[
                  styles.wordButton,
                  wordAnimatedStyle,
                  showCorrect && styles.wordButtonCorrect,
                  showIncorrect && styles.wordButtonIncorrect,
                ]}
              >
                <LinearGradient
                  colors={showCorrect ? ['#A7F3D0', '#6EE7B7'] : showIncorrect ? ['#FBCFE8', '#F9A8D4'] : ['#BFDBFE', '#93C5FD']}
                  style={styles.wordGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.wordText}>{word.toUpperCase()}</Text>
                  {showCorrect && (
                    <View style={styles.feedbackIcon}>
                      <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
                    </View>
                  )}
                  {showIncorrect && (
                    <View style={styles.feedbackIcon}>
                      <Ionicons name="close-circle" size={32} color="#FFFFFF" />
                    </View>
                  )}
                </LinearGradient>
              </Animated.View>
            </Pressable>
          );
        })}
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
  pictureContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  pictureBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 150,
  },
  pictureEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  pictureLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    textTransform: 'capitalize',
  },
  sentenceContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sentenceBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  sentenceText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  blankText: {
    color: '#BFDBFE',
    textDecorationLine: 'underline',
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
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  optionWrapper: {
    marginBottom: 16,
  },
  wordButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  wordButtonCorrect: {
    borderWidth: 4,
    borderColor: '#A7F3D0',
  },
  wordButtonIncorrect: {
    borderWidth: 4,
    borderColor: '#FBCFE8',
  },
  wordGradient: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    position: 'relative',
  },
  wordText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  feedbackIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
