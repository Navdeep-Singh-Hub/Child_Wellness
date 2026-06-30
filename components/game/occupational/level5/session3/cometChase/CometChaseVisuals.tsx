/**
 * Visual layer for Comet Chase — cosmic figure-8, violet comet, stardust puck.
 */
import { COMET_CHASE_COPY as COPY, COMET_CHASE_THEME as T } from '@/components/game/occupational/level5/session3/cometChase/cometChaseTheme';
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

const COMET_HALF = 30;

export type DustPoint = { x: number; y: number; opacity: number };

function figure8Point(t: number, w: number, h: number) {
  const cx = w * 0.5;
  const cy = h * 0.45;
  const r = Math.min(w, h) * 0.22;
  return {
    x: cx + Math.sin(t * 0.7) * r,
    y: cy + Math.sin(t * 1.4) * r * 0.55,
  };
}

function buildFigure8Path(w: number, h: number) {
  const step = 0.08;
  let d = '';
  for (let t = 0; t <= Math.PI * 2; t += step) {
    const { x, y } = figure8Point(t, w, h);
    d += t === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return d + ' Z';
}

// ─── Intro ──────────────────────────────────────────────────────────────────

type InfoProps = { onStart: () => void; onBack: () => void };

function IntroComet() {
  const orbit = useSharedValue(0);
  useEffect(() => {
    orbit.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.linear }), -1, false);
  }, [orbit]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(orbit.value, [0, 0.25, 0.5, 0.75, 1], [-40, 0, 40, 0, -40]) },
      { translateY: interpolate(orbit.value, [0, 0.25, 0.5, 0.75, 1], [0, -28, 0, 28, 0]) },
      { rotate: `${interpolate(orbit.value, [0, 1], [-20, 40])}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.introCometWrap, style]}>
      <CometGraphic size={68} angle={-25} />
    </Animated.View>
  );
}

export function CometChaseInfoScreen({ onStart, onBack }: InfoProps) {
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
      <CosmicBackdrop />
      <IntroComet />

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
          <LinearGradient colors={['#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED']} style={styles.startBtnGrad}>
            <Text style={styles.startBtnText}>☄️ Blast Off!</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoBackBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.infoBackText}>← Back to games</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── Backdrop & path ────────────────────────────────────────────────────────

export function CosmicBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.space]} locations={[0, 0.4, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <NebulaClouds />
      <StarField count={42} />
      <LinearGradient colors={['transparent', 'rgba(2,6,23,0.45)']} style={styles.vignette} />
    </View>
  );
}

function NebulaClouds() {
  return (
    <>
      <View style={[styles.nebula, { top: '18%', left: '6%' }]} />
      <View style={[styles.nebula, { top: '50%', right: '4%', width: 110, height: 110, backgroundColor: T.nebulaPink }]} />
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
  const twinkle = useSharedValue(0.2);
  useEffect(() => {
    twinkle.value = withDelay(
      index * 75,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 750 + (index % 4) * 180 }),
          withTiming(0.15, { duration: 750 + (index % 4) * 180 }),
        ),
        -1,
        false,
      ),
    );
  }, [twinkle, index]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: `${(index * 19 + 4) % 95}%`,
    top: `${(index * 23 + 8) % 88}%`,
    width: 2 + (index % 3),
    height: 2 + (index % 3),
    borderRadius: 2,
    backgroundColor: T.star,
    opacity: twinkle.value,
  }));

  return <Animated.View style={style} />;
}

export function Figure8Path({ width, height }: { width: number; height: number }) {
  const pathD = useMemo(() => (width > 80 ? buildFigure8Path(width, height) : ''), [width, height]);
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(0.8, { duration: 1500 }), withTiming(0.35, { duration: 1500 })),
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
        <Path d={pathD} stroke={T.pathCore} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeDasharray="10 7" />
      </Svg>
    </Animated.View>
  );
}

// ─── Comet graphic ──────────────────────────────────────────────────────────

function CometGraphic({ size, angle }: { size: number; angle: number }) {
  const tailLen = size * 1.1;
  return (
    <View style={{ width: size + tailLen, height: size, transform: [{ rotate: `${angle}deg` }] }}>
      <LinearGradient
        colors={['transparent', T.cometTail, T.cometHead]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.cometTail, { width: tailLen, height: size * 0.35, left: 0, top: size * 0.32 }]}
      />
      <View style={[styles.cometHead, { width: size * 0.55, height: size * 0.55, borderRadius: size * 0.28, left: tailLen - size * 0.1 }]}>
        <LinearGradient colors={[T.cometCore, T.cometHead, '#8B5CF6']} style={StyleSheet.absoluteFillObject} />
        <View style={[styles.cometCore, { width: size * 0.2, height: size * 0.2, borderRadius: size * 0.1 }]} />
      </View>
    </View>
  );
}

export function CometFigure({
  x,
  y,
  angle,
  locked,
}: {
  x: number;
  y: number;
  angle: number;
  locked: boolean;
}) {
  const glow = useSharedValue(0.5);
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(withTiming(1, { duration: 500 }), withTiming(0.45, { duration: 500 })),
      -1,
      false,
    );
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: locked ? 0.7 + glow.value * 0.3 : 0.4 + glow.value * 0.2,
    transform: [{ scale: locked ? 1 + glow.value * 0.08 : 1 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left: x - COMET_HALF, top: y - COMET_HALF, zIndex: 5 },
        glowStyle,
      ]}
    >
      {locked && (
        <View
          style={[
            styles.lockRing,
            { width: COMET_HALF * 2.5, height: COMET_HALF * 2.5, borderRadius: COMET_HALF * 1.25 },
          ]}
        />
      )}
      <CometGraphic size={COMET_HALF * 2} angle={angle} />
    </Animated.View>
  );
}

// ─── Stardust puck & tether ─────────────────────────────────────────────────

export function StardustPuck({
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
  const sparkle = useSharedValue(0);
  useEffect(() => {
    if (!active) return;
    sparkle.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [active, sparkle]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: active ? 0.5 + sparkle.value * 0.4 : 0.25,
    transform: [{ scale: 1 + sparkle.value * 0.1 }],
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
        colors={active ? ['#6EE7B7', '#34D399', '#10B981'] : [T.stardust, '#C4B5FD', '#A78BFA']}
        style={[styles.puck, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Text style={styles.sparkleIcon}>✨</Text>
      </LinearGradient>
      {active && progress > 0 && <Text style={styles.puckPct}>{progress}%</Text>}
    </View>
  );
}

export function GravityTether({
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
  const pulse = useSharedValue(0.4);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 420 }), -1, true);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: active ? 0.55 + pulse.value * 0.35 : 0.28,
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
          backgroundColor: active ? T.success : T.tether,
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

// ─── Orbit meter & trail ────────────────────────────────────────────────────

export function OrbitLockMeter({
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
    <View pointerEvents="none" style={[styles.orbitWrap, { left: x - 52, top: y }]}>
      <Text style={styles.orbitLabel}>ORBIT</Text>
      <View style={styles.orbitBar}>
        <View style={[styles.orbitFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

export function StardustTrail({ points }: { points: DustPoint[] }) {
  return (
    <>
      {points.map((pt, i) => (
        <View
          key={`d${i}`}
          pointerEvents="none"
          style={[
            styles.dustDot,
            {
              left: pt.x - 5,
              top: pt.y - 5,
              opacity: pt.opacity * 0.55,
              width: 10 - i * 0.5,
              height: 10 - i * 0.5,
              borderRadius: 5,
            },
          ]}
        />
      ))}
    </>
  );
}

// ─── Countdown ──────────────────────────────────────────────────────────────

export function OrbitCountdown({ onDone }: { onDone: () => void }) {
  const [step, setStep] = React.useState(0);
  const steps = ['3', '2', '1', 'CHASE!'] as const;
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
  const isChase = steps[step] === 'CHASE!';
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.cdOverlay} pointerEvents="none">
      <Animated.View style={[styles.cdBubble, isChase && styles.cdChase, anim]}>
        <Text style={[styles.cdText, isChase && styles.cdChaseText]}>{steps[step]}</Text>
      </Animated.View>
    </View>
  );
}

// ─── Celebration ────────────────────────────────────────────────────────────

export function CometCelebration({ visible, x, y }: { visible: boolean; x: number; y: number }) {
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
      <View style={[styles.cosmicBurst, { left: x - 50, top: y - 50 }]} />
      <Animated.View style={[styles.celebrateBanner, { left: x - 62, top: y - COMET_HALF - 50 }, bannerStyle]}>
        <LinearGradient colors={['#EDE9FE', '#C4B5FD', '#A78BFA']} style={styles.celebrateGrad}>
          <Text style={styles.celebrateText}>☄️ Locked!</Text>
        </LinearGradient>
      </Animated.View>
      {sparks.map((_, i) => (
        <CosmicSpark key={i} i={i} x={x} y={y} go={visible} />
      ))}
    </View>
  );
}

function CosmicSpark({ i, x, y, go }: { i: number; x: number; y: number; go: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (!go) return;
    t.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) });
  }, [go, t]);

  const style = useAnimatedStyle(() => {
    const angle = (i / 10) * Math.PI * 2;
    const r = 14 + 55 * t.value;
    return {
      position: 'absolute',
      left: x + Math.cos(angle) * r - 3,
      top: y + Math.sin(angle) * r - 3,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: i % 2 === 0 ? T.cometHead : T.accent,
      opacity: 1 - t.value,
      transform: [{ scale: 1.3 - t.value * 0.7 }],
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

export function CometChaseHUD({
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
            <Text style={styles.hudLabel}>ORBIT</Text>
            <Text style={styles.hudRound}>
              {round}
              <Text style={styles.hudRoundTotal}>/{totalRounds}</Text>
            </Text>
          </View>
          <View style={styles.hudCenter}>
            <Text style={styles.hudTitle}>☄️ Comet Chase</Text>
            <View style={styles.orbitDots}>
              {Array.from({ length: totalRounds }).map((_, i) => (
                <View key={i} style={[styles.dot, i < score && styles.dotDone, i === round - 1 && styles.dotActive]} />
              ))}
            </View>
          </View>
          <Animated.View style={[styles.scoreBox, scoreBump]}>
            <Text style={styles.scoreLabel}>LOCKS</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </Animated.View>
        </View>
        {showHint && hint ? (
          <View style={styles.hintPill}>
            <Text style={styles.hudHint}>{hint}</Text>
          </View>
        ) : null}
        {isLocked && followProgress > 0 && (
          <View style={styles.hudOrbitBar}>
            <View style={[styles.hudOrbitFill, { width: `${followProgress}%` }]} />
          </View>
        )}
      </Glass>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  infoRoot: { flex: 1 },
  introCometWrap: { position: 'absolute', top: '17%', alignSelf: 'center', zIndex: 2 },
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
  chip: { backgroundColor: 'rgba(139,92,246,0.15)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)' },
  chipText: { fontSize: 13, fontWeight: '700', color: T.subtitle },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8, shadowColor: T.accentDark, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  startBtnGrad: { paddingVertical: 17, alignItems: 'center' },
  startBtnText: { fontSize: 18, fontWeight: '900', color: '#F5F3FF', letterSpacing: 0.3 },
  infoBackBtn: { paddingVertical: 8 },
  infoBackText: { fontSize: 14, fontWeight: '700', color: T.subtitle },

  nebula: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: T.nebula },
  vignette: { ...StyleSheet.absoluteFillObject },

  cometTail: { position: 'absolute', borderRadius: 4 },
  cometHead: { position: 'absolute', overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  cometCore: { position: 'absolute', alignSelf: 'center', top: '30%', backgroundColor: '#FFFBEB', opacity: 0.9 },
  lockRing: {
    position: 'absolute',
    alignSelf: 'center',
    top: -8,
    borderWidth: 2,
    borderColor: T.orbitLockGlow,
    borderStyle: 'dashed',
  },

  puck: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  puckRing: { position: 'absolute', top: -7, left: -7, borderWidth: 2, borderStyle: 'dashed' },
  sparkleIcon: { fontSize: 16 },
  puckPct: { position: 'absolute', bottom: -18, alignSelf: 'center', fontSize: 10, fontWeight: '800', color: T.success },

  dustDot: { position: 'absolute', backgroundColor: T.cometTail, zIndex: 2 },

  orbitWrap: { position: 'absolute', width: 104, zIndex: 8 },
  orbitLabel: { fontSize: 8, fontWeight: '800', color: T.orbitLock, letterSpacing: 1, marginBottom: 3, textAlign: 'center' },
  orbitBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden', borderWidth: 1, borderColor: T.orbitLockGlow },
  orbitFill: { height: '100%', backgroundColor: T.orbitLock, borderRadius: 3 },

  cdOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(2,6,23,0.4)', zIndex: 30 },
  cdBubble: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(30,27,75,0.92)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: T.accent },
  cdChase: { backgroundColor: T.accent, borderColor: T.cometHead },
  cdText: { fontSize: 48, fontWeight: '900', color: T.title },
  cdChaseText: { fontSize: 28, color: '#1E1B4B' },

  cosmicBurst: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: T.cometGlow, zIndex: 15 },
  celebrateBanner: { position: 'absolute', zIndex: 16, borderRadius: 14, overflow: 'hidden' },
  celebrateGrad: { paddingHorizontal: 18, paddingVertical: 8 },
  celebrateText: { fontSize: 15, fontWeight: '900', color: '#4C1D95' },

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
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(167,139,250,0.25)' },
  dotDone: { backgroundColor: T.success },
  dotActive: { backgroundColor: T.accent, width: 8, height: 8, borderRadius: 4 },
  scoreBox: { alignItems: 'flex-end' },
  scoreLabel: { fontSize: 9, fontWeight: '800', color: T.subtitle, letterSpacing: 1.2 },
  scoreValue: { fontSize: 22, fontWeight: '900', color: T.cometHead },
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
  hudOrbitBar: { marginTop: 8, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  hudOrbitFill: { height: '100%', backgroundColor: T.orbitLock, borderRadius: 3 },
});
