import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';
import type { ScaleTarget } from '@/components/game/occupational/level3/session2/scaleUtils';

type Props = {
  visible: boolean;
  target: ScaleTarget | 'wide' | 'narrow' | null;
  success?: boolean;
};

export function ScaleCueBadge({ visible, target, success }: Props) {
  if (!visible || !target) return null;

  const label =
    target === 'big'
      ? 'BIG'
      : target === 'small'
        ? 'SMALL'
        : target === 'wide'
          ? 'WIDE'
          : 'NARROW';

  const bg =
    success === true
      ? '#FEF3C7'
      : success === false
        ? '#FEE2E2'
        : target === 'big' || target === 'wide'
          ? '#DBEAFE'
          : '#FCE7F3';

  const color =
    success === true
      ? '#B45309'
      : success === false
        ? '#B91C1C'
        : target === 'big' || target === 'wide'
          ? '#1D4ED8'
          : '#BE185D';

  return (
    <Animated.View entering={ZoomIn.duration(220)} exiting={FadeOut.duration(180)} style={styles.wrap}>
      <View style={[styles.badge, { backgroundColor: bg, borderColor: color }]}>
        <Text style={[styles.text, { color }]}>{label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 6 },
  badge: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  text: { fontSize: 32, fontWeight: '900', letterSpacing: 2 },
});
