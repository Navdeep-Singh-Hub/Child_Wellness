// Game 4: Family Builder
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
import { playSoundEffect, speakWord, speakFamilyEnding, speakFeedback, stopAllAudio } from '../utils/audio';
import { FAMILY_BUILDER_DATA, WordFamily, shuffleArray, WORD_FAMILIES } from '../utils/gameData';

interface FamilyBuilderGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 5;

export default function FamilyBuilderGame({ onComplete, onBack }: FamilyBuilderGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState<typeof FAMILY_BUILDER_DATA[0] | null>(null);
  const [builtWord, setBuiltWord] = useState<string | null>(null);
  const [availableBeginnings, setAvailableBeginnings] = useState<string[]>([]);
  const [selectedBeginning, setSelectedBeginning] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);

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
        await speakFamilyEnding(currentItem.family).catch(() => {});
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
        gameId: 'family-builder',
      });
      return;
    }

    const item = FAMILY_BUILDER_DATA[round % FAMILY_BUILDER_DATA.length];
    const allBeginnings = [...item.correctBeginnings, ...item.wrongBeginnings];
    const shuffled = shuffleArray(allBeginnings);
    
    setCurrentItem(item);
    setBuiltWord(null);
    setAvailableBeginnings(shuffled);
    setSelectedBeginning(null);
    setIsCorrect(null);
    setCanSelect(true);
    wordScale.value = 0;
  };

  const handleBeginningSelect = async (beginning: string) => {
    if (!canSelect || !currentItem) return;

    setCanSelect(false);
    setSelectedBeginning(beginning);
    const correct = currentItem.correctBeginnings.includes(beginning);

    if (correct) {
      setIsCorrect(true);
      setScore(score + 1);
      const newWord = beginning + currentItem.family.replace('-', '');
      setBuiltWord(newWord);
      
      await playSoundEffect('success');
      wordScale.value = withSpring(1, { damping: 10 });
      await speakWord(newWord);
      
      setTimeout(() => {
        setRound(round + 1);
      }, 2500);
    } else {
      setIsCorrect(false);
      await playSoundEffect('error');
      await speakFeedback('Try again!');
      setTimeout(() => {
        setSelectedBeginning(null);
        setIsCorrect(null);
        setCanSelect(true);
      }, 1500);
    }
  };

  const handleFamilyTap = async () => {
    if (!currentItem) return;
    await speakFamilyEnding(currentItem.family);
  };

  const wordAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: wordScale.value }],
  }));

  if (!currentItem) return null;

  const familyData = WORD_FAMILIES.find(f => f.family === currentItem.family);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Family Builder</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}/{TOTAL_ROUNDS}</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Choose a beginning letter to build a word with this family
        </Text>
      </View>

      {/* Family Ending Display */}
      <View style={styles.familyContainer}>
        <Pressable onPress={handleFamilyTap}>
          <View style={[styles.familyCard, { borderColor: familyData?.color || '#A5B4FC' }]}>
            <View style={[styles.familyLabel, { backgroundColor: `${familyData?.color || '#A5B4FC'}20` }]}>
              <Text style={[styles.familyText, { color: familyData?.color || '#A5B4FC' }]}>
                {currentItem.family}
              </Text>
            </View>
            <Text style={styles.tapHint}>Tap to hear</Text>
          </View>
        </Pressable>
      </View>

      {/* Built Word Display */}
      {builtWord && (
        <Animated.View style={[styles.builtWordContainer, wordAnimatedStyle]}>
          <LinearGradient
            colors={['#22C55E', '#16A34A']}
            style={styles.builtWordGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.builtWordText}>{builtWord.toUpperCase()}</Text>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Beginning Letter Options */}
      <View style={styles.lettersContainer}>
        {availableBeginnings.map((beginning, index) => {
          const isSelected = selectedBeginning === beginning;
          const showFeedback = isSelected && isCorrect !== null;
          const isCorrectOption = currentItem.correctBeginnings.includes(beginning);

          return (
            <Pressable
              key={index}
              onPress={() => handleBeginningSelect(beginning)}
              disabled={!canSelect}
              style={styles.letterWrapper}
            >
              <Animated.View
                style={[
                  styles.letterCard,
                  showFeedback && isCorrectOption && styles.correctCard,
                  showFeedback && !isCorrectOption && styles.incorrectCard,
                ]}
              >
                <LinearGradient
                  colors={showFeedback && isCorrectOption ? ['#22C55E', '#16A34A'] : showFeedback && !isCorrectOption ? ['#EF4444', '#DC2626'] : ['#A5B4FC', '#818CF8']}
                  style={styles.letterGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.letterText}>{beginning.toUpperCase()}</Text>
                  {showFeedback && (
                    <View style={styles.feedbackIcon}>
                      <Ionicons
                        name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                        size={24}
                        color="#FFFFFF"
                      />
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
  familyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  familyCard: {
    width: 200,
    height: 120,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A5B4FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  familyLabel: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  familyText: {
    fontSize: 48,
    fontWeight: '800',
  },
  tapHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748B',
  },
  builtWordContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  builtWordGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  builtWordText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  lettersContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
    alignItems: 'center',
  },
  letterWrapper: {
    width: '22%',
  },
  letterCard: {
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#A5B4FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  letterGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  letterText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  feedbackIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  correctCard: {
    borderWidth: 4,
    borderColor: '#22C55E',
  },
  incorrectCard: {
    borderWidth: 4,
    borderColor: '#EF4444',
  },
});
