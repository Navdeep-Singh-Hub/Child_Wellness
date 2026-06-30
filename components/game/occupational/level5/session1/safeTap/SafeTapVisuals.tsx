<<<<<<< HEAD
/**
 * Visual layer for Safe Tap — crystal cavern, gems, danger mines, tap FX.
 */
import { SAFE_TAP_THEME as T } from '@/components/game/occupational/level5/session1/safeTap/safeTapTheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
=======
/** Safe Tap — Clearance Zone visual layer */
import { SAFE_TAP_COPY as COPY, SAFE_TAP_THEME as T, ZONE } from '@/components/game/occupational/level5/session1/safeTap/safeTapTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
>>>>>>> parent of d0342ff (Revert "fgh")
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
<<<<<<< HEAD
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const TARGET_HALF = 30;
const BOMB_HALF = 26;

export type TapRippleData = { id: number; x: number; y: number; kind: 'hit' | 'miss' | 'bomb' };

// ─── Intro ──────────────────────────────────────────────────────────────────

type InfoProps = { onStart: () => void; onBack: () => void };

export function SafeTapInfoScreen({ onStart, onBack }: InfoProps) {
  const cardY = useSharedValue(36);
  const cardOp = useSharedValue(0);
  const crystalPulse = useSharedValue(0);

  useEffect(() => {
    cardY.value = withSpring(0, { damping: 15, stiffness: 110 });
    cardOp.value = withTiming(1, { duration: 500 });
    crystalPulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 1200 }), withTiming(0, { duration: 1200 })),
      -1,
      false,
    );
  }, [cardY, cardOp, crystalPulse]);

  const cardAnim = useAnimatedStyle(() => ({
    opacity: cardOp.value,
    transform: [{ translateY: cardY.value }],
  }));

  const crystalAnim = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(crystalPulse.value, [0, 1], [1, 1.12]) }],
    opacity: interpolate(crystalPulse.value, [0, 1], [0.85, 1]),
  }));

  return (
    <View style={styles.infoRoot}>
      <LinearGradient colors={[...T.cavern]} locations={[0, 0.4, 0.8, 1]} style={StyleSheet.absoluteFillObject} />
      <CavernDecor />
      <Animated.View style={[styles.infoCrystalWrap, crystalAnim]}>
        <CrystalGraphic size={72} />
      </Animated.View>
      <View style={styles.infoMineWrap}>
        <MineGraphic size={48} triggered={false} />
      </View>

      <Animated.View style={[styles.infoCard, cardAnim]}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={styles.legendDotSafe} />
            <Text style={styles.legendText}>TAP</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendDotDanger} />
            <Text style={styles.legendText}>AVOID</Text>
          </View>
        </View>
        <Text style={styles.infoTitle}>Safe Tap</Text>
        <Text style={styles.infoTagline}>Crystal Cavern · Selective Attention</Text>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionLabel}>How to play</Text>
          <Text style={styles.infoBody}>
            Tap the glowing green crystal to collect it. Red mines are dangerous — don't touch them! Stay focused and choose wisely.
          </Text>
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={['#6EE7B7', '#34D399', '#10B981', '#059669']} style={styles.startBtnGrad}>
            <Text style={styles.startBtnText}>💎 Enter the Cavern</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoBackBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.infoBackText}>← Back to games</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── Cavern backdrop ────────────────────────────────────────────────────────

export function CavernBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.cavern]} locations={[0, 0.35, 0.7, 1]} style={styles.cavernSky} />
      <CavernDecor />
      <View style={styles.cavernFloor}>
        <LinearGradient colors={[...T.cavernFloor]} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFillObject} />
        <FloorCrystals />
      </View>
      <AmbientGlow />
=======
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const GRID_LINES = 8;

