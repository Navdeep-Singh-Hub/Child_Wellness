import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { buildBezierPaths, distanceToBezier } from '@/components/game/occupational/level2/session2/traceUtils';
import { SESSION2_PACING } from '@/components/game/occupational/level3/session2/session2Pacing';

type Props = {
  curved: boolean;
  narrow: boolean;
  stroke: number;
  tolerance: number;
  accent: string;
  active: boolean;
  onProgress: (pct: number, accuracy: number, smoothness: number) => void;
  onComplete: (accuracy: number, smoothness: number) => void;
  onExit: () => void;
  onLayout: (w: number, h: number) => void;
};

export function RoadTraceView({
  curved,
  narrow,
  stroke,
  tolerance,
  accent,
  active,
  onProgress,
  onComplete,
  onExit,
  onLayout,
}: Props) {
  const P = SESSION2_PACING;
  const screen = React.useRef({ w: 400, h: 360 });
  const tracing = React.useRef(false);
  const progressRef = React.useRef(0);
  const samples = React.useRef<number[]>([]);
  const offTrackCount = React.useRef(0);
  const doneRef = React.useRef(false);

  const sx = useSharedValue(12);
  const sy = useSharedValue(50);
  const c1x = useSharedValue(curved ? 35 : 40);
  const c1y = useSharedValue(curved ? 28 : 50);
  const c2x = useSharedValue(curved ? 65 : 60);
  const c2y = useSharedValue(curved ? 72 : 50);
  const ex = useSharedValue(88);
  const ey = useSharedValue(50);
  const ox = useSharedValue(12);
  const oy = useSharedValue(50);
  const oScale = useSharedValue(1);

  const [pathFull, setPathFull] = React.useState('');
  const [pathProg, setPathProg] = React.useState('');
  const [tracePct, setTracePct] = React.useState(0);

  const refreshPaths = React.useCallback(
    (prog: number) => {
      const { full, progressPath } = buildBezierPaths(
        sx.value,
        sy.value,
        c1x.value,
        c1y.value,
        c2x.value,
        c2y.value,
        ex.value,
        ey.value,
        prog,
      );
      setPathFull(full);
      setPathProg(progressPath);
    },
    [c1x, c1y, c2x, c2y, ex, ey, sx, sy],
  );

  React.useEffect(() => {
    if (curved) {
      sy.value = 38 + Math.random() * 22;
      c1y.value = sy.value - 12 - Math.random() * 6;
      c2y.value = sy.value + 12 + Math.random() * 6;
      ey.value = sy.value;
    } else {
      sy.value = 50;
      c1y.value = 50;
      c2y.value = 50;
      ey.value = 50;
    }
    ox.value = sx.value;
    oy.value = sy.value;
    progressRef.current = 0;
    samples.current = [];
    offTrackCount.current = 0;
    doneRef.current = false;
    tracing.current = false;
    setTracePct(0);
    refreshPaths(0);
  }, [curved, narrow, refreshPaths, c1y, c2y, ey, ox, oy, sy]);

  const carStyle = useAnimatedStyle(() => ({
    left: `${ox.value}%`,
    top: `${oy.value}%`,
    transform: [{ translateX: -16 }, { translateY: -16 }, { scale: oScale.value }],
  }));

  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(active)
    .onStart((e) => {
      if (doneRef.current) return;
      const nx = (e.x / screen.current.w) * 100;
      const ny = (e.y / screen.current.h) * 100;
      const { dist } = distanceToBezier(nx, ny, sx.value, sy.value, c1x.value, c1y.value, c2x.value, c2y.value, ex.value, ey.value);
      if (dist <= tolerance + stroke * 0.08) {
        tracing.current = true;
        oScale.value = withSpring(1.15);
      }
    })
    .onUpdate((e) => {
      if (!tracing.current || doneRef.current) return;
      const nx = Math.max(4, Math.min(96, (e.x / screen.current.w) * 100));
      const ny = Math.max(6, Math.min(94, (e.y / screen.current.h) * 100));
      const { dist, t } = distanceToBezier(nx, ny, sx.value, sy.value, c1x.value, c1y.value, c2x.value, c2y.value, ex.value, ey.value);
      const limit = tolerance + (narrow ? 0 : 1.5);
      if (dist > limit) {
        offTrackCount.current += 1;
        tracing.current = false;
        progressRef.current = 0;
        setTracePct(0);
        refreshPaths(0);
        onExit();
        return;
      }
      samples.current.push(dist);
      if (t > progressRef.current) {
        progressRef.current = t;
        const pct = Math.round(t * 100);
        setTracePct(pct);
        refreshPaths(t);
        const acc = Math.max(0, 100 - Math.round(dist * 8));
        const smooth =
          samples.current.length > 2
            ? Math.max(0, 100 - Math.round(offTrackCount.current * 12))
            : 100;
        onProgress(pct, acc, smooth);
        if (pct >= P.pathCompletePct && !doneRef.current) {
          doneRef.current = true;
          tracing.current = false;
          oScale.value = withSpring(1);
          const avgDist =
            samples.current.reduce((a, b) => a + b, 0) / Math.max(samples.current.length, 1);
          const accuracy = Math.max(0, Math.round(100 - avgDist * 10));
          const smoothness = Math.max(0, 100 - offTrackCount.current * 15);
          onComplete(accuracy, smoothness);
        }
      }
      ox.value = nx;
      oy.value = ny;
    })
    .onEnd(() => {
      oScale.value = withSpring(1);
      if (!doneRef.current && progressRef.current < P.pathCompletePct / 100) {
        tracing.current = false;
      }
    });

  const roadColor = narrow ? 'rgba(139,92,246,0.45)' : 'rgba(59,130,246,0.45)';
  const roadStroke = narrow ? stroke : stroke + 8;

  return (
    <View
      style={styles.area}
      onLayout={(e) => {
        screen.current = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height };
        onLayout(screen.current.w, screen.current.h);
      }}
    >
      <GestureDetector gesture={pan}>
        <View style={StyleSheet.absoluteFill}>
          <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <Path d={pathFull} stroke={roadColor} strokeWidth={roadStroke / 10} fill="none" strokeLinecap="round" />
            <Path d={pathProg} stroke={accent} strokeWidth={(roadStroke + 4) / 10} fill="none" strokeLinecap="round" />
            <Circle cx={sx.value} cy={sy.value} r={2.2} fill="#22C55E" />
            <Circle cx={ex.value} cy={ey.value} r={2.2} fill="#EF4444" />
          </Svg>
          <Animated.View style={[styles.car, carStyle]}>
            <Text style={styles.carEmoji}>🚗</Text>
          </Animated.View>
        </View>
      </GestureDetector>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${tracePct}%`, backgroundColor: accent }]} />
      </View>
      <Text style={styles.roadLabel}>{narrow ? 'Narrow road' : 'Wide road'}{curved ? ' · Curvy' : ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    width: '100%',
    height: 360,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.38)',
    overflow: 'hidden',
  },
  car: {
    position: 'absolute',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  carEmoji: { fontSize: 26 },
  progressBg: {
    position: 'absolute',
    bottom: 10,
    left: 14,
    right: 14,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  roadLabel: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
});
