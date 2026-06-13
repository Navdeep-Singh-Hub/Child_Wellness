import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';

type Props = {
  visible: boolean;
  label: string;
  success?: boolean;
};

export function SwingGuideBadge({ visible, label, success }: Props) {
  if (!visible) return null;
  const bg = success === true ? '#DCFCE7' : success === false ? '#FEE2E2' : '#D1FAE5';
  const color = success === true ? '#15803D' : success === false ? '#B91C1C' : '#047857';

  return (
    <Animated.View entering={ZoomIn.duration(200)} exiting={FadeOut.duration(160)} style={styles.wrap}>
      <View style={[styles.badge, { backgroundColor: bg, borderColor: color }]}>
        <Text style={[styles.text, { color }]}>{label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 6 },
  badge: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 18, borderWidth: 2 },
  text: { fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
});
