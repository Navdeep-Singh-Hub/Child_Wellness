import { StageCardPattern } from '@/components/therapyProgress/StageCardPattern';
import { TP_LAYOUT, TP_SHADOW, TP_TYPE } from '@/constants/therapyProgressDesign';
import type { StageTheme } from '@/constants/stageThemes';
import { PRESS_SCALE_AMOUNT, SPRING_CONFIG } from '@/constants/therapyProgressAnimations';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Props = {
  theme: StageTheme;
  index?: number;
  locked?: boolean;
  completed?: boolean;
  isCurrent?: boolean;
  actionLabel?: string;
  meta?: string;
  emoji?: string;
  onPress: () => void;
  disabled?: boolean;
};

export function TherapyStageCard({
  theme,
  locked = false,
  completed = false,
  isCurrent = false,
  actionLabel = 'Play',
  meta,
  emoji,
  onPress,
  disabled = false,
}: Props) {
  const press = useSharedValue(0);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * PRESS_SCALE_AMOUNT }],
  }));

  if (locked) {
    return (
      <View style={[styles.outer, styles.lockedOuter]}>
        <View style={styles.lockedCard}>
          <View style={styles.lockedBadge}>
            <Text style={styles.lockedBadgeText}>{theme.badge}</Text>
          </View>
          <Ionicons name="lock-closed" size={20} color="#94A3B8" />
          <Text style={styles.lockedTitle}>{theme.label}</Text>
          <Text style={styles.lockedRealm}>{theme.realm}</Text>
          <Text style={styles.lockedLabel}>Locked</Text>
        </View>
      </View>
    );
  }

  if (completed) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} disabled={disabled} style={styles.outer}>
        <View style={[styles.completedCard, { borderColor: theme.accent }]}>
          <View style={[styles.badge, { backgroundColor: `${theme.accent}22` }]}>
            <Text style={[styles.badgeText, { color: theme.accent }]}>{theme.badge}</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.iconOrb, { backgroundColor: `${theme.accent}18` }]}>
              <Ionicons name="checkmark-circle" size={24} color={theme.accent} />
            </View>
            <View style={styles.copy}>
              <Text style={[styles.realm, { color: theme.accent }]}>{theme.realm}</Text>
              <Text style={[styles.title, { color: theme.gradient[0] }]}>{theme.label}</Text>
              {meta && <Text style={styles.meta}>{meta}</Text>}
            </View>
            <View style={[styles.actionChip, { backgroundColor: `${theme.accent}18` }]}>
              <Text style={[styles.actionText, { color: theme.accent }]}>Again</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.outer, TP_SHADOW.card(theme.accent)]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => { press.value = withSpring(1, SPRING_CONFIG); }}
        onPressOut={() => { press.value = withSpring(0, SPRING_CONFIG); }}
        onPress={onPress}
        disabled={disabled}
      >
        <Animated.View style={pressStyle}>
          <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
            <StageCardPattern pattern={theme.pattern} accent="#FFFFFF" width={TP_LAYOUT.screenWidth - 40} height={112} />
            <View style={styles.topRow}>
              <View style={styles.badgeGlass}>
                <Text style={styles.badgeGlassText}>{theme.badge}</Text>
              </View>
              {isCurrent && (
                <View style={styles.nowPill}>
                  <Text style={styles.nowText}>NOW</Text>
                </View>
              )}
            </View>
            <View style={styles.row}>
              <View style={styles.iconOrbWhite}>
                {emoji ? (
                  <Text style={styles.emoji}>{emoji}</Text>
                ) : (
                  <Ionicons name={theme.icon as keyof typeof Ionicons.glyphMap} size={22} color={theme.accent} />
                )}
              </View>
              <View style={styles.copy}>
                <Text style={styles.realmWhite}>{theme.realm}</Text>
                <Text style={styles.titleWhite}>{theme.label}</Text>
                {meta && <Text style={styles.metaWhite}>{meta}</Text>}
              </View>
              <View style={styles.actionOrb}>
                <Text style={[styles.actionOrbText, { color: theme.accent }]}>{actionLabel}</Text>
                <Ionicons name="arrow-forward" size={14} color={theme.accent} />
              </View>
            </View>
            <Text style={styles.tagline}>{theme.tagline}</Text>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { width: '100%' },
  lockedOuter: { opacity: 0.85 },
  card: {
    borderRadius: TP_LAYOUT.cardRadiusSm,
    minHeight: 112,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', zIndex: 1 },
  badgeGlass: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  badgeGlassText: { ...TP_TYPE.micro, color: '#FFFFFF' },
  nowPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  nowText: { fontSize: 9, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, zIndex: 1 },
  iconOrbWhite: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  realmWhite: { ...TP_TYPE.micro, color: 'rgba(255,255,255,0.72)' },
  titleWhite: { fontSize: 16, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.3 },
  metaWhite: { marginTop: 3, fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  actionOrb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  actionOrbText: { fontSize: 12, fontWeight: '900' },
  tagline: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.62)',
    letterSpacing: 0.6,
    zIndex: 1,
  },
  lockedCard: {
    borderRadius: TP_LAYOUT.cardRadiusSm,
    padding: 18,
    minHeight: 112,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(148,163,184,0.15)',
  },
  lockedBadgeText: { fontSize: 10, fontWeight: '900', color: '#94A3B8' },
  lockedTitle: { fontSize: 15, fontWeight: '900', color: '#94A3B8', marginTop: 8 },
  lockedRealm: { fontSize: 12, fontWeight: '600', color: '#CBD5E1', marginTop: 2 },
  lockedLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginTop: 8 },
  completedCard: {
    borderRadius: TP_LAYOUT.cardRadiusSm,
    padding: 16,
    minHeight: 112,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
  realm: { ...TP_TYPE.micro },
  title: { fontSize: 16, fontWeight: '900' },
  meta: { marginTop: 3, fontSize: 12, fontWeight: '600', color: '#64748B' },
  actionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionText: { fontSize: 12, fontWeight: '900' },
  emoji: { fontSize: 24 },
});
