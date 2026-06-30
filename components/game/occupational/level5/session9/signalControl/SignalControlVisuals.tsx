import { SIGNAL_CONTROL_THEME } from '@/components/game/occupational/level5/session9/signalControl/signalControlTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function SignalControlBackdrop() {
  const T = SIGNAL_CONTROL_THEME;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.road} />
      <View style={styles.roadLine} />
      <View style={[styles.signalPole, { top: 14, right: 20 }]} />
      <View style={styles.crosswalk} />
    </View>
  );
}

const styles = StyleSheet.create({
  road: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', backgroundColor: 'rgba(0,0,0,0.3)' },
  roadLine: { position: 'absolute', bottom: '17%', left: '10%', right: '10%', height: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  signalPole: { position: 'absolute', width: 8, height: 50, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 },
  crosswalk: { position: 'absolute', bottom: '32%', left: '30%', right: '30%', height: 20, borderTopWidth: 2, borderBottomWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
});
