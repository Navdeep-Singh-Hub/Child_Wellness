import { SYNESTHESIA_LAB_THEME } from '@/components/game/occupational/level5/session9/synesthesiaLab/synesthesiaLabTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function SynesthesiaLabBackdrop() {
  const T = SYNESTHESIA_LAB_THEME;
  const wave = useSharedValue(0);
  useEffect(() => {
    wave.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [wave]);
  const waveStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: 0.8 + wave.value * 0.4 }] }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <Animated.View style={[styles.wave, { top: '30%', backgroundColor: `${T.accent}33` }, waveStyle]} />
      <View style={[styles.wave, { top: '55%', backgroundColor: `${T.accent}22`, height: 3 }]} />
      <View style={styles.eqPanel}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} style={[styles.eqBar, { height: 10 + (i % 3) * 8, backgroundColor: T.accent }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wave: { position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 2 },
  eqPanel: { position: 'absolute', top: 12, left: 16, flexDirection: 'row', gap: 4, padding: 8, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.2)' },
  eqBar: { width: 6, borderRadius: 3, opacity: 0.7 },
});
