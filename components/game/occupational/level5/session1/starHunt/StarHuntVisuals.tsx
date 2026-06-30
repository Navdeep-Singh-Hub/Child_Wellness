/**
 * Visual layer for Star Hunt — cosmos, comet star, stardust, tap FX.
 */
import { STAR_HUNT_THEME as T } from '@/components/game/occupational/level5/session1/starHunt/starHuntTheme';
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

const HALF = 32;

export type StardustPoint = { x: number; y: number; opacity: number };
export type TapRippleData = { id: number; x: number; y: number; kind: 'hit' | 'miss' | 'near' };

// ─── Intro ──────────────────────────────────────────────────────────────────

type InfoProps = { onStart: () => void; onBack: () => void };

function IntroComet() {
  const dash = useSharedValue(0);
  useEffect(() => {
    dash.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [dash]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(dash.value, [0, 1], [-40, 40]) },
      { translateY: interpolate(dash.value, [0, 0.5, 1], [0, -20, 0]) },
      { rotate: `${interpolate(dash.value, [0, 1], [-15, 25])}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.introCometWrap, style]}>
      <CometGraphic size={72} angle={-20} />
    </Animated.View>
  );
}

export function StarHuntInfoScreen({ onStart, onBack }: InfoProps) {
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
      <LinearGradient colors={[...T.space]} locations={[0, 0.4, 0.8, 1]} style={StyleSheet.absoluteFillObject} />
      <NebulaClouds />
      <BackgroundStars count={30} />
      <IntroComet />

      <Animated.View style={[styles.infoCard, cardAnim]}>
        <Text style={styles.infoEmoji}>⭐</Text>
        <Text style={styles.infoTitle}>Star Hunt</Text>
        <Text style={styles.infoTagline}>Cosmic Chase · Predictive Tracking</Text>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionLabel}>How to play</Text>
          <Text style={styles.infoBody}>
            A golden comet darts unpredictably across the night sky. Watch its path and tap to catch it before it warps away!
          </Text>
        </View>

        <View style={styles.chipRow}>
          {['👀 Predict', '⚡ React', '⭐ Catch'].map((chip) => (
            <View key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={['#FDE68A', '#FBBF24', '#F59E0B', '#D97706']} style={styles.startBtnGrad}>
            <Text style={styles.startBtnText}>🌌 Launch Into Space</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoBackBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.infoBackText}>← Back to games</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── Cosmos backdrop ────────────────────────────────────────────────────────

export function CosmosBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.space]} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
      <NebulaClouds />
      <BackgroundStars count={45} />
      <ConstellationLines />
      <LinearGradient colors={['transparent', 'rgba(2,6,23,0.3)']} style={styles.vignette} />
    </View>
  );
}

function NebulaClouds() {
  return (
    <>
      <View style={[styles.nebula, { top: '12%', left: '5%', width: 160, height: 100, opacity: 0.7 }]} />
      <View style={[styles.nebula, { top: '35%', right: '0%', width: 140, height: 90, opacity: 0.5 }]} />
      <View style={[styles.nebula, { bottom: '20%', left: '20%', width: 120, height: 80, opacity: 0.4 }]} />
    </>
  );
}

function BackgroundStars({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TwinkleStar key={i} index={i} />
      ))}
    </>
  );
}

function TwinkleStar({ index }: { index: number }) {
  const twinkle = useSharedValue(0.3);
  useEffect(() => {
    twinkle.value = withDelay(
      index * 80,
      withRepeat(
        withSequence(withTiming(1, { duration: 800 + (index % 5) * 200 }), withTiming(0.2, { duration: 800 + (index % 5) * 200 })),
        -1,
        false,
      ),
    );
  }, [twinkle, index]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: `${(index * 17 + 3) % 96}%`,
    top: `${(index * 23 + 7) % 88}%`,
    width: 2 + (index % 3),
    height: 2 + (index % 3),
    borderRadius: 2,
    backgroundColor: T.bgStar,
    opacity: twinkle.value,
  }));

  return <Animated.View style={style} pointerEvents="none" />;
}

function ConstellationLines() {
  const lines = [
    { x1: '15%', y1: '20%', x2: '28%', y2: '15%' },
    { x1: '28%', y1: '15%', x2: '38%', y2: '22%' },
    { x1: '60%', y1: '18%', x2: '72%', y2: '12%' },
    { x1: '72%', y1: '12%', x2: '82%', y2: '20%' },
  ];
  return (
    <>
      {lines.map((l, i) => (
        <View
          key={i}
          style={[styles.constellationLine, { left: l.x1, top: l.y1, width: 40, transform: [{ rotate: `${i * 15 - 10}deg` }] }]}
          pointerEvents="none"
        />
      ))}
    </>
  );
}

// ─── Comet star ─────────────────────────────────────────────────────────────

function CometGraphic({ size, angle }: { size: number; angle: number }) {
  const tailLen = size * 0.9;
  return (
    <View style={{ width: size + tailLen, height: size, transform: [{ rotate: `${angle}deg` }] }}>
      <LinearGradient
        colors={[T.starTail, 'transparent']}
        start={{ x: 1, y: 0.5 }}
        end={{ x: 0, y: 0.5 }}
        style={[styles.cometTail, { width: tailLen, height: size * 0.35, right: size * 0.5 }]}
      />
      <View style={[styles.cometCore, { width: size * 0.55, height: size * 0.55, borderRadius: size * 0.28 }]}>
        <LinearGradient colors={[T.cometWhite, T.starCore, T.starGold]} style={StyleSheet.absoluteFillObject} />
        <View style={styles.cometShine} />
      </View>
      <Text style={[styles.starPoints, { fontSize: size * 0.35, right: size * 0.15, top: size * 0.1 }]}>✦</Text>
    </View>
  );
}

export function CometStarView({
  x,
  y,
  scale,
  angle,
  showAimRing,
}: {
  x: number;
  y: number;
  scale: number;
  angle: number;
  showAimRing: boolean;
}) {
  const pulse = useSharedValue(0);
  const ring = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0, { duration: 700 })),
      -1,
      false,
    );
  }, [pulse]);

  useEffect(() => {
    if (!showAimRing) return;
    ring.value = withRepeat(
      withSequence(withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 0 })),
      -1,
      false,
    );
  }, [showAimRing, ring]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.4, 0.75]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.2]) }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ring.value, [0, 0.12, 1], [0, 0.55, 0]),
    transform: [{ scale: interpolate(ring.value, [0, 1], [0.85, 1.5]) }],
  }));

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: x - HALF, top: y - HALF, zIndex: 5, transform: [{ scale }] }}>
      {showAimRing && (
        <Animated.View style={[styles.aimRing, { left: -10, top: -10, width: (HALF + 10) * 2, height: (HALF + 10) * 2 }, ringStyle]} />
      )}
      <Animated.View style={[styles.starGlow, glowStyle]} />
      <CometGraphic size={HALF * 2} angle={angle} />
    </View>
  );
}

// ─── Stardust trail ─────────────────────────────────────────────────────────

export function StardustTrail({ points, angle }: { points: StardustPoint[]; angle: number }) {
  const rad = (angle * Math.PI) / 180;
  const ox = Math.cos(rad + Math.PI) * 12;
  const oy = Math.sin(rad + Math.PI) * 12;

  return (
    <>
      {points.map((pt, i) => (
        <View
          key={`dust-${i}`}
          pointerEvents="none"
          style={[
            styles.dustParticle,
            {
              left: pt.x + ox * (i + 1) * 0.5 - 3,
              top: pt.y + oy * (i + 1) * 0.5 - 3,
              opacity: pt.opacity * 0.55,
              width: 6 - i * 0.3,
              height: 6 - i * 0.3,
            },
          ]}
        />
      ))}
    </>
  );
}

// ─── Warp flash ─────────────────────────────────────────────────────────────

export function WarpFlash({ visible, x, y }: { visible: boolean; x: number; y: number }) {
  const flash = useSharedValue(0);
  useEffect(() => {
    if (!visible) return;
    flash.value = 0;
    flash.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
  }, [visible, flash]);

  if (!visible) return null;

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x - 30,
    top: y - 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: T.warpLine,
    backgroundColor: T.nearMissGlow,
    opacity: 1 - flash.value,
    transform: [{ scale: 0.5 + flash.value * 1.5 }],
    zIndex: 4,
  }));

  return <Animated.View style={style} pointerEvents="none" />;
}

// ─── Tap ripples ────────────────────────────────────────────────────────────

export function TapRippleLayer({ ripples }: { ripples: TapRippleData[] }) {
  return (
    <>
      {ripples.map((r) => (
        <TapRipple key={r.id} {...r} />
      ))}
    </>
  );
}

function TapRipple({ x, y, kind }: TapRippleData) {
  const expand = useSharedValue(0);
  const color = kind === 'hit' ? T.successGlow : kind === 'near' ? T.nearMissGlow : T.miss;
  const border = kind === 'hit' ? T.accent : kind === 'near' ? T.nearMiss : '#94A3B8';

  useEffect(() => {
    expand.value = 0;
    expand.value = withTiming(1, { duration: 560, easing: Easing.out(Easing.cubic) });
  }, [expand, kind]);

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

// ─── Celebration ────────────────────────────────────────────────────────────

export function StarCelebration({ visible, x, y }: { visible: boolean; x: number; y: number }) {
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

  const rays = Array.from({ length: 12 });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.supernova, { left: x - 50, top: y - 50 }]} />
      <Animated.View style={[styles.celebrateBanner, { left: x - 62, top: y - HALF - 48 }, bannerStyle]}>
        <LinearGradient colors={['#FEF3C7', '#FDE68A', '#FBBF24']} style={styles.celebrateGrad}>
          <Text style={styles.celebrateText}>⭐ Caught!</Text>
        </LinearGradient>
      </Animated.View>
      {rays.map((_, i) => (
        <SupernovaRay key={i} i={i} x={x} y={y} go={visible} />
      ))}
    </View>
  );
}

function SupernovaRay({ i, x, y, go }: { i: number; x: number; y: number; go: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (!go) return;
    t.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) });
  }, [go, t]);

  const style = useAnimatedStyle(() => {
    const angle = (i / 12) * Math.PI * 2;
    const r = 16 + 58 * t.value;
    return {
      position: 'absolute',
      left: x + Math.cos(angle) * r - 3,
      top: y + Math.sin(angle) * r - 3,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: i % 2 === 0 ? T.starGold : T.cometWhite,
      opacity: 1 - t.value,
      transform: [{ scale: 1.4 - t.value * 0.8 }],
    };
  });

  return <Animated.View style={style} />;
}

// ─── Near miss ──────────────────────────────────────────────────────────────

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
      <Text style={styles.nearMissText}>✨ Almost!</Text>
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

export function StarHuntHUD({ round, totalRounds, score, hint, showHint }: HudProps) {
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
              {round}<Text style={styles.hudRoundTotal}>/{totalRounds}</Text>
            </Text>
          </View>
          <View style={styles.hudCenter}>
            <Text style={styles.hudTitle}>⭐ Star Hunt</Text>
            <View style={styles.orbitDots}>
              {Array.from({ length: totalRounds }).map((_, i) => (
                <View key={i} style={[styles.dot, i < score && styles.dotDone, i === round - 1 && styles.dotActive]} />
              ))}
            </View>
          </View>
          <Animated.View style={[styles.scoreBox, scoreBump]}>
            <Text style={styles.scoreLabel}>STARS</Text>
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
  introCometWrap: { position: 'absolute', top: '16%', alignSelf: 'center' },
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
  chip: { backgroundColor: 'rgba(251,191,36,0.12)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(251,191,36,0.25)' },
  chipText: { fontSize: 13, fontWeight: '700', color: T.subtitle },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8, shadowColor: T.accentDark, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  startBtnGrad: { paddingVertical: 17, alignItems: 'center' },
  startBtnText: { fontSize: 18, fontWeight: '900', color: '#78350F', letterSpacing: 0.3 },
  infoBackBtn: { paddingVertical: 8 },
  infoBackText: { fontSize: 14, fontWeight: '700', color: T.subtitle },

  nebula: { position: 'absolute', borderRadius: 60, backgroundColor: T.nebula[0] },
  vignette: { ...StyleSheet.absoluteFillObject },
  constellationLine: { position: 'absolute', height: 1, backgroundColor: T.constellation },

  cometTail: { position: 'absolute', top: '32%', borderRadius: 4 },
  cometCore: { position: 'absolute', right: 0, top: '22%', overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)' },
  cometShine: { position: 'absolute', top: 4, left: 6, width: 8, height: 6, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 4 },
  starPoints: { position: 'absolute', color: T.cometWhite },

  starGlow: { position: 'absolute', alignSelf: 'center', width: HALF * 2.2, height: HALF * 2.2, borderRadius: HALF * 1.1, backgroundColor: T.starGlow },
  aimRing: { position: 'absolute', borderRadius: 999, borderWidth: 2, borderColor: T.starGlow },
  dustParticle: { position: 'absolute', borderRadius: 999, backgroundColor: T.starTail },

  supernova: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: T.successGlow },
  celebrateBanner: { position: 'absolute', borderRadius: 18, overflow: 'hidden', zIndex: 40 },
  celebrateGrad: { paddingHorizontal: 24, paddingVertical: 12 },
  celebrateText: { fontSize: 24, fontWeight: '900', color: '#78350F' },

  nearMissToast: {
    position: 'absolute',
    alignSelf: 'center',
    top: '56%',
    backgroundColor: 'rgba(167,139,250,0.9)',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    zIndex: 25,
  },
  nearMissText: { fontSize: 16, fontWeight: '900', color: '#FFF' },

  hudWrap: { paddingHorizontal: 12, paddingTop: 44, zIndex: 20 },
  hudGlass: { borderRadius: 22, overflow: 'hidden', borderWidth: 1.5, borderColor: T.hudBorder, backgroundColor: T.hudGlass, paddingHorizontal: 14, paddingVertical: 12 },
  hudRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hudLabel: { fontSize: 9, fontWeight: '800', color: T.subtitle, letterSpacing: 1.2 },
  hudRound: { fontSize: 26, fontWeight: '900', color: T.title },
  hudRoundTotal: { fontSize: 14, fontWeight: '700', color: T.subtitle },
  hudCenter: { alignItems: 'center', flex: 1 },
  hudTitle: { fontSize: 13, fontWeight: '900', color: T.title, marginBottom: 5 },
  orbitDots: { flexDirection: 'row', gap: 3, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 140 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(251,191,36,0.2)', borderWidth: 1, borderColor: 'rgba(251,191,36,0.35)' },
  dotDone: { backgroundColor: T.accent, borderColor: T.accent },
  dotActive: { backgroundColor: T.cometWhite, borderColor: T.accent, transform: [{ scale: 1.3 }] },
  scoreBox: { alignItems: 'center', backgroundColor: 'rgba(251,191,36,0.18)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(251,191,36,0.4)' },
  scoreLabel: { fontSize: 8, fontWeight: '800', color: T.accent, letterSpacing: 0.8 },
  scoreValue: { fontSize: 24, fontWeight: '900', color: T.title },
  hintPill: { marginTop: 8, alignSelf: 'center', backgroundColor: 'rgba(251,191,36,0.1)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(251,191,36,0.22)' },
  hudHint: { fontSize: 13, fontWeight: '800', color: T.subtitle, letterSpacing: 0.3 },
});

export const STAR_HUNT_RADIUS = HALF;
