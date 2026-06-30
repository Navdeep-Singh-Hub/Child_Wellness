/**
 * Visual layer for River Boat — serene waterway, sailboat, captain puck.
 */
import { RIVER_BOAT_COPY as COPY, RIVER_BOAT_THEME as T } from '@/components/game/occupational/level5/session3/riverBoat/riverBoatTheme';
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
import Svg, { Line, Path } from 'react-native-svg';

const BOAT_HALF = 30;

export type WakePoint = { x: number; y: number; opacity: number };

function verticalPoint(t: number, w: number, h: number) {
  const cx = w * 0.5;
  const cy = h * 0.45;
  const r = Math.min(w, h) * 0.22;
  return { x: cx, y: cy + Math.sin(t * 0.85) * r };
}

function buildVerticalPath(w: number, h: number) {
  const step = 0.1;
  let d = '';
  for (let t = 0; t <= Math.PI * 2; t += step) {
    const { x, y } = verticalPoint(t, w, h);
    d += t === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return d;
}

// ─── Intro ──────────────────────────────────────────────────────────────────

type InfoProps = { onStart: () => void; onBack: () => void };

function IntroBoat() {
  const bob = useSharedValue(0);
  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [bob]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(bob.value, [0, 1], [18, -18]) },
      { rotate: `${interpolate(bob.value, [0, 0.5, 1], [6, 0, -6])}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.introBoatWrap, style]}>
      <SailboatGraphic size={72} />
    </Animated.View>
  );
}

export function RiverBoatInfoScreen({ onStart, onBack }: InfoProps) {
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
      <LinearGradient colors={[...T.sky]} locations={[0, 0.4, 0.8, 1]} style={StyleSheet.absoluteFillObject} />
      <RiverBackdrop />
      <IntroBoat />

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
          <LinearGradient colors={['#22D3EE', '#06B6D4', '#0891B2', '#0E7490']} style={styles.startBtnGrad}>
            <Text style={styles.startBtnText}>⛵ Set Sail!</Text>
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

export function RiverBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFillObject} />
      <RiverBanks />
      <RiverWater />
      <Reeds />
      <LilyPads />
      <FlowLines />
    </View>
  );
}

function RiverBanks() {
  return (
    <>
      <View style={[styles.bank, { left: 0, width: '22%' }]} />
      <View style={[styles.bank, { right: 0, width: '22%' }]} />
    </>
  );
}

function RiverWater() {
  return (
    <View style={styles.waterChannel}>
      <LinearGradient
        colors={[T.riverShallow, T.river, T.riverDeep]}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
}

function Reeds() {
  const positions = [
    { left: '6%', bottom: '28%' },
    { left: '10%', bottom: '35%' },
    { right: '8%', bottom: '30%' },
    { right: '12%', bottom: '38%' },
  ];
  return (
    <>
      {positions.map((p, i) => (
        <View key={i} style={[styles.reed, p]} />
      ))}
    </>
  );
}

function LilyPads() {
  return (
    <>
      <View style={[styles.lily, { left: '8%', bottom: '22%' }]} />
      <View style={[styles.lily, { right: '10%', bottom: '26%', width: 28, height: 28 }]} />
    </>
  );
}

function FlowLines() {
  const flow = useSharedValue(0);
  useEffect(() => {
    flow.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.linear }), -1, false);
  }, [flow]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(flow.value, [0, 1], [0, 24]) }],
    opacity: 0.35 + flow.value * 0.2,
  }));

  return (
    <Animated.View style={[styles.flowWrap, style]}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={[styles.flowLine, { top: i * 36 }]} />
      ))}
    </Animated.View>
  );
}

export function RiverChannelPath({ width, height }: { width: number; height: number }) {
  const pathD = useMemo(() => (width > 80 ? buildVerticalPath(width, height) : ''), [width, height]);
  const cx = width * 0.5;
  const pulse = useSharedValue(0.4);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(0.75, { duration: 1400 }), withTiming(0.3, { duration: 1400 })),
      -1,
      false,
    );
  }, [pulse]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  if (!pathD) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, glowStyle]} pointerEvents="none">
      <Svg width={width} height={height}>
        <Line x1={cx} y1={height * 0.12} x2={cx} y2={height * 0.88} stroke={T.pathGlow} strokeWidth={14} strokeLinecap="round" />
        <Path d={pathD} stroke={T.pathCore} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray="8 6" />
      </Svg>
    </Animated.View>
  );
}

// ─── Sailboat ───────────────────────────────────────────────────────────────

function SailboatGraphic({ size }: { size: number }) {
  return (
    <View style={{ width: size, height: size * 0.85, alignItems: 'center' }}>
      <View style={[styles.mast, { height: size * 0.55, width: 3, backgroundColor: T.mast }]} />
      <View style={[styles.sail, { width: size * 0.42, height: size * 0.48, borderTopRightRadius: size * 0.2 }]}>
        <LinearGradient colors={[T.sail, '#E0F2FE']} style={StyleSheet.absoluteFillObject} />
        <View style={[styles.sailStripe, { width: size * 0.08, height: '100%' }]} />
      </View>
      <View style={[styles.hull, { width: size * 0.7, height: size * 0.22, borderBottomLeftRadius: size * 0.12, borderBottomRightRadius: size * 0.12 }]}>
        <LinearGradient colors={[T.hullLight, T.hull]} style={StyleSheet.absoluteFillObject} />
      </View>
    </View>
  );
}

export function SailboatFigure({
  x,
  y,
  tilt,
  aboard,
}: {
  x: number;
  y: number;
  tilt: number;
  aboard: boolean;
}) {
  const rock = useSharedValue(0);
  useEffect(() => {
    rock.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 })),
      -1,
      false,
    );
  }, [rock]);

  const rockStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${tilt + interpolate(rock.value, [0, 1], [-2, 2])}deg` }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left: x - BOAT_HALF, top: y - BOAT_HALF, zIndex: 5 },
        rockStyle,
      ]}
    >
      {aboard && (
        <View
          style={[
            styles.aboardRing,
            { width: BOAT_HALF * 2.4, height: BOAT_HALF * 2.4, borderRadius: BOAT_HALF * 1.2 },
          ]}
        />
      )}
      <SailboatGraphic size={BOAT_HALF * 2} />
    </Animated.View>
  );
}

