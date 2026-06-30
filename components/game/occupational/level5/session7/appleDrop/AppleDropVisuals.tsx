/**
 * Apple Drop — orchard sky backdrop
 */
import { APPLE_DROP_THEME } from '@/components/game/occupational/level5/session7/appleDrop/appleDropTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function AppleDropBackdrop() {
  const T = APPLE_DROP_THEME;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.ground, { backgroundColor: T.ground }]} />
      <View style={[styles.groundLine, { backgroundColor: T.groundLine }]} />
      {['🌳', '🌲', '🌳'].map((t, i) => (
        <Text key={i} style={[styles.tree, { left: `${12 + i * 32}%` }]}>{t}</Text>
      ))}
      <Text style={styles.cloud}>☁️</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ground: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '22%' },
  groundLine: { position: 'absolute', bottom: '12%', left: 0, right: 0, height: 3 },
  tree: { position: 'absolute', bottom: '18%', fontSize: 28 },
  cloud: { position: 'absolute', top: '14%', right: '18%', fontSize: 26, opacity: 0.7 },
});
