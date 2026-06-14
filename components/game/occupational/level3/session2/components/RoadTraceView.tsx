import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { buildBezierPaths, distanceToBezier } from '@/components/game/occupational/level2/session2/traceUtils';
import { SESSION2_PACING } from '@/components/game/occupational/level3/session2/session2Pacing';

type Props = {
  roundKey: number;
  curved: boolean;
  narrow: boolean;
  stroke: number;
  tolerance: number;
  accent: string;
  active: boolean;
  onProgress: (pct: number, accuracy: number, smoothness: number) => void;
  onComplete: (accuracy: number, smoothness: number) => void;
  onFail: () => void;
  onLayout: (w: number, h: number) => void;
};

function pointOnBezier(
  t: number,
  x1: number,
  y1: number,
  cx1: number,
  cy1: number,
  cx2: number,
  cy2: number,
  x2: number,
  y2: number,
) {
  const mt = 1 - t;
  return {
    x: mt ** 3 * x1 + 3 * mt ** 2 * t * cx1 + 3 * mt * t ** 2 * cx2 + t ** 3 * x2,
    y: mt ** 3 * y1 + 3 * mt ** 2 * t * cy1 + 3 * mt * t ** 2 * cy2 + t ** 3 * y2,
  };
}

export function RoadTraceView({
  roundKey,
  curved,
  narrow,
  stroke,
  tolerance,
  accent,
  active,
  onProgress,
  onComplete,
  onFail,
  onLayout,
}: Props) {
  const P = SESSION2_PACING;
  const screen = React.useRef({ w: 400, h: 360 });
  const tracing = React.useRef(false);
  const progressRef = React.useRef(0);
  const samples = React.useRef<number[]>([]);
  const offTrackCount = React.useRef(0);
  const doneRef = React.useRef(false);
  const lastWarn = React.useRef(0);
  const offTrackRef = React.useRef(false);

  const sx = useSharedValue(12);
  const sy = useSharedValue(50);
  const c1x = useSharedValue(40);
  const c1y = useSharedValue(50);
  const c2x = useSharedValue(60);
  const c2y = useSharedValue(50);
  const ex = useSharedValue(88);
  const ey = useSharedValue(50);
  const ox = useSharedValue(12);
  const oy = useSharedValue(50);
  const oScale = useSharedValue(1);

  const [pathFull, setPathFull] = React.useState('');
  const [pathProg, setPathProg] = React.useState('');
  const [tracePct, setTracePct] = React.useState(0);
  const [isOffTrack, setIsOffTrack] = React.useState(false);
  const [markers, setMarkers] = React.useState({ sx: 12, sy: 50, ex: 88, ey: 50 });

  const roadStroke = narrow ? stroke : stroke + 2;
  const surfaceStroke = roadStroke + (narrow ? 5 : 10);
  const lineTolerance = tolerance + roadStroke * 0.35;

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

  const resetRound = React.useCallback(() => {
    if (curved) {
      sy.value = 38 + Math.random() * 22;
      c1x.value = 32 + Math.random() * 8;
      c1y.value = sy.value - 14 - Math.random() * 8;
      c2x.value = 60 + Math.random() * 8;
      c2y.value = sy.value + 14 + Math.random() * 8;
      ey.value = sy.value;
    } else {
      sy.value = 50;
      c1x.value = 40;
      c1y.value = 50;
      c2x.value = 60;
      c2y.value = 50;
      ey.value = 50;
    }

    ox.value = withSpring(sx.value, { damping: 14, stiffness: 180 });
    oy.value = withSpring(sy.value, { damping: 14, stiffness: 180 });
    oScale.value = withSpring(1);
    progressRef.current = 0;
    samples.current = [];
    offTrackCount.current = 0;
    doneRef.current = false;
    tracing.current = false;
    lastWarn.current = 0;
    offTrackRef.current = false;
    setIsOffTrack(false);
    setTracePct(0);
    setMarkers({ sx: sx.value, sy: sy.value, ex: ex.value, ey: ey.value });
    refreshPaths(0);
  }, [curved, oScale, ox, oy, refreshPaths, c1x, c1y, c2x, c2y, ey, sy]);

  React.useEffect(() => {
    resetRound();
  }, [roundKey, narrow, curved, resetRound]);

  const carStyle = useAnimatedStyle(() => ({
    left: `${ox.value}%`,
    top: `${oy.value}%`,
    transform: [{ translateX: -18 }, { translateY: -18 }, { scale: oScale.value }],
  }));

  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(active)
    .onStart((e) => {
      if (doneRef.current) return;
      const nx = (e.x / screen.current.w) * 100;
      const ny = (e.y / screen.current.h) * 100;
      const { dist } = distanceToBezier(
        nx,
        ny,
        sx.value,
        sy.value,
        c1x.value,
        c1y.value,
        c2x.value,
        c2y.value,
        ex.value,
        ey.value,
      );
      if (dist <= lineTolerance + 2) {
        tracing.current = true;
        oScale.value = withSpring(1.12);
      }
    })
    .onUpdate((e) => {
      if (!tracing.current || doneRef.current) return;
      const nx = Math.max(4, Math.min(96, (e.x / screen.current.w) * 100));
      const ny = Math.max(6, Math.min(94, (e.y / screen.current.h) * 100));
      const { dist, t } = distanceToBezier(
        nx,
        ny,
        sx.value,
        sy.value,
        c1x.value,
        c1y.value,
        c2x.value,
        c2y.value,
        ex.value,
        ey.value,
      );

      if (dist > lineTolerance) {
        offTrackCount.current += 1;
        tracing.current = false;
        offTrackRef.current = true;
        setIsOffTrack(true);
        const now = Date.now();
        if (now - lastWarn.current > P.pathWarnIntervalMs) {
          lastWarn.current = now;
        }
        return;
      }

      setIsOffTrack(false);
      offTrackRef.current = false;
      samples.current.push(dist);
      const onPath = pointOnBezier(t, sx.value, sy.value, c1x.value, c1y.value, c2x.value, c2y.value, ex.value, ey.value);
      ox.value = onPath.x;
      oy.value = onPath.y;

      if (t > progressRef.current) {
        progressRef.current = t;
        const pct = Math.round(t * 100);
        setTracePct(pct);
        refreshPaths(t);
        const acc = Math.max(0, 100 - Math.round(dist * 8));
        const smooth =
          samples.current.length > 2
            ? Math.max(0, 100 - Math.round(offTrackCount.current * 10))
            : 100;
        onProgress(pct, acc, smooth);

        if (pct >= P.pathCompletePct && !doneRef.current) {
          doneRef.current = true;
          tracing.current = false;
          oScale.value = withSpring(1);
          const avgDist =
            samples.current.reduce((a, b) => a + b, 0) / Math.max(samples.current.length, 1);
          const accuracy = Math.max(0, Math.round(100 - avgDist * 10));
          const smoothness = Math.max(0, 100 - offTrackCount.current * 12);
          onComplete(accuracy, smoothness);
        }
      }
    })
    .onEnd(() => {
      oScale.value = withSpring(1);
      if (doneRef.current) return;

      const endDist = Math.hypot(ox.value - ex.value, oy.value - ey.value);
      const reachedEnd =
        endDist <= P.pathEndTolerance && progressRef.current >= P.pathMinProgress && !offTrackRef.current;

      if (reachedEnd && !doneRef.current) {
        doneRef.current = true;
        const avgDist =
          samples.current.reduce((a, b) => a + b, 0) / Math.max(samples.current.length, 1);
        const accuracy = Math.max(0, Math.round(100 - avgDist * 10));
        const smoothness = Math.max(0, 100 - offTrackCount.current * 12);
        onComplete(accuracy, smoothness);
        return;
      }

      if (progressRef.current < P.pathMinProgress) {
        tracing.current = false;
        progressRef.current = 0;
        setTracePct(0);
        refreshPaths(0);
        ox.value = withSpring(sx.value, { damping: 14, stiffness: 180 });
        oy.value = withSpring(sy.value, { damping: 14, stiffness: 180 });
        offTrackRef.current = false;
        setIsOffTrack(false);
        onFail();
      }
    });

  const roadSurface = narrow ? 'rgba(139,92,246,0.35)' : 'rgba(59,130,246,0.35)';
  const roadLine = narrow ? '#8B5CF6' : accent;

  return (
    <View
      style={styles.area}
      onLayout={(e) => {
        screen.current = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height };
        onLayout(screen.current.w, screen.current.h);
      }}
    >
      <View style={styles.progressWrap}>
        <Text style={styles.progressLabel}>{tracePct}%</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${tracePct}%`, backgroundColor: accent }]} />
        </View>
      </View>

      <Text style={styles.roadLabel}>
        {narrow ? 'Narrow road' : 'Wide road'}
        {curved ? ' · Curvy' : ''}
      </Text>

      <GestureDetector gesture={pan}>
        <View style={styles.traceArea}>
          <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <Defs>
              <SvgLinearGradient id="roadSurfaceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={roadSurface} />
                <Stop offset="100%" stopColor={roadSurface} />
              </SvgLinearGradient>
            </Defs>
            {pathFull ? (
              <>
                <Path
                  d={pathFull}
                  stroke="url(#roadSurfaceGrad)"
                  strokeWidth={surfaceStroke}
                  fill="none"
                  strokeLinecap="round"
                />
                <Path
                  d={pathFull}
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth={surfaceStroke - 2}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={narrow ? '2 2' : '4 3'}
                />
                <Path
                  d={pathFull}
                  stroke={roadLine}
                  strokeWidth={roadStroke}
                  fill="none"
                  strokeLinecap="round"
                />
              </>
            ) : null}
            {pathProg ? (
              <>
                <Path
                  d={pathProg}
                  stroke="rgba(255,255,255,0.75)"
                  strokeWidth={roadStroke + 3}
                  fill="none"
                  strokeLinecap="round"
                />
                <Path
                  d={pathProg}
                  stroke={accent}
                  strokeWidth={roadStroke + 1}
                  fill="none"
                  strokeLinecap="round"
                />
              </>
            ) : null}
            <Circle cx={markers.sx} cy={markers.sy} r={3.2} fill="#22C55E" stroke="#fff" strokeWidth={1} />
            <Circle cx={markers.ex} cy={markers.ey} r={3.2} fill="#EF4444" stroke="#fff" strokeWidth={1} />
          </Svg>
          <Animated.View style={[styles.car, carStyle, isOffTrack && styles.carOffTrack]}>
            <Text style={styles.carEmoji}>🚗</Text>
          </Animated.View>
          {isOffTrack && (
            <View style={styles.warnPill}>
              <Text style={styles.warnText}>Stay on the road!</Text>
            </View>
          )}
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    width: '100%',
    flex: 1,
    minHeight: 320,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.38)',
    overflow: 'hidden',
  },
  progressWrap: {
    position: 'absolute',
    top: 10,
    left: 14,
    right: 14,
    zIndex: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressLabel: {
    width: 36,
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textAlign: 'right',
  },
  progressBg: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  roadLabel: {
    position: 'absolute',
    top: 34,
    alignSelf: 'center',
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    backgroundColor: 'rgba(255,255,255,0.82)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 5,
  },
  traceArea: {
    flex: 1,
    marginTop: 56,
    marginBottom: 12,
    marginHorizontal: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.55)',
    overflow: 'hidden',
  },
  car: {
    position: 'absolute',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  carOffTrack: { opacity: 0.75 },
  carEmoji: { fontSize: 28 },
  warnPill: {
    position: 'absolute',
    top: '12%',
    alignSelf: 'center',
    left: '18%',
    right: '18%',
    backgroundColor: 'rgba(239,68,68,0.92)',
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    zIndex: 6,
  },
  warnText: { color: '#fff', fontSize: 13, fontWeight: '900' },
});
