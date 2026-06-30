/**
 * Visual layer for Zigzag Run — neon circuit board, path trace, runner orb.
 */
import { SESSION5_1_PACING as P } from '@/components/game/occupational/level5/session1/session1Pacing';
import { ZIGZAG_RUN_COPY as COPY, ZIGZAG_RUN_THEME as T } from '@/components/game/occupational/level5/session1/zigzagRun/zigzagRunTheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

const HALF = P.targetHalfPx;
const PAD = HALF + 8;

export type TrailPoint = { x: number; y: number; opacity: number };
export type TapRippleData = { id: number; x: number; y: number; kind: 'hit' | 'miss' | 'near' };

function zigzagY(x: number, h: number) {
  return h * 0.5 + Math.sin(x * P.zigzagFrequency) * P.zigzagAmplitudePx;
}

function buildPathD(w: number, h: number) {
  const step = 5;
  let d = '';
  for (let x = PAD; x <= w - PAD; x += step) {
    const y = zigzagY(x, h);
    d += x === PAD ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return d;
}

function buildNodes(w: number, h: number) {
  const nodes: { x: number; y: number; kind: 'peak' | 'valley' }[] = [];
  const step = 3;
  let prevY = zigzagY(PAD, h);
  let trend: 'up' | 'down' | null = null;

  for (let x = PAD + step; x <= w - PAD; x += step) {
    const y = zigzagY(x, h);
    const dir = y > prevY ? 'up' : y < prevY ? 'down' : trend;
    if (trend && dir && dir !== trend) {
      nodes.push({ x: x - step / 2, y: prevY, kind: trend === 'up' ? 'peak' : 'valley' });
    }
    if (dir) trend = dir;
    prevY = y;
  }
  return nodes;
}

// ─── Intro ──────────────────────────────────────────────────────────────────

type InfoProps = { onStart: () => void; onBack: () => void };

function IntroRunner() {
  const phase = useSharedValue(0);
  useEffect(() => {
    phase.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [phase]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(phase.value, [0, 1], [-55, 55]) },
      { translateY: interpolate(phase.value, [0, 0.5, 1], [18, -18, 18]) },
    ],
  }));

  return (
    <Animated.View style={[styles.introRunnerWrap, style]}>
      <RunnerOrb size={56} pulse />
    </Animated.View>
  );
}

export function ZigzagRunInfoScreen({ onStart, onBack }: InfoProps) {
  const cardOp = useSharedValue(0);
  const cardY = useSharedValue(36);

  useEffect(() => {
    cardOp.value = withTiming(1, { duration: 550 });
    cardY.value = withSpring(0, { damping: 15, stiffness: 110 });
  }, [cardOp, cardY]);

  const cardAnim = useAnimatedStyle(() => ({
    opacity: cardOp.value,
    transform: [{ translateY: cardY.value }],
  }));

  return (
    <View style={styles.infoRoot}>
      <LinearGradient colors={[...T.board]} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
      <CircuitGrid />
      <IntroPathPreview />
      <IntroRunner />

      <Animated.View style={[styles.infoCard, cardAnim]}>
        <Text style={styles.infoEmoji}>{COPY.emoji}</Text>
        <Text style={styles.infoTitle}>{COPY.title}</Text>
        <Text style={styles.infoTagline}>Neon Circuit · Line Tracking</Text>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionLabel}>How to play</Text>
          <Text style={styles.infoBody}>{COPY.introDescription}</Text>
        </View>

        <View style={styles.chipRow}>
          {COPY.skills.slice(0, 3).map((chip) => (
            <View key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={['#C4B5FD', '#8B5CF6', '#6D28D9', '#5B21B6']} style={styles.startBtnGrad}>
            <Text style={styles.startBtnText}>〰️ Enter the Circuit</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoBackBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.infoBackText}>← Back to games</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function IntroPathPreview() {
  const glow = useSharedValue(0.4);
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(withTiming(1, { duration: 1200 }), withTiming(0.35, { duration: 1200 })),
      -1,
      false,
    );
  }, [glow]);

  const style = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <Animated.View style={[styles.introPathWrap, style]} pointerEvents="none">
      <Svg width={280} height={80} viewBox="0 0 280 80">
        <Path
          d="M 10 40 L 50 15 L 90 65 L 130 15 L 170 65 L 210 15 L 250 40"
          stroke={T.pathCore}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.6}
        />
        <Path
          d="M 10 40 L 50 15 L 90 65 L 130 15 L 170 65 L 210 15 L 250 40"
          stroke={T.runner}
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />
      </Svg>
    </Animated.View>
  );
}

// ─── Circuit backdrop ───────────────────────────────────────────────────────

export function CircuitBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.board]} locations={[0, 0.4, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <CircuitGrid />
      <CircuitTraces />
      <LinearGradient colors={['transparent', 'rgba(10,10,15,0.45)']} style={styles.vignette} />
    </View>
  );
}

