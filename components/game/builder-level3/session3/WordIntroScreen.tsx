// Game 1: Word Introduction - Animated letters D-O-G
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { speakLetter, speakWord, speakInstruction, stopAllAudio } from '../../builder/utils/audio';

interface WordIntroScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const LETTERS = ['D', 'O', 'G'];

export default function WordIntroScreen({ onNext, onBack }: WordIntroScreenProps) {
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [showImage, setShowImage] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);

  const letterScale = useSharedValue(0);
  const letterOpacity = useSharedValue(0);
  const imageScale = useSharedValue(0);
  const imageOpacity = useSharedValue(0);

  useEffect(() => {
    speakInstruction('Watch the letters appear one by one').then(() => {
      animateLetters();
    });

    return () => {
      stopAllAudio();
    };
  }, []);

  const animateLetters = async () => {
    for (let i = 0; i < LETTERS.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentLetterIndex(i);
      letterScale.value = 0;
      letterOpacity.value = 0;
      
      letterScale.value = withSpring(1, { damping: 10, stiffness: 100 });
      letterOpacity.value = withTiming(1, { duration: 300 });
      
      await speakLetter(LETTERS[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    await speakWord('DOG');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setShowImage(true);
    imageScale.value = withSpring(1, { damping: 10, stiffness: 100 });
    imageOpacity.value = withTiming(1, { duration: 300 });

    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowNextButton(true);
  };

  const letterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: letterScale.value }],
    opacity: letterOpacity.value,
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
    opacity: imageOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Word Introduction</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Letters Display */}
      <View style={styles.lettersContainer}>
        <Text style={styles.instructionText}>Watch the letters appear:</Text>
        <View style={styles.lettersRow}>
          {LETTERS.map((letter, index) => {
            const isVisible = index <= currentLetterIndex;
            return (
              <Animated.View
                key={letter}
                entering={FadeIn.delay(index * 500)}
                style={[
                  styles.letterBox,
                  !isVisible && styles.letterBoxHidden,
                  index === currentLetterIndex && letterAnimatedStyle,
                ]}
              >
                <Text style={styles.letterText}>{letter}</Text>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* Image Display */}
      {showImage && (
        <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
          <Text style={styles.imageLabel}>This is a DOG</Text>
          <View style={styles.imageWrapper}>
            <Text style={styles.dogEmoji}>🐶</Text>
          </View>
        </Animated.View>
      )}

      {/* Next Button */}
      {showNextButton && (
        <Animated.View entering={FadeInDown.delay(200)} style={styles.buttonContainer}>
          <Pressable onPress={onNext} style={styles.nextButton}>
            <LinearGradient
              colors={['#6C9EFF', '#818CF8']}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.nextButtonText}>Next →</Text>
            </LinearGradient>
          </Pressable>
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
  lettersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 40,
    textAlign: 'center',
  },
  lettersRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
  },
  letterBox: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 4,
    borderColor: '#6C9EFF',
  },
  letterBoxHidden: {
    opacity: 0.3,
    borderColor: '#E2E8F0',
  },
  letterText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#6C9EFF',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  imageLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  imageWrapper: {
    width: 200,
    height: 200,
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
  dogEmoji: {
    fontSize: 120,
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
