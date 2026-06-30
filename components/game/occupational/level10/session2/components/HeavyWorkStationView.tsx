import type { HeavyWorkStation } from '@/components/game/occupational/level10/session2/heavyWorkTheme';
import { FORGE_SHELL } from '@/components/game/occupational/level10/session2/heavyWorkTheme';
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
  station: HeavyWorkStation;
  holdProgress: number;
  leftActive: boolean;
  rightActive: boolean;
  working: boolean;
};

const ZonePad: React.FC<{
  zone: HeavyWorkStation['leftZone'];
  active: boolean;
  label: string;
}> = ({ zone, active, label }) => (
  <View style={[styles.zone, { left: `${zone.x * 100}%`, top: `${zone.y * 100}%` }, active && styles.zoneActive]}>
    <Text style={styles.zoneLabel}>{label}</Text>
  </View>
);

export const HeavyWorkStationView: React.FC<Props> = ({
  station,
  holdProgress,
  leftActive,
  rightActive,
  working,
}) => {
  const strain = useSharedValue(0);

  useEffect(() => {
    if (working) {
      strain.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    } else {
      strain.value = withTiming(0);
    }
  }, [strain, working]);

  const objectStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + strain.value * 0.04 }],
  }));

  const center = station.center ?? {
    x: (station.leftZone.x + station.rightZone.x) / 2,
    y: (station.leftZone.y + station.rightZone.y) / 2,
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          styles.object,
          objectStyle,
          {
            left: `${center.x * 100}%`,
            top: `${center.y * 100}%`,
            borderColor: station.color,
          },
        ]}
      >
        <Text style={styles.objectEmoji}>{station.objectEmoji}</Text>
        <Text style={[styles.objectLabel, { color: station.color }]}>{station.label}</Text>
      </Animated.View>

      <ZonePad zone={station.leftZone} active={leftActive} label="L" />
      <ZonePad zone={station.rightZone} active={rightActive} label="R" />

      {working && holdProgress > 0 && (
        <View style={[styles.ringWrap, { left: `${center.x * 100}%`, top: `${(center.y - 0.12) * 100}%` }]}>
          <Svg width={110} height={110}>
            <Circle cx={55} cy={55} r={48} stroke="rgba(255,255,255,0.12)" strokeWidth={3} fill="none" />
            <Circle
              cx={55}
              cy={55}
              r={48}
              stroke={FORGE_SHELL.good}
              strokeWidth={4}
              fill="none"
              strokeDasharray={`${2 * Math.PI * 48}`}
              strokeDashoffset={`${2 * Math.PI * 48 * (1 - holdProgress)}`}
              strokeLinecap="round"
              rotation={-90}
              origin="55, 55"
            />
          </Svg>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  object: {
    position: 'absolute',
    marginLeft: -48,
    marginTop: -48,
    width: 96,
    height: 96,
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: 'rgba(28,25,23,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  objectEmoji: { fontSize: 36 },
  objectLabel: { marginTop: 4, fontSize: 9, fontWeight: '900', letterSpacing: 0.3 },
  zone: {
    position: 'absolute',
    width: 64,
    height: 64,
    marginLeft: -32,
    marginTop: -32,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(251,191,36,0.45)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(249,115,22,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneActive: {
    borderColor: FORGE_SHELL.good,
    borderStyle: 'solid',
    backgroundColor: 'rgba(52,211,153,0.2)',
  },
  zoneLabel: { color: FORGE_SHELL.gold, fontSize: 12, fontWeight: '900' },
  ringWrap: { position: 'absolute', marginLeft: -55, marginTop: -55 },
});