function CircuitGrid() {
  const lines = useMemo(() => {
    const hLines = Array.from({ length: 12 }).map((_, i) => ({ top: `${(i + 1) * 8}%` }));
    const vLines = Array.from({ length: 10 }).map((_, i) => ({ left: `${(i + 1) * 10}%` }));
    return { hLines, vLines };
  }, []);

  return (
    <>
      {lines.hLines.map((l, i) => (
        <View key={`h${i}`} style={[styles.gridLineH, { top: l.top }]} />
      ))}
      {lines.vLines.map((l, i) => (
        <View key={`v${i}`} style={[styles.gridLineV, { left: l.left }]} />
      ))}
    </>
  );
}

function CircuitTraces() {
  return (
    <>
      <View style={[styles.traceDecor, { top: '8%', left: '3%', width: '40%', transform: [{ rotate: '-8deg' }] }]} />
      <View style={[styles.traceDecor, { bottom: '12%', right: '5%', width: '35%', transform: [{ rotate: '6deg' }] }]} />
    </>
  );
}

// ─── Path trace & nodes ─────────────────────────────────────────────────────

export function PathTrace({ width, height }: { width: number; height: number }) {
  const pathD = useMemo(() => (width > 80 ? buildPathD(width, height) : ''), [width, height]);
  const pulse = useSharedValue(0.5);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(0.85, { duration: 1400 }), withTiming(0.4, { duration: 1400 })),
      -1,
      false,
    );
  }, [pulse]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  if (!pathD) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, glowStyle]} pointerEvents="none">
      <Svg width={width} height={height}>
        <Path d={pathD} stroke={T.pathGlow} strokeWidth={10} fill="none" strokeLinecap="round" />
        <Path d={pathD} stroke={T.pathCore} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeDasharray="8 6" />
      </Svg>
    </Animated.View>
  );
}

export function PathNodes({ width, height }: { width: number; height: number }) {
  const nodes = useMemo(() => (width > 80 ? buildNodes(width, height) : []), [width, height]);

  if (!nodes.length) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        {nodes.map((n, i) => (
          <Circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={n.kind === 'peak' ? 5 : 4}
            fill={n.kind === 'peak' ? T.pathNode : T.pathActive}
            opacity={0.55}
          />
        ))}
      </Svg>
    </View>
  );
}

// ─── Runner orb ───────────────────────────────────────────────────────────────

function RunnerOrb({ size, pulse }: { size: number; pulse?: boolean }) {
  const glow = useSharedValue(0.6);
  useEffect(() => {
    if (!pulse) return;
    glow.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.5, { duration: 700 })),
      -1,
      false,
    );
  }, [pulse, glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 0.9 + glow.value * 0.15 }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size * 1.6,
            height: size * 1.6,
            borderRadius: size * 0.8,
            backgroundColor: T.runnerGlow,
          },
          glowStyle,
        ]}
      />
      <LinearGradient
        colors={[T.runnerCore, T.runner, '#0891B2']}
        style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: T.runnerCore }}
      />
      <View style={[styles.runnerCore, { width: size * 0.35, height: size * 0.35, borderRadius: size * 0.175 }]} />
    </View>
  );
}

export function NeonRunnerView({
  x,
  y,
  scale,
  trail,
  showAimRing,
}: {
  x: number;
  y: number;
  scale: number;
  trail: TrailPoint[];
  showAimRing?: boolean;
}) {
  const size = HALF * 2;

  return (
    <>
      {trail.map((pt, i) => (
        <View
          key={`t${i}`}
          pointerEvents="none"
          style={[
            styles.trailDot,
            {
              left: pt.x - 4,
              top: pt.y - 4,
              opacity: pt.opacity * 0.7,
              width: 8 - i * 0.5,
              height: 8 - i * 0.5,
              borderRadius: 4,
            },
          ]}
        />
      ))}

      {showAimRing && (
        <View
          pointerEvents="none"
          style={[
            styles.aimRing,
            {
              left: x - HALF - 14,
              top: y - HALF - 14,
              width: (HALF + 14) * 2,
              height: (HALF + 14) * 2,
              borderRadius: HALF + 14,
            },
          ]}
        />
      )}

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: x - HALF,
          top: y - HALF,
          transform: [{ scale }],
        }}
      >
        <RunnerOrb size={size} pulse />
      </View>
    </>
  );
}

// ─── Tap ripples ──────────────────────────────────────────────────────────────

