/**
 * Authenticated home dashboard — Warm Aurora Sanctuary
 */
import { HomeAdminModals } from '@/components/home/HomeAdminModals';
import { HomeAmbientBackground } from '@/components/home/HomeAmbientBackground';
import { HomeGreetingHeader } from '@/components/home/HomeGreetingHeader';
import { HomeJourneyCard } from '@/components/home/HomeJourneyCard';
import { HomeMoodSelector } from '@/components/home/HomeMoodSelector';
import { HomeProgressHero } from '@/components/home/HomeProgressHero';
import { HomeQuickActionsRail } from '@/components/home/HomeQuickActionsRail';
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader';
import { HomeStatsGrid } from '@/components/home/HomeStatsGrid';
import {
  HOME_COLORS,
  HOME_LAYOUT,
  HOME_PLATFORM,
  type HomeMoodKey,
  type HomeQuickActionKey,
} from '@/constants/homeDesign';
import {
  fetchMyStats,
  fetchSkillProfile,
  getMyProfile,
  type StatsResponse,
} from '@/utils/api';
import {
  openKioskSettings,
  releaseKioskDeviceOwner,
  SHOW_KIOSK_NETWORK_SHORTCUTS,
  type KioskSettingsTarget,
} from '@/utils/kioskAdmin';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

const ADMIN_PIN = process.env.EXPO_PUBLIC_KIOSK_ADMIN_PIN || '2468';
const compactNumber = (n: number) =>
  Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

