import type { EnergyRound } from '@/components/game/occupational/level10/session2/energyMeterTheme';
import { PULSE_SHELL } from '@/components/game/occupational/level10/session2/energyMeterTheme';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  round: EnergyRound;
  currentEnergy: number;
  targetEnergy: number;
  matchProgress: number;
  phase: 'read' | 'match';
};

export const EnergyGauge: React.FC<Props> = ({
  round,
  currentEnergy,
  targetEnergy,
  matchProgress,
  phase,
}) => {
  const fill = useSharedValue(0);
  const targetLine = useSharedValue(targetEnergy);

  useEffect(() => {
    fill.value = withTiming(currentEnergy, { duration: 120, easing: Easing.out(Easing.quad) });
    targetLine.value = withTiming(targetEnergy, { duration: 300 });
  }, [currentEnergy, fill, targetEnergy, targetLine]);

  const fillStyle = useAnimatedStyle(() => ({
    height: `${fill.value * 100}%`,
  }));

  const targetStyle = useAnimatedStyle(() => ({
    bottom: `${targetLine.value * 100}%`,
  }));

  const pct = Math.round(currentEnergy * 100);
  const targetPct = Math.round(targetEnergy * 100);

  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.gauge}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, fillStyle, { backgroundColor: round.color }]} />
          <Animated.View style={[styles.targetLine, targetStyle, { borderColor: PULSE_SHELL.gold }]} />
        </View>
        <View style={styles.scale}>
          {[100, 75, 50, 25, 0].map((n) => (
            <Text key={n} style={styles.scaleText}>{n}</Text>
          ))}
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.roundEmoji}>{round.emoji}</Text>
        <Text style={[styles.roundLabel, { color: round.color }]}>{round.label}</Text>
        <Text style={styles.energyRead}>
          YOU: {pct}%  →  TARGET: {targetPct}%
        </Text>
        {phase === 'match' && matchProgress > 0 && (
          <View style={styles.matchTrack}>
            <View style={[styles.matchFill, { width: `${matchProgress * 100}%`, backgroundColor: round.color }]} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 16,
    top: '22%',
    alignItems: 'center',
    width: 120,
  },
  gauge: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  track: {
    width: 36,
    height: 200,
    borderRadius: 10,
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderWidth: 2,
    borderColor: 'rgba(34,211,238,0.4)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: { width: '100%', borderRadius: 6, opacity: 0.85 },
  targetLine: {
    position: 'absolute',
    left: -4,
    right: -4,
    height: 0,
    borderTopWidth: 3,
  },
  scale: { height: 200, justifyContent: 'space-between', paddingVertical: 2 },
  scaleText: { color: 'rgba(165,243,252,0.6)', fontSize: 8, fontWeight: '800' },
  info: { marginTop: 12, alignItems: 'center', width: 130 },
  roundEmoji: { fontSize: 28 },
  roundLabel: { fontSize: 11, fontWeight: '900', marginTop: 4, textAlign: 'center' },
  energyRead: { color: PULSE_SHELL.backText, fontSize: 9, fontWeight: '800', marginTop: 8, textAlign: 'center' },
  matchTrack: {
    marginTop: 8,
    width: '100%',
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  matchFill: { height: '100%', borderRadius: 4 },
});
