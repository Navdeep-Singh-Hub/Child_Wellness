import { getHeaderCopy, TP_COLORS, TP_TYPE, type ViewMode } from '@/constants/therapyProgressDesign';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Props = {
  mode: ViewMode;
  showBack: boolean;
  onBack: () => void;
};

export function TherapyProgressHeader({ mode, showBack, onBack }: Props) {
  const { title, subtitle } = getHeaderCopy(mode);

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.wrap}>
      {showBack && (
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={18} color={TP_COLORS.inkSoft} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      )}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {mode === 'levels' && (
          <View style={[styles.modeBadge, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="trophy" size={16} color="#D97706" />
          </View>
        )}
        {mode === 'sessions' && (
          <View style={[styles.modeBadge, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="play-circle" size={16} color="#2563EB" />
          </View>
        )}
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {mode === 'therapies' && (
        <View style={styles.legend}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>Five unique therapy worlds · tap to enter</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: TP_COLORS.glass,
    borderWidth: 1,
    borderColor: TP_COLORS.glassBorder,
  },
  backText: { color: TP_COLORS.inkSoft, fontWeight: '800', fontSize: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { ...TP_TYPE.display, color: TP_COLORS.ink },
  modeBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: { marginTop: 8, ...TP_TYPE.body, color: TP_COLORS.inkMuted, maxWidth: 340 },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: TP_COLORS.glassBorder,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
  },
  legendText: { ...TP_TYPE.caption, color: TP_COLORS.inkSoft },
});
