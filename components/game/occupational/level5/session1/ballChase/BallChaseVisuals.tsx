/**
 * Visual layer for Ball Chase — stadium field, HUD, ball, FX.
 */
import { BALL_CHASE_THEME as T } from '@/components/game/occupational/level5/session1/ballChase/ballChaseTheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const HALF = 34;

export type TrailPoint = { x: number; y: number; opacity: number };

// ─── Intro screen ───────────────────────────────────────────────────────────

type InfoProps = {
  onStart: () => void;
  onBack: () => void;
};

export function BallChaseInfoScreen({ onStart, onBack }: InfoProps) {
  const float = useSharedValue(0);
  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [float]);

  const ballFloat = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(float.value, [0, 1], [0, -14]) }],
  }));

  return (
    <View style={styles.infoRoot}>
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <StadiumHorizon />
      <View style={styles.infoGrass}>
        <LinearGradient colors={[...T.grass]} style={StyleSheet.absoluteFillObject} />
        <FieldMarkings />
      </View>

      <Animated.View style={[styles.infoBallWrap, ballFloat]}>
        <Text style={styles.infoBallEmoji}>⚽</Text>
      </Animated.View>

      <View style={styles.infoCard}>
        <Text style={styles.infoEmojiBadge}>⚽</Text>
        <Text style={styles.infoTitle}>Ball Chase</Text>
        <Text style={styles.infoTagline}>Stadium · Visual Tracking</Text>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionLabel}>How to play</Text>
          <Text style={styles.infoBody}>
            Watch the ball bounce across the pitch. When you see it, tap to score a goal!
          </Text>
        </View>

        <View style={styles.chipRow}>
          {['👀 Track', '⚡ React', '🎯 Tap'].map((chip) => (
            <View key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={['#FACC15', '#EAB308', '#CA8A04']} style={styles.startBtnGrad}>
            <Text style={styles.startBtnText}>Enter the Pitch</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoBackBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.infoBackText}>← Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Stadium backdrop ───────────────────────────────────────────────────────

export function StadiumBackdrop() {
  const flicker = useSharedValue(0);
  useEffect(() => {
    flicker.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.65, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [flicker]);

  const lightStyle = useAnimatedStyle(() => ({ opacity: interpolate(flicker.value, [0, 1], [0.5, 1]) }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} locations={[0, 0.45, 0.8, 1]} style={styles.sky} />
      <StadiumHorizon />
      <View style={styles.pitch}>
        <LinearGradient colors={[...T.grass]} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
        <GrassStripes />
        <FieldMarkings />
        <GoalPosts side="left" />
        <GoalPosts side="right" />
      </View>
      <Animated.View style={[styles.floodLeft, lightStyle]} />
      <Animated.View style={[styles.floodRight, lightStyle]} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.12)']}
        style={styles.vignette}
        pointerEvents="none"
      />
    </View>
  );
}

function StadiumHorizon() {
  const dots = Array.from({ length: 28 });
  return (
    <View style={styles.crowdRow} pointerEvents="none">
      {dots.map((_, i) => (
        <View
          key={i}
          style={[
            styles.crowdDot,
            {
              height: 8 + (i % 5) * 4,
              opacity: 0.35 + (i % 4) * 0.12,
              marginTop: (i % 3) * 2,
            },
          ]}
        />
      ))}
    </View>
  );
}

function GrassStripes() {
  const stripes = Array.from({ length: 14 });
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stripes.map((_, i) => (
        <View
          key={i}
          style={[
            styles.grassStripe,
            { top: `${(i / stripes.length) * 100}%`, opacity: i % 2 === 0 ? 1 : 0 },
          ]}
        />
      ))}
    </View>
  );
}

function FieldMarkings() {
  return (
    <>
      <View style={styles.centerCircle} />
      <View style={styles.centerDot} />
      <View style={styles.halfLine} />
    </>
  );
}

