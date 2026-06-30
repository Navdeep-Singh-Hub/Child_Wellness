/**
 * Visual layer for Rocket Drag — space corridor, rocket ship, docking puck, fuel gauge.
 */
import { ROCKET_DRAG_COPY as COPY, ROCKET_DRAG_THEME as T } from '@/components/game/occupational/level5/session3/rocketDrag/rocketDragTheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
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

const ROCKET_HALF = 30;

export type TrailPoint = { x: number; y: number; opacity: number };

// ─── Intro ──────────────────────────────────────────────────────────────────

type InfoProps = { onStart: () => void; onBack: () => void };

function IntroRocket() {
  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [drift]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [-50, 50]) },
      { rotate: `${interpolate(drift.value, [0, 0.5, 1], [-8, 0, 8])}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.introRocketWrap, style]}>
      <RocketGraphic size={72} thrust />
    </Animated.View>
  );
}

export function RocketDragInfoScreen({ onStart, onBack }: InfoProps) {
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
      <LinearGradient colors={[...T.space]} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
      <LaunchCorridorBackdrop />
      <IntroRocket />

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
          <LinearGradient colors={['#818CF8', '#6366F1', '#4F46E5', '#4338CA']} style={styles.startBtnGrad}>
            <Text style={styles.startBtnText}>🚀 Launch Into Space</Text>
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

export function LaunchCorridorBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.space]} locations={[0, 0.4, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <NebulaGlow />
      <StarField count={40} />
      <LaunchLane />
      <LinearGradient colors={['transparent', 'rgba(2,6,23,0.4)']} style={styles.vignette} />
    </View>
  );
}

function NebulaGlow() {
  return (
    <>
      <View style={[styles.nebula, { top: '15%', left: '8%' }]} />
      <View style={[styles.nebula, { top: '55%', right: '5%', width: 120, height: 120 }]} />
    </>
  );
}

function StarField({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TwinkleStar key={i} index={i} />
      ))}
    </>
  );
}

function TwinkleStar({ index }: { index: number }) {
  const twinkle = useSharedValue(0.25);
  useEffect(() => {
    twinkle.value = withDelay(
      index * 70,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 700 + (index % 4) * 200 }),
          withTiming(0.15, { duration: 700 + (index % 4) * 200 }),
        ),
        -1,
        false,
      ),
    );
  }, [twinkle, index]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: `${(index * 19 + 5) % 94}%`,
    top: `${(index * 27 + 9) % 86}%`,
    width: 2 + (index % 3),
    height: 2 + (index % 3),
    borderRadius: 2,
    backgroundColor: T.star,
    opacity: twinkle.value,
  }));

  return <Animated.View style={style} />;
}

function LaunchLane() {
  return (
    <View style={styles.laneWrap}>
      <View style={styles.laneOuter} />
      <View style={styles.laneInner} />
      {Array.from({ length: 8 }).map((_, i) => (
        <View key={i} style={[styles.laneDash, { left: `${8 + i * 12}%` }]} />
      ))}
    </View>
  );
}

// ─── Rocket graphic ─────────────────────────────────────────────────────────

function RocketGraphic({ size, thrust }: { size: number; thrust?: boolean }) {
  const flame = useSharedValue(0.6);
  useEffect(() => {
    if (!thrust) return;
    flame.value = withRepeat(
      withSequence(withTiming(1, { duration: 120 }), withTiming(0.5, { duration: 120 })),
      -1,
      false,
    );
  }, [thrust, flame]);

  const flameStyle = useAnimatedStyle(() => ({
    opacity: flame.value,
    transform: [{ scaleY: 0.7 + flame.value * 0.5 }],
  }));

  return (
    <View style={{ width: size, height: size * 1.1, alignItems: 'center' }}>
      {thrust && (
        <Animated.View style={[styles.exhaustFlame, { width: size * 0.35, height: size * 0.45, bottom: -size * 0.15 }, flameStyle]}>
          <LinearGradient colors={['#FDE68A', '#F59E0B', 'transparent']} style={StyleSheet.absoluteFillObject} />
        </Animated.View>
      )}
      <View style={[styles.rocketBody, { width: size * 0.5, height: size * 0.75, borderRadius: size * 0.12 }]}>
        <LinearGradient colors={[T.rocketNose, T.rocketBody, T.rocketFin]} style={StyleSheet.absoluteFillObject} />
        <View style={[styles.rocketWindow, { width: size * 0.22, height: size * 0.22, borderRadius: size * 0.11 }]} />
        <View style={[styles.fin, { left: -size * 0.12, backgroundColor: T.rocketFin }]} />
        <View style={[styles.fin, { right: -size * 0.12, backgroundColor: T.rocketFin }]} />
      </View>
    </View>
  );
}

export function RocketShip({ x, y, docked }: { x: number; y: number; docked: boolean }) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.06, { duration: 500 }), withTiming(1, { duration: 500 })),
      -1,
      false,
    );
  }, [pulse]);

  const dockStyle = useAnimatedStyle(() => ({
    transform: [{ scale: docked ? pulse.value : 1 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left: x - ROCKET_HALF, top: y - ROCKET_HALF, zIndex: 5 },
        dockStyle,
      ]}
    >
      {docked && <View style={[styles.dockRing, { width: ROCKET_HALF * 2.4, height: ROCKET_HALF * 2.4, borderRadius: ROCKET_HALF * 1.2 }]} />}
      <RocketGraphic size={ROCKET_HALF * 2} thrust />
    </Animated.View>
  );
}

// ─── Docking puck & tether ──────────────────────────────────────────────────

export function DockingPuck({
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
  const ring = useSharedValue(0);
  useEffect(() => {
    if (!active) return;
    ring.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [active, ring]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: active ? 0.4 + ring.value * 0.4 : 0.2,
    transform: [{ scale: 1 + ring.value * 0.15 }],
  }));

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, zIndex: 7 }}>
      <Animated.View
        style={[
          styles.puckRing,
          { width: size + 12, height: size + 12, borderRadius: (size + 12) / 2, borderColor: active ? T.fuel : T.dock },
          ringStyle,
        ]}
      />
      <LinearGradient
        colors={active ? ['#6EE7B7', '#34D399', '#10B981'] : [T.dock, '#A5B4FC', '#818CF8']}
        style={[styles.puck, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <View style={styles.puckCore} />
      </LinearGradient>
      {active && progress > 0 && (
        <Text style={styles.puckPct}>{progress}%</Text>
      )}
    </View>
  );
}

export function EnergyTether({
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
  const pulse = useSharedValue(0.5);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 400 }), -1, true);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: active ? 0.55 + pulse.value * 0.35 : 0.3,
    height: active ? 4 : 2,
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
          backgroundColor: active ? T.fuel : T.tether,
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

// ─── Fuel gauge & exhaust ───────────────────────────────────────────────────

export function FuelGauge({
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
    <View pointerEvents="none" style={[styles.fuelWrap, { left: x - 50, top: y }]}>
      <Text style={styles.fuelLabel}>FUEL</Text>
      <View style={styles.fuelBar}>
        <View style={[styles.fuelFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

export function ExhaustTrail({ points }: { points: TrailPoint[] }) {
  return (
    <>
      {points.map((pt, i) => (
        <View
          key={`e${i}`}
          pointerEvents="none"
          style={[
            styles.exhaustDot,
            {
              left: pt.x - 5,
              top: pt.y - 3,
              opacity: pt.opacity * 0.6,
              width: 10 - i * 0.6,
              height: 6 - i * 0.4,
            },
          ]}
        />
      ))}
    </>
  );
}

// ─── Countdown ──────────────────────────────────────────────────────────────

export function LaunchCountdown({ onDone }: { onDone: () => void }) {
  const [step, setStep] = React.useState(0);
  const steps = ['3', '2', '1', 'LAUNCH!'] as const;
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
  const isLaunch = steps[step] === 'LAUNCH!';
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.cdOverlay} pointerEvents="none">
      <Animated.View style={[styles.cdBubble, isLaunch && styles.cdLaunch, anim]}>
        <Text style={[styles.cdText, isLaunch && styles.cdLaunchText]}>{steps[step]}</Text>
      </Animated.View>
    </View>
  );
}

// ─── Celebration ────────────────────────────────────────────────────────────

export function DockCelebration({ visible, x, y }: { visible: boolean; x: number; y: number }) {
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
      <View style={[styles.dockBurst, { left: x - 50, top: y - 50 }]} />
      <Animated.View style={[styles.celebrateBanner, { left: x - 58, top: y - ROCKET_HALF - 50 }, bannerStyle]}>
        <LinearGradient colors={['#EDE9FE', '#C7D2FE', '#818CF8']} style={styles.celebrateGrad}>
          <Text style={styles.celebrateText}>🚀 Docked!</Text>
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
  isDocked: boolean;
};

export function RocketDragHUD({
  round,
  totalRounds,
  score,
  hint,
  showHint,
  followProgress,
  isDocked,
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
            <Text style={styles.hudLabel}>ORBIT</Text>
            <Text style={styles.hudRound}>
              {round}
              <Text style={styles.hudRoundTotal}>/{totalRounds}</Text>
            </Text>
          </View>
          <View style={styles.hudCenter}>
            <Text style={styles.hudTitle}>🚀 Rocket Drag</Text>
            <View style={styles.orbitDots}>
              {Array.from({ length: totalRounds }).map((_, i) => (
                <View key={i} style={[styles.dot, i < score && styles.dotDone, i === round - 1 && styles.dotActive]} />
              ))}
            </View>
          </View>
          <Animated.View style={[styles.scoreBox, scoreBump]}>
            <Text style={styles.scoreLabel}>DOCKS</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </Animated.View>
        </View>
        {showHint && hint ? (
          <View style={styles.hintPill}>
            <Text style={styles.hudHint}>{hint}</Text>
          </View>
        ) : null}
        {isDocked && followProgress > 0 && (
          <View style={styles.hudFuelBar}>
            <View style={[styles.hudFuelFill, { width: `${followProgress}%` }]} />
          </View>
        )}
      </Glass>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  infoRoot: { flex: 1 },
  introRocketWrap: { position: 'absolute', top: '18%', alignSelf: 'center', zIndex: 2 },
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
  infoSectionLabel: { fontSize: 11, fontWeight: '800', color: T.accent, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.8 },
  infoBody: { fontSize: 15, lineHeight: 23, color: '#CBD5E1', fontWeight: '500' },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' },
  chip: { backgroundColor: 'rgba(129,140,248,0.15)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(129,140,248,0.3)' },
  chipText: { fontSize: 13, fontWeight: '700', color: T.subtitle },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8, shadowColor: T.accentDark, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  startBtnGrad: { paddingVertical: 17, alignItems: 'center' },
  startBtnText: { fontSize: 18, fontWeight: '900', color: '#EEF2FF', letterSpacing: 0.3 },
  infoBackBtn: { paddingVertical: 8 },
  infoBackText: { fontSize: 14, fontWeight: '700', color: T.subtitle },

  nebula: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: T.nebula },
  vignette: { ...StyleSheet.absoluteFillObject },
  laneWrap: { position: 'absolute', top: '38%', left: '4%', right: '4%', height: '24%' },
  laneOuter: { ...StyleSheet.absoluteFillObject, borderRadius: 20, borderWidth: 2, borderColor: T.lane, backgroundColor: 'rgba(99,102,241,0.06)' },
  laneInner: { position: 'absolute', top: '45%', left: 0, right: 0, height: 2, backgroundColor: T.laneBright },
  laneDash: { position: 'absolute', top: '48%', width: 24, height: 3, borderRadius: 2, backgroundColor: T.laneDash },

  rocketBody: { overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 8 },
  rocketWindow: { backgroundColor: 'rgba(224,231,255,0.85)', marginTop: 6, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)' },
  fin: { position: 'absolute', bottom: 0, width: 14, height: 18, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  exhaustFlame: { position: 'absolute', borderRadius: 8, overflow: 'hidden' },
  dockRing: { position: 'absolute', alignSelf: 'center', top: -6, borderWidth: 2, borderColor: T.fuelGlow, borderStyle: 'dashed' },

  puck: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  puckRing: { position: 'absolute', top: -6, left: -6, borderWidth: 2, borderStyle: 'dashed' },
  puckCore: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.9)' },
  puckPct: { position: 'absolute', bottom: -18, alignSelf: 'center', fontSize: 10, fontWeight: '800', color: T.fuel },

  exhaustDot: { position: 'absolute', backgroundColor: T.exhaust, borderRadius: 3, zIndex: 2 },

  fuelWrap: { position: 'absolute', width: 100, zIndex: 8 },
  fuelLabel: { fontSize: 8, fontWeight: '800', color: T.fuel, letterSpacing: 1, marginBottom: 3, textAlign: 'center' },
  fuelBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden', borderWidth: 1, borderColor: T.fuelGlow },
  fuelFill: { height: '100%', backgroundColor: T.fuel, borderRadius: 3 },

  cdOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(2,6,23,0.35)', zIndex: 30 },
  cdBubble: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(30,27,75,0.92)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: T.accent },
  cdLaunch: { backgroundColor: T.accent, borderColor: T.dock },
  cdText: { fontSize: 48, fontWeight: '900', color: T.title },
  cdLaunchText: { fontSize: 26, color: '#1E1B4B' },

  dockBurst: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: T.fuelGlow, zIndex: 15 },
  celebrateBanner: { position: 'absolute', zIndex: 16, borderRadius: 14, overflow: 'hidden' },
  celebrateGrad: { paddingHorizontal: 18, paddingVertical: 8 },
  celebrateText: { fontSize: 15, fontWeight: '900', color: '#312E81' },

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
  orbitDots: { flexDirection: 'row', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(129,140,248,0.25)' },
  dotDone: { backgroundColor: T.success },
  dotActive: { backgroundColor: T.accent, width: 8, height: 8, borderRadius: 4 },
  scoreBox: { alignItems: 'flex-end' },
  scoreLabel: { fontSize: 9, fontWeight: '800', color: T.subtitle, letterSpacing: 1.2 },
  scoreValue: { fontSize: 22, fontWeight: '900', color: T.dock },
  hintPill: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(129,140,248,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.25)',
  },
  hudHint: { fontSize: 12, fontWeight: '700', color: T.subtitle, textAlign: 'center' },
  hudFuelBar: {
    marginTop: 8,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  hudFuelFill: { height: '100%', backgroundColor: T.fuel, borderRadius: 3 },
});
