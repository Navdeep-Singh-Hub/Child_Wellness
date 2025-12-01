import AnimatedAccuracyRing from '@/components/AnimatedAccuracyRing';
import {
  fetchMyStats,
  fetchSkillProfile,
  type SkillProfileEntry,
  type StatsResponse
} from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';

// --- Types ---
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
  accent: string;
  onPress: () => void;
};
type MoodOption = 'energetic' | 'focused' | 'relaxed' | 'celebrating';
type MoodCard = {
  key: string;
  title: string;
  description: string;
  gradient: [string, string];
  icon: IoniconName;
};

// --- Helpers ---
const { width } = Dimensions.get('window');
const isSmall = width < 380;
const compactNumber = (n: number) =>
  Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

// --- Components ---

// Glass Card Component
const GlassCard = ({ children, style, intensity = 0.8, animated = false }: any) => {
  const ViewComponent = animated ? Animated.View : View;
  return (
    <ViewComponent
      style={[
        {
          backgroundColor: `rgba(255, 255, 255, ${intensity})`,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.6)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          elevation: 4,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </ViewComponent>
  );
};

export default function Index() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [skillProfile, setSkillProfile] = useState<SkillProfileEntry[] | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodOption>('focused');

  // Animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const statAnimations = useRef<Record<string, Animated.Value>>({});
  const quickAnimations = useRef<Record<string, Animated.Value>>({});

  const isLoadingRef = useRef(false);
  const prevAccRef = useRef<number>(0);

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
    }, [loadStats])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  // Data
  const xp = stats?.xp ?? 0;
  const coins = stats?.coins ?? 0;
  const hearts = stats?.hearts ?? 5;
  const streak = stats?.streakDays ?? 0;
  const bestStreak = stats?.bestStreak ?? 0;
  const accuracy = stats?.accuracy ?? 0;

  const statBlocks = useMemo<StatBlock[]>(() => [
    {
      key: 'xp',
      title: 'XP',
      value: compactNumber(xp),
      caption: 'Total collected',
      icon: 'flash',
      accent: '#4F46E5',
      gradient: ['#EEF2FF', '#C7D2FE'],
    },
    {
      key: 'coins',
      title: 'Coins',
      value: compactNumber(coins),
      caption: 'Rewards',
      icon: 'star',
      accent: '#F59E0B',
      gradient: ['#FFFBEB', '#FDE68A'],
    },
    {
      key: 'streak',
      title: 'Streak',
      value: `${streak}`,
      caption: 'Days active',
      icon: 'flame',
      accent: '#F97316',
      gradient: ['#FFF7ED', '#FFEDD5'],
    },
    {
      key: 'hearts',
      title: 'Lives',
      value: `${hearts}`,
      caption: 'Remaining',
      icon: 'heart',
      accent: '#EF4444',
      gradient: ['#FEF2F2', '#FECACA'],
    },
  ], [xp, coins, hearts, streak]);

  const quickActions = useMemo<QuickAction[]>(() => {
    const defaults: QuickAction[] = [
      {
        key: 'play',
        label: 'Play Game',
        caption: 'Earn XP',
        icon: 'game-controller',
        accent: '#8B5CF6',
        onPress: () => router.push('/(tabs)/Games'),
      },
      {
        key: 'aac',
        label: 'AAC Grid',
        caption: 'Practice',
        icon: 'grid',
        accent: '#0EA5E9',
        onPress: () => router.push('/(tabs)/AACgrid'),
      },
      {
        key: 'smart',
        label: 'Explorer',
        caption: 'Discover',
        icon: 'map',
        accent: '#10B981',
        onPress: () => router.push('/(tabs)/SmartExplorer'),
      },
      {
        key: 'profile',
        label: 'Profile',
        caption: 'Update',
        icon: 'person',
        accent: '#EC4899',
        onPress: () => router.push('/(tabs)/Profile'),
      },
    ];
    return defaults;
  }, [router]);

  // Initialize animations
  statBlocks.forEach(b => {
    if (!statAnimations.current[b.key]) statAnimations.current[b.key] = new Animated.Value(0);
  });
  quickActions.forEach(a => {
    if (!quickAnimations.current[a.key]) quickAnimations.current[a.key] = new Animated.Value(0);
  });

  useEffect(() => {
    if (!stats) return;

    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();

    const statStagger = Animated.stagger(100, statBlocks.map(b =>
      Animated.spring(statAnimations.current[b.key], {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ));

    const quickStagger = Animated.stagger(80, quickActions.map(a =>
      Animated.spring(quickAnimations.current[a.key], {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      })
    ));

    Animated.sequence([
      Animated.delay(200),
      statStagger,
      Animated.delay(100),
      quickStagger
    ]).start();

  }, [stats]);

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  if (!stats) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#F0F9FF', '#E0F2FE', '#DBEAFE']}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={{ transform: [{ scale: 1.2 }] }}>
          <Ionicons name="sparkles" size={48} color="#3B82F6" />
        </Animated.View>
        <Text style={styles.loadingText}>Loading your world...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#F0F9FF', '#E0F2FE', '#F5F3FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Background Decorative Blobs */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Header Section */}
        <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
          <View style={styles.headerContent}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Hello there! 👋</Text>
              <Text style={styles.subGreeting}>Ready to learn today?</Text>
            </View>
            {stats?.levelLabel && (
              <View style={styles.headerBadge}>
                <Ionicons name="trophy" size={16} color="#F59E0B" />
                <Text style={styles.headerBadgeText}>{stats.levelLabel}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Hero Card */}
        <Animated.View style={{ opacity: heroAnim, transform: [{ scale: heroAnim }] }}>
          <GlassCard style={styles.heroCard}>
            <LinearGradient
              colors={['rgba(99, 102, 241, 0.12)', 'rgba(139, 92, 246, 0.08)', 'rgba(59, 130, 246, 0.05)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                <View style={styles.levelBadge}>
                  <Ionicons name="sparkles" size={16} color="#6366F1" />
                  <Text style={styles.levelText}>{stats.levelLabel || 'Explorer'}</Text>
                </View>
                <Text style={styles.heroTitle}>Keep it up! 🎉</Text>
                <Text style={styles.heroSubtitle}>You're making amazing progress today.</Text>

                <View style={styles.heroStatsRow}>
                  <View style={styles.heroStat}>
                    <Ionicons name="flame" size={18} color="#F97316" />
                    <Text style={styles.heroStatText}>{streak} Day Streak</Text>
                  </View>
                  {bestStreak > streak && (
                    <View style={[styles.heroStat, { marginLeft: 8 }]}>
                      <Ionicons name="trophy" size={16} color="#F59E0B" />
                      <Text style={[styles.heroStatText, { color: '#92400E' }]}>Best: {bestStreak}</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.heroRight}>
                <AnimatedAccuracyRing
                  value={accuracy}
                  size={110}
                  stroke={12}
                  progressColor="#6366F1"
                  trackColor="rgba(99, 102, 241, 0.15)"
                  label="Accuracy"
                  durationMs={1200}
                />
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.statsGrid}>
          {statBlocks.map((block) => (
            <Animated.View
              key={block.key}
              style={[
                styles.statBlockContainer,
                {
                  opacity: statAnimations.current[block.key],
                  transform: [
                    {
                      translateY: statAnimations.current[block.key].interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                      })
                    }
                  ]
                }
              ]}
            >
              <GlassCard style={styles.statCard}>
                <LinearGradient
                  colors={block.gradient}
                  style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}
                />
                <View style={[styles.iconCircle, { backgroundColor: block.accent }]}>
                  <Ionicons name={block.icon} size={20} color="#FFF" />
                </View>
                <Text style={styles.statValue}>{block.value}</Text>
                <Text style={styles.statLabel}>{block.title}</Text>
              </GlassCard>
            </Animated.View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsContainer}
          style={{ flexGrow: 0 }}
        >
          {quickActions.map((action, index) => (
            <Animated.View
              key={action.key}
              style={{
                opacity: quickAnimations.current[action.key],
                transform: [{ scale: quickAnimations.current[action.key] }],
                marginRight: 16,
              }}
            >
              <Pressable
                onPress={action.onPress}
                style={({ pressed }) => [
                  styles.actionCard,
                  pressed && { transform: [{ scale: 0.95 }] }
                ]}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F8FAFC']}
                  style={styles.actionGradient}
                >
                  <View style={[styles.actionIcon, { backgroundColor: `${action.accent}15` }]}>
                    <Ionicons name={action.icon} size={24} color={action.accent} />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                  <Text style={styles.actionCaption}>{action.caption}</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Mood Selector */}
        <Text style={styles.sectionTitle}>How are you feeling?</Text>
        <GlassCard style={styles.moodContainer}>
          <View style={styles.moodRow}>
            {(['energetic', 'focused', 'relaxed', 'celebrating'] as MoodOption[]).map((mood) => {
              const isSelected = selectedMood === mood;
              const config = {
                energetic: { emoji: '⚡', color: '#F59E0B' },
                focused: { emoji: '🎯', color: '#6366F1' },
                relaxed: { emoji: '🍃', color: '#10B981' },
                celebrating: { emoji: '🏆', color: '#EC4899' },
              }[mood];

              return (
                <Pressable
                  key={mood}
                  onPress={() => setSelectedMood(mood)}
                  style={[
                    styles.moodButton,
                    isSelected && { backgroundColor: `${config.color}15`, borderColor: config.color }
                  ]}
                >
                  <Text style={styles.moodEmoji}>{config.emoji}</Text>
                  <Text style={[
                    styles.moodLabel,
                    isSelected && { color: config.color, fontWeight: '700' }
                  ]}>
                    {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  blob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.4,
  },
  blob1: {
    backgroundColor: '#C7D2FE',
    top: -100,
    right: -100,
  },
  blob2: {
    backgroundColor: '#FECACA',
    bottom: -50,
    left: -100,
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 64 : 44,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 28,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  subGreeting: {
    fontSize: 17,
    color: '#64748B',
    fontWeight: '500',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 6,
  },
  heroCard: {
    padding: 28,
    minHeight: 180,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLeft: {
    flex: 1,
    paddingRight: 12,
  },
  heroRight: {
    marginLeft: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  levelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4F46E5',
    marginLeft: 6,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 18,
    fontWeight: '500',
  },
  heroStatsRow: {
    flexDirection: 'row',
  },
  heroStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  heroStatText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C2410C',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 36,
    marginBottom: 18,
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBlockContainer: {
    width: '48%', // Use percentage for better responsiveness
    marginBottom: 12,
  },
  statCard: {
    padding: 20,
    alignItems: 'center',
    height: 150,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '600',
  },
  quickActionsContainer: {
    paddingRight: 20,
  },
  actionCard: {
    width: 150,
    height: 170,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  actionGradient: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  actionCaption: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
  moodContainer: {
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  moodButton: {
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    width: (width - 88) / 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 10,
  },
  moodLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
});
