// Premium animated game card component
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GameCard, Difficulty } from '../utils/gameData';

interface GameCardProps {
  game: GameCard;
  index: number;
  onPress: () => void;
}

const DIFFICULTY_COLORS: Record<Difficulty, { gradient: [string, string]; icon: string }> = {
  easy: { gradient: ['#22C55E', '#16A34A'], icon: 'leaf' },
  medium: { gradient: ['#F59E0B', '#D97706'], icon: 'flame' },
  hard: { gradient: ['#EF4444', '#DC2626'], icon: 'flame' },
};

export default function GameCardComponent({ game, index, onPress }: GameCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    opacity.value = withTiming(0.8);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    opacity.value = withTiming(1);
  };

  const difficultyInfo = DIFFICULTY_COLORS[game.difficulty];

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8F9FA']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.difficultyBadge, { backgroundColor: difficultyInfo.gradient[0] + '20' }]}>
                <Ionicons name={difficultyInfo.icon as any} size={16} color={difficultyInfo.gradient[0]} />
                <Text style={[styles.difficultyText, { color: difficultyInfo.gradient[0] }]}>
                  {game.difficulty.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.gameNumber}>
              <Text style={styles.gameNumberText}>{index + 1}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{game.name}</Text>

          {/* Description */}
          <Text style={styles.description}>{game.description}</Text>

          {/* Skills */}
          <View style={styles.skillsContainer}>
            {game.skillFocus.slice(0, 2).map((skill, idx) => (
              <View key={idx} style={styles.skillTag}>
                <Ionicons name="checkmark-circle" size={12} color="#6366F1" />
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.meta}>
              <Ionicons name="time-outline" size={14} color="#64748B" />
              <Text style={styles.metaText}>{game.duration}</Text>
            </View>
            <View style={styles.meta}>
              <Ionicons name="people-outline" size={14} color="#64748B" />
              <Text style={styles.metaText}>{game.ageRange}</Text>
            </View>
          </View>

          {/* Start Button */}
          <LinearGradient
            colors={['#6366F1', '#4F46E5']}
            style={styles.startButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.startButtonText}>Start Game</Text>
            <Ionicons name="play" size={18} color="#FFFFFF" />
          </LinearGradient>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  pressable: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  gameNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  skillText: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