export function ClearanceBackdrop() {
  const scan = useSharedValue(0);
  useEffect(() => {
    scan.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.linear }),
      -1,
      false,
    );
  }, [scan]);

  const scanStyle = useAnimatedStyle(() => ({
    top: `${interpolate(scan.value, [0, 1], [8, 88])}%`,
    opacity: interpolate(scan.value, [0, 0.5, 1], [0.15, 0.55, 0.15]),
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      {Array.from({ length: GRID_LINES }).map((_, i) => (
        <View
          key={`h-${i}`}
          style={[styles.gridH, { top: `${(i + 1) * (100 / (GRID_LINES + 1))}%`, backgroundColor: ZONE.gridLine }]}
        />
      ))}
      {Array.from({ length: GRID_LINES }).map((_, i) => (
        <View
          key={`v-${i}`}
          style={[styles.gridV, { left: `${(i + 1) * (100 / (GRID_LINES + 1))}%`, backgroundColor: ZONE.gridLine }]}
        />
      ))}
      <Animated.View style={[styles.scanLine, scanStyle]} />
      <View style={[styles.cautionCorner, styles.cautionTL]} />
      <View style={[styles.cautionCorner, styles.cautionTR]} />
      <View style={[styles.cautionCorner, styles.cautionBL]} />
      <View style={[styles.cautionCorner, styles.cautionBR]} />
      <Text style={styles.zoneLabel}>CLEARANCE ZONE</Text>
>>>>>>> parent of d0342ff (Revert "fgh")
    </View>
  );
}

<<<<<<< HEAD
function CavernDecor() {
  const stalactites = [
    { left: '5%', w: 14, h: 40 },
    { left: '18%', w: 10, h: 28 },
    { left: '35%', w: 16, h: 52 },
    { left: '55%', w: 12, h: 35 },
    { left: '72%', w: 18, h: 48 },
    { left: '88%', w: 11, h: 30 },
  ];
  const stalagmites = [
    { left: '10%', h: 22 },
    { left: '28%', h: 32 },
    { left: '48%', h: 18 },
    { left: '65%', h: 28 },
    { left: '82%', h: 24 },
  ];
  return (
    <>
      <View style={styles.stalactiteRow} pointerEvents="none">
        {stalactites.map((s, i) => (
          <View key={`st-${i}`} style={[styles.stalactite, { left: s.left, width: s.w, height: s.h }]} />
        ))}
      </View>
      <View style={styles.stalagmiteRow} pointerEvents="none">
        {stalagmites.map((s, i) => (
          <View key={`sg-${i}`} style={[styles.stalagmite, { left: s.left, height: s.h }]} />
        ))}
      </View>
=======
export function ClearanceIntroBackdrop() {
  return (
    <>
      <ClearanceBackdrop />
      <View style={styles.introGlow} />
>>>>>>> parent of d0342ff (Revert "fgh")
    </>
  );
}

<<<<<<< HEAD
function FloorCrystals() {
  const spots = [
    { left: '12%', color: T.crystalGlow },
    { left: '45%', color: T.mineGlow },
    { left: '78%', color: T.crystalGlow },
  ];
  return (
    <>
      {spots.map((s, i) => (
        <View key={i} style={[styles.floorGlow, { left: s.left, backgroundColor: s.color }]} />
      ))}
    </>
  );
}

function AmbientGlow() {
  const pulse = useSharedValue(0.4);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(0.8, { duration: 2500 }), withTiming(0.4, { duration: 2500 })),
=======
export function SafeShieldTarget({
  x,
  y,
  size,
  scaleStyle,
}: {
  x: number;
  y: number;
  size: number;
  scaleStyle: object;
}) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
>>>>>>> parent of d0342ff (Revert "fgh")
      -1,
      false,
    );
  }, [pulse]);

<<<<<<< HEAD
  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return (
    <Animated.View style={[styles.ambientGlow, style]} pointerEvents="none">
      <LinearGradient colors={['transparent', T.gemLight, 'transparent']} style={StyleSheet.absoluteFillObject} />
    </Animated.View>
  );
}

// ─── Crystal target ─────────────────────────────────────────────────────────

function CrystalGraphic({ size }: { size: number }) {
  const half = size / 2;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[styles.crystalShape, { borderLeftWidth: half * 0.55, borderRightWidth: half * 0.55, borderBottomWidth: size * 0.85, borderBottomColor: T.crystal }]} />
      <View style={[styles.crystalFacet, { width: half * 0.3, height: half * 0.5, backgroundColor: T.crystalCore }]} />
      <View style={[styles.crystalShine, { top: size * 0.15, left: size * 0.35 }]} />
    </View>
  );
}

