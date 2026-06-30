/**
 * Visual layer for Star Safari — night sky, star gems, safari backdrop.
 */
import { STAR_SAFARI_COPY as COPY, STAR_SAFARI_THEME as T } from '@/components/game/occupational/level5/session4/findTheStars/findTheStarsTheme';
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

export type RippleData = { id: number; x: number; y: number };

// ─── Intro ──────────────────────────────────────────────────────────────────

type InfoProps = { onStart: () => void; onBack: () => void };

function IntroStar() {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0.4, { duration: 900 })),
      -1,
      false,
    );
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 0.85 + pulse.value * 0.25 }, { rotate: `${pulse.value * 15}deg` }],
    opacity: 0.7 + pulse.value * 0.3,
  }));

  return (
    <Animated.View style={[styles.introStarWrap, style]}>
      <StarGem size={72} glow />
    </Animated.View>
  );
}

export function StarSafariInfoScreen({ onStart, onBack }: InfoProps) {
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
      <SafariNightBackdrop />
      <IntroStar />

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
          <LinearGradient colors={['#FDE68A', '#FBBF24', '#F59E0B', '#D97706']} style={styles.startBtnGrad}>
            <Text style={styles.startBtnText}>⭐ Start Safari</Text>
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

export function SafariNightBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} locations={[0, 0.45, 0.8, 1]} style={StyleSheet.absoluteFillObject} />
      <StarField count={35} />
      <Moon />
      <AcaciaSilhouettes />
      <View style={styles.horizonGlow} />
      <LinearGradient colors={['transparent', T.horizon]} style={styles.horizonFade} />
    </View>
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
      index * 90,
      withRepeat(
        withSequence(withTiming(1, { duration: 800 }), withTiming(0.15, { duration: 800 })),
        -1,
        false,
      ),
    );
  }, [twinkle, index]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: `${(index * 17 + 4) % 94}%`,
    top: `${(index * 23 + 6) % 72}%`,
    width: 2 + (index % 3),
    height: 2 + (index % 3),
    borderRadius: 2,
    backgroundColor: T.moon,
    opacity: twinkle.value,
  }));

  return <Animated.View style={style} />;
}

function Moon() {
  const glow = useSharedValue(0.5);
  useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
  }, [glow]);

  const style = useAnimatedStyle(() => ({ opacity: 0.6 + glow.value * 0.3 }));

  return (
    <Animated.View style={[styles.moonWrap, style]}>
      <View style={styles.moonGlow} />
      <View style={styles.moon} />
    </Animated.View>
  );
}

function AcaciaSilhouettes() {
  return (
    <>
      <View style={[styles.acacia, { left: '5%', bottom: '18%', width: 50, height: 70 }]} />
      <View style={[styles.acacia, { right: '8%', bottom: '20%', width: 42, height: 58 }]} />
      <View style={[styles.acacia, { left: '38%', bottom: '16%', width: 36, height: 48, opacity: 0.6 }]} />
    </>
  );
}

// ─── Star gem & distractor ────────────────────────────────────────────────────

function StarShape({ size }: { size: number }) {
  return (
    <View style={{ width: size * 0.55, height: size * 0.55, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.42 }}>⭐</Text>
    </View>
  );
}

export function StarGem({ size, pop, glow }: { size: number; pop?: boolean; glow?: boolean }) {
  const scale = useSharedValue(1);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (pop) {
      scale.value = withSequence(withSpring(1.35, { damping: 6 }), withSpring(0, { damping: 12 }));
    }
  }, [pop, scale]);

  useEffect(() => {
    if (!glow) return;
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, [glow, shimmer]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: pop ? interpolate(scale.value, [0, 0.5, 1], [1, 1, 0]) : 1,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow ? 0.4 + shimmer.value * 0.5 : 0,
    transform: [{ scale: 1 + shimmer.value * 0.15 }],
  }));

  return (
    <Animated.View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, animStyle]}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size * 1.3,
            height: size * 1.3,
            borderRadius: size * 0.65,
            backgroundColor: T.starGlow,
          },
          glowStyle,
        ]}
      />
      <View
        style={[
          styles.gem,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: T.gemBorder,
          },
        ]}
      >
        <LinearGradient colors={['#FFFBEB', T.gemBg, '#FEF3C7']} style={StyleSheet.absoluteFillObject} />
        <StarShape size={size} />
      </View>
    </Animated.View>
  );
}

export function DistractorOrb({ size, emoji }: { size: number; emoji: string }) {
  return (
    <View
      style={[
        styles.distractor,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={{ fontSize: size * 0.48 }}>{emoji}</Text>
    </View>
  );
}

// ─── Tap FX ─────────────────────────────────────────────────────────────────

export function StarFoundBurst({ x, y }: { x: number; y: number }) {
  const burst = useSharedValue(0);
  useEffect(() => {
    burst.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [burst]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 1 - burst.value,
    transform: [{ scale: 0.4 + burst.value * 1.8 }],
  }));

  const rays = Array.from({ length: 8 });

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 12 }]}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: x - 30,
            top: y - 30,
            width: 60,
            height: 60,
            borderRadius: 30,
            borderWidth: 2,
            borderColor: T.starGold,
            backgroundColor: T.starGlow,
          },
          ringStyle,
        ]}
      />
      {rays.map((_, i) => (
        <BurstRay key={i} i={i} x={x} y={y} />
      ))}
    </View>
  );
}

