// Result Screen
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakFeedback, stopAllAudio } from '../utils/audio';

interface ResultScreenProps {
  gamesCompleted: number;
  notebookResult: { dogWordDetected: boolean; triangleDetected: boolean; triangleEdgesDetected: boolean; dogDrawingDetected: boolean } | null;
  onBack: () => void;
}

export default function ResultScreen({ gamesCompleted, notebookResult, onBack }: ResultScreenProps) {
  const [stars, setStars] = useState(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const allNotebookTasks = notebookResult?.dogWordDetected && notebookResult?.triangleDetected && notebookResult?.dogDrawingDetected;
  const totalScore = gamesCompleted + (allNotebookTasks ? 1 : 0);
  const maxScore = 5; // 4 games + 1 notebook task

  useEffect(() => {
    stopAllAudio();
    playSoundEffect('celebration');

    // Calculate stars
    const percentage = (totalScore / maxScore) * 100;
    if (percentage >= 80) setStars(3);
    else if (percentage >= 60) setStars(2);
    else setStars(1);

    scale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );
    opacity.value = withTiming(1, { duration: 300 });

    speakFeedback('Great job! You built the word DOG!');
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#6C9EFF', '#FFB6C1', '#7FE7CC'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, animatedStyle]}>
          <View style={styles.iconContainer}>
            <Ionicons name="trophy" size={80} color="#FBBF24" />
          </View>
          <Text style={styles.title}>Congratulations!</Text>
          <Text style={styles.subtitle}>Session Completed</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{gamesCompleted}</Text>
              <Text style={styles.statLabel}>Games</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{allNotebookTasks ? '✓' : '—'}</Text>
              <Text style={styles.statLabel}>Notebook</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalScore}/{maxScore}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          <View style={styles.starsContainer}>
            {[1, 2, 3].map((star) => (
              <Ionicons
                key={star}
                name={star <= stars ? 'star' : 'star-outline'}
                size={40}
                color={star <= stars ? '#FBBF24' : '#D1D5DB'}
              />
            ))}
          </View>

          <Text style={styles.encouragement}>Great job! You built the word DOG!</Text>

          {notebookResult && (
            <View style={styles.notebookResults}>
              <Text style={styles.notebookTitle}>Notebook Task:</Text>
              <View style={styles.notebookItem}>
                <Ionicons
                  name={notebookResult.dogWordDetected ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={notebookResult.dogWordDetected ? '#10B981' : '#EF4444'}
                />
                <Text style={styles.notebookText}>Word DOG</Text>
              </View>
              <View style={styles.notebookItem}>
                <Ionicons
                  name={notebookResult.triangleDetected ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={notebookResult.triangleDetected ? '#10B981' : '#EF4444'}
                />
                <Text style={styles.notebookText}>Triangle</Text>
              </View>
              <View style={styles.notebookItem}>
                <Ionicons
                  name={notebookResult.triangleEdgesDetected ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={notebookResult.triangleEdgesDetected ? '#10B981' : '#EF4444'}
                />
                <Text style={styles.notebookText}>Triangle Edges</Text>
              </View>
              <View style={styles.notebookItem}>
                <Ionicons
                  name={notebookResult.dogDrawingDetected ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={notebookResult.dogDrawingDetected ? '#10B981' : '#EF4444'}
                />
                <Text style={styles.notebookText}>Dog Drawing</Text>
              </View>
            </View>
          )}

          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back to Menu</Text>
            <Ionicons name="arrow-back" size={20} color="#64748B" />
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#475569',
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  encouragement: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6C9EFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  notebookResults: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  notebookTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  notebookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  notebookText: {
    fontSize: 16,
    color: '#475569',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
  },
  backButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
});