export function CrystalTarget({
  x,
  y,
  celebrating,
}: {
  x: number;
  y: number;
  celebrating: boolean;
}) {
  const pulse = useSharedValue(0);
  const ring = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 })),
      -1,
      false,
    );
    ring.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, [pulse, ring]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.35, 0.7]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.25]) }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ring.value, [0, 0.15, 1], [0, 0.5, 0]),
    transform: [{ scale: interpolate(ring.value, [0, 1], [0.9, 1.6]) }],
  }));

  const scale = celebrating ? 1.35 : 1;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: x - TARGET_HALF, top: y - TARGET_HALF, zIndex: 4 }}>
      <Animated.View style={[styles.safeZone, { left: -12, top: -12, width: (TARGET_HALF + 12) * 2, height: (TARGET_HALF + 12) * 2 }, ringStyle]} />
      <Animated.View style={[styles.crystalGlow, glowStyle]} />
      <View style={{ transform: [{ scale }] }}>
        <CrystalGraphic size={TARGET_HALF * 2} />
      </View>
    </View>
  );
}

// ─── Danger mine ────────────────────────────────────────────────────────────

function MineGraphic({ size, triggered }: { size: number; triggered: boolean }) {
  const spark = useSharedValue(0);
  const fuse = useSharedValue(0);

  useEffect(() => {
    spark.value = withRepeat(
      withSequence(withTiming(1, { duration: 200 }), withTiming(0, { duration: 300 })),
      -1,
      false,
    );
    fuse.value = withRepeat(
      withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })),
      -1,
      false,
    );
  }, [spark, fuse]);

  const sparkStyle = useAnimatedStyle(() => ({
    opacity: triggered ? 1 : interpolate(spark.value, [0, 1], [0.4, 1]),
    transform: [{ scale: triggered ? 1.8 : interpolate(spark.value, [0, 1], [0.8, 1.2]) }],
  }));

  const fuseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(fuse.value, [0.3, 1], [0.6, 1]),
  }));

  const r = size / 2;
  return (
    <View style={{ width: size, height: size + 10, alignItems: 'center' }}>
      <Animated.View style={[styles.fuse, fuseStyle]}>
        <View style={styles.fuseLine} />
        <Animated.View style={[styles.fuseSpark, sparkStyle]} />
      </Animated.View>
      <View style={[styles.mineBody, { width: size, height: size * 0.85, borderRadius: r * 0.4 }]}>
        <LinearGradient colors={['#EF4444', T.mine, '#991B1B']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.mineHighlight} />
        <Text style={styles.mineSkull}>☠</Text>
      </View>
    </View>
=======
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.18]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.45, 0.85]),
  }));

  const half = size / 2;
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.entityWrap, { left: x - half, top: y - half, width: size, height: size }, scaleStyle]}
    >
      <Animated.View style={[styles.safeRing, { width: size + 16, height: size + 16, borderRadius: (size + 16) / 2 }, ringStyle]} />
      <LinearGradient colors={['#6EE7B7', ZONE.safeCore, '#047857']} style={[styles.safeBody, { width: size, height: size, borderRadius: half }]}>
        <Text style={styles.safeEmoji}>🛡️</Text>
        <View style={styles.safeBadge}>
          <Text style={styles.safeBadgeText}>SAFE</Text>
        </View>
      </LinearGradient>
    </Animated.View>
>>>>>>> parent of d0342ff (Revert "fgh")
  );
}

