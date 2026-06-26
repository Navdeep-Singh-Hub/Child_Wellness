import { StageCardPattern } from '@/components/therapyProgress/StageCardPattern';
import { TP_SHADOW, TP_TYPE } from '@/constants/therapyProgressDesign';
import type { StageTheme } from '@/constants/stageThemes';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Props = {
  theme: StageTheme;
  therapyLabel: string;
  subtitle?: string;
};

export function StageContextBanner({ theme, therapyLabel, subtitle }: Props) {
  return (
    <Animated.View entering={FadeInDown.duration(350)} style={[styles.wrap, TP_SHADOW.card(theme.accent)]}>
      <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <StageCardPattern pattern={theme.pattern} accent="#FFFFFF" width={360} height={96} />
        <View style={styles.row}>
          <View style={styles.iconOrb}>
            <Ionicons name={theme.icon as keyof typeof Ionicons.glyphMap} size={22} color={theme.accent} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.eyebrow}>{therapyLabel}</Text>
            <Text style={styles.title}>{theme.realm}</Text>
            <Text style={styles.subtitle}>{subtitle ?? theme.label}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{theme.badge}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 22, overflow: 'hidden' },
  card: { padding: 16, minHeight: 96, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 1 },
  iconOrb: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  eyebrow: { ...TP_TYPE.micro, color: 'rgba(255,255,255,0.7)' },
  title: { ...TP_TYPE.h2, color: '#FFFFFF', marginTop: 2 },
  subtitle: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginTop: 3 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  badgeText: { ...TP_TYPE.micro, color: '#FFFFFF' },
});
