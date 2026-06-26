import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { CATCH_SHELL, type CatchTurnRound } from '@/components/game/occupational/level10/session4/catchTurnTheme';
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
  round: CatchTurnRound;
  orbPos: Point;
  phase: 'catch' | 'turn';
  holdProgress: number;
  catching: boolean;
  turning: boolean;
  showTurn: boolean;
};

export const CatchTurnOverlay: React.FC<Props> = ({
  round,
  orbPos,
  phase,
  holdProgress,
  catching,
  turning,
  showTurn,
}) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: phase === 'catch' ? 400 : 650, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: phase === 'catch' ? 400 : 650, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [phase, pulse]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.12 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.catchWrap, { left: `${round.catch.x * 100}%`, top: `${round.catch.y * 100}%` }]}>
        <View style={[styles.catchZone, catching && styles.catchZoneHit]}>
          <Text style={styles.catchEmoji}>🎯</Text>
        </View>
        <Text style={styles.catchLabel}>CATCH</Text>
      </View>

      {phase === 'catch' && (
        <View style={[styles.orbWrap, { left: `${orbPos.x * 100}%`, top: `${orbPos.y * 100}%` }]}>
          <Animated.View style={[styles.orb, orbStyle, { borderColor: round.color, shadowColor: round.color }]}>
            <Text style={styles.orbEmoji}>{round.emoji}</Text>
          </Animated.View>
        </View>
      )}

      {showTurn && (
        <View style={[styles.turnWrap, { left: `${round.turn.x * 100}%`, top: `${round.turn.y * 100}%` }]}>
          {phase === 'turn' && holdProgress > 0 && turning && (
            <Svg width={100} height={100} style={styles.ringSvg}>
              <Circle cx={50} cy={50} r={42} stroke="rgba(255,255,255,0.12)" strokeWidth={3} fill="none" />
              <Circle
                cx={50}
                cy={50}
                r={42}
                stroke={CATCH_SHELL.good}
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
          <View style={[styles.turnMarker, turning && styles.turnMarkerHit]}>
            <Text style={styles.turnEmoji}>🔄</Text>
          </View>
          <Text style={[styles.turnLabel, { color: CATCH_SHELL.turn }]}>TURN</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  catchWrap: { position: 'absolute', alignItems: 'center', marginLeft: -40, marginTop: -40, width: 80 },
  orbWrap: { position: 'absolute', alignItems: 'center', marginLeft: -34, marginTop: -34, width: 68 },
  turnWrap: { position: 'absolute', alignItems: 'center', marginLeft: -42, marginTop: -42, width: 84 },
  ringSvg: { position: 'absolute', left: -8, top: -8 },
  catchZone: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: CATCH_SHELL.catch,
    backgroundColor: 'rgba(30,27,75,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catchZoneHit: { backgroundColor: 'rgba(251,191,36,0.2)', borderWidth: 3 },
  catchEmoji: { fontSize: 24 },
  catchLabel: { marginTop: 4, fontSize: 8, fontWeight: '900', color: CATCH_SHELL.catch },
  orb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    backgroundColor: 'rgba(30,27,75,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  orbEmoji: { fontSize: 28 },
  turnMarker: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: CATCH_SHELL.turn,
    backgroundColor: 'rgba(30,27,75,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnMarkerHit: { backgroundColor: 'rgba(129,140,248,0.2)', borderWidth: 3 },
  turnEmoji: { fontSize: 28 },
  turnLabel: { marginTop: 5, fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
});
