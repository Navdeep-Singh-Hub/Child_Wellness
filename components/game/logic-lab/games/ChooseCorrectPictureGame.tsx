// Game 2: Choose the Correct Picture
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
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../utils/audio';
import { PICTURE_CHOICE_DATA, PictureChoice } from '../utils/gameData';

interface ChooseCorrectPictureGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;

export default function ChooseCorrectPictureGame({ onComplete, onBack }: ChooseCorrectPictureGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState<PictureChoice | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
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
        await speakInstruction(currentItem.instruction).catch(() => {});
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
        gameId: 'choose-correct-picture',
      });
      return;
    }

    const item = PICTURE_CHOICE_DATA[round % PICTURE_CHOICE_DATA.length];
    
    setCurrentItem(item);
    setSelectedOption(null);
    setIsCorrect(null);
    setCanSelect(true);
    cardScale.value = 1;
    cardGlow.value = 0;
  };

  const handleOptionSelect = async (optionId: string) => {
    if (!canSelect || !currentItem) return;

    setCanSelect(false);
    setSelectedOption(optionId);
    const option = currentItem.options.find(opt => opt.id === optionId);
    const correct = option?.correct || false;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      cardGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakFeedback('Perfect!');
    } else {
      cardScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 8 })
      );
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
      setTimeout(() => {
        setCanSelect(true);
        setSelectedOption(null);
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
      speakInstruction(currentItem.instruction);
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
        <Text style={styles.instructionsText}>Tap the picture that matches the instruction</Text>
      </View>

      {/* Replay Button */}
      <View style={styles.replayContainer}>
        <Pressable onPress={handleReplay} style={styles.replayButton}>
          <LinearGradient
            colors={['#93C5FD', '#60A5FA']}
            style={styles.replayGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="volume-high" size={24} color="#FFFFFF" />
            <Text style={styles.replayText}>Replay Instruction</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Picture Options */}
      <View style={styles.optionsContainer}>
        {currentItem.options.map((option, index) => {
          const isSelected = selectedOption === option.id;
          const showCorrect = isSelected && isCorrect === true;
          const showIncorrect = isSelected && isCorrect === false;

          return (
            <Pressable
              key={option.id}
              onPress={() => handleOptionSelect(option.id)}
              disabled={!canSelect}
              style={styles.optionWrapper}
            >
              <Animated.View
                style={[
                  styles.pictureCard,
                  cardAnimatedStyle,
                  showCorrect && styles.correctCard,
                  showIncorrect && styles.incorrectCard,
                ]}
              >
                <LinearGradient
                  colors={showCorrect ? ['#A7F3D0', '#6EE7B7'] : showIncorrect ? ['#FBCFE8', '#F9A8D4'] : ['#FFFFFF', '#F8F9FA']}
                  style={styles.pictureGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.pictureContent}>
                    <Text style={styles.pictureEmoji}>{option.emoji}</Text>
                    <Text style={styles.pictureDescription}>{option.description}</Text>
                    {showCorrect && (
                      <View style={styles.feedbackIcon}>
                        <Ionicons name="checkmark-circle" size={40} color="#16A34A" />
                      </View>
                    )}
                    {showIncorrect && (
                      <View style={styles.feedbackIcon}>
                        <Ionicons name="close-circle" size={40} color="#EC4899" />
                      </View>
                    )}
                  </View>
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
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  optionWrapper: {
    marginBottom: 16,
  },
  pictureCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#93C5FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  correctCard: {
    borderWidth: 4,
    borderColor: '#A7F3D0',
  },
  incorrectCard: {
    borderWidth: 4,
    borderColor: '#FBCFE8',
  },
  pictureGradient: {
    padding: 24,
    position: 'relative',
  },
  pictureContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pictureEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  pictureDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  feedbackIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});
