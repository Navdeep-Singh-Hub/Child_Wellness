// Premium animated game card component for The Builder
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
import { GameCard } from '../utils/gameData';

interface GameCardProps {
  game: GameCard;
  index: number;
  onPress: () => void;
}

export default function BuilderGameCard({ game, index, onPress }: GameCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
    opacity.value = withTiming(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    opacity.value = withTiming(1);
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        <LinearGradient
          colors={['#FFFFFF', '#FEF3F8']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
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
                <Ionicons name="checkmark-circle" size={12} color="#A5B4FC" />
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.meta}>
              <Ionicons name="time-outline" size={14} color="#94A3B8" />
              <Text style={styles.metaText}>{game.duration}</Text>
            </View>
          </View>

          {/* Start Button */}
          <LinearGradient
            colors={['#A5B4FC', '#818CF8']}
            style={styles.startButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.startButtonText}>Start</Text>
            <Ionicons name="play" size={18} color="#FFFFFF" />
          </LinearGradient>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  pressable: {
    borderRadius: 32,
    shadowColor: '#A5B4FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  card: {
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A5B4FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameNumberText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
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
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  skillText: {
    fontSize: 12,
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
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
