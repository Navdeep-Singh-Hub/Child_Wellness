import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSpecialEducationProgress, isUnlocked } from './shared/SpecialEducationProgress';

// 5 game slots per session (placeholders — no games built yet)
const GAME_SLOTS = [
  { number: 1, label: 'Game 1', emoji: '🎮', color: '#3B82F6' },
  { number: 2, label: 'Game 2', emoji: '🎯', color: '#10B981' },
  { number: 3, label: 'Game 3', emoji: '✨', color: '#F59E0B' },
  { number: 4, label: 'Game 4', emoji: '📦', color: '#8B5CF6' },
  { number: 5, label: 'Game 5', emoji: '🎉', color: '#EC4899' },
];

interface GameSelectorProps {
  section: number;
  level: number; // now means session number (1..10)
  onBack: () => void;
  onSelectGame: (game: number) => void;
}

export function GameSelector({ section, level: sessionNumber, onBack, onSelectGame }: GameSelectorProps) {
  const { progress } = useSpecialEducationProgress();
  const sectionData = progress?.sections.find((s) => s.sectionNumber === section);
  const sessionData = sectionData?.sessions?.find((s) => s.sessionNumber === sessionNumber);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Session {sessionNumber}</Text>
          <Text style={styles.headerSubtitle}>Section {section}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoBanner}>
          <Text style={styles.infoTitle}>5 Games in This Session</Text>
          <Text style={styles.infoDescription}>
            Complete all 5 games to finish this session. Games coming soon!
          </Text>
        </View>

        <View style={styles.gamesList}>
          {GAME_SLOTS.map((game) => {
            const gameData = sessionData?.games?.find((g) => g.gameNumber === game.number);
            const unlocked = isUnlocked(progress, section, sessionNumber, game.number);
            const completed = gameData?.completed || false;
            return (
              <TouchableOpacity
                key={game.number}
                style={[
                  styles.gameCard,
                  !unlocked && styles.gameCardLocked,
                  unlocked && { borderColor: game.color },
                  completed && { borderWidth: 3 },
                ]}
                onPress={() => unlocked && onSelectGame(game.number)}
                disabled={!unlocked}
                activeOpacity={0.8}
              >
                <View style={[styles.gameIcon, { backgroundColor: `${game.color}20` }]}>
                  <Text style={styles.gameEmoji}>{game.emoji}</Text>
                  {completed && (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={game.color} />
                    </View>
                  )}
                </View>
                <View style={styles.gameInfo}>
                  <Text style={styles.gameName}>{game.label}</Text>
                  <Text style={styles.gameDescription}>Coming soon</Text>
                  {completed && gameData?.accuracy != null && (
                    <Text style={styles.accuracyText}>Accuracy: {gameData.accuracy}%</Text>
                  )}
                </View>
                {!unlocked ? (
                  <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
                ) : completed ? (
                  <Ionicons name="checkmark-circle" size={24} color={game.color} />
                ) : (
                  <Ionicons name="play-circle" size={24} color={game.color} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  infoBanner: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  gamesList: {
    gap: 12,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  gameCardLocked: {
    backgroundColor: '#F8FAFC',
    opacity: 0.6,
    borderColor: '#E5E7EB',
  },
  gameIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameEmoji: {
    fontSize: 28,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 12,
    color: '#64748B',
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  accuracyText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 4,
  },
});

