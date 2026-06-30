/**
 * Visual layer for Train Track — countryside rail loop, steam engine, conductor puck.
 */
import { TRAIN_TRACK_COPY as COPY, TRAIN_TRACK_THEME as T } from '@/components/game/occupational/level5/session3/trainTrack/trainTrackTheme';
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
import Svg, { Ellipse } from 'react-native-svg';

const ENGINE_HALF = 30;

export type PuffPoint = { x: number; y: number; opacity: number };

// ─── Intro ──────────────────────────────────────────────────────────────────

type InfoProps = { onStart: () => void; onBack: () => void };

function IntroTrain() {
  const chug = useSharedValue(0);
  useEffect(() => {
    chug.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [chug]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(chug.value, [0, 1], [-30, 30]) },
      { rotate: `${interpolate(chug.value, [0, 0.5, 1], [-5, 0, 5])}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.introTrainWrap, style]}>
      <EngineGraphic size={72} />
    </Animated.View>
  );
}

export function TrainTrackInfoScreen({ onStart, onBack }: InfoProps) {
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
      <LinearGradient colors={[...T.sky]} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
      <TrainTrackBackdrop playW={360} playH={500} />
      <IntroTrain />

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
          <LinearGradient colors={['#F59E0B', '#D97706', '#B45309', '#92400E']} style={styles.startBtnGrad}>
            <Text style={styles.startBtnText}>🚂 All Aboard!</Text>
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

export function TrainTrackBackdrop({ playW, playH }: { playW: number; playH: number }) {
  const cx = playW * 0.5;
  const cy = playH * 0.45;
  const rx = Math.min(playW, playH) * 0.28;
  const ry = rx * 0.65;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.grassBand, { top: playH * 0.55 }]} />
      <Hills />
      <Clouds />
      {playW > 80 && (
        <Svg width={playW} height={playH} style={StyleSheet.absoluteFill}>
          <Ellipse
            cx={cx}
            cy={cy}
            rx={rx + 14}
            ry={ry + 10}
            stroke={T.railTie}
            strokeWidth={8}
            fill="none"
            opacity={0.25}
          />
          <Ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            stroke={T.railSteel}
            strokeWidth={5}
            fill="none"
            strokeDasharray="12 8"
            opacity={0.55}
          />
          <Ellipse
            cx={cx}
            cy={cy}
            rx={rx - 6}
            ry={ry - 4}
            stroke={T.railGlow}
            strokeWidth={2}
            fill="none"
            opacity={0.7}
          />
        </Svg>
      )}
      <StationSign />
    </View>
  );
}

function Hills() {
  return (
    <>
      <View style={[styles.hill, { left: '-5%', bottom: '18%', width: '45%', backgroundColor: T.grass }]} />
      <View style={[styles.hill, { right: '-8%', bottom: '22%', width: '50%', backgroundColor: T.grassDark, opacity: 0.7 }]} />
    </>
  );
}

function Clouds() {
  return (
    <>
      <View style={[styles.cloud, { top: '10%', left: '8%' }]} />
      <View style={[styles.cloud, { top: '6%', right: '12%', width: 80 }]} />
      <View style={[styles.cloud, { top: '18%', left: '40%', width: 60, opacity: 0.7 }]} />
    </>
  );
}

function StationSign() {
  return (
    <View style={styles.stationSign}>
      <Text style={styles.stationText}>STATION</Text>
    </View>
  );
}

// ─── Engine graphic ─────────────────────────────────────────────────────────

function EngineGraphic({ size }: { size: number }) {
  const wheelSize = size * 0.22;
  return (
    <View style={{ width: size, height: size * 0.7, alignItems: 'center' }}>
      <View style={[styles.smokeStack, { width: size * 0.18, height: size * 0.35, right: size * 0.08 }]}>
        <LinearGradient colors={['#451A03', T.trainCab]} style={StyleSheet.absoluteFillObject} />
      </View>
      <View style={[styles.engineCab, { width: size * 0.75, height: size * 0.55, borderRadius: size * 0.08 }]}>
        <LinearGradient colors={[T.trainBody, T.trainCab, '#92400E']} style={StyleSheet.absoluteFillObject} />
        <View style={[styles.engineWindow, { width: size * 0.2, height: size * 0.2, borderRadius: size * 0.04 }]} />
        <View style={[styles.wheel, { width: wheelSize, height: wheelSize, borderRadius: wheelSize / 2, left: size * 0.12, bottom: -wheelSize * 0.35 }]} />
        <View style={[styles.wheel, { width: wheelSize, height: wheelSize, borderRadius: wheelSize / 2, right: size * 0.12, bottom: -wheelSize * 0.35 }]} />
      </View>
    </View>
  );
}

export function TrainEngine({
  x,
  y,
  angle,
  riding,
}: {
  x: number;
  y: number;
  angle: number;
  riding: boolean;
}) {
  const chug = useSharedValue(0);
  useEffect(() => {
    chug.value = withRepeat(
      withSequence(withTiming(1, { duration: 200 }), withTiming(0, { duration: 200 })),
      -1,
      false,
    );
  }, [chug]);

  const chugStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: riding ? interpolate(chug.value, [0, 1], [0, -2]) : 0 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: x - ENGINE_HALF,
          top: y - ENGINE_HALF,
          zIndex: 5,
          transform: [{ rotate: `${angle + 90}deg` }],
        },
        chugStyle,
      ]}
    >
      {riding && (
        <View
          style={[
            styles.rideRing,
            { width: ENGINE_HALF * 2.4, height: ENGINE_HALF * 2.4, borderRadius: ENGINE_HALF * 1.2 },
          ]}
        />
      )}
      <EngineGraphic size={ENGINE_HALF * 2} />
    </Animated.View>
  );
}

// ─── Conductor puck & tether ────────────────────────────────────────────────

export function ConductorPuck({
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
    opacity: active ? 0.45 + ring.value * 0.35 : 0.25,
    transform: [{ scale: 1 + ring.value * 0.12 }],
  }));

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, zIndex: 7 }}>
      <Animated.View
        style={[
          styles.puckRing,
          {
            width: size + 12,
            height: size + 12,
            borderRadius: (size + 12) / 2,
            borderColor: active ? T.success : T.accent,
          },
          ringStyle,
        ]}
      />
      <LinearGradient
        colors={active ? ['#86EFAC', '#4ADE80', '#16A34A'] : [T.conductor, '#FDE68A', '#F59E0B']}
        style={[styles.puck, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Text style={styles.conductorBadge}>🎫</Text>
      </LinearGradient>
      {active && progress > 0 && <Text style={styles.puckPct}>{progress}%</Text>}
    </View>
  );
}

export function RailTether({
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
    pulse.value = withRepeat(withTiming(1, { duration: 450 }), -1, true);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: active ? 0.5 + pulse.value * 0.35 : 0.28,
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

// ─── Steam meter & puffs ────────────────────────────────────────────────────

export function SteamMeter({
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
    <View pointerEvents="none" style={[styles.steamWrap, { left: x - 50, top: y }]}>
      <Text style={styles.steamLabel}>STEAM</Text>
      <View style={styles.steamBar}>
        <View style={[styles.steamFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

export function SteamPuffs({ points }: { points: PuffPoint[] }) {
  return (
    <>
      {points.map((pt, i) => (
        <View
          key={`p${i}`}
          pointerEvents="none"
          style={[
            styles.puff,
            {
              left: pt.x - 8,
              top: pt.y - 12,
              opacity: pt.opacity * 0.65,
              width: 16 - i,
              height: 16 - i,
              borderRadius: 8 - i * 0.5,
            },
          ]}
        />
      ))}
    </>
  );
}

// ─── Countdown ──────────────────────────────────────────────────────────────

export function StationCountdown({ onDone }: { onDone: () => void }) {
  const [step, setStep] = React.useState(0);
  const steps = ['3', '2', '1', 'DEPART!'] as const;
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
  const isDepart = steps[step] === 'DEPART!';
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.cdOverlay} pointerEvents="none">
      <Animated.View style={[styles.cdBubble, isDepart && styles.cdDepart, anim]}>
        <Text style={[styles.cdText, isDepart && styles.cdDepartText]}>{steps[step]}</Text>
      </Animated.View>
    </View>
  );
}

// ─── Celebration ────────────────────────────────────────────────────────────

export function TrackCelebration({ visible, x, y }: { visible: boolean; x: number; y: number }) {
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
      <View style={[styles.trackBurst, { left: x - 50, top: y - 50 }]} />
      <Animated.View style={[styles.celebrateBanner, { left: x - 58, top: y - ENGINE_HALF - 50 }, bannerStyle]}>
        <LinearGradient colors={['#FEF3C7', '#FDE68A', '#F59E0B']} style={styles.celebrateGrad}>
          <Text style={styles.celebrateText}>🚂 On Track!</Text>
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
  isRiding: boolean;
};

export function TrainTrackHUD({
  round,
  totalRounds,
  score,
  hint,
  showHint,
  followProgress,
  isRiding,
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
  const glassProps = Platform.OS === 'ios' ? { intensity: 52, tint: 'light' as const } : {};

  return (
    <View style={styles.hudWrap} pointerEvents="none">
      <Glass {...glassProps} style={styles.hudGlass}>
        <View style={styles.hudRow}>
          <View>
            <Text style={styles.hudLabel}>LAP</Text>
            <Text style={styles.hudRound}>
              {round}
              <Text style={styles.hudRoundTotal}>/{totalRounds}</Text>
            </Text>
          </View>
          <View style={styles.hudCenter}>
            <Text style={styles.hudTitle}>🚂 Train Track</Text>
            <View style={styles.lapDots}>
              {Array.from({ length: totalRounds }).map((_, i) => (
                <View key={i} style={[styles.dot, i < score && styles.dotDone, i === round - 1 && styles.dotActive]} />
              ))}
            </View>
          </View>
          <Animated.View style={[styles.scoreBox, scoreBump]}>
            <Text style={styles.scoreLabel}>LAPS</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </Animated.View>
        </View>
        {showHint && hint ? (
          <View style={styles.hintPill}>
            <Text style={styles.hudHint}>{hint}</Text>
          </View>
        ) : null}
        {isRiding && followProgress > 0 && (
          <View style={styles.hudSteamBar}>
            <View style={[styles.hudSteamFill, { width: `${followProgress}%` }]} />
          </View>
        )}
      </Glass>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  infoRoot: { flex: 1 },
  introTrainWrap: { position: 'absolute', top: '20%', alignSelf: 'center', zIndex: 2 },
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
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  infoEmoji: { fontSize: 44, marginBottom: 2 },
  infoTitle: { fontSize: 32, fontWeight: '900', color: T.title, letterSpacing: -0.5 },
  infoTagline: { fontSize: 11, fontWeight: '700', color: T.subtitle, textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 14 },
  infoSection: { width: '100%', marginBottom: 12 },
  infoSectionLabel: { fontSize: 11, fontWeight: '800', color: T.accentDark, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.8 },
  infoBody: { fontSize: 15, lineHeight: 23, color: '#57534E', fontWeight: '500' },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' },
  chip: { backgroundColor: 'rgba(245,158,11,0.12)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  chipText: { fontSize: 13, fontWeight: '700', color: T.subtitle },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8, shadowColor: T.accentDark, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  startBtnGrad: { paddingVertical: 17, alignItems: 'center' },
  startBtnText: { fontSize: 18, fontWeight: '900', color: '#FFFBEB', letterSpacing: 0.3 },
  infoBackBtn: { paddingVertical: 8 },
  infoBackText: { fontSize: 14, fontWeight: '700', color: T.subtitle },

  grassBand: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '45%', backgroundColor: T.grass, opacity: 0.35 },
  hill: { position: 'absolute', height: 80, borderTopLeftRadius: 60, borderTopRightRadius: 60 },
  cloud: { position: 'absolute', width: 70, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.75)' },
  stationSign: {
    position: 'absolute',
    top: 12,
    right: 14,
    backgroundColor: T.trainCab,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: T.railTie,
  },
  stationText: { fontSize: 9, fontWeight: '900', color: '#FEF3C7', letterSpacing: 1.5 },

  smokeStack: { position: 'absolute', top: 0, borderRadius: 4, overflow: 'hidden', zIndex: 1 },
  engineCab: { overflow: 'visible', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: T.railTie },
  engineWindow: { backgroundColor: T.trainWindow, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)' },
  wheel: { position: 'absolute', backgroundColor: T.trainWheel, borderWidth: 2, borderColor: '#78716C' },
  rideRing: {
    position: 'absolute',
    alignSelf: 'center',
    top: -6,
    borderWidth: 2,
    borderColor: 'rgba(22,163,74,0.45)',
    borderStyle: 'dashed',
  },

  puck: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)' },
  puckRing: { position: 'absolute', top: -6, left: -6, borderWidth: 2, borderStyle: 'dashed' },
  conductorBadge: { fontSize: 18 },
  puckPct: { position: 'absolute', bottom: -18, alignSelf: 'center', fontSize: 10, fontWeight: '800', color: T.success },

  puff: { position: 'absolute', backgroundColor: T.steam, zIndex: 2 },

  steamWrap: { position: 'absolute', width: 100, zIndex: 8 },
  steamLabel: { fontSize: 8, fontWeight: '800', color: T.steamMeter, letterSpacing: 1, marginBottom: 3, textAlign: 'center' },
  steamBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)', overflow: 'hidden', borderWidth: 1, borderColor: T.steamMeterGlow },
  steamFill: { height: '100%', backgroundColor: T.steamMeter, borderRadius: 3 },

  cdOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(254,243,199,0.35)', zIndex: 30 },
  cdBubble: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: T.accent },
  cdDepart: { backgroundColor: T.accent, borderColor: T.trainCab },
  cdText: { fontSize: 48, fontWeight: '900', color: T.title },
  cdDepartText: { fontSize: 26, color: '#FFFBEB' },

  trackBurst: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: T.steamGlow, zIndex: 15 },
  celebrateBanner: { position: 'absolute', zIndex: 16, borderRadius: 14, overflow: 'hidden' },
  celebrateGrad: { paddingHorizontal: 18, paddingVertical: 8 },
  celebrateText: { fontSize: 15, fontWeight: '900', color: '#78350F' },

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
  hudLabel: { fontSize: 9, fontWeight: '800', color: T.accentDark, letterSpacing: 1.2 },
  hudRound: { fontSize: 22, fontWeight: '900', color: T.title },
  hudRoundTotal: { fontSize: 14, fontWeight: '700', color: T.subtitle },
  hudCenter: { alignItems: 'center', flex: 1, marginHorizontal: 8 },
  hudTitle: { fontSize: 13, fontWeight: '800', color: T.title, marginBottom: 4 },
  lapDots: { flexDirection: 'row', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(245,158,11,0.3)' },
  dotDone: { backgroundColor: T.success },
  dotActive: { backgroundColor: T.accent, width: 8, height: 8, borderRadius: 4 },
  scoreBox: { alignItems: 'flex-end' },
  scoreLabel: { fontSize: 9, fontWeight: '800', color: T.subtitle, letterSpacing: 1.2 },
  scoreValue: { fontSize: 22, fontWeight: '900', color: T.accentDark },
  hintPill: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(245,158,11,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
  },
  hudHint: { fontSize: 12, fontWeight: '700', color: T.subtitle, textAlign: 'center' },
  hudSteamBar: { marginTop: 8, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.45)', overflow: 'hidden' },
  hudSteamFill: { height: '100%', backgroundColor: T.steamMeter, borderRadius: 3 },
});
