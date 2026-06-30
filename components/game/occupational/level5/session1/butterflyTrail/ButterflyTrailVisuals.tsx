/**
 * Visual layer for Butterfly Trail — enchanted garden, butterfly, nectar FX.
 */
import { BUTTERFLY_TRAIL_THEME as T } from '@/components/game/occupational/level5/session1/butterflyTrail/butterflyTrailTheme';
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

export type DustPoint = { x: number; y: number; opacity: number };

// ─── Intro ──────────────────────────────────────────────────────────────────

type InfoProps = { onStart: () => void; onBack: () => void };

function IntroButterfly() {
  const fly = useSharedValue(0);
  const flap = useSharedValue(0);

  useEffect(() => {
    fly.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    flap.value = withRepeat(
      withSequence(withTiming(1, { duration: 180 }), withTiming(0, { duration: 180 })),
      -1,
      false,
    );
  }, [fly, flap]);

  const flyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(fly.value, [0, 1], [-30, 30]) },
      { translateY: interpolate(fly.value, [0, 0.5, 1], [0, -18, 0]) },
    ],
  }));

  return (
    <Animated.View style={[styles.introButterflyWrap, flyStyle]}>
      <ButterflyGraphic size={80} flap={flap} />
    </Animated.View>
  );
}

export function ButterflyTrailInfoScreen({ onStart, onBack }: InfoProps) {
  const cardOp = useSharedValue(0);
  const cardY = useSharedValue(40);

  useEffect(() => {
    cardOp.value = withTiming(1, { duration: 550 });
    cardY.value = withSpring(0, { damping: 16, stiffness: 110 });
  }, [cardOp, cardY]);

  const cardAnim = useAnimatedStyle(() => ({
    opacity: cardOp.value,
    transform: [{ translateY: cardY.value }],
  }));

  return (
    <View style={styles.infoRoot}>
      <LinearGradient colors={[...T.sky]} locations={[0, 0.4, 0.8, 1]} style={StyleSheet.absoluteFillObject} />
      <SunRays />
      <FloatingPetals count={6} />
      <View style={styles.infoMeadow}>
        <LinearGradient colors={[...T.meadow]} locations={[0, 0.4, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
        <MeadowFlowers />
      </View>
      <IntroButterfly />

      <Animated.View style={[styles.infoCard, cardAnim]}>
        <Text style={styles.infoEmoji}>🦋</Text>
        <Text style={styles.infoTitle}>Butterfly Trail</Text>
        <Text style={styles.infoTagline}>Enchanted Garden · Smooth Pursuit</Text>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionLabel}>How to play</Text>
          <Text style={styles.infoBody}>
            Slide your finger to follow the butterfly as it flutters through the meadow. Stay close for 3 seconds to collect nectar!
          </Text>
        </View>

        <View style={styles.chipRow}>
          {['👆 Follow', '👀 Track', '🌸 Collect'].map((chip) => (
            <View key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={['#6EE7B7', '#34D399', '#10B981', '#059669']} style={styles.startBtnGrad}>
            <Text style={styles.startBtnText}>🌸 Enter the Garden</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoBackBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.infoBackText}>← Back to games</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── Garden backdrop ────────────────────────────────────────────────────────

export function GardenBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} locations={[0, 0.35, 0.7, 1]} style={styles.skyBand} />
      <SunRays />
      <FloatingPetals count={10} />
      <View style={styles.meadowBand}>
        <LinearGradient colors={[...T.meadow]} locations={[0, 0.3, 0.65, 1]} style={StyleSheet.absoluteFillObject} />
        <GrassBlades />
        <MeadowFlowers />
      </View>
      <LinearGradient colors={['transparent', 'rgba(6,78,59,0.12)']} style={styles.vignette} />
    </View>
  );
}

function SunRays() {
  const pulse = useSharedValue(0.5);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View style={[styles.sunDisc, style]} pointerEvents="none">
      <LinearGradient colors={[T.sunlightGlow, T.sunlight, 'transparent']} style={StyleSheet.absoluteFillObject} />
    </Animated.View>
  );
}

function FloatingPetals({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <FallingPetal key={i} index={i} />
      ))}
    </>
  );
}