// ─── Captain puck & rope ────────────────────────────────────────────────────

export function CaptainPuck({
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
  const spin = useSharedValue(0);
  useEffect(() => {
    if (!active) return;
    spin.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.linear }), -1, false);
  }, [active, spin]);

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, zIndex: 7 }}>
      <LinearGradient
        colors={active ? ['#6EE7B7', '#34D399', '#10B981'] : [T.captain, '#A5F3FC', '#06B6D4']}
        style={[styles.puck, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Animated.Text style={[styles.wheelIcon, wheelStyle]}>⚓</Animated.Text>
      </LinearGradient>
      {active && progress > 0 && <Text style={styles.puckPct}>{progress}%</Text>}
    </View>
  );
}

export function RopeTether({
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
  const sway = useSharedValue(0);

  useEffect(() => {
    sway.value = withRepeat(withTiming(1, { duration: 500 }), -1, true);
  }, [sway]);

  const style = useAnimatedStyle(() => ({
    opacity: active ? 0.6 : 0.3,
    height: active ? 3 + sway.value : 2,
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
          backgroundColor: active ? T.success : T.rope,
          borderRadius: 2,
          transform: [{ rotate: `${angle}deg` }],
          transformOrigin: 'left center',
          zIndex: 3,
        },
        style,
      ]}
    />
  );
}

// ─── Sail meter & wake ──────────────────────────────────────────────────────

