/**
 * Admin Analytics Dashboard — Improved UI/UX
 * Requires backend ADMIN_AUTH0_IDS to include current user's auth0 id.
 */

import { useAuth } from '@/app/providers/AuthProvider';
import {
  getAdminGamePerformance,
  getAdminInsights,
  getAdminOverview,
  getAdminReports,
  getAdminTherapyProgress,
  getAdminTimeTracking,
  getAdminUserJourney,
  getAdminUsers,
  updateAdminUserProfile,
} from '@/utils/adminApi';
import { getMyProfile } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Constants ────────────────────────────────────────────────────────────────

const RANGES: { key: string; label: string }[] = [
  { key: '7d',  label: '7 days'  },
  { key: '14d', label: '14 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
];

const PALETTE = {
  bg:           '#F7F9FC',
  surface:      '#FFFFFF',
  surfaceAlt:   '#F0F4FF',
  border:       '#E4E9F4',
  borderAccent: '#C7D4F7',
  primary:      '#3B5BDB',
  primaryLight: '#EEF2FF',
  primaryDark:  '#2C44AC',
  green:        '#2F9E44',
  greenLight:   '#EBFBEE',
  amber:        '#E67700',
  amberLight:   '#FFF3BF',
  red:          '#C92A2A',
  redLight:     '#FFF5F5',
  purple:       '#7048E8',
  purpleLight:  '#F3F0FF',
  teal:         '#0C8599',
  tealLight:    '#E3FAFC',
  textPrimary:  '#0F1A3D',
  textSecond:   '#4A5578',
  textMuted:    '#8C95B2',
  white:        '#FFFFFF',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function trendIcon(trend?: string): { name: string; color: string } {
  if (!trend) return { name: 'remove', color: PALETTE.textMuted };
  const t = trend.toLowerCase();
  if (t.includes('improv') || t.includes('up') || t.includes('posit'))
    return { name: 'trending-up', color: PALETTE.green };
  if (t.includes('declin') || t.includes('down') || t.includes('neg'))
    return { name: 'trending-down', color: PALETTE.red };
  return { name: 'remove', color: PALETTE.textMuted };
}

function scoreColor(score: number): string {
  if (score >= 75) return PALETTE.green;
  if (score >= 45) return PALETTE.amber;
  return PALETTE.red;
}

function scoreLabel(score: number): string {
  if (score >= 75) return 'Great';
  if (score >= 45) return 'Fair';
  return 'Low';
}

function initials(name?: string, email?: string): string {
  const src = name || email || '?';
  const parts = src.split(/\s+|@/).filter(Boolean);
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('') || '?';
}

function formatPhone(u: any): string {
  if (!u) return '—';
  const code = u.phoneCountryCode || '';
  const num = u.phoneNumber || '';
  if (num) return [code, num].filter(Boolean).join(' ').trim();
  return u.phone || '—';
}

function ageFromDob(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

function formatAge(age: number | null | undefined): string {
  if (age == null) return '—';
  return `${age} yrs`;
}

function formatGender(gender: string | null | undefined): string {
  if (!gender) return '—';
  const g = String(gender).toLowerCase();
  if (g === 'male') return 'Male';
  if (g === 'female') return 'Female';
  if (g === 'other') return 'Other';
  if (g === 'prefer-not-to-say') return 'Prefer not to say';
  return gender;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated score ring */
function ScoreRing({ score, size = 64, label }: { score: number; size?: number; label: string }) {
  const color = scoreColor(score);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {/* Background ring — CSS trick via border on web; fallback box on native */}
        <View style={{
          width: size, height: size, borderRadius: size / 2,
          borderWidth: 5, borderColor: PALETTE.border,
          position: 'absolute',
        }} />
        {/* Score text */}
        <Text style={{ fontSize: size * 0.26, fontWeight: '800', color }}>{score}</Text>
      </View>
      <Text style={{ fontSize: 11, color: PALETTE.textMuted, fontWeight: '600', textAlign: 'center' }}>{label}</Text>
      <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '50' }]}>
        <Text style={{ fontSize: 10, color, fontWeight: '700' }}>{scoreLabel(score)}</Text>
      </View>
    </View>
  );
}

/** Mini bar for usage / accuracy */
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <View style={styles.miniBarBg}>
      <View style={[styles.miniBarFill, { width: `${pct}%` as any, backgroundColor: color }]} />
    </View>
  );
}

/** Avatar circle */
function Avatar({ name, email, size = 38 }: { name?: string; email?: string; size?: number }) {
  const text = initials(name, email);
  const colors: string[] = [PALETTE.primary, PALETTE.green, PALETTE.purple, PALETTE.teal, PALETTE.amber];
  const color = colors[(text.charCodeAt(0) || 0) % colors.length];
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color + '22', borderColor: color + '55' }]}>
      <Text style={{ fontSize: size * 0.38, fontWeight: '700', color }}>{text}</Text>
    </View>
  );
}

