import AnimatedAccuracyRing from '@/components/AnimatedAccuracyRing';
import {
  fetchMyStats,
  fetchSkillProfile,
  type SkillProfileEntry,
  type StatsResponse
} from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from 'react-native';
import Reanimated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';

type IoniconName = keyof typeof Ionicons.glyphMap;
type StatBlock = {
  key: string;
  title: string;
  value: string;
  caption: string;
  icon: IoniconName;
  accent: string;
  gradient: [string, string];
};
type QuickAction = {
  key: string;
  label: string;
  caption: string;
  icon: IoniconName;
  accent?: string;
  onPress: () => void;
};
type MoodCard = {
  key: string;
  title: string;
  description: string;
  gradient: [string, string];
  icon: IoniconName;
};

type MoodOption = 'energetic' | 'focused' | 'relaxed' | 'celebrating';

const AnimatedBlurView = Reanimated.createAnimatedComponent(BlurView);
const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

export default function Index() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [skillProfile, setSkillProfile] = useState<SkillProfileEntry[] | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodOption>('focused');
  const prevAccRef = useRef<number>(0);
  const isLoadingRef = useRef(false);

  const { width } = useWindowDimensions();
  const isSmall = width < 380;
  const isTiny = width < 340;
  const fs = (n: number) => (isTiny ? n - 3 : isSmall ? n - 1 : n);

  const loadStats = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      const s = await fetchMyStats();
      prevAccRef.current = stats?.accuracy ?? s?.accuracy ?? 0;
      setStats(s);
    } catch (error) {
      console.warn('Failed to load stats', error);
    }
    try {
      const profile = await fetchSkillProfile();
      setSkillProfile(profile.skills || []);
    } catch (error) {
      console.warn('Failed to load skill profile', error);
    } finally {
      isLoadingRef.current = false;
    }
  }, [stats?.accuracy]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
      return () => { };
    }, [loadStats])
  );

  const xp = stats?.xp ?? 0;
  const coins = stats?.coins ?? 0;
  const hearts = stats?.hearts ?? 5;
  const streak = stats?.streakDays ?? 0;
  const bestStreak = stats?.bestStreak ?? 0;
  const accuracy = stats?.accuracy ?? 0;

  const statBlocks = useMemo<StatBlock[]>(() => [
    {
      key: 'xp',
      title: 'XP Progress',
      value: compactNumber(xp),
      caption: 'Total collected',
      icon: 'flash',
      accent: '#3B82F6',
      gradient: ['#3B82F6', '#2563EB'],
    },
    {
      key: 'coins',
      title: 'Coins',
      value: compactNumber(coins),
      caption: 'Spend rewards',
      icon: 'pricetag',
      accent: '#F59E0B',
      gradient: ['#FBBF24', '#D97706'],
    },
    {
      key: 'streak',
      title: 'Streak',
      value: `${streak} day${streak === 1 ? '' : 's'}`,
      caption: streak > 0 ? 'Keep it up!' : 'Start today',
      icon: 'flame',
      accent: '#F97316',
      gradient: ['#FB923C', '#EA580C'],
    },
    {
      key: 'hearts',
      title: 'Lives',
      value: `${hearts}`,
      caption: 'Play power',
      icon: 'heart',
      accent: '#EF4444',
      gradient: ['#F87171', '#DC2626'],
    },
  ], [xp, coins, hearts, streak]);

  const quickActions = useMemo<QuickAction[]>(() => {
    const defaults: QuickAction[] = [
      {
        key: 'play',
        label: 'Play Game',
        caption: 'Boost XP now',
        icon: 'game-controller',
        accent: '#8B5CF6',
        onPress: () => router.push('/(tabs)/Games'),
      },
      {
        key: 'aac',
        label: 'AAC Grid',
        caption: 'Practice words',
        icon: 'grid',
        accent: '#0EA5E9',
        onPress: () => router.push('/(tabs)/AACgrid'),
      },
      {
        key: 'smart',
        label: 'Explorer',
        caption: 'Find scenes',
        icon: 'map',
        accent: '#10B981',
        onPress: () => router.push('/(tabs)/SmartExplorer'),
      },
    ];

    if (stats?.recommendations?.length) {
      return stats.recommendations.map((rec) => ({
        key: rec.id,
        label: rec.activityTitle,
        caption: rec.reason,
        icon: rec.priority === 'high' ? 'flame' : rec.priority === 'medium' ? 'flash' : 'sparkles',
        accent: rec.priority === 'high' ? '#EA580C' : rec.priority === 'medium' ? '#2563EB' : '#22C55E',
        onPress: () => router.push(rec.route as any),
      }));
    }

    return defaults;
  }, [router, stats?.recommendations]);

  const allMoodCards = useMemo<Record<MoodOption, MoodCard[]>>(() => ({
    energetic: [
      {
        key: 'tap-timing',
        title: 'Tap Timing',
        description: 'Fast-paced timing games!',
        gradient: ['#FEF3C7', '#F59E0B'],
        icon: 'flash',
      },
      {
        key: 'quick-sort',
        title: 'Quick Sort',
        description: 'Categorize items quickly.',
        gradient: ['#FFEDD5', '#F97316'],
        icon: 'speedometer',
      },
    ],
    focused: [
      {
        key: 'picture-match',
        title: 'Picture Match',
        description: 'Improve concentration.',
        gradient: ['#DBEAFE', '#3B82F6'],
        icon: 'sparkles',
      },
      {
        key: 'find-emoji',
        title: 'Emoji Find',
        description: 'Identify emotions.',
        gradient: ['#E0E7FF', '#6366F1'],
        icon: 'happy',
      },
    ],
    relaxed: [
      {
        key: 'aac-explore',
        title: 'AAC Explore',
        description: 'Explore at your own pace.',
        gradient: ['#E0F2FE', '#0EA5E9'],
        icon: 'grid',
      },
      {
        key: 'review',
        title: 'Review',
        description: 'Look back at achievements.',
        gradient: ['#F3E8FF', '#A855F7'],
        icon: 'book',
      },
    ],
    celebrating: [
      {
        key: 'streak-celebration',
        title: 'Milestone',
        description: `You're on a ${streak}-day streak!`,
        gradient: ['#FEF9C3', '#EAB308'],
        icon: 'trophy',
      },
      {
        key: 'share',
        title: 'Share',
        description: 'Share your progress!',
        gradient: ['#FCE7F3', '#EC4899'],
        icon: 'share-social',
      },
    ],
  }), [streak]);

  const moodCards = useMemo(() => allMoodCards[selectedMood], [selectedMood, allMoodCards]);

  const accuracyDeltaRaw = accuracy - prevAccRef.current;
  const accuracyDelta = Number(accuracyDeltaRaw.toFixed(1));
  const accuracyTrend = accuracyDelta > 0 ? 'positive' : accuracyDelta < 0 ? 'negative' : 'neutral';

  const nextMilestone = Math.ceil((xp + 1) / 500) * 500;
  const previousMilestone = Math.max(0, nextMilestone - 500);
  const milestoneProgress = Math.min(1, (xp - previousMilestone) / Math.max(1, nextMilestone - previousMilestone));

  if (!stats) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#EEF2FF', '#C7D2FE', '#A5B4FC']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <BlurView intensity={40} style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading magic...</Text>
        </BlurView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Rich Mesh Gradient Background */}
      <LinearGradient
        colors={['#F0F9FF', '#E0F2FE', '#DBEAFE']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[StyleSheet.absoluteFillObject, { opacity: 0.6 }]}>
        <LinearGradient
          colors={['transparent', 'rgba(99, 102, 241, 0.15)', 'rgba(168, 85, 247, 0.15)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <SafeAreaView>
          <Reanimated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.header}
          >
            <View>
              <Text style={styles.greeting}>Welcome back 👋</Text>
              <Text style={styles.subGreeting}>Ready to play & learn?</Text>
            </View>
            <Pressable
              onPress={() => router.push('/(tabs)/Profile')}
              style={styles.profileButton}
            >
              <LinearGradient
                colors={['#6366F1', '#4F46E5']}
                style={styles.profileGradient}
              >
                <Ionicons name="person" size={20} color="#fff" />
              </LinearGradient>
            </Pressable>
          </Reanimated.View>
        </SafeAreaView>

        {/* Hero Card - Glassmorphism */}
        <Reanimated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.heroContainer}
        >
          <BlurView intensity={Platform.OS === 'ios' ? 60 : 100} tint="light" style={styles.heroCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.2)']}
              style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                <View style={styles.levelBadge}>
                  <LinearGradient colors={['#10B981', '#059669']} style={StyleSheet.absoluteFillObject} />
                  <Ionicons name="shield-checkmark" size={14} color="#fff" />
                  <Text style={styles.levelText}>{stats.levelLabel || 'Novice'}</Text>
                </View>
                <Text style={styles.heroTitle}>Daily Momentum</Text>
                <Text style={styles.heroSubtitle}>
                  {accuracyTrend === 'positive' ? 'Rising up! 🚀' : 'Keep going! 💪'}
                </Text>

                {/* Milestone Bar */}
                <View style={styles.milestoneContainer}>
                  <View style={styles.milestoneHeader}>
                    <Text style={styles.milestoneLabel}>Next Level</Text>
                    <Text style={styles.milestoneValue}>{xp}/{nextMilestone} XP</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <Reanimated.View
                      layout={Layout.springify()}
                      style={[styles.progressBarFill, { width: `${milestoneProgress * 100}%` }]}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.heroRight}>
                <AnimatedAccuracyRing
                  value={accuracy}
                  size={100}
                  stroke={10}
                  progressColor="#4F46E5"
                  trackColor="rgba(79, 70, 229, 0.1)"
                  label="Accuracy"
                  durationMs={1000}
                />
              </View>
            </View>
          </BlurView>
        </Reanimated.View>

        {/* Stats Grid */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            {statBlocks.map((block, index) => (
              <Reanimated.View
                key={block.key}
                entering={FadeInUp.delay(300 + index * 100).springify()}
                style={styles.statCardWrapper}
              >
                <BlurView intensity={40} tint="light" style={styles.statCard}>
                  <View style={[styles.iconCircle, { backgroundColor: block.accent + '20' }]}>
                    <Ionicons name={block.icon} size={22} color={block.accent} />
                  </View>
                  <View>
                    <Text style={styles.statValue}>{block.value}</Text>
                    <Text style={styles.statTitle}>{block.title}</Text>
                  </View>
                </BlurView>
              </Reanimated.View>
            ))}
          </View>
        </View>

        {/* Quick Actions - Horizontal Scroll */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsScroll}
          >
            {quickActions.map((action, index) => (
              <Reanimated.View
                key={action.key}
                entering={FadeInDown.delay(500 + index * 100).springify()}
              >
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    action.onPress();
                  }}
                  style={({ pressed }) => [
                    styles.actionCard,
                    { transform: [{ scale: pressed ? 0.96 : 1 }] }
                  ]}
                >
                  <LinearGradient
                    colors={['#FFFFFF', '#F8FAFC']}
                    style={styles.actionGradient}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: action.accent + '15' }]}>
                      <Ionicons name={action.icon} size={24} color={action.accent} />
                    </View>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                    <Text style={styles.actionCaption}>{action.caption}</Text>
                  </LinearGradient>
                </Pressable>
              </Reanimated.View>
            ))}
          </ScrollView>
        </View>

        {/* Mood Selector */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
          <View style={styles.moodSelector}>
            {(['energetic', 'focused', 'relaxed', 'celebrating'] as MoodOption[]).map((mood) => {
              const isActive = selectedMood === mood;
              const config = {
                energetic: { icon: 'flash', color: '#F59E0B' },
                focused: { icon: 'sparkles', color: '#6366F1' },
                relaxed: { icon: 'leaf', color: '#10B981' },
                celebrating: { icon: 'trophy', color: '#EC4899' },
              }[mood];

              return (
                <Pressable
                  key={mood}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedMood(mood);
                  }}
                  style={[
                    styles.moodButton,
                    isActive && { backgroundColor: config.color + '15', borderColor: config.color }
                  ]}
                >
                  <Ionicons
                    name={config.icon as any}
                    size={20}
                    color={isActive ? config.color : '#9CA3AF'}
                  />
                  {isActive && (
                    <Reanimated.Text
                      entering={FadeInDown.duration(200)}
                      style={[styles.moodLabel, { color: config.color }]}
                    >
                      {mood.charAt(0).toUpperCase() + mood.slice(1)}
                    </Reanimated.Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Mood Cards */}
        <View style={styles.moodCardsContainer}>
          {moodCards.map((card, index) => (
            <Reanimated.View
              key={card.key}
              entering={FadeInUp.delay(index * 100).springify()}
              layout={Layout.springify()}
            >
              <Pressable style={styles.moodCard}>
                <LinearGradient
                  colors={card.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.moodCardGradient}
                >
                  <View style={styles.moodCardContent}>
                    <View style={styles.moodCardIcon}>
                      <Ionicons name={card.icon} size={24} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.moodCardTitle}>{card.title}</Text>
                      <Text style={styles.moodCardDesc}>{card.description}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
                  </View>
                </LinearGradient>
              </Pressable>
            </Reanimated.View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

function compactNumber(n: number) {
  return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  profileButton: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  profileGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  heroCard: {
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  heroContent: {
    flexDirection: 'row',
    padding: 24,
    alignItems: 'center',
  },
  heroLeft: {
    flex: 1,
    paddingRight: 16,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    gap: 4,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  milestoneContainer: {
    marginTop: 8,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  milestoneLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  milestoneValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  heroRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCardWrapper: {
    width: '48%',
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  statTitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  quickActionsScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  actionCard: {
    width: 140,
    height: 160,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  actionGradient: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  actionCaption: {
    fontSize: 12,
    color: '#94A3B8',
  },
  moodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  moodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  moodCardsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  moodCard: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  moodCardGradient: {
    borderRadius: 24,
    padding: 20,
  },
  moodCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  moodCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  moodCardDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
});