function GoalPosts({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  return (
    <View style={[styles.goalWrap, isLeft ? styles.goalLeft : styles.goalRight]} pointerEvents="none">
      <View style={[styles.goalPost, styles.goalPostVertical]} />
      <View style={[styles.goalPost, styles.goalPostCross]} />
      <View style={styles.goalNet} />
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
};

export function BallChaseHUD({ round, totalRounds, score, hint, showHint }: HudProps) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.04, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      false,
    );
  }, [pulse]);

  const scorePulse = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const Glass = Platform.OS === 'ios' ? BlurView : View;
  const glassProps = Platform.OS === 'ios' ? { intensity: 55, tint: 'light' as const } : {};

  return (
    <View style={styles.hudWrap} pointerEvents="none">
      <Glass {...glassProps} style={styles.hudGlass}>
        <View style={styles.hudTopRow}>
          <View>
            <Text style={styles.hudLabel}>MATCH</Text>
            <Text style={styles.hudRound}>
              {round}
              <Text style={styles.hudRoundTotal}>/{totalRounds}</Text>
            </Text>
          </View>
          <View style={styles.hudTitleBlock}>
            <Text style={styles.hudTitle}>⚽ Ball Chase</Text>
            <View style={styles.progressDots}>
              {Array.from({ length: totalRounds }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i < round - 1 && styles.dotDone,
                    i === round - 1 && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          </View>
          <Animated.View style={[styles.scoreBox, scorePulse]}>
            <Text style={styles.scoreLabel}>GOALS</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </Animated.View>
        </View>
        {showHint && hint ? <Text style={styles.hudHint}>{hint}</Text> : null}
      </Glass>
    </View>
  );
}

// ─── Countdown overlay ──────────────────────────────────────────────────────

export function RoundCountdown({ onDone }: { onDone: () => void }) {
  const [step, setStep] = React.useState(0);
  const steps = ['3', '2', '1', 'GO!'] as const;
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0);
  const onDoneRef = React.useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (step >= steps.length) {
      onDoneRef.current();
      return;
    }
    scale.value = 0.35;
    opacity.value = 0;
    scale.value = withSpring(1, { damping: 11, stiffness: 180 });
    opacity.value = withSequence(
      withTiming(1, { duration: 120 }),
      withTiming(1, { duration: step === steps.length - 1 ? 380 : 520 }),
      withTiming(0, { duration: 180 }),
    );
    const delay = step === steps.length - 1 ? 680 : 780;
    const t = setTimeout(() => setStep((s) => s + 1), delay);
    return () => clearTimeout(t);
  }, [step, steps.length, scale, opacity]);

  const anim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (step >= steps.length) return null;

  const isGo = steps[step] === 'GO!';

  return (
    <View style={styles.countdownOverlay} pointerEvents="none">
      <Animated.View style={[styles.countdownBubble, isGo && styles.countdownGo, anim]}>
        <Text style={[styles.countdownText, isGo && styles.countdownGoText]}>{steps[step]}</Text>
      </Animated.View>
    </View>
  );
}

// ─── Soccer ball + trail ────────────────────────────────────────────────────

type BallProps = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  trail: TrailPoint[];
  showAimRing: boolean;
};

export function SoccerBallView({ x, y, scale, rotation, trail, showAimRing }: BallProps) {
  const ring = useSharedValue(0);
  useEffect(() => {
    if (!showAimRing) return;
    ring.value = 0;
    ring.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, [showAimRing, ring]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ring.value, [0, 0.15, 1], [0, 0.55, 0]),
    transform: [{ scale: interpolate(ring.value, [0, 1], [0.85, 1.45]) }],
  }));

  const shadowScale = 0.75 + (y / 600) * 0.2;

  return (
    <>
      {trail.map((pt, i) => (
        <View
          key={`trail-${i}`}
          pointerEvents="none"
          style={[
            styles.trailDot,
            {
              left: pt.x - 6,
              top: pt.y - 6,
              opacity: pt.opacity * 0.35,
            },
          ]}
        />
      ))}

      <View
        pointerEvents="none"
        style={[
          styles.ballShadow,
          {
            left: x - 22 * shadowScale,
            top: y + HALF - 6,
            width: 44 * shadowScale,
            height: 14 * shadowScale,
          },
        ]}
      />

      {showAimRing && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.aimRing,
            { left: x - HALF - 10, top: y - HALF - 10, width: (HALF + 10) * 2, height: (HALF + 10) * 2 },
            ringStyle,
          ]}
        />
      )}

      <View
        pointerEvents="none"
        style={[
          styles.ballOuter,
          {
            left: x - HALF,
            top: y - HALF,
            transform: [{ scale }, { rotate: `${rotation}deg` }],
          },
        ]}
      >
        <LinearGradient colors={['#FFFFFF', '#E2E8F0', '#CBD5E1']} style={styles.ballGrad}>
          <Text style={styles.ballEmoji}>⚽</Text>
        </LinearGradient>
        <View style={styles.ballShine} />
      </View>
    </>
  );
}

