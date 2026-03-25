// Game 1: Story Reading - Read the passage with highlighting
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { speakStory, stopAllAudio } from '../../clockwise/utils/audio';
import { STORY_SESSION1 } from './gameData';

interface StoryReadingGameScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export default function StoryReadingGameScreen({ onNext, onBack }: StoryReadingGameScreenProps) {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
  const [showIllustration, setShowIllustration] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);

  const storyScale = useSharedValue(0);
  const storyOpacity = useSharedValue(0);
  const illustrationScale = useSharedValue(0);
  const sentenceHighlights = STORY_SESSION1.passage.map(() => useSharedValue(0));

  useEffect(() => {
    speakStory(STORY_SESSION1.passage).then(() => {
      storyScale.value = withSpring(1, { damping: 10, stiffness: 100 });
      storyOpacity.value = withTiming(1, { duration: 300 });
      
      // Highlight sentences one by one
      let sentenceIndex = 0;
      const highlightNextSentence = () => {
        if (sentenceIndex < STORY_SESSION1.passage.length) {
          setCurrentSentenceIndex(sentenceIndex);
          sentenceHighlights[sentenceIndex].value = withSpring(1, { damping: 10, stiffness: 100 }, () => {
            sentenceHighlights[sentenceIndex].value = withTiming(0, { duration: 500 });
            sentenceIndex++;
            setTimeout(highlightNextSentence, 600);
          });
        } else {
          setShowIllustration(true);
          illustrationScale.value = withSpring(1, { damping: 10, stiffness: 100 });
          setTimeout(() => {
            setShowNextButton(true);
          }, 1000);
        }
      };
      
      setTimeout(highlightNextSentence, 500);
    });

    return () => {
      stopAllAudio();
    };
  }, []);

  const storyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: storyScale.value }],
    opacity: storyOpacity.value,
  }));

  const illustrationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: illustrationScale.value }],
  }));

  const sentenceHighlightStyles = sentenceHighlights.map((highlight) =>
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
        <Text style={styles.headerTitle}>Story Reading</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Story Display */}
      <View style={styles.storyContainer}>
        <Animated.View style={[styles.storyBox, storyAnimatedStyle]} entering={FadeIn.delay(200)}>
          {STORY_SESSION1.passage.map((sentence, index) => (
            <Animated.Text
              key={index}
              style={[
                styles.sentenceText,
                sentenceHighlightStyles[index],
              ]}
            >
              {sentence}
              {index < STORY_SESSION1.passage.length - 1 ? ' ' : ''}
            </Animated.Text>
          ))}
        </Animated.View>
      </View>

      {/* Illustration Display */}
      {showIllustration && (
        <Animated.View style={[styles.illustrationContainer, illustrationAnimatedStyle]} entering={FadeInDown.delay(400)}>
          <View style={styles.illustrationWrapper}>
            <Text style={styles.illustrationEmoji}>{STORY_SESSION1.illustration.emoji}</Text>
            <Text style={styles.illustrationText}>⚽ 🏞️</Text>
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
  storyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  storyBox: {
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
    maxWidth: '90%',
  },
  sentenceText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: 8,
  },
  illustrationContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  illustrationWrapper: {
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
  illustrationEmoji: {
    fontSize: 80,
    marginBottom: 8,
  },
  illustrationText: {
    fontSize: 40,
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
