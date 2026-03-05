// Session Completion Screen for The Matcher (Level 1 Session 2)
import { playSoundEffect, stopAllAudio } from '../utils/audio';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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

interface SessionCompleteScreenProps {
  totalCorrect: number;
  totalQuestions: number;
  overallAccuracy: number;
  onBack: () => void;
}

export default function SessionCompleteScreen({
  totalCorrect,
  totalQuestions,
  overallAccuracy,
  onBack,
}: SessionCompleteScreenProps) {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10 });
    rotation.value = withSequence(
      withTiming(360, { duration: 800 }),
      withSpring(0, { damping: 12 })
    );

    if (overallAccuracy >= 80) {
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
    if (overallAccuracy >= 90) {
      return 'Excellent Sound Recognition!';
    } else if (overallAccuracy >= 70) {
      return 'Good Progress!';
    } else {
      return 'Keep Practicing!';
    }
  };

  const getPerformanceColor = () => {
    if (overallAccuracy >= 90) {
      return ['#22C55E', '#16A34A'];
    } else if (overallAccuracy >= 70) {
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
        <Text style={styles.headerTitle}>Session Complete! 🎉</Text>
        <Text style={styles.headerSubtitle}>The Matcher - Level 1 Session 2</Text>
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
              name={overallAccuracy >= 80 ? 'trophy' : overallAccuracy >= 70 ? 'star' : 'alert-circle'}
              size={64}
              color="#FFFFFF"
            />
            <Text style={styles.accuracyText}>{Math.round(overallAccuracy)}%</Text>
            <Text style={styles.performanceText}>{getPerformanceMessage()}</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalCorrect}</Text>
          <Text style={styles.statLabel}>Correct</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalQuestions}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{Math.round(overallAccuracy)}%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Pressable
          onPress={onBack}
          style={styles.actionButton}
        >
          <LinearGradient
            colors={['#6366F1', '#4F46E5']}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            <Text style={styles.actionText}>Back to Games</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={() => {
            router.push('/(tabs)/TherapyProgress');
          }}
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
