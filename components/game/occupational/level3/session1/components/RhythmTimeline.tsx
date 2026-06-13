import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  total: number;
  litIndex: number;
  userTaps: number;
  phase: 'listen' | 'tap' | 'idle';
};

export const RhythmTimeline: React.FC<Props> = ({ total, litIndex, userTaps, phase }) => {
  if (total <= 0) return null;

  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => {
        const lit = phase === 'listen' && i < litIndex;
        const tapped = phase === 'tap' && i < userTaps;
        const active = lit || tapped;
        return (
          <View key={i} style={[styles.dot, active && styles.dotActive]}>
            <Text style={styles.dotEmoji}>{active ? '🥁' : '○'}</Text>
          </View>
        );
      })}
    </View>
  );
};

export const StopGoBanner: React.FC<{ state: 'play' | 'stop' | 'idle' }> = ({ state }) => {
  const bg = state === 'play' ? '#22C55E' : state === 'stop' ? '#EF4444' : '#94A3B8';
  const label = state === 'play' ? '▶ GO — TAP!' : state === 'stop' ? '⏸ STOP — FREEZE!' : 'Get ready…';
  return (
    <View style={[styles.banner, { backgroundColor: bg }]}>
      <Text style={styles.bannerText}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' },
  dot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 2,
    borderColor: 'rgba(5,150,105,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: { backgroundColor: 'rgba(251,191,36,0.35)', borderColor: '#F59E0B' },
  dotEmoji: { fontSize: 18 },
  banner: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 12,
    alignSelf: 'center',
  },
  bannerText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
});
