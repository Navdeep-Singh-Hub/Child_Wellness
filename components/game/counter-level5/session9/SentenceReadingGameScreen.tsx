// Game 1: Sentence Reading - Read "I see a dog"
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { speakInstruction, stopAllAudio } from '../../counter/utils/audio';
import { SENTENCE_SESSION9 } from './gameData';

interface SentenceReadingGameScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export default function SentenceReadingGameScreen({ onNext, onBack }: SentenceReadingGameScreenProps) {
  const [showImage, setShowImage] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);

  const sentenceScale = useSharedValue(0);
  const sentenceOpacity = useSharedValue(0);
  const imageScale = useSharedValue(0);

  useEffect(() => {
    speakInstruction(SENTENCE_SESSION9.sentence).then(() => {
      sentenceScale.value = withSpring(1, { damping: 10, stiffness: 100 });
      sentenceOpacity.value = withTiming(1, { duration: 300 });
      
      setTimeout(() => {
        setShowImage(true);
        imageScale.value = withSpring(1, { damping: 10, stiffness: 100 });
        setTimeout(() => {
          setShowNextButton(true);
        }, 1000);
      }, 1500);
    });

    return () => {
      stopAllAudio();
    };
  }, []);

  const sentenceAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sentenceScale.value }],
    opacity: sentenceOpacity.value,
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  const sentenceParts = SENTENCE_SESSION9.sentence.split(' ');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Read the Sentence</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Sentence Display */}
      <View style={styles.sentenceContainer}>
        <Animated.View style={[styles.sentenceBox, sentenceAnimatedStyle]} entering={FadeIn.delay(200)}>
          <Text style={styles.sentenceText}>
            {sentenceParts.map((part, index) => {
              const isHighlighted = part.toUpperCase() === SENTENCE_SESSION9.highlightedWord;
              return (
                <Text
                  key={index}
                  style={[
                    styles.sentencePart,
                    isHighlighted && styles.highlightedWord,
                  ]}
                >
                  {part}{index < sentenceParts.length - 1 ? ' ' : ''}
                </Text>
              );
            })}
          </Text>
        </Animated.View>
      </View>

      {/* Image Display */}
      {showImage && (
        <Animated.View style={[styles.imageContainer, imageAnimatedStyle]} entering={FadeInDown.delay(400)}>
          <View style={styles.imageWrapper}>
            <Text style={styles.dogEmoji}>{SENTENCE_SESSION9.emoji}</Text>
          </View>
        </Animated.View>
      )}

      {/* Next Button */}
      {showNextButton && (
        <Animated.View entering={FadeInDown.delay(600)} style={styles.buttonContainer}>
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
  sentenceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sentenceBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingVertical: 40,
    paddingHorizontal: 40,
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#6C9EFF',
  },
  sentenceText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  sentencePart: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1E293B',
  },
  highlightedWord: {
    backgroundColor: '#FBBF24',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  imageContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
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
