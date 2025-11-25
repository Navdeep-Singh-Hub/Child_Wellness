import AnimatedAccuracyRing from '@/components/AnimatedAccuracyRing';
import {
  fetchMyStats,
  fetchSkillProfile,
  type SkillProfileEntry,
  type StatsResponse,
  type Recommendation,
  type NextAction,
} from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Platform,
  PixelRatio,
} from 'react-native';

type IoniconName = keyof typeof Ionicons.glyphMap;
type StatBlock = {
  key: string;
  title: string;
  value: string;
  caption: string;
  icon: IoniconName;
  accent: string;
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

export default function Index() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [containerH, setContainerH] = useState(0);
  const [contentH, setContentH] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [skillProfile, setSkillProfile] = useState<SkillProfileEntry[] | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodOption>('focused');
  const prevAccRef = useRef<number>(0);
  const isLoadingRef = useRef(false);

  const heroAnim = useRef(new Animated.Value(0)).current;
  const statAnimations = useRef<Record<string, { entrance: Animated.Value; press: Animated.Value }>>({});
  const quickAnimations = useRef<Record<string, { entrance: Animated.Value; press: Animated.Value }>>({});
  const moodAnimations = useRef<Record<string, Animated.Value>>({});

  const { width } = useWindowDimensions();
  const isSmall = width < 380;   // most phones in portrait
  const isTiny = width < 340;    // very small screens
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

  // Avoid duplicate initial fetch; rely on focus only

  useFocusEffect(
    useCallback(() => {
      loadStats();
      return () => {};
    }, [loadStats])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

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
      caption: 'Total experience collected',
      icon: 'flash-outline',
      accent: '#2563EB',
    },
    {
      key: 'coins',
      title: 'Coins',
      value: compactNumber(coins),
      caption: 'Spend them in rewards',
      icon: 'pricetag-outline',
      accent: '#F59E0B',
    },
    {
      key: 'streak',
      title: 'Current Streak',
      value: `${streak} day${streak === 1 ? '' : 's'}`,
      caption: streak > 0 ? 'Keep the daily habit alive' : 'Start a streak today',
      icon: 'flame',
      accent: '#F97316',
    },
    {
      key: 'hearts',
      title: 'Lives',
      value: `${hearts}`,
      caption: hearts === 5 ? 'Fully charged hearts' : 'Play to earn more hearts',
      icon: 'heart',
      accent: '#EF4444',
    },
    {
      key: 'best',
      title: 'Best Streak',
      value: `${bestStreak} day${bestStreak === 1 ? '' : 's'}`,
      caption: bestStreak > 0 ? 'Your personal record' : 'Set your first high score',
      icon: 'trophy-outline',
      accent: '#14B8A6',
    },
  ], [xp, coins, hearts, streak, bestStreak]);

  const quickActions = useMemo<QuickAction[]>(() => {
    const defaults: QuickAction[] = [
      {
        key: 'play',
        label: 'Play a Game',
        caption: 'Boost XP with quick challenges',
        icon: 'game-controller-outline',
        accent: '#2563EB',
        onPress: () => router.push('/(tabs)/Games'),
      },
      {
        key: 'aac',
        label: 'Explore AAC Grid',
        caption: 'Practice vocabulary tiles',
        icon: 'grid-outline',
        accent: '#0EA5E9',
        onPress: () => router.push('/(tabs)/AACgrid'),
      },
      {
        key: 'smart',
        label: 'Smart Explorer',
        caption: 'Discover scenes with Scout',
        icon: 'map-outline',
        accent: '#14B8A6',
        onPress: () => router.push('/(tabs)/SmartExplorer'),
      },
      {
        key: 'profile',
        label: 'Update Profile',
        caption: 'Keep details up to date',
        icon: 'person-circle-outline',
        accent: '#6366F1',
        onPress: () => router.push('/(tabs)/Profile'),
      },
      {
        key: 'contact',
        label: 'Contact Coach',
        caption: 'Share feedback or questions',
        icon: 'chatbubble-ellipses-outline',
        accent: '#F59E0B',
        onPress: () => router.push('/(tabs)/Contact'),
      },
    ];

    if (stats?.recommendations?.length) {
      return stats.recommendations.map((rec) => ({
        key: rec.id,
        label: rec.activityTitle,
        caption: rec.reason,
        icon: rec.priority === 'high' ? 'flame' : rec.priority === 'medium' ? 'flash-outline' : 'sparkles-outline',
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
        title: 'Tap Timing Challenge',
        description: 'Get your energy flowing with fast-paced timing games!',
        gradient: ['#FEF3C7', '#FFFBEB'],
        icon: 'flash-outline',
      },
      {
        key: 'quick-sort',
        title: 'Quick Sort Rush',
        description: 'Categorize items quickly to boost reaction speed.',
        gradient: ['#FED7AA', '#FFF7ED'],
        icon: 'speedometer-outline',
      },
      {
        key: 'movement',
        title: 'Active Break',
        description: 'Take a movement break to recharge your energy.',
        gradient: ['#FECACA', '#FEF2F2'],
        icon: 'bicycle-outline',
      },
    ],
    focused: [
      {
        key: 'picture-match',
        title: 'Picture Match',
        description: 'Improve concentration with matching challenges.',
        gradient: ['#E0EAFF', '#F8FAFF'],
        icon: 'sparkles-outline',
      },
      {
        key: 'find-emoji',
        title: 'Emoji Recognition',
        description: 'Practice identifying emotions and feelings.',
        gradient: ['#E0E7FF', '#F5F3FF'],
        icon: 'happy-outline',
      },
      {
        key: 'accuracy',
        title: 'Accuracy Builder',
        description: 'Focus on precision to improve your overall score.',
        gradient: ['#D1FAE5', '#ECFDF5'],
        icon: 'checkmark-circle-outline',
      },
    ],
    relaxed: [
      {
        key: 'aac-explore',
        title: 'Explore AAC Grid',
        description: 'Take your time exploring vocabulary at your own pace.',
        gradient: ['#E0F2FE', '#F0F9FF'],
        icon: 'grid-outline',
      },
      {
        key: 'review',
        title: 'Review Progress',
        description: 'Look back at your achievements and celebrate growth.',
        gradient: ['#F3E8FF', '#FAF5FF'],
        icon: 'book-outline',
      },
      {
        key: 'breathe',
        title: 'Mindful Practice',
        description: 'Practice vocabulary with calm, focused attention.',
        gradient: ['#E7F3EE', '#F5FFF9'],
        icon: 'leaf-outline',
      },
    ],
    celebrating: [
      {
        key: 'streak-celebration',
        title: 'Streak Milestone',
        description: `You're on a ${streak}-day streak! Keep it going!`,
        gradient: ['#FEF3C7', '#FFFBEB'],
        icon: 'trophy-outline',
      },
      {
        key: 'best-score',
        title: 'Personal Best',
        description: `Your best streak is ${bestStreak} days! Amazing work!`,
        gradient: ['#FECACA', '#FEF2F2'],
        icon: 'star-outline',
      },
      {
        key: 'share',
        title: 'Share Achievement',
        description: 'Share your progress with family and friends!',
        gradient: ['#E0EAFF', '#F8FAFF'],
        icon: 'share-social-outline',
      },
    ],
  }), [streak, bestStreak]);

  const moodCards = useMemo(() => allMoodCards[selectedMood], [selectedMood, allMoodCards]);

  const { strengths, focusAreas } = useMemo(() => {
    const entries = skillProfile || [];
    if (!entries.length) return { strengths: [], focusAreas: [] };

    const sortedByLevel = [...entries].sort((a, b) => {
      const levelA = a.stats?.level ?? 0;
      const levelB = b.stats?.level ?? 0;
      if (levelA === levelB) {
        const accA = a.stats?.accuracy ?? 0;
        const accB = b.stats?.accuracy ?? 0;
        return accB - accA;
      }
      return levelB - levelA;
    });

    const strong = sortedByLevel.filter((entry) => (entry.stats?.level ?? 0) >= 3).slice(0, 3);
    const focus = [...entries]
      .filter((entry) => !entry.stats || (entry.stats.level ?? 0) <= 2)
      .sort((a, b) => {
        const accA = a.stats?.accuracy ?? 0;
        const accB = b.stats?.accuracy ?? 0;
        return accA - accB;
      })
      .slice(0, 3);

    return { strengths: strong, focusAreas: focus };
  }, [skillProfile]);

  statBlocks.forEach((block) => {
    if (!statAnimations.current[block.key]) {
      statAnimations.current[block.key] = {
        entrance: new Animated.Value(0),
        press: new Animated.Value(1),
      };
    }
  });

  quickActions.forEach((action) => {
    if (!quickAnimations.current[action.key]) {
      quickAnimations.current[action.key] = {
        entrance: new Animated.Value(0),
        press: new Animated.Value(1),
      };
    }
  });

  const moodTransitionAnim = useRef(new Animated.Value(1)).current;

  moodCards.forEach((card) => {
    if (!moodAnimations.current[card.key]) {
      moodAnimations.current[card.key] = new Animated.Value(0);
    }
  });

  const accuracyDeltaRaw = accuracy - prevAccRef.current;
  const accuracyDelta = Number(accuracyDeltaRaw.toFixed(1));
  const accuracyTrend = accuracyDelta > 0 ? 'positive' : accuracyDelta < 0 ? 'negative' : 'neutral';

  const nextMilestone = Math.ceil((xp + 1) / 500) * 500;
  const previousMilestone = Math.max(0, nextMilestone - 500);
  const milestoneProgress = Math.min(1, (xp - previousMilestone) / Math.max(1, nextMilestone - previousMilestone));

  const renderSkillCard = useCallback((skill: SkillProfileEntry) => {
    const level = skill.stats?.level ?? 0;
    const accuracyLabel = skill.stats ? `${skill.stats.accuracy ?? 0}% accuracy` : 'Not played yet';
    const trend = skill.stats?.trend ?? 0;
    const trendLabel =
      trend > 0 ? `▲ ${trend}%` : trend < 0 ? `▼ ${Math.abs(trend)}%` : 'steady';

    return (
      <View key={skill.id} style={styles.skillCard}>
        <View style={styles.skillIconBubble}>
          <Text style={{ fontSize: 20 }}>{skill.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.skillTitle}>{skill.title}</Text>
          <Text style={styles.skillMeta}>
            Level {level} · {accuracyLabel}
          </Text>
          <Text style={styles.skillTrend}>{trendLabel}</Text>
        </View>
      </View>
    );
  }, []);

  useEffect(() => {
    if (!stats) return;

    heroAnim.setValue(0);
    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const statEntrances = statBlocks.map((block) =>
      Animated.timing(statAnimations.current[block.key].entrance, {
        toValue: 1,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );
    Animated.stagger(80, statEntrances).start();

    const quickEntrances = quickActions.map((action) =>
      Animated.timing(quickAnimations.current[action.key].entrance, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );
    Animated.stagger(70, quickEntrances).start();

    const moodEntrances = moodCards.map((card) =>
      Animated.timing(moodAnimations.current[card.key], {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );
    Animated.stagger(120, moodEntrances).start();
  }, [stats, statBlocks, quickActions, moodCards, heroAnim]);

  useEffect(() => {
    moodTransitionAnim.setValue(0);
    moodCards.forEach((card) => {
      moodAnimations.current[card.key]?.setValue(0);
    });

    Animated.parallel([
      Animated.timing(moodTransitionAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      ...moodCards.map((card, index) =>
        Animated.timing(moodAnimations.current[card.key], {
          toValue: 1,
          duration: 600,
          delay: index * 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, [selectedMood, moodCards, moodTransitionAnim]);

  const handleStatPress = (key: string, active: boolean) => {
    const anim = statAnimations.current[key]?.press;
    if (!anim) return;
    Animated.spring(anim, {
      toValue: active ? 0.95 : 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handleQuickPress = (key: string, active: boolean) => {
    const anim = quickAnimations.current[key]?.press;
    if (!anim) return;
    Animated.spring(anim, {
      toValue: active ? 0.94 : 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  if (!stats) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#F8FAFC', '#F1F5F9']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <Animated.View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#2563EB',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              shadowColor: '#2563EB',
              shadowOpacity: 0.3,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8,
            }}
          >
            <Ionicons name="sparkles" size={40} color="#FFFFFF" />
          </Animated.View>
          <Text style={styles.loadingTitle}>Loading your progress…</Text>
          <Text style={styles.loadingCaption}>Fetching the latest stats and streaks.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const heroTranslate = heroAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  const canScroll = contentH > containerH + 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#F8FAFC', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView
        onLayout={(e) => setContainerH(e.nativeEvent.layout.height)}
        onContentSizeChange={(_, h) => setContentH(h)}
        scrollEnabled={canScroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: isSmall ? 14 : 20 },
          containerH > 0 && { minHeight: containerH },
        ]}
        refreshControl={canScroll ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}
        bounces={canScroll}
        alwaysBounceVertical={canScroll}
        overScrollMode={canScroll ? 'auto' : 'never'}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[styles.heroCard, { opacity: heroAnim, transform: [{ translateY: heroTranslate }] }]}
        >
          <LinearGradient
            colors={['#EBF3FF', '#F7F3FF', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View
              style={[
                styles.heroTopRow,
                isSmall && { flexDirection: 'column', alignItems: 'stretch', gap: 12 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.heroGreeting}>Welcome back 👋</Text>
                <Text style={styles.heroHeadline}>Here’s today’s momentum snapshot.</Text>
                <View style={styles.heroChipRow}>
                  {stats?.levelLabel ? (
                    <View style={styles.heroChip}>
                      <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                      <Text style={styles.heroChipText}>{stats.levelLabel}</Text>
                    </View>
                  ) : null}
                  <View style={styles.heroChip}>
                    <Ionicons name="flame" size={16} color="#F97316" />
                    <Text style={styles.heroChipText}>{streak} day streak</Text>
                  </View>
                  <View style={styles.heroChip}>
                    <Ionicons name="flash-outline" size={16} color="#2563EB" />
                    <Text style={styles.heroChipText}>{compactNumber(xp)} XP</Text>
                  </View>
                </View>
              </View>
              <Animated.View
                style={[
                  styles.heroRingWrap,
                  isSmall && { alignSelf: 'center', marginTop: 8 },
                ]}
              >
                <AnimatedAccuracyRing
                  value={accuracy}
                  size={isSmall ? 100 : 120}
                  stroke={isSmall ? 10 : 12}
                  progressColor="#4F46E5"
                  trackColor="#E0E7FF"
                  label="Accuracy"
                  durationMs={700}
                />
                <Text
                  style={[
                    styles.ringDelta,
                    { fontSize: fs(12) },
                    accuracyTrend === 'positive'
                      ? styles.deltaPositive
                      : accuracyTrend === 'negative'
                      ? styles.deltaNegative
                      : styles.deltaNeutral,
                  ]}
                >
                  {accuracyTrend === 'positive'
                    ? `▲ ${Math.abs(accuracyDelta)}% vs last check`
                    : accuracyTrend === 'negative'
                    ? `▼ ${Math.abs(accuracyDelta)}% vs last check`
                    : 'Holding steady — nice!'}
                </Text>
              </Animated.View>
            </View>

            <View style={styles.milestoneWrap}>
              <View style={styles.milestoneHeader}>
                <Text style={styles.milestoneTitle}>Next XP milestone</Text>
                <Text style={styles.milestoneSubtitle}>
                  {xp}/{nextMilestone} XP
                </Text>
              </View>
              <View style={styles.milestoneBar}>
                <Animated.View
                  style={[styles.milestoneFill, { width: `${Math.round(milestoneProgress * 100)}%` }]}
                />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily stats</Text>
          <Text style={styles.sectionCaption}>Tap a stat to learn what improves it</Text>
        </View>

        <View style={styles.statGrid}>
          {statBlocks.map((block) => {
            const { entrance, press } = statAnimations.current[block.key];
            const translateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
            const opacity = entrance;

            return (
                <Animated.View
                  key={block.key}
                  style={[
                    styles.statCard,
                    {
                      // width responsive
                      width: isSmall ? '100%' : '48%',
                      opacity,
                      transform: [{ translateY }, { scale: press }],
                      borderColor: soften(block.accent, 0.2),
                      padding: isSmall ? 16 : 20,
                    },
                  ]}
              >
                <Pressable
                  onPressIn={() => handleStatPress(block.key, true)}
                  onPressOut={() => handleStatPress(block.key, false)}
                  hitSlop={6}
                >
                  <View style={styles.statIconRow}>
                    <LinearGradient
                      colors={[soften(block.accent, 0.2), soften(block.accent, 0.12)]}
                      style={styles.statIconWrap}
                    >
                      <Ionicons name={block.icon} size={20} color={block.accent} />
                    </LinearGradient>
                    <Text style={styles.statTitle}>{block.title}</Text>
                  </View>
                  <Text style={styles.statValue}>{block.value}</Text>
                  <Text style={styles.statCaption}>{block.caption}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {skillProfile && skillProfile.length ? (
          <View style={styles.skillSection}>
            <View style={styles.skillColumns}>
              <View style={styles.skillColumn}>
                <Text style={styles.skillColumnTitle}>Strong areas</Text>
                {strengths.length
                  ? strengths.map(renderSkillCard)
                  : (
                    <Text style={styles.skillEmpty}>
                      Play more games to surface strengths.
                    </Text>
                  )}
              </View>
              <View style={styles.skillColumn}>
                <Text style={styles.skillColumnTitle}>Focus areas</Text>
                {focusAreas.length
                  ? focusAreas.map(renderSkillCard)
                  : (
                    <Text style={styles.skillEmpty}>
                      No focus areas yet. Keep practicing!
                    </Text>
                  )}
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {stats?.recommendations?.length ? 'Recommended next' : 'Quick actions'}
          </Text>
          <Text style={styles.sectionCaption}>
            {stats?.recommendations?.length
              ? 'Based on current skill signals'
              : 'Jump straight into practice or setup'}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickScrollContent}
          snapToAlignment="start"
          decelerationRate="fast"
        >
          {quickActions.map((action) => {
            const { entrance, press } = quickAnimations.current[action.key];
            const translateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
            const opacity = entrance;

            return (
              <Animated.View
                key={action.key}
                style={[
                  styles.quickCard,
                  {
                    width: isSmall ? 200 : 220,
                    opacity,
                    transform: [{ translateY }, { scale: press }],
                  },
                ]}
              >
                <Pressable
                  style={styles.quickPressable}
                  onPress={action.onPress}
                  onPressIn={() => handleQuickPress(action.key, true)}
                  onPressOut={() => handleQuickPress(action.key, false)}
                >
                  <LinearGradient
                    colors={['#FFFFFF', '#F5F7FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.quickGradient}
                  >
                    <View style={styles.quickIconWrap}>
                      <Ionicons name={action.icon} size={20} color="#2563EB" />
                    </View>
                    <Text style={styles.quickLabel}>{action.label}</Text>
                    <Text style={styles.quickCaption}>{action.caption}</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            );
          })}
        </ScrollView>

        {stats?.nextActions?.length ? (
          <View style={styles.focusSection}>
            <Text style={styles.sectionTitle}>Focus coaching</Text>
            <Text style={styles.sectionCaption}>Suggestions tailored to weak or dormant skills</Text>
            <View style={{ marginTop: 14, gap: 12 }}>
              {stats.nextActions.map((card) => (
                <View key={card.id} style={styles.focusCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.focusHeadline}>{card.headline}</Text>
                    <Text style={styles.focusBody}>{card.body}</Text>
                  </View>
                  <Pressable
                    style={styles.focusButton}
                    onPress={() => router.push(card.route as any)}
                  >
                    <Text style={styles.focusButtonText}>{card.actionLabel}</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <View style={styles.moodHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Daily inspiration</Text>
              <Text style={styles.sectionCaption}>How are you feeling today?</Text>
            </View>
          </View>

          <View style={styles.moodSelector}>
            {(['energetic', 'focused', 'relaxed', 'celebrating'] as MoodOption[]).map((mood) => {
              const isActive = selectedMood === mood;
              const moodConfig = {
                energetic: { icon: 'flash-outline', label: 'Energetic', color: '#F59E0B' },
                focused: { icon: 'sparkles-outline', label: 'Focused', color: '#6366F1' },
                relaxed: { icon: 'leaf-outline', label: 'Relaxed', color: '#10B981' },
                celebrating: { icon: 'trophy-outline', label: 'Celebrating', color: '#EC4899' },
              }[mood];

              return (
                <Pressable
                  key={mood}
                  onPress={() => {
                    if (!isActive) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedMood(mood);
                    }
                  }}
                  style={[styles.moodOption, isActive && styles.moodOptionActive]}
                >
                  <LinearGradient
                    colors={isActive ? [moodConfig.color, moodConfig.color] : ['#FFFFFF', '#F9FAFB']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.moodOptionGradient}
                  >
                    <Ionicons
                      name={moodConfig.icon as IoniconName}
                      size={18}
                      color={isActive ? '#FFFFFF' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.moodOptionLabel,
                        isActive && styles.moodOptionLabelActive,
                      ]}
                    >
                      {moodConfig.label}
                    </Text>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Animated.View style={{ opacity: moodTransitionAnim }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodScrollContent}
          >
            {moodCards.map((card, index) => {
              const anim = moodAnimations.current[card.key];
              const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
              const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });

              return (
                <Animated.View
                  key={card.key}
                  style={[
                    styles.moodCard,
                    {
                      width: isSmall ? 220 : 260,
                      opacity: anim,
                      transform: [{ translateX }, { scale }],
                    },
                  ]}
                >
                <LinearGradient
                  colors={card.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.moodGradient}
                >
                  <View style={styles.moodIconWrap}>
                    <Ionicons name={card.icon} size={22} color="#1E293B" />
                  </View>
                  <Text style={styles.moodTitle}>{card.title}</Text>
                  <Text style={styles.moodDescription}>{card.description}</Text>
                </LinearGradient>
                </Animated.View>
              );
            })}
          </ScrollView>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const compactNumber = (value: number): string => {
  if (!Number.isFinite(value)) return '0';
  if (Math.abs(value) >= 1000) {
    const short = (value / 1000).toFixed(1);
    return `${short.replace(/\.0$/, '')}k`;
  }
  return `${value}`;
};

const soften = (hex: string, alpha: number): string => {
  const trimmed = hex.replace('#', '');
  if (trimmed.length !== 6) return hex;
  const num = parseInt(trimmed, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 28,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  loadingCaption: {
    marginTop: 8,
    color: '#64748B',
  },
  heroCard: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#4773FF',
    shadowOpacity: 0.12,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  heroGradient: {
    borderRadius: 28,
    padding: 24,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  heroGreeting: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heroHeadline: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  heroChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  heroChipText: {
    marginLeft: 6,
    fontWeight: '600',
    color: '#1E293B',
  },
  heroRingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDelta: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  deltaPositive: {
    color: '#16A34A',
  },
  deltaNegative: {
    color: '#DC2626',
  },
  deltaNeutral: {
    color: '#64748B',
  },
  milestoneWrap: {
    marginTop: 24,
    padding: 20,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  milestoneSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  milestoneBar: {
    marginTop: 14,
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  milestoneFill: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  sectionCaption: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  statCard: {
    width: '48%',
    borderRadius: 22,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    shadowColor: '#2563EB',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  statTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    flexShrink: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  statCaption: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  skillSection: {
    marginTop: 12,
  },
  skillColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  skillColumn: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  skillColumnTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  skillEmpty: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  skillIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skillTitle: {
    fontWeight: '700',
    color: '#0F172A',
  },
  skillMeta: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  skillTrend: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  quickScrollContent: {
    gap: 16,
    paddingRight: 8,
  },
  quickCard: {
    width: 220,
  },
  quickPressable: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  quickGradient: {
    padding: 20,
    borderRadius: 24,
    gap: 12,
    shadowColor: '#2563EB',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.08)',
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  quickLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  quickCaption: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  focusSection: {
    marginTop: 10,
    gap: 8,
  },
  focusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  focusHeadline: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  focusBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  focusButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#2563EB',
    borderRadius: 14,
  },
  focusButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  moodScrollContent: {
    gap: 16,
    paddingRight: 8,
  },
  moodCard: {
    width: 260,
  },
  moodGradient: {
    borderRadius: 26,
    padding: 22,
    gap: 12,
    minHeight: 160,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  moodIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  moodDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  moodHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  moodSelector: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  moodOption: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  moodOptionActive: {
    shadowColor: '#2563EB',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  moodOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  moodOptionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  moodOptionLabelActive: {
    color: '#FFFFFF',
  },
});