export function DangerMine({
  x,
  y,
<<<<<<< HEAD
  triggered,
}: {
  x: number;
  y: number;
  triggered: boolean;
}) {
  const dangerPulse = useSharedValue(0);
  const explode = useSharedValue(0);

  useEffect(() => {
    dangerPulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 1100 }), withTiming(0.5, { duration: 1100 })),
      -1,
      false,
    );
  }, [dangerPulse]);

  useEffect(() => {
    if (!triggered) return;
    explode.value = withSequence(
      withSpring(1.5, { damping: 4, stiffness: 300 }),
      withTiming(1, { duration: 200 }),
    );
  }, [triggered, explode]);

  const zoneStyle = useAnimatedStyle(() => ({
    opacity: interpolate(dangerPulse.value, [0.5, 1], [0.15, 0.35]),
    transform: [{ scale: interpolate(dangerPulse.value, [0.5, 1], [1, 1.08]) }],
  }));

  const explodeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: triggered ? explode.value : 1 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left: x - BOMB_HALF, top: y - BOMB_HALF, zIndex: 3 },
        explodeStyle,
      ]}
    >
      <Animated.View style={[styles.dangerZone, { left: -14, top: -14, width: (BOMB_HALF + 14) * 2, height: (BOMB_HALF + 14) * 2 }, zoneStyle]} />
      {triggered && <View style={styles.explosionRing} />}
      <MineGraphic size={BOMB_HALF * 2} triggered={triggered} />
=======
  size,
  flashing,
}: {
  x: number;
  y: number;
  size: number;
  flashing: boolean;
}) {
  const tick = useSharedValue(0);
  useEffect(() => {
    tick.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 550, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 550, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [tick]);

  const warnStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tick.value, [0, 1], [0.35, 0.9]),
    transform: [{ scale: flashing ? 1.25 : interpolate(tick.value, [0, 1], [1, 1.08]) }],
  }));

  const half = size / 2;
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.entityWrap, warnStyle, { left: x - half, top: y - half, width: size, height: size }]}
    >
      <View style={[styles.dangerRing, { width: size + 12, height: size + 12, borderRadius: (size + 12) / 2 }]} />
      <LinearGradient colors={['#FCA5A5', ZONE.dangerCore, '#7F1D1D']} style={[styles.dangerBody, { width: size, height: size, borderRadius: half }]}>
        <Text style={styles.dangerEmoji}>💣</Text>
        <View style={styles.dangerBadge}>
          <Text style={styles.dangerBadgeText}>!</Text>
        </View>
      </LinearGradient>
>>>>>>> parent of d0342ff (Revert "fgh")
    </Animated.View>
  );
}

<<<<<<< HEAD
// ─── Screen shake ───────────────────────────────────────────────────────────

