import Paywall from '@/components/Paywall';
import { SessionSelector } from '@/components/special-education/SessionSelector';
import { StageContextBanner } from '@/components/therapyProgress/StageContextBanner';
import { TherapyAdventureGrid } from '@/components/therapyProgress/TherapyAdventureGrid';
import { TherapyContextBanner } from '@/components/therapyProgress/TherapyContextBanner';
import { TherapyLevelCard } from '@/components/therapyProgress/TherapyLevelCard';
import { TherapyProgressBackground } from '@/components/therapyProgress/TherapyProgressBackground';
import { TherapyProgressHeader } from '@/components/therapyProgress/TherapyProgressHeader';
import { TherapySessionCard } from '@/components/therapyProgress/TherapySessionCard';
import { SPEECH_LEVEL } from '@/constants/speechLevels';
import {
  getTherapyIdentity,
  TP_COLORS,
  TP_LAYOUT,
  type ViewMode,
} from '@/constants/therapyProgressDesign';
import { getLevelTheme } from '@/constants/stageThemes';
import {
    advanceTherapyProgress,
    fetchTherapyProgress,
    getSubscriptionStatus,
    initTherapyProgress,
    type SubscriptionStatus,
    type TherapyProgress,
} from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

const loadingAnimation = require('@/assets/animation/loading.json');
let WebLottie: React.ComponentType<{ animationData: object; loop?: boolean; autoplay?: boolean; style?: object }> | null = null;
if (Platform.OS === 'web') {
  try {
    WebLottie = require('lottie-react').default;
  } catch {
    WebLottie = null;
  }
}
let NativeLottie: React.ComponentType<{ source: object; autoPlay?: boolean; loop?: boolean; style?: object }> | null = null;
// Use the native ActivityIndicator in APK builds. Some Android devices crash when
// mounting lottie-react-native JSON animations during navigation/loading.

