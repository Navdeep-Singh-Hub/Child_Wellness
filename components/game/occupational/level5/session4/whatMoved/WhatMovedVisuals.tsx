/**
 * Visual layer for What Moved? — detective desk, cork board, evidence tiles.
 */
import { WHAT_MOVED_COPY as COPY, WHAT_MOVED_THEME as T } from '@/components/game/occupational/level5/session4/whatMoved/whatMovedTheme';
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

function IntroMagnifier() {
  const scan = useSharedValue(0);
  useEffect(() => {
    scan.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [scan]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(scan.value, [0, 1], [-12, 12]) },
      { rotate: `${interpolate(scan.value, [0, 1], [-8, 8])}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.introMagWrap, style]}>
      <View style={styles.introBoard}>
        <Text style={styles.introBoardEmoji}>🔴</Text>
        <Text style={[styles.introBoardEmoji, { marginLeft: 16 }]}>🔵</Text>
      </View>
      <Text style={styles.introMag}>🔍</Text>
    </Animated.View>
  );
}

export function WhatMovedInfoScreen({ onStart, onBack }: InfoProps) {
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
      <LinearGradient colors={[...T.desk]} locations={[0, 0.45, 0.8, 1]} style={StyleSheet.absoluteFillObject} />
      <DetectiveBackdrop />
      <IntroMagnifier />

      <Animated.View style={[styles.infoCard, cardAnim]}>
        <Text style={styles.infoEmoji}>{COPY.emoji}</Text>
        <Text style={styles.infoTitle}>{COPY.title}</Text>
        <Text style={styles.infoTagline}>{COPY.subtitle}</Text>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionLabel}>How to play</Text>
          <Text style={styles.infoBody}>{COPY.introDescription}</Text>
        </View>

        <View style={styles.stepRow}>
          {['👀 Memorize', '⚡ Shift', '🔍 Spot'].map((step) => (
            <View key={step} style={styles.stepChip}>
              <Text style={styles.stepChipText}>{step}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={['#FDE68A', '#FACC15', '#EAB308', '#CA8A04']} style={styles.startBtnGrad}>
            <Text style={styles.startBtnText}>🔍 Open Case</Text>
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

export function DetectiveBackdrop({ scanning }: { scanning?: boolean }) {
  const lamp = useSharedValue(0.5);
  useEffect(() => {
    lamp.value = withRepeat(withTiming(1, { duration: 2200 }), -1, true);
  }, [lamp]);

  useEffect(() => {
    lamp.value = withTiming(scanning ? 1 : 0.5, { duration: 300 });
  }, [scanning, lamp]);

  const lampStyle = useAnimatedStyle(() => ({ opacity: 0.06 + lamp.value * 0.08 }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.desk]} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.corkBoard}>
        <View style={styles.corkTexture} />
        <PushPin x="12%" y="8%" />
        <PushPin x="88%" y="12%" />
        <PushPin x="6%" y="78%" />
        <PushPin x="92%" y="82%" />
      </View>
      <Animated.View style={[styles.lampBeam, lampStyle]} />
      <View style={styles.deskLamp} />
      <View style={styles.deskEdge} />
    </View>
  );
}

function PushPin({ x, y }: { x: string; y: string }) {
  return (
    <View style={[styles.pin, { left: x as `${number}%`, top: y as `${number}%` }]}>
      <View style={styles.pinHead} />
      <View style={styles.pinNeedle} />
    </View>
  );
}

export function MemorizeBanner({ visible }: { visible: boolean }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (!visible) return;
    pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [visible, pulse]);

  if (!visible) return null;

  const style = useAnimatedStyle(() => ({
    opacity: 0.7 + pulse.value * 0.3,
    transform: [{ scale: 0.98 + pulse.value * 0.04 }],
  }));

  return (
    <Animated.View style={[styles.phaseBanner, style]} pointerEvents="none">
      <LinearGradient colors={['#FEF3C7', '#FDE68A', '#FACC15']} style={styles.phaseGrad}>
        <Text style={styles.phaseText}>👀 MEMORIZE</Text>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Evidence tiles ─────────────────────────────────────────────────────────

export function EvidenceTile({
  x,
  y,
  size,
  emoji,
  showAtInitial,
  initialX,
  initialY,
  disabled,
  onPress,
}: {
  x: number;
  y: number;
  size: number;
  emoji: string;
  showAtInitial: boolean;
  initialX: number;
  initialY: number;
  disabled: boolean;
  onPress: () => void;
}) {
  const posX = showAtInitial ? initialX : x;
  const posY = showAtInitial ? initialY : y;

  const slide = useSharedValue(showAtInitial ? 0 : 1);
  useEffect(() => {
    slide.value = withSpring(showAtInitial ? 0 : 1, { damping: 14, stiffness: 120 });
  }, [showAtInitial, slide]);

  const animStyle = useAnimatedStyle(() => ({
    left: interpolate(slide.value, [0, 1], [initialX - size / 2, x - size / 2]),
    top: interpolate(slide.value, [0, 1], [initialY - size / 2, y - size / 2]),
  }));

  return (
    <Animated.View style={[styles.tileWrap, animStyle, { width: size, height: size }]}>
      <Pressable onPress={onPress} disabled={disabled} style={styles.tilePress}>
        <View style={[styles.evidence, { width: size, height: size, borderRadius: 12 }]}>
          <LinearGradient colors={['#FFFFFF', T.evidenceBg, '#FFFBEB']} style={StyleSheet.absoluteFillObject} />
          <View style={styles.evidencePin} />
          <Text style={{ fontSize: size * 0.42 }}>{emoji}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── FX ─────────────────────────────────────────────────────────────────────

export function CaseSolvedCelebration({ visible, x, y }: { visible: boolean; x: number; y: number }) {
  const burst = useSharedValue(0);
  useEffect(() => {
    if (!visible) return;
    burst.value = withSpring(1, { damping: 7, stiffness: 180 });
  }, [visible, burst]);

  if (!visible) return null;

  const style = useAnimatedStyle(() => ({
    opacity: burst.value,
    transform: [{ scale: interpolate(burst.value, [0, 1], [0.4, 1]) }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.solveBurst, { left: x - 50, top: y - 50 }]} />
      <Animated.View style={[styles.solveBanner, { left: x - 62, top: y - 58 }, style]}>
        <LinearGradient colors={['#D1FAE5', '#6EE7B7', '#34D399']} style={styles.solveGrad}>
          <Text style={styles.solveText}>🔍 Solved!</Text>
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

export function WrongSpotRipple({ ripples }: { ripples: RippleData[] }) {
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
  memorizing: boolean;
};

export function WhatMovedHUD({ round, totalRounds, score, hint, memorizing }: HudProps) {
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
            <Text style={styles.hudLabel}>CASE</Text>
            <Text style={styles.hudRound}>
              {round}
              <Text style={styles.hudRoundTotal}>/{totalRounds}</Text>
            </Text>
          </View>
          <View style={styles.hudCenter}>
            <Text style={styles.hudTitle}>🔍 What Moved?</Text>
            <View style={[styles.phaseDot, memorizing ? styles.phaseDotMem : styles.phaseDotSpot]} />
          </View>
          <Animated.View style={[styles.scoreBox, scoreBump]}>
            <Text style={styles.scoreLabel}>SOLVED</Text>
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
  introMagWrap: { position: 'absolute', top: '18%', alignSelf: 'center', alignItems: 'center', zIndex: 2 },
  introBoard: {
    flexDirection: 'row',
    backgroundColor: T.cork,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: T.corkDark,
    marginBottom: 16,
  },
  introBoardEmoji: { fontSize: 32 },
  introMag: { fontSize: 48 },
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
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  infoEmoji: { fontSize: 44, marginBottom: 2 },
  infoTitle: { fontSize: 32, fontWeight: '900', color: T.title, letterSpacing: -0.5 },
  infoTagline: { fontSize: 11, fontWeight: '700', color: T.subtitle, textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 14 },
  infoSection: { width: '100%', marginBottom: 12 },
  infoSectionLabel: { fontSize: 11, fontWeight: '800', color: T.accent, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.8 },
  infoBody: { fontSize: 15, lineHeight: 23, color: '#FDE68A', fontWeight: '500' },
  stepRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' },
  stepChip: { backgroundColor: 'rgba(250,204,21,0.15)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(250,204,21,0.35)' },
  stepChipText: { fontSize: 12, fontWeight: '700', color: T.subtitle },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8, shadowColor: T.accentDark, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  startBtnGrad: { paddingVertical: 17, alignItems: 'center' },
  startBtnText: { fontSize: 18, fontWeight: '900', color: '#422006', letterSpacing: 0.3 },
  infoBackBtn: { paddingVertical: 8 },
  infoBackText: { fontSize: 14, fontWeight: '700', color: T.subtitle },

  corkBoard: {
    position: 'absolute',
    top: '8%',
    left: '6%',
    right: '6%',
    bottom: '10%',
    backgroundColor: T.cork,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: T.corkDark,
    overflow: 'hidden',
  },
  corkTexture: { ...StyleSheet.absoluteFillObject, backgroundColor: T.corkGrain },
  pin: { position: 'absolute', alignItems: 'center' },
  pinHead: { width: 12, height: 12, borderRadius: 6, backgroundColor: T.pin, borderWidth: 1, borderColor: '#991B1B' },
  pinNeedle: { width: 2, height: 6, backgroundColor: '#78716C' },
  lampBeam: {
    position: 'absolute',
    top: 0,
    right: '8%',
    width: 120,
    height: '60%',
    backgroundColor: T.lampBeam,
    transform: [{ skewX: '12deg' }],
  },
  deskLamp: {
    position: 'absolute',
    top: 8,
    right: '6%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.lampGlow,
    borderWidth: 2,
    borderColor: T.accent,
  },
  deskEdge: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 14, backgroundColor: 'rgba(66,32,6,0.6)' },

  phaseBanner: { position: 'absolute', top: '42%', alignSelf: 'center', zIndex: 20, borderRadius: 16, overflow: 'hidden' },
  phaseGrad: { paddingHorizontal: 24, paddingVertical: 10 },
  phaseText: { fontSize: 16, fontWeight: '900', color: '#422006', letterSpacing: 2 },

  tileWrap: { position: 'absolute', zIndex: 10 },
  tilePress: { flex: 1 },
  evidence: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.evidenceBorder,
    shadowColor: T.evidenceShadow,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  evidencePin: {
    position: 'absolute',
    top: -4,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.pin,
  },

  solveBurst: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: T.correctGlow, zIndex: 15 },
  solveBanner: { position: 'absolute', zIndex: 16, borderRadius: 14, overflow: 'hidden' },
  solveGrad: { paddingHorizontal: 18, paddingVertical: 8 },
  solveText: { fontSize: 15, fontWeight: '900', color: '#064E3B' },

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
  phaseDot: { width: 10, height: 10, borderRadius: 5 },
  phaseDotMem: { backgroundColor: '#FDE68A' },
  phaseDotSpot: { backgroundColor: T.accent },
  scoreBox: { alignItems: 'flex-end' },
  scoreLabel: { fontSize: 9, fontWeight: '800', color: T.subtitle, letterSpacing: 1.2 },
  scoreValue: { fontSize: 22, fontWeight: '900', color: T.accent },
  hintPill: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(250,204,21,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.25)',
  },
  hudHint: { fontSize: 12, fontWeight: '700', color: T.subtitle, textAlign: 'center' },
});
