import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline } from 'react-native-svg';
import { fetchInsights, type InsightsResponse } from '@/utils/api';
import { useFocusEffect } from '@react-navigation/native';

const RANGE_OPTIONS: Array<'7d' | '30d' | '90d'> = ['7d', '30d', '90d'];

export default function InsightsScreen() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchInsights(range);
      setInsights(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load])
  );

  const series = insights?.dailySeries || [];
  const chartPoints = useMemo(() => {
    if (!series.length) return '';
    const width = 260;
    const height = 120;
    const maxXp = Math.max(...series.map((d) => d.xp), 10);
    return series
      .map((day, idx) => {
        const x = (idx / Math.max(series.length - 1, 1)) * width;
        const y = height - (day.xp / maxXp) * height;
        return `${x},${y}`;
      })
      .join(' ');
  }, [series]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#EEF2FF', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
          <Text style={styles.subtitle}>Track progress, spot trends, and plan next steps.</Text>
        </View>

        <View style={styles.rangeRow}>
          {RANGE_OPTIONS.map((option) => {
            const active = option === range;
            return (
              <Pressable
                key={option}
                onPress={() => setRange(option)}
                style={[styles.rangeChip, active && styles.rangeChipActive]}
              >
                <Text style={[styles.rangeText, active && styles.rangeTextActive]}>{option.toUpperCase()}</Text>
              </Pressable>
            );
          })}
        </View>

        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator color="#2563EB" />
            <Text style={{ marginTop: 8, color: '#475569', fontWeight: '600' }}>Syncing insights…</Text>
          </View>
        )}
        {error && (
          <View style={styles.errorBox}>
            <Text style={{ color: '#DC2626', fontWeight: '700' }}>{error}</Text>
            <Pressable onPress={load} style={styles.retryBtn}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Retry</Text>
            </Pressable>
          </View>
        )}

        {insights && !loading && !error ? (
          <>
            <View style={styles.metricsRow}>
              <MetricCard
                icon="sparkles-outline"
                label="XP Earned"
                value={`${insights.aggregate.totalXp}`}
              />
              <MetricCard
                icon="analytics-outline"
                label="Avg Accuracy"
                value={`${insights.aggregate.avgAccuracy}%`}
              />
              <MetricCard
                icon="timer-outline"
                label="Avg Session"
                value={`${insights.aggregate.avgSessionMinutes}m`}
              />
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>XP trend</Text>
              <Text style={styles.chartCaption}>Per day across the selected window</Text>
              <Svg width={260} height={120} style={{ marginTop: 16 }}>
                <Polyline
                  points={chartPoints}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Strengths</Text>
              {insights.strengths.length ? (
                insights.strengths.map((skill) => (
                  <SkillRow key={skill.id} skill={skill} trendPositive />
                ))
              ) : (
                <Text style={styles.emptyText}>Play more to surface dominant skills.</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Focus areas</Text>
              {insights.focus.length ? (
                insights.focus.map((skill) => (
                  <SkillRow key={skill.id} skill={skill} />
                ))
              ) : (
                <Text style={styles.emptyText}>No focus flags right now.</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Modes breakdown</Text>
              <View style={{ gap: 10 }}>
                {Object.entries(insights.modesBreakdown || {}).map(([mode, count]) => (
                  <View key={mode} style={styles.modeRow}>
                    <Text style={styles.modeLabel}>{mode}</Text>
                    <Text style={styles.modeValue}>{count}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Session feedback</Text>
              {insights.feedback.averageMood ? (
                <Text style={styles.feedbackMood}>Average mood: {insights.feedback.averageMood}/5</Text>
              ) : (
                <Text style={styles.emptyText}>Share reflections after games to unlock trends.</Text>
              )}
              {insights.feedback.recentNotes.length ? (
                <View style={{ marginTop: 12, gap: 8 }}>
                  {insights.feedback.recentNotes.map((note, idx) => (
                    <View key={`${note.at}-${idx}`} style={styles.noteCard}>
                      <Text style={styles.noteText}>{note.text}</Text>
                      <Text style={styles.noteMeta}>
                        {new Date(note.at).toLocaleDateString()} {note.observer ? `· ${note.observer}` : ''}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Ionicons name={icon} size={20} color="#2563EB" />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function SkillRow({ skill, trendPositive }: { skill: any; trendPositive?: boolean }) {
  const trend = skill.trend ?? 0;
  const trendLabel =
    trend > 0 ? `▲ ${trend}%` : trend < 0 ? `▼ ${Math.abs(trend)}%` : 'steady';
  const trendColor = trend > 0 ? '#16A34A' : trend < 0 ? '#DC2626' : '#475569';
  return (
    <View style={styles.skillRow}>
      <Text style={styles.skillIcon}>{skill.icon || '⭐'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.skillTitle}>{skill.title}</Text>
        <Text style={styles.skillMeta}>Level {skill.level} · {skill.accuracy ?? 0}%</Text>
      </View>
      <Text style={[styles.skillTrend, { color: trendColor }]}>{trendLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    gap: 18,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rangeChip: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5F5',
    paddingVertical: 10,
    alignItems: 'center',
  },
  rangeChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  rangeText: {
    fontWeight: '700',
    color: '#475569',
  },
  rangeTextActive: {
    color: '#FFFFFF',
  },
  loading: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  errorBox: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    gap: 12,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  metricLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  chartCard: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  chartCaption: {
    color: '#475569',
    fontSize: 13,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  skillIcon: {
    fontSize: 26,
  },
  skillTitle: {
    fontWeight: '800',
    color: '#0F172A',
  },
  skillMeta: {
    color: '#475569',
    fontSize: 12,
  },
  skillTrend: {
    fontWeight: '800',
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modeLabel: {
    fontWeight: '700',
    color: '#334155',
  },
  modeValue: {
    fontWeight: '800',
    color: '#0F172A',
  },
  feedbackMood: {
    fontWeight: '700',
    color: '#111827',
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noteText: {
    color: '#0F172A',
    fontWeight: '600',
  },
  noteMeta: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
});

