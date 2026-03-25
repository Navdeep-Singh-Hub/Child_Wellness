// Game 1: Sentence Introduction - Read "I see a cup"
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { speakInstruction, stopAllAudio } from '../../reader/utils/audio';
import { SENTENCE_SESSION6 } from './gameData';

interface SentenceIntroGameScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export default function SentenceIntroGameScreen({ onNext, onBack }: SentenceIntroGameScreenProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [showImage, setShowImage] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);

  const sentenceScale = useSharedValue(0);
  const sentenceOpacity = useSharedValue(0);
  const imageScale = useSharedValue(0);
  const wordHighlights = SENTENCE_SESSION6.words.map(() => useSharedValue(0));

  useEffect(() => {
    speakInstruction(SENTENCE_SESSION6.sentence).then(() => {
      sentenceScale.value = withSpring(1, { damping: 10, stiffness: 100 });
      sentenceOpacity.value = withTiming(1, { duration: 300 });
      
      // Highlight words one by one
      let wordIndex = 0;
      const highlightNextWord = () => {
        if (wordIndex < SENTENCE_SESSION6.words.length) {
          setCurrentWordIndex(wordIndex);
          wordHighlights[wordIndex].value = withSpring(1, { damping: 10, stiffness: 100 }, () => {
            wordHighlights[wordIndex].value = withTiming(0, { duration: 500 });
            wordIndex++;
            setTimeout(highlightNextWord, 600);
          });
        } else {
          setShowImage(true);
          imageScale.value = withSpring(1, { damping: 10, stiffness: 100 });
          setTimeout(() => {
            setShowNextButton(true);
          }, 1000);
        }
      };
      
      setTimeout(highlightNextWord, 500);
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

  const wordHighlightStyles = wordHighlights.map((highlight) =>
    useAnimatedStyle(() => ({
      backgroundColor: highlight.value > 0.5 ? '#FBBF24' : 'transparent',
      paddingHorizontal: highlight.value > 0.5 ? 8 : 0,
      paddingVertical: highlight.value > 0.5 ? 4 : 0,
      borderRadius: highlight.value > 0.5 ? 8 : 0,
    }))
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Sentence Introduction</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Sentence Display */}
      <View style={styles.sentenceContainer}>
        <Animated.View style={[styles.sentenceBox, sentenceAnimatedStyle]} entering={FadeIn.delay(200)}>
          <Text style={styles.sentenceText}>
            {SENTENCE_SESSION6.words.map((word, index) => (
              <Animated.Text
                key={index}
                style={[
                  styles.sentenceWord,
                  wordHighlightStyles[index],
                ]}
              >
                {word}{index < SENTENCE_SESSION6.words.length - 1 ? ' ' : ''}
              </Animated.Text>
            ))}
          </Text>
        </Animated.View>
      </View>

      {/* Image Display */}
      {showImage && (
        <Animated.View style={[styles.imageContainer, imageAnimatedStyle]} entering={FadeInDown.delay(400)}>
          <View style={styles.imageWrapper}>
            <Text style={styles.cupEmoji}>{SENTENCE_SESSION6.emoji}</Text>
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
  sentenceWord: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1E293B',
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
  cupEmoji: {
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
