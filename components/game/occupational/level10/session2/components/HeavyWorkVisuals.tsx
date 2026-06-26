/** Forge break yard backdrop — Heavy Work Break */
import { HEAVY_WORK_THEME } from '@/components/game/occupational/level10/session2/heavyWorkTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const HeavyWorkVisuals: React.FC = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <LinearGradient colors={HEAVY_WORK_THEME.bgGradient} style={StyleSheet.absoluteFill} />
    <View style={styles.forgeGlow} />
    <View style={styles.floorPlate} />
    {HEAVY_WORK_THEME.decor.map((d, i) => (
      <Text
        key={i}
        style={[
          styles.decor,
          { left: `${5 + (i * 12) % 82}%`, top: `${10 + (i % 4) * 17}%`, opacity: 0.12 + (i % 2) * 0.06 },
        ]}
      >
        {d}
      </Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  forgeGlow: {
    position: 'absolute',
    bottom: 60,
    left: '20%',
    right: '20%',
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(249,115,22,0.15)',
  },
  floorPlate: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: 'rgba(68,64,60,0.65)',
    borderTopWidth: 2,
    borderTopColor: 'rgba(251,191,36,0.25)',
  },
  decor: { position: 'absolute', fontSize: 18 },
});
