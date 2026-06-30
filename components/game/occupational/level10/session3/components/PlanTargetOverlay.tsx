import type { PlanTarget } from '@/components/game/occupational/level10/session3/changeThePlanTheme';
import { SHIFT_SHELL } from '@/components/game/occupational/level10/session3/changeThePlanTheme';
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
  planA: PlanTarget;
  planB: PlanTarget;
  activeTarget: 'a' | 'b';
  showA: boolean;
  showB: boolean;
  switchFlash: boolean;
  holdProgress: number;
  cursorOnActive: boolean;
};

const TargetNode: React.FC<{
  target: PlanTarget;
  visible: boolean;
  active: boolean;
  dimmed: boolean;
  holdProgress: number;
  cursorOn: boolean;
  flash: boolean;
}> = ({ target, visible, active, dimmed, holdProgress, cursorOn, flash }) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (active && visible) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: flash ? 300 : 900, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: flash ? 300 : 900, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    } else {
      pulse.value = withTiming(0);
    }
  }, [active, flash, pulse, visible]);

  const nodeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: active ? 1 + pulse.value * 0.1 : 1 }],
    opacity: visible ? (dimmed ? 0.35 : 1) : 0.2,
  }));

  if (!visible && !dimmed) return null;

  return (
    <View style={[styles.node, { left: `${target.x * 100}%`, top: `${target.y * 100}%` }]}>
      {active && holdProgress > 0 && cursorOn && (
        <Svg width={100} height={100} style={styles.ringSvg}>
          <Circle cx={50} cy={50} r={42} stroke="rgba(255,255,255,0.12)" strokeWidth={3} fill="none" />
          <Circle
            cx={50}
            cy={50}
            r={42}
            stroke={SHIFT_SHELL.good}
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
          styles.target,
          nodeStyle,
          { borderColor: target.color, shadowColor: target.color },
          active && styles.targetActive,
          cursorOn && active && styles.targetCursor,
        ]}
      >
        <Text style={styles.arrow}>{target.arrow}</Text>
      </Animated.View>
      <Text style={[styles.label, { color: target.color }]}>{target.label}</Text>
    </View>
  );
};

export const PlanTargetOverlay: React.FC<Props> = ({
  planA,
  planB,
  activeTarget,
  showA,
  showB,
  switchFlash,
  holdProgress,
  cursorOnActive,
}) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <TargetNode
      target={planA}
      visible={showA}
      active={activeTarget === 'a'}
      dimmed={activeTarget === 'b' && showA}
      holdProgress={holdProgress}
      cursorOn={cursorOnActive && activeTarget === 'a'}
      flash={false}
    />
    <TargetNode
      target={planB}
      visible={showB}
      active={activeTarget === 'b'}
      dimmed={false}
      holdProgress={holdProgress}
      cursorOn={cursorOnActive && activeTarget === 'b'}
      flash={switchFlash}
    />
  </View>
);

const styles = StyleSheet.create({
  node: { position: 'absolute', alignItems: 'center', marginLeft: -40, marginTop: -40, width: 80 },
  ringSvg: { position: 'absolute', left: -10, top: -10 },
  target: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    backgroundColor: 'rgba(15,23,42,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  targetActive: { borderWidth: 3 },
  targetCursor: { backgroundColor: 'rgba(255,255,255,0.12)' },
  arrow: { fontSize: 28, fontWeight: '900', color: '#F0FDFA' },
  label: { marginTop: 6, fontSize: 9, fontWeight: '900', letterSpacing: 0.3 },
});
