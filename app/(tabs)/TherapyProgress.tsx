import React, { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  advanceTherapyProgress,
  fetchTherapyProgress,
  initTherapyProgress,
  type TherapyProgress,
} from '@/utils/api';

const THERAPIES = [
  { id: 'speech', label: 'Speech Therapy', desc: 'Improve communication and speech skills', color: '#2563EB', icon: 'mic' },
  { id: 'occupational', label: 'Occupational Therapy', desc: 'Develop daily living and motor skills', color: '#10B981', icon: 'hand-left' },
  { id: 'behavioral', label: 'Behavioral Therapy', desc: 'Learn positive behaviors and social skills', color: '#F59E0B', icon: 'sparkles' },
  { id: 'special-education', label: 'Special Education', desc: 'Educational activities tailored for special needs', color: '#8B5CF6', icon: 'school' },
  { id: 'daily-activities', label: 'Daily Activities', desc: 'Practice everyday life skills', color: '#EC4899', icon: 'home' },
  { id: 'therapy-avatar', label: 'Therapy Avatar', desc: 'Interactive avatar-based learning', color: '#0EA5E9', icon: 'happy' },
];

type ViewMode = 'therapies' | 'levels' | 'sessions';

export default function TherapyProgressScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [therapies, setTherapies] = useState<TherapyProgress[]>([]);
  const [mode, setMode] = useState<ViewMode>('therapies');
  const [selectedTherapy, setSelectedTherapy] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

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

  useEffect(() => {
    fetchData();
  }, []);

  const progressMap = useMemo(() => new Map(therapies.map((t) => [t.therapy, t])), [therapies]);
  const hasData = therapies && therapies.length > 0;

  const handleSelectTherapy = (therapyId: string) => {
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
    currentTherapy?.levels.find((l) => l.levelNumber === selectedLevel) || null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Header mode={mode} onBack={() => setMode(mode === 'sessions' ? 'levels' : 'therapies')} showBack={mode !== 'therapies'} />

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#2563EB" />
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
              <LevelsGrid
                therapyMeta={THERAPIES.find((t) => t.id === selectedTherapy)!}
                therapy={progressMap.get(selectedTherapy)}
                onSelectLevel={handleSelectLevel}
                onBack={() => setMode('therapies')}
              />
            )}

            {mode === 'sessions' && selectedTherapy && selectedLevel && currentLevelObj && (
              <SessionsGrid
                therapyMeta={THERAPIES.find((t) => t.id === selectedTherapy)!}
                therapy={progressMap.get(selectedTherapy)!}
                level={currentLevelObj}
                saving={saving}
                onComplete={handleCompleteSession}
              />
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
      ? 'Select a Therapy'
      : mode === 'levels'
      ? 'Choose a Level'
      : 'Select a Session';
  const subtitle =
    mode === 'therapies'
      ? 'Choose a therapy to start your learning journey'
      : mode === 'levels'
      ? 'Each therapy has 10 levels · 10 sessions per level · 5 games per session'
      : 'Select a session to start playing games';

  return (
    <View style={{ marginBottom: 16 }}>
      {showBack && (
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 8 }}>
          <Text style={{ color: '#2563EB', fontWeight: '700' }}>← Back</Text>
        </TouchableOpacity>
      )}
      <Text style={{ fontSize: 26, fontWeight: '900', color: '#0F172A' }}>{title}</Text>
      <Text style={{ marginTop: 4, color: '#475569', lineHeight: 20 }}>{subtitle}</Text>
    </View>
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
      {therapies.map((t) => {
        const progress = progressMap.get(t.id);
        const currentLevel = progress?.currentLevel ?? 1;
        const currentSession = progress?.currentSession ?? 1;
        return (
          <TouchableOpacity
            key={t.id}
            style={[styles.therapyCard, { borderColor: t.color }]}
            activeOpacity={0.9}
            onPress={() => onSelect(t.id)}
            disabled={saving}
          >
            <View style={styles.therapyIconWrap}>
              <Ionicons name={t.icon as any} size={32} color={t.color} />
            </View>
            <Text style={styles.therapyTitle}>{t.label}</Text>
            <Text style={styles.therapyDesc}>{t.desc}</Text>
            <Text style={styles.therapyMeta}>Level {currentLevel} · Session {currentSession}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
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
        {levels.map((lvl) => {
          const unlocked = lvl.levelNumber <= currentLevel;
          return (
            <TouchableOpacity
              key={lvl.levelNumber}
              style={[
                styles.levelCard,
                unlocked ? styles.cardUnlocked : styles.cardLocked,
                unlocked && lvl.levelNumber === currentLevel ? { borderColor: therapyMeta.color } : null,
              ]}
              activeOpacity={unlocked ? 0.9 : 1}
              onPress={() => onSelectLevel(lvl.levelNumber, unlocked)}
            >
              <Text style={[styles.levelTitle, !unlocked && styles.lockedText]}>Level {lvl.levelNumber}</Text>
              <Text style={[styles.levelSubtitle, !unlocked && styles.lockedText]}>10 sessions available</Text>
              {!unlocked && (
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={14} color="#9CA3AF" />
                  <Text style={{ color: '#9CA3AF', fontWeight: '700', marginLeft: 4 }}>Locked</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function SessionsGrid({
  therapyMeta,
  therapy,
  level,
  saving,
  onComplete,
}: {
  therapyMeta: { id: string; label: string; color: string };
  therapy: TherapyProgress;
  level: TherapyProgress['levels'][number];
  saving: boolean;
  onComplete: (therapyId: string, levelNumber: number, sessionNumber: number) => void;
}) {
  const router = useRouter();
  const currentLevel = therapy.currentLevel;
  const currentSession = therapy.currentSession;
  const isCurrentLevel = level.levelNumber === currentLevel;
  const isFollowBallAvailable =
    therapyMeta.id === 'speech' && level.levelNumber === 1 && therapy.currentSession >= 1;
  return (
    <View style={{ gap: 12 }}>
      <TouchableOpacity onPress={() => {}}>
        <Text style={{ color: '#2563EB', fontWeight: '700' }}>← Back to {therapyMeta.label}</Text>
      </TouchableOpacity>
      <View style={[styles.banner, { borderColor: therapyMeta.color }]}>
        <View style={[styles.iconBadge, { backgroundColor: `${therapyMeta.color}20` }]}>
          <Ionicons name="calendar-outline" size={22} color={therapyMeta.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>{therapyMeta.label} - Level {level.levelNumber}</Text>
          <Text style={styles.bannerSubtitle}>Select a session to start playing games</Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Sessions</Text>
      <View style={styles.grid}>
        {level.sessions.map((sess) => {
          const unlocked = isCurrentLevel && sess.sessionNumber <= currentSession;
          const completed = sess.completed;
          const labelColor = unlocked ? '#0F172A' : '#9CA3AF';
          return (
            <TouchableOpacity
              key={sess.sessionNumber}
              style={[
                styles.sessionCard,
                unlocked ? styles.cardUnlocked : styles.cardLocked,
                completed ? { borderColor: therapyMeta.color, borderWidth: 2 } : null,
              ]}
              activeOpacity={unlocked ? 0.9 : 1}
              onPress={() => {
                if (!unlocked) return;
                const isSpeechLvl1Sess1 =
                  therapyMeta.id === 'speech' &&
                  level.levelNumber === 1 &&
                  sess.sessionNumber === 1;
                const isOccupationalLvl1Sess1 =
                  therapyMeta.id === 'occupational' &&
                  level.levelNumber === 1 &&
                  sess.sessionNumber === 1;

                if (isSpeechLvl1Sess1 || isOccupationalLvl1Sess1) {
                  router.push({
                    pathname: '/(tabs)/SessionGames',
                    params: {
                      therapy: therapyMeta.id,
                      level: level.levelNumber.toString(),
                      session: sess.sessionNumber.toString(),
                    },
                  });
                } else {
                  Alert.alert(
                    'Game not available',
                    'Games are currently only available in Speech L1 Session 1 and Occupational L1 Session 1.'
                  );
                }
              }}
            >
              <Text style={[styles.levelTitle, { color: labelColor }]}>
                Session {sess.sessionNumber}
              </Text>
              <Text style={[styles.levelSubtitle, { color: labelColor }]}>5 games available</Text>
              {!unlocked && (
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={14} color="#9CA3AF" />
                  <Text style={{ color: '#9CA3AF', fontWeight: '700', marginLeft: 4 }}>Locked</Text>
                </View>
              )}
              {completed && (
                <View style={styles.completeBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={therapyMeta.color} />
                  <Text style={{ color: therapyMeta.color, fontWeight: '700', marginLeft: 4 }}>Completed</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
  therapyCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  therapyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
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
  levelCard: {
    width: '48%',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  sessionCard: {
    width: '48%',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  cardUnlocked: {
    borderColor: '#E2E8F0',
  },
  cardLocked: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
  },
  levelTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  levelSubtitle: { color: '#475569', marginTop: 4 },
  lockedText: { color: '#9CA3AF' },
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


