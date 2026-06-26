import { BALANCE_SHELL } from '@/components/game/occupational/level10/session4/balanceReachTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  balance: number;
  reach: number;
  focus: number;
};

export const SensoryMotorMeter: React.FC<Props> = ({ balance, reach, focus }) => (
  <View style={styles.wrap}>
    <Text style={styles.title}>INTEGRATE</Text>
    <View style={styles.track}>
      <LinearGradient
        colors={['#5EEAD4', '#A78BFA', '#FDE68A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${Math.round(((balance + reach) / 2) * 100)}%` }]}
      />
    </View>
    <View style={styles.row}>
      <MiniStat label="BALANCE" value={balance} />
      <MiniStat label="REACH" value={reach} />
      <MiniStat label="FOCUS" value={focus} />
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
    width: 158,
    padding: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.78)',
    borderWidth: 1,
    borderColor: BALANCE_SHELL.glassBorder,
  },
  title: { color: BALANCE_SHELL.statLabel, fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
  track: {
    height: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  fill: { height: '100%', borderRadius: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  mini: { alignItems: 'center', flex: 1 },
  miniLabel: { color: BALANCE_SHELL.accent, fontSize: 7, fontWeight: '800' },
  miniValue: { color: '#fff', fontSize: 11, fontWeight: '900' },
});
