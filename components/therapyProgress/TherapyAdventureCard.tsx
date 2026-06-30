import { TherapyCardPattern } from '@/components/therapyProgress/TherapyCardPattern';
import {
  TP_LAYOUT,
  TP_SHADOW,
  TP_TYPE,
  type TherapyIdentity,
} from '@/constants/therapyProgressDesign';
import { PRESS_SCALE_AMOUNT, SPRING_CONFIG, THERAPY_STAGGER_MS } from '@/constants/therapyProgressAnimations';
import type { TherapyProgress } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Props = {
  therapy: TherapyIdentity;
  index: number;
  progress: TherapyProgress | undefined;
  onSelect: (therapyId: string) => void;
  saving: boolean;
};

export function TherapyAdventureCard({ therapy, index, progress, onSelect, saving }: Props) {
  const press = useSharedValue(0);
  const currentLevel = progress?.currentLevel ?? 1;
  const currentSession = progress?.currentSession ?? 1;
  const completedSessions =
    progress?.levels?.reduce(
      (sum, lv) => sum + (lv.sessions?.filter((s) => s.completed).length ?? 0),
      0,
    ) ?? 0;
  const progressPct = Math.min(100, (currentLevel - 1) * 10 + currentSession);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * PRESS_SCALE_AMOUNT }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.delay(index * THERAPY_STAGGER_MS).springify().damping(SPRING_CONFIG.damping)}
      style={[styles.outer, TP_SHADOW.card(therapy.accent)]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => { press.value = withSpring(1, SPRING_CONFIG); }}
        onPressOut={() => { press.value = withSpring(0, SPRING_CONFIG); }}
        onPress={() => onSelect(therapy.id)}
        disabled={saving}
        accessibilityRole="button"
        accessibilityLabel={`${therapy.label}. ${therapy.desc}. Level ${currentLevel}, session ${currentSession}.`}
      >
        <Animated.View style={pressStyle}>
          <LinearGradient
            colors={therapy.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <TherapyCardPattern
              pattern={therapy.pattern}
              accent="#FFFFFF"
              width={TP_LAYOUT.screenWidth - 40}
              height={TP_LAYOUT.cardMinHeight}
            />

            <View style={styles.topRow}>
              <View style={styles.realmBadge}>
                <Text style={styles.realmBadgeText}>{therapy.badgeLabel}</Text>
              </View>
              <View style={styles.starBadge}>
                <Ionicons name="star" size={13} color="#FDE68A" />
                <Text style={styles.starText}>{completedSessions}</Text>
              </View>
            </View>

            <View style={styles.body}>
              <View style={styles.iconOrb}>
                <Ionicons name={therapy.icon as keyof typeof Ionicons.glyphMap} size={26} color={therapy.accent} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.realm}>{therapy.realm}</Text>
                <Text style={styles.title}>{therapy.label}</Text>
                <Text style={styles.desc}>{therapy.desc}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>
                    Level {currentLevel} · Session {currentSession}
                  </Text>
                  {therapy.external && (
                    <View style={styles.externalChip}>
                      <Ionicons name="open-outline" size={11} color="#FFFFFF" />
                      <Text style={styles.externalText}>Web</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.chevronOrb}>
                <Ionicons name="arrow-forward" size={20} color={therapy.accent} />
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
            <Text style={styles.tagline}>{therapy.tagline}</Text>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: { width: '100%' },
  card: {
    borderRadius: TP_LAYOUT.cardRadius,
    minHeight: TP_LAYOUT.cardMinHeight,
    padding: 18,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  realmBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  realmBadgeText: { ...TP_TYPE.micro, color: '#FFFFFF' },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  starText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 12,
    zIndex: 1,
  },
  iconOrb: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  realm: { ...TP_TYPE.micro, color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
  title: { ...TP_TYPE.cardTitle, color: '#FFFFFF' },
  desc: { ...TP_TYPE.cardDesc, color: 'rgba(255,255,255,0.88)', marginTop: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  meta: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.95)' },
  externalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  externalText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  chevronOrb: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginTop: 14,
    overflow: 'hidden',
    zIndex: 1,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 3,
  },
  tagline: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.8,
    zIndex: 1,
  },
});
