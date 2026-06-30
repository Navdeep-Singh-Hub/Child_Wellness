import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { MOON_BRIDGE } from './theme';

export function MoonBridgeBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.sky, { backgroundColor: MOON_BRIDGE.skyTop }]} />
      <View style={[styles.skyMid, { backgroundColor: MOON_BRIDGE.skyMid }]} />
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
        <Circle cx="85%" cy="12%" r="28" fill={MOON_BRIDGE.moon} opacity={0.9} />
        <Circle cx="85%" cy="12%" r="40" fill={MOON_BRIDGE.moonGlow} />
        <Ellipse cx="50%" cy="92%" rx="60%" ry="18%" fill={MOON_BRIDGE.water} opacity={0.7} />
        <Ellipse cx="50%" cy="90%" rx="55%" ry="12%" fill={MOON_BRIDGE.waterLight} opacity={0.4} />
        <Path
          d="M 10% 75% Q 50% 45% 90% 75%"
          stroke={MOON_BRIDGE.bridge}
          strokeWidth={3}
          fill="none"
          opacity={0.35}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  sky: { ...StyleSheet.absoluteFillObject },
  skyMid: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', opacity: 0.6 },
});
