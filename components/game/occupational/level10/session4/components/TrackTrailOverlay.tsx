import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { TRACK_SHELL, type TrackMoveRound } from '@/components/game/occupational/level10/session4/trackMoveTheme';
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
import Svg, { Circle, Line } from 'react-native-svg';

type Props = {
  round: TrackMoveRound;
  guidePos: Point;
  phase: 'track' | 'move';
  holdProgress: number;
  tracking: boolean;
  atFinish: boolean;
};

export const TrackTrailOverlay: React.FC<Props> = ({
  round,
  guidePos,
  phase,
  holdProgress,
  tracking,
  atFinish,
}) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: phase === 'track' ? 500 : 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: phase === 'track' ? 500 : 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [phase, pulse]);

  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * (phase === 'track' ? 0.14 : 0.08) }],
  }));

  const w = 400;
  const h = 400;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={StyleSheet.absoluteFill}>
        <Line
          x1={round.start.x * w}
          y1={round.start.y * h}
          x2={round.end.x * w}
          y2={round.end.y * h}
          stroke="rgba(34,211,238,0.35)"
          strokeWidth={3}
          strokeDasharray="8 6"
        />
        <Circle cx={round.start.x * w} cy={round.start.y * h} r={8} fill="rgba(148,163,184,0.6)" />
        <Circle
          cx={round.end.x * w}
          cy={round.end.y * h}
          r={phase === 'move' ? 14 : 10}
          fill={phase === 'move' ? 'rgba(232,121,249,0.5)' : 'rgba(232,121,249,0.25)'}
          stroke={TRACK_SHELL.finish}
          strokeWidth={2}
        />
      </Svg>

      <View style={[styles.finishWrap, { left: `${round.end.x * 100}%`, top: `${round.end.y * 100}%` }]}>
        {phase === 'move' && holdProgress > 0 && atFinish && (
          <Svg width={100} height={100} style={styles.ringSvg}>
            <Circle cx={50} cy={50} r={42} stroke="rgba(255,255,255,0.12)" strokeWidth={3} fill="none" />
            <Circle
              cx={50}
              cy={50}
              r={42}
              stroke={TRACK_SHELL.good}
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
        <View style={[styles.finish, phase === 'move' && styles.finishActive]}>
          <Text style={styles.finishEmoji}>{round.emoji}</Text>
        </View>
        <Text style={[styles.finishLabel, { color: round.color }]}>{round.label}</Text>
      </View>

      <View style={[styles.guideWrap, { left: `${guidePos.x * 100}%`, top: `${guidePos.y * 100}%` }]}>
        <Animated.View
          style={[
            styles.guide,
            guideStyle,
            { borderColor: round.color, shadowColor: round.color },
            tracking && styles.guideHit,
          ]}
        >
          <Text style={styles.guideEmoji}>💫</Text>
        </Animated.View>
        {phase === 'track' && (
          <Text style={styles.guideLabel}>{tracking ? 'LOCKED' : 'FOLLOW'}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  guideWrap: { position: 'absolute', alignItems: 'center', marginLeft: -36, marginTop: -36, width: 72 },
  finishWrap: { position: 'absolute', alignItems: 'center', marginLeft: -42, marginTop: -42, width: 84 },
  ringSvg: { position: 'absolute', left: -8, top: -8 },
  guide: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    backgroundColor: 'rgba(15,23,42,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 6,
  },
  guideHit: { backgroundColor: 'rgba(34,211,238,0.2)' },
  guideEmoji: { fontSize: 26 },
  guideLabel: { marginTop: 4, fontSize: 8, fontWeight: '900', color: TRACK_SHELL.guide, letterSpacing: 0.5 },
  finish: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: TRACK_SHELL.finish,
    backgroundColor: 'rgba(15,23,42,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  finishActive: { opacity: 1, borderWidth: 3 },
  finishEmoji: { fontSize: 26 },
  finishLabel: { marginTop: 5, fontSize: 9, fontWeight: '900' },
});
