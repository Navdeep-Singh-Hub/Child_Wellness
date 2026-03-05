// The Clockwise - Info Page
import GameCardComponent from '@/components/game/clockwise/components/GameCard';
import FloatingParticles from '@/components/game/clockwise/components/FloatingParticles';
import { GAMES } from '@/components/game/clockwise/utils/gameData';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TheClockwiseInfo() {
  const router = useRouter();

  const handleGamePress = (gameId: string) => {
    router.push(`/level-1/session-9/game/${gameId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#FEF3C7', '#FEF9E7', '#ECFDF5']}
        style={StyleSheet.absoluteFill}
      />
      <FloatingParticles />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Level 1 — Session 9</Text>
          <Text style={styles.subtitle}>Reading, Time & Thinking</Text>
          <Text style={styles.description}>
            This session helps children understand short stories, read basic clock time, and explore simple measurement concepts.
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
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FDE68A',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