// ─── Goal celebration ───────────────────────────────────────────────────────

export function GoalCelebration({ visible, x, y }: { visible: boolean; x: number; y: number }) {
  const burst = useSharedValue(0);
  useEffect(() => {
    if (!visible) return;
    burst.value = 0;
    burst.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) });
  }, [visible, burst]);

  if (!visible) return null;

  const particles = Array.from({ length: 12 });
  const colors = ['#FACC15', '#FFFFFF', '#22C55E', '#FDE047'];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.goalFlash, { left: x - 50, top: y - 50 }]} />
      <Text style={[styles.goalText, { left: x - 48, top: y - HALF - 44 }]}>GOAL!</Text>
      {particles.map((_, i) => (
        <GoalParticle key={i} i={i} n={particles.length} x={x} y={y} color={colors[i % colors.length]!} go={visible} />
      ))}
    </View>
  );
}

function GoalParticle({
  i,
  n,
  x,
  y,
  color,
  go,
}: {
  i: number;
  n: number;
  x: number;
  y: number;
  color: string;
  go: boolean;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (!go) return;
    t.value = 0;
    t.value = withTiming(1, { duration: 580, easing: Easing.out(Easing.cubic) });
  }, [go, t]);

  const style = useAnimatedStyle(() => {
    const angle = (i / n) * Math.PI * 2;
    const r = 18 + 56 * t.value;
    return {
      position: 'absolute',
      left: x + Math.cos(angle) * r - 5,
      top: y + Math.sin(angle) * r - 5,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: color,
      opacity: 1 - t.value,
      transform: [{ scale: 1.2 - t.value * 0.7 }],
    };
  });

  return <Animated.View style={style} />;
}

// ─── Waiting state ──────────────────────────────────────────────────────────

