/**
 * Visual layer for Lightning Drag — storm sky, zigzag path, electric bolt.
 */
import { LIGHTNING_DRAG_COPY as COPY, LIGHTNING_DRAG_THEME as T } from '@/components/game/occupational/level5/session3/lightningDrag/lightningDragTheme';
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
import Svg, { Path } from 'react-native-svg';

const BOLT_HALF = 30;

export type SparkPoint = { x: number; y: number; opacity: number };

function zigzagPoint(t: number, w: number, h: number) {
  const cx = w * 0.5;
  const cy = h * 0.45;
  const r = Math.min(w, h) * 0.22;
  const phase = (t * 1.2) % 2;
  const tri = phase < 1 ? phase : 2 - phase;
  return {
    x: cx + (tri * 2 - 1) * r,
    y: cy + Math.sin(t * 0.5) * r * 0.4,
  };
}

function buildZigzagPath(w: number, h: number) {
  const step = 0.08;
  let d = '';
  for (let t = 0; t <= 8; t += step) {
    const { x, y } = zigzagPoint(t, w, h);
    d += t === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return d;
}

// ─── Intro ──────────────────────────────────────────────────────────────────

type InfoProps = { onStart: () => void; onBack: () => void };

function IntroBolt() {
  const zap = useSharedValue(0);
  useEffect(() => {
    zap.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 600 }),
        withDelay(400, withTiming(0, { duration: 0 })),
      ),
      -1,
      false,
    );
  }, [zap]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.5 + zap.value * 0.5,
    transform: [{ scale: 0.9 + zap.value * 0.2 }],
  }));

  return (
    <Animated.View style={[styles.introBoltWrap, style]}>
      <BoltGraphic size={80} />
    </Animated.View>
  );
}

export function LightningDragInfoScreen({ onStart, onBack }: InfoProps) {
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
      <LinearGradient colors={[...T.sky]} locations={[0, 0.4, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <StormBackdrop />
      <IntroBolt />

      <Animated.View style={[styles.infoCard, cardAnim]}>
        <Text style={styles.infoEmoji}>{COPY.emoji}</Text>
        <Text style={styles.infoTitle}>{COPY.title}</Text>
        <Text style={styles.infoTagline}>{COPY.subtitle}</Text>

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
          <LinearGradient colors={['#FDE047', '#FACC15', '#EAB308', '#CA8A04']} style={styles.startBtnGrad}>
            <Text style={styles.startBtnText}>⚡ Enter the Storm</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoBackBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.infoBackText}>← Back to games</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── Backdrop ───────────────────────────────────────────────────────────────

export function StormBackdrop({ flashKey }: { flashKey?: number }) {
  const flash = useSharedValue(0);
  useEffect(() => {
    if (!flashKey) return;
    flash.value = 0;
    flash.value = withSequence(withTiming(0.35, { duration: 80 }), withTiming(0, { duration: 200 }));
  }, [flashKey, flash]);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} locations={[0, 0.45, 0.8, 1]} style={StyleSheet.absoluteFillObject} />
      <StormClouds />
      <RainStreaks />
      <Animated.View style={[styles.flashOverlay, flashStyle]} />
      <LinearGradient colors={['transparent', 'rgba(15,23,42,0.5)']} style={styles.vignette} />
    </View>
  );
}

function StormClouds() {
  return (
    <>
      <View style={[styles.cloud, { top: '8%', left: '5%', width: 110 }]} />
      <View style={[styles.cloud, { top: '5%', right: '8%', width: 95 }]} />
      <View style={[styles.cloud, styles.cloudDark, { top: '18%', alignSelf: 'center', width: 130 }]} />
      <View style={[styles.cloud, { bottom: '15%', left: '10%', width: 85 }]} />
      <View style={[styles.cloud, styles.cloudDark, { bottom: '12%', right: '6%', width: 100 }]} />
    </>
  );
}

function RainStreaks() {
  return (
    <>
      {Array.from({ length: 18 }).map((_, i) => (
        <RainDrop key={i} index={i} />
      ))}
    </>
  );
}

