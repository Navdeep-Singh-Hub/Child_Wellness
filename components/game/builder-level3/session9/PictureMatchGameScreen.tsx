// Game 2: Picture Match - Tap the picture of the word
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, speakWord, stopAllAudio } from '../../builder/utils/audio';
import { READING_WORDS } from './gameData';

interface PictureMatchGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function PictureMatchGameScreen({ onComplete, onBack }: PictureMatchGameScreenProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedPicture, setSelectedPicture] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const pictureScales = READING_WORDS.map(() => useSharedValue(1));
  const wordScale = useSharedValue(1);

  useEffect(() => {
    if (currentWordIndex < READING_WORDS.length) {
      const currentWord = READING_WORDS[currentWordIndex];
      speakInstruction(`Tap the picture of ${currentWord.word}`).then(() => {
        speakWord(currentWord.word);
      });
    }
    return () => stopAllAudio();
  }, [currentWordIndex]);

  const handlePictureSelect = async (word: string) => {
    if (selectedPicture || completed) return;

    const index = READING_WORDS.findIndex(w => w.word === word);
    pictureScales[index].value = withSpring(0.9, {}, () => {
      pictureScales[index].value = withSpring(1);
    });

    setSelectedPicture(word);
    const currentWord = READING_WORDS[currentWordIndex];
    const isCorrect = word === currentWord.word;

    if (isCorrect) {
      await playSoundEffect('correct');
      await speakFeedback('Perfect!');
      
      wordScale.value = withSpring(1.2, {}, () => {
        wordScale.value = withSpring(1);
      });

      setCorrectCount((prev) => {
        const newCount = prev + 1;
        if (newCount >= READING_WORDS.length) {
          setTimeout(() => {
            setCompleted(true);
            playSoundEffect('celebration');
            speakFeedback('Excellent! All pictures matched!');
            setTimeout(() => {
              onComplete();
            }, 2000);
          }, 2000);
        } else {
          setTimeout(() => {
            setCurrentWordIndex(newCount);
            setSelectedPicture(null);
          }, 2000);
        }
        return newCount;
      });
    } else {
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
      
      setTimeout(() => {
        setSelectedPicture(null);
      }, 1500);
    }
  };

  const wordAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: wordScale.value }],
  }));

  const currentWord = READING_WORDS[currentWordIndex];
  if (!currentWord) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Find the Picture</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Word {currentWordIndex + 1} of {READING_WORDS.length}
        </Text>
      </View>

      {/* Word Display */}
      <Animated.View style={[styles.wordDisplay, wordAnimatedStyle]}>
        <Text style={styles.wordLabel}>Find the picture of:</Text>
        <View style={styles.wordBox}>
          <Text style={styles.wordText}>{currentWord.word}</Text>
        </View>
      </Animated.View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Tap the matching picture</Text>
      </View>

      {/* Pictures */}
      <View style={styles.picturesContainer}>
        {READING_WORDS.map((word, index) => {
          const isSelected = selectedPicture === word.word;
          const isCorrect = word.word === currentWord.word;
          const showFeedback = selectedPicture !== null;

          const pictureAnimatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: pictureScales[index].value }],
          }));

          let cardColors = ['#FFFFFF', '#F8FAFC'];
          if (showFeedback) {
            if (isSelected && isCorrect) {
              cardColors = ['#ECFDF5', '#D1FAE5'];
            } else if (isSelected && !isCorrect) {
              cardColors = ['#FEF2F2', '#FEE2E2'];
            }
          }

          return (
            <Animated.View
              key={word.word}
              entering={FadeInDown.delay(index * 100)}
              style={pictureAnimatedStyle}
            >
              <Pressable
                onPress={() => handlePictureSelect(word.word)}
                disabled={completed}
                style={styles.pictureCard}
              >
                <LinearGradient
                  colors={cardColors}
                  style={styles.pictureCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.pictureEmoji}>{word.emoji}</Text>
                  {showFeedback && isSelected && (
                    <View style={styles.resultIcon}>
                      <Ionicons
                        name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                        size={32}
                        color={isCorrect ? '#10B981' : '#EF4444'}
                      />
                    </View>
                  )}
                </LinearGradient>
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
  },
  wordDisplay: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  wordLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  wordBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderWidth: 4,
    borderColor: '#6C9EFF',
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  wordText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#6C9EFF',
    letterSpacing: 4,
  },
  instructionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  picturesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  pictureCard: {
    width: '45%',
    maxWidth: 160,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  pictureCardGradient: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    position: 'relative',
  },
  pictureEmoji: {
    fontSize: 80,
  },
  resultIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
