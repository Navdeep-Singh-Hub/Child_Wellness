// Game 1: Word Reading - Read the word aloud
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, speakWord, stopAllAudio } from '../../builder/utils/audio';
import { READING_WORDS } from './gameData';

interface WordReadingGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function WordReadingGameScreen({ onComplete, onBack }: WordReadingGameScreenProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [wordsRead, setWordsRead] = useState(0);

  const wordScale = useSharedValue(1);
  const wordOpacity = useSharedValue(1);

  useEffect(() => {
    if (currentWordIndex < READING_WORDS.length) {
      const currentWord = READING_WORDS[currentWordIndex];
      speakInstruction(`Read the word ${currentWord.word}`).catch(() => {});
    }
    return () => stopAllAudio();
  }, [currentWordIndex]);

  const handleNext = async () => {
    if (completed) return;

    wordScale.value = withSpring(0.8, {}, () => {
      wordScale.value = withSpring(1);
    });

    await playSoundEffect('correct');
    await speakFeedback('Great reading!');

    setWordsRead((prev) => {
      const newCount = prev + 1;
      if (newCount >= READING_WORDS.length) {
        setTimeout(() => {
          setCompleted(true);
          playSoundEffect('celebration');
          speakFeedback('Excellent! You read all the words!');
          setTimeout(() => {
            onComplete();
          }, 2000);
        }, 1000);
      } else {
        setTimeout(() => {
          setCurrentWordIndex(newCount);
        }, 1500);
      }
      return newCount;
    });
  };

  const handlePlaySound = async () => {
    const currentWord = READING_WORDS[currentWordIndex];
    if (currentWord) {
      await speakWord(currentWord.word);
    }
  };

  const wordAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: wordScale.value }],
    opacity: wordOpacity.value,
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
        <Text style={styles.headerTitle}>Read the Word</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Word {currentWordIndex + 1} of {READING_WORDS.length}
        </Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Read the word</Text>
      </View>

      {/* Word Display */}
      <Animated.View style={[styles.wordContainer, wordAnimatedStyle]} entering={FadeInUp.delay(200)}>
        <View style={styles.wordBox}>
          <Text style={styles.wordText}>{currentWord.word}</Text>
        </View>
        <Text style={styles.wordEmoji}>{currentWord.emoji}</Text>
      </Animated.View>

      {/* Voice Button */}
      <Animated.View entering={FadeInDown.delay(400)} style={styles.voiceButtonContainer}>
        <Pressable onPress={handlePlaySound} style={styles.voiceButton}>
          <LinearGradient
            colors={['#FFB6C1', '#FF9EC4']}
            style={styles.voiceButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="volume-high" size={32} color="#FFFFFF" />
            <Text style={styles.voiceButtonText}>Tap to hear</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {/* Next Button */}
      <Animated.View entering={FadeInDown.delay(600)} style={styles.buttonContainer}>
        <Pressable onPress={handleNext} style={styles.nextButton}>
          <LinearGradient
            colors={['#6C9EFF', '#818CF8']}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.nextButtonText}>I Read It! →</Text>
          </LinearGradient>
        </Pressable>
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
  wordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  wordBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingVertical: 40,
    paddingHorizontal: 60,
    marginBottom: 32,
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 6,
    borderColor: '#6C9EFF',
  },
  wordText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#6C9EFF',
    letterSpacing: 8,
  },
  wordEmoji: {
    fontSize: 120,
  },
  voiceButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  voiceButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  voiceButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  voiceButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nextButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
