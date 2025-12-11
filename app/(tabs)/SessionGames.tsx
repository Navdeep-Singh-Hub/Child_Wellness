import { BigTapTarget } from '@/components/game/BigTapTarget';
import { FollowTheBall } from '@/components/game/FollowTheBall';
import BalloonPopGame from '@/components/game/MovingTargetTapGame'; // Game 3: Balloon Pop
import MultipleSmallTargetsGame from '@/components/game/MultipleSmallTargetsGame';
import MultiTapFunGame from '@/components/game/MultiTapFunGame'; // Game 5: Multi-Tap Fun
import ShrinkingTargetGame from '@/components/game/ShrinkingTargetGame';
import SlowThenFastGame from '@/components/game/SlowThenFastGame';
import SmallCircleTapGame from '@/components/game/SmallCircleTapGame';
import TapAndHoldGame from '@/components/game/TapAndHoldGame'; // Game 4: Tap and Hold
import TapFastGame from '@/components/game/TapFastGame';
import TapOnlySmallTargetGame from '@/components/game/TapOnlySmallTargetGame'; // Level 2 Game 1: Small Circle Tap
import TapRedCircleGame from '@/components/game/TapRedCircleGame';
import TapSlowlyGame from '@/components/game/TapSlowlyGame';
import TrackThenTapSmallObjectGame from '@/components/game/TrackThenTapSmallObjectGame';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type GameKey = 'menu' | 'follow-ball' | 'big-tap' | 'tap-red-circle' | 'game-3' | 'game-4' | 'game-5' | 'small-circle-tap' | 'tap-only-small' | 'shrinking-target' | 'track-then-tap' | 'multiple-small-targets' | 'tap-slowly' | 'tap-fast' | 'slow-then-fast';

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

  // Level 1 Session 1 games (ONLY for Session 1)
  const isBigTapAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 1;

  const isTapRedCircleAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 1;

  const isGame3Available =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 1;

  const isGame4Available =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 1;

  const isGame5Available =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 1;

  // Level 1 Session 2 games (ONLY for Session 2 - will be added later)
  // For now, Session 2 will show placeholder games or empty list

  // Level 1 Session 2 Game 1: Small Circle Tap - available for OT Level 1 Session 2
  const isSmallCircleTapAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 2;

  // Level 1 Session 2 Game 2: Tap Only Small Target - available for OT Level 1 Session 2
  const isTapOnlySmallAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 2;

  // Level 1 Session 2 Game 3: Shrinking Target - available for OT Level 1 Session 2
  const isShrinkingTargetAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 2;

  // Level 1 Session 2 Game 4: Track Then Tap Small Object - available for OT Level 1 Session 2
  const isTrackThenTapAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 2;

  // Level 1 Session 2 Game 5: Multiple Small Targets - available for OT Level 1 Session 2
  const isMultipleSmallTargetsAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 2;

  // Level 1 Session 3 Game 1: Tap Slowly - available for OT Level 1 Session 3
  const isTapSlowlyAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 3;

  // Level 1 Session 3 Game 2: Tap Fast - available for OT Level 1 Session 3
  const isTapFastAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 3;

  // Level 1 Session 3 Game 3: Slow Then Fast - available for OT Level 1 Session 3
  const isSlowThenFastAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 3;

  const GAMES: GameInfo[] = [
    {
      id: 'follow-ball',
      title: 'Follow the Ball',
      emoji: '⚽',
      description: 'Watch the ball and tap when it glows! Build your Focus Power.',
      color: '#3B82F6',
      available: isFollowBallAvailable,
    },
    {
      id: 'big-tap',
      title: 'Big Tap Target',
      emoji: '🟢',
      description: 'Tap the big circle to make it burst! Build finger tap & scanning.',
      color: '#22C55E',
      available: isBigTapAvailable,
    },
    {
      id: 'tap-red-circle',                                  // 👈 NEW GAME
      title: 'Tap the Big Red Circle',
      emoji: '🔴',
      description:
        'Tap the glowing red circle to build shape & colour attention and finger control.',
      color: '#EF4444',
      available: isTapRedCircleAvailable,
    },
    {
      id: 'game-3',
      title: 'Balloon Pop',
      emoji: '🎈',
      description: 'Tap the balloon as it moves slowly across the screen. Build hand-eye coordination!',
      color: '#8B5CF6',
      available: isGame3Available,
    },
    {
      id: 'game-4',
      title: 'Tap and Hold',
      emoji: '✨',
      description: 'Tap and hold the button for 2 seconds. Build finger control and endurance!',
      color: '#3B82F6',
      available: isGame4Available,
    },
    {
      id: 'game-5',
      title: 'Multi-Tap Fun',
      emoji: '🎈',
      description: 'Tap all 5 balloons one by one! Build coordination and finger precision!',
      color: '#F472B6',
      available: isGame5Available,
    },
    {
      id: 'small-circle-tap',
      title: 'Small Circle Tap',
      emoji: '🔵',
      description: 'Tap the small circle with your index finger. Build precision and finger isolation!',
      color: '#0EA5E9',
      available: isSmallCircleTapAvailable,
    },
    {
      id: 'tap-only-small',
      title: 'Tap Only Small Target',
      emoji: '🎯',
      description: 'Large and small shapes appear. Tap only the small one when it glows!',
      color: '#F59E0B',
      available: isTapOnlySmallAvailable,
    },
    {
      id: 'shrinking-target',
      title: 'Shrinking Target',
      emoji: '🎯',
      description: 'Tap the target! It gets smaller each time. If you struggle, it grows bigger.',
      color: '#8B5CF6',
      available: isShrinkingTargetAvailable,
    },
    {
      id: 'track-then-tap',
      title: 'Track Then Tap',
      emoji: '🐝',
      description: 'Follow the moving object with your eyes, then tap it when it stops!',
      color: '#FCD34D',
      available: isTrackThenTapAvailable,
    },
    {
      id: 'multiple-small-targets',
      title: 'Multiple Small Targets',
      emoji: '⚫',
      description: 'Tap all 4 small dots to clear the screen! Build scanning and precision.',
      color: '#06B6D4',
      available: isMultipleSmallTargetsAvailable,
    },
    {
      id: 'tap-slowly',
      title: 'Tap Slowly',
      emoji: '⏱️',
      description: 'Wait for the circle to light up, then tap! Build slow motor control and rhythm.',
      color: '#3B82F6',
      available: isTapSlowlyAvailable,
    },
    {
      id: 'tap-fast',
      title: 'Tap Fast',
      emoji: '⚡',
      description: 'Circle blinks rapidly. Tap quickly to match the pace! Build fast motor activation.',
      color: '#F59E0B',
      available: isTapFastAvailable,
    },
    {
      id: 'slow-then-fast',
      title: 'Slow Then Fast',
      emoji: '🔄',
      description: 'Switch between slow and fast tapping. Build cognitive flexibility and motor switching.',
      color: '#8B5CF6',
      available: isSlowThenFastAvailable,
    },
  ];

  // ---------- Game render switches ----------

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

  if (currentGame === 'big-tap') {
    return <BigTapTarget onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-red-circle') {
    // 👇 NEW: launch our OT Game 2
    return <TapRedCircleGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'game-3') {
    return <BalloonPopGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'game-4') {
    return <TapAndHoldGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'game-5') {
    return <MultiTapFunGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'small-circle-tap') {
    return <SmallCircleTapGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-only-small') {
    return <TapOnlySmallTargetGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'shrinking-target') {
    return <ShrinkingTargetGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'track-then-tap') {
    return <TrackThenTapSmallObjectGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'multiple-small-targets') {
    return <MultipleSmallTargetsGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-slowly') {
    return <TapSlowlyGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-fast') {
    return <TapFastGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'slow-then-fast') {
    return <SlowThenFastGame onBack={() => setCurrentGame('menu')} />;
  }

  // ---------- Menu UI ----------

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
          {GAMES.filter(game => game.available).length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No games available yet</Text>
              <Text style={styles.emptyStateText}>
                Games for this session will be added soon!
              </Text>
            </View>
          ) : (
            GAMES.filter(game => game.available).map((game) => (
              <TouchableOpacity
                key={game.id}
                style={[
                  styles.gameCard,
                  { borderColor: game.color },
                ]}
                onPress={() => {
                  if (game.id === 'follow-ball') setCurrentGame('follow-ball');
                  if (game.id === 'big-tap') setCurrentGame('big-tap');
                  if (game.id === 'tap-red-circle') setCurrentGame('tap-red-circle');
                  if (game.id === 'game-3') setCurrentGame('game-3');
                  if (game.id === 'game-4') setCurrentGame('game-4');
                  if (game.id === 'game-5') setCurrentGame('game-5');
                  if (game.id === 'small-circle-tap') setCurrentGame('small-circle-tap');
                  if (game.id === 'tap-only-small') setCurrentGame('tap-only-small');
                  if (game.id === 'shrinking-target') setCurrentGame('shrinking-target');
                  if (game.id === 'track-then-tap') setCurrentGame('track-then-tap');
                  if (game.id === 'multiple-small-targets') setCurrentGame('multiple-small-targets');
                  if (game.id === 'tap-slowly') setCurrentGame('tap-slowly');
                  if (game.id === 'tap-fast') setCurrentGame('tap-fast');
                  if (game.id === 'slow-then-fast') setCurrentGame('slow-then-fast');
                }}
                activeOpacity={0.8}
              >
              <View style={[styles.gameIcon, { backgroundColor: `${game.color}20` }]}>
                <Text style={styles.gameEmoji}>{game.emoji}</Text>
              </View>
              <View style={styles.gameContent}>
                <Text style={styles.gameTitle}>
                  {game.title}
                </Text>
                <Text style={styles.gameDescription}>
                  {game.description}
                </Text>
              </View>
              <View
                style={[
                  styles.playBadge,
                  { backgroundColor: `${game.color}20` },
                ]}
              >
                <Ionicons name="play" size={20} color={game.color} />
              </View>
            </TouchableOpacity>
          )))}
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
  emptyState: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});