function RainDrop({ index }: { index: number }) {
  const fall = useSharedValue(0);
  useEffect(() => {
    fall.value = withDelay(
      index * 120,
      withRepeat(withTiming(1, { duration: 600 + (index % 4) * 100, easing: Easing.linear }), -1, false),
    );
  }, [fall, index]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: `${(index * 13 + 2) % 96}%`,
    top: `${interpolate(fall.value, [0, 1], [-5, 95])}%`,
    width: 1.5,
    height: 12 + (index % 3) * 4,
    backgroundColor: T.rain,
    opacity: 0.4 + (index % 3) * 0.15,
  }));

  return <Animated.View style={style} />;
}

export function ZigzagPath({ width, height }: { width: number; height: number }) {
  const pathD = useMemo(() => (width > 80 ? buildZigzagPath(width, height) : ''), [width, height]);
  const pulse = useSharedValue(0.35);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 900 }), withTiming(0.25, { duration: 900 })),
      -1,
      false,
    );
  }, [pulse]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  if (!pathD) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, glowStyle]} pointerEvents="none">
      <Svg width={width} height={height}>
        <Path d={pathD} stroke={T.pathGlow} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Path d={pathD} stroke={T.pathCore} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 5" />
      </Svg>
    </Animated.View>
  );
}

// ─── Bolt graphic ───────────────────────────────────────────────────────────

function BoltGraphic({ size }: { size: number }) {
  return (
    <View style={{ width: size * 0.6, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[styles.boltZig1, { borderBottomWidth: size * 0.28, borderLeftWidth: size * 0.18, borderRightWidth: size * 0.18 }]} />
      <View style={[styles.boltZig2, { borderTopWidth: size * 0.28, borderLeftWidth: size * 0.18, borderRightWidth: size * 0.18, marginTop: -size * 0.08 }]} />
      <View style={[styles.boltCore, { width: size * 0.2, height: size * 0.2, borderRadius: size * 0.1 }]} />
    </View>
  );
}

export function LightningBolt({
  x,
  y,
  facing,
  locked,
}: {
  x: number;
  y: number;
  facing: 'left' | 'right';
  locked: boolean;
}) {
  const flicker = useSharedValue(0.6);
  useEffect(() => {
    flicker.value = withRepeat(
      withSequence(withTiming(1, { duration: 100 }), withTiming(0.5, { duration: 150 })),
      -1,
      false,
    );
  }, [flicker]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: locked ? 0.8 + flicker.value * 0.2 : 0.5 + flicker.value * 0.35,
    transform: [{ scale: locked ? 1.1 : 1 }, { scaleX: facing === 'left' ? -1 : 1 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: x - BOLT_HALF,
          top: y - BOLT_HALF,
          zIndex: 5,
          alignItems: 'center',
          justifyContent: 'center',
        },
        glowStyle,
      ]}
    >
      {locked && (
        <View
          style={[
            styles.lockRing,
            { width: BOLT_HALF * 2.5, height: BOLT_HALF * 2.5, borderRadius: BOLT_HALF * 1.25 },
          ]}
        />
      )}
      <View style={[styles.boltGlow, { width: BOLT_HALF * 2.2, height: BOLT_HALF * 2.2, borderRadius: BOLT_HALF * 1.1 }]} />
      <BoltGraphic size={BOLT_HALF * 2} />
    </Animated.View>
  );
}

// ─── Storm puck & arc ───────────────────────────────────────────────────────

