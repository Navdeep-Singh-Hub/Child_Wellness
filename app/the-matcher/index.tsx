// The Matcher - Info Page
import GameCardComponent from '@/components/game/matcher/components/GameCard';
import FloatingParticles from '@/components/game/matcher/components/FloatingParticles';
import { GAMES } from '@/components/game/matcher/utils/gameData';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TheMatcherInfo() {
  const router = useRouter();

  const handleGamePress = (gameId: string) => {
    router.push(`/the-matcher/game/${gameId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#F0F9FF', '#E0F2FE', '#DBEAFE']}
        style={StyleSheet.absoluteFill}
      />
      <FloatingParticles />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>The Matcher</Text>
          <Text style={styles.subtitle}>Sound & Matching Mastery</Text>
          <Text style={styles.description}>
            This module strengthens phonemic awareness and builds strong one-to-one correspondence
            skills through structured sound-matching games.
          </Text>
        </View>
      </View>

      {/* Games Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {GAMES.map((game, index) => (
          <GameCardComponent
            key={game.id}
            game={game}
            index={index}
            onPress={() => handleGamePress(game.id)}
          />
        ))}
      </ScrollView>
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
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 600,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
});
