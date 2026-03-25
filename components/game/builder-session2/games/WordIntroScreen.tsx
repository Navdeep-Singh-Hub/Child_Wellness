// Game 1: Word Introduction
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakLetter, speakWord, stopAllAudio } from '../utils/audio';
import { WORD_BAT } from '../utils/gameData';

interface WordIntroScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function WordIntroScreen({ onComplete, onBack }: WordIntroScreenProps) {
  const { width, height } = useWindowDimensions();
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [showImage, setShowImage] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const letterScale = useSharedValue(0);
  const imageScale = useSharedValue(0);

  useEffect(() => {
    if (hasStarted && currentLetterIndex < WORD_BAT.letters.length) {
      letterScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1, { damping: 10, stiffness: 100 }),
        withTiming(1, { duration: 1000 })
      );
      speakLetter(WORD_BAT.letters[currentLetterIndex]);
      playSoundEffect('letter');
      
      const timer = setTimeout(() => {
        if (currentLetterIndex < WORD_BAT.letters.length - 1) {
          setCurrentLetterIndex((prev) => prev + 1);
        } else {
          setTimeout(() => {
            speakWord(WORD_BAT.word);
            setShowImage(true);
            imageScale.value = withSpring(1, { damping: 10, stiffness: 100 });
            playSoundEffect('celebration');
          }, 1000);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentLetterIndex, hasStarted]);

  const letterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: letterScale.value }],
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  const handleStart = () => {
    setHasStarted(true);
    playSoundEffect('click');
  };

  const handleNext = () => {
    onComplete();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#6C9EFF', '#FFB6C1', '#7FE7CC'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Word Introduction</Text>
      </View>

      {/* Letters Display */}
      <View style={styles.lettersContainer}>
        {WORD_BAT.letters.map((letter, idx) => {
          const isActive = idx === currentLetterIndex && hasStarted;
          const isShown = idx <= currentLetterIndex && hasStarted;
          
          return (
            <Animated.View
              key={letter}
              style={[
                styles.letterCard,
                isActive && letterAnimatedStyle,
                !isShown && styles.letterCardHidden,
              ]}
            >
              <Text style={styles.letterText}>{letter}</Text>
            </Animated.View>
          );
        })}
      </View>

      {/* Word Display */}
      {hasStarted && currentLetterIndex === WORD_BAT.letters.length - 1 && (
        <View style={styles.wordContainer}>
          <Text style={styles.wordText}>{WORD_BAT.word}</Text>
        </View>
      )}

      {/* Image Display */}
      {showImage && (
        <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
          <Text style={styles.imageEmoji}>{WORD_BAT.image}</Text>
          <Text style={styles.imageText}>Bat</Text>
        </Animated.View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {!hasStarted ? (
          <Pressable style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>Start</Text>
            <Ionicons name="play" size={20} color="#fff" />
          </Pressable>
        ) : showImage ? (
          <Pressable style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        ) : null}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
  },
  lettersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
    marginTop: 40,
  },
  letterCard: {
    width: 120,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#6C9EFF',
  },
  letterCardHidden: {
    opacity: 0,
  },
  letterText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#6C9EFF',
  },
  wordContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  wordText: {
    fontSize: 64,
    fontWeight: '900',
    color: '#1E293B',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  imageEmoji: {
    fontSize: 120,
  },
  imageText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 16,
  },
  controls: {
    padding: 20,
    marginTop: 'auto',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C9EFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7FE7CC',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
