/**
 * Visual layer for Shadow Stage — spotlight theater, puppets, silhouettes.
 */
import { SHADOW_STAGE_COPY as COPY, SHADOW_STAGE_THEME as T } from '@/components/game/occupational/level5/session4/shadowStage/shadowStageTheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

function IntroPuppet() {
  const bow = useSharedValue(0);
  useEffect(() => {
    bow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [bow]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(bow.value, [0, 1], [0, -8]) }],
  }));

  return (
    <Animated.View style={[styles.introPuppetWrap, style]}>
      <View style={styles.introPuppet}>
        <Text style={{ fontSize: 48 }}>🐱</Text>
      </View>
      <View style={styles.introShadow}>
        <Text style={styles.introShadowEmoji}>🐱</Text>
      </View>
    </Animated.View>
  );
}

export function ShadowStageInfoScreen({ onStart, onBack }: InfoProps) {
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
      <LinearGradient colors={[...T.stage]} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFillObject} />
      <ShadowStageBackdrop />
      <IntroPuppet />

      <Animated.View style={[styles.infoCard, cardAnim]}>
        <Text style={styles.infoEmoji}>{COPY.emoji}</Text>
        <Text style={styles.infoTitle}>{COPY.title}</Text>
        <Text style={styles.infoTagline}>{COPY.subtitle}</Text>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionLabel}>How to play</Text>
          <Text style={styles.infoBody}>{COPY.introDescription}</Text>
        </View>

        <View style={styles.stepRow}>
          {['1️⃣ Tap puppet', '2️⃣ Tap shadow'].map((step) => (
            <View key={step} style={styles.stepChip}>
              <Text style={styles.stepChipText}>{step}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={['#F9A8D4', '#F472B6', '#EC4899', '#DB2777']} style={styles.startBtnGrad}>
            <Text style={styles.startBtnText}>🎭 Curtain Up!</Text>
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

export function ShadowStageBackdrop({ selected }: { selected?: boolean }) {
  const beam = useSharedValue(0.5);
  useEffect(() => {
    beam.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
  }, [beam]);

  useEffect(() => {
    beam.value = withTiming(selected ? 1 : 0.5, { duration: 300 });
  }, [selected, beam]);

  const beamStyle = useAnimatedStyle(() => ({ opacity: 0.04 + beam.value * 0.06 }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.stage]} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.curtain, styles.curtainLeft]} />
      <View style={[styles.curtain, styles.curtainRight]} />
      <Animated.View style={[styles.spotlightBeam, beamStyle]} />
      <View style={styles.spotlightCircle} />
      <Footlights />
      <View style={styles.stageFloor} />
    </View>
  );
}

function Footlights() {
  return (
    <View style={styles.footlightRow}>
      {Array.from({ length: 7 }).map((_, i) => (
        <Footlight key={i} index={i} />
      ))}
    </View>
  );
}

function Footlight({ index }: { index: number }) {
  const flicker = useSharedValue(0.6);
  useEffect(() => {
    flicker.value = withDelay(
      index * 200,
      withRepeat(withTiming(1, { duration: 800 + index * 100 }), -1, true),
    );
  }, [flicker, index]);

  const style = useAnimatedStyle(() => ({ opacity: 0.5 + flicker.value * 0.5 }));

  return <Animated.View style={[styles.footlight, style]} />;
}

export function StageDivider() {
  return (
    <View style={styles.dividerWrap} pointerEvents="none">
      <View style={styles.dividerLine} />
      <Text style={styles.dividerLabel}>SHADOWS</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

// ─── Puppet & shadow tiles ──────────────────────────────────────────────────

export function PuppetTile({
  x,
  y,
  size,
  emoji,
  selected,
  matched,
  onPress,
}: {
  x: number;
  y: number;
  size: number;
  emoji: string;
  selected: boolean;
  matched: boolean;
  onPress: () => void;
}) {
  const glow = useSharedValue(0);
  useEffect(() => {
    glow.value = withTiming(selected ? 1 : 0, { duration: 250 });
  }, [selected, glow]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.7,
    transform: [{ scale: 1 + glow.value * 0.12 }],
  }));

  return (
    <Pressable
      onPress={onPress}
      disabled={matched}
      style={[styles.tileHit, { left: x - size / 2, top: y - size / 2, opacity: matched ? 0.25 : 1 }]}
    >
      {selected && (
        <Animated.View
          style={[
            styles.selectRing,
            { width: size + 16, height: size + 16, borderRadius: (size + 16) / 2, top: -8, left: -8 },
            ringStyle,
          ]}
        />
      )}
      <View style={[styles.puppet, { width: size, height: size, borderRadius: size / 2, borderColor: selected ? T.puppetSelect : T.puppetBorder }]}>
        <LinearGradient colors={['#FFFFFF', T.puppetBg, '#FDF2F8']} style={StyleSheet.absoluteFillObject} />
        <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
      </View>
    </Pressable>
  );
}

export function ShadowSilhouette({
  x,
  y,
  size,
  emoji,
  matched,
  onPress,
}: {
  x: number;
  y: number;
  size: number;
  emoji: string;
  matched: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={matched}
      style={[
        styles.shadowHit,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: matched ? 0.2 : 1,
        },
      ]}
    >
      <Text style={styles.shadowEmoji}>{emoji}</Text>
    </Pressable>
  );
}

// ─── FX ─────────────────────────────────────────────────────────────────────

