import type { SensoryOrbTarget } from '@/components/game/occupational/level10/session1/session1Pacing';
import type { SensoryZoneTheme } from '@/components/game/occupational/level10/session1/sensoryExplorerTheme';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  target: SensoryOrbTarget;
  zone: SensoryZoneTheme;
  holdProgress: number;
  active: boolean;
  collected: boolean;
};

export const SensoryOrb: React.FC<Props> = ({ target, zone, holdProgress, active, collected }) => {
  const pulse = useSharedValue(0);
  const pop = useSharedValue(1);

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

  useEffect(() => {
    if (collected) pop.value = withSequence(withSpring(1.4), withTiming(0, { duration: 280 }));
    else pop.value = withSpring(1);
  }, [collected, pop]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -28 },
      { translateY: -28 + pulse.value * 6 },
      { scale: (0.85 + holdProgress * 0.2) * pop.value },
    ],
    opacity: collected ? 0.15 : 1,
  }));

  const ringPct = Math.round(holdProgress * 100);
  const left = `${target.x * 100}%`;
  const top = `${target.y * 100}%`;

  return (
    <View style={[styles.wrap, { left, top }]} pointerEvents="none">
      <Svg width={120} height={120} style={styles.ringSvg}>
        <Circle cx={60} cy={60} r={52} stroke="rgba(255,255,255,0.15)" strokeWidth={4} fill="none" />
        <Circle
          cx={60}
          cy={60}
          r={52}
          stroke={zone.color}
          strokeWidth={5}
          fill="none"
          strokeDasharray={`${2 * Math.PI * 52}`}
          strokeDashoffset={`${2 * Math.PI * 52 * (1 - holdProgress)}`}
          strokeLinecap="round"
          rotation={-90}
          origin="60, 60"
        />
      </Svg>

      <Animated.View style={[styles.orb, orbStyle, { shadowColor: zone.color }]}>
        <Text style={styles.emoji}>{zone.emoji}</Text>
      </Animated.View>

      {active && (
        <View style={[styles.labelWrap, { borderColor: zone.color }]}>
          <Text style={[styles.label, { color: zone.color }]}>{zone.label}</Text>
          <Text style={styles.pct}>{ringPct}%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', width: 120, height: 120, marginLeft: 0, marginTop: 0 },
  ringSvg: { position: 'absolute', left: -32, top: -32 },
  orb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.65,
    shadowRadius: 16,
    elevation: 8,
  },
  emoji: { fontSize: 28 },
  labelWrap: {
    position: 'absolute',
    top: 72,
    alignSelf: 'center',
    left: -40,
    width: 160,
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(5,11,26,0.65)',
  },
  label: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  pct: { color: '#fff', fontSize: 13, fontWeight: '900' },
});
