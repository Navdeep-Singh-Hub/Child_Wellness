import { FollowTheBall } from '@/components/game/FollowTheBall';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type GameKey = 'menu' | 'follow-ball';

type GameInfo = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  color: string;
  available: boolean;
};

export default function SessionGamesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    therapy?: string;
    level?: string;
    session?: string;
  }>();

  const [currentGame, setCurrentGame] = React.useState<GameKey>('menu');

  const therapyId = params.therapy || 'speech';
  const levelNumber = params.level ? parseInt(params.level, 10) : 1;
  const sessionNumber = params.session ? parseInt(params.session, 10) : 1;
  const isFollowBallAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 1;

  const GAMES: GameInfo[] = [
    {
      id: 'follow-ball',
      title: 'Follow the Ball',
      emoji: '⚽',
      description: 'Watch the ball and tap when it glows! Build your Focus Power.',
      color: '#3B82F6',
      available: isFollowBallAvailable,
    },
    // Placeholder for future games
    {
      id: 'game-2',
      title: 'Game 2',
      emoji: '🎮',
      description: 'Coming soon...',
      color: '#9CA3AF',
      available: false,
    },
    {
      id: 'game-3',
      title: 'Game 3',
      emoji: '🎮',
      description: 'Coming soon...',
      color: '#9CA3AF',
      available: false,
    },
    {
      id: 'game-4',
      title: 'Game 4',
      emoji: '🎮',
      description: 'Coming soon...',
      color: '#9CA3AF',
      available: false,
    },
    {
      id: 'game-5',
      title: 'Game 5',
      emoji: '🎮',
      description: 'Coming soon...',
      color: '#9CA3AF',
      available: false,
    },
  ];

  if (currentGame === 'follow-ball') {
    return (
      <FollowTheBall
        onBack={() => setCurrentGame('menu')}
        therapyId={therapyId}
        levelNumber={levelNumber}
        sessionNumber={sessionNumber}
        gameId="game-1"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Session Games</Text>
          <Text style={styles.headerSubtitle}>
            {therapyId.charAt(0).toUpperCase() + therapyId.slice(1)} • Level {levelNumber} • Session {sessionNumber}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Choose a Game</Text>
        <Text style={styles.sectionSubtitle}>
          Complete games to progress through your therapy session
        </Text>

        <View style={styles.gamesGrid}>
          {GAMES.map((game, index) => (
            <TouchableOpacity
              key={game.id}
              style={[
                styles.gameCard,
                !game.available && styles.gameCardDisabled,
                { borderColor: game.color },
              ]}
              onPress={() => {
                if (game.available && game.id === 'follow-ball') {
                  setCurrentGame('follow-ball');
                }
              }}
              disabled={!game.available}
              activeOpacity={0.8}
            >
              <View style={[styles.gameIcon, { backgroundColor: `${game.color}20` }]}>
                <Text style={styles.gameEmoji}>{game.emoji}</Text>
              </View>
              <View style={styles.gameContent}>
                <Text style={[styles.gameTitle, !game.available && styles.gameTitleDisabled]}>
                  {game.title}
                </Text>
                <Text style={[styles.gameDescription, !game.available && styles.gameDescriptionDisabled]}>
                  {game.description}
                </Text>
              </View>
              {game.available ? (
                <View style={[styles.playBadge, { backgroundColor: `${game.color}20` }]}>
                  <Ionicons name="play" size={20} color={game.color} />
                </View>
              ) : (
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={18} color="#9CA3AF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  backText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  gamesGrid: {
    gap: 16,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  gameCardDisabled: {
    opacity: 0.6,
    borderColor: '#E5E7EB',
  },
  gameIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  gameEmoji: {
    fontSize: 28,
  },
  gameContent: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  gameTitleDisabled: {
    color: '#9CA3AF',
  },
  gameDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  gameDescriptionDisabled: {
    color: '#9CA3AF',
  },
  playBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
});