function FallingPetal({ index }: { index: number }) {
  const fall = useSharedValue(0);
  const colors = [T.flowerPink, T.flowerPurple, T.flowerYellow, '#FDA4AF'];

  useEffect(() => {
    fall.value = withDelay(
      index * 600,
      withRepeat(withTiming(1, { duration: 4000 + index * 400, easing: Easing.linear }), -1, false),
    );
  }, [fall, index]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: `${(index * 23 + 5) % 90}%`,
    top: interpolate(fall.value, [0, 1], [-10, 110]),
    width: 8 + (index % 3) * 2,
    height: 10 + (index % 2) * 3,
    backgroundColor: colors[index % colors.length],
    borderRadius: 4,
    opacity: 0.5 + (index % 3) * 0.15,
    transform: [{ rotate: `${fall.value * 360 + index * 45}deg` }],
  }));

  return <Animated.View style={style} pointerEvents="none" />;
}

function GrassBlades() {
  const blades = Array.from({ length: 20 });
  return (
    <View style={styles.grassRow} pointerEvents="none">
      {blades.map((_, i) => (
        <View
          key={i}
          style={[
            styles.grassBlade,
            {
              height: 12 + (i % 5) * 6,
              opacity: 0.4 + (i % 4) * 0.12,
              transform: [{ rotate: `${-8 + (i % 5) * 4}deg` }],
            },
          ]}
        />
      ))}
    </View>
  );
}

function MeadowFlowers() {
  const flowers = [
    { left: '8%', bottom: 28, color: T.flowerPink, size: 22 },
    { left: '22%', bottom: 18, color: T.flowerYellow, size: 18 },
    { left: '38%', bottom: 32, color: T.flowerPurple, size: 20 },
    { left: '55%', bottom: 14, color: T.flowerOrange, size: 24 },
    { left: '72%', bottom: 26, color: T.flowerPink, size: 19 },
    { left: '88%', bottom: 20, color: T.flowerYellow, size: 21 },
    { left: '15%', bottom: 8, color: T.flowerPurple, size: 16 },
    { left: '65%', bottom: 6, color: T.flowerOrange, size: 17 },
  ];
  return (
    <>
      {flowers.map((f, i) => (
        <GardenFlower key={i} {...f} />
      ))}
    </>
  );
}

