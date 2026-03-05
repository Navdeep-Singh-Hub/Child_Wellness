import { getSubscriptionStatus, type SubscriptionStatus } from '@/utils/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Map session numbers to their names
const SESSION_NAMES: Record<number, { title: string; theme: string; emoji: string; color: string }> = {
  1: { title: 'Explorer', theme: 'Forest', emoji: '🌲', color: '#10B981' },
  2: { title: 'Matcher', theme: 'Ocean', emoji: '🌊', color: '#0EA5E9' },
  3: { title: 'Builder', theme: 'Mountain', emoji: '⛰️', color: '#8B5CF6' },
  4: { title: 'Grouper', theme: 'Desert', emoji: '🏜️', color: '#F59E0B' },
  5: { title: 'Counter', theme: 'Sky', emoji: '☁️', color: '#3B82F6' },
  6: { title: 'Logic Lab', theme: 'City', emoji: '🏙️', color: '#6366F1' },
  7: { title: 'Reader', theme: 'Space', emoji: '🚀', color: '#8B5CF6' },
  8: { title: 'Citizen', theme: 'Planet', emoji: '🪐', color: '#EC4899' },
  9: { title: 'Clockwise', theme: 'Galaxy', emoji: '🌌', color: '#6366F1' },
  10: { title: 'Graduate', theme: 'Space Station', emoji: '🛸', color: '#8B5CF6' },
};

interface SessionSelectorProps {
  sessions: Array<{ sessionNumber: number; completed: boolean; completedGames: string[] }>;
  onSelectSession: (sessionNumber: number) => void;
  onBack: () => void;
  isFreeAccess?: boolean;
}

export function SessionSelector({ sessions, onSelectSession, onBack, isFreeAccess }: SessionSelectorProps) {
  const router = useRouter();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const status = await getSubscriptionStatus();
        setSubscriptionStatus(status);
      } catch (error) {
        console.error('Failed to check subscription status:', error);
      }
    };
    checkSubscription();
  }, []);

  const isFreeAccessUser = isFreeAccess || subscriptionStatus?.isFreeAccess === true || subscriptionStatus?.status === 'free';
  
  // Debug log for free access
  console.log('[SessionSelector] Free access check:', {
    isFreeAccess,
    subscriptionStatusIsFreeAccess: subscriptionStatus?.isFreeAccess,
    subscriptionStatus: subscriptionStatus?.status,
    isFreeAccessUser,
  });

  const handleSessionPress = (sessionNumber: number) => {
    if (!onSelectSession) {
      // If no onSelectSession provided, navigate directly
      router.push({
        pathname: '/(tabs)/SessionGames',
        params: {
          therapy: 'special-education',
          level: '1',
          session: sessionNumber.toString(),
        },
      });
    } else {
      onSelectSession(sessionNumber);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.introSection}>
        <Text style={styles.introTitle}>Level 1: Special Education</Text>
        <Text style={styles.introDescription}>
          Journey through 10 sessions, each with 5 games. Start with Session 1: Explorer to learn letters and numbers!
        </Text>
      </View>

      <View style={styles.sessionsGrid}>
        {sessions.map((session) => {
          const sessionInfo = SESSION_NAMES[session.sessionNumber];
          if (!sessionInfo) return null;

          // Unlock logic:
          // - Free access users: All sessions unlocked
          // - Regular users: Session 1 always, others unlock if previous session is completed
          const prevSession = sessions.find((s) => s.sessionNumber === session.sessionNumber - 1);
          const unlocked = 
            isFreeAccessUser || // Free access users get all sessions
            session.sessionNumber === 1 || // Session 1 always unlocked
            (prevSession && (prevSession.completed || prevSession.completedGames.length > 0)); // Others unlock if previous completed

          const completed = session.completed || session.completedGames.length > 0;

          return (
            <TouchableOpacity
              key={session.sessionNumber}
              style={[
                styles.sessionCard,
                !unlocked && styles.sessionCardLocked,
                { borderColor: sessionInfo.color },
                completed && { borderWidth: 3 },
              ]}
              onPress={() => unlocked && handleSessionPress(session.sessionNumber)}
              disabled={!unlocked}
              activeOpacity={0.8}
            >
              <View style={[styles.sessionIcon, { backgroundColor: `${sessionInfo.color}20` }]}>
                <Text style={styles.sessionEmoji}>{sessionInfo.emoji}</Text>
              </View>
              <Text style={styles.sessionNumber}>Session {session.sessionNumber}</Text>
              <Text style={styles.sessionTitle}>{sessionInfo.title}</Text>
              <Text style={styles.sessionTheme}>{sessionInfo.theme}</Text>
              {completed && (
                <View style={[styles.completedBadge, { backgroundColor: `${sessionInfo.color}20` }]}>
                  <Ionicons name="checkmark-circle" size={14} color={sessionInfo.color} />
                  <Text style={[styles.completedText, { color: sessionInfo.color }]}>Completed</Text>
                </View>
              )}
              {!unlocked && (
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={14} color="#9CA3AF" />
                  <Text style={styles.lockText}>Locked</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  introSection: {
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  introDescription: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  sessionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  sessionCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sessionCardLocked: {
    backgroundColor: '#F8FAFC',
    opacity: 0.6,
  },
  sessionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sessionEmoji: {
    fontSize: 32,
  },
  sessionNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  sessionTheme: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
  },
  lockText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '700',
    marginLeft: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  completedText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
});
