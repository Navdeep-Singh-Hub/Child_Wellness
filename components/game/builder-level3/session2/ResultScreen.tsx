// Result Screen - Celebration and feedback
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakFeedback, stopAllAudio } from '../../builder/utils/audio';

interface ResultScreenProps {
  result: { batWordDetected: boolean; squareDetected: boolean; batDrawingDetected: boolean };
  gamesCompleted: number;
  onComplete: () => void;
  onBack: () => void;
}

export default function ResultScreen({ result, gamesCompleted, onComplete, onBack }: ResultScreenProps) {
  const starScale = useSharedValue(1);
  const confettiOpacity = useSharedValue(0);

  const allComplete = result.batWordDetected && result.squareDetected && result.batDrawingDetected;

  useEffect(() => {
    if (allComplete) {
      playSoundEffect('celebration');
      speakFeedback('Great job! You built the word BAT!');
      starScale.value = withRepeat(withSpring(1.2, { damping: 5 }), -1, true);
      confettiOpacity.value = withSpring(1);
    } else {
      let message = 'Good try! ';
      if (!result.batWordDetected) {
        message += 'We couldn\'t find the word BAT. ';
      }
      if (!result.squareDetected) {
        message += 'We couldn\'t find the square. ';
      }
      if (!result.batDrawingDetected) {
        message += 'We couldn\'t find the bat drawing. ';
      }
      message += 'Try again!';
      speakFeedback(message);
    }

    return () => stopAllAudio();
  }, []);

  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  const confettiAnimatedStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Results</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {allComplete ? (
          <>
            {/* Celebration */}
            <Animated.View entering={FadeInUp.delay(200)} style={styles.celebrationContainer}>
              <Text style={styles.celebrationTitle}>Great job! 🎉</Text>
              <Text style={styles.celebrationSubtitle}>You built the word BAT!</Text>
            </Animated.View>

            {/* Stars */}
            <Animated.View entering={FadeInDown.delay(400)} style={styles.starsContainer}>
              {[1, 2, 3].map((star) => (
                <Animated.View key={star} style={star === 2 ? starAnimatedStyle : undefined}>
                  <Text style={styles.star}>⭐</Text>
                </Animated.View>
              ))}
            </Animated.View>

            {/* Stats */}
            <Animated.View entering={FadeInUp.delay(600)} style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                <Text style={styles.statText}>Games Completed: {gamesCompleted}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                <Text style={styles.statText}>Word BAT: Found ✓</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                <Text style={styles.statText}>Square: Found ✓</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                <Text style={styles.statText}>Bat Drawing: Found ✓</Text>
              </View>
            </Animated.View>
          </>
        ) : (
          <>
            {/* Feedback */}
            <Animated.View entering={FadeInUp.delay(200)} style={styles.feedbackContainer}>
              <Text style={styles.feedbackTitle}>Good Try! 💪</Text>
              <Text style={styles.feedbackSubtitle}>Let's practice again</Text>
            </Animated.View>

            {/* Results */}
            <Animated.View entering={FadeInDown.delay(400)} style={styles.resultsContainer}>
              <View style={styles.resultItem}>
                <Ionicons
                  name={result.batWordDetected ? 'checkmark-circle' : 'close-circle'}
                  size={32}
                  color={result.batWordDetected ? '#10B981' : '#EF4444'}
                />
                <Text style={styles.resultText}>
                  Word BAT: {result.batWordDetected ? 'Found ✓' : 'Not found'}
                </Text>
              </View>
              <View style={styles.resultItem}>
                <Ionicons
                  name={result.squareDetected ? 'checkmark-circle' : 'close-circle'}
                  size={32}
                  color={result.squareDetected ? '#10B981' : '#EF4444'}
                />
                <Text style={styles.resultText}>
                  Square: {result.squareDetected ? 'Found ✓' : 'Not found'}
                </Text>
              </View>
              <View style={styles.resultItem}>
                <Ionicons
                  name={result.batDrawingDetected ? 'checkmark-circle' : 'close-circle'}
                  size={32}
                  color={result.batDrawingDetected ? '#10B981' : '#EF4444'}
                />
                <Text style={styles.resultText}>
                  Bat Drawing: {result.batDrawingDetected ? 'Found ✓' : 'Not found'}
                </Text>
              </View>
            </Animated.View>
          </>
        )}

        {/* Complete Button */}
        <Animated.View entering={FadeInUp.delay(800)} style={styles.buttonContainer}>
          <Pressable onPress={onComplete} style={styles.completeButton}>
            <LinearGradient
              colors={allComplete ? ['#10B981', '#16A34A'] : ['#6C9EFF', '#818CF8']}
              style={styles.completeButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.completeButtonText}>
                {allComplete ? 'Continue →' : 'Try Again'}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  celebrationTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#64748B',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  star: {
    fontSize: 48,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  feedbackContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  feedbackTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  feedbackSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748B',
  },
  resultsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  buttonContainer: {
    width: '100%',
  },
  completeButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
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
