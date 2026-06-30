/**
 * Matcher Section — ocean-themed session picker (sessions 1–10).
 */
import { isUnlocked, useSpecialEducationProgress } from '@/components/special-education/shared/SpecialEducationProgress';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MATCHER_CURRICULUM } from './matcherCurriculum';
import { MATCHER_HUB_THEME as H, MATCHER_SESSION } from './matcherSessionTheme';
import { OceanReefBackground } from './OceanReefBackground';

const SECTION = 2;

function letterPreview(letters: string[]): string {
  if (letters.length <= 4) return letters.join('  ');
  return `${letters.slice(0, 3).join(' ')} …`;
}

export function MatcherSessionSelector({
  onBack,
  onSelectSession,
  onShowMap,
}: {
  onBack: () => void;
  onSelectSession: (session: number) => void;
  onShowMap: () => void;
}) {
  const { progress } = useSpecialEducationProgress();
  const sectionData = progress?.sections.find((s) => s.sectionNumber === SECTION);
  const completedCount = sectionData?.sessions?.filter((s) => s.completed).length ?? 0;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...H.gradient]}
        locations={[...H.gradientLocations]}
        style={StyleSheet.absoluteFill}
      />
      <OceanReefBackground />

      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <Pressable onPress={onBack} style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={22} color={H.accentDeep} />
          </Pressable>
          <View style={styles.topCenter}>
            <Text style={styles.topTitle}>Matcher</Text>
            <Text style={styles.topSub}>Small Letters · 10 voyages</Text>
          </View>
          <Pressable onPress={onShowMap} style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
            <Ionicons name="map" size={22} color={H.accentDeep} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>🌊</Text>
            <Text style={styles.heroTitle}>{H.name}</Text>
            <Text style={styles.heroDesc}>
              Each voyage has 5 letter quests — trace, copy, and photograph your writing.
            </Text>
            <View style={styles.heroProgress}>
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${Math.round((completedCount / 10) * 100)}%` }]}
                />
              </View>
              <Text style={styles.progressLabel}>{completedCount}/10 voyages charted</Text>
            </View>
          </View>

          {MATCHER_CURRICULUM.map((session) => {
            const sessionData = sectionData?.sessions?.find((s) => s.sessionNumber === session.number);
            const unlocked = isUnlocked(progress, SECTION, session.number, 1) || session.number === 1;
            const completed = sessionData?.completed || false;
            const isMaster = session.number === 10;

            return (
              <Pressable
                key={session.number}
                onPress={() => unlocked && onSelectSession(session.number)}
                disabled={!unlocked}
                style={({ pressed }) => [
                  styles.sessionCard,
                  !unlocked && styles.sessionLocked,
                  completed && styles.sessionDone,
                  isMaster && styles.sessionMaster,
                  pressed && unlocked && styles.pressed,
                ]}
              >
                <View style={styles.sessionLeft}>
                  <View style={[styles.sessionBadge, completed && styles.sessionBadgeDone]}>
                    <Text style={styles.sessionEmoji}>{session.emoji}</Text>
                    {completed ? (
                      <View style={styles.checkDot}>
                        <Ionicons name="checkmark" size={10} color="#fff" />
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.sessionNum}>
                    <Text style={styles.sessionNumText}>{session.number}</Text>
                  </View>
                </View>

                <View style={styles.sessionBody}>
                  <Text style={styles.sessionZone}>{session.zone}</Text>
                  <Text style={styles.sessionTitle}>
                    {session.title}
                    {session.subtitle ? ` (${session.subtitle})` : ''}
                  </Text>
                  <Text style={styles.sessionLetters}>{letterPreview(session.letters)}</Text>
                </View>

                {unlocked ? (
                  <Ionicons name="chevron-forward" size={20} color={H.inkMuted} />
                ) : (
                  <Ionicons name="lock-closed" size={18} color="#94A3B8" />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'web' ? 8 : 4,
    paddingBottom: 8,
    zIndex: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: MATCHER_SESSION.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: H.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...MATCHER_SESSION.shadow.soft,
  },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle: { fontSize: 18, fontWeight: '900', color: H.ink },
  topSub: { fontSize: 12, fontWeight: '600', color: H.inkMuted, marginTop: 2 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  hero: {
    alignItems: 'center',
    backgroundColor: H.card,
    borderRadius: MATCHER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: H.cardBorder,
    padding: 18,
    gap: 8,
    marginBottom: 4,
    ...MATCHER_SESSION.shadow.card,
  },
  heroEmoji: { fontSize: 40 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: H.ink, textAlign: 'center' },
  heroDesc: { fontSize: 14, fontWeight: '600', color: H.inkMuted, textAlign: 'center', lineHeight: 20 },
  heroProgress: { width: '100%', gap: 6, marginTop: 6 },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(186, 230, 253, 0.6)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: H.accent, borderRadius: 999 },
  progressLabel: { fontSize: 12, fontWeight: '700', color: H.inkMuted, textAlign: 'center' },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: H.card,
    borderRadius: MATCHER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: H.cardBorder,
    padding: 14,
    ...MATCHER_SESSION.shadow.soft,
  },
  sessionLocked: { opacity: 0.55 },
  sessionDone: { borderColor: '#10B981', borderWidth: 2 },
  sessionMaster: { borderColor: '#FBBF24', borderWidth: 2 },
  sessionLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sessionBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(186, 230, 253, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionBadgeDone: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  sessionEmoji: { fontSize: 22 },
  checkDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  sessionNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: H.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionNumText: { fontSize: 13, fontWeight: '900', color: '#fff' },
  sessionBody: { flex: 1, gap: 2 },
  sessionZone: {
    fontSize: 10,
    fontWeight: '800',
    color: H.accent,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sessionTitle: { fontSize: 15, fontWeight: '800', color: H.ink },
  sessionLetters: { fontSize: 13, fontWeight: '600', color: H.inkMuted },
});
