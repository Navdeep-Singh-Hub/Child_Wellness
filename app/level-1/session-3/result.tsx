// Result Page for Sleeping Lines
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { playSoundEffect, speakFeedback, stopAllAudio } from '@/components/game/sleeping-lines/utils/audio';
import { GAMES } from '@/components/game/sleeping-lines/utils/gameData';

export default function ResultPage() {
  const params = useLocalSearchParams<{
    correct?: string;
    total?: string;
    accuracy?: string;
    gameId?: string;
  }>();
  const router = useRouter();

  const correct = params.correct ? parseInt(params.correct, 10) : 0;
  const total = params.total ? parseInt(params.total, 10) : 1;
  const accuracy = params.accuracy ? parseFloat(params.accuracy) : 0;
  const gameId = params.gameId || '';

  const [stars, setStars] = useState(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const gameInfo = GAMES.find((g) => g.id === gameId) || { title: 'Notebook Task', emoji: '📓' };

  useEffect(() => {
    stopAllAudio();
    playSoundEffect('celebration');

    // Calculate stars
    if (accuracy >= 80) setStars(3);
    else if (accuracy >= 60) setStars(2);
    else setStars(1);

    scale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );
    opacity.value = withTiming(1, { duration: 300 });

    speakFeedback("You're learning to control your pencil!");
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleBack = () => {
    router.push('/level-1/session-3');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#93C5FD', '#FBCFE8', '#A7F3D0'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, animatedStyle]}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          </View>
          <Text style={styles.title}>Great Job!</Text>
          <Text style={styles.subtitle}>{gameInfo.title} Completed</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{correct}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{Math.round(accuracy)}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
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

          <Text style={styles.encouragement}>You're learning to control your pencil!</Text>

          <Pressable style={styles.backButton} onPress={handleBack}>
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
    color: '#3B82F6',
    marginBottom: 32,
    textAlign: 'center',
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