export default function Index() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsResponse | null>({
    xp: 0,
    coins: 0,
    hearts: 5,
    streakDays: 0,
    bestStreak: 0,
    lastPlayedDate: null,
    accuracy: 0,
    levelLabel: 'Explorer',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<HomeMoodKey>('focused');
  const [canScroll, setCanScroll] = useState(true);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [adminPin, setAdminPin] = useState('');

  const scrollY = useRef(new Animated.Value(0)).current;
  const isLoadingRef = useRef(false);
  const adminTapCountRef = useRef(0);
  const lastAdminTapRef = useRef(0);
  const enablePullToRefresh = Platform.OS !== 'android' || canScroll;

  const loadStats = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      const [s, , me] = await Promise.all([
        fetchMyStats().catch(() => null),
        fetchSkillProfile().catch(() => null),
        getMyProfile().catch(() => null),
      ]);
      if (s) setStats(s);
      if (me?.firstName) setFirstName(me.firstName);
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  useFocusEffect(useCallback(() => { loadStats(); }, [loadStats]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  const handleAdminLogoPress = useCallback(() => {
    const now = Date.now();
    adminTapCountRef.current = now - lastAdminTapRef.current > 3000 ? 1 : adminTapCountRef.current + 1;
    lastAdminTapRef.current = now;
    if (adminTapCountRef.current >= 5) {
      adminTapCountRef.current = 0;
      setAdminPin('');
      setShowAdminPin(true);
    }
  }, []);

  const handleAdminPinSubmit = useCallback(() => {
    if (adminPin === ADMIN_PIN) {
      setShowAdminPin(false);
      setShowAdminMenu(true);
      setAdminPin('');
      return;
    }
    setAdminPin('');
    Alert.alert('Incorrect PIN', 'Please enter the admin PIN to open kiosk controls.');
  }, [adminPin]);

  const handleOpenAdminSetting = useCallback(async (target: KioskSettingsTarget) => {
    try {
      setShowAdminMenu(false);
      await openKioskSettings(target);
    } catch {
      Alert.alert('Could not open settings', 'Please try again or reconnect the tablet with ADB.');
    }
  }, []);

  const handleReleaseKiosk = useCallback(() => {
    Alert.alert(
      'Release kiosk mode?',
      'This removes device-owner and lock task so you can uninstall the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Release',
          style: 'destructive',
          onPress: async () => {
            try {
              const ok = await releaseKioskDeviceOwner();
              setShowAdminMenu(false);
              if (!ok) Alert.alert('Could not release', 'Try adb: dpm clear-device-owner-app com.anonymous.childwellness');
            } catch {
              Alert.alert('Could not release', 'Try adb: dpm clear-device-owner-app com.anonymous.childwellness');
            }
          },
        },
      ],
    );
  }, []);

  const statValues = useMemo(
    () => ({
      xp: compactNumber(stats?.xp ?? 0),
      coins: compactNumber(stats?.coins ?? 0),
      streak: `${stats?.streakDays ?? 0}`,
      hearts: `${stats?.hearts ?? 5}`,
    }),
    [stats],
  );

  const handleQuickAction = useCallback(
    (key: HomeQuickActionKey) => {
      const routes: Record<HomeQuickActionKey, string> = {
        play: '/(tabs)/Games',
        aac: '/(tabs)/AACgrid',
        smart: '/(tabs)/SmartExplorer',
        profile: '/(tabs)/Profile',
        matcher: '/the-matcher',
      };
      router.push(routes[key] as any);
    },
    [router],
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <HomeAmbientBackground />

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        bounces={false}
        refreshControl={
          enablePullToRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={HOME_COLORS.violet} />
          ) : undefined
        }
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        scrollEnabled={Platform.OS === 'android' ? canScroll : true}
        onLayout={(e) => setLayoutHeight(e.nativeEvent.layout.height)}
        onContentSizeChange={(_, h) => {
          if (Platform.OS === 'android') setCanScroll(h > layoutHeight + 24);
        }}
      >
        <HomeGreetingHeader
          firstName={firstName}
          levelLabel={stats?.levelLabel}
          onLogoPress={handleAdminLogoPress}
          scrollY={scrollY}
        />

        <HomeProgressHero
          levelLabel={stats?.levelLabel || 'Explorer'}
          streak={stats?.streakDays ?? 0}
          bestStreak={stats?.bestStreak ?? 0}
          accuracy={stats?.accuracy ?? 0}
        />

        <View style={styles.section}>
          <HomeSectionHeader
            variant="journey"
            icon="map"
            title="Continue your journey"
            subtitle="Resume therapy sessions and unlock new levels"
          />
          <HomeJourneyCard onPress={() => router.push('/(tabs)/TherapyProgress')} />
        </View>

        <View style={styles.section}>
          <HomeSectionHeader
            variant="stats"
            icon="stats-chart"
            title="Your progress"
            subtitle="Track rewards and consistency"
          />
          <HomeStatsGrid values={statValues} />
        </View>

        <View style={styles.section}>
          <HomeSectionHeader
            variant="actions"
            icon="flash"
            title="Quick actions"
            subtitle="Jump straight into tools and games"
          />
          <HomeQuickActionsRail onAction={handleQuickAction} />
        </View>

        <View style={styles.section}>
          <HomeSectionHeader
            variant="mood"
            icon="happy"
            title="How are you feeling?"
            subtitle="We’ll tailor the pace of your next activities"
          />
          <HomeMoodSelector selected={selectedMood} onSelect={setSelectedMood} />
        </View>

        <View style={styles.footer} />
      </Animated.ScrollView>

      <HomeAdminModals
        showPin={showAdminPin}
        showMenu={showAdminMenu}
        adminPin={adminPin}
        showNetworkShortcuts={SHOW_KIOSK_NETWORK_SHORTCUTS}
        onPinChange={setAdminPin}
        onPinSubmit={handleAdminPinSubmit}
        onPinClose={() => setShowAdminPin(false)}
        onMenuClose={() => setShowAdminMenu(false)}
        onOpenSetting={handleOpenAdminSetting}
        onReleaseKiosk={handleReleaseKiosk}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: HOME_COLORS.mesh1, overflow: 'hidden' },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: {
    paddingHorizontal: HOME_LAYOUT.horizontalPad,
    paddingTop: HOME_PLATFORM.scrollTopPad,
    paddingBottom: 48,
  },
  section: { marginTop: HOME_LAYOUT.sectionGap },
  footer: { height: 24 },
});
