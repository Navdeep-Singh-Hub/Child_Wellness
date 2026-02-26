// Result Screen
import { playSoundEffect, stopAllAudio } from '@/components/game/matcher/utils/audio';
import { GAMES } from '@/components/game/matcher/utils/gameData';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    correct: string;
    total: string;
    accuracy: string;
    gameId: string;
  }>();

  const router = useRouter();
  const correct = parseInt(params.correct || '0', 10);
  const total = parseInt(params.total || '0', 10);
  const accuracy = parseFloat(params.accuracy || '0');
  const gameId = params.gameId || '';

  const game = GAMES.find((g) => g.id === gameId);

  const [showConfetti, setShowConfetti] = useState(false);
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10 });
    rotation.value = withSequence(
      withTiming(360, { duration: 800 }),
      withSpring(0, { damping: 12 })
    );

    if (accuracy >= 80) {
      setShowConfetti(true);
      playSoundEffect('celebration');
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const getPerformanceMessage = () => {
    if (accuracy >= 90) {
      return 'Excellent Sound Recognition!';
    } else if (accuracy >= 70) {
      return 'Good Progress!';
    } else {
      return 'Needs Practice with Beginning Sounds';
    }
  };

  const getPerformanceColor = () => {
    if (accuracy >= 90) {
      return ['#22C55E', '#16A34A'];
    } else if (accuracy >= 70) {
      return ['#F59E0B', '#D97706'];
    } else {
      return ['#EF4444', '#DC2626'];
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#F0F9FF', '#E0F2FE']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Game Complete!</Text>
        {game && <Text style={styles.headerSubtitle}>{game.name}</Text>}
      </View>

      {/* Result Card */}
      <Animated.View style={[styles.resultCard, animatedStyle]}>
        <LinearGradient
          colors={getPerformanceColor()}
          style={styles.resultGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.resultContent}>
            <Ionicons
              name={accuracy >= 80 ? 'trophy' : accuracy >= 70 ? 'star' : 'alert-circle'}
              size={64}
              color="#FFFFFF"
            />
            <Text style={styles.accuracyText}>{Math.round(accuracy)}%</Text>
            <Text style={styles.performanceText}>{getPerformanceMessage()}</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{correct}</Text>
          <Text style={styles.statLabel}>Correct</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{Math.round(accuracy)}%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Pressable
          onPress={() => router.push(`/the-matcher/game/${gameId}`)}
          style={styles.actionButton}
        >
          <LinearGradient
            colors={['#6366F1', '#4F46E5']}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.actionText}>Replay</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={() => router.push('/the-matcher')}
          style={styles.actionButton}
        >
          <LinearGradient
            colors={['#F472B6', '#EC4899']}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="home" size={20} color="#FFFFFF" />
            <Text style={styles.actionText}>Home</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  resultCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  resultGradient: {
    padding: 32,
  },
  resultContent: {
    alignItems: 'center',
  },
  accuracyText: {
    fontSize: 64,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  performanceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