/** Section wrapper with colored left accent */
function Section({
  icon, title, subtitle, accent = PALETTE.primary, children,
}: {
  icon?: any; title: string; subtitle?: string; accent?: string; children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon && (
          <View style={[styles.sectionIconWrap, { backgroundColor: accent + '18' }]}>
            <Ionicons name={icon} size={18} color={accent} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {children}
    </View>
  );
}

/** Divider */
const Divider = () => <View style={styles.divider} />;

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();

  const [range, setRange]               = useState('30d');
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [overview, setOverview]         = useState<any>(null);
  const [time, setTime]                 = useState<any>(null);
  const [games, setGames]               = useState<any>(null);
  const [therapy, setTherapy]           = useState<any>(null);
  const [reports, setReports]           = useState<any>(null);
  const [insights, setInsights]         = useState<any>(null);
  const [users, setUsers]               = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userJourney, setUserJourney]   = useState<any>(null);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [expandedGames, setExpandedGames]   = useState(false);
  const [expandedUsers, setExpandedUsers]   = useState(false);
  const [editProfileUser, setEditProfileUser] = useState<{ id: string; name?: string; dob?: string | null; gender?: string | null; phoneCountryCode?: string; phoneNumber?: string } | null>(null);
  const [editDob, setEditDob] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editPhoneCode, setEditPhoneCode] = useState('+91');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const load = useCallback(async (isRefresh = false) => {
    setError(null);
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [o, t, g, th, r, i, u, myProfile] = await Promise.all([
        getAdminOverview(),
        getAdminTimeTracking({ range }),
        getAdminGamePerformance({ range }),
        getAdminTherapyProgress(),
        getAdminReports({ range }),
        getAdminInsights({ range }),
        getAdminUsers({ limit: '20' }),
        getMyProfile().catch(() => null),
      ]);
      setOverview(o); setTime(t); setGames(g); setTherapy(th);
      setReports(r);  setInsights(i);
      // Merge current user's profile (from Profile API) into list so phone/age/gender show for the logged-in admin
      const list = u?.users ?? [];
      const currentEmail = myProfile?.email;
      const mergedUsers = currentEmail && list.length
        ? list.map((usr: any) => {
            if (usr.email !== currentEmail) return usr;
            const dob = myProfile.dob || usr.dob;
            const age = ageFromDob(dob) ?? usr.age;
            const phone = [myProfile.phoneCountryCode, myProfile.phoneNumber].filter(Boolean).join(' ').trim() || usr.phone;
            return {
              ...usr,
              dob: dob || usr.dob,
              age,
              gender: myProfile.gender || usr.gender,
              phone: phone || usr.phone,
              phoneNumber: myProfile.phoneNumber || usr.phoneNumber,
              phoneCountryCode: myProfile.phoneCountryCode || usr.phoneCountryCode,
            };
          })
        : list;
      setUsers(u ? { ...u, users: mergedUsers } : u);
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    } catch (e: any) {
      setError(e?.message || 'Failed to load analytics. Ensure ADMIN_AUTH0_IDS includes your account.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range, fadeAnim]);

  useEffect(() => { fadeAnim.setValue(0); load(); }, [load]);

  // Refetch when screen gains focus (e.g. after returning from Profile) so user list shows latest dob/phone/gender
  useFocusEffect(
    useCallback(() => {
      if (!loading && overview) load(true);
    }, [load, loading, overview])
  );

  const loadUserJourney = useCallback(async (userId: string) => {
    setSelectedUserId(userId);
    setUserJourney(null);
    setJourneyLoading(true);
    try {
      const j = await getAdminUserJourney(userId);
      setUserJourney(j);
    } catch (e) {
      setUserJourney({ error: (e as Error).message });
    } finally {
      setJourneyLoading(false);
    }
  }, []);

  const openEditProfile = useCallback((user: { id?: string; _id?: string; name?: string; dob?: string | null; gender?: string | null; phoneCountryCode?: string; phoneNumber?: string }) => {
    const id = String(user.id ?? user._id ?? '');
    if (!id) return;
    setEditProfileUser({
      id,
      name: user.name,
      dob: user.dob ?? undefined,
      gender: user.gender ?? undefined,
      phoneCountryCode: user.phoneCountryCode,
      phoneNumber: user.phoneNumber,
    });
    setEditDob(user.dob ?? '');
    setEditGender(user.gender ?? '');
    setEditPhoneCode(user.phoneCountryCode ?? '+91');
    setEditPhoneNumber(user.phoneNumber ?? '');
  }, []);

  const closeEditProfile = useCallback(() => {
    setEditProfileUser(null);
  }, []);

  const saveEditProfile = useCallback(async () => {
    if (!editProfileUser) return;
    setEditSaving(true);
    try {
      await updateAdminUserProfile(editProfileUser.id, {
        dob: editDob.trim() || undefined,
        gender: editGender || undefined,
        phoneCountryCode: editPhoneCode.trim() || undefined,
        phoneNumber: editPhoneNumber.trim() || undefined,
      });
      closeEditProfile();
      await load(true);
      if (selectedUserId === editProfileUser.id) loadUserJourney(editProfileUser.id);
      Alert.alert('Saved', 'Profile updated. List will show new details.');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to save');
    } finally {
      setEditSaving(false);
    }
  }, [editProfileUser, editDob, editGender, editPhoneCode, editPhoneNumber, load, selectedUserId, closeEditProfile, loadUserJourney]);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  if (!session && Platform.OS === 'web') {
    return (
      <View style={[styles.fullCenter, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#EEF2FF', '#F0F4FF']} style={StyleSheet.absoluteFill} />
        <View style={styles.stateCard}>
          <View style={[styles.stateIconWrap, { backgroundColor: PALETTE.primaryLight }]}>
            <Ionicons name="lock-closed" size={32} color={PALETTE.primary} />
          </View>
          <Text style={styles.stateTitle}>Sign in required</Text>
          <Text style={styles.stateDesc}>Please sign in to access the admin dashboard.</Text>
          <Pressable style={styles.btnPrimary} onPress={() => router.back()}>
            <Text style={styles.btnPrimaryText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading && !overview) {
    return (
      <View style={[styles.fullCenter, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#EEF2FF', '#F7F9FC']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={PALETTE.primary} />
        <Text style={styles.loadingTitle}>Loading dashboard</Text>
        <Text style={styles.loadingDesc}>Fetching analytics data…</Text>
      </View>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error && !overview) {
    return (
      <View style={[styles.fullCenter, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#FFF5F5', '#F7F9FC']} style={StyleSheet.absoluteFill} />
        <View style={styles.stateCard}>
          <View style={[styles.stateIconWrap, { backgroundColor: PALETTE.redLight }]}>
            <Ionicons name="alert-circle" size={32} color={PALETTE.red} />
          </View>
          <Text style={styles.stateTitle}>Couldn't load dashboard</Text>
          <Text style={[styles.stateDesc, { color: PALETTE.red }]}>{error}</Text>
          <Pressable style={styles.btnPrimary} onPress={() => load()}>
            <Ionicons name="refresh" size={16} color={PALETTE.white} />
            <Text style={styles.btnPrimaryText}>Try again</Text>
          </Pressable>
          <Pressable style={[styles.btnSecondary, { marginTop: 10 }]} onPress={() => router.back()}>
            <Text style={styles.btnSecondaryText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Derived numbers ────────────────────────────────────────────────────────
  const totalUsers     = overview?.totalUsers ?? 0;
  const dailyActive    = overview?.activeUsers?.daily ?? 0;
  const weeklyActive   = overview?.activeUsers?.weekly ?? 0;
  const monthlyActive  = overview?.activeUsers?.monthly ?? 0;
  const dau_mau        = monthlyActive > 0 ? Math.round((dailyActive / monthlyActive) * 100) : 0;

  const topGame        = time?.byGame?.[0];
  const gameCount      = games?.games?.length ?? 0;
  const avgAccuracy    = games?.games?.length
    ? Math.round(games.games.reduce((s: number, g: any) => s + (g.accuracy ?? 0), 0) / games.games.length)
    : 0;

  // Max plays for bar normalisation
  const maxPlays = reports?.mostPlayedGames?.[0]?.plays ?? 1;
  const maxTime  = time?.byGame?.[0]?.totalDurationMinutes ?? 1;

  // Insight aggregate
  const insightList: any[] = Array.isArray(insights?.insights)
    ? insights.insights
    : insights?.insights ? [insights.insights] : [];

  const visibleGames = expandedGames ? games?.games : games?.games?.slice(0, 6);
  const visibleUsers = expandedUsers ? users?.users : users?.users?.slice(0, 8);

  return (
    <View style={styles.root}>
      <LinearGradient colors={[PALETTE.bg, '#EFF2FB', PALETTE.bg]} style={StyleSheet.absoluteFill} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={PALETTE.primary}
            colors={[PALETTE.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top bar ───────────────────────────────────────────────────── */}
        <View style={styles.topBar}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color={PALETTE.primary} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={styles.titleBlock}>
            <Text style={styles.pageTitle}>Analytics</Text>
            <Text style={styles.pageSubtitle}>Admin dashboard</Text>
          </View>
          <Pressable style={styles.refreshBtn} onPress={() => load(true)} hitSlop={8}>
            <Ionicons name="refresh" size={18} color={PALETTE.primary} />
          </Pressable>
        </View>

        {/* ── Range picker ─────────────────────────────────────────────── */}
        <View style={styles.rangeRow}>
          {RANGES.map(({ key, label }) => (
            <Pressable
              key={key}
              style={[styles.rangeChip, range === key && styles.rangeChipActive]}
              onPress={() => setRange(key)}
            >
              <Text style={[styles.rangeChipText, range === key && styles.rangeChipTextActive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ── KPI Summary bar ──────────────────────────────────────────── */}
          {overview && (
            <View style={styles.kpiStrip}>
              <KPICard
                icon="people"
                label="Total users"
                value={totalUsers}
                accent={PALETTE.primary}
              />
              <View style={styles.kpiDivider} />
              <KPICard
                icon="pulse"
                label="Active today"
                value={dailyActive}
                sub={`${dau_mau}% DAU/MAU`}
                accent={PALETTE.green}
              />
              <View style={styles.kpiDivider} />
              <KPICard
                icon="calendar"
                label="Active (7d)"
                value={weeklyActive}
                accent={PALETTE.purple}
              />
              <View style={styles.kpiDivider} />
              <KPICard
                icon="stats-chart"
                label="Active (30d)"
                value={monthlyActive}
                accent={PALETTE.teal}
              />
            </View>
          )}

          {/* ── At-a-glance highlight row ─────────────────────────────── */}
          {(topGame || avgAccuracy > 0) && (
            <View style={styles.highlightRow}>
              {topGame && (
                <View style={[styles.highlightCard, { backgroundColor: PALETTE.primaryLight, borderColor: PALETTE.borderAccent }]}>
                  <Ionicons name="trophy" size={20} color={PALETTE.primary} />
                  <Text style={[styles.highlightValue, { color: PALETTE.primary }]} numberOfLines={1}>
                    {topGame.gameKey?.replace(/_/g, ' ')}
                  </Text>
                  <Text style={styles.highlightLabel}>Most played game</Text>
                </View>
              )}
              {avgAccuracy > 0 && (
                <View style={[styles.highlightCard, { backgroundColor: PALETTE.greenLight, borderColor: '#A3CFAD' }]}>
                  <Ionicons name="checkmark-circle" size={20} color={PALETTE.green} />
                  <Text style={[styles.highlightValue, { color: PALETTE.green }]}>{avgAccuracy}%</Text>
                  <Text style={styles.highlightLabel}>Avg. game accuracy</Text>
                </View>
              )}
              {gameCount > 0 && (
                <View style={[styles.highlightCard, { backgroundColor: PALETTE.purpleLight, borderColor: '#C8AAEE' }]}>
                  <Ionicons name="game-controller" size={20} color={PALETTE.purple} />
                  <Text style={[styles.highlightValue, { color: PALETTE.purple }]}>{gameCount}</Text>
                  <Text style={styles.highlightLabel}>Games tracked</Text>
                </View>
              )}
            </View>
          )}

          {/* ── Therapy-wise enrolled ─────────────────────────────────── */}
          {overview?.therapyWiseEnrolled && Object.keys(overview.therapyWiseEnrolled).length > 0 && (
            <Section icon="medical" title="Therapy enrollment" accent={PALETTE.teal}>
              <View style={styles.therapyGrid}>
                {Object.entries(overview.therapyWiseEnrolled).map(([k, v]) => (
                  <View key={k} style={styles.therapyChip}>
                    <Text style={styles.therapyChipValue}>{String(v)}</Text>
                    <Text style={styles.therapyChipLabel} numberOfLines={2}>{k}</Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          {/* ── Time tracking ─────────────────────────────────────────── */}
          {time && (
            <Section
              icon="time-outline"
              title="Time tracking"
              subtitle={`Top games & daily activity · ${range}`}
              accent={PALETTE.teal}
            >
              {time.byGame?.length > 0 && (
                <>
                  <Text style={styles.groupLabel}>⏱ Top games by time spent</Text>
                  {time.byGame.slice(0, 8).map((g: any, idx: number) => (
                    <View key={g.gameKey} style={styles.barRow}>
                      <Text style={styles.barRank}>#{idx + 1}</Text>
                      <View style={{ flex: 1 }}>
                        <View style={styles.barRowTop}>
                          <Text style={styles.barLabel} numberOfLines={1}>{g.gameKey?.replace(/_/g, ' ')}</Text>
                          <Text style={styles.barValue}>{g.totalDurationMinutes ?? 0} min</Text>
                        </View>
                        <MiniBar value={g.totalDurationMinutes ?? 0} max={maxTime} color={PALETTE.teal} />
                        <Text style={styles.barMeta}>{g.plays ?? 0} plays</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
              {time.dailyUsage?.length > 0 && (
                <>
                  <Divider />
                  <Text style={styles.groupLabel}>📅 Daily usage (last 7 days)</Text>
                  {time.dailyUsage.slice(-7).map((d: any) => (
                    <View key={d.date} style={styles.dailyRow}>
                      <Text style={styles.dailyDate}>{d.date}</Text>
                      <View style={styles.dailyBadges}>
                        <View style={[styles.pill, { backgroundColor: PALETTE.primaryLight }]}>
                          <Ionicons name="play" size={10} color={PALETTE.primary} />
                          <Text style={[styles.pillText, { color: PALETTE.primary }]}>{d.plays} plays</Text>
                        </View>
                        <View style={[styles.pill, { backgroundColor: PALETTE.greenLight }]}>
                          <Ionicons name="people" size={10} color={PALETTE.green} />
                          <Text style={[styles.pillText, { color: PALETTE.green }]}>{d.uniqueUsers} users</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </Section>
          )}

          {/* ── Game performance ──────────────────────────────────────── */}
          {games?.games?.length > 0 && (
            <Section
              icon="game-controller"
              title="Game performance"
              subtitle={`${gameCount} games · avg accuracy ${avgAccuracy}%`}
              accent={PALETTE.purple}
            >
              {visibleGames?.map((g: any) => (
                <GameCard key={g.gameKey} g={g} />
              ))}
              {games.games.length > 6 && (
                <Pressable style={styles.showMoreBtn} onPress={() => setExpandedGames(e => !e)}>
                  <Text style={styles.showMoreText}>
                    {expandedGames ? 'Show less' : `Show all ${games.games.length} games`}
                  </Text>
                  <Ionicons name={expandedGames ? 'chevron-up' : 'chevron-down'} size={14} color={PALETTE.primary} />
                </Pressable>
              )}
            </Section>
          )}

          {/* ── Reports ───────────────────────────────────────────────── */}
          {reports && (
            <Section icon="document-text" title="Reports" accent={PALETTE.amber}>
              {/* Top performers */}
              {reports.topPerformingUsers?.length > 0 && (
                <>
                  <Text style={styles.groupLabel}>🏅 Top performing users</Text>
                  {reports.topPerformingUsers.slice(0, 8).map((u: any) => (
                    <Pressable
                      key={String(u.userId)}
                      style={styles.userRow}
                      onPress={() => loadUserJourney(String(u.userId))}
                    >
                      <Avatar name={u.name} email={u.email} size={38} />
                      <View style={styles.userRowContent}>
                        <Text style={styles.userName} numberOfLines={1}>{u.name || u.email || u.userId}</Text>
                        <View style={styles.userMetaRow}>
                          <View style={[styles.pill, { backgroundColor: PALETTE.greenLight }]}>
                            <Text style={[styles.pillText, { color: PALETTE.green }]}>{u.accuracy}% acc</Text>
                          </View>
                          <Text style={styles.userMetaText}>{u.gamesPlayed} games</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={PALETTE.textMuted} />
                    </Pressable>
                  ))}
                </>
              )}

              {/* Most played games */}
              {reports.mostPlayedGames?.length > 0 && (
                <>
                  <Divider />
                  <Text style={styles.groupLabel}>🎮 Most played games</Text>
                  {reports.mostPlayedGames.slice(0, 8).map((g: any, idx: number) => (
                    <View key={g.gameKey} style={styles.barRow}>
                      <Text style={styles.barRank}>#{idx + 1}</Text>
                      <View style={{ flex: 1 }}>
                        <View style={styles.barRowTop}>
                          <Text style={styles.barLabel} numberOfLines={1}>{g.gameKey?.replace(/_/g, ' ')}</Text>
                          <Text style={styles.barValue}>{g.plays} plays</Text>
                        </View>
                        <MiniBar value={g.plays} max={maxPlays} color={PALETTE.amber} />
                      </View>
                    </View>
                  ))}
                </>
              )}

              {/* Inactive users */}
              {reports.usersNeedingAttention?.inactiveUsers?.length > 0 && (
                <>
                  <Divider />
                  <Text style={styles.groupLabel}>⚠️ Users needing attention</Text>
                  {reports.usersNeedingAttention.inactiveUsers.slice(0, 5).map((u: any) => (
                    <View key={String(u.userId)} style={styles.attentionRow}>
                      <Avatar name={u.name} email={u.email} size={32} />
                      <Text style={styles.attentionName} numberOfLines={1}>{u.name || u.email || 'Unknown'}</Text>
                      <View style={[styles.pill, { backgroundColor: PALETTE.amberLight }]}>
                        <Text style={[styles.pillText, { color: PALETTE.amber }]}>Inactive</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </Section>
          )}

          {/* ── AI Insights ───────────────────────────────────────────── */}
          {insightList.length > 0 && (
            <Section icon="sparkles" title="AI insights" subtitle="Engagement & effectiveness analysis" accent={PALETTE.purple}>
              {insightList.slice(0, 8).map((ins: any, idx: number) => {
                const engagement   = ins.engagementScore?.score ?? 0;
                const effectiveness = ins.therapyEffectivenessScore?.score ?? 0;
                const trend        = ins.improvementTrend?.trend;
                const ti           = trendIcon(trend);
                return (
                  <View key={ins.userId ?? idx} style={styles.insightCard}>
                    <View style={styles.insightHeader}>
                      <Avatar name={undefined} email={ins.userId} size={34} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.insightUserId} numberOfLines={1}>
                          {ins.userId ? `User ${ins.userId.slice(0, 12)}…` : `Record ${idx + 1}`}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <Ionicons name={ti.name as any} size={14} color={ti.color} />
                          <Text style={[styles.trendText, { color: ti.color }]}>{trend || 'Stable'}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.scoresRow}>
                      <ScoreRing score={engagement}    label="Engagement"    size={72} />
                      <ScoreRing score={effectiveness} label="Effectiveness" size={72} />
                    </View>
                  </View>
                );
              })}
            </Section>
          )}

          {/* ── Users list ────────────────────────────────────────────── */}
          {users?.users?.length > 0 && (
            <Section
              icon="people"
              title="All users"
              subtitle={`${users.pagination?.total ?? 0} total · page ${users.pagination?.page}/${users.pagination?.totalPages}`}
              accent={PALETTE.primary}
            >
              <View style={styles.allUsersHint}>
                <Ionicons name="information-circle-outline" size={16} color={PALETTE.textMuted} />
                <Text style={styles.allUsersHintText}>
                  To show phone, age & gender: tap the <Text style={styles.allUsersHintBold}>pencil</Text> on a user to edit, or have them fill Profile / complete-profile.
                </Text>
              </View>
              {visibleUsers?.map((u: any) => {
                const userId = u.id ?? u._id;
                const phoneStr = formatPhone(u);
                const ageValue = u?.age ?? ageFromDob(u?.dob);
                const ageStr = formatAge(ageValue);
                const genderStr = formatGender(u?.gender);
                return (
                  <Pressable
                    key={String(userId)}
                    style={styles.userRow}
                    onPress={() => loadUserJourney(String(userId))}
                  >
                    <Avatar name={u.name} email={u.email} size={38} />
                    <View style={styles.userRowContent}>
                      <Text style={styles.userName} numberOfLines={1}>{u.name || u.email || '—'}</Text>
                      {(u.email || u.name) && (
                        <Text style={styles.userMetaText} numberOfLines={1}>{u.email || ''}</Text>
                      )}
                      <View style={styles.userMetaRow}>
                        <Text style={styles.userInfoChip} numberOfLines={1}>📞 {phoneStr}</Text>
                        <Text style={styles.userInfoChip} numberOfLines={1}>Age: {ageStr}</Text>
                        <Text style={styles.userInfoChip} numberOfLines={1}>Gender: {genderStr}</Text>
                      </View>
                    </View>
                    <View style={styles.userRowActions}>
                      <Pressable onPress={(e) => { e?.stopPropagation?.(); openEditProfile({ id: userId, ...u }); }} style={styles.editIconBtn} hitSlop={8}>
                        <Ionicons name="pencil" size={16} color={PALETTE.primary} />
                      </Pressable>
                      <Ionicons name="chevron-forward" size={16} color={PALETTE.textMuted} />
                    </View>
                  </Pressable>
                );
              })}
              {users.users.length > 8 && (
                <Pressable style={styles.showMoreBtn} onPress={() => setExpandedUsers(e => !e)}>
                  <Text style={styles.showMoreText}>
                    {expandedUsers ? 'Show less' : `Show all ${users.users.length} users`}
                  </Text>
                  <Ionicons name={expandedUsers ? 'chevron-up' : 'chevron-down'} size={14} color={PALETTE.primary} />
                </Pressable>
              )}
            </Section>
          )}

          {/* ── User journey drill-down ───────────────────────────────── */}
          {selectedUserId && (
            <Section icon="map" title="User journey" subtitle="Tap close to dismiss" accent={PALETTE.teal}>
              {journeyLoading && (
                <View style={styles.journeyLoading}>
                  <ActivityIndicator color={PALETTE.teal} />
                  <Text style={styles.journeyLoadingText}>Loading journey…</Text>
                </View>
              )}
              {userJourney?.error && (
                <Text style={[styles.errorInline, { color: PALETTE.red }]}>{userJourney.error}</Text>
              )}
              {userJourney && !userJourney.error && !journeyLoading && (
                <>
                  {/* User summary */}
                  <View style={styles.journeyUser}>
                    <Avatar name={userJourney.user?.name} email={userJourney.user?.email} size={48} />
                    <View style={{ marginLeft: 14, flex: 1 }}>
                      <Text style={styles.journeyUserName}>{userJourney.user?.name || '—'}</Text>
                      <Text style={styles.journeyUserEmail}>{userJourney.user?.email || '—'}</Text>
                      {(formatPhone(userJourney.user) !== '—' || formatAge(userJourney.user?.age ?? ageFromDob(userJourney.user?.dob)) !== '—' || formatGender(userJourney.user?.gender) !== '—' || userJourney.user?.dob) && (
                        <View style={styles.journeyUserInfo}>
                          {formatPhone(userJourney.user) !== '—' && (
                            <Text style={styles.journeyUserInfoText}>📞 {formatPhone(userJourney.user)}</Text>
                          )}
                          {formatAge(userJourney.user?.age ?? ageFromDob(userJourney.user?.dob)) !== '—' && (
                            <Text style={styles.journeyUserInfoText}>Age: {formatAge(userJourney.user?.age ?? ageFromDob(userJourney.user?.dob))}</Text>
                          )}
                          {formatGender(userJourney.user?.gender) !== '—' && (
                            <Text style={styles.journeyUserInfoText}>Gender: {formatGender(userJourney.user?.gender)}</Text>
                          )}
                          {userJourney.user?.dob && (
                            <Text style={styles.journeyUserInfoText}>DOB: {userJourney.user.dob}</Text>
                          )}
                        </View>
                      )}
                    </View>
                    <Pressable onPress={() => openEditProfile({ id: userJourney.user?.id ?? selectedUserId, ...userJourney.user })} style={styles.editProfileBtn}>
                      <Ionicons name="pencil" size={18} color={PALETTE.primary} />
                      <Text style={styles.editProfileBtnText}>Edit profile</Text>
                    </Pressable>
                  </View>

                  {/* AI insight summary */}
                  {userJourney.aiInsights && (
                    <>
                      <Text style={styles.groupLabel}>✨ AI insights</Text>
                      <View style={styles.scoresRow}>
                        <ScoreRing score={userJourney.aiInsights.engagementScore?.score ?? 0} label="Engagement" size={72} />
                        <ScoreRing score={userJourney.aiInsights.therapyEffectivenessScore?.score ?? 0} label="Effectiveness" size={72} />
                      </View>
                      <View style={styles.trendBadge}>
                        {(() => {
                          const ti = trendIcon(userJourney.aiInsights.improvementTrend?.trend);
                          return (
                            <>
                              <Ionicons name={ti.name as any} size={16} color={ti.color} />
                              <Text style={[styles.trendText, { color: ti.color }]}>
                                {userJourney.aiInsights.improvementTrend?.trend || 'Stable'}
                              </Text>
                            </>
                          );
                        })()}
                      </View>
                    </>
                  )}

                  {/* Therapy progress */}
                  {userJourney.therapyProgress?.length > 0 && (
                    <>
                      <Divider />
                      <Text style={styles.groupLabel}>🧠 Therapy progress</Text>
                      {userJourney.therapyProgress.map((t: any) => (
                        <View key={t.therapy} style={styles.therapyProgressCard}>
                          <Text style={styles.therapyProgressTitle}>{t.therapy}</Text>
                          <View style={styles.therapyProgressStats}>
                            <View style={styles.therapyStatItem}>
                              <Text style={styles.therapyStatValue}>{t.currentLevel}</Text>
                              <Text style={styles.therapyStatLabel}>Level</Text>
                            </View>
                            <View style={styles.therapyStatItem}>
                              <Text style={styles.therapyStatValue}>{t.currentSession}</Text>
                              <Text style={styles.therapyStatLabel}>Session</Text>
                            </View>
                            <View style={styles.therapyStatItem}>
                              <Text style={[styles.therapyStatValue, { color: scoreColor(t.completionPercent ?? 0) }]}>
                                {t.completionPercent ?? 0}%
                              </Text>
                              <Text style={styles.therapyStatLabel}>Done</Text>
                            </View>
                          </View>
                          <MiniBar value={t.completionPercent ?? 0} max={100} color={scoreColor(t.completionPercent ?? 0)} />
                        </View>
                      ))}
                    </>
                  )}
                </>
              )}

              <Pressable
                style={styles.closeJourneyBtn}
                onPress={() => { setSelectedUserId(null); setUserJourney(null); }}
              >
                <Ionicons name="close" size={16} color={PALETTE.teal} />
                <Text style={styles.closeJourneyText}>Close journey</Text>
              </Pressable>
            </Section>
          )}

        </Animated.View>
      </ScrollView>

      {/* Edit profile modal — set phone, DOB, gender for any user */}
      <Modal visible={!!editProfileUser} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={closeEditProfile}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Edit profile</Text>
            {editProfileUser?.name && <Text style={styles.modalSubtitle}>{editProfileUser.name}</Text>}
            <Text style={styles.modalLabel}>Date of birth (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.modalInput}
              value={editDob}
              onChangeText={setEditDob}
              placeholder="e.g. 2020-01-01"
              placeholderTextColor="#94A3B8"
            />
            <Text style={styles.modalLabel}>Gender</Text>
            <View style={styles.modalGenderRow}>
              {['male', 'female', 'other', 'prefer-not-to-say'].map((g) => (
                <Pressable
                  key={g}
                  onPress={() => setEditGender(editGender === g ? '' : g)}
                  style={[styles.modalGenderChip, editGender === g && styles.modalGenderChipActive]}
                >
                  <Text style={[styles.modalGenderChipText, editGender === g && styles.modalGenderChipTextActive]}>
                    {g === 'prefer-not-to-say' ? 'Prefer not to say' : g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.modalLabel}>Phone</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput style={[styles.modalInput, { width: 90 }]} value={editPhoneCode} onChangeText={setEditPhoneCode} placeholder="+91" placeholderTextColor="#94A3B8" />
              <TextInput style={[styles.modalInput, { flex: 1 }]} value={editPhoneNumber} onChangeText={setEditPhoneNumber} placeholder="10-digit number" placeholderTextColor="#94A3B8" keyboardType="phone-pad" />
            </View>
            <View style={styles.modalActions}>
              <Pressable onPress={closeEditProfile} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveEditProfile} disabled={editSaving} style={[styles.modalSaveBtn, editSaving && { opacity: 0.7 }]}>
                <Text style={styles.modalSaveText}>{editSaving ? 'Saving…' : 'Save'}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({ icon, label, value, sub, accent }: { icon: any; label: string; value: number; sub?: string; accent: string }) {
  return (
    <View style={styles.kpiCard}>
      <Ionicons name={icon} size={16} color={accent} style={{ marginBottom: 6 }} />
      <Text style={[styles.kpiValue, { color: accent }]}>{value.toLocaleString()}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
      {sub && <Text style={[styles.kpiSub, { color: accent }]}>{sub}</Text>}
    </View>
  );
}

// ─── Game Card ────────────────────────────────────────────────────────────────

function GameCard({ g }: { g: any }) {
  const acc = g.accuracy ?? 0;
  const accColor = scoreColor(acc);
  return (
    <View style={styles.gameCard}>
      <View style={styles.gameCardHeader}>
        <Text style={styles.gameCardTitle} numberOfLines={1}>{g.gameKey?.replace(/_/g, ' ')}</Text>
        <View style={[styles.pill, { backgroundColor: accColor + '20', borderColor: accColor + '50' }]}>
          <Text style={[styles.pillText, { color: accColor }]}>{acc}% acc</Text>
        </View>
      </View>
      <MiniBar value={acc} max={100} color={accColor} />
      <View style={styles.gameCardStats}>
        <View style={styles.gameStatItem}>
          <Text style={styles.gameStatValue}>{g.attempts}</Text>
          <Text style={styles.gameStatLabel}>Attempts</Text>
        </View>
        <View style={styles.gameStatItem}>
          <Text style={styles.gameStatValue}>{Math.round((g.avgTimeMs || 0) / 1000)}s</Text>
          <Text style={styles.gameStatLabel}>Avg time</Text>
        </View>
        <View style={styles.gameStatItem}>
          <Text style={[styles.gameStatValue, { color: accColor }]}>{scoreLabel(acc)}</Text>
          <Text style={styles.gameStatLabel}>Rating</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 0 },
  fullCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // ── State screens ──────────────────────────────────────────────────────────
  stateCard: {
    backgroundColor: PALETTE.surface,
    borderRadius: 20, padding: 28, margin: 20,
    alignItems: 'center',
    borderWidth: 1, borderColor: PALETTE.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  stateIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  stateTitle: { fontSize: 20, fontWeight: '700', color: PALETTE.textPrimary, marginBottom: 8, textAlign: 'center' },
  stateDesc: { fontSize: 14, color: PALETTE.textSecond, textAlign: 'center', lineHeight: 20, marginBottom: 4 },
  loadingTitle: { fontSize: 17, fontWeight: '700', color: PALETTE.textPrimary, marginTop: 16 },
  loadingDesc: { fontSize: 13, color: PALETTE.textMuted, marginTop: 4 },

  // ── Top bar ────────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 16, gap: 12,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8, borderRadius: 10, backgroundColor: PALETTE.primaryLight },
  backText: { fontSize: 14, fontWeight: '600', color: PALETTE.primary },
  titleBlock: { flex: 1 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: PALETTE.textPrimary, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 12, color: PALETTE.textMuted, marginTop: 1, fontWeight: '500' },
  refreshBtn: { padding: 8, borderRadius: 10, backgroundColor: PALETTE.primaryLight },

  // ── Range picker ───────────────────────────────────────────────────────────
  rangeRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  rangeChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: PALETTE.surface, borderWidth: 1, borderColor: PALETTE.border,
  },
  rangeChipActive: { backgroundColor: PALETTE.primary, borderColor: PALETTE.primary },
  rangeChipText: { fontSize: 13, fontWeight: '600', color: PALETTE.textSecond },
  rangeChipTextActive: { color: PALETTE.white },

  // ── KPI strip ──────────────────────────────────────────────────────────────
  kpiStrip: {
    flexDirection: 'row', backgroundColor: PALETTE.surface,
    borderRadius: 18, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: PALETTE.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  kpiCard: { flex: 1, alignItems: 'center' },
  kpiDivider: { width: 1, backgroundColor: PALETTE.border, marginHorizontal: 4 },
  kpiValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  kpiLabel: { fontSize: 10, color: PALETTE.textMuted, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  kpiSub: { fontSize: 9, fontWeight: '700', marginTop: 2 },

  // ── Highlight row ──────────────────────────────────────────────────────────
  highlightRow: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  highlightCard: {
    flex: 1, minWidth: 100, borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, gap: 4,
  },
  highlightValue: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  highlightLabel: { fontSize: 10, color: PALETTE.textMuted, fontWeight: '600', textAlign: 'center' },

  // ── Section ────────────────────────────────────────────────────────────────
  section: {
    backgroundColor: PALETTE.surface, borderRadius: 18, marginBottom: 16,
    borderWidth: 1, borderColor: PALETTE.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: PALETTE.border,
    gap: 12,
  },
  sectionIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: PALETTE.textPrimary },
  sectionSubtitle: { fontSize: 11, color: PALETTE.textMuted, marginTop: 1, fontWeight: '500' },

  // ── Group label ────────────────────────────────────────────────────────────
  groupLabel: {
    fontSize: 12, fontWeight: '700', color: PALETTE.textSecond,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  // ── Divider ────────────────────────────────────────────────────────────────
  divider: { height: 1, backgroundColor: PALETTE.border, marginTop: 8 },

  // ── Therapy grid ───────────────────────────────────────────────────────────
  therapyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16 },
  therapyChip: {
    minWidth: 80, backgroundColor: PALETTE.tealLight, borderRadius: 12,
    padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#A6E3EA',
  },
  therapyChipValue: { fontSize: 20, fontWeight: '800', color: PALETTE.teal },
  therapyChipLabel: { fontSize: 10, color: PALETTE.teal, fontWeight: '600', marginTop: 2, textAlign: 'center' },

  // ── Bar rows ───────────────────────────────────────────────────────────────
  barRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  barRank: { fontSize: 11, color: PALETTE.textMuted, fontWeight: '700', width: 22, marginTop: 2 },
  barRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barLabel: { fontSize: 13, fontWeight: '600', color: PALETTE.textPrimary, flex: 1 },
  barValue: { fontSize: 12, fontWeight: '700', color: PALETTE.textSecond },
  barMeta: { fontSize: 10, color: PALETTE.textMuted, marginTop: 2 },

  // ── Mini bar ───────────────────────────────────────────────────────────────
  miniBarBg: { height: 6, borderRadius: 3, backgroundColor: PALETTE.border, overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 3 },

  // ── Daily row ──────────────────────────────────────────────────────────────
  dailyRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: PALETTE.border,
  },
  dailyDate: { fontSize: 12, fontWeight: '600', color: PALETTE.textSecond, width: 90 },
  dailyBadges: { flexDirection: 'row', gap: 6 },

  // ── Pills ──────────────────────────────────────────────────────────────────
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
    borderWidth: 1, borderColor: 'transparent',
  },
  pillText: { fontSize: 11, fontWeight: '700' },

  // ── Badge ──────────────────────────────────────────────────────────────────
  badge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, borderWidth: 1,
  },

  // ── User row ───────────────────────────────────────────────────────────────
  userRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: PALETTE.border, gap: 12,
  },
  userRowContent: { flex: 1 },
  userRowActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editIconBtn: { padding: 6 },
  userName: { fontSize: 14, fontWeight: '600', color: PALETTE.textPrimary },
  userMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 3 },
  userMetaText: { fontSize: 11, color: PALETTE.textMuted, fontWeight: '500' },
  userInfoChip: { fontSize: 11, color: PALETTE.textSecond, fontWeight: '500' },
  allUsersHint: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingHorizontal: 4 },
  allUsersHintText: { flex: 1, fontSize: 12, color: PALETTE.textMuted, lineHeight: 18 },
  allUsersHintBold: { fontWeight: '700', color: PALETTE.textSecond },
  editProfileBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingVertical: 6, paddingHorizontal: 10, alignSelf: 'flex-start', backgroundColor: PALETTE.primaryLight + '40', borderRadius: 8 },
  editProfileBtnText: { fontSize: 13, fontWeight: '600', color: PALETTE.primary },

  // ── Attention row ──────────────────────────────────────────────────────────
  attentionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: PALETTE.border,
  },
  attentionName: { flex: 1, fontSize: 13, fontWeight: '600', color: PALETTE.textSecond },

  // ── Avatar ─────────────────────────────────────────────────────────────────
  avatar: { justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },

  // ── Show more ──────────────────────────────────────────────────────────────
  showMoreBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6,
    padding: 14, borderTopWidth: 1, borderTopColor: PALETTE.border,
  },
  showMoreText: { fontSize: 13, fontWeight: '600', color: PALETTE.primary },

  // ── Game card ──────────────────────────────────────────────────────────────
  gameCard: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: PALETTE.surfaceAlt, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: PALETTE.border,
  },
  gameCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  gameCardTitle: { fontSize: 13, fontWeight: '700', color: PALETTE.textPrimary, flex: 1, marginRight: 8 },
  gameCardStats: { flexDirection: 'row', marginTop: 10, gap: 8 },
  gameStatItem: { flex: 1, alignItems: 'center' },
  gameStatValue: { fontSize: 15, fontWeight: '800', color: PALETTE.textPrimary },
  gameStatLabel: { fontSize: 10, color: PALETTE.textMuted, marginTop: 1, fontWeight: '500' },

  // ── Insight card ───────────────────────────────────────────────────────────
  insightCard: {
    marginHorizontal: 16, marginBottom: 14,
    backgroundColor: PALETTE.surfaceAlt, borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: PALETTE.border,
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  insightUserId: { fontSize: 13, fontWeight: '700', color: PALETTE.textPrimary },
  scoresRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  trendText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  trendBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center',
    marginTop: 8, padding: 8, backgroundColor: PALETTE.surfaceAlt,
    borderRadius: 10, borderWidth: 1, borderColor: PALETTE.border,
  },

  // ── Journey ────────────────────────────────────────────────────────────────
  journeyLoading: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20 },
  journeyLoadingText: { fontSize: 13, color: PALETTE.textMuted, fontWeight: '500' },
  errorInline: { padding: 16, fontSize: 13 },
  journeyUser: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 16, marginBottom: 4,
    padding: 14, backgroundColor: PALETTE.surfaceAlt,
    borderRadius: 14, borderWidth: 1, borderColor: PALETTE.border,
  },
  journeyUserName: { fontSize: 16, fontWeight: '700', color: PALETTE.textPrimary },
  journeyUserEmail: { fontSize: 12, color: PALETTE.textMuted, marginTop: 2 },
  journeyUserInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  journeyUserInfoText: { fontSize: 12, color: PALETTE.textSecond, fontWeight: '500' },
  therapyProgressCard: {
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: PALETTE.surfaceAlt, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: PALETTE.border,
  },
  therapyProgressTitle: { fontSize: 13, fontWeight: '700', color: PALETTE.textPrimary, marginBottom: 10 },
  therapyProgressStats: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  therapyStatItem: { flex: 1, alignItems: 'center' },
  therapyStatValue: { fontSize: 18, fontWeight: '800', color: PALETTE.textPrimary },
  therapyStatLabel: { fontSize: 10, color: PALETTE.textMuted, fontWeight: '600', marginTop: 1 },
  closeJourneyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    margin: 16, padding: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: PALETTE.teal,
  },
  closeJourneyText: { fontSize: 13, fontWeight: '700', color: PALETTE.teal },

  // ── Buttons ────────────────────────────────────────────────────────────────
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: PALETTE.primary, paddingVertical: 14, paddingHorizontal: 28,
    borderRadius: 14, marginTop: 20,
  },
  btnPrimaryText: { color: PALETTE.white, fontWeight: '700', fontSize: 15 },
  btnSecondary: {
    paddingVertical: 12, paddingHorizontal: 24, borderRadius: 14,
    borderWidth: 1.5, borderColor: PALETTE.primary,
  },
  btnSecondaryText: { color: PALETTE.primary, fontWeight: '600', fontSize: 14 },

  // ── Edit profile modal ──────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: PALETTE.surface, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400,
    borderWidth: 1, borderColor: PALETTE.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: PALETTE.textPrimary, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: PALETTE.textMuted, marginBottom: 16 },
  modalLabel: { fontSize: 12, fontWeight: '600', color: PALETTE.textSecond, marginTop: 12, marginBottom: 6 },
  modalInput: {
    borderWidth: 1, borderColor: PALETTE.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, color: PALETTE.textPrimary, backgroundColor: PALETTE.surfaceAlt,
  },
  modalGenderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  modalGenderChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: PALETTE.border, backgroundColor: PALETTE.surfaceAlt,
  },
  modalGenderChipActive: { borderColor: PALETTE.primary, backgroundColor: PALETTE.primaryLight + '40' },
  modalGenderChipText: { fontSize: 13, color: PALETTE.textSecond, fontWeight: '500' },
  modalGenderChipTextActive: { color: PALETTE.primary, fontWeight: '600' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 24 },
  modalCancelBtn: { paddingVertical: 10, paddingHorizontal: 20 },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: PALETTE.textMuted },
  modalSaveBtn: { backgroundColor: PALETTE.primary, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 12 },
  modalSaveText: { fontSize: 15, fontWeight: '700', color: PALETTE.white },
});