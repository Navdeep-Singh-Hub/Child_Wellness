import Paywall from '@/components/Paywall';
import {
  advanceTherapyProgress,
  fetchTherapyProgress,
  getSubscriptionStatus,
  initTherapyProgress,
  type SubscriptionStatus,
  type TherapyProgress,
} from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Lottie from 'lottie-react';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  LEVEL_STAGGER_MS,
  PRESS_SCALE_AMOUNT,
  SESSION_STAGGER_MS,
  SPRING_CONFIG,
  THERAPY_STAGGER_MS,
} from '@/constants/therapyProgressAnimations';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const loadingAnimation = require('@/assets/animation/loading.json');
let NativeLottie: React.ComponentType<{ source: object; autoPlay?: boolean; loop?: boolean; style?: object }> | null = null;
if (Platform.OS !== 'web') {
  try {
    NativeLottie = require('lottie-react-native').default;
  } catch {
    NativeLottie = null;
  }
}

function TherapyProgressLoadingAnimation({ size = 160 }: { size?: number }) {
  if (Platform.OS === 'web') {
    return (
      <Lottie
        animationData={loadingAnimation}
        loop
        autoplay
        style={{ width: size, height: size }}
      />
    );
  }
  if (NativeLottie) {
    return (
      <NativeLottie
        source={loadingAnimation}
        autoPlay
        loop
        style={{ width: size, height: size }}
      />
    );
  }
  return <ActivityIndicator size="large" color="#8B5CF6" />;
}

// Therapy Avatar website URL
const THERAPY_AVATAR_URL = 'https://therapy-avatar.vercel.app';

const THERAPIES = [
  { id: 'speech', label: 'Speech Therapy', desc: 'Improve communication and speech skills', color: '#2563EB', icon: 'mic' },
  { id: 'occupational', label: 'Occupational Therapy', desc: 'Develop daily living and motor skills', color: '#10B981', icon: 'hand-left' },
  { id: 'special-education', label: 'Special Education', desc: 'Educational activities tailored for special needs', color: '#8B5CF6', icon: 'school' },
  { id: 'daily-activities', label: 'Social Stories', desc: 'Learn through animated social stories', color: '#EC4899', icon: 'book' },
  { id: 'therapy-avatar', label: 'Therapy Avatar', desc: 'Interactive avatar-based learning', color: '#0EA5E9', icon: 'happy' },
];

type ViewMode = 'therapies' | 'levels' | 'sessions';