export function SailFillMeter({
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
    <View pointerEvents="none" style={[styles.sailWrap, { left: x - 50, top: y }]}>
      <Text style={styles.sailLabel}>SAIL</Text>
      <View style={styles.sailBar}>
        <View style={[styles.sailFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

export function WakeRipples({ points }: { points: WakePoint[] }) {
  return (
    <>
      {points.map((pt, i) => (
        <View
          key={`w${i}`}
          pointerEvents="none"
          style={[
            styles.wakeRing,
            {
              left: pt.x - (10 - i),
              top: pt.y - (4 - i * 0.3),
              width: (20 - i) * 2,
              height: (8 - i * 0.5) * 2,
              borderRadius: 10 - i,
              opacity: pt.opacity * 0.5,
            },
          ]}
        />
      ))}
    </>
  );
}

// ─── Countdown ──────────────────────────────────────────────────────────────

export function SetSailCountdown({ onDone }: { onDone: () => void }) {
  const [step, setStep] = React.useState(0);
  const steps = ['3', '2', '1', 'SAIL!'] as const;
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
  const isSail = steps[step] === 'SAIL!';
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.cdOverlay} pointerEvents="none">
      <Animated.View style={[styles.cdBubble, isSail && styles.cdSail, anim]}>
        <Text style={[styles.cdText, isSail && styles.cdSailText]}>{steps[step]}</Text>
      </Animated.View>
    </View>
  );
}

// ─── Celebration ────────────────────────────────────────────────────────────

export function SailingCelebration({ visible, x, y }: { visible: boolean; x: number; y: number }) {
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

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.splashBurst, { left: x - 55, top: y - 20 }]} />
      <Animated.View style={[styles.celebrateBanner, { left: x - 68, top: y - BOAT_HALF - 50 }, bannerStyle]}>
        <LinearGradient colors={['#ECFEFF', '#A5F3FC', '#06B6D4']} style={styles.celebrateGrad}>
          <Text style={styles.celebrateText}>⛵ Smooth Sailing!</Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

// ─── HUD ────────────────────────────────────────────────────────────────────

type HudProps = {
  round: number;
  totalRounds: number;
  score: number;
  hint: string;
  showHint: boolean;
  followProgress: number;
  isAboard: boolean;
};

export function RiverBoatHUD({
  round,
  totalRounds,
  score,
  hint,
  showHint,
  followProgress,
  isAboard,
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
  const glassProps = Platform.OS === 'ios' ? { intensity: 52, tint: 'light' as const } : {};

  return (
    <View style={styles.hudWrap} pointerEvents="none">
      <Glass {...glassProps} style={styles.hudGlass}>
        <View style={styles.hudRow}>
          <View>
            <Text style={styles.hudLabel}>VOYAGE</Text>
            <Text style={styles.hudRound}>
              {round}
              <Text style={styles.hudRoundTotal}>/{totalRounds}</Text>
            </Text>
          </View>
          <View style={styles.hudCenter}>
            <Text style={styles.hudTitle}>⛵ River Boat</Text>
            <View style={styles.voyageDots}>
              {Array.from({ length: totalRounds }).map((_, i) => (
                <View key={i} style={[styles.dot, i < score && styles.dotDone, i === round - 1 && styles.dotActive]} />
              ))}
            </View>
          </View>
          <Animated.View style={[styles.scoreBox, scoreBump]}>
            <Text style={styles.scoreLabel}>TRIPS</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </Animated.View>
        </View>
        {showHint && hint ? (
          <View style={styles.hintPill}>
            <Text style={styles.hudHint}>{hint}</Text>
          </View>
        ) : null}
        {isAboard && followProgress > 0 && (
          <View style={styles.hudSailBar}>
            <View style={[styles.hudSailFill, { width: `${followProgress}%` }]} />
          </View>
        )}
      </Glass>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  infoRoot: { flex: 1 },
  introBoatWrap: { position: 'absolute', top: '20%', alignSelf: 'center', zIndex: 2 },
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
    shadowColor: T.accentDark,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  infoEmoji: { fontSize: 44, marginBottom: 2 },
  infoTitle: { fontSize: 32, fontWeight: '900', color: T.title, letterSpacing: -0.5 },
  infoTagline: { fontSize: 11, fontWeight: '700', color: T.subtitle, textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 14 },
  infoSection: { width: '100%', marginBottom: 12 },
  infoSectionLabel: { fontSize: 11, fontWeight: '800', color: T.accentDark, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.8 },
  infoBody: { fontSize: 15, lineHeight: 23, color: '#475569', fontWeight: '500' },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' },
  chip: { backgroundColor: 'rgba(6,182,212,0.1)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(6,182,212,0.25)' },
  chipText: { fontSize: 13, fontWeight: '700', color: T.subtitle },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8, shadowColor: T.accentDark, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  startBtnGrad: { paddingVertical: 17, alignItems: 'center' },
  startBtnText: { fontSize: 18, fontWeight: '900', color: '#F0FDFA', letterSpacing: 0.3 },
  infoBackBtn: { paddingVertical: 8 },
  infoBackText: { fontSize: 14, fontWeight: '700', color: T.subtitle },

  bank: { position: 'absolute', top: 0, bottom: 0, backgroundColor: T.bank, opacity: 0.55 },
  waterChannel: {
    position: 'absolute',
    left: '22%',
    right: '22%',
    top: '8%',
    bottom: '8%',
    borderRadius: 20,
    overflow: 'hidden',
    opacity: 0.55,
  },
  reed: { position: 'absolute', width: 4, height: 36, backgroundColor: T.reed, borderRadius: 2 },
  lily: { position: 'absolute', width: 32, height: 32, borderRadius: 16, backgroundColor: T.lily, opacity: 0.6 },
  flowWrap: { position: 'absolute', left: '38%', right: '38%', top: '15%', bottom: '15%' },
  flowLine: { position: 'absolute', left: '20%', right: '20%', height: 2, backgroundColor: T.wake, borderRadius: 1 },

  mast: { position: 'absolute', top: 0 },
  sail: { position: 'absolute', top: 4, left: '38%', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  sailStripe: { position: 'absolute', left: '30%', backgroundColor: T.sailStripe, opacity: 0.35 },
  hull: { position: 'absolute', bottom: 0, overflow: 'hidden', borderWidth: 1.5, borderColor: T.mast },
  aboardRing: {
    position: 'absolute',
    alignSelf: 'center',
    top: -6,
    borderWidth: 2,
    borderColor: 'rgba(16,185,129,0.45)',
    borderStyle: 'dashed',
  },

  puck: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)' },
  wheelIcon: { fontSize: 18 },
  puckPct: { position: 'absolute', bottom: -18, alignSelf: 'center', fontSize: 10, fontWeight: '800', color: T.success },

  wakeRing: { position: 'absolute', borderWidth: 1.5, borderColor: T.wake, zIndex: 2 },

  sailWrap: { position: 'absolute', width: 100, zIndex: 8 },
  sailLabel: { fontSize: 8, fontWeight: '800', color: T.sailMeter, letterSpacing: 1, marginBottom: 3, textAlign: 'center' },
  sailBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)', overflow: 'hidden', borderWidth: 1, borderColor: T.sailMeterGlow },
  sailFill: { height: '100%', backgroundColor: T.sailMeter, borderRadius: 3 },

  cdOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(236,254,255,0.4)', zIndex: 30 },
  cdBubble: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: T.accent },
  cdSail: { backgroundColor: T.accent, borderColor: T.hull },
  cdText: { fontSize: 48, fontWeight: '900', color: T.title },
  cdSailText: { fontSize: 32, color: '#F0FDFA' },

  splashBurst: { position: 'absolute', width: 110, height: 40, borderRadius: 20, backgroundColor: T.wakeGlow, zIndex: 15 },
  celebrateBanner: { position: 'absolute', zIndex: 16, borderRadius: 14, overflow: 'hidden' },
  celebrateGrad: { paddingHorizontal: 16, paddingVertical: 8 },
  celebrateText: { fontSize: 14, fontWeight: '900', color: '#0E7490' },

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
  hudLabel: { fontSize: 9, fontWeight: '800', color: T.accentDark, letterSpacing: 1.2 },
  hudRound: { fontSize: 22, fontWeight: '900', color: T.title },
  hudRoundTotal: { fontSize: 14, fontWeight: '700', color: T.subtitle },
  hudCenter: { alignItems: 'center', flex: 1, marginHorizontal: 8 },
  hudTitle: { fontSize: 13, fontWeight: '800', color: T.title, marginBottom: 4 },
  voyageDots: { flexDirection: 'row', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(6,182,212,0.25)' },
  dotDone: { backgroundColor: T.success },
  dotActive: { backgroundColor: T.accent, width: 8, height: 8, borderRadius: 4 },
  scoreBox: { alignItems: 'flex-end' },
  scoreLabel: { fontSize: 9, fontWeight: '800', color: T.subtitle, letterSpacing: 1.2 },
  scoreValue: { fontSize: 22, fontWeight: '900', color: T.accentDark },
  hintPill: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(6,182,212,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
  },
  hudHint: { fontSize: 12, fontWeight: '700', color: T.subtitle, textAlign: 'center' },
  hudSailBar: { marginTop: 8, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.45)', overflow: 'hidden' },
  hudSailFill: { height: '100%', backgroundColor: T.sailMeter, borderRadius: 3 },
});
