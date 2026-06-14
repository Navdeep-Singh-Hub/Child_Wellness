/**
 * BalanceScale — a magic balance beam that tilts with the child's weight-shift
 * offset. Goes level + glows green when balanced at the target.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

type Props = {
  /** Signed offset from target (mirrored shoulder-widths). 0 = level. */
  offset: number;
  level: boolean;
  accent: string;
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export const BalanceScale: React.FC<Props> = ({ offset, level, accent }) => {
  const deg = clamp(offset * 45, -32, 32);
  const beamStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: withTiming(`${deg}deg`, { duration: 120 }) }],
  }));
  const panColor = level ? '#34D399' : accent;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.fulcrum} />
      <Animated.View style={[styles.beam, beamStyle]}>
        <View style={[styles.pan, { borderColor: panColor }]}>
          <Text style={styles.panText}>🔮</Text>
        </View>
        <View style={styles.beamBar} />
        <View style={[styles.pan, { borderColor: panColor }]}>
          <Text style={styles.panText}>🔮</Text>
        </View>
      </Animated.View>
      <Text style={[styles.status, { color: level ? '#34D399' : '#FBCFE8' }]}>
        {level ? 'LEVEL! ⚖️' : 'Shift to balance…'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: '28%', alignSelf: 'center', alignItems: 'center', width: '80%' },
  fulcrum: {
    width: 0,
    height: 0,
    borderLeftWidth: 18,
    borderRightWidth: 18,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(251,191,36,0.9)',
    marginBottom: -2,
    zIndex: 2,
  },
  beam: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  beamBar: { width: 180, height: 10, borderRadius: 5, backgroundColor: '#FBBF24' },
  pan: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(46,16,101,0.5)',
  },
  panText: { fontSize: 30 },
  status: { marginTop: 22, fontSize: 16, fontWeight: '900' },
});