export function ScreenShake({ trigger, children }: { trigger: number; children: React.ReactNode }) {
  const shake = useSharedValue(0);

  useEffect(() => {
    if (trigger === 0) return;
    shake.value = withSequence(
      withTiming(1, { duration: 50 }),
      withTiming(-1, { duration: 50 }),
      withTiming(0.6, { duration: 50 }),
      withTiming(-0.6, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [trigger, shake]);

  const style = useAnimatedStyle(() => ({
    flex: 1,
    transform: [{ translateX: shake.value * 8 }, { translateY: shake.value * 4 }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
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
  const color =
    kind === 'hit' ? T.crystalGlow : kind === 'bomb' ? T.mineGlow : T.miss;
  const border = kind === 'hit' ? T.crystal : kind === 'bomb' ? T.danger : '#94A3B8';

  useEffect(() => {
    expand.value = 0;
    expand.value = withTiming(1, { duration: kind === 'bomb' ? 500 : 580, easing: Easing.out(Easing.cubic) });
  }, [expand, kind]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x - 28,
    top: y - 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: border,
    backgroundColor: color,
    opacity: 1 - expand.value,
    transform: [{ scale: 0.35 + expand.value * 1.7 }],
    zIndex: 20,
  }));

  return <Animated.View style={style} pointerEvents="none" />;
}

// ─── Celebration ────────────────────────────────────────────────────────────

export function CrystalCelebration({ x, y }: { x: number; y: number }) {
  const bloom = useSharedValue(0);
  useEffect(() => {
    bloom.value = withSpring(1, { damping: 8, stiffness: 180 });
  }, [bloom]);

  const bannerStyle = useAnimatedStyle(() => ({
    opacity: bloom.value,
    transform: [{ scale: interpolate(bloom.value, [0, 1], [0.4, 1]) }],
  }));

  const shards = Array.from({ length: 10 });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.celebrateBanner, { left: x - 65, top: y - TARGET_HALF - 48 }, bannerStyle]}>
        <LinearGradient colors={['#A7F3D0', '#6EE7B7', '#34D399']} style={styles.celebrateGrad}>
          <Text style={styles.celebrateText}>💎 Collected!</Text>
        </LinearGradient>
      </Animated.View>
      {shards.map((_, i) => (
        <ShardParticle key={i} i={i} x={x} y={y} />
      ))}
=======
export function DangerFlashOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return <View style={styles.dangerFlash} pointerEvents="none" />;
}

export function MissionToast({ text, visible, danger }: { text: string; visible: boolean; danger?: boolean }) {
  if (!visible) return null;
  return (
    <View style={styles.toastWrap} pointerEvents="none">
      <LinearGradient
        colors={danger ? [...COPY.dangerGradient] : ['rgba(255,255,255,0.95)', 'rgba(209,250,229,0.92)']}
        style={[styles.toastGrad, danger && styles.toastDanger]}
      >
        <Text style={[styles.toastText, danger && styles.toastTextDanger]}>{text}</Text>
      </LinearGradient>
>>>>>>> parent of d0342ff (Revert "fgh")
    </View>
  );
}

<<<<<<< HEAD
function ShardParticle({ i, x, y }: { i: number; x: number; y: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) });
  }, [t]);

  const style = useAnimatedStyle(() => {
    const angle = (i / 10) * Math.PI * 2;
    const r = 18 + 55 * t.value;
    return {
      position: 'absolute',
      left: x + Math.cos(angle) * r - 4,
      top: y + Math.sin(angle) * r - 6,
      width: 8,
      height: 12,
      backgroundColor: i % 2 === 0 ? T.crystal : T.crystalCore,
      borderRadius: 2,
      opacity: 1 - t.value,
      transform: [{ rotate: `${t.value * 200 + i * 36}deg` }],
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
};

export function SafeTapHUD({ round, totalRounds, score, hint, showHint }: HudProps) {
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
  const glassProps = Platform.OS === 'ios' ? { intensity: 40, tint: 'dark' as const } : {};

  return (
    <View style={styles.hudWrap} pointerEvents="none">
      <Glass {...glassProps} style={styles.hudGlass}>
        <View style={styles.hudRow}>
          <View>
            <Text style={styles.hudLabel}>CAVERN</Text>
            <Text style={styles.hudRound}>
              {round}<Text style={styles.hudRoundTotal}>/{totalRounds}</Text>
            </Text>
          </View>
          <View style={styles.hudCenter}>
            <Text style={styles.hudTitle}>💎 Safe Tap</Text>
            <View style={styles.safeDangerRow}>
              <View style={styles.safeBadge}><Text style={styles.safeBadgeText}>TAP 💎</Text></View>
              <View style={styles.dangerBadge}><Text style={styles.dangerBadgeText}>AVOID 💣</Text></View>
            </View>
          </View>
          <Animated.View style={[styles.scoreBox, scoreBump]}>
            <Text style={styles.scoreLabel}>GEMS</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </Animated.View>
        </View>
        {showHint && hint ? (
          <View style={styles.hintPill}>
            <Text style={styles.hudHint}>{hint}</Text>
          </View>
        ) : null}
      </Glass>
=======
export function LegendBar() {
  return (
    <View style={styles.legend} pointerEvents="none">
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: ZONE.safeGlow }]} />
        <Text style={styles.legendText}>Tap</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: ZONE.dangerGlow }]} />
        <Text style={styles.legendText}>Avoid</Text>
      </View>
>>>>>>> parent of d0342ff (Revert "fgh")
    </View>
  );
}

