import { CLOUD_SHELL } from '@/components/game/occupational/level10/session2/balloonBreathingTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  regulation: number;
  sync: number;
  steadiness: number;
};

export const RegulationMeter: React.FC<Props> = ({ regulation, sync, steadiness }) => (
  <View style={styles.wrap}>
    <Text style={styles.title}>CALM</Text>
    <View style={styles.track}>
      <LinearGradient
        colors={['#7DD3FC', '#FDA4AF', '#C4B5FD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${Math.round(regulation * 100)}%` }]}
      />
    </View>
    <View style={styles.row}>
      <MiniStat label="SYNC" value={sync} />
      <MiniStat label="STEADY" value={steadiness} />
    </View>
  </View>
);

const MiniStat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <View style={styles.mini}>
    <Text style={styles.miniLabel}>{label}</Text>
    <Text style={styles.miniValue}>{Math.round(value * 100)}%</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    top: 12,
    width: 148,
    padding: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: CLOUD_SHELL.glassBorder,
  },
  title: { color: CLOUD_SHELL.statLabel, fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
  track: {
    height: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(12,74,110,0.08)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  fill: { height: '100%', borderRadius: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  mini: { alignItems: 'center' },
  miniLabel: { color: CLOUD_SHELL.statLabel, fontSize: 8, fontWeight: '800' },
  miniValue: { color: CLOUD_SHELL.statValue, fontSize: 12, fontWeight: '900' },
});