export function StormPuck({
  x,
  y,
  active,
  progress,
}: {
  x: number;
  y: number;
  active: boolean;
  progress: number;
}) {
  const size = 40;
  const crackle = useSharedValue(0);
  useEffect(() => {
    if (!active) return;
    crackle.value = withRepeat(withTiming(1, { duration: 350 }), -1, true);
  }, [active, crackle]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: active ? 0.5 + crackle.value * 0.45 : 0.25,
    transform: [{ scale: 1 + crackle.value * 0.12 }],
  }));

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, zIndex: 7 }}>
      <Animated.View
        style={[
          styles.puckRing,
          {
            width: size + 14,
            height: size + 14,
            borderRadius: (size + 14) / 2,
            borderColor: active ? T.success : T.accent,
          },
          ringStyle,
        ]}
      />
      <LinearGradient
        colors={active ? ['#6EE7B7', '#34D399', '#10B981'] : [T.stormPuck, '#FDE047', '#EAB308']}
        style={[styles.puck, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Text style={styles.boltIcon}>⚡</Text>
      </LinearGradient>
      {active && progress > 0 && <Text style={styles.puckPct}>{progress}%</Text>}
    </View>
  );
}

export function ElectricArc({
  x1,
  y1,
  x2,
  y2,
  active,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active: boolean;
}) {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const zap = useSharedValue(0);

  useEffect(() => {
    zap.value = withRepeat(withTiming(1, { duration: 200 }), -1, true);
  }, [zap]);

  const style = useAnimatedStyle(() => ({
    opacity: active ? 0.6 + zap.value * 0.35 : 0.25,
    height: active ? 3 + zap.value * 2 : 2,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: x1,
          top: y1,
          width: length,
          backgroundColor: active ? T.success : T.arc,
          borderRadius: 1,
          transform: [{ rotate: `${angle}deg` }],
          transformOrigin: 'left center',
          zIndex: 3,
        },
        style,
      ]}
    />
  );
}

// ─── Charge meter & sparks ──────────────────────────────────────────────────

export function ChargeMeter({
  x,
  y,
  progress,
  visible,
}: {
  x: number;
  y: number;
  progress: number;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <View pointerEvents="none" style={[styles.chargeWrap, { left: x - 52, top: y }]}>
      <Text style={styles.chargeLabel}>CHARGE</Text>
      <View style={styles.chargeBar}>
        <View style={[styles.chargeFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

export function SparkTrail({ points }: { points: SparkPoint[] }) {
  return (
    <>
      {points.map((pt, i) => (
        <View
          key={`s${i}`}
          pointerEvents="none"
          style={[
            styles.sparkDot,
            {
              left: pt.x - 4,
              top: pt.y - 4,
              opacity: pt.opacity * 0.65,
              width: 8 - i * 0.4,
              height: 8 - i * 0.4,
              borderRadius: 2,
            },
          ]}
        />
      ))}
    </>
  );
}

// ─── Countdown ──────────────────────────────────────────────────────────────

export function StormCountdown({ onDone }: { onDone: () => void }) {
  const [step, setStep] = React.useState(0);
  const steps = ['3', '2', '1', 'STRIKE!'] as const;
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (step >= steps.length) {
      onDoneRef.current();
      return;
    }
    scale.value = 0.35;
    opacity.value = 0;
    scale.value = withSpring(1, { damping: 11, stiffness: 180 });
    opacity.value = withSequence(withTiming(1, { duration: 100 }), withTiming(0, { duration: 200 }));
    const delay = step === steps.length - 1 ? 700 : 750;
    const t = setTimeout(() => setStep((s) => s + 1), delay);
    return () => clearTimeout(t);
  }, [step, scale, opacity]);

  if (step >= steps.length) return null;
  const isStrike = steps[step] === 'STRIKE!';
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.cdOverlay} pointerEvents="none">
      <Animated.View style={[styles.cdBubble, isStrike && styles.cdStrike, anim]}>
        <Text style={[styles.cdText, isStrike && styles.cdStrikeText]}>{steps[step]}</Text>
      </Animated.View>
    </View>
  );
}

// ─── Celebration ────────────────────────────────────────────────────────────

