import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { AURORA, GAME1_CONFIG } from './theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const R = 28;
const CIRC = 2 * Math.PI * R;

interface MagicMeterProps {
  strokes: number;
}

export function MagicMeter({ strokes }: MagicMeterProps) {
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);
  const goal = GAME1_CONFIG.minStrokes;
  const pct = Math.min(1, strokes / goal);
  const ready = strokes >= goal;

  useEffect(() => {
    progress.value = withTiming(pct, { duration: 400, easing: Easing.out(Easing.cubic) });
    if (strokes > 0 && strokes < goal) {
      scale.value = withSpring(1.12, { damping: 8 }, () => {
        scale.value = withSpring(1);
      });
    }
  }, [pct, progress, scale, strokes, goal]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRC * (1 - progress.value),
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.wrap, containerStyle]} accessibilityLabel={`${strokes} of ${goal} strokes`}>
      <Svg width={68} height={68} style={styles.svg}>
        <Circle cx={34} cy={34} r={R} stroke="rgba(255,255,255,0.15)" strokeWidth={5} fill="none" />
        <AnimatedCircle
          cx={34}
          cy={34}
          r={R}
          stroke={ready ? AURORA.auroraGreen : AURORA.gold}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          animatedProps={ringProps}
          rotation={-90}
          origin="34, 34"
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.count, ready && styles.countReady]}>{strokes}</Text>
        <Text style={styles.label}>/{goal}</Text>
      </View>
      {ready ? <Text style={styles.readyBadge}>✓</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 68, height: 68, alignItems: 'center', justifyContent: 'center' },
  svg: { position: 'absolute' },
  center: { flexDirection: 'row', alignItems: 'baseline' },
  count: { fontSize: 20, fontWeight: '900', color: AURORA.gold },
  countReady: { color: AURORA.auroraGreen },
  label: { fontSize: 12, fontWeight: '700', color: AURORA.textMuted },
  readyBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    fontSize: 14,
    backgroundColor: AURORA.auroraGreen,
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: 'center',
    lineHeight: 22,
    overflow: 'hidden',
    color: '#FFF',
    fontWeight: '800',
  },
});