export default function TherapyProgressScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [therapies, setTherapies] = useState<TherapyProgress[]>([]);
  const [mode, setMode] = useState<ViewMode>('therapies');
  const [selectedTherapy, setSelectedTherapy] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  
  // Subscription access control
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const fetchData = async (autoInit = true) => {
    setLoading(true);
    try {
      const res = await fetchTherapyProgress();
      const list = res.therapies || [];
      if (list.length === 0 && autoInit) {
        const init = await initTherapyProgress();
        setTherapies(init.therapies || []);
      } else {
        setTherapies(list);
      }
    } catch (e: any) {
      console.error('Failed to load therapy progress', e);
      Alert.alert('Error', e?.message || 'Could not load progress');
    } finally {
      setLoading(false);
    }
  };

  // Check subscription access on mount
  useEffect(() => {
    checkSubscriptionAccess();
  }, []);

  // Re-check access when returning from Paywall
  useEffect(() => {
    const r = router as { addListener?: (e: string, cb: () => void) => (() => void) | undefined };
    const unsubscribe = r.addListener?.('focus', () => {
      checkSubscriptionAccess();
    });
    return unsubscribe;
  }, [router]);

  const checkSubscriptionAccess = async () => {
    try {
      setCheckingAccess(true);
      const status = await getSubscriptionStatus();
      console.log('[THERAPY PROGRESS] Subscription status:', status);
      setSubscriptionStatus(status);
      
      // If user has access (trial or active subscription), load therapy data
      if (status.hasAccess) {
        console.log('[THERAPY PROGRESS] User has access - loading therapy data');
        await fetchData();
      } else {
        console.log('[THERAPY PROGRESS] User does NOT have access - will show Paywall');
      }
    } catch (error: any) {
      console.error('Failed to check subscription access:', error);
      // On error, still try to load data (graceful degradation)
      await fetchData();
    } finally {
      setCheckingAccess(false);
    }
  };

  const progressMap = useMemo(() => new Map(therapies.map((t) => [t.therapy, t])), [therapies]);
  const hasData = therapies && therapies.length > 0;

  // Show Paywall if user doesn't have access
  if (checkingAccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <TherapyProgressLoadingAnimation size={160} />
          <Text style={styles.loadingText}>Checking access...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!subscriptionStatus?.hasAccess) {
    return <Paywall onSuccess={checkSubscriptionAccess} />;
  }

  const handleSelectTherapy = (therapyId: string) => {
    // For daily-activities, navigate directly to videos (skip levels/sessions)
    if (therapyId === 'daily-activities') {
      router.push({
        pathname: '/(tabs)/SessionGames',
        params: {
          therapy: 'daily-activities',
        },
      });
      return;
    }
    // For special-education, navigate directly to special education navigator (skip levels/sessions)
    if (therapyId === 'special-education') {
      router.push({
        pathname: '/(tabs)/SessionGames',
        params: {
          therapy: 'special-education',
        },
      });
      return;
    }
    // For therapy-avatar, open the external Vercel app
    if (therapyId === 'therapy-avatar') {
      Linking.openURL(THERAPY_AVATAR_URL).catch(() => {
        Alert.alert('Could not open', 'Unable to open Therapy Avatar. Please try again.');
      });
      return;
    }

    setSelectedTherapy(therapyId);
    setSelectedLevel(null);
    setMode('levels');
  };

  const handleSelectLevel = (level: number, unlocked: boolean) => {
    if (!unlocked) return;
    setSelectedLevel(level);
    setMode('sessions');
  };

  const handleCompleteSession = async (therapyId: string, level: number, session: number) => {
    setSaving(true);
    try {
      const res = await advanceTherapyProgress({
        therapy: therapyId,
        levelNumber: level,
        sessionNumber: session,
        markCompleted: true,
      });
      setTherapies((prev) =>
        prev.map((t) => (t.therapy === therapyId ? res.therapy : t)),
      );
      // If we just completed the current session, refresh selection
      setSelectedLevel(level);
      setMode('sessions');
    } catch (e: any) {
      console.error('Advance failed', e);
      Alert.alert('Error', e?.message || 'Could not update progress');
    } finally {
      setSaving(false);
    }
  };

  const currentTherapy = selectedTherapy ? progressMap.get(selectedTherapy) : null;
  const currentLevelObj =
    currentTherapy?.levels?.find((l) => l.levelNumber === selectedLevel) ?? null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Header mode={mode} onBack={() => setMode(mode === 'sessions' ? 'levels' : 'therapies')} showBack={mode !== 'therapies'} />

        {loading ? (
          <View style={styles.loading}>
            <TherapyProgressLoadingAnimation size={140} />
          </View>
        ) : (
          <>
            {!hasData && (
              <TouchableOpacity style={styles.initButton} onPress={() => fetchData(true)}>
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.initButtonText}>Initialize Progress</Text>
              </TouchableOpacity>
            )}

            {mode === 'therapies' && (
              <TherapyGrid
                therapies={THERAPIES}
                progressMap={progressMap}
                onSelect={handleSelectTherapy}
                saving={saving}
              />
            )}

            {mode === 'levels' && selectedTherapy && (
              <>
                {selectedTherapy === 'daily-activities' ? (
                  <DailyActivitiesRedirect />
                ) : (
                  <LevelsGrid
                    therapyMeta={THERAPIES.find((t) => t.id === selectedTherapy)!}
                    therapy={progressMap.get(selectedTherapy)}
                    onSelectLevel={handleSelectLevel}
                    onBack={() => setMode('therapies')}
                  />
                )}
              </>
            )}

            {mode === 'sessions' && selectedTherapy && selectedLevel && currentLevelObj && (
              <>
                {selectedTherapy === 'daily-activities' ? (
                  <DailyActivitiesRedirect />
                ) : (
                  <SessionsGrid
                    therapyMeta={THERAPIES.find((t) => t.id === selectedTherapy)!}
                    therapy={progressMap.get(selectedTherapy)!}
                    level={currentLevelObj}
                    saving={saving}
                    onBack={() => setMode('levels')}
                    onComplete={handleCompleteSession}
                  />
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ mode, onBack, showBack }: { mode: ViewMode; onBack: () => void; showBack: boolean }) {
  const title =
    mode === 'therapies'
      ? 'Your Adventures'
      : mode === 'levels'
      ? 'Choose Your Level'
      : 'Pick a Session';
  const subtitle =
    mode === 'therapies'
      ? 'Pick an adventure to continue your journey.'
      : mode === 'levels'
      ? 'Beat each level to unlock the next one.'
      : 'Complete games in each session to level up.';

  return (
    <View style={{ marginBottom: 16 }}>
      {showBack && (
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 8 }}>
          <Text style={{ color: '#2563EB', fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 26, fontWeight: '900', color: '#0F172A' }}>{title}</Text>
        {mode === 'levels' && <Ionicons name="trophy" size={22} color="#F59E0B" />}
        {mode === 'sessions' && <Ionicons name="play-circle" size={22} color="#2563EB" />}
      </View>
      <Text style={{ marginTop: 4, color: '#475569', lineHeight: 20 }}>{subtitle}</Text>
    </View>
  );
}

// Lighten hex color for gradient end
function lightenHex(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 0xff) + (255 - ((n >> 16) & 0xff)) * factor);
  const g = Math.min(255, ((n >> 8) & 0xff) + (255 - ((n >> 8) & 0xff)) * factor);
  const b = Math.min(255, (n & 0xff) + (255 - (n & 0xff)) * factor);
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

function TherapyCard({
  t,
  index,
  progress,
  onSelect,
  saving,
}: {
  t: (typeof THERAPIES)[number];
  index: number;
  progress: TherapyProgress | undefined;
  onSelect: (therapyId: string) => void;
  saving: boolean;
}) {
  const press = useSharedValue(0);
  const currentLevel = progress?.currentLevel ?? 1;
  const currentSession = progress?.currentSession ?? 1;
  const completedSessions = progress?.levels?.reduce(
    (sum, lv) => sum + (lv.sessions?.filter((s) => s.completed).length ?? 0),
    0,
  ) ?? 0;
  const gradientColors = [t.color, lightenHex(t.color, 0.85)] as [string, string];

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * PRESS_SCALE_AMOUNT }],
  }));

  return (
    <Animated.View
      style={styles.therapyCardTouchable}
      entering={FadeInUp.delay(index * THERAPY_STAGGER_MS).springify().damping(SPRING_CONFIG.damping)}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => { press.value = withSpring(1, SPRING_CONFIG); }}
        onPressOut={() => { press.value = withSpring(0, SPRING_CONFIG); }}
        onPress={() => onSelect(t.id)}
        disabled={saving}
        style={styles.therapyCardTouchableInner}
      >
        <Animated.View style={pressStyle}>
          <LinearGradient
            colors={gradientColors}
            style={styles.therapyCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.therapyStarBadge}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.therapyStarText}>{completedSessions}</Text>
            </View>
            <View style={[styles.therapyIconWrap, { backgroundColor: 'rgba(255,255,255,0.35)' }]}>
              <Ionicons name={t.icon as any} size={28} color="#fff" />
            </View>
            <Text style={styles.therapyTitleWhite}>{t.label}</Text>
            <Text style={styles.therapyDescWhite}>{t.desc}</Text>
            <Text style={styles.therapyMetaWhite}>Level {currentLevel} · Session {currentSession}</Text>
            <View style={styles.therapyProgressBar}>
              <View
                style={[
                  styles.therapyProgressFill,
                  {
                    width: `${Math.min(100, (currentLevel - 1) * 10 + currentSession)}%`,
                  },
                ]}
              />
            </View>
            <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.9)" style={styles.therapyChevron} />
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function TherapyGrid({
  therapies,
  progressMap,
  onSelect,
  saving,
}: {
  therapies: typeof THERAPIES;
  progressMap: Map<string, TherapyProgress>;
  onSelect: (therapyId: string) => void;
  saving: boolean;
}) {
  return (
    <View style={styles.grid}>
      {therapies.map((t, index) => (
        <TherapyCard
          key={t.id}
          t={t}
          index={index}
          progress={progressMap.get(t.id)}
          onSelect={onSelect}
          saving={saving}
        />
      ))}
    </View>
  );
}

