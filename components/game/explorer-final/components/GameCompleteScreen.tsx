// Game completion screen for Explorer Final Challenge module
import { playSoundEffect, stopAllAudio } from '@/components/game/explorer-final/utils/audio';
import { GAMES } from '@/components/game/explorer-final/utils/gameData';
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
  const [stars, setStars] = useState(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const gameInfo = GAMES.find((g) => g.id === gameId);

  useEffect(() => {
    stopAllAudio();
    playSoundEffect('celebration');

    // Calculate stars based on accuracy
    if (accuracy >= 80) setStars(3);
    else if (accuracy >= 60) setStars(2);
    else setStars(1);

    scale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#93C5FD', '#FBCFE8', '#A7F3D0'] as [string, string, string]}
        style={StyleSheet.absoluteFillObject}
      />
      <Animated.View style={[styles.content, animatedStyle]}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#10B981" />
        </View>
        <Text style={styles.title}>Great Job!</Text>
        <Text style={styles.subtitle}>{gameInfo?.title || 'Game'} Completed</Text>

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

        <View style={styles.buttonContainer}>
          <Pressable style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back to Menu</Text>
          </Pressable>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
});
