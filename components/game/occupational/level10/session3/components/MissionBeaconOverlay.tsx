import type { MissionBeacon } from '@/components/game/occupational/level10/session3/missionUpdateTheme';
import { MISSION_SHELL } from '@/components/game/occupational/level10/session3/missionUpdateTheme';
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
  missionA: MissionBeacon;
  missionB: MissionBeacon;
  activeMission: 'a' | 'b';
  showA: boolean;
  showB: boolean;
  updateFlash: boolean;
  holdProgress: number;
  cursorOnActive: boolean;
};

const BeaconNode: React.FC<{
  beacon: MissionBeacon;
  visible: boolean;
  active: boolean;
  dimmed: boolean;
  holdProgress: number;
  cursorOn: boolean;
  flash: boolean;
}> = ({ beacon, visible, active, dimmed, holdProgress, cursorOn, flash }) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (active && visible) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: flash ? 260 : 900, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: flash ? 260 : 900, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    } else {
      pulse.value = withTiming(0);
    }
  }, [active, flash, pulse, visible]);

  const nodeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: active ? 1 + pulse.value * 0.11 : 1 }],
    opacity: visible ? (dimmed ? 0.35 : 1) : 0.2,
  }));

  if (!visible && !dimmed) return null;

  return (
    <View style={[styles.node, { left: `${beacon.x * 100}%`, top: `${beacon.y * 100}%` }]}>
      {active && holdProgress > 0 && cursorOn && (
        <Svg width={100} height={100} style={styles.ringSvg}>
          <Circle cx={50} cy={50} r={42} stroke="rgba(255,255,255,0.12)" strokeWidth={3} fill="none" />
          <Circle
            cx={50}
            cy={50}
            r={42}
            stroke={MISSION_SHELL.good}
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
          styles.beacon,
          nodeStyle,
          { borderColor: beacon.color, shadowColor: beacon.color },
          active && styles.beaconActive,
          cursorOn && active && styles.beaconCursor,
        ]}
      >
        <Text style={styles.icon}>{beacon.icon}</Text>
      </Animated.View>
      <Text style={[styles.label, { color: beacon.color }]}>{beacon.label}</Text>
    </View>
  );
};

export const MissionBeaconOverlay: React.FC<Props> = ({
  missionA,
  missionB,
  activeMission,
  showA,
  showB,
  updateFlash,
  holdProgress,
  cursorOnActive,
}) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <BeaconNode
      beacon={missionA}
      visible={showA}
      active={activeMission === 'a'}
      dimmed={activeMission === 'b' && showA}
      holdProgress={holdProgress}
      cursorOn={cursorOnActive && activeMission === 'a'}
      flash={false}
    />
    <BeaconNode
      beacon={missionB}
      visible={showB}
      active={activeMission === 'b'}
      dimmed={false}
      holdProgress={holdProgress}
      cursorOn={cursorOnActive && activeMission === 'b'}
      flash={updateFlash}
    />
  </View>
);

const styles = StyleSheet.create({
  node: { position: 'absolute', alignItems: 'center', marginLeft: -42, marginTop: -42, width: 84 },
  ringSvg: { position: 'absolute', left: -8, top: -8 },
  beacon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    backgroundColor: 'rgba(15,23,42,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 6,
  },
  beaconActive: { borderWidth: 3 },
  beaconCursor: { backgroundColor: 'rgba(255,255,255,0.14)' },
  icon: { fontSize: 30 },
  label: { marginTop: 5, fontSize: 9, fontWeight: '900', letterSpacing: 0.3 },
});
