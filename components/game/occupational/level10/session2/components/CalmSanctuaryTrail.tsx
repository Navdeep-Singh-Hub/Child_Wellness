import type { CalmSanctuary } from '@/components/game/occupational/level10/session2/calmBodyQuestTheme';
import { GARDEN_SHELL } from '@/components/game/occupational/level10/session2/calmBodyQuestTheme';
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
  sanctuaries: CalmSanctuary[];
  activeId: string | null;
  completedIds: string[];
  holdProgress: number;
  cursorOnId: string | null;
  calmPhase: boolean;
};

const OrbNode: React.FC<{
  sanctuary: CalmSanctuary;
  active: boolean;
  completed: boolean;
  holdProgress: number;
  cursorOn: boolean;
  calmPhase: boolean;
}> = ({ sanctuary, active, completed, holdProgress, cursorOn, calmPhase }) => {
  const glow = useSharedValue(0);

  useEffect(() => {
    if (active && calmPhase) {
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    } else {
      glow.value = withTiming(active ? 0.5 : 0);
    }
  }, [active, calmPhase, glow]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + glow.value * 0.06 }],
    opacity: completed ? 0.5 : 1,
  }));

  return (
    <View style={[styles.node, { left: `${sanctuary.x * 100}%`, top: `${sanctuary.y * 100}%` }]}>
      {active && calmPhase && holdProgress > 0 && cursorOn && (
        <Svg width={100} height={100} style={styles.ringSvg}>
          <Circle cx={50} cy={50} r={42} stroke="rgba(255,255,255,0.1)" strokeWidth={3} fill="none" />
          <Circle
            cx={50}
            cy={50}
            r={42}
            stroke={GARDEN_SHELL.good}
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
          styles.orb,
          orbStyle,
          { borderColor: sanctuary.color, shadowColor: sanctuary.color },
          active && styles.orbActive,
          completed && styles.orbDone,
          cursorOn && styles.orbCursor,
        ]}
      >
        <Text style={styles.emoji}>{completed ? '✓' : sanctuary.emoji}</Text>
      </Animated.View>
      <Text style={[styles.label, { color: sanctuary.color }]}>{sanctuary.label}</Text>
    </View>
  );
};

export const CalmSanctuaryTrail: React.FC<Props> = ({
  sanctuaries,
  activeId,
  completedIds,
  holdProgress,
  cursorOnId,
  calmPhase,
}) => {
  const points = sanctuaries.map((s) => ({ x: s.x, y: s.y }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg viewBox="0 0 1 1" style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        {points.slice(0, -1).map((pt, i) => {
          const next = points[i + 1]!;
          return (
            <Line
              key={i}
              x1={pt.x}
              y1={pt.y}
              x2={next.x}
              y2={next.y}
              stroke="rgba(167,139,250,0.35)"
              strokeWidth={0.01}
              strokeDasharray="0.025 0.018"
            />
          );
        })}
      </Svg>
      {sanctuaries.map((s) => (
        <OrbNode
          key={s.id}
          sanctuary={s}
          active={s.id === activeId}
          completed={completedIds.includes(s.id)}
          holdProgress={holdProgress}
          cursorOn={cursorOnId === s.id}
          calmPhase={calmPhase}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  node: { position: 'absolute', alignItems: 'center', marginLeft: -36, marginTop: -36, width: 72 },
  ringSvg: { position: 'absolute', left: -14, top: -14 },
  orb: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    backgroundColor: 'rgba(30,27,75,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 5,
  },
  orbActive: { borderWidth: 3 },
  orbDone: { backgroundColor: 'rgba(52,211,153,0.15)' },
  orbCursor: { backgroundColor: 'rgba(255,255,255,0.1)' },
  emoji: { fontSize: 26 },
  label: { marginTop: 6, fontSize: 9, fontWeight: '900', letterSpacing: 0.3 },
});
