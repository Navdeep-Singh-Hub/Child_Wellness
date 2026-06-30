import { TF } from './thunderForgeTokens';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Props = {
  hint: string;
  power: number;
  round: number;
  totalRounds: number;
  phase: 'intro' | 'calibrate' | 'play';
};

export function ThunderForgeCoach({ hint, power, round, totalRounds, phase }: Props) {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withSpring(1, { damping: 8 });
  }, [hint, bounce]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.92 + bounce.value * 0.08 }],
  }));

  const phaseLabel =
    phase === 'calibrate' ? 'CALIBRATING' : phase === 'play' ? `CYCLE ${round}/${totalRounds}` : 'READY';

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.bubble, bubbleStyle]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>⚡</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.name}>BOLT · FORGE ENGINEER</Text>
          <Text style={styles.hint}>{hint}</Text>
          {phase === 'play' && (
            <View style={styles.miniBar}>
              <View style={[styles.miniFill, { width: `${Math.min(100, power)}%` }]} />
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
  wrap: {
    marginTop: 6,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: TF.glass,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: TF.glassBorder,
    padding: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245,158,11,0.25)',
    borderWidth: 2,
    borderColor: TF.accentBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 22 },
  body: { flex: 1, gap: 4 },
  name: {
    fontSize: 9,
    fontWeight: '900',
    color: TF.accentBright,
    letterSpacing: 1,
  },
  hint: {
    fontSize: 14,
    fontWeight: '700',
    color: TF.textLight,
    lineHeight: 19,
  },
  miniBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.25)',
    overflow: 'hidden',
    marginTop: 4,
  },
  miniFill: {
    height: '100%',
    backgroundColor: TF.accentBright,
    borderRadius: 3,
  },
  phaseBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: TF.molten,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TF.accentGlow,
  },
  phaseText: {
    fontSize: 8,
    fontWeight: '900',
    color: TF.textLight,
    letterSpacing: 0.8,
  },
});