export function LightningCelebration({ visible, x, y }: { visible: boolean; x: number; y: number }) {
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

  const bolts = Array.from({ length: 8 });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.electricBurst, { left: x - 55, top: y - 55 }]} />
      <Animated.View style={[styles.celebrateBanner, { left: x - 52, top: y - BOLT_HALF - 50 }, bannerStyle]}>
        <LinearGradient colors={['#FEF9C3', '#FDE047', '#FACC15']} style={styles.celebrateGrad}>
          <Text style={styles.celebrateText}>⚡ Zapped!</Text>
        </LinearGradient>
      </Animated.View>
      {bolts.map((_, i) => (
        <StrikeSpark key={i} i={i} x={x} y={y} go={visible} />
      ))}
    </View>
  );
}

function StrikeSpark({ i, x, y, go }: { i: number; x: number; y: number; go: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (!go) return;
    t.value = withTiming(1, { duration: 550, easing: Easing.out(Easing.cubic) });
  }, [go, t]);

  const style = useAnimatedStyle(() => {
    const angle = (i / 8) * Math.PI * 2;
    const r = 12 + 50 * t.value;
    return {
      position: 'absolute',
      left: x + Math.cos(angle) * r - 3,
      top: y + Math.sin(angle) * r - 5,
      width: 6,
      height: 10,
      backgroundColor: i % 2 === 0 ? T.bolt : T.spark,
      opacity: 1 - t.value,
      transform: [{ rotate: `${angle + Math.PI / 2}rad` }, { scale: 1.2 - t.value * 0.6 }],
    };
  });

  return <Animated.View style={style} />;
}

// ─── HUD ────────────────────────────────────────────────────────────────────

type HudProps = {
  round: number;
  totalRounds: number;
  score: number;
  hint: string;
  showHint: boolean;
  followProgress: number;
  isLocked: boolean;
};

