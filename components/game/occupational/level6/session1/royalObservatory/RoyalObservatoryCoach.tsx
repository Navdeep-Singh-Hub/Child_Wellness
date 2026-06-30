import { RO } from './royalObservatoryTokens';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Props = {
  hint: string;
  safePct: number;
  remainSec: number;
  round: number;
  totalRounds: number;
  phase: 'intro' | 'calibrate' | 'play';
};

export function RoyalObservatoryCoach({ hint, safePct, remainSec, round, totalRounds, phase }: Props) {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withSpring(1, { damping: 8 });
  }, [hint, bounce]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.92 + bounce.value * 0.08 }],
  }));

  const phaseLabel =
    phase === 'calibrate' ? 'ALIGNING' : phase === 'play' ? `WATCH ${round}/${totalRounds}` : 'READY';

  const safeColor = safePct >= 55 ? RO.good : safePct >= 35 ? RO.roseGold : RO.warn;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.bubble, bubbleStyle]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>🔭</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.name}>SAGE · ROYAL ASTRONOMER</Text>
          <Text style={styles.hint}>{hint}</Text>
          {phase === 'play' && (
            <View style={styles.row}>
              <View style={styles.miniBar}>
                <View style={[styles.miniFill, { width: `${Math.min(100, safePct)}%`, backgroundColor: safeColor }]} />
              </View>
              <Text style={styles.timer}>{Math.ceil(remainSec)}s</Text>
            </View>
          )}
        </View>
        <View style={styles.phaseBadge}>
          <Text style={styles.phaseText}>{phaseLabel}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 6, marginBottom: 4, paddingHorizontal: 2 },
  bubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: RO.glass,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: RO.glassBorder,
    padding: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(244,114,182,0.22)',
    borderWidth: 2,
    borderColor: RO.accentBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 22 },
  body: { flex: 1, gap: 4 },
  name: { fontSize: 9, fontWeight: '900', color: RO.accentBright, letterSpacing: 1 },
  hint: { fontSize: 14, fontWeight: '700', color: RO.textLight, lineHeight: 19 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  miniBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.25)',
    overflow: 'hidden',
  },
  miniFill: { height: '100%', borderRadius: 3 },
  timer: { fontSize: 13, fontWeight: '900', color: RO.twilight, minWidth: 28 },
  phaseBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: RO.accentDeep,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RO.accentGlow,
  },
  phaseText: { fontSize: 8, fontWeight: '900', color: RO.textLight, letterSpacing: 0.8 },
});
