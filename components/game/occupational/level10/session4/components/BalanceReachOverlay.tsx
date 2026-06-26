import {
  BALANCE_PLATFORM,
  BALANCE_REACH_LOOSE,
  BALANCE_SHELL,
  type BalanceReachChallenge,
} from '@/components/game/occupational/level10/session4/balanceReachTheme';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  challenge: BalanceReachChallenge | null;
  phase: 'balance' | 'reach';
  holdProgress: number;
  balanced: boolean;
  reaching: boolean;
  showReach: boolean;
};

export const BalanceReachOverlay: React.FC<Props> = ({
  challenge,
  phase,
  holdProgress,
  balanced,
  reaching,
  showReach,
}) => {
  const zone = phase === 'balance' ? BALANCE_PLATFORM : BALANCE_REACH_LOOSE;
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const platformStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.06 }],
    borderColor: balanced ? BALANCE_SHELL.platformActive : BALANCE_SHELL.platform,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.platformWrap, { left: `${zone.x * 100}%`, top: `${zone.y * 100}%` }]}>
        {holdProgress > 0 && phase === 'balance' && balanced && (
          <Svg width={110} height={110} style={styles.ringSvg}>
            <Circle cx={55} cy={55} r={46} stroke="rgba(255,255,255,0.12)" strokeWidth={3} fill="none" />
            <Circle
              cx={55}
              cy={55}
              r={46}
              stroke={BALANCE_SHELL.good}
              strokeWidth={4}
              fill="none"
              strokeDasharray={`${2 * Math.PI * 46}`}
              strokeDashoffset={`${2 * Math.PI * 46 * (1 - holdProgress)}`}
              strokeLinecap="round"
              rotation={-90}
              origin="55, 55"
            />
          </Svg>
        )}
        <Animated.View style={[styles.platform, platformStyle, { width: zone.radius * 200, height: zone.radius * 200, borderRadius: zone.radius * 100 }]}>
          <Text style={styles.platformEmoji}>⚖️</Text>
        </Animated.View>
        <Text style={styles.platformLabel}>CENTER</Text>
      </View>

      {showReach && challenge && (
        <View style={[styles.reachWrap, { left: `${challenge.reach.x * 100}%`, top: `${challenge.reach.y * 100}%` }]}>
          {phase === 'reach' && holdProgress > 0 && reaching && (
            <Svg width={100} height={100} style={styles.ringSvg}>
              <Circle cx={50} cy={50} r={42} stroke="rgba(255,255,255,0.12)" strokeWidth={3} fill="none" />
              <Circle
                cx={50}
                cy={50}
                r={42}
                stroke={BALANCE_SHELL.good}
                strokeWidth={4}
                fill="none"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - holdProgress)}`}
                strokeLinecap="round"
                rotation={-90}
                origin="50, 50"
              />
            </Svg>
          )}
          <View style={[styles.orb, { borderColor: challenge.color, shadowColor: challenge.color }, reaching && styles.orbHit]}>
            <Text style={styles.orbEmoji}>{challenge.emoji}</Text>
          </View>
          <Text style={[styles.orbLabel, { color: challenge.color }]}>{challenge.label}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  platformWrap: { position: 'absolute', alignItems: 'center', marginLeft: -55, marginTop: -55, width: 110 },
  reachWrap: { position: 'absolute', alignItems: 'center', marginLeft: -42, marginTop: -42, width: 84 },
  ringSvg: { position: 'absolute', left: -5, top: -5 },
  platform: {
    borderWidth: 3,
    backgroundColor: 'rgba(15,23,42,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformEmoji: { fontSize: 28 },
  platformLabel: { marginTop: 6, fontSize: 9, fontWeight: '900', color: BALANCE_SHELL.platformActive, letterSpacing: 0.5 },
  orb: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    backgroundColor: 'rgba(15,23,42,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 6,
  },
  orbHit: { backgroundColor: 'rgba(255,255,255,0.12)' },
  orbEmoji: { fontSize: 28 },
  orbLabel: { marginTop: 5, fontSize: 9, fontWeight: '900' },
});