<<<<<<< HEAD
// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  infoRoot: { flex: 1 },
  infoCrystalWrap: { position: 'absolute', top: '14%', left: '28%' },
  infoMineWrap: { position: 'absolute', top: '20%', right: '22%' },
  infoCard: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 28,
    backgroundColor: 'rgba(30,27,75,0.92)',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(52,211,153,0.35)',
    alignItems: 'center',
    shadowColor: '#34D399',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  legendRow: { flexDirection: 'row', gap: 20, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDotSafe: { width: 12, height: 12, borderRadius: 6, backgroundColor: T.crystal },
  legendDotDanger: { width: 12, height: 12, borderRadius: 6, backgroundColor: T.mine },
  legendText: { fontSize: 10, fontWeight: '800', color: T.subtitle, letterSpacing: 1 },
  infoTitle: { fontSize: 32, fontWeight: '900', color: T.title, letterSpacing: -0.5 },
  infoTagline: { fontSize: 11, fontWeight: '700', color: T.subtitle, textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 14 },
  infoSection: { width: '100%', marginBottom: 14 },
  infoSectionLabel: { fontSize: 11, fontWeight: '800', color: T.accent, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.8 },
  infoBody: { fontSize: 15, lineHeight: 23, color: '#CBD5E1', fontWeight: '500' },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8, shadowColor: T.accent, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  startBtnGrad: { paddingVertical: 17, alignItems: 'center' },
  startBtnText: { fontSize: 18, fontWeight: '900', color: '#064E3B', letterSpacing: 0.3 },
  infoBackBtn: { paddingVertical: 8 },
  infoBackText: { fontSize: 14, fontWeight: '700', color: T.subtitle },

  cavernSky: { height: '55%' },
  stalactiteRow: { position: 'absolute', top: 0, left: 0, right: 0, height: 60 },
  stalactite: { position: 'absolute', top: 0, backgroundColor: T.stalactite, borderBottomLeftRadius: 6, borderBottomRightRadius: 6 },
  stalagmiteRow: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, flexDirection: 'row' },
  stalagmite: { position: 'absolute', bottom: 0, width: 14, backgroundColor: T.stalagmite, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  cavernFloor: { flex: 1, marginTop: '42%' },
  floorGlow: { position: 'absolute', bottom: 20, width: 60, height: 20, borderRadius: 30, opacity: 0.5 },
  ambientGlow: { position: 'absolute', bottom: '15%', left: '20%', right: '20%', height: 80, borderRadius: 40, overflow: 'hidden' },

  crystalShape: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  crystalFacet: { position: 'absolute', top: '35%', borderRadius: 2, opacity: 0.7 },
  crystalShine: { position: 'absolute', width: 8, height: 14, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 4, transform: [{ rotate: '-20deg' }] },
  crystalGlow: { position: 'absolute', alignSelf: 'center', width: TARGET_HALF * 2.4, height: TARGET_HALF * 2.4, borderRadius: TARGET_HALF * 1.2, backgroundColor: T.crystalGlow },
  safeZone: { position: 'absolute', borderRadius: 999, borderWidth: 2, borderColor: T.crystalGlow },

  fuse: { position: 'absolute', top: -8, alignSelf: 'center', alignItems: 'center', zIndex: 2 },
  fuseLine: { width: 2, height: 10, backgroundColor: T.mineFuse, borderRadius: 1 },
  fuseSpark: { position: 'absolute', top: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: T.mineSpark },
  mineBody: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  mineHighlight: { position: 'absolute', top: 4, left: 6, width: 10, height: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3 },
  mineSkull: { fontSize: 18, color: 'rgba(0,0,0,0.5)' },
  dangerZone: { position: 'absolute', borderRadius: 999, backgroundColor: T.dangerZone, borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.35)' },
  explosionRing: { position: 'absolute', alignSelf: 'center', top: -8, width: BOMB_HALF * 2.8, height: BOMB_HALF * 2.8, borderRadius: BOMB_HALF * 1.4, borderWidth: 3, borderColor: T.danger, backgroundColor: 'rgba(239,68,68,0.3)' },

  celebrateBanner: { position: 'absolute', borderRadius: 18, overflow: 'hidden', zIndex: 40 },
  celebrateGrad: { paddingHorizontal: 22, paddingVertical: 11 },
  celebrateText: { fontSize: 22, fontWeight: '900', color: '#064E3B' },

  hudWrap: { paddingHorizontal: 12, paddingTop: 44, zIndex: 20 },
  hudGlass: { borderRadius: 22, overflow: 'hidden', borderWidth: 1.5, borderColor: T.hudBorder, backgroundColor: 'rgba(15,23,42,0.75)', paddingHorizontal: 14, paddingVertical: 12 },
  hudRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hudLabel: { fontSize: 9, fontWeight: '800', color: T.subtitle, letterSpacing: 1.2 },
  hudRound: { fontSize: 26, fontWeight: '900', color: T.title },
  hudRoundTotal: { fontSize: 14, fontWeight: '700', color: T.subtitle },
  hudCenter: { alignItems: 'center', flex: 1, paddingHorizontal: 6 },
  hudTitle: { fontSize: 13, fontWeight: '900', color: T.title, marginBottom: 5 },
  safeDangerRow: { flexDirection: 'row', gap: 6 },
  safeBadge: { backgroundColor: 'rgba(52,211,153,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(52,211,153,0.4)' },
  safeBadgeText: { fontSize: 8, fontWeight: '800', color: T.accent },
  dangerBadge: { backgroundColor: 'rgba(239,68,68,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)' },
  dangerBadgeText: { fontSize: 8, fontWeight: '800', color: T.danger },
  scoreBox: { alignItems: 'center', backgroundColor: 'rgba(52,211,153,0.18)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(52,211,153,0.4)' },
  scoreLabel: { fontSize: 8, fontWeight: '800', color: T.accent, letterSpacing: 0.8 },
  scoreValue: { fontSize: 24, fontWeight: '900', color: T.title },
  hintPill: { marginTop: 8, alignSelf: 'center', backgroundColor: 'rgba(52,211,153,0.12)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(52,211,153,0.25)' },
  hudHint: { fontSize: 13, fontWeight: '800', color: T.subtitle, letterSpacing: 0.3 },
});

