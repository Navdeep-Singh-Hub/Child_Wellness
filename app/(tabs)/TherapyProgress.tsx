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
import {
  advanceTherapyProgress,
  fetchTherapyProgress,
  initTherapyProgress,
  type TherapyProgress,
} from '@/utils/api';

const THERAPIES = [
  { id: 'speech', label: 'Speech Therapy', color: '#2563EB', icon: 'mic' },
  { id: 'occupational', label: 'Occupational Therapy', color: '#10B981', icon: 'hand-left' },
  { id: 'behavioral', label: 'Behavioral Therapy', color: '#F59E0B', icon: 'sparkles' },
  { id: 'special-education', label: 'Special Education', color: '#8B5CF6', icon: 'school' },
  { id: 'daily-activities', label: 'Daily Activities', color: '#EC4899', icon: 'sunny' },
  { id: 'therapy-avatar', label: 'Therapy Avatar', color: '#0EA5E9', icon: 'happy' },
];

export default function TherapyProgressScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [therapies, setTherapies] = useState<TherapyProgress[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchTherapyProgress();
      setTherapies(res.therapies || []);
    } catch (e: any) {
      console.error('Failed to load therapy progress', e);
      Alert.alert('Error', e?.message || 'Could not load progress');
    } finally {
      setLoading(false);
    }
  };

  const ensureInitialized = async () => {
    setSaving(true);
    try {
      const res = await initTherapyProgress();
      setTherapies(res.therapies || []);
    } catch (e: any) {
      console.error('Init failed', e);
      Alert.alert('Error', e?.message || 'Could not initialize');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const data = useMemo(() => {
    const map = new Map(therapies.map((t) => [t.therapy, t]));
    return THERAPIES.map((t) => ({ meta: t, progress: map.get(t.id) }));
  }, [therapies]);

  const onCompleteCurrent = async (therapyId: string, progress?: TherapyProgress) => {
    if (!progress) return;
    setSaving(true);
    try {
      const res = await advanceTherapyProgress({
        therapy: therapyId,
        levelNumber: progress.currentLevel,
        sessionNumber: progress.currentSession,
        markCompleted: true,
      });
      setTherapies((prev) =>
        prev.map((t) => (t.therapy === therapyId ? res.therapy : t)),
      );
    } catch (e: any) {
      console.error('Advance failed', e);
      Alert.alert('Error', e?.message || 'Could not update progress');
    } finally {
      setSaving(false);
    }
  };

  const hasData = therapies && therapies.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Therapy Progress</Text>
          <Text style={styles.subtitle}>
            Track levels and sessions across all therapies. Each therapy has 10 levels, each level has 10 sessions, each session has 5 games.
          </Text>
          <TouchableOpacity
            style={[styles.initButton, { opacity: saving ? 0.7 : 1 }]}
            onPress={ensureInitialized}
            disabled={saving}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.initButtonText}>Initialize Progress</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          data.map(({ meta, progress }) => {
            const currentLevel = progress?.currentLevel ?? 1;
            const currentSession = progress?.currentSession ?? 1;
            return (
              <View key={meta.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBadge, { backgroundColor: `${meta.color}20` }]}>
                    <Ionicons name={meta.icon as any} size={22} color={meta.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{meta.label}</Text>
                    <Text style={styles.cardMeta}>Level {currentLevel} · Session {currentSession}</Text>
                  </View>
                  {saving ? <ActivityIndicator size="small" color={meta.color} /> : null}
                </View>
                <Text style={styles.cardBody}>
                  Advance by completing the current session (placeholder action). We’ll hook this to the real games later.
                </Text>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: meta.color, opacity: saving ? 0.7 : 1 }]}
                  onPress={() => onCompleteCurrent(meta.id, progress)}
                  disabled={saving || !hasData}
                >
                  <Text style={styles.primaryButtonText}>Mark Current Session Complete</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#0F172A' },
  subtitle: { marginTop: 6, color: '#475569', lineHeight: 20 },
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  cardMeta: { color: '#475569', fontWeight: '600', marginTop: 2 },
  cardBody: { color: '#475569', marginBottom: 12 },
  primaryButton: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonText: { color: '#fff', fontWeight: '800' },
});


