// Game 1: Word Recognition - Listen and tap the word
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, speakWord, stopAllAudio } from '../../builder/utils/audio';
import { CVC_WORDS } from './gameData';

interface WordRecognitionGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function WordRecognitionGameScreen({ onComplete, onBack }: WordRecognitionGameScreenProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const buttonScales = CVC_WORDS.map(() => useSharedValue(1));
  const resultScale = useSharedValue(0);

  useEffect(() => {
    if (currentWordIndex < CVC_WORDS.length) {
      const currentWord = CVC_WORDS[currentWordIndex];
      speakInstruction(`Tap the word ${currentWord.word}`).then(() => {
        speakWord(currentWord.word);
      });
    }
    return () => stopAllAudio();
  }, [currentWordIndex]);

  const handleWordSelect = async (word: string) => {
    if (selectedWord || completed) return;

    const index = CVC_WORDS.findIndex(w => w.word === word);
    buttonScales[index].value = withSpring(0.9, {}, () => {
      buttonScales[index].value = withSpring(1);
    });

    setSelectedWord(word);
    const currentWord = CVC_WORDS[currentWordIndex];
    const isCorrect = word === currentWord.word;

    if (isCorrect) {
      await playSoundEffect('correct');
      await speakFeedback('Great job!');
      
      setShowResult(true);
      resultScale.value = withSpring(1, { damping: 10, stiffness: 100 });

      setCorrectCount(prev => {
        const newCount = prev + 1;
        if (newCount >= CVC_WORDS.length) {
          setTimeout(() => {
            setCompleted(true);
            playSoundEffect('celebration');
            speakFeedback('Excellent! You recognized all the words!');
            setTimeout(() => {
              onComplete();
            }, 2000);
          }, 2000);
        } else {
          setTimeout(() => {
            setCurrentWordIndex(newCount);
            setSelectedWord(null);
            setShowResult(false);
            resultScale.value = 0;
          }, 2000);
        }
        return newCount;
      });
    } else {
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
      
      setTimeout(() => {
        setSelectedWord(null);
      }, 1500);
    }
  };

  const resultAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: resultScale.value }],
  }));

  const currentWord = CVC_WORDS[currentWordIndex];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Word Recognition</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Word {currentWordIndex + 1} of {CVC_WORDS.length}
        </Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Tap the word you hear</Text>
      </View>

      {/* Word Cards */}
      <View style={styles.wordsContainer}>
        {CVC_WORDS.map((word, index) => {
          const isSelected = selectedWord === word.word;
          const isCorrect = word.word === currentWord.word;
          const showFeedback = selectedWord !== null;

          const buttonAnimatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: buttonScales[index].value }],
          }));

          let buttonColors = ['#C7D2FE', '#A5B4FC'];
          if (showFeedback) {
            if (isSelected && isCorrect) {
              buttonColors = ['#22C55E', '#16A34A'];
            } else if (isSelected && !isCorrect) {
              buttonColors = ['#EF4444', '#DC2626'];
            }
          }

          return (
            <Animated.View
              key={word.word}
              entering={FadeInDown.delay(index * 100)}
              style={buttonAnimatedStyle}
            >
              <Pressable
                onPress={() => handleWordSelect(word.word)}
                disabled={completed}
                style={styles.wordCard}
              >
                <LinearGradient
                  colors={buttonColors}
                  style={styles.wordCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.wordText}>{word.word}</Text>
                  {showFeedback && isSelected && (
                    <View style={styles.resultIcon}>
                      <Ionicons
                        name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                        size={32}
                        color="#FFFFFF"
                      />
                    </View>
                  )}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      {/* Result Image */}
      {showResult && currentWord && (
        <Animated.View style={[styles.resultContainer, resultAnimatedStyle]}>
          <Text style={styles.resultLabel}>Great job! 🎉</Text>
          <View style={styles.resultImage}>
            <Text style={styles.resultEmoji}>{currentWord.emoji}</Text>
          </View>
        </Animated.View>
      )}
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
  instructionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  wordsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  wordCard: {
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
  wordCardGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    position: 'relative',
  },
  wordText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  resultIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  resultLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  resultImage: {
    width: 150,
    height: 150,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  resultEmoji: {
    fontSize: 100,
  },
});
