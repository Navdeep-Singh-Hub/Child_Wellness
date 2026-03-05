// Game 1: Listen & Tap (Beginning Sound)
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
import { LISTEN_TAP_DATA, shuffleArray } from '../utils/gameData';

interface ListenTapGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;

export default function ListenTapGame({ onComplete, onBack }: ListenTapGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState<typeof LISTEN_TAP_DATA[0] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
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
        await new Promise(resolve => setTimeout(resolve, 200));
        await playPhoneme(currentItem.phoneme).catch(() => {});
        soundTimeoutRef.current = null;
      }, 800);
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
        gameId: 'listen-tap',
      });
      return;
    }

    const item = LISTEN_TAP_DATA[round % LISTEN_TAP_DATA.length];
    const allImages = [item.correctImage, item.wrongImage];
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

    if (correct) {
      setIsCorrect(true);
      setScore(score + 1);
      await playSoundEffect('success');
      await speakFeedback('Great job!');
      cardGlow.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 500 })
      );
    } else {
      setIsCorrect(false);
      await playSoundEffect('error');
      await speakFeedback('Try again!');
      cardScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 8 })
      );
    }

    setTimeout(() => {
      setRound(round + 1);
    }, 2000);
  };

  const handleReplay = async () => {
    if (!currentItem) return;
    stopAllAudio();
    await new Promise(resolve => setTimeout(resolve, 200));
    await playPhoneme(currentItem.phoneme).catch(() => {});
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardGlow.value,
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
        <Text style={styles.headerTitle}>Listen & Tap</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}/{TOTAL_ROUNDS}</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Listen to the sound and tap the picture that starts with it
        </Text>
      </View>

      {/* Sound Section */}
      <View style={styles.soundSection}>
        <Pressable onPress={handleReplay} style={styles.replayButton}>
          <LinearGradient
            colors={['#A5B4FC', '#818CF8']}
            style={styles.replayGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="volume-high" size={32} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
        <Text style={styles.soundLabel}>Tap to hear the sound</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((image, index) => {
          const isSelected = selectedIndex === index;
          const isCorrectOption = image === currentItem.correctImage;
          const showFeedback = isSelected && isCorrect !== null;

          return (
            <Pressable
              key={index}
              onPress={() => handleSelect(index)}
              disabled={!canSelect}
              style={styles.optionWrapper}
            >
              <Animated.View
                style={[
                  styles.optionCard,
                  cardAnimatedStyle,
                  showFeedback && isCorrect && styles.correctCard,
                  showFeedback && !isCorrect && styles.incorrectCard,
                ]}
              >
                {showFeedback && isCorrect && (
                  <Animated.View style={[styles.glowOverlay, glowAnimatedStyle]}>
                    <LinearGradient
                      colors={['#22C55E', '#16A34A']}
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  </Animated.View>
                )}
                <Image source={{ uri: image }} style={styles.optionImage} resizeMode="cover" />
                {showFeedback && (
                  <View style={styles.feedbackIcon}>
                    <Ionicons
                      name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                      size={48}
                      color={isCorrect ? '#22C55E' : '#EF4444'}
                    />
                  </View>
                )}
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
  scoreContainer: {
    backgroundColor: '#A5B4FC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  soundSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  replayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#A5B4FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  replayGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundLabel: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  optionsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  optionWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  optionCard: {
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  correctCard: {
    borderWidth: 4,
    borderColor: '#22C55E',
  },
  incorrectCard: {
    borderWidth: 4,
    borderColor: '#EF4444',
  },
  optionImage: {
    width: '100%',
    height: '100%',
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  feedbackIcon: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});
