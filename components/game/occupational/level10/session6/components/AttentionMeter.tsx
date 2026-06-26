import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type MeterStyle = {
  glassBorder?: string;
  statLabel?: string;
  accent?: string;
  fillColors?: [string, string, string];
};

type Props = {
  find: number;
  focus: number;
  calm: number;
  style?: MeterStyle;
  title?: string;
  labels?: { find?: string; focus?: string; calm?: string };
};

const DEFAULT_STYLE: Required<MeterStyle> = {
  glassBorder: 'rgba(167,139,250,0.35)',
  statLabel: '#C4B5FD',
  accent: '#A78BFA',
  fillColors: ['#8B5CF6', '#6366F1', '#C4B5FD'],
};

export const AttentionMeter: React.FC<Props> = ({ find, focus, calm, style, title = 'ATTENTION', labels }) => {
  const s = { ...DEFAULT_STYLE, ...style };
  const lbl = { find: 'FIND', focus: 'FOCUS', calm: 'CALM', ...labels };
  return (
    <View style={[styles.wrap, { borderColor: s.glassBorder }]}>
      <Text style={[styles.title, { color: s.statLabel }]}>{title}</Text>
      <View style={styles.track}>
        <LinearGradient
          colors={s.fillColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${Math.round(((find + focus + calm) / 3) * 100)}%` }]}
        />
      </View>
      <View style={styles.row}>
        <MiniStat label={lbl.find} value={find} accent={s.accent} />
        <MiniStat label={lbl.focus} value={focus} accent={s.accent} />
        <MiniStat label={lbl.calm} value={calm} accent={s.accent} />
      </View>
    </View>
  );
};

const MiniStat: React.FC<{ label: string; value: number; accent: string }> = ({ label, value, accent }) => (
  <View style={styles.mini}>
    <Text style={[styles.miniLabel, { color: accent }]}>{label}</Text>
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
  },
  title: { fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
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
  miniLabel: { fontSize: 7, fontWeight: '800' },
  miniValue: { color: '#fff', fontSize: 11, fontWeight: '900' },
});
