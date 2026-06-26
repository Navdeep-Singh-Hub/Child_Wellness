import type { PirateWaypoint } from '@/components/game/occupational/level10/session3/pirateDetourTheme';
import { PIRATE_SHELL } from '@/components/game/occupational/level10/session3/pirateDetourTheme';
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
  routeA: PirateWaypoint;
  routeB: PirateWaypoint;
  activeRoute: 'a' | 'b';
  showA: boolean;
  showB: boolean;
  detourFlash: boolean;
  holdProgress: number;
  cursorOnActive: boolean;
};

const WaypointNode: React.FC<{
  waypoint: PirateWaypoint;
  visible: boolean;
  active: boolean;
  dimmed: boolean;
  holdProgress: number;
  cursorOn: boolean;
  flash: boolean;
}> = ({ waypoint, visible, active, dimmed, holdProgress, cursorOn, flash }) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (active && visible) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: flash ? 280 : 950, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: flash ? 280 : 950, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    } else {
      pulse.value = withTiming(0);
    }
  }, [active, flash, pulse, visible]);

  const nodeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: active ? 1 + pulse.value * 0.12 : 1 }],
    opacity: visible ? (dimmed ? 0.35 : 1) : 0.2,
  }));

  if (!visible && !dimmed) return null;

  return (
    <View style={[styles.node, { left: `${waypoint.x * 100}%`, top: `${waypoint.y * 100}%` }]}>
      {active && holdProgress > 0 && cursorOn && (
        <Svg width={100} height={100} style={styles.ringSvg}>
          <Circle cx={50} cy={50} r={42} stroke="rgba(255,255,255,0.12)" strokeWidth={3} fill="none" />
          <Circle
            cx={50}
            cy={50}
            r={42}
            stroke={PIRATE_SHELL.good}
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
          styles.island,
          nodeStyle,
          { borderColor: waypoint.color, shadowColor: waypoint.color },
          active && styles.islandActive,
          cursorOn && active && styles.islandCursor,
        ]}
      >
        <Text style={styles.emoji}>{waypoint.emoji}</Text>
      </Animated.View>
      <Text style={[styles.label, { color: waypoint.color }]}>{waypoint.label}</Text>
    </View>
  );
};

export const PirateWaypointOverlay: React.FC<Props> = ({
  routeA,
  routeB,
  activeRoute,
  showA,
  showB,
  detourFlash,
  holdProgress,
  cursorOnActive,
}) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <WaypointNode
      waypoint={routeA}
      visible={showA}
      active={activeRoute === 'a'}
      dimmed={activeRoute === 'b' && showA}
      holdProgress={holdProgress}
      cursorOn={cursorOnActive && activeRoute === 'a'}
      flash={false}
    />
    <WaypointNode
      waypoint={routeB}
      visible={showB}
      active={activeRoute === 'b'}
      dimmed={false}
      holdProgress={holdProgress}
      cursorOn={cursorOnActive && activeRoute === 'b'}
      flash={detourFlash}
    />
  </View>
);

const styles = StyleSheet.create({
  node: { position: 'absolute', alignItems: 'center', marginLeft: -42, marginTop: -42, width: 84 },
  ringSvg: { position: 'absolute', left: -8, top: -8 },
  island: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    backgroundColor: 'rgba(12,25,41,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 6,
  },
  islandActive: { borderWidth: 3 },
  islandCursor: { backgroundColor: 'rgba(255,255,255,0.14)' },
  emoji: { fontSize: 30 },
  label: { marginTop: 5, fontSize: 9, fontWeight: '900', letterSpacing: 0.3 },
});