function LevelCard({
  lvl,
  index,
  currentLevel,
  therapyMeta,
  onSelectLevel,
}: {
  lvl: { levelNumber: number };
  index: number;
  currentLevel: number;
  therapyMeta: { id: string; label: string; color: string };
  onSelectLevel: (level: number, unlocked: boolean) => void;
}) {
  const unlocked = lvl.levelNumber <= currentLevel;
  const isCurrent = lvl.levelNumber === currentLevel;
  const press = useSharedValue(0);
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    if (isCurrent) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1200 }),
          withTiming(0, { duration: 1200 })
        ),
        -1
      );
    }
    return () => {
      pulse.value = 0;
    };
  }, [isCurrent, pulse]);

  const pressStyle = useAnimatedStyle(() => {
    const pressScale = 1 - press.value * PRESS_SCALE_AMOUNT;
    const pulseScale = isCurrent ? 1 + pulse.value * PRESS_SCALE_AMOUNT : 1;
    return { transform: [{ scale: pressScale * pulseScale }] };
  });

  return (
    <Animated.View
      style={styles.levelCardTouchable}
      entering={FadeInUp.delay(index * LEVEL_STAGGER_MS).springify().damping(SPRING_CONFIG.damping)}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => { if (unlocked) press.value = withSpring(1, SPRING_CONFIG); }}
        onPressOut={() => { press.value = withSpring(0, SPRING_CONFIG); }}
        onPress={() => onSelectLevel(lvl.levelNumber, unlocked)}
        style={styles.levelCardTouchableInner}
      >
        <Animated.View style={pressStyle}>
          {unlocked ? (
            <LinearGradient
              colors={[therapyMeta.color, lightenHex(therapyMeta.color, 0.7)] as [string, string]}
              style={[styles.levelCard, styles.levelCardUnlocked, isCurrent && styles.levelCardCurrent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.levelTitleLight}>Level {lvl.levelNumber}</Text>
              <Text style={styles.levelSubtitleLight}>10 sessions</Text>
              <View style={styles.playButton}>
                <Text style={styles.playButtonText}>Play</Text>
                <Ionicons name="play" size={14} color="#fff" />
              </View>
            </LinearGradient>
          ) : (
            <View style={[styles.levelCard, styles.levelCardLocked]}>
              <Ionicons name="lock-closed" size={20} color="#9CA3AF" style={{ marginBottom: 6 }} />
              <Text style={[styles.levelTitle, styles.lockedText]}>Level {lvl.levelNumber}</Text>
              <Text style={[styles.levelSubtitle, styles.lockedText]}>10 sessions</Text>
              <Text style={styles.lockedLabel}>Locked</Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function LevelsGrid({
  therapyMeta,
  therapy,
  onSelectLevel,
  onBack,
}: {
  therapyMeta: { id: string; label: string; color: string };
  therapy?: TherapyProgress;
  onSelectLevel: (level: number, unlocked: boolean) => void;
  onBack: () => void;
}) {
  const levels = therapy?.levels || [];
  const currentLevel = therapy?.currentLevel ?? 1;
  return (
    <View style={{ gap: 12 }}>
      <TouchableOpacity onPress={onBack}>
        <Text style={{ color: '#2563EB', fontWeight: '700' }}>← Back to Therapies</Text>
      </TouchableOpacity>
      <View style={[styles.banner, { borderColor: therapyMeta.color }]}>
        <View style={[styles.iconBadge, { backgroundColor: `${therapyMeta.color}20` }]}>
          <Ionicons name="medkit-outline" size={22} color={therapyMeta.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>{therapyMeta.label}</Text>
          <Text style={styles.bannerSubtitle}>10 sessions available</Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Levels</Text>
      <View style={styles.grid}>
        {levels.map((lvl, index) => (
          <LevelCard
            key={lvl.levelNumber}
            lvl={lvl}
            index={index}
            currentLevel={currentLevel}
            therapyMeta={therapyMeta}
            onSelectLevel={onSelectLevel}
          />
        ))}
      </View>
    </View>
  );
}

function SessionCard({
  sess,
  index,
  level,
  therapyMeta,
}: {
  sess: { sessionNumber: number; completed: boolean };
  index: number;
  level: NonNullable<TherapyProgress['levels']>[number];
  therapyMeta: { id: string; label: string; color: string };
}) {
  const router = useRouter();
  const prevInLevel = level.sessions.find((s: { sessionNumber: number; completed: boolean }) => s.sessionNumber === sess.sessionNumber - 1);
  const unlocked = sess.sessionNumber === 1 || prevInLevel?.completed === true;
  const completed = sess.completed;
  const isCurrentSession = unlocked && !completed;

  const press = useSharedValue(0);
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    if (isCurrentSession) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1
      );
    }
    return () => { pulse.value = 0; };
  }, [isCurrentSession, pulse]);

  const pressStyle = useAnimatedStyle(() => {
    const pressScale = 1 - press.value * PRESS_SCALE_AMOUNT;
    const pulseScale = isCurrentSession ? 1 + pulse.value * 0.015 : 1;
    return { transform: [{ scale: pressScale * pulseScale }] };
  });

  return (
    <Animated.View
      style={styles.sessionCardTouchable}
      entering={FadeInUp.delay(index * SESSION_STAGGER_MS).springify().damping(SPRING_CONFIG.damping)}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => { if (unlocked) press.value = withSpring(1, SPRING_CONFIG); }}
        onPressOut={() => { press.value = withSpring(0, SPRING_CONFIG); }}
        onPress={() => {
          if (!unlocked) return;
          router.push({
            pathname: '/(tabs)/SessionGames',
            params: {
              therapy: therapyMeta.id,
              level: level.levelNumber.toString(),
              session: sess.sessionNumber.toString(),
            },
          });
        }}
        style={styles.sessionCardTouchableInner}
      >
        <Animated.View style={pressStyle}>
          {completed ? (
            <View style={[styles.sessionCard, styles.sessionCardCompleted]}>
              <View style={styles.sessionCardContent}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.sessionTitle}>Session {sess.sessionNumber}</Text>
                <Text style={styles.sessionSubtitle}>5 games</Text>
                <View style={styles.playAgainChip}>
                  <Text style={styles.playAgainText}>Play again</Text>
                </View>
              </View>
            </View>
          ) : unlocked ? (
            <LinearGradient
              colors={[therapyMeta.color, lightenHex(therapyMeta.color, 0.75)] as [string, string]}
              style={[styles.sessionCard, styles.sessionCardUnlocked]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.sessionCardContent}>
                <Text style={styles.sessionTitleLight}>Session {sess.sessionNumber}</Text>
                <Text style={styles.sessionSubtitleLight}>5 games</Text>
                <View style={styles.playNowButton}>
                  <Text style={styles.playNowButtonText}>Play Now</Text>
                  <Ionicons name="play" size={14} color="#fff" />
                </View>
              </View>
            </LinearGradient>
          ) : (
            <View style={[styles.sessionCard, styles.sessionCardLocked]}>
              <Ionicons name="lock-closed" size={20} color="#9CA3AF" style={{ marginBottom: 6 }} />
              <Text style={[styles.sessionTitle, styles.lockedText]}>Session {sess.sessionNumber}</Text>
              <Text style={[styles.sessionSubtitle, styles.lockedText]}>5 games</Text>
              <Text style={styles.lockedLabel}>Locked</Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function SessionsGrid({
  therapyMeta,
  therapy,
  level,
  saving,
  onBack,
  onComplete,
}: {
  therapyMeta: { id: string; label: string; color: string };
  therapy: TherapyProgress;
  level: NonNullable<TherapyProgress['levels']>[number];
  saving: boolean;
  onBack: () => void;
  onComplete: (therapyId: string, levelNumber: number, sessionNumber: number) => void;
}) {
  return (
    <View style={{ gap: 12 }}>
      <TouchableOpacity onPress={onBack}>
        <Text style={{ color: '#2563EB', fontWeight: '700' }}>← Back to {therapyMeta.label}</Text>
      </TouchableOpacity>
      <Animated.View
        style={[styles.banner, { borderColor: therapyMeta.color }]}
        entering={FadeInDown.duration(300)}
      >
        <View style={[styles.iconBadge, { backgroundColor: `${therapyMeta.color}20` }]}>
          <Ionicons name="calendar-outline" size={22} color={therapyMeta.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>{therapyMeta.label} - Level {level.levelNumber}</Text>
          <Text style={styles.bannerSubtitle}>Select a session to start playing games</Text>
        </View>
      </Animated.View>
      <Text style={styles.sectionTitle}>Sessions</Text>
      <View style={styles.grid}>
        {level.sessions.map((sess: { sessionNumber: number; completed: boolean }, index: number) => (
          <SessionCard
            key={sess.sessionNumber}
            sess={sess}
            index={index}
            level={level}
            therapyMeta={therapyMeta}
          />
        ))}
      </View>
      {saving && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ActivityIndicator size="small" color={therapyMeta.color} />
          <Text style={{ color: '#475569' }}>Updating progress…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  content: { padding: 16, paddingBottom: 32 },
  initButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  initButtonText: { color: '#fff', fontWeight: '800' },
  loading: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  therapyCardTouchable: {
    width: '48%',
    minHeight: 44,
  },
  therapyCardTouchableInner: {
    width: '100%',
  },
  therapyCard: {
    borderRadius: 24,
    padding: 16,
    minHeight: 140,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
  },
  therapyStarBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  therapyStarText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  therapyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  therapyTitleWhite: { fontSize: 16, fontWeight: '800', color: '#fff' },
  therapyDescWhite: { color: 'rgba(255,255,255,0.9)', marginTop: 4, lineHeight: 18, fontSize: 13 },
  therapyMetaWhite: { marginTop: 8, fontWeight: '700', color: 'rgba(255,255,255,0.95)', fontSize: 13 },
  therapyProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  therapyProgressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 2,
  },
  therapyChevron: { position: 'absolute', right: 12, top: '50%', marginTop: -11 },
  therapyTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  therapyDesc: { color: '#475569', marginTop: 6, lineHeight: 18 },
  therapyMeta: { marginTop: 10, fontWeight: '700', color: '#2563EB' },
  banner: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  bannerSubtitle: { color: '#475569', marginTop: 2 },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginTop: 8, marginBottom: 4 },
  levelCardTouchable: { width: '48%' },
  levelCardTouchableInner: { width: '100%' },
  levelCard: {
    width: '100%',
    borderRadius: 20,
    padding: 14,
    minHeight: 100,
    borderWidth: 2,
  },
  levelCardUnlocked: {
    borderColor: 'transparent',
  },
  levelCardCurrent: {
    borderColor: 'rgba(255,255,255,0.8)',
  },
  levelCardLocked: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelTitleLight: { fontSize: 16, fontWeight: '800', color: '#fff' },
  levelSubtitleLight: { color: 'rgba(255,255,255,0.9)', marginTop: 4, fontSize: 13 },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  playButtonText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  levelTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  levelSubtitle: { color: '#475569', marginTop: 4 },
  lockedLabel: { color: '#9CA3AF', fontWeight: '700', marginTop: 4, fontSize: 13 },
  lockedText: { color: '#9CA3AF' },
  sessionCardTouchable: { width: '48%' },
  sessionCardTouchableInner: { width: '100%' },
  sessionCard: {
    width: '100%',
    borderRadius: 20,
    padding: 14,
    minHeight: 100,
    borderWidth: 2,
  },
  sessionCardCompleted: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  sessionCardUnlocked: {
    borderColor: 'transparent',
  },
  sessionCardLocked: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionCardContent: { flex: 1 },
  sessionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  sessionSubtitle: { color: '#475569', marginTop: 4, fontSize: 13 },
  sessionTitleLight: { fontSize: 16, fontWeight: '800', color: '#fff' },
  sessionSubtitleLight: { color: 'rgba(255,255,255,0.9)', marginTop: 4, fontSize: 13 },
  playNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  playNowButtonText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  playAgainChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
  },
  playAgainText: { color: '#059669', fontWeight: '700', fontSize: 13 },
  cardUnlocked: { borderColor: '#E2E8F0' },
  cardLocked: { borderColor: '#E5E7EB', backgroundColor: '#F8FAFC' },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#ECFEFF',
    borderRadius: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#CFFAFE',
  },
});

// Component to redirect daily-activities directly to videos (bypassing levels/sessions)
function DailyActivitiesRedirect() {
  const router = useRouter();
  
  React.useEffect(() => {
    // Navigate to a special route for social stories videos
    // We'll handle this in SessionGames.tsx
    router.replace({
      pathname: '/(tabs)/SessionGames',
      params: {
        therapy: 'daily-activities',
      },
    });
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <ActivityIndicator size="large" color="#EC4899" />
      <Text style={{ marginTop: 16, color: '#475569' }}>Loading Social Stories...</Text>
    </View>
  );
}


