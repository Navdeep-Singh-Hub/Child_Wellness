// Individual Game Completion Screen for The Clockwise
import { playSoundEffect, stopAllAudio } from '@/components/game/clockwise/utils/audio';
import { GAMES } from '@/components/game/clockwise/utils/gameData';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

interface GameCompleteScreenProps {
  correct: number;
  total: number;
  accuracy: number;
  gameId: string;
  onContinue: () => void;
  onBack: () => void;
}

export default function GameCompleteScreen({
  correct,
  total,
  accuracy,
  gameId,
  onContinue,
  onBack,
}: GameCompleteScreenProps) {
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
      return "You're a Smart Thinker!";
    } else if (accuracy >= 70) {
      return 'Great Reading Skills!';
    } else {
      return 'You Understand Time!';
    }
  };

  const getPerformanceColor = () => {
    if (accuracy >= 90) {
      return ['#A7F3D0', '#6EE7B7'];
    } else if (accuracy >= 70) {
      return ['#FDE68A', '#FCD34D'];
    } else {
      return ['#BFDBFE', '#93C5FD'];
    }
  };

  const getStars = () => {
    if (accuracy >= 90) return 3;
    if (accuracy >= 70) return 2;
    return 1;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3C7', '#FEF9E7', '#ECFDF5']} style={StyleSheet.absoluteFill} />

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
              name={accuracy >= 80 ? 'trophy' : accuracy >= 70 ? 'star' : 'book'}
              size={64}
              color="#FFFFFF"
            />
            <Text style={styles.accuracyText}>{Math.round(accuracy)}%</Text>
            <Text style={styles.performanceText}>{getPerformanceMessage()}</Text>
            
            {/* Stars */}
            <View style={styles.starsContainer}>
              {[1, 2, 3].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= getStars() ? 'star' : 'star-outline'}
                  size={32}
                  color="#FFFFFF"
                />
              ))}
            </View>
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
          onPress={onContinue}
          style={styles.actionButton}
        >
          <LinearGradient
            colors={['#FDE68A', '#FCD34D']}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            <Text style={styles.actionText}>Continue</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={onBack}
          style={styles.actionButton}
        >
          <LinearGradient
            colors={['#BFDBFE', '#93C5FD']}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="home" size={20} color="#FFFFFF" />
            <Text style={styles.actionText}>Back to Games</Text>
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
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#FDE68A',
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
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
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
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#FDE68A',
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
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FDE68A',
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