export function LightningDragHUD({
  round,
  totalRounds,
  score,
  hint,
  showHint,
  followProgress,
  isLocked,
}: HudProps) {
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
            <Text style={styles.hudLabel}>STRIKE</Text>
            <Text style={styles.hudRound}>
              {round}
              <Text style={styles.hudRoundTotal}>/{totalRounds}</Text>
            </Text>
          </View>
          <View style={styles.hudCenter}>
            <Text style={styles.hudTitle}>⚡ Lightning Drag</Text>
            <View style={styles.strikeDots}>
              {Array.from({ length: totalRounds }).map((_, i) => (
                <View key={i} style={[styles.dot, i < score && styles.dotDone, i === round - 1 && styles.dotActive]} />
              ))}
            </View>
          </View>
          <Animated.View style={[styles.scoreBox, scoreBump]}>
            <Text style={styles.scoreLabel}>ZAPS</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </Animated.View>
        </View>
        {showHint && hint ? (
          <View style={styles.hintPill}>
            <Text style={styles.hudHint}>{hint}</Text>
          </View>
        ) : null}
        {isLocked && followProgress > 0 && (
          <View style={styles.hudChargeBar}>
            <View style={[styles.hudChargeFill, { width: `${followProgress}%` }]} />
          </View>
        )}
      </Glass>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  infoRoot: { flex: 1 },
  introBoltWrap: { position: 'absolute', top: '18%', alignSelf: 'center', zIndex: 2 },
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
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  infoEmoji: { fontSize: 44, marginBottom: 2 },
  infoTitle: { fontSize: 32, fontWeight: '900', color: T.title, letterSpacing: -0.5 },
  infoTagline: { fontSize: 11, fontWeight: '700', color: T.subtitle, textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 14 },
  infoSection: { width: '100%', marginBottom: 12 },
  infoSectionLabel: { fontSize: 11, fontWeight: '800', color: T.accent, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.8 },
  infoBody: { fontSize: 15, lineHeight: 23, color: '#CBD5E1', fontWeight: '500' },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' },
  chip: { backgroundColor: 'rgba(250,204,21,0.12)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(250,204,21,0.25)' },
  chipText: { fontSize: 13, fontWeight: '700', color: T.subtitle },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8, shadowColor: T.accentDark, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  startBtnGrad: { paddingVertical: 17, alignItems: 'center' },
  startBtnText: { fontSize: 18, fontWeight: '900', color: '#1E293B', letterSpacing: 0.3 },
  infoBackBtn: { paddingVertical: 8 },
  infoBackText: { fontSize: 14, fontWeight: '700', color: T.subtitle },

  cloud: { position: 'absolute', height: 32, borderRadius: 16, backgroundColor: T.cloud },
  cloudDark: { backgroundColor: T.cloudDark, height: 38 },
  flashOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(254,240,138,0.25)' },
  vignette: { ...StyleSheet.absoluteFillObject },

  boltZig1: {
    width: 0,
    height: 0,
    borderBottomColor: T.bolt,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderStyle: 'solid',
  },
  boltZig2: {
    width: 0,
    height: 0,
    borderTopColor: T.bolt,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderStyle: 'solid',
    marginLeft: 8,
  },
  boltCore: { position: 'absolute', backgroundColor: T.boltCore, top: '38%' },
  boltGlow: { position: 'absolute', backgroundColor: T.boltGlow },
  lockRing: {
    position: 'absolute',
    alignSelf: 'center',
    top: -8,
    borderWidth: 2,
    borderColor: 'rgba(52,211,153,0.45)',
    borderStyle: 'dashed',
  },

  puck: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  puckRing: { position: 'absolute', top: -7, left: -7, borderWidth: 2, borderStyle: 'dashed' },
  boltIcon: { fontSize: 18 },
  puckPct: { position: 'absolute', bottom: -18, alignSelf: 'center', fontSize: 10, fontWeight: '800', color: T.success },

  sparkDot: { position: 'absolute', backgroundColor: T.sparkTrail, zIndex: 2 },

  chargeWrap: { position: 'absolute', width: 104, zIndex: 8 },
  chargeLabel: { fontSize: 8, fontWeight: '800', color: T.charge, letterSpacing: 1, marginBottom: 3, textAlign: 'center' },
  chargeBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', borderWidth: 1, borderColor: T.chargeGlow },
  chargeFill: { height: '100%', backgroundColor: T.charge, borderRadius: 3 },

  cdOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15,23,42,0.4)', zIndex: 30 },
  cdBubble: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(30,41,59,0.95)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: T.accent },
  cdStrike: { backgroundColor: T.accent, borderColor: T.bolt },
  cdText: { fontSize: 48, fontWeight: '900', color: T.title },
  cdStrikeText: { fontSize: 26, color: '#1E293B' },

  electricBurst: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: T.boltGlow, zIndex: 15 },
  celebrateBanner: { position: 'absolute', zIndex: 16, borderRadius: 14, overflow: 'hidden' },
  celebrateGrad: { paddingHorizontal: 18, paddingVertical: 8 },
  celebrateText: { fontSize: 15, fontWeight: '900', color: '#78350F' },

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
  hudLabel: { fontSize: 9, fontWeight: '800', color: T.accent, letterSpacing: 1.2 },
  hudRound: { fontSize: 22, fontWeight: '900', color: T.title },
  hudRoundTotal: { fontSize: 14, fontWeight: '700', color: T.subtitle },
  hudCenter: { alignItems: 'center', flex: 1, marginHorizontal: 8 },
  hudTitle: { fontSize: 13, fontWeight: '800', color: T.title, marginBottom: 4 },
  strikeDots: { flexDirection: 'row', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(250,204,21,0.25)' },
  dotDone: { backgroundColor: T.success },
  dotActive: { backgroundColor: T.accent, width: 8, height: 8, borderRadius: 4 },
  scoreBox: { alignItems: 'flex-end' },
  scoreLabel: { fontSize: 9, fontWeight: '800', color: T.subtitle, letterSpacing: 1.2 },
  scoreValue: { fontSize: 22, fontWeight: '900', color: T.bolt },
  hintPill: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(250,204,21,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.2)',
  },
  hudHint: { fontSize: 12, fontWeight: '700', color: T.subtitle, textAlign: 'center' },
  hudChargeBar: { marginTop: 8, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  hudChargeFill: { height: '100%', backgroundColor: T.charge, borderRadius: 3 },
});
