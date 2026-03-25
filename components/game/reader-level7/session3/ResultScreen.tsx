// Result Screen - Show detection results for Level 7 Session 3
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakFeedback, stopAllAudio } from '../../reader/utils/audio';

interface ResultScreenProps {
  result: {
    sentenceDetected: boolean;
    subtractionCorrect: boolean;
    threeStarsDetected: boolean;
  };
  onRetry: () => void;
  onComplete: () => void;
}

export default function ResultScreen({ result, onRetry, onComplete }: ResultScreenProps) {
  const [showStars, setShowStars] = useState(false);
  const starScales = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];

  const allDetected =
    result.sentenceDetected &&
    result.subtractionCorrect &&
    result.threeStarsDetected;

  const score = [
    result.sentenceDetected,
    result.subtractionCorrect,
    result.threeStarsDetected,
  ].filter(Boolean).length;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowStars(true);
      starScales.forEach((scale, index) => {
        scale.value = withSpring(1, { damping: 10, stiffness: 100 }, () => {
          if (index === starScales.length - 1) {
            playSoundEffect('celebration').catch(() => {});
          }
        });
      });
    }, 500);

    if (allDetected) {
      speakFeedback('Great job! You read the sentence and solved subtraction!').catch(() => {});
    } else {
      speakFeedback('Good try! Let\'s practice more.').catch(() => {});
    }

    return () => {
      clearTimeout(timer);
      stopAllAudio();
    };
  }, []);

  const starAnimatedStyles = starScales.map((scale) =>
    useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }))
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Title */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.titleContainer}>
          <Text style={styles.title}>Great Job! 🎉</Text>
          <Text style={styles.subtitle}>Session 3 Complete</Text>
        </Animated.View>

        {/* Stars */}
        {showStars && (
          <Animated.View entering={FadeInDown.delay(400)} style={styles.starsContainer}>
            {[0, 1, 2].map((index) => (
              <Animated.View key={index} style={starAnimatedStyles[index]}>
                <Ionicons
                  name={index < score ? 'star' : 'star-outline'}
                  size={64}
                  color={index < score ? '#FBBF24' : '#D1D5DB'}
                />
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {/* Results */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Your Results:</Text>

          <View style={styles.resultItem}>
            <Ionicons
              name={result.sentenceDetected ? 'checkmark-circle' : 'close-circle'}
              size={32}
              color={result.sentenceDetected ? '#10B981' : '#EF4444'}
            />
            <Text style={styles.resultText}>
              Sentence "I see a bat" {result.sentenceDetected ? 'found ✓' : 'not found'}
            </Text>
          </View>

          <View style={styles.resultItem}>
            <Ionicons
              name={result.subtractionCorrect ? 'checkmark-circle' : 'close-circle'}
              size={32}
              color={result.subtractionCorrect ? '#10B981' : '#EF4444'}
            />
            <Text style={styles.resultText}>
              Subtraction 5-2=3 {result.subtractionCorrect ? 'correct ✓' : 'not found or incorrect'}
            </Text>
          </View>

          <View style={styles.resultItem}>
            <Ionicons
              name={result.threeStarsDetected ? 'checkmark-circle' : 'close-circle'}
              size={32}
              color={result.threeStarsDetected ? '#10B981' : '#EF4444'}
            />
            <Text style={styles.resultText}>
              Three stars {result.threeStarsDetected ? 'found ✓' : 'not found'}
            </Text>
          </View>
        </Animated.View>

        {/* Message */}
        <Animated.View entering={FadeInDown.delay(800)} style={styles.messageContainer}>
          {allDetected ? (
            <>
              <Text style={styles.messageTitle}>Awesome! ⭐</Text>
              <Text style={styles.messageText}>
                You read the sentence and solved subtraction! Great work!
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.messageTitle}>Good Try! 💪</Text>
              <Text style={styles.messageText}>
                {!result.sentenceDetected && 'We couldn\'t find the sentence "I see a bat". '}
                {!result.subtractionCorrect && 'We couldn\'t find 5-2=3 solved correctly. '}
                {!result.threeStarsDetected && 'We couldn\'t find three stars. '}
                Try again and make sure everything is clear!
              </Text>
            </>
          )}
        </Animated.View>

        {/* Buttons */}
        <Animated.View entering={FadeInDown.delay(1000)} style={styles.buttonsContainer}>
          {!allDetected && (
            <Pressable onPress={onRetry} style={styles.retryButton}>
              <LinearGradient
                colors={['#FFB6C1', '#FF9EC4']}
                style={styles.retryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="refresh" size={24} color="#FFFFFF" />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </LinearGradient>
            </Pressable>
          )}

          <Pressable onPress={onComplete} style={styles.completeButton}>
            <LinearGradient
              colors={['#6C9EFF', '#818CF8']}
              style={styles.completeButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.completeButtonText}>
                {allDetected ? 'Continue →' : 'Finish'}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#64748B',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  resultsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  messageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  messageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  messageText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 24,
  },
  buttonsContainer: {
    gap: 16,
  },
  retryButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  retryButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completeButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  completeButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
