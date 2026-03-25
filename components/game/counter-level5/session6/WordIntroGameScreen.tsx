// Game 1: Sight Word Introduction - Word "WE"
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { speakInstruction, speakWord, stopAllAudio } from '../../counter/utils/audio';
import { SIGHT_WORD_WE } from './gameData';

interface WordIntroGameScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export default function WordIntroGameScreen({ onNext, onBack }: WordIntroGameScreenProps) {
  const [showSentence, setShowSentence] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);

  const wordScale = useSharedValue(0);
  const wordOpacity = useSharedValue(0);
  const sentenceScale = useSharedValue(0);
  const imageScale = useSharedValue(0);

  useEffect(() => {
    speakInstruction('This word is WE').then(() => {
      speakWord('WE').then(() => {
        wordScale.value = withSpring(1, { damping: 10, stiffness: 100 });
        wordOpacity.value = withTiming(1, { duration: 300 });
        
        setTimeout(() => {
          setShowSentence(true);
          sentenceScale.value = withSpring(1, { damping: 10, stiffness: 100 });
          speakInstruction('We play').then(() => {
            setTimeout(() => {
              setShowImage(true);
              imageScale.value = withSpring(1, { damping: 10, stiffness: 100 });
              setTimeout(() => {
                setShowNextButton(true);
              }, 1000);
            }, 1000);
          });
        }, 1500);
      });
    });

    return () => {
      stopAllAudio();
    };
  }, []);

  const wordAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: wordScale.value }],
    opacity: wordOpacity.value,
  }));

  const sentenceAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sentenceScale.value }],
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Sight Word</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Word Display */}
      <View style={styles.wordContainer}>
        <Animated.View style={[styles.wordBox, wordAnimatedStyle]}>
          <Text style={styles.wordText}>{SIGHT_WORD_WE.word}</Text>
        </Animated.View>
      </View>

      {/* Sentence Display */}
      {showSentence && (
        <Animated.View style={[styles.sentenceContainer, sentenceAnimatedStyle]} entering={FadeIn.delay(200)}>
          <Text style={styles.sentenceText}>{SIGHT_WORD_WE.sentence}</Text>
        </Animated.View>
      )}

      {/* Image Display */}
      {showImage && (
        <Animated.View style={[styles.imageContainer, imageAnimatedStyle]} entering={FadeInDown.delay(400)}>
          <View style={styles.imageWrapper}>
            <Text style={styles.childrenEmoji}>{SIGHT_WORD_WE.emoji}</Text>
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
  wordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  wordBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingVertical: 60,
    paddingHorizontal: 80,
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 6,
    borderColor: '#6C9EFF',
  },
  wordText: {
    fontSize: 96,
    fontWeight: '900',
    color: '#6C9EFF',
    letterSpacing: 8,
  },
  sentenceContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sentenceText: {
    fontSize: 36,
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
  childrenEmoji: {
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