export const SAFE_TAP_TARGET_HALF = TARGET_HALF;
export const SAFE_TAP_BOMB_HALF = BOMB_HALF;
=======
const styles = StyleSheet.create({
  gridH: { position: 'absolute', left: 0, right: 0, height: 1 },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1 },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: ZONE.scanLine,
    shadowColor: ZONE.safeGlow,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  cautionCorner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: ZONE.caution,
    opacity: 0.7,
  },
  cautionTL: { top: 10, left: 10, borderTopWidth: 3, borderLeftWidth: 3 },
  cautionTR: { top: 10, right: 10, borderTopWidth: 3, borderRightWidth: 3 },
  cautionBL: { bottom: 10, left: 10, borderBottomWidth: 3, borderLeftWidth: 3 },
  cautionBR: { bottom: 10, right: 10, borderBottomWidth: 3, borderRightWidth: 3 },
  zoneLabel: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2.5,
    color: 'rgba(110,231,183,0.45)',
  },
  introGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(52,211,153,0.06)',
  },
  entityWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  safeRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: ZONE.safeRing,
    backgroundColor: 'rgba(52,211,153,0.08)',
  },
  safeBody: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: ZONE.safeGlow,
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 8,
  },
  safeEmoji: { fontSize: 26 },
  safeBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: ZONE.safeCore,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  safeBadgeText: { fontSize: 8, fontWeight: '900', color: '#ECFDF5', letterSpacing: 0.8 },
  dangerRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: ZONE.dangerRing,
    borderStyle: 'dashed',
  },
  dangerBody: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
    shadowColor: ZONE.dangerGlow,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  dangerEmoji: { fontSize: 22 },
  dangerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ZONE.caution,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  dangerBadgeText: { fontSize: 11, fontWeight: '900', color: '#7F1D1D' },
  dangerFlash: { ...StyleSheet.absoluteFillObject, backgroundColor: ZONE.dangerFlash, zIndex: 20 },
  toastWrap: { position: 'absolute', top: '36%', alignSelf: 'center', left: 0, right: 0, alignItems: 'center', zIndex: 25 },
  toastGrad: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.45)',
  },
  toastDanger: { borderColor: 'rgba(255,255,255,0.35)' },
  toastText: { fontSize: 15, fontWeight: '900', color: T.title },
  toastTextDanger: { color: '#fff' },
  legend: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 16,
    backgroundColor: 'rgba(15,23,42,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    zIndex: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, fontWeight: '800', color: 'rgba(226,232,240,0.85)' },
});
>>>>>>> parent of d0342ff (Revert "fgh")
