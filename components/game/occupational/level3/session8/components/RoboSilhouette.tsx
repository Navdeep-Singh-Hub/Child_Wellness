import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  emoji?: string;
};

export function RoboSilhouette({ visible, emoji = '🤖' }: Props) {
  if (!visible) return null;
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.shadow}>🧍</Text>
      <Text style={styles.robot}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', alignSelf: 'center', top: '24%', alignItems: 'center' },
  shadow: { fontSize: 110, opacity: 0.22 },
  robot: { position: 'absolute', top: 8, fontSize: 42, opacity: 0.75 },
});