export function MatchCelebration({ visible, x, y }: { visible: boolean; x: number; y: number }) {
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
      <View style={[styles.matchBurst, { left: x - 50, top: y - 50 }]} />
      <Animated.View style={[styles.celebrateBanner, { left: x - 58, top: y - 55 }, bannerStyle]}>
        <LinearGradient colors={['#D1FAE5', '#6EE7B7', '#34D399']} style={styles.celebrateGrad}>
          <Text style={styles.celebrateText}>🎭 Matched!</Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function WrongRipple({ x, y }: { x: number; y: number }) {
  const expand = useSharedValue(0);
  useEffect(() => {
    expand.value = withTiming(1, { duration: 500 });
  }, [expand]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x - 26,
    top: y - 26,
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: T.wrongGlow,
    backgroundColor: T.wrong,
    opacity: 0.4 * (1 - expand.value),
    transform: [{ scale: 0.4 + expand.value * 1.5 }],
  }));

  return <Animated.View style={style} pointerEvents="none" />;
}

export function WrongMatchRipple({ ripples }: { ripples: RippleData[] }) {
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
  hint: string;
  hasSelection: boolean;
};

export function ShadowStageHUD({ round, totalRounds, score, hint, hasSelection }: HudProps) {
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
            <Text style={styles.hudLabel}>ACT</Text>
            <Text style={styles.hudRound}>
              {round}
              <Text style={styles.hudRoundTotal}>/{totalRounds}</Text>
            </Text>
          </View>
          <View style={styles.hudCenter}>
            <Text style={styles.hudTitle}>🎭 Shadow Stage</Text>
            <View style={styles.stepTrack}>
              <View style={[styles.stepDot, !hasSelection && styles.stepDotActive]} />
              <View style={styles.stepLine} />
              <View style={[styles.stepDot, hasSelection && styles.stepDotActive]} />
            </View>
          </View>
          <Animated.View style={[styles.scoreBox, scoreBump]}>
            <Text style={styles.scoreLabel}>MATCHES</Text>
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
  introPuppetWrap: { position: 'absolute', top: '16%', alignSelf: 'center', alignItems: 'center', zIndex: 2 },
  introPuppet: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: T.puppetBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.puppetSelect,
    marginBottom: 20,
  },
  introShadow: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: T.shadow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.shadowBorder,
  },
  introShadowEmoji: { fontSize: 36, opacity: 0.15, color: '#fff' },
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
  infoBody: { fontSize: 15, lineHeight: 23, color: '#D1D5DB', fontWeight: '500' },
  stepRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  stepChip: { backgroundColor: 'rgba(244,114,182,0.12)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(244,114,182,0.3)' },
  stepChipText: { fontSize: 13, fontWeight: '700', color: T.subtitle },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8, shadowColor: T.accentDark, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  startBtnGrad: { paddingVertical: 17, alignItems: 'center' },
  startBtnText: { fontSize: 18, fontWeight: '900', color: '#FFF', letterSpacing: 0.3 },
  infoBackBtn: { paddingVertical: 8 },
  infoBackText: { fontSize: 14, fontWeight: '700', color: T.subtitle },

  curtain: { position: 'absolute', top: 0, bottom: 0, width: '12%', backgroundColor: T.curtain },
  curtainLeft: { left: 0, borderTopRightRadius: 8 },
  curtainRight: { right: 0, borderTopLeftRadius: 8 },
  spotlightBeam: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: 140,
    height: '55%',
    backgroundColor: T.spotlightBeam,
    transform: [{ skewX: '-8deg' }],
  },
  spotlightCircle: {
    position: 'absolute',
    bottom: '48%',
    alignSelf: 'center',
    width: 220,
    height: 36,
    borderRadius: 110,
    backgroundColor: T.spotlight,
  },
  footlightRow: { position: 'absolute', bottom: 8, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  footlight: { width: 10, height: 10, borderRadius: 5, backgroundColor: T.footlight },
  stageFloor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '52%', backgroundColor: 'rgba(0,0,0,0.25)' },

  dividerWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 3,
  },
  dividerLine: { flex: 1, height: 1.5, backgroundColor: T.stageLine },
  dividerLabel: { fontSize: 9, fontWeight: '800', color: T.footlight, letterSpacing: 2 },

  tileHit: { position: 'absolute', zIndex: 10 },
  selectRing: { position: 'absolute', borderWidth: 3, borderColor: T.puppetSelectGlow, borderStyle: 'dashed' },
  puppet: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, shadowColor: T.puppetSelect, shadowOpacity: 0.25, shadowRadius: 10, elevation: 8 },
  shadowHit: {
    position: 'absolute',
    backgroundColor: T.shadow,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: T.shadowBorder,
    zIndex: 10,
  },
  shadowEmoji: { fontSize: 30, color: '#fff', opacity: 0.12 },

  matchBurst: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: T.matchGlow, zIndex: 15 },
  celebrateBanner: { position: 'absolute', zIndex: 16, borderRadius: 14, overflow: 'hidden' },
  celebrateGrad: { paddingHorizontal: 18, paddingVertical: 8 },
  celebrateText: { fontSize: 15, fontWeight: '900', color: '#064E3B' },

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
  stepTrack: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(244,114,182,0.25)' },
  stepDotActive: { backgroundColor: T.accent, width: 10, height: 10, borderRadius: 5 },
  stepLine: { width: 20, height: 2, backgroundColor: 'rgba(244,114,182,0.3)' },
  scoreBox: { alignItems: 'flex-end' },
  scoreLabel: { fontSize: 9, fontWeight: '800', color: T.subtitle, letterSpacing: 1.2 },
  scoreValue: { fontSize: 22, fontWeight: '900', color: T.accent },
  hintPill: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(244,114,182,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(244,114,182,0.25)',
  },
  hudHint: { fontSize: 12, fontWeight: '700', color: T.subtitle, textAlign: 'center' },
});
