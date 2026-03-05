// Game 2: Picture to Word Family Match
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
import { playSoundEffect, speakWord, speakFamilyEnding, speakFeedback, stopAllAudio } from '../utils/audio';
import { PICTURE_FAMILY_DATA, WordFamily, shuffleArray } from '../utils/gameData';

interface PictureToFamilyGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;

export default function PictureToFamilyGame({ onComplete, onBack }: PictureToFamilyGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState<typeof PICTURE_FAMILY_DATA[0] | null>(null);
  const [options, setOptions] = useState<WordFamily[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<WordFamily | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);
  const [showWord, setShowWord] = useState(false);

  const pictureScale = useSharedValue(1);
  const wordScale = useSharedValue(0);
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
        await speakWord(currentItem.word).catch(() => {});
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
        gameId: 'picture-to-family',
      });
      return;
    }

    const item = PICTURE_FAMILY_DATA[round % PICTURE_FAMILY_DATA.length];
    const allOptions = [item.family, ...item.wrongFamilies];
    const shuffled = shuffleArray(allOptions);
    
    setCurrentItem(item);
    setOptions(shuffled);
    setSelectedFamily(null);
    setIsCorrect(null);
    setCanSelect(true);
    setShowWord(false);
    pictureScale.value = 1;
    wordScale.value = 0;
  };

  const handleFamilySelect = async (family: WordFamily) => {
    if (!canSelect || !currentItem) return;

    setCanSelect(false);
    setSelectedFamily(family);
    const correct = family === currentItem.family;

    if (correct) {
      setIsCorrect(true);
      setScore(score + 1);
      await playSoundEffect('success');
      await speakFamilyEnding(family);
      
      // Show the full word
      setShowWord(true);
      wordScale.value = withSpring(1, { damping: 10 });
      await speakWord(currentItem.word);
      
      setTimeout(() => {
        setRound(round + 1);
      }, 2500);
    } else {
      setIsCorrect(false);
      await playSoundEffect('error');
      await speakFeedback('Try again!');
      setTimeout(() => {
        setSelectedFamily(null);
        setIsCorrect(null);
        setCanSelect(true);
      }, 1500);
    }
  };

  const handlePictureTap = async () => {
    if (!currentItem) return;
    await speakWord(currentItem.word);
  };

  const pictureAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pictureScale.value }],
  }));

  const wordAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: wordScale.value }],
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
        <Text style={styles.headerTitle}>Picture to Family</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}/{TOTAL_ROUNDS}</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Tap the picture to hear the word, then choose the correct word family ending
        </Text>
      </View>

      {/* Picture */}
      <View style={styles.pictureContainer}>
        <Pressable onPress={handlePictureTap}>
          <Animated.View style={[styles.pictureCard, pictureAnimatedStyle]}>
            <Image source={{ uri: currentItem.picture }} style={styles.picture} resizeMode="cover" />
            <View style={styles.soundOverlay}>
              <Ionicons name="volume-high" size={24} color="#FFFFFF" />
            </View>
          </Animated.View>
        </Pressable>
        <Text style={styles.tapHint}>Tap to hear the word</Text>
      </View>

      {/* Word Display (shown after correct selection) */}
      {showWord && (
        <Animated.View style={[styles.wordDisplay, wordAnimatedStyle]}>
          <LinearGradient
            colors={['#22C55E', '#16A34A']}
            style={styles.wordGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.wordText}>{currentItem.word.toUpperCase()}</Text>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Family Options */}
      <View style={styles.optionsContainer}>
        {options.map((family, index) => {
          const isSelected = selectedFamily === family;
          const showFeedback = isSelected && isCorrect !== null;
          const isCorrectOption = family === currentItem.family;
          const familyData = family === '-at' ? { color: '#A5B4FC' } : family === '-in' ? { color: '#FBCFE8' } : { color: '#99F6E4' };

          return (
            <Pressable
              key={index}
              onPress={() => handleFamilySelect(family)}
              disabled={!canSelect}
              style={styles.optionWrapper}
            >
              <Animated.View
                style={[
                  styles.optionCard,
                  { borderColor: familyData.color },
                  showFeedback && isCorrectOption && styles.correctCard,
                  showFeedback && !isCorrectOption && styles.incorrectCard,
                ]}
              >
                <View style={[styles.familyLabel, { backgroundColor: `${familyData.color}20` }]}>
                  <Text style={[styles.familyText, { color: familyData.color }]}>
                    {family}
                  </Text>
                </View>
                {showFeedback && (
                  <View style={styles.feedbackIcon}>
                    <Ionicons
                      name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                      size={32}
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
  pictureContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  pictureCard: {
    width: 200,
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#A5B4FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 12,
  },
  picture: {
    width: '100%',
    height: '100%',
  },
  soundOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    padding: 8,
  },
  tapHint: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  wordDisplay: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  wordGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  wordText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
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
    aspectRatio: 0.9,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  correctCard: {
    borderWidth: 4,
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  incorrectCard: {
    borderWidth: 4,
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  familyLabel: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  familyText: {
    fontSize: 32,
    fontWeight: '800',
  },
  feedbackIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
