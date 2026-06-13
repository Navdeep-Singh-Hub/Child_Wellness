import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  side?: 'left' | 'right' | null;
};

export function LateralityHint({ visible, side }: Props) {
  if (!visible) return null;
  return (
    <View style={styles.wrap}>
      <Text style={styles.left}>⬅️ LEFT</Text>
      <Text style={styles.mid}>{side ? (side === 'left' ? '👈' : '👉') : '🤖'}</Text>
      <Text style={styles.right}>RIGHT ➡️</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 8,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  left: { fontSize: 12, fontWeight: '800', color: '#2563EB' },
  mid: { fontSize: 22 },
  right: { fontSize: 12, fontWeight: '800', color: '#DC2626' },
});
