/**
 * Visual layer for Memory Flash — nebula chamber, crystal orbs, supernova flash.
 */
import { MEMORY_FLASH_COPY as COPY, MEMORY_FLASH_THEME as T } from '@/components/game/occupational/level5/session4/memoryFlash/memoryFlashTheme';
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
  cancelAnimation,
} from 'react-native-reanimated';

export type RippleData = { id: number; x: number; y: number };
type Phase = 'show_all' | 'flashing' | 'recall';

type MemoryItem = { id: string; x: number; y: number; emoji: string; isTarget: boolean };

// ─── Intro ──────────────────────────────────────────────────────────────────

type InfoProps = { onStart: () => void; onBack: () => void };

function IntroFlash() {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 350 }), withTiming(0.2, { duration: 350 })),
      -1,
      false,
    );
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.4 + pulse.value * 0.6,
    transform: [{ scale: 0.85 + pulse.value * 0.3 }],
  }));

  return (
    <Animated.View style={[styles.introFlashWrap, style]}>
      <View style={styles.introCrystal}>
        <Text style={styles.introEmoji}>💎</Text>
        <View style={styles.introFlashRing} />
      </View>
    </Animated.View>
  );
}

export function MemoryFlashInfoScreen({ onStart, onBack }: InfoProps) {
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
      <LinearGradient colors={[...T.space]} locations={[0, 0.4, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <NebulaBackdrop />
      <IntroFlash />

      <Animated.View style={[styles.infoCard, cardAnim]}>
        <Text style={styles.infoEmoji}>{COPY.emoji}</Text>
        <Text style={styles.infoTitle}>{COPY.title}</Text>
        <Text style={styles.infoTagline}>{COPY.subtitle}</Text>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionLabel}>How to play</Text>
          <Text style={styles.infoBody}>{COPY.introDescription}</Text>
        </View>

        <View style={styles.phasePreview}>
          {['👁️ Observe', '✨ Flash', '🧠 Recall'].map((step) => (
            <View key={step} style={styles.phaseChip}>
              <Text style={styles.phaseChipText}>{step}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={['#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED']} style={styles.startBtnGrad}>
            <Text style={styles.startBtnText}>💫 Begin Recall</Text>
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

export function NebulaBackdrop() {
  const swirl = useSharedValue(0);
  useEffect(() => {
    swirl.value = withRepeat(withTiming(1, { duration: 8000, easing: Easing.linear }), -1, false);
  }, [swirl]);

  const swirlStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${swirl.value * 360}deg` }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.space]} locations={[0, 0.45, 0.8, 1]} style={StyleSheet.absoluteFillObject} />
      <Animated.View style={[styles.nebulaCloud1, swirlStyle]} />
      <View style={styles.nebulaCloud2} />
      <View style={styles.nebulaCloud3} />
      <StarDust count={20} />
      <LinearGradient colors={['transparent', 'rgba(30,27,75,0.5)']} style={styles.vignette} />
    </View>
  );
}

function StarDust({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <DustParticle key={i} index={i} />
      ))}
    </>
  );
}

function DustParticle({ index }: { index: number }) {
  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = withDelay(
      index * 100,
      withRepeat(withTiming(1, { duration: 2000 + index * 200 }), -1, true),
    );
  }, [drift, index]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: `${(index * 19 + 3) % 94}%`,
    top: `${(index * 27 + 8) % 88}%`,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: T.spark,
    opacity: 0.2 + drift.value * 0.5,
  }));

  return <Animated.View style={style} />;
}

// ─── Phase banner ───────────────────────────────────────────────────────────

export function PhaseBanner({ phase }: { phase: Phase }) {
  const op = useSharedValue(0);
  const y = useSharedValue(-8);

  useEffect(() => {
    op.value = withTiming(1, { duration: 250 });
    y.value = withSpring(0, { damping: 14, stiffness: 180 });
  }, [phase, op, y]);

  const anim = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: y.value }] }));

  const labels: Record<Phase, { text: string; color: string }> = {
    show_all: { text: '👁️ OBSERVE', color: T.phaseObserve },
    flashing: { text: '✨ FLASH!', color: T.phaseFlash },
    recall: { text: '🧠 RECALL', color: T.phaseRecall },
  };
  const { text, color } = labels[phase];

  return (
    <Animated.View style={[styles.phaseBanner, { borderColor: color }, anim]} pointerEvents="none">
      <Text style={[styles.phaseBannerText, { color }]}>{text}</Text>
    </Animated.View>
  );
}

// ─── Memory crystal tile ──────────────────────────────────────────────────────

export function MemoryCrystal({
  item,
  phase,
  size,
  onPress,
}: {
  item: MemoryItem;
  phase: Phase;
  size: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  const ring = useSharedValue(0);

  useEffect(() => {
    if (phase === 'flashing' && item.isTarget) {
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) }),
          withTiming(0.15, { duration: 280, easing: Easing.in(Easing.quad) }),
        ),
        4,
        false,
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.28, { duration: 280, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 280, easing: Easing.in(Easing.quad) }),
        ),
        4,
        false,
      );
      ring.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 280, easing: Easing.in(Easing.quad) }),
        ),
        4,
        false,
      );
      return;
    }
    cancelAnimation(scale);
    cancelAnimation(glow);
    cancelAnimation(ring);
    scale.value = withTiming(1, { duration: 120 });
    glow.value = withTiming(0, { duration: 120 });
    ring.value = withTiming(0, { duration: 120 });
  }, [phase, item.isTarget, glow, ring, scale]);

  const tileStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor:
      item.isTarget && phase === 'flashing'
        ? `rgba(167,139,250,${0.65 + glow.value * 0.35})`
        : T.crystalBorder,
    borderWidth: item.isTarget && phase === 'flashing' ? 3 + glow.value * 2 : 2,
    shadowOpacity: item.isTarget && phase === 'flashing' ? 0.3 + glow.value * 0.5 : 0.15,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value * 0.85,
    transform: [{ scale: 1 + ring.value * 0.4 }],
  }));

  const dimmed = phase === 'flashing' && !item.isTarget;

  return (
    <Pressable
      onPress={onPress}
      disabled={phase !== 'recall'}
      style={[
        styles.crystalHit,
        {
          left: item.x - size / 2,
          top: item.y - size / 2,
          opacity: dimmed ? 0.55 : 1,
        },
      ]}
    >
      {item.isTarget && phase === 'flashing' && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.supernovaRing,
            { width: size + 20, height: size + 20, borderRadius: (size + 20) / 2, top: -10, left: -10 },
            ringStyle,
          ]}
        />
      )}
      <Animated.View style={[styles.crystal, { width: size, height: size, borderRadius: size / 2 }, tileStyle]}>
        <LinearGradient
          colors={
            item.isTarget && phase === 'flashing'
              ? ['#F5F3FF', '#EDE9FE', '#DDD6FE']
              : ['rgba(255,255,255,0.95)', T.crystal, 'rgba(237,233,254,0.9)']
          }
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={{ fontSize: size * 0.46 }}>{item.emoji}</Text>
      </Animated.View>
    </Pressable>
  );
}

// ─── Celebrations & ripples ─────────────────────────────────────────────────

export function RecallCelebration({ visible, x, y }: { visible: boolean; x: number; y: number }) {
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
      <View style={[styles.recallBurst, { left: x - 50, top: y - 50 }]} />
      <Animated.View style={[styles.celebrateBanner, { left: x - 52, top: y - 58 }, bannerStyle]}>
        <LinearGradient colors={['#D1FAE5', '#6EE7B7', '#34D399']} style={styles.celebrateGrad}>
          <Text style={styles.celebrateText}>🧠 Recalled!</Text>
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
    opacity: 0.45 * (1 - expand.value),
    transform: [{ scale: 0.4 + expand.value * 1.5 }],
  }));

  return <Animated.View style={style} pointerEvents="none" />;
}

export function WrongRecallRipple({ ripples }: { ripples: RippleData[] }) {
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
  phase: Phase;
  hint: string;
};

export function MemoryFlashHUD({ round, totalRounds, score, phase, hint }: HudProps) {
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

  const phases: Phase[] = ['show_all', 'flashing', 'recall'];
  const phaseLabels = ['Observe', 'Flash', 'Recall'];

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
            <Text style={styles.hudTitle}>💫 Memory Flash</Text>
            <View style={styles.phaseTrack}>
              {phases.map((p, i) => (
                <View
                  key={p}
                  style={[
                    styles.phaseStep,
                    phase === p && styles.phaseStepActive,
                    phases.indexOf(phase) > i && styles.phaseStepDone,
                  ]}
                >
                  <Text style={[styles.phaseStepText, phase === p && styles.phaseStepTextActive]}>
                    {phaseLabels[i]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <Animated.View style={[styles.scoreBox, scoreBump]}>
            <Text style={styles.scoreLabel}>HITS</Text>
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
  introFlashWrap: { position: 'absolute', top: '18%', alignSelf: 'center', zIndex: 2 },
  introCrystal: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: T.crystal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.flash,
  },
  introFlashRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: T.flashGlow,
  },
  introEmoji: { fontSize: 36 },
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
  phasePreview: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' },
  phaseChip: { backgroundColor: 'rgba(139,92,246,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)' },
  phaseChipText: { fontSize: 12, fontWeight: '700', color: T.subtitle },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8, shadowColor: T.accentDark, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  startBtnGrad: { paddingVertical: 17, alignItems: 'center' },
  startBtnText: { fontSize: 18, fontWeight: '900', color: '#F5F3FF', letterSpacing: 0.3 },
  infoBackBtn: { paddingVertical: 8 },
  infoBackText: { fontSize: 14, fontWeight: '700', color: T.subtitle },

  nebulaCloud1: {
    position: 'absolute',
    top: '15%',
    left: '8%',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: T.nebula,
  },
  nebulaCloud2: {
    position: 'absolute',
    top: '50%',
    right: '5%',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: T.nebulaPink,
  },
  nebulaCloud3: {
    position: 'absolute',
    bottom: '18%',
    left: '20%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: T.nebulaBlue,
  },
  vignette: { ...StyleSheet.absoluteFillObject },

  phaseBanner: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    zIndex: 8,
    backgroundColor: 'rgba(30,27,75,0.85)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  phaseBannerText: { fontSize: 13, fontWeight: '900', letterSpacing: 1 },

  crystalHit: { position: 'absolute', zIndex: 5 },
  supernovaRing: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: T.flash,
    backgroundColor: T.flashRing,
  },
  crystal: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: T.flash,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },

  recallBurst: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: T.recallGlow, zIndex: 15 },
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
  hudCenter: { alignItems: 'center', flex: 1, marginHorizontal: 6 },
  hudTitle: { fontSize: 12, fontWeight: '800', color: T.title, marginBottom: 4 },
  phaseTrack: { flexDirection: 'row', gap: 4 },
  phaseStep: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: 'rgba(167,139,250,0.15)' },
  phaseStepActive: { backgroundColor: 'rgba(167,139,250,0.35)' },
  phaseStepDone: { backgroundColor: 'rgba(52,211,153,0.25)' },
  phaseStepText: { fontSize: 8, fontWeight: '700', color: T.subtitle },
  phaseStepTextActive: { color: T.title },
  scoreBox: { alignItems: 'flex-end' },
  scoreLabel: { fontSize: 9, fontWeight: '800', color: T.subtitle, letterSpacing: 1.2 },
  scoreValue: { fontSize: 22, fontWeight: '900', color: T.flashCore },
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
});
