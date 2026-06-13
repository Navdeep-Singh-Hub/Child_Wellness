import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { HorizontalDir } from '@/components/game/occupational/level3/session5/horizontalUtils';

type Props = { dir: HorizontalDir; accent: string };

export function RoadBendCue({ dir, accent }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.road, { borderColor: accent }]}>
        <Text style={styles.roadEmoji}>{dir === 'left' ? '↖️' : '↗️'}</Text>
      </View>
      <Text style={[styles.label, { color: accent }]}>
        Road bends {dir === 'left' ? 'LEFT' : 'RIGHT'}!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 16, alignSelf: 'center', alignItems: 'center', zIndex: 2 },
  road: {
    width: 120,
    height: 56,
    borderRadius: 12,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadEmoji: { fontSize: 32 },
  label: { fontSize: 14, fontWeight: '900', marginTop: 6 },
});
