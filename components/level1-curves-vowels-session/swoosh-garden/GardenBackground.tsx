import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse } from 'react-native-svg';
import { GARDEN } from './theme';

export function GardenBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.sky, { backgroundColor: GARDEN.skyTop }]} />
      <View style={[styles.grass, { backgroundColor: GARDEN.grass }]} />
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Circle cx="15%" cy="18%" r="22" fill="#FDE68A" opacity={0.8} />
        <Ellipse cx="20%" cy="78%" rx="8" ry="14" fill={GARDEN.flower} opacity={0.7} />
        <Ellipse cx="78%" cy="82%" rx="10" ry="16" fill="#C084FC" opacity={0.6} />
        <Ellipse cx="55%" cy="88%" rx="7" ry="12" fill="#FB923C" opacity={0.65} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  sky: { flex: 1 },
  grass: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '38%', borderTopLeftRadius: 40, borderTopRightRadius: 40 },
});
