import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';
import { dirLabel, type HorizontalDir } from '@/components/game/occupational/level3/session5/horizontalUtils';

type Props = {
  visible: boolean;
  dir: HorizontalDir | null;
  success?: boolean;
  label?: string;
};

export function HorizontalBadge({ visible, dir, success, label }: Props) {
  if (!visible || (!dir && !label)) return null;
  const text = label ?? (dir ? dirLabel(dir) : '');
  const bg = success === true ? '#DCFCE7' : success === false ? '#FEE2E2' : '#DBEAFE';
  const color = success === true ? '#15803D' : success === false ? '#B91C1C' : '#1D4ED8';

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
  text: { fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
});
