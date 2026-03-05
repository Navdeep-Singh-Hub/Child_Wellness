// The Graduate - Info Page
import GameCardComponent from '@/components/game/graduate/components/GameCard';
import FloatingParticles from '@/components/game/graduate/components/FloatingParticles';
import { GAMES } from '@/components/game/graduate/utils/gameData';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TheGraduateInfo() {
  const router = useRouter();

  const handleGamePress = (gameId: string) => {
    router.push(`/level-1/session-10/game/${gameId}`);
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
          <View style={styles.titleRow}>
            <Text style={styles.title}>Level 1 — Session 10</Text>
            <Ionicons name="trophy" size={32} color="#FDE68A" />
          </View>
          <Text style={styles.subtitle}>Think, Tell & Solve</Text>
          <Text style={styles.description}>
            This final Level 1 session helps children tell simple stories and solve everyday word problems using logic and understanding.
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
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
