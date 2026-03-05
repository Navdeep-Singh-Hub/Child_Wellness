// Game 1: Sound to Picture Match
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playPhoneme, playSoundEffect, speakFeedback, stopAllAudio } from '../utils/audio';
import { Difficulty, SOUND_PICTURE_DATA, getOptionsCount, shuffleArray } from '../utils/gameData';

interface SoundToPictureGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;
const INITIAL_DIFFICULTY: Difficulty = 'easy';

export default function SoundToPictureGame({ onComplete, onBack }: SoundToPictureGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>(INITIAL_DIFFICULTY);
  const [currentItem, setCurrentItem] = useState<typeof SOUND_PICTURE_DATA[0] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);

  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0);
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
        await playPhoneme(currentItem.phoneme).catch(() => {});
        soundTimeoutRef.current = null;
      }, 600);
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
        gameId: 'sound-to-picture',
      });
      return;
    }

    const item = SOUND_PICTURE_DATA[round % SOUND_PICTURE_DATA.length];
    const optionsCount = getOptionsCount(difficulty);
    const allImages = [item.correctImage, ...item.wrongImages.slice(0, optionsCount - 1)];
    const shuffled = shuffleArray(allImages);
    const correctIndex = shuffled.indexOf(item.correctImage);

    setCurrentItem(item);
    setOptions(shuffled);
    setSelectedIndex(null);
    setIsCorrect(null);
    setCanSelect(true);
    cardScale.value = 1;
    cardGlow.value = 0;
  };

  const handleSelect = async (index: number) => {
    if (!canSelect || !currentItem) return;

    setCanSelect(false);
    setSelectedIndex(index);
    const correct = options[index] === currentItem.correctImage;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      cardGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakFeedback(true);
    } else {
      cardScale.value = withSequence(
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

  const handleReplay = () => {
    if (currentItem) {
      playPhoneme(currentItem.phoneme);
    }
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
        <Text style={styles.instructionsText}>Listen to the sound and find the matching picture</Text>
      </View>

      {/* Sound Playback */}
      <View style={styles.soundContainer}>
        <Pressable onPress={handleReplay} style={styles.replayButton}>
          <LinearGradient
            colors={['#6366F1', '#4F46E5']}
            style={styles.replayGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="volume-high" size={32} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
        <Text style={styles.soundText}>Tap to hear the sound</Text>
      </View>

      {/* Options Grid */}
      <View style={styles.optionsGrid}>
        {options.map((image, index) => {
          const isSelected = selectedIndex === index;
          const showCorrect = isSelected && isCorrect === true;
          const showIncorrect = isSelected && isCorrect === false;

          return (
            <Animated.View key={index} style={[styles.optionCard, cardAnimatedStyle]}>
              <Pressable
                onPress={() => handleSelect(index)}
                disabled={!canSelect}
                style={[
                  styles.optionPressable,
                  showCorrect && styles.optionCorrect,
                  showIncorrect && styles.optionIncorrect,
                ]}
              >
                <Image source={{ uri: image }} style={styles.optionImage} resizeMode="cover" />
                {showCorrect && (
                  <View style={styles.feedbackOverlay}>
                    <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
                  </View>
                )}
                {showIncorrect && (
                  <View style={styles.feedbackOverlay}>
                    <Ionicons name="close-circle" size={48} color="#EF4444" />
                  </View>
                )}
              </Pressable>
            </Animated.View>
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
  soundContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  replayButton: {
    marginBottom: 12,
  },
  replayGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  soundText: {
    fontSize: 14,
    color: '#64748B',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  optionCard: {
    width: '45%',
    aspectRatio: 1,
    marginBottom: 16,
  },
  optionPressable: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionImage: {
    width: '100%',
    height: '100%',
  },
  optionCorrect: {
    borderWidth: 4,
    borderColor: '#22C55E',
  },
  optionIncorrect: {
    borderWidth: 4,
    borderColor: '#EF4444',
  },
  feedbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