export function KickoffBanner({ text }: { text: string }) {
  const op = useSharedValue(0.4);
  useEffect(() => {
    op.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.45, { duration: 700 })),
      -1,
      false,
    );
  }, [op]);
  const style = useAnimatedStyle(() => ({ opacity: op.value }));
  return (
    <Animated.View style={[styles.kickoffBanner, style]} pointerEvents="none">
      <Text style={styles.kickoffText}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  infoRoot: { flex: 1 },
  infoGrass: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '42%' },
  infoBallWrap: {
    position: 'absolute',
    top: '18%',
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  infoBallEmoji: { fontSize: 52 },
  infoCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 32,
    backgroundColor: T.hudGlass,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: T.hudBorder,
    alignItems: 'center',
    shadowColor: '#0369A1',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  infoEmojiBadge: { fontSize: 40, marginBottom: 4 },
  infoTitle: { fontSize: 32, fontWeight: '900', color: T.title, letterSpacing: -0.5 },
  infoTagline: {
    fontSize: 13,
    fontWeight: '700',
    color: T.subtitle,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  infoSection: { width: '100%', marginBottom: 14 },
  infoSectionLabel: { fontSize: 12, fontWeight: '800', color: T.accentDark, marginBottom: 6, textTransform: 'uppercase' },
  infoBody: { fontSize: 15, lineHeight: 22, color: '#334155', fontWeight: '500' },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 18, flexWrap: 'wrap', justifyContent: 'center' },
  chip: {
    backgroundColor: 'rgba(14,165,233,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.2)',
  },
  chipText: { fontSize: 13, fontWeight: '700', color: T.subtitle },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 10 },
  startBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  startBtnText: { fontSize: 18, fontWeight: '900', color: '#422006', letterSpacing: 0.3 },
  infoBackBtn: { paddingVertical: 8 },
  infoBackText: { fontSize: 15, fontWeight: '700', color: T.subtitle },

  sky: { height: '38%' },
  crowdRow: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  crowdDot: {
    width: 10,
    borderRadius: 3,
    backgroundColor: T.crowdSilhouette,
  },
  pitch: { flex: 1, marginTop: '30%' },
  grassStripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '7.5%',
    backgroundColor: T.grassStripe,
  },
  centerCircle: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2.5,
    borderColor: T.lineWhite,
  },
  centerDot: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
    marginTop: 53,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.lineWhite,
  },
  halfLine: {
    position: 'absolute',
    top: '22%',
    left: '6%',
    right: '6%',
    height: 2,
    backgroundColor: T.lineWhite,
    opacity: 0.7,
  },
  goalWrap: { position: 'absolute', top: 8, width: 56, height: 44 },
  goalLeft: { left: '8%' },
  goalRight: { right: '8%' },
  goalPost: { position: 'absolute', backgroundColor: T.goalPost, borderRadius: 2 },
  goalPostVertical: { left: 0, top: 0, width: 4, height: 40 },
  goalPostCross: { left: 0, top: 0, width: 52, height: 4 },
  goalNet: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: 48,
    height: 36,
    borderWidth: 1,
    borderColor: T.goalNet,
    borderStyle: 'dashed',
    opacity: 0.6,
  },
  floodLeft: {
    position: 'absolute',
    top: 48,
    left: 24,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: T.floodlight,
    shadowColor: T.floodlight,
    shadowOpacity: 0.9,
    shadowRadius: 18,
  },
  floodRight: {
    position: 'absolute',
    top: 48,
    right: 24,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: T.floodlight,
    shadowColor: T.floodlight,
    shadowOpacity: 0.9,
    shadowRadius: 18,
  },
  vignette: { ...StyleSheet.absoluteFillObject },

  hudWrap: { paddingHorizontal: 12, paddingTop: 44, zIndex: 20 },
  hudGlass: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: T.hudBorder,
    backgroundColor: Platform.OS === 'android' ? T.hudGlass : 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  hudTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hudLabel: { fontSize: 10, fontWeight: '800', color: T.subtitle, letterSpacing: 1 },
  hudRound: { fontSize: 26, fontWeight: '900', color: T.title },
  hudRoundTotal: { fontSize: 16, fontWeight: '700', color: T.subtitle },
  hudTitleBlock: { alignItems: 'center', flex: 1 },
  hudTitle: { fontSize: 15, fontWeight: '900', color: T.title, marginBottom: 6 },
  progressDots: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 140 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(14,165,233,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.35)',
  },
  dotDone: { backgroundColor: T.success, borderColor: T.success },
  dotActive: { backgroundColor: T.accent, borderColor: T.accentDark, transform: [{ scale: 1.2 }] },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(250,204,21,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.45)',
  },
  scoreLabel: { fontSize: 9, fontWeight: '800', color: T.accentDark, letterSpacing: 0.8 },
  scoreValue: { fontSize: 24, fontWeight: '900', color: '#854D0E' },
  hudHint: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    color: T.cue,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
    zIndex: 30,
  },
  countdownBubble: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: T.accent,
    shadowColor: T.accent,
    shadowOpacity: 0.45,
    shadowRadius: 20,
  },
  countdownGo: { backgroundColor: T.accent, borderColor: '#FFF' },
  countdownText: { fontSize: 52, fontWeight: '900', color: T.title },
  countdownGoText: { fontSize: 36, fontWeight: '900', color: '#422006' },

  trailDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  ballShadow: {
    position: 'absolute',
    backgroundColor: T.ballShadow,
    borderRadius: 999,
  },
  aimRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: T.accentGlow,
  },
  ballOuter: {
    position: 'absolute',
    width: HALF * 2,
    height: HALF * 2,
    borderRadius: HALF,
    zIndex: 5,
  },
  ballGrad: {
    flex: 1,
    borderRadius: HALF,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  ballEmoji: { fontSize: 38 },
  ballShine: {
    position: 'absolute',
    top: 8,
    left: 10,
    width: 16,
    height: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.65)',
    transform: [{ rotate: '-30deg' }],
  },

  goalFlash: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(250,204,21,0.35)',
  },
  goalText: {
    position: 'absolute',
    fontSize: 28,
    fontWeight: '900',
    color: T.accent,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    zIndex: 40,
  },

  kickoffBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '46%',
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: T.hudBorder,
  },
  kickoffText: { fontSize: 16, fontWeight: '800', color: T.title, letterSpacing: 0.5 },
});

export const BALL_RADIUS = HALF;
