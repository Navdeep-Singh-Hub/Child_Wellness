import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';
import type { TempoGrade } from '@/components/game/occupational/level3/session3/tempoUtils';

const LABELS: Record<TempoGrade, string> = {
  perfect: 'PERFECT',
  good: 'GOOD',
  miss: 'MISS',
  early: 'TOO EARLY',
  late: 'TOO LATE',
};

const COLORS: Record<TempoGrade, { bg: string; text: string }> = {
  perfect: { bg: '#FEF3C7', text: '#B45309' },
  good: { bg: '#DBEAFE', text: '#1D4ED8' },
  miss: { bg: '#FEE2E2', text: '#B91C1C' },
  early: { bg: '#FFEDD5', text: '#C2410C' },
  late: { bg: '#F3E8FF', text: '#7E22CE' },
};

type Props = { visible: boolean; grade: TempoGrade | null };

export function TempoBadge({ visible, grade }: Props) {
  if (!visible || !grade) return null;
  const c = COLORS[grade];
  return (
    <Animated.View entering={ZoomIn.duration(200)} exiting={FadeOut.duration(160)} style={styles.wrap}>
      <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.text }]}>
        <Text style={[styles.text, { color: c.text }]}>{LABELS[grade]}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 4 },
  badge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, borderWidth: 2 },
  text: { fontSize: 16, fontWeight: '900', letterSpacing: 1 },
});
