// Result Screen - Celebration and summary
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakFeedback, stopAllAudio } from '../../builder/utils/audio';

interface ResultScreenProps {
  gamesCompleted: number;
  notebookResult: { catWordDetected: boolean; circleDetected: boolean; catDrawingDetected: boolean } | null;
  onBack: () => void;
  onRestart?: () => void;
}

export default function ResultScreen({ gamesCompleted, notebookResult, onBack, onRestart }: ResultScreenProps) {
  const starScale = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);

  useEffect(() => {
    playSoundEffect('celebration');
    speakFeedback('Great job! You built the word CAT!').catch(() => {});
    
    // Animate stars
    starScale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withSpring(1, { damping: 10, stiffness: 100 }),
      withTiming(1.2, { duration: 200 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    // Animate confetti
    confettiOpacity.value = withSequence(
      withTiming(1, { duration: 500 }),
      withTiming(0.8, { duration: 2000 })
    );

    return () => stopAllAudio();
  }, []);

  const allTasksComplete = notebookResult?.catWordDetected && notebookResult?.circleDetected && notebookResult?.catDrawingDetected;
  const stars = allTasksComplete ? 3 : gamesCompleted >= 3 ? 2 : 1;

  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  const confettiAnimatedStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#6C9EFF', '#FFB6C1', '#7FE7CC']} style={StyleSheet.absoluteFill} />

      {/* Confetti Effect */}
      <Animated.View style={[styles.confettiContainer, confettiAnimatedStyle]}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.confetti,
              {
                left: `${(i * 5) % 100}%`,
                top: `${(i * 10) % 50}%`,
                backgroundColor: ['#6C9EFF', '#FFB6C1', '#7FE7CC', '#FBCFE8', '#99F6E4'][i % 5],
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(200)} style={styles.titleContainer}>
          <Text style={styles.title}>Great Job! 🎉</Text>
          <Text style={styles.subtitle}>You built the word CAT!</Text>
        </Animated.View>

        {/* Stars */}
        <Animated.View entering={FadeInDown.delay(400)} style={[styles.starsContainer, starAnimatedStyle]}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Ionicons
              key={i}
              name={i < stars ? 'star' : 'star-outline'}
              size={64}
              color={i < stars ? '#FFD700' : '#E2E8F0'}
            />
          ))}
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInUp.delay(600)} style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Games Completed</Text>
            <Text style={styles.statValue}>{gamesCompleted}/4</Text>
          </View>

          {notebookResult && (
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Notebook Task</Text>
              <View style={styles.taskStatus}>
                <View style={styles.taskItem}>
                  <Ionicons
                    name={notebookResult.catWordDetected ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={notebookResult.catWordDetected ? '#10B981' : '#EF4444'}
                  />
                  <Text style={styles.taskText}>Word CAT</Text>
                </View>
                <View style={styles.taskItem}>
                  <Ionicons
                    name={notebookResult.circleDetected ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={notebookResult.circleDetected ? '#10B981' : '#EF4444'}
                  />
                  <Text style={styles.taskText}>Circle</Text>
                </View>
                <View style={styles.taskItem}>
                  <Ionicons
                    name={notebookResult.catDrawingDetected ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={notebookResult.catDrawingDetected ? '#10B981' : '#EF4444'}
                  />
                  <Text style={styles.taskText}>Cat Drawing</Text>
                </View>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Message */}
        <Animated.View entering={FadeInUp.delay(800)} style={styles.messageContainer}>
          <Text style={styles.message}>
            {allTasksComplete
              ? "You're becoming a Word Builder! 🌟"
              : gamesCompleted >= 3
              ? "Great rhyming skills! Keep practicing! 💪"
              : "Good start! Let's practice again! 🎯"}
          </Text>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInUp.delay(1000)} style={styles.actionsContainer}>
          {onRestart && (
            <Pressable onPress={onRestart} style={styles.restartButton}>
              <LinearGradient
                colors={['#FFFFFF', '#F0F0F0']}
                style={styles.restartButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.restartButtonText}>Practice Again</Text>
              </LinearGradient>
            </Pressable>
          )}
          <Pressable onPress={onBack} style={styles.backToMenuButton}>
            <LinearGradient
              colors={['#6C9EFF', '#818CF8']}
              style={styles.backToMenuButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.backToMenuButtonText}>Back to Menu</Text>
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
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#6C9EFF',
  },
  taskStatus: {
    gap: 8,
    width: '100%',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskText: {
    fontSize: 16,
    color: '#475569',
  },
  messageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  message: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  restartButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  restartButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6C9EFF',
  },
  backToMenuButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  backToMenuButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backToMenuButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