function GardenFlower({ left, bottom, color, size }: { left: string; bottom: number; color: string; size: number }) {
  const sway = useSharedValue(0);
  useEffect(() => {
    sway.value = withRepeat(
      withSequence(withTiming(1, { duration: 1800 + size * 40 }), withTiming(0, { duration: 1800 + size * 40 })),
      -1,
      false,
    );
  }, [sway, size]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(sway.value, [0, 1], [-6, 6])}deg` }],
  }));

  const petalSize = size * 0.38;
  return (
    <Animated.View style={[styles.flowerWrap, { left, bottom }, style]} pointerEvents="none">
      <View style={[styles.flowerCenter, { width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15, backgroundColor: T.flowerYellow }]} />
      {[0, 72, 144, 216, 288].map((deg) => (
        <View
          key={deg}
          style={[
            styles.flowerPetal,
            {
              width: petalSize,
              height: petalSize * 1.3,
              backgroundColor: color,
              transform: [{ rotate: `${deg}deg` }, { translateY: -petalSize * 0.5 }],
            },
          ]}
        />
      ))}
      <View style={[styles.flowerStem, { height: bottom + 8 }]} />
    </Animated.View>
  );
}

// ─── Butterfly graphic ──────────────────────────────────────────────────────

function ButterflyGraphic({ size, flap }: { size: number; flap: Animated.SharedValue<number> }) {
  const wingStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: interpolate(flap.value, [0, 1], [1, 0.55]) }],
  }));

  const wingW = size * 0.42;
  const wingH = size * 0.5;

  return (
    <View style={{ width: size, height: size * 0.7, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[styles.wingLeft, { width: wingW, height: wingH, borderRadius: wingW }, wingStyle]}>
        <LinearGradient colors={[T.wingPink, T.wingOrange]} style={StyleSheet.absoluteFillObject} />
        <View style={[styles.wingSpot, { backgroundColor: T.wingYellow }]} />
      </Animated.View>
      <Animated.View style={[styles.wingRight, { width: wingW, height: wingH, borderRadius: wingW }, wingStyle]}>
        <LinearGradient colors={[T.wingOrange, T.wingPink]} style={StyleSheet.absoluteFillObject} />
        <View style={[styles.wingSpot, { backgroundColor: T.wingYellow }]} />
      </Animated.View>
      <View style={[styles.butterflyBody, { width: size * 0.1, height: size * 0.55 }]} />
      <View style={[styles.antenna, styles.antennaLeft]} />
      <View style={[styles.antenna, styles.antennaRight]} />
    </View>
  );
}

export function ButterflyView({ x, y, following }: { x: number; y: number; following: boolean }) {
  const flap = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    flap.value = withRepeat(
      withSequence(
        withTiming(1, { duration: following ? 120 : 200 }),
        withTiming(0, { duration: following ? 120 : 200 }),
      ),
      -1,
      false,
    );
  }, [flap, following]);

  useEffect(() => {
    glow.value = withTiming(following ? 1 : 0, { duration: 300 });
  }, [following, glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0, 0.5]),
    transform: [{ scale: interpolate(glow.value, [0, 1], [0.8, 1.3]) }],
  }));

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: x - HALF, top: y - HALF, width: HALF * 2, height: HALF * 2 }}>
      <Animated.View style={[styles.butterflyGlow, glowStyle]} />
      <ButterflyGraphic size={HALF * 2} flap={flap} />
    </View>
  );
}

// ─── Finger aura ────────────────────────────────────────────────────────────

export function FingerAura({
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
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.15, { duration: 600 }), withTiming(1, { duration: 600 })),
      -1,
      false,
    );
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: active ? pulse.value : 1 }],
    opacity: active ? 0.85 : 0.55,
    borderColor: active ? T.accent : T.fingerRing,
    backgroundColor: active ? T.fingerGlow : 'rgba(52,211,153,0.2)',
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.fingerAura, { left: x - 22, top: y - 22 }, ringStyle]}
    >
      {active && (
        <View style={[styles.fingerProgressRing, { transform: [{ rotate: `${progress * 3.6 - 90}deg` }] }]}>
          <View style={styles.fingerProgressArc} />
        </View>
      )}
      <View style={styles.fingerCore} />
    </Animated.View>
  );
}

// ─── Connection thread ──────────────────────────────────────────────────────

export function ConnectionThread({
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
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.thread,
        {
          left: midX - length / 2,
          top: midY - 1,
          width: length,
          transform: [{ rotate: `${angle}deg` }],
          opacity: active ? 0.55 : 0.25,
          backgroundColor: active ? T.accent : T.connectionLine,
        },
      ]}
    />
  );
}

// ─── Nectar meter ───────────────────────────────────────────────────────────

export function NectarMeter({
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
  const op = useSharedValue(0);
  useEffect(() => {
    op.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible, op]);

  const style = useAnimatedStyle(() => ({ opacity: op.value }));

  if (!visible && progress === 0) return null;

  return (
    <Animated.View style={[styles.nectarMeter, { left: x - 40, top: y }, style]} pointerEvents="none">
      <Text style={styles.nectarLabel}>🌸 Nectar</Text>
      <View style={styles.nectarTrack}>
        <View style={[styles.nectarFill, { width: `${progress}%` }]} />
      </View>
    </Animated.View>
  );
}

// ─── Trail dust ─────────────────────────────────────────────────────────────

export function TrailDust({ points }: { points: DustPoint[] }) {
  return (
    <>
      {points.map((pt, i) => (
        <View
          key={`dust-${i}`}
          pointerEvents="none"
          style={[
            styles.dustDot,
            {
              left: pt.x - 4,
              top: pt.y - 4,
              opacity: pt.opacity * 0.5,
              width: 8 - i * 0.4,
              height: 8 - i * 0.4,
            },
          ]}
        />
      ))}
    </>
  );
}

// ─── Celebration ────────────────────────────────────────────────────────────

export function NectarCelebration({ visible, x, y }: { visible: boolean; x: number; y: number }) {
  const bloom = useSharedValue(0);
  useEffect(() => {
    if (!visible) return;
    bloom.value = 0;
    bloom.value = withSpring(1, { damping: 8, stiffness: 160 });
  }, [visible, bloom]);

  if (!visible) return null;

  const style = useAnimatedStyle(() => ({
    opacity: bloom.value,
    transform: [{ scale: interpolate(bloom.value, [0, 1], [0.3, 1]) }],
  }));

  const petals = Array.from({ length: 8 });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.celebrateBanner, { left: x - 70, top: y - HALF - 50 }, style]}>
        <LinearGradient colors={['#FBCFE8', '#F9A8D4', '#F472B6']} style={styles.celebrateGrad}>
          <Text style={styles.celebrateText}>🌸 Nectar!</Text>
        </LinearGradient>
      </Animated.View>
      {petals.map((_, i) => (
        <BloomPetal key={i} i={i} x={x} y={y} />
      ))}
    </View>
  );
}

function BloomPetal({ i, x, y }: { i: number; x: number; y: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = 0;
    t.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [t]);

  const colors = [T.flowerPink, T.flowerYellow, T.flowerPurple, '#FDA4AF'];
  const style = useAnimatedStyle(() => {
    const angle = (i / 8) * Math.PI * 2;
    const r = 20 + 50 * t.value;
    return {
      position: 'absolute',
      left: x + Math.cos(angle) * r - 5,
      top: y + Math.sin(angle) * r - 5,
      width: 10,
      height: 14,
      backgroundColor: colors[i % colors.length],
      borderRadius: 5,
      opacity: 1 - t.value,
      transform: [{ rotate: `${t.value * 180 + i * 45}deg` }],
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
  isFollowing: boolean;
};

export function ButterflyTrailHUD({
  round,
  totalRounds,
  score,
  hint,
  showHint,
  followProgress,
  isFollowing,
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
  const glassProps = Platform.OS === 'ios' ? { intensity: 55, tint: 'light' as const } : {};

  return (
    <View style={styles.hudWrap} pointerEvents="none">
      <Glass {...glassProps} style={styles.hudGlass}>
        <LinearGradient colors={['rgba(255,255,255,0.94)', 'rgba(236,253,245,0.88)']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.hudRow}>
          <View>
            <Text style={styles.hudLabel}>STOP</Text>
            <Text style={styles.hudRound}>
              {round}<Text style={styles.hudRoundTotal}>/{totalRounds}</Text>
            </Text>
          </View>
          <View style={styles.hudCenter}>
            <Text style={styles.hudTitle}>🦋 Butterfly Trail</Text>
            {isFollowing && (
              <View style={styles.hudProgressTrack}>
                <View style={[styles.hudProgressFill, { width: `${followProgress}%` }]} />
              </View>
            )}
          </View>
          <Animated.View style={[styles.scoreBox, scoreBump]}>
            <Text style={styles.scoreLabel}>NECTAR</Text>
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
  infoMeadow: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '46%' },
  introButterflyWrap: { position: 'absolute', top: '14%', alignSelf: 'center' },
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
    shadowColor: '#047857',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  infoEmoji: { fontSize: 44, marginBottom: 2 },
  infoTitle: { fontSize: 32, fontWeight: '900', color: T.title, letterSpacing: -0.5 },
  infoTagline: { fontSize: 11, fontWeight: '700', color: T.subtitle, textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 14 },
  infoSection: { width: '100%', marginBottom: 12 },
  infoSectionLabel: { fontSize: 11, fontWeight: '800', color: T.accentDark, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.8 },
  infoBody: { fontSize: 15, lineHeight: 23, color: '#334155', fontWeight: '500' },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' },
  chip: { backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(16,185,129,0.22)' },
  chipText: { fontSize: 13, fontWeight: '700', color: T.subtitle },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8, shadowColor: T.accentDark, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  startBtnGrad: { paddingVertical: 17, alignItems: 'center' },
  startBtnText: { fontSize: 18, fontWeight: '900', color: '#064E3B', letterSpacing: 0.3 },
  infoBackBtn: { paddingVertical: 8 },
  infoBackText: { fontSize: 14, fontWeight: '700', color: T.subtitle },

  skyBand: { height: '38%' },
  sunDisc: { position: 'absolute', top: 24, right: 32, width: 80, height: 80, borderRadius: 40, overflow: 'hidden' },
  meadowBand: { flex: 1, marginTop: '30%' },
  vignette: { ...StyleSheet.absoluteFillObject },
  grassRow: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'flex-end', height: 30 },
  grassBlade: { width: 4, backgroundColor: '#4ADE80', borderTopLeftRadius: 3, borderTopRightRadius: 3 },

  flowerWrap: { position: 'absolute', width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  flowerPetal: { position: 'absolute', borderRadius: 8 },
  flowerCenter: { position: 'absolute', zIndex: 2 },
  flowerStem: { position: 'absolute', bottom: -8, width: 2, backgroundColor: '#166534', borderRadius: 1 },

  wingLeft: { position: 'absolute', left: 0, overflow: 'hidden', borderTopLeftRadius: 40, borderBottomLeftRadius: 40 },
  wingRight: { position: 'absolute', right: 0, overflow: 'hidden', borderTopRightRadius: 40, borderBottomRightRadius: 40 },
  wingSpot: { position: 'absolute', top: '30%', left: '25%', width: 8, height: 8, borderRadius: 4 },
  butterflyBody: { backgroundColor: T.butterflyBody, borderRadius: 4, zIndex: 3 },
  antenna: { position: 'absolute', top: -6, width: 1.5, height: 10, backgroundColor: T.butterflyBody, borderRadius: 1 },
  antennaLeft: { left: '42%', transform: [{ rotate: '-25deg' }] },
  antennaRight: { right: '42%', transform: [{ rotate: '25deg' }] },
  butterflyGlow: { position: 'absolute', alignSelf: 'center', width: HALF * 2.2, height: HALF * 2.2, borderRadius: HALF * 1.1, backgroundColor: T.successGlow },

  fingerAura: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
  },
  fingerCore: { width: 14, height: 14, borderRadius: 7, backgroundColor: T.fingerCore, borderWidth: 2, borderColor: '#FFF' },
  fingerProgressRing: { position: 'absolute', width: 44, height: 44, borderRadius: 22 },
  fingerProgressArc: { position: 'absolute', top: 0, left: '50%', width: 3, height: 8, marginLeft: -1.5, backgroundColor: T.nectarFill, borderRadius: 2 },

  thread: { position: 'absolute', height: 2, borderRadius: 1, zIndex: 2 },

  nectarMeter: { position: 'absolute', width: 80, zIndex: 4 },
  nectarLabel: { fontSize: 9, fontWeight: '800', color: T.accentWarm, textAlign: 'center', marginBottom: 3, letterSpacing: 0.5 },
  nectarTrack: { height: 8, borderRadius: 4, backgroundColor: T.nectarEmpty, borderWidth: 1, borderColor: T.nectarBorder, overflow: 'hidden' },
  nectarFill: { height: '100%', borderRadius: 4, backgroundColor: T.nectarFill },

  dustDot: { position: 'absolute', borderRadius: 999, backgroundColor: T.trailDust },

  celebrateBanner: { position: 'absolute', borderRadius: 18, overflow: 'hidden', zIndex: 40, shadowColor: T.accentWarm, shadowOpacity: 0.4, shadowRadius: 14, elevation: 10 },
  celebrateGrad: { paddingHorizontal: 24, paddingVertical: 12 },
  celebrateText: { fontSize: 24, fontWeight: '900', color: '#831843', letterSpacing: 0.5 },

  hudWrap: { paddingHorizontal: 12, paddingTop: 44, zIndex: 20 },
  hudGlass: { borderRadius: 22, overflow: 'hidden', borderWidth: 1.5, borderColor: T.hudBorder, backgroundColor: Platform.OS === 'android' ? T.hudGlass : 'transparent', paddingHorizontal: 14, paddingVertical: 12 },
  hudRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hudLabel: { fontSize: 9, fontWeight: '800', color: T.subtitle, letterSpacing: 1.2 },
  hudRound: { fontSize: 26, fontWeight: '900', color: T.title },
  hudRoundTotal: { fontSize: 14, fontWeight: '700', color: T.subtitle },
  hudCenter: { alignItems: 'center', flex: 1, paddingHorizontal: 8 },
  hudTitle: { fontSize: 13, fontWeight: '900', color: T.title, marginBottom: 5 },
  hudProgressTrack: { width: 100, height: 6, borderRadius: 3, backgroundColor: T.nectarEmpty, borderWidth: 1, borderColor: T.nectarBorder, overflow: 'hidden' },
  hudProgressFill: { height: '100%', borderRadius: 3, backgroundColor: T.nectarFill },
  scoreBox: { alignItems: 'center', backgroundColor: 'rgba(244,114,182,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(244,114,182,0.45)' },
  scoreLabel: { fontSize: 8, fontWeight: '800', color: '#9D174D', letterSpacing: 0.8 },
  scoreValue: { fontSize: 24, fontWeight: '900', color: '#831843' },
  hintPill: { marginTop: 8, alignSelf: 'center', backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(16,185,129,0.22)' },
  hudHint: { fontSize: 13, fontWeight: '800', color: T.accentDark, letterSpacing: 0.3 },
});

export const BUTTERFLY_RADIUS = HALF;