function TherapyProgressLoadingAnimation({ size = 160 }: { size?: number }) {
  if (Platform.OS === 'web' && WebLottie) {
    return (
      <WebLottie
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

function speechLevelSubtitle(levelNumber: number): string | null {
  switch (levelNumber) {
    case SPEECH_LEVEL.attention:
      return 'Attention & following';
    case SPEECH_LEVEL.actionImitation:
      return 'Imitation, body & words';
    case SPEECH_LEVEL.jaw:
      return 'Jaw & mouth opening';
    case SPEECH_LEVEL.voice:
      return 'Voice & speech sounds';
    case SPEECH_LEVEL.lipClosure:
      return 'Pre-oral & mouth skills';
    case SPEECH_LEVEL.speechMotor:
      return 'Speech motor readiness';
    case SPEECH_LEVEL.oralMotorCoordination:
      return 'Oral motor coordination';
    default:
      return null;
  }
}

/** TEMPORARY: `true` = no "Checking access…", no paywall — screen opens and loads data immediately. Set `false` to restore gating. */
const SKIP_THERAPY_ACCESS_GATE = true;

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
  const [checkingAccess, setCheckingAccess] = useState(!SKIP_THERAPY_ACCESS_GATE);

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

  // Mount: either open immediately (skip gate) or check subscription first
  useEffect(() => {
    if (SKIP_THERAPY_ACCESS_GATE) {
      void fetchData();
      void (async () => {
        try {
          const status = await getSubscriptionStatus();
          setSubscriptionStatus(status);
        } catch (e) {
          console.error('[THERAPY PROGRESS] subscription (background):', e);
        }
      })();
      return;
    }
    checkSubscriptionAccess();
  }, []);

  // Focus: refresh data / access when returning to tab
  useEffect(() => {
    const r = router as { addListener?: (e: string, cb: () => void) => (() => void) | undefined };
    const unsubscribe = r.addListener?.('focus', () => {
      if (SKIP_THERAPY_ACCESS_GATE) {
        void fetchData();
        void (async () => {
          try {
            const status = await getSubscriptionStatus();
            setSubscriptionStatus(status);
          } catch (e) {
            console.error('[THERAPY PROGRESS] subscription on focus:', e);
          }
        })();
        return;
      }
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
  // Free-access users (e.g. FREE_ACCESS_IDS) get all levels and sessions unlocked
  const isFreeAccess = Boolean(
    subscriptionStatus?.isFreeAccess === true ||
      subscriptionStatus?.status === 'free' ||
      subscriptionStatus?.status === 'promo'
  );

  if (!SKIP_THERAPY_ACCESS_GATE) {
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
    // Special Education: open dedicated flow (sections → sessions → games)
    if (therapyId === 'special-education') {
      router.push({ pathname: '/(tabs)/SessionGames', params: { therapy: 'special-education' } });
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
      <TherapyProgressBackground />
      <ScrollView contentContainerStyle={styles.content}>
        <TherapyProgressHeader
          mode={mode}
          onBack={() => setMode(mode === 'sessions' ? 'levels' : 'therapies')}
          showBack={mode !== 'therapies'}
        />

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
              <TherapyAdventureGrid
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
                    therapyId={selectedTherapy}
                    therapy={progressMap.get(selectedTherapy)}
                    onSelectLevel={handleSelectLevel}
                    onBack={() => setMode('therapies')}
                    isFreeAccess={isFreeAccess}
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
                    therapyId={selectedTherapy}
                    therapy={progressMap.get(selectedTherapy)!}
                    level={currentLevelObj}
                    saving={saving}
                    onBack={() => setMode('levels')}
                    onComplete={handleCompleteSession}
                    isFreeAccess={isFreeAccess}
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

function LevelsGrid({
  therapyId,
  therapy,
  onSelectLevel,
  onBack,
  isFreeAccess,
}: {
  therapyId: string;
  therapy?: TherapyProgress;
  onSelectLevel: (level: number, unlocked: boolean) => void;
  onBack: () => void;
  isFreeAccess?: boolean;
}) {
  const identity = getTherapyIdentity(therapyId);
  const levels = therapy?.levels || [];
  const maxLevel = levels.length > 0 ? Math.max(...levels.map((l) => l.levelNumber)) : 10;
  const currentLevel = isFreeAccess ? maxLevel : (therapy?.currentLevel ?? 1);

  return (
    <View style={styles.section}>
      <TherapyContextBanner
        therapy={identity}
        subtitle="Each level is its own stage — pick where to continue"
        icon="layers-outline"
      />
      <Text style={styles.sectionTitle}>Levels</Text>
      <View style={styles.stageList}>
        {levels.map((lvl, index) => (
          <TherapyLevelCard
            key={lvl.levelNumber}
            levelNumber={lvl.levelNumber}
            index={index}
            currentLevel={currentLevel}
            therapyId={therapyId}
            speechSubtitle={therapyId === 'speech' ? speechLevelSubtitle(lvl.levelNumber) : null}
            onSelectLevel={onSelectLevel}
          />
        ))}
      </View>
    </View>
  );
}

function SessionsGrid({
  therapyId,
  therapy,
  level,
  saving,
  onBack,
  onComplete,
  isFreeAccess,
}: {
  therapyId: string;
  therapy: TherapyProgress;
  level: NonNullable<TherapyProgress['levels']>[number];
  saving: boolean;
  onBack: () => void;
  onComplete: (therapyId: string, levelNumber: number, sessionNumber: number) => void;
  isFreeAccess?: boolean;
}) {
  const router = useRouter();
  const identity = getTherapyIdentity(therapyId);

  if (therapyId === 'special-education') {
    return (
      <View style={styles.section}>
        <TherapyContextBanner
          therapy={identity}
          title={`${identity.label} · Level ${level.levelNumber}`}
          subtitle="Choose a session to begin"
          icon="school-outline"
        />
        <SessionSelector
          sessions={level.sessions.map((s: { sessionNumber: number; completed: boolean; completedGames: string[] }) => ({
            sessionNumber: s.sessionNumber,
            completed: s.completed,
            completedGames: s.completedGames || [],
          }))}
          onSelectSession={(sessionNumber) => {
            router.push({
              pathname: '/(tabs)/SessionGames',
              params: {
                therapy: therapyId,
                level: level.levelNumber.toString(),
                session: sessionNumber.toString(),
              },
            });
          }}
          onBack={onBack}
          isFreeAccess={isFreeAccess}
        />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <StageContextBanner
        theme={getLevelTheme(therapyId, level.levelNumber, therapyId === 'speech' ? speechLevelSubtitle(level.levelNumber) : null)}
        therapyLabel={identity.label}
        subtitle={`${level.sessions.length} sessions · 5 games each`}
      />
      <Text style={styles.sectionTitle}>Sessions</Text>
      <View style={styles.stageList}>
        {level.sessions.map((sess: { sessionNumber: number; completed: boolean }, index: number) => (
          <TherapySessionCard
            key={sess.sessionNumber}
            sess={sess}
            index={index}
            level={level}
            therapyId={therapyId}
            isFreeAccess={isFreeAccess}
          />
        ))}
      </View>
      {saving && (
        <View style={styles.savingRow}>
          <ActivityIndicator size="small" color={identity.accent} />
          <Text style={styles.savingText}>Updating progress…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TP_COLORS.page },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: TP_COLORS.inkMuted,
  },
  content: {
    paddingHorizontal: TP_LAYOUT.horizontalPad,
    paddingTop: 8,
    paddingBottom: 40,
  },
  initButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4338CA',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  initButtonText: { color: '#fff', fontWeight: '800' },
  loading: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  section: { gap: 16 },
  stageList: { gap: 12 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: TP_COLORS.ink,
    letterSpacing: -0.3,
  },
  savingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  savingText: { color: TP_COLORS.inkMuted, fontWeight: '600' },
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
      <ActivityIndicator size="large" color={getTherapyIdentity('daily-activities').accent} />
      <Text style={{ marginTop: 16, color: TP_COLORS.inkMuted, fontWeight: '600' }}>Loading Social Stories...</Text>
    </View>
  );
}