function BurstRay({ i, x, y }: { i: number; x: number; y: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: 500 });
  }, [t]);

  const style = useAnimatedStyle(() => {
    const angle = (i / 8) * Math.PI * 2;
    const r = 8 + 28 * t.value;
    return {
      position: 'absolute',
      left: x + Math.cos(angle) * r - 2,
      top: y + Math.sin(angle) * r - 2,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: T.starCore,
      opacity: 1 - t.value,
    };
  });

  return <Animated.View style={style} />;
}

function WrongRipple({ x, y }: { x: number; y: number }) {
  const expand = useSharedValue(0);
  useEffect(() => {
    expand.value = withTiming(1, { duration: 500 });
  }, [expand]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x - 24,
    top: y - 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: T.wrongGlow,
    backgroundColor: T.wrong,
    opacity: 0.5 * (1 - expand.value),
    transform: [{ scale: 0.4 + expand.value * 1.5 }],
  }));

  return <Animated.View style={style} pointerEvents="none" />;
}

export function WrongTapRipple({ ripples }: { ripples: RippleData[] }) {
  return (
    <>
      {ripples.map((r) => (
        <WrongRipple key={r.id} x={r.x} y={r.y} />
      ))}
    </>
  );
}

// ─── HUD ────────────────────────────────────────────────────────────────────

type HudProps = {
  round: number;
  totalRounds: number;
  score: number;
  starsFound: number;
  starsNeeded: number;
  hint: string;
};

export function StarSafariHUD({ round, totalRounds, score, starsFound, starsNeeded, hint }: HudProps) {
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
            <Text style={styles.hudLabel}>ROUND</Text>
            <Text style={styles.hudRound}>
              {round}
              <Text style={styles.hudRoundTotal}>/{totalRounds}</Text>
            </Text>
          </View>
          <View style={styles.hudCenter}>
            <Text style={styles.hudTitle}>⭐ Star Safari</Text>
            <View style={styles.starTracker}>
              {Array.from({ length: starsNeeded }).map((_, i) => (
                <Text key={i} style={[styles.trackerStar, i < starsFound && styles.trackerStarDone]}>
                  {i < starsFound ? '★' : '☆'}
                </Text>
              ))}
            </View>
          </View>
          <Animated.View style={[styles.scoreBox, scoreBump]}>
            <Text style={styles.scoreLabel}>HUNTS</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </Animated.View>
        </View>
        <View style={styles.hintPill}>
          <Text style={styles.hudHint}>{hint}</Text>
        </View>
      </Glass>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  infoRoot: { flex: 1 },
  introStarWrap: { position: 'absolute', top: '18%', alignSelf: 'center', zIndex: 2 },
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
  chip: { backgroundColor: 'rgba(251,191,36,0.12)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)' },
  chipText: { fontSize: 13, fontWeight: '700', color: T.subtitle },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8, shadowColor: T.accentDark, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  startBtnGrad: { paddingVertical: 17, alignItems: 'center' },
  startBtnText: { fontSize: 18, fontWeight: '900', color: '#78350F', letterSpacing: 0.3 },
  infoBackBtn: { paddingVertical: 8 },
  infoBackText: { fontSize: 14, fontWeight: '700', color: T.subtitle },

  horizonGlow: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '22%', backgroundColor: T.horizon },
  horizonFade: { ...StyleSheet.absoluteFillObject },
  moonWrap: { position: 'absolute', top: '10%', right: '12%', width: 48, height: 48 },
  moonGlow: { ...StyleSheet.absoluteFillObject, borderRadius: 24, backgroundColor: T.moonGlow },
  moon: { position: 'absolute', top: 8, left: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: T.moon },
  acacia: { position: 'absolute', backgroundColor: T.acacia, borderTopLeftRadius: 20, borderTopRightRadius: 20 },

  gem: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, shadowColor: T.starGold, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  distractor: { backgroundColor: T.distractorBg, borderWidth: 2, borderColor: T.distractorBorder, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, elevation: 4 },

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
  hudTitle: { fontSize: 13, fontWeight: '800', color: T.title, marginBottom: 2 },
  starTracker: { flexDirection: 'row', gap: 2 },
  trackerStar: { fontSize: 14, color: 'rgba(251,191,36,0.35)' },
  trackerStarDone: { color: T.starGold },
  scoreBox: { alignItems: 'flex-end' },
  scoreLabel: { fontSize: 9, fontWeight: '800', color: T.subtitle, letterSpacing: 1.2 },
  scoreValue: { fontSize: 22, fontWeight: '900', color: T.starCore },
  hintPill: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(251,191,36,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.25)',
  },
  hudHint: { fontSize: 12, fontWeight: '700', color: T.subtitle, textAlign: 'center' },
});
