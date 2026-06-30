import { SPLIT_SECOND_THEME } from '@/components/game/occupational/level5/session9/splitSecond/splitSecondTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function SplitSecondBackdrop() {
  const T = SPLIT_SECOND_THEME;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.lane, { left: '25%', borderColor: `${T.accent}44` }]} />
      <View style={[styles.lane, { right: '25%', borderColor: `${T.accent}33` }]} />
      <View style={[styles.splitLine, { backgroundColor: T.accent }]} />
      <View style={styles.timerZone} />
    </View>
  );
}

const styles = StyleSheet.create({
  lane: { position: 'absolute', top: '20%', bottom: '20%', width: 2, borderStyle: 'dashed', borderWidth: 1 },
  splitLine: { position: 'absolute', top: '48%', left: '48%', width: 4, height: '8%', borderRadius: 2, opacity: 0.5 },
  timerZone: { position: 'absolute', top: 8, left: 16, right: 16, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)' },
});