function TapRipple({ x, y, kind }: { x: number; y: number; kind: TapRippleData['kind'] }) {
  const expand = useSharedValue(0);
  useEffect(() => {
    expand.value = withTiming(1, { duration: 550, easing: Easing.out(Easing.cubic) });
  }, [expand]);

  const color = kind === 'hit' ? T.success : kind === 'near' ? T.nearMiss : T.miss;
  const border = kind === 'hit' ? T.successGlow : kind === 'near' ? T.nearMissGlow : 'rgba(148,163,184,0.2)';

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x - 28,
    top: y - 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: border,
    backgroundColor: color,
    opacity: 1 - expand.value,
    transform: [{ scale: 0.35 + expand.value * 1.7 }],
    zIndex: 20,
  }));

  return <Animated.View style={style} pointerEvents="none" />;
}

export function TapRippleLayer({ ripples }: { ripples: TapRippleData[] }) {
  return (
    <>
      {ripples.map((r) => (
        <TapRipple key={r.id} x={r.x} y={r.y} kind={r.kind} />
      ))}
    </>
  );
}

// ─── Celebration ─────────────────────────────────────────────────────────────

export function CircuitCelebration({ visible, x, y }: { visible: boolean; x: number; y: number }) {
  const burst = useSharedValue(0);
  useEffect(() => {
    if (!visible) return;
    burst.value = withSpring(1, { damping: 7, stiffness: 180 });
  }, [visible, burst]);

  if (!visible) return null;

  const bannerStyle = useAnimatedStyle(() => ({
    opacity: burst.value,
    transform: [{ scale: interpolate(burst.value, [0, 1], [0.4, 1]) }],
  }));

  const sparks = Array.from({ length: 10 });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.electricBurst, { left: x - 45, top: y - 45 }]} />
      <Animated.View style={[styles.celebrateBanner, { left: x - 68, top: y - HALF - 48 }, bannerStyle]}>
        <LinearGradient colors={['#EDE9FE', '#C4B5FD', '#8B5CF6']} style={styles.celebrateGrad}>
          <Text style={styles.celebrateText}>⚡ Synced!</Text>
        </LinearGradient>
      </Animated.View>
      {sparks.map((_, i) => (
        <ElectricSpark key={i} i={i} x={x} y={y} go={visible} />
      ))}
    </View>
  );
}

function ElectricSpark({ i, x, y, go }: { i: number; x: number; y: number; go: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (!go) return;
    t.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [go, t]);

  const style = useAnimatedStyle(() => {
    const angle = (i / 10) * Math.PI * 2;
    const r = 14 + 52 * t.value;
    return {
      position: 'absolute',
      left: x + Math.cos(angle) * r - 3,
      top: y + Math.sin(angle) * r - 3,
      width: 6,
      height: 6,
      borderRadius: 1,
      backgroundColor: i % 2 === 0 ? T.runner : T.electric,
      opacity: 1 - t.value,
      transform: [{ rotate: `${angle}rad` }, { scale: 1.3 - t.value * 0.7 }],
    };
  });

  return <Animated.View style={style} />;
}

// ─── Near miss ────────────────────────────────────────────────────────────────

export function NearMissToast({ show }: { show: boolean }) {
  const op = useSharedValue(0);
  const y = useSharedValue(10);
  useEffect(() => {
    if (!show) return;
    op.value = withSequence(withTiming(1, { duration: 140 }), withDelay(500, withTiming(0, { duration: 200 })));
    y.value = withSpring(0, { damping: 14, stiffness: 180 });
  }, [show, op, y]);

  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: y.value }] }));
  if (!show) return null;

  return (
    <Animated.View style={[styles.nearMissToast, style]} pointerEvents="none">
      <Text style={styles.nearMissText}>〰️ Almost!</Text>
    </Animated.View>
  );
}

// ─── HUD ────────────────────────────────────────────────────────────────────

type HudProps = {
  round: number;
  totalRounds: number;
  score: number;
  hint: string;
  showHint: boolean;
};

