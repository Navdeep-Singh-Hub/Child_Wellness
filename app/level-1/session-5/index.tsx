// Pencil Control — Curved Lines - Info Page
import GameCardComponent from '@/components/game/curved-lines/components/GameCard';
import FloatingParticles from '@/components/game/curved-lines/components/FloatingParticles';
import { GAMES } from '@/components/game/curved-lines/utils/gameData';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CurvedLinesInfo() {
  const router = useRouter();

  const handleGamePress = (gameId: string) => {
    router.push(`/level-1/session-5/game/${gameId}`);
  };

  const handleNotebookPress = () => {
    router.push('/level-1/session-5/notebook');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#93C5FD', '#FBCFE8', '#A7F3D0'] as [string, string, string]} style={StyleSheet.absoluteFill} />
      <FloatingParticles />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Level 1 — Session 5</Text>
          <Text style={styles.subtitle}>Pencil Control — Curved Lines</Text>
          <Text style={styles.description}>
            In this session children learn to draw curved lines to strengthen circular hand movements.
          </Text>
        </View>
      </View>

      {/* Games Grid */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {GAMES.map((game, index) => (
          <GameCardComponent
            key={game.id}
            title={game.title}
            description={game.description}
            emoji={game.emoji}
            color={game.color}
            onPress={() => handleGamePress(game.id)}
          />
        ))}

        {/* Notebook Task Card */}
        <Pressable style={styles.notebookCard} onPress={handleNotebookPress}>
          <LinearGradient
            colors={['#FDE68A', '#FCD34D'] as [string, string]}
            style={styles.notebookGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.notebookEmojiContainer}>
              <Text style={styles.notebookEmoji}>📓</Text>
            </View>
            <Text style={styles.notebookTitle}>Practice in Your Notebook</Text>
            <Text style={styles.notebookDescription}>Draw 5 curved lines and upload</Text>
            <View style={styles.notebookPlayButton}>
              <Text style={styles.notebookPlayButtonText}>Start</Text>
              <Ionicons name="play" size={16} color="#fff" />
            </View>
          </LinearGradient>
        </Pressable>
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
    color: '#3B82F6',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  notebookCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FDE68A',
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  notebookGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'center',
  },
  notebookEmojiContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  notebookEmoji: {
    fontSize: 32,
  },
  notebookTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  notebookDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  notebookPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  notebookPlayButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
