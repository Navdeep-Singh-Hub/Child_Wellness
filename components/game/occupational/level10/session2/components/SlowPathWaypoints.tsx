import type { WalkStone, WalkStoneId } from '@/components/game/occupational/level10/session2/slowMotionWalkTheme';
import { TWILIGHT_SHELL } from '@/components/game/occupational/level10/session2/slowMotionWalkTheme';
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
  stones: WalkStone[];
  activeStoneId: WalkStoneId | null;
  completedIds: WalkStoneId[];
  holdProgress: number;
  cursorOnId: WalkStoneId | null;
};

const StoneNode: React.FC<{
  stone: WalkStone;
  active: boolean;
  completed: boolean;
  holdProgress: number;
  cursorOn: boolean;
}> = ({ stone, active, completed, holdProgress, cursorOn }) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (active && !completed) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    } else {
      pulse.value = withTiming(0);
    }
  }, [active, completed, pulse]);

  const nodeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: active ? 1 + pulse.value * 0.08 : completed ? 1.05 : 1 }],
    opacity: completed ? 0.55 : 1,
  }));

  return (
    <View style={[styles.node, { left: `${stone.x * 100}%`, top: `${stone.y * 100}%` }]}>
      {active && holdProgress > 0 && cursorOn && (
        <Svg width={100} height={100} style={styles.ringSvg}>
          <Circle cx={50} cy={50} r={42} stroke="rgba(255,255,255,0.12)" strokeWidth={3} fill="none" />
          <Circle
            cx={50}
            cy={50}
            r={42}
            stroke={stone.color}
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
      <Animated.View
        style={[
          styles.stone,
          nodeStyle,
          { borderColor: stone.color, shadowColor: stone.color },
          active && styles.stoneActive,
          completed && styles.stoneDone,
          cursorOn && styles.stoneCursor,
        ]}
      >
        <Text style={styles.emoji}>{completed ? '✓' : stone.emoji}</Text>
      </Animated.View>
      <Text style={[styles.label, { color: stone.color }]}>{stone.label}</Text>
    </View>
  );
};

export const SlowPathWaypoints: React.FC<Props> = ({
  stones,
  activeStoneId,
  completedIds,
  holdProgress,
  cursorOnId,
}) => {
  const pathPoints = stones.map((s) => ({ x: s.x, y: s.y }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg viewBox="0 0 1 1" style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        {pathPoints.slice(0, -1).map((pt, i) => {
          const next = pathPoints[i + 1]!;
          return (
            <Line
              key={i}
              x1={pt.x}
              y1={pt.y}
              x2={next.x}
              y2={next.y}
              stroke={TWILIGHT_SHELL.pathGlow}
              strokeWidth={0.012}
              strokeDasharray="0.03 0.02"
            />
          );
        })}
      </Svg>
      {stones.map((stone) => (
        <StoneNode
          key={stone.id}
          stone={stone}
          active={stone.id === activeStoneId}
          completed={completedIds.includes(stone.id)}
          holdProgress={holdProgress}
          cursorOn={cursorOnId === stone.id}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  node: { position: 'absolute', alignItems: 'center', marginLeft: -36, marginTop: -36, width: 72 },
  ringSvg: { position: 'absolute', left: -14, top: -14 },
  stone: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    backgroundColor: 'rgba(15,23,42,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  stoneActive: { borderWidth: 3, backgroundColor: 'rgba(30,41,59,0.88)' },
  stoneDone: { backgroundColor: 'rgba(45,212,191,0.2)' },
  stoneCursor: { backgroundColor: 'rgba(255,255,255,0.12)' },
  emoji: { fontSize: 24 },
  label: { marginTop: 6, fontSize: 9, fontWeight: '900', letterSpacing: 0.3 },
});