export function ZigzagRunHUD({ round, totalRounds, score, hint, showHint }: HudProps) {
  const scorePop = useSharedValue(1);
  const prevScore = useRef(score);

  useEffect(() => {
    if (score > prevScore.current) {
      scorePop.value = withSequence(
        withSpring(1.35, { damping: 6, stiffness: 280 }),
        withSpring(1, { damping: 10, stiffness: 200 }),
      );
    }
    prevScore.current = score;
  }, [score, scorePop]);

  const scoreBump = useAnimatedStyle(() => ({ transform: [{ scale: scorePop.value }] }));
  const Glass = Platform.OS === 'ios' ? BlurView : View;
  const glassProps = Platform.OS === 'ios' ? { intensity: 35, tint: 'dark' as const } : {};

  return (
    <View style={styles.hudWrap} pointerEvents="none">
      <Glass {...glassProps} style={styles.hudGlass}>
        <View style={styles.hudRow}>
          <View>
            <Text style={styles.hudLabel}>LAP</Text>
            <Text style={styles.hudRound}>
              {round}
              <Text style={styles.hudRoundTotal}>/{totalRounds}</Text>
            </Text>
          </View>
          <View style={styles.hudCenter}>
            <Text style={styles.hudTitle}>〰️ Zigzag Run</Text>
            <View style={styles.lapDots}>
              {Array.from({ length: totalRounds }).map((_, i) => (
                <View key={i} style={[styles.dot, i < score && styles.dotDone, i === round - 1 && styles.dotActive]} />
              ))}
            </View>
          </View>
          <Animated.View style={[styles.scoreBox, scoreBump]}>
            <Text style={styles.scoreLabel}>SYNC</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </Animated.View>
        </View>
        {showHint && hint ? (
          <View style={styles.hintPill}>
            <Text style={styles.hudHint}>{hint}</Text>
          </View>
        ) : null}
      </Glass>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  infoRoot: { flex: 1 },
  introRunnerWrap: { position: 'absolute', top: '22%', alignSelf: 'center', zIndex: 2 },
  introPathWrap: { position: 'absolute', top: '28%', alignSelf: 'center' },
  infoCard: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 28,
    backgroundColor: T.hudGlass,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1.5,
    borderColor: T.hudBorder,
    alignItems: 'center',
    shadowColor: T.accent,
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  infoEmoji: { fontSize: 44, marginBottom: 2 },
  infoTitle: { fontSize: 32, fontWeight: '900', color: T.title, letterSpacing: -0.5 },
  infoTagline: { fontSize: 11, fontWeight: '700', color: T.subtitle, textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 14 },
  infoSection: { width: '100%', marginBottom: 12 },
  infoSectionLabel: { fontSize: 11, fontWeight: '800', color: T.accentCyan, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.8 },
  infoBody: { fontSize: 15, lineHeight: 23, color: '#CBD5E1', fontWeight: '500' },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' },
  chip: { backgroundColor: 'rgba(139,92,246,0.15)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)' },
  chipText: { fontSize: 13, fontWeight: '700', color: T.subtitle },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8, shadowColor: T.accentDark, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  startBtnGrad: { paddingVertical: 17, alignItems: 'center' },
  startBtnText: { fontSize: 18, fontWeight: '900', color: '#F5F3FF', letterSpacing: 0.3 },
  infoBackBtn: { paddingVertical: 8 },
  infoBackText: { fontSize: 14, fontWeight: '700', color: T.subtitle },

  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: T.grid },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: T.grid },
  traceDecor: { position: 'absolute', height: 2, backgroundColor: T.gridBright, borderRadius: 1 },
  vignette: { ...StyleSheet.absoluteFillObject },

  runnerCore: { position: 'absolute', backgroundColor: '#F0FDFF', opacity: 0.9 },
  trailDot: { position: 'absolute', backgroundColor: T.runnerTrail, zIndex: 4 },
  aimRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(34,211,238,0.35)',
    borderStyle: 'dashed',
    zIndex: 5,
  },

  electricBurst: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: T.electricGlow,
    zIndex: 15,
  },
  celebrateBanner: { position: 'absolute', zIndex: 16, borderRadius: 14, overflow: 'hidden' },
  celebrateGrad: { paddingHorizontal: 18, paddingVertical: 8 },
  celebrateText: { fontSize: 15, fontWeight: '900', color: '#4C1D95' },

  nearMissToast: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
    backgroundColor: 'rgba(26,26,46,0.92)',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: T.nearMissGlow,
    zIndex: 25,
  },
  nearMissText: { fontSize: 16, fontWeight: '800', color: T.nearMiss },

  hudWrap: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 4, zIndex: 40 },
  hudGlass: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: T.hudBorder,
    backgroundColor: Platform.OS === 'android' ? T.hudGlass : 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  hudRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hudLabel: { fontSize: 9, fontWeight: '800', color: T.accentCyan, letterSpacing: 1.2 },
  hudRound: { fontSize: 22, fontWeight: '900', color: T.title },
  hudRoundTotal: { fontSize: 14, fontWeight: '700', color: T.subtitle },
  hudCenter: { alignItems: 'center', flex: 1, marginHorizontal: 8 },
  hudTitle: { fontSize: 13, fontWeight: '800', color: T.title, marginBottom: 4 },
  lapDots: { flexDirection: 'row', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(139,92,246,0.25)' },
  dotDone: { backgroundColor: T.success },
  dotActive: { backgroundColor: T.runner, width: 8, height: 8, borderRadius: 4 },
  scoreBox: { alignItems: 'flex-end' },
  scoreLabel: { fontSize: 9, fontWeight: '800', color: T.accent, letterSpacing: 1.2 },
  scoreValue: { fontSize: 22, fontWeight: '900', color: T.runnerCore },
  hintPill: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(139,92,246,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
  },
  hudHint: { fontSize: 12, fontWeight: '700', color: T.subtitle, textAlign: 'center' },
});
