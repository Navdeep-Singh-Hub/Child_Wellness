import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';
import type { VerticalDir } from '@/components/game/occupational/level3/session4/directionUtils';

type Props = {
  visible: boolean;
  dir: VerticalDir | null;
  label?: string;
  success?: boolean;
};

export function DirectionBadge({ visible, dir, label, success }: Props) {
  if (!visible) return null;
  const text = label ?? (dir === 'up' ? '⬆️ UP' : dir === 'down' ? '⬇️ DOWN' : '…');
  const bg = success === true ? '#DCFCE7' : success === false ? '#FEE2E2' : '#E0F2FE';
  const color = success === true ? '#15803D' : success === false ? '#B91C1C' : '#0369A1';

  return (
    <Animated.View entering={ZoomIn.duration(200)} exiting={FadeOut.duration(160)} style={styles.wrap}>
      <View style={[styles.badge, { backgroundColor: bg, borderColor: color }]}>
        <Text style={[styles.text, { color }]}>{text}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 6 },
  badge: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 18, borderWidth: 2 },
  text: { fontSize: 22, fontWeight: '900' },
});
