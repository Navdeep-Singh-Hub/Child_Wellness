// Game 2: Letter to Sound Match
import { playLetterSound, playPhoneme, playSoundEffect, speakFeedback, stopAllAudio } from '../utils/audio';
import { LETTER_SOUND_DATA, getOptionsCount, shuffleArray, Difficulty } from '../utils/gameData';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LetterToSoundGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;
const INITIAL_DIFFICULTY: Difficulty = 'medium';

export default function LetterToSoundGame({ onComplete, onBack }: LetterToSoundGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>(INITIAL_DIFFICULTY);
  const [currentItem, setCurrentItem] = useState<typeof LETTER_SOUND_DATA[0] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);

  const letterScale = useSharedValue(1);
  const letterGlow = useSharedValue(0);
  const soundTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadRound();
  }, [round, difficulty]);

  useEffect(() => {
    // Clear any pending timeout
    if (soundTimeoutRef.current) {
      clearTimeout(soundTimeoutRef.current);
      soundTimeoutRef.current = null;
    }

    if (currentItem) {
      // Stop any previous audio first - do this immediately
      stopAllAudio();
      
      // Wait a bit longer to ensure TTS queue is fully cleared
      soundTimeoutRef.current = setTimeout(async () => {
        // Stop again just before playing to be absolutely sure
        stopAllAudio();
        await new Promise(resolve => setTimeout(resolve, 150));
        await playLetterSound(currentItem.letter).catch(() => {});
        soundTimeoutRef.current = null;
      }, 700);
    }

    // Cleanup on unmount or when currentItem changes
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
        gameId: 'letter-to-sound',
      });
      return;
    }

    const item = LETTER_SOUND_DATA[round % LETTER_SOUND_DATA.length];
    const optionsCount = getOptionsCount(difficulty);
    const allSounds = [item.correctSound, ...item.wrongSounds.slice(0, optionsCount - 1)];
    const shuffled = shuffleArray(allSounds);
    const correctIndex = shuffled.indexOf(item.correctSound);

    setCurrentItem(item);
    setOptions(shuffled);
    setSelectedIndex(null);
    setIsCorrect(null);
    setCanSelect(true);
    letterScale.value = 1;
    letterGlow.value = 0;
  };

  const handleSelect = async (index: number) => {
    if (!canSelect || !currentItem) return;

    setCanSelect(false);
    setSelectedIndex(index);
    const correct = options[index] === currentItem.correctSound;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      letterGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakFeedback(true);
    } else {
      letterScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 8 })
      );
      await playSoundEffect('incorrect');
      await speakFeedback(false);
    }

    // Adjust difficulty
    const newScore = correct ? score + 1 : score;
    const accuracy = ((newScore + (correct ? 1 : 0)) / (round + 1)) * 100;
    if (accuracy > 85 && difficulty !== 'hard') {
      const nextDifficulty: Difficulty = difficulty === 'easy' ? 'medium' : 'hard';
      setDifficulty(nextDifficulty);
    } else if (accuracy < 50 && difficulty !== 'easy') {
      const prevDifficulty: Difficulty = difficulty === 'hard' ? 'medium' : 'easy';
      setDifficulty(prevDifficulty);
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 2000);
  };

  const handleReplayLetter = () => {
    if (currentItem) {
      playLetterSound(currentItem.letter);
    }
  };

  const handlePlaySound = async (sound: string) => {
    // Play the phoneme sound
    await playPhoneme(sound);
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const letterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: letterScale.value }],
    shadowOpacity: letterGlow.value * 0.5,
  }));

  if (!currentItem) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#F0F9FF', '#E0F2FE']} style={StyleSheet.absoluteFill} />

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
        <Text style={styles.instructionsText}>Match the letter to its sound</Text>
      </View>

      {/* Letter Display */}
      <View style={styles.letterContainer}>
        <Pressable onPress={handleReplayLetter} style={styles.letterButton}>
          <Animated.View style={[styles.letterCard, letterAnimatedStyle]}>
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              style={styles.letterGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.letterText}>{currentItem.letter}</Text>
            </LinearGradient>
          </Animated.View>
        </Pressable>
        <Text style={styles.letterHint}>Tap to hear the letter sound</Text>
      </View>

      {/* Sound Options */}
      <View style={styles.optionsContainer}>
        {options.map((sound, index) => {
          const isSelected = selectedIndex === index;
          const showCorrect = isSelected && isCorrect === true;
          const showIncorrect = isSelected && isCorrect === false;

          return (
            <Pressable
              key={index}
              onPress={() => {
                handlePlaySound(sound);
                handleSelect(index);
              }}
              disabled={!canSelect}
              style={[
                styles.soundButton,
                showCorrect && styles.soundButtonCorrect,
                showIncorrect && styles.soundButtonIncorrect,
              ]}
            >
              <LinearGradient
                colors={
                  showCorrect
                    ? ['#22C55E', '#16A34A']
                    : showIncorrect
                    ? ['#EF4444', '#DC2626']
                    : ['#FFFFFF', '#F8F9FA']
                }
                style={styles.soundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.soundText, (showCorrect || showIncorrect) && styles.soundTextWhite]}>
                  {sound}
                </Text>
                {showCorrect && <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />}
                {showIncorrect && <Ionicons name="close-circle" size={24} color="#FFFFFF" />}
              </LinearGradient>
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
    shadowColor: '#000',
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
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  letterContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  letterButton: {
    marginBottom: 12,
  },
  letterCard: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  letterGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterText: {
    fontSize: 64,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  letterHint: {
    fontSize: 14,
    color: '#64748B',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  soundButton: {
    width: '45%',
    minHeight: 80,
  },
  soundButtonCorrect: {},
  soundButtonIncorrect: {},
  soundGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  soundText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  soundTextWhite: {
    color: '#FFFFFF',
  },
});
