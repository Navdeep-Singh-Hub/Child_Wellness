import { RO } from './royalObservatoryTokens';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { progress: number };

export function RoyalObservatoryCalibration({ progress }: Props) {
  const pct = Math.round(progress * 100);
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.card}>
        <Text style={styles.icon}>🔭</Text>
        <Text style={styles.title}>Aligning Crown Lens</Text>
        <Text style={styles.sub}>Hold your head tall & still…</Text>
        <View style={styles.track}>
          <LinearGradient
            colors={[RO.accentDeep, RO.accent, RO.accentBright]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fill, { width: `${pct}%` }]}
          />
        </View>
        <Text style={styles.pct}>{pct}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,5,32,0.55)',
  },
  card: {
    width: '78%',
    backgroundColor: RO.glass,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: RO.glassBorder,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  icon: { fontSize: 36 },
  title: { fontSize: 18, fontWeight: '900', color: RO.textLight },
  sub: { fontSize: 14, fontWeight: '600', color: RO.textMuted },
  track: {
    width: '100%',
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
    marginTop: 6,
  },
  fill: { height: '100%', borderRadius: 7 },
  pct: { fontSize: 16, fontWeight: '900', color: RO.accentBright },
});
