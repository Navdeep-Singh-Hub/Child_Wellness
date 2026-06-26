import { BALLOON_BREATHING_THEME } from '@/components/game/occupational/level10/session2/balloonBreathingTheme';
import type { BreathPhase } from '@/components/game/occupational/level10/session2/regulationTrackingUtils';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  phase: BreathPhase;
  cycle: number;
  totalCycles: number;
  phaseProgress: number;
};

const phaseLabel = (phase: BreathPhase) => {
  switch (phase) {
    case 'inhale':
      return BALLOON_BREATHING_THEME.inhaleLabel;
    case 'hold':
      return BALLOON_BREATHING_THEME.holdLabel;
    case 'exhale':
      return BALLOON_BREATHING_THEME.exhaleLabel;
    default:
      return BALLOON_BREATHING_THEME.restLabel;
  }
};

export const BreathCycleHUD: React.FC<Props> = ({ phase, cycle, totalCycles, phaseProgress }) => (
  <View style={styles.wrap} pointerEvents="none">
    <View style={styles.banner}>
      <Text style={styles.bannerText}>{phaseLabel(phase)}</Text>
    </View>
    <View style={styles.cycleRow}>
      <Text style={styles.cycleText}>
        Breath {Math.min(cycle + 1, totalCycles)}/{totalCycles}
      </Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(phaseProgress * 100)}%` }]} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 14, alignSelf: 'center', alignItems: 'center', width: '88%' },
  banner: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.4)',
  },
  bannerText: {
    color: '#0369A1',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  cycleRow: { marginTop: 10, width: '100%', alignItems: 'center' },
  cycleText: { color: '#0C4A6E', fontSize: 11, fontWeight: '800', marginBottom: 6 },
  progressTrack: {
    width: '70%',
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(12,74,110,0.1)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#38BDF8' },
});
