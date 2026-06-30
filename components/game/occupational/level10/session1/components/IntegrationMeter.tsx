import { SENSORY_SHELL } from '@/components/game/occupational/level10/session1/sensoryExplorerTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  integration: number;
  engagement: number;
  attention: number;
};

export const IntegrationMeter: React.FC<Props> = ({ integration, engagement, attention }) => (
  <View style={styles.wrap}>
    <Text style={styles.title}>INTEGRATION</Text>
    <View style={styles.track}>
      <LinearGradient
        colors={['#22D3EE', '#A78BFA', '#FDE68A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${Math.round(integration * 100)}%` }]}
      />
    </View>
    <View style={styles.row}>
      <MiniStat label="ENGAGE" value={engagement} />
      <MiniStat label="FOCUS" value={attention} />
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
    backgroundColor: 'rgba(5,11,26,0.72)',
    borderWidth: 1,
    borderColor: SENSORY_SHELL.glassBorder,
  },
  title: { color: SENSORY_SHELL.statLabel, fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
  track: {
    height: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  fill: { height: '100%', borderRadius: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  mini: { alignItems: 'center' },
  miniLabel: { color: SENSORY_SHELL.statLabel, fontSize: 8, fontWeight: '800' },
  miniValue: { color: '#fff', fontSize: 12, fontWeight: '900' },
});
