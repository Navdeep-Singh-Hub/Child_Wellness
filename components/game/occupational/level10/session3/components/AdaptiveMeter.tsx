import { SHIFT_SHELL } from '@/components/game/occupational/level10/session3/changeThePlanTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  adaptation: number;
  focus: number;
  flow: number;
};

export const AdaptiveMeter: React.FC<Props> = ({ adaptation, focus, flow }) => (
  <View style={styles.wrap}>
    <Text style={styles.title}>ADAPT</Text>
    <View style={styles.track}>
      <LinearGradient
        colors={['#2DD4BF', '#FB7185', '#FDE68A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${Math.round(adaptation * 100)}%` }]}
      />
    </View>
    <View style={styles.row}>
      <MiniStat label="FOCUS" value={focus} />
      <MiniStat label="FLOW" value={flow} />
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
    backgroundColor: 'rgba(15,23,42,0.78)',
    borderWidth: 1,
    borderColor: SHIFT_SHELL.glassBorder,
  },
  title: { color: SHIFT_SHELL.statLabel, fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
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
  miniLabel: { color: SHIFT_SHELL.accent, fontSize: 8, fontWeight: '800' },
  miniValue: { color: '#fff', fontSize: 12, fontWeight: '900' },
});
