import { TF } from './thunderForgeTokens';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { progress: number };

export function ThunderForgeCalibration({ progress }: Props) {
  const pct = Math.round(progress * 100);
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.card}>
        <Text style={styles.icon}>⚙️</Text>
        <Text style={styles.title}>Reactor Boot</Text>
        <Text style={styles.sub}>Hold tall & still…</Text>
        <View style={styles.track}>
          <LinearGradient
            colors={[TF.molten, TF.accent, TF.accentGlow]}
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
    backgroundColor: 'rgba(12,10,9,0.55)',
  },
  card: {
    width: '78%',
    backgroundColor: TF.glass,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: TF.glassBorder,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  icon: { fontSize: 36 },
  title: { fontSize: 18, fontWeight: '900', color: TF.textLight },
  sub: { fontSize: 14, fontWeight: '600', color: TF.textMuted },
  track: {
    width: '100%',
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
    marginTop: 6,
  },
  fill: { height: '100%', borderRadius: 7 },
  pct: { fontSize: 16, fontWeight: '900', color: TF.accentBright },
});
