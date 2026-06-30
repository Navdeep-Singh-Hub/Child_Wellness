import { HOME_COLORS, HOME_TYPE } from '@/constants/homeDesign';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  accent?: string;
  variant?: 'default' | 'journey' | 'stats' | 'actions' | 'mood';
};

const VARIANT_ACCENT: Record<NonNullable<Props['variant']>, string> = {
  default: HOME_COLORS.violet,
  journey: HOME_COLORS.tealDeep,
  stats: HOME_COLORS.amberDeep,
  actions: HOME_COLORS.indigo,
  mood: HOME_COLORS.coral,
};

export function HomeSectionHeader({ title, subtitle, icon, accent, variant = 'default' }: Props) {
  const color = accent ?? VARIANT_ACCENT[variant];
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {icon ? (
          <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>
            <Ionicons name={icon} size={18} color={color} />
          </View>
        ) : null}
        <View style={styles.textCol}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <LinearGradient
        colors={[`${color}55`, `${color}00`]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.rule}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, paddingTop: 2 },
  title: { ...HOME_TYPE.h2, color: HOME_COLORS.ink },
  subtitle: { ...HOME_TYPE.caption, color: HOME_COLORS.inkMuted, marginTop: 4 },
  rule: { height: 3, borderRadius: 2, marginTop: 12, width: '42%' },
});
