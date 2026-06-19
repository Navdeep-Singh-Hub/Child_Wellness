/** Beat the Clock visuals — OT L5 S2 Game 5 */
import { TIMED_TARGET_THEME as T } from '@/components/game/occupational/level5/session2/timedTarget/timedTargetTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

export function RaceTrackBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.checkerTop}>
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={[styles.checker, i % 2 === 0 ? styles.checkerDark : styles.checkerLight]} />
        ))}
      </View>
      <View style={styles.lane}>
        <View style={styles.laneDash} />
        <View style={[styles.laneDash, { marginTop: 40 }]} />
        <View style={[styles.laneDash, { marginTop: 40 }]} />
      </View>
      <Text style={styles.finishFlag}>🏁</Text>
    </View>
  );
}

export function TimerRing({ percent, size = 88 }: { percent: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const color = percent > 50 ? '#10B981' : percent > 25 ? '#EAB308' : '#EF4444';

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(0,0,0,0.08)" strokeWidth={5} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={5}
          fill="none"
          strokeDasharray={`${circ}`}
          strokeDashoffset={circ * (1 - percent / 100)}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
    </View>
  );
}

export function PulsingTarget({ x, y, scale, timePercent }: { x: number; y: number; scale: number; timePercent: number }) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    const urgency = timePercent < 30 ? 400 : 700;
    pulse.value = withRepeat(withTiming(1.08, { duration: urgency, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse, timePercent]);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale * pulse.value }] }));
  const ringColor = timePercent > 50 ? '#10B981' : timePercent > 25 ? '#EAB308' : '#EF4444';

  return (
    <Animated.View style={[{ position: 'absolute', left: x - 44, top: y - 44, width: 88, height: 88, alignItems: 'center', justifyContent: 'center' }, animStyle]}>
      <TimerRing percent={timePercent} size={88} />
      <View style={[styles.targetCore, { borderColor: ringColor }]}>
        <Text style={styles.targetEmoji}>🎯</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  checkerTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 28, flexDirection: 'row' },
  checker: { flex: 1, height: 28 },
  checkerDark: { backgroundColor: '#064E3B' },
  checkerLight: { backgroundColor: '#fff' },
  lane: { position: 'absolute', alignSelf: 'center', top: '35%', width: 4, height: '45%' },
  laneDash: { width: 4, height: 24, backgroundColor: 'rgba(6,78,59,0.2)', borderRadius: 2 },
  finishFlag: { position: 'absolute', bottom: 24, right: 20, fontSize: 32 },
  targetCore: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#10B981',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  targetEmoji: { fontSize: 30 },
});
