/**
 * Visual layer for Ball Chase — stadium atmosphere, HUD, ball physics FX, tap feedback.
 */
import { BALL_CHASE_THEME as T } from '@/components/game/occupational/level5/session1/ballChase/ballChaseTheme';
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

const HALF = 34;

export type TrailPoint = { x: number; y: number; opacity: number };

export type TapRippleData = {
  id: number;
  x: number;
  y: number;
  kind: 'hit' | 'miss' | 'near';
};

// ─── Intro screen ───────────────────────────────────────────────────────────

type InfoProps = {
  onStart: () => void;
  onBack: () => void;
};

function PreviewBall() {
  const bounce = useSharedValue(0);
  const squash = useSharedValue(1);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 520, easing: Easing.in(Easing.quad) }),
        withTiming(0, { duration: 520, easing: Easing.out(Easing.bounce) }),
      ),
      -1,
      false,
    );
    squash.value = withRepeat(
      withSequence(
        withTiming(0.88, { duration: 520, easing: Easing.in(Easing.quad) }),
        withTiming(1.08, { duration: 80 }),
        withTiming(1, { duration: 440, easing: Easing.out(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [bounce, squash]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(bounce.value, [0, 1], [0, -52]) },
      { scaleX: squash.value },
      { scaleY: interpolate(squash.value, [0.88, 1.08, 1], [1.12, 0.92, 1]) },
    ],
  }));

  return (
    <Animated.View style={[styles.infoBallWrap, style]}>
      <SoccerBallGraphic size={72} rotation={0} />
    </Animated.View>
  );
}

export function BallChaseInfoScreen({ onStart, onBack }: InfoProps) {
  const cardSlide = useSharedValue(30);
  const cardOp = useSharedValue(0);

  useEffect(() => {
    cardSlide.value = withSpring(0, { damping: 16, stiffness: 120 });
    cardOp.value = withTiming(1, { duration: 500 });
  }, [cardSlide, cardOp]);

  const cardAnim = useAnimatedStyle(() => ({
    opacity: cardOp.value,
    transform: [{ translateY: cardSlide.value }],
  }));

  return (
    <View style={styles.infoRoot}>
      <LinearGradient colors={[...T.sky]} locations={[0, 0.35, 0.7, 0.9, 1]} style={StyleSheet.absoluteFillObject} />
      <FloatingClouds />
      <StadiumHorizon animated />
      <View style={styles.infoGrass}>
        <LinearGradient colors={[...T.grass]} locations={[0, 0.3, 0.65, 1]} style={StyleSheet.absoluteFillObject} />
        <GrassStripes />
        <FieldMarkings showPenalty />
      </View>

      <PreviewBall />

      <Animated.View style={[styles.infoCard, cardAnim]}>
        <View style={styles.infoBadgeRow}>
          <View style={styles.infoLiveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>MATCH DAY</Text>
          </View>
        </View>
        <Text style={styles.infoTitle}>Ball Chase</Text>
        <Text style={styles.infoTagline}>Stadium · Visual Tracking · Reaction</Text>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionLabel}>How to play</Text>
          <Text style={styles.infoBody}>
            Watch the ball bounce across the pitch under the floodlights. When you spot it — tap to score!
          </Text>
        </View>

        <View style={styles.chipRow}>
          {[
            { icon: '👀', label: 'Track' },
            { icon: '⚡', label: 'React' },
            { icon: '🎯', label: 'Tap' },
          ].map((c) => (
            <View key={c.label} style={styles.chip}>
              <Text style={styles.chipText}>
                {c.icon} {c.label}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
          <LinearGradient colors={['#FDE047', '#FACC15', '#EAB308', '#CA8A04']} style={styles.startBtnGrad}>
            <Text style={styles.startBtnText}>⚽ Enter the Pitch</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoBackBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.infoBackText}>← Back to games</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── Atmosphere ─────────────────────────────────────────────────────────────

function FloatingClouds() {
  const clouds = [
    { top: '8%', left: '5%', w: 72, delay: 0, dur: 14000 },
    { top: '14%', right: '8%', w: 96, delay: 2000, dur: 18000 },
    { top: '6%', left: '42%', w: 56, delay: 4000, dur: 12000 },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {clouds.map((c, i) => (
        <DriftingCloud key={i} {...c} />
      ))}
    </View>
  );
}

function DriftingCloud({
  top,
  left,
  right,
  w,
  delay,
  dur,
}: {
  top: string;
  left?: string;
  right?: string;
  w: number;
  delay: number;
  dur: number;
}) {
  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: dur, easing: Easing.linear }), -1, true),
    );
  }, [drift, delay, dur]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(drift.value, [0, 1], [-18, 18]) }],
    opacity: interpolate(drift.value, [0, 0.5, 1], [0.55, 0.85, 0.55]),
  }));

  return (
    <Animated.View
      style={[
        styles.cloud,
        { top, left, right, width: w, height: w * 0.42 },
        style,
      ]}
    >
      <View style={[styles.cloudPuff, { width: w * 0.45, height: w * 0.35, left: 0 }]} />
      <View style={[styles.cloudPuff, { width: w * 0.55, height: w * 0.4, left: w * 0.2, top: -w * 0.08 }]} />
      <View style={[styles.cloudPuff, { width: w * 0.4, height: w * 0.32, right: 0 }]} />
    </Animated.View>
  );
}

function FloodlightBeams() {
  const pulse = useSharedValue(0.6);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.55, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const beamL = useAnimatedStyle(() => ({ opacity: pulse.value }));
  const beamR = useAnimatedStyle(() => ({ opacity: interpolate(pulse.value, [0.55, 1], [0.7, 1]) }));

  return (
    <>
      <Animated.View style={[styles.beamLeft, beamL]} pointerEvents="none">
        <LinearGradient colors={[T.floodlightBeam, 'transparent']} style={StyleSheet.absoluteFillObject} />
      </Animated.View>
      <Animated.View style={[styles.beamRight, beamR]} pointerEvents="none">
        <LinearGradient colors={[T.floodlightBeam, 'transparent']} style={StyleSheet.absoluteFillObject} />
      </Animated.View>
    </>
  );
}

function CrowdDot({ i, animated }: { i: number; animated?: boolean }) {
  const color = T.crowdWave[i % T.crowdWave.length]!;
  const height = 6 + (i % 6) * 3 + (i % 3);
  const wave = useSharedValue(0);

  useEffect(() => {
    if (!animated) return;
    wave.value = withRepeat(
      withSequence(withTiming(1, { duration: 2400 }), withTiming(0, { duration: 2400 })),
      -1,
      false,
    );
  }, [animated, wave]);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(wave.value, [0, 1], [0, -((i % 4) + 1) * 2]) }],
  }));

  const baseStyle = [
    styles.crowdDot,
    { height, backgroundColor: color, opacity: 0.5 + (i % 4) * 0.1, marginTop: (i % 3) * 2 },
  ];

  if (animated) {
    return <Animated.View style={[...baseStyle, waveStyle]} />;
  }
  return <View style={baseStyle} />;
}

// ─── Stadium backdrop ───────────────────────────────────────────────────────

export function StadiumBackdrop() {
  const flicker = useSharedValue(0);
  useEffect(() => {
    flicker.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.6, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [flicker]);

  const lightStyle = useAnimatedStyle(() => ({ opacity: interpolate(flicker.value, [0, 1], [0.45, 1]) }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} locations={[0, 0.3, 0.6, 0.85, 1]} style={styles.sky} />
      <FloatingClouds />
      <StadiumHorizon animated />
      <FloodlightBeams />
      <View style={styles.pitch}>
        <LinearGradient colors={[...T.grass]} locations={[0, 0.25, 0.55, 0.85, 1]} style={StyleSheet.absoluteFillObject} />
        <GrassStripes />
        <FieldMarkings showPenalty />
        <CornerFlags />
        <GoalPosts side="left" />
        <GoalPosts side="right" />
      </View>
      <Animated.View style={[styles.floodLeft, lightStyle]} />
      <Animated.View style={[styles.floodRight, lightStyle]} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.15)']} style={styles.vignette} pointerEvents="none" />
    </View>
  );
}

function StadiumHorizon({ animated }: { animated?: boolean }) {
  const dots = Array.from({ length: 32 });
  return (
    <View style={styles.crowdRow} pointerEvents="none">
      {dots.map((_, i) => (
        <CrowdDot key={i} i={i} animated={animated} />
      ))}
    </View>
  );
}

function GrassStripes() {
  const stripes = Array.from({ length: 16 });
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

function FieldMarkings({ showPenalty }: { showPenalty?: boolean }) {
  return (
    <>
      <View style={styles.centerCircle} />
      <View style={styles.centerDot} />
      <View style={styles.halfLine} />
      {showPenalty && (
        <>
          <View style={[styles.penaltyBox, styles.penaltyLeft]} />
          <View style={[styles.penaltyBox, styles.penaltyRight]} />
        </>
      )}
    </>
  );
}

function CornerFlags() {
  const corners = [
    { top: 6, left: 6 },
    { top: 6, right: 6 },
    { bottom: 6, left: 6 },
    { bottom: 6, right: 6 },
  ];
  return (
    <>
      {corners.map((pos, i) => (
        <View key={i} style={[styles.cornerFlag, pos]} pointerEvents="none">
          <View style={styles.flagPole} />
          <View style={styles.flagCloth} />
        </View>
      ))}
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
  const scorePop = useSharedValue(1);
  const prevScore = useRef(score);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.03, { duration: 1100 }), withTiming(1, { duration: 1100 })),
      -1,
      false,
    );
  }, [pulse]);

  useEffect(() => {
    if (score > prevScore.current) {
      scorePop.value = withSequence(
        withSpring(1.35, { damping: 6, stiffness: 280 }),
        withSpring(1, { damping: 10, stiffness: 200 }),
      );
    }
    prevScore.current = score;
  }, [score, scorePop]);

  const scorePulse = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const scoreBump = useAnimatedStyle(() => ({ transform: [{ scale: scorePop.value }] }));

  const Glass = Platform.OS === 'ios' ? BlurView : View;
  const glassProps = Platform.OS === 'ios' ? { intensity: 60, tint: 'light' as const } : {};

  return (
    <View style={styles.hudWrap} pointerEvents="none">
      <Glass {...glassProps} style={styles.hudGlass}>
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(240,249,255,0.88)']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.hudTopRow}>
          <View>
            <Text style={styles.hudLabel}>ROUND</Text>
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
                    i < score && styles.dotDone,
                    i === round - 1 && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          </View>
          <Animated.View style={[styles.scoreBox, scorePulse]}>
            <Animated.View style={scoreBump}>
              <Text style={styles.scoreLabel}>GOALS</Text>
              <Text style={styles.scoreValue}>{score}</Text>
            </Animated.View>
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

// ─── Countdown overlay ──────────────────────────────────────────────────────

export function RoundCountdown({ onDone }: { onDone: () => void }) {
  const [step, setStep] = React.useState(0);
  const steps = ['3', '2', '1', 'KICK OFF!'] as const;
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0);
  const ring = useSharedValue(0);
  const onDoneRef = React.useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (step >= steps.length) {
      onDoneRef.current();
      return;
    }
    scale.value = 0.3;
    opacity.value = 0;
    ring.value = 0;
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    opacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(1, { duration: step === steps.length - 1 ? 420 : 560 }),
      withTiming(0, { duration: 160 }),
    );
    ring.value = withTiming(1, { duration: step === steps.length - 1 ? 500 : 650, easing: Easing.out(Easing.cubic) });
    const delay = step === steps.length - 1 ? 720 : 820;
    const t = setTimeout(() => setStep((s) => s + 1), delay);
    return () => clearTimeout(t);
  }, [step, steps.length, scale, opacity, ring]);

  const anim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const ringAnim = useAnimatedStyle(() => ({
    opacity: interpolate(ring.value, [0, 0.3, 1], [0, 0.6, 0]),
    transform: [{ scale: interpolate(ring.value, [0, 1], [0.6, 2.2]) }],
  }));

  if (step >= steps.length) return null;

  const isKick = steps[step] === 'KICK OFF!';

  return (
    <View style={styles.countdownOverlay} pointerEvents="none">
      <Animated.View style={[styles.countdownRing, ringAnim]} />
      <Animated.View style={[styles.countdownBubble, isKick && styles.countdownGo, anim]}>
        <Text style={[styles.countdownText, isKick && styles.countdownGoText]}>{steps[step]}</Text>
        {isKick && <Text style={styles.countdownSub}>⚽</Text>}
      </Animated.View>
    </View>
  );
}

// ─── Soccer ball graphic ────────────────────────────────────────────────────

function SoccerBallGraphic({ size, rotation }: { size: number; rotation: number }) {
  const r = size / 2;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: r,
        transform: [{ rotate: `${rotation}deg` }],
        overflow: 'hidden',
      }}
    >
      <LinearGradient colors={['#FFFFFF', '#F1F5F9', '#E2E8F0']} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.ballPatch, { top: r * 0.22, left: r * 0.38, width: r * 0.5, height: r * 0.5, backgroundColor: T.ballBlack }]} />
      <View style={[styles.ballPatch, { top: r * 0.55, left: r * 0.12, width: r * 0.38, height: r * 0.38, backgroundColor: T.ballBlack, transform: [{ rotate: '25deg' }] }]} />
      <View style={[styles.ballPatch, { top: r * 0.58, left: r * 0.58, width: r * 0.35, height: r * 0.35, backgroundColor: T.ballBlack, transform: [{ rotate: '-20deg' }] }]} />
      <View style={[styles.ballPatch, { top: r * 0.08, left: r * 0.15, width: r * 0.3, height: r * 0.3, backgroundColor: T.ballBlack, transform: [{ rotate: '45deg' }] }]} />
      <View style={[styles.ballPatch, { top: r * 0.1, left: r * 0.62, width: r * 0.28, height: r * 0.28, backgroundColor: T.ballBlack, transform: [{ rotate: '-35deg' }] }]} />
      <View style={styles.ballShineLarge} />
      <View style={styles.ballShineSmall} />
    </View>
  );
}

// ─── Soccer ball + trail + speed ────────────────────────────────────────────

type BallProps = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  trail: TrailPoint[];
  showAimRing: boolean;
  speed: number;
};

export function SoccerBallView({ x, y, scaleX, scaleY, rotation, trail, showAimRing, speed }: BallProps) {
  const ring = useSharedValue(0);
  useEffect(() => {
    if (!showAimRing) return;
    ring.value = 0;
    ring.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, [showAimRing, ring]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ring.value, [0, 0.12, 1], [0, 0.65, 0]),
    transform: [{ scale: interpolate(ring.value, [0, 1], [0.8, 1.55]) }],
  }));

  const shadowScale = 0.7 + (y / 600) * 0.25;
  const showStreaks = speed > 2.2;

  return (
    <>
      {trail.map((pt, i) => (
        <View
          key={`trail-${i}`}
          pointerEvents="none"
          style={[
            styles.trailDot,
            {
              left: pt.x - 5 - i * 0.5,
              top: pt.y - 5,
              opacity: pt.opacity * 0.4,
              width: 10 - i,
              height: 10 - i,
            },
          ]}
        />
      ))}

      {showStreaks &&
        [0, 1, 2].map((i) => (
          <View
            key={`streak-${i}`}
            pointerEvents="none"
            style={[
              styles.speedStreak,
              {
                left: x - HALF - 20 - i * 8,
                top: y - 2 + i * 4,
                width: 16 + speed * 3,
                opacity: 0.25 - i * 0.06,
              },
            ]}
          />
        ))}

      <View
        pointerEvents="none"
        style={[
          styles.ballShadow,
          {
            left: x - 24 * shadowScale,
            top: y + HALF - 4,
            width: 48 * shadowScale,
            height: 12 * shadowScale,
          },
        ]}
      />

      {showAimRing && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.aimRing,
            { left: x - HALF - 14, top: y - HALF - 14, width: (HALF + 14) * 2, height: (HALF + 14) * 2 },
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
            transform: [{ scaleX }, { scaleY }, { rotate: `${rotation}deg` }],
          },
        ]}
      >
        <SoccerBallGraphic size={HALF * 2} rotation={0} />
      </View>
    </>
  );
}

// ─── Tap feedback ───────────────────────────────────────────────────────────

export function TapRippleLayer({ ripples }: { ripples: TapRippleData[] }) {
  return (
    <>
      {ripples.map((r) => (
        <TapRipple key={r.id} x={r.x} y={r.y} kind={r.kind} />
      ))}
    </>
  );
}

function TapRipple({ x, y, kind }: { x: number; y: number; kind: TapRippleData['kind'] }) {
  const expand = useSharedValue(0);
  const color =
    kind === 'hit' ? T.successGlow : kind === 'near' ? T.nearMissGlow : T.missGlow;
  const border =
    kind === 'hit' ? T.success : kind === 'near' ? T.nearMiss : T.miss;

  useEffect(() => {
    expand.value = 0;
    expand.value = withTiming(1, { duration: kind === 'hit' ? 480 : 620, easing: Easing.out(Easing.cubic) });
  }, [expand, kind]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x - 30,
    top: y - 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: border,
    backgroundColor: color,
    opacity: 1 - expand.value,
    transform: [{ scale: 0.4 + expand.value * 1.8 }],
  }));

  return <Animated.View style={style} pointerEvents="none" />;
}

// ─── Goal celebration ───────────────────────────────────────────────────────

export function GoalCelebration({ visible, x, y }: { visible: boolean; x: number; y: number }) {
  const banner = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    banner.value = 0;
    banner.value = withSequence(
      withSpring(1, { damping: 8, stiffness: 200 }),
      withDelay(400, withTiming(0, { duration: 300 })),
    );
  }, [visible, banner]);

  if (!visible) return null;

  const particles = Array.from({ length: 16 });
  const colors = ['#FACC15', '#FFFFFF', '#22C55E', '#FDE047', '#38BDF8'];

  const bannerStyle = useAnimatedStyle(() => ({
    opacity: banner.value,
    transform: [{ scale: interpolate(banner.value, [0, 1], [0.5, 1]) }, { translateY: interpolate(banner.value, [0, 1], [20, 0]) }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.goalFlash, { left: x - 60, top: y - 60 }]} />
      <Animated.View style={[styles.goalBanner, bannerStyle]}>
        <LinearGradient colors={['#FDE047', '#FACC15', '#EAB308']} style={styles.goalBannerGrad}>
          <Text style={styles.goalBannerText}>⚽ GOAL!</Text>
        </LinearGradient>
      </Animated.View>
      {particles.map((_, i) => (
        <GoalParticle key={i} i={i} n={particles.length} x={x} y={y} color={colors[i % colors.length]!} go={visible} />
      ))}
      <ConfettiRain active={visible} />
    </View>
  );
}

function ConfettiRain({ active }: { active: boolean }) {
  const pieces = Array.from({ length: 20 });
  if (!active) return null;
  return (
    <>
      {pieces.map((_, i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </>
  );
}

function ConfettiPiece({ index }: { index: number }) {
  const fall = useSharedValue(0);
  const colors = ['#FACC15', '#22C55E', '#38BDF8', '#F472B6', '#FFFFFF'];

  useEffect(() => {
    fall.value = 0;
    fall.value = withDelay(
      index * 40,
      withTiming(1, { duration: 900 + (index % 5) * 100, easing: Easing.in(Easing.quad) }),
    );
  }, [fall, index]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: `${(index * 17) % 100}%`,
    top: interpolate(fall.value, [0, 1], [-20, 420]),
    width: 6 + (index % 3) * 2,
    height: 10 + (index % 4) * 2,
    backgroundColor: colors[index % colors.length],
    borderRadius: 2,
    opacity: 1 - fall.value * 0.8,
    transform: [{ rotate: `${fall.value * 360 + index * 40}deg` }],
  }));

  return <Animated.View style={style} />;
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
    t.value = withTiming(1, { duration: 620, easing: Easing.out(Easing.cubic) });
  }, [go, t]);

  const style = useAnimatedStyle(() => {
    const angle = (i / n) * Math.PI * 2;
    const r = 22 + 64 * t.value;
    return {
      position: 'absolute',
      left: x + Math.cos(angle) * r - 5,
      top: y + Math.sin(angle) * r - 5,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: color,
      opacity: 1 - t.value,
      transform: [{ scale: 1.3 - t.value * 0.8 }],
    };
  });

  return <Animated.View style={style} />;
}

// ─── Waiting / hints ────────────────────────────────────────────────────────

export function KickoffBanner({ text }: { text: string }) {
  const op = useSharedValue(0.4);
  useEffect(() => {
    op.value = withRepeat(
      withSequence(withTiming(1, { duration: 800 }), withTiming(0.4, { duration: 800 })),
      -1,
      false,
    );
  }, [op]);
  const style = useAnimatedStyle(() => ({ opacity: op.value }));
  return (
    <Animated.View style={[styles.kickoffBanner, style]} pointerEvents="none">
      <Text style={styles.kickoffEmoji}>🏟️</Text>
      <Text style={styles.kickoffText}>{text}</Text>
    </Animated.View>
  );
}

export function NearMissToast({ show }: { show: boolean }) {
  const op = useSharedValue(0);
  const y = useSharedValue(12);
  useEffect(() => {
    if (!show) return;
    op.value = 0;
    y.value = 12;
    op.value = withSequence(withTiming(1, { duration: 150 }), withDelay(500, withTiming(0, { duration: 200 })));
    y.value = withSpring(0, { damping: 14, stiffness: 180 });
  }, [show, op, y]);

  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: y.value }],
  }));

  if (!show) return null;

  return (
    <Animated.View style={[styles.nearMissToast, style]} pointerEvents="none">
      <Text style={styles.nearMissText}>🔥 So close!</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  infoRoot: { flex: 1 },
  infoGrass: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '44%' },
  infoBallWrap: {
    position: 'absolute',
    top: '16%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    shadowColor: '#0369A1',
    shadowOpacity: 0.25,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },
  infoBadgeRow: { marginBottom: 6 },
  infoLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239,68,68,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF4444' },
  liveText: { fontSize: 10, fontWeight: '900', color: '#DC2626', letterSpacing: 1.4 },
  infoTitle: { fontSize: 34, fontWeight: '900', color: T.title, letterSpacing: -0.8 },
  infoTagline: {
    fontSize: 12,
    fontWeight: '700',
    color: T.subtitle,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 14,
  },
  infoSection: { width: '100%', marginBottom: 12 },
  infoSectionLabel: { fontSize: 11, fontWeight: '800', color: T.accentDark, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.8 },
  infoBody: { fontSize: 15, lineHeight: 23, color: '#334155', fontWeight: '500' },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' },
  chip: {
    backgroundColor: 'rgba(14,165,233,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.22)',
  },
  chipText: { fontSize: 13, fontWeight: '700', color: T.subtitle },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 8, shadowColor: T.accentDark, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  startBtnGrad: { paddingVertical: 17, alignItems: 'center' },
  startBtnText: { fontSize: 18, fontWeight: '900', color: '#422006', letterSpacing: 0.4 },
  infoBackBtn: { paddingVertical: 8 },
  infoBackText: { fontSize: 14, fontWeight: '700', color: T.subtitle },

  cloud: { position: 'absolute' },
  cloudPuff: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: T.cloud,
    bottom: 0,
  },
  beamLeft: {
    position: 'absolute',
    top: 36,
    left: 8,
    width: 120,
    height: '55%',
    transform: [{ skewX: '12deg' }],
    zIndex: 1,
  },
  beamRight: {
    position: 'absolute',
    top: 36,
    right: 8,
    width: 120,
    height: '55%',
    transform: [{ skewX: '-12deg' }],
    zIndex: 1,
  },

  sky: { height: '36%' },
  crowdRow: {
    position: 'absolute',
    top: '28%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    paddingHorizontal: 2,
  },
  crowdDot: { width: 9, borderRadius: 3 },
  pitch: { flex: 1, marginTop: '28%' },
  grassStripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '6.25%',
    backgroundColor: T.grassStripe,
  },
  centerCircle: {
    position: 'absolute',
    alignSelf: 'center',
    top: '36%',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2.5,
    borderColor: T.lineWhite,
  },
  centerDot: {
    position: 'absolute',
    alignSelf: 'center',
    top: '36%',
    marginTop: 56,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.lineWhite,
  },
  halfLine: {
    position: 'absolute',
    top: '20%',
    left: '5%',
    right: '5%',
    height: 2.5,
    backgroundColor: T.lineWhite,
    opacity: 0.75,
  },
  penaltyBox: {
    position: 'absolute',
    top: '20%',
    width: '22%',
    height: '38%',
    borderWidth: 2,
    borderColor: T.penaltyArea,
  },
  penaltyLeft: { left: '5%', borderRightWidth: 0 },
  penaltyRight: { right: '5%', borderLeftWidth: 0 },
  cornerFlag: { position: 'absolute', width: 16, height: 22 },
  flagPole: { position: 'absolute', left: 0, bottom: 0, width: 2, height: 22, backgroundColor: '#F8FAFC', borderRadius: 1 },
  flagCloth: { position: 'absolute', left: 2, top: 0, width: 12, height: 8, backgroundColor: T.cornerFlag, borderTopRightRadius: 2, borderBottomRightRadius: 2 },
  goalWrap: { position: 'absolute', top: 6, width: 58, height: 46 },
  goalLeft: { left: '7%' },
  goalRight: { right: '7%' },
  goalPost: { position: 'absolute', backgroundColor: T.goalPost, borderRadius: 2 },
  goalPostVertical: { left: 0, top: 0, width: 4, height: 42 },
  goalPostCross: { left: 0, top: 0, width: 54, height: 4 },
  goalNet: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: 50,
    height: 38,
    borderWidth: 1,
    borderColor: T.goalNet,
    borderStyle: 'dashed',
    opacity: 0.65,
  },
  floodLeft: {
    position: 'absolute',
    top: 44,
    left: 20,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: T.floodlight,
    shadowColor: T.floodlight,
    shadowOpacity: 1,
    shadowRadius: 22,
    zIndex: 2,
  },
  floodRight: {
    position: 'absolute',
    top: 44,
    right: 20,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: T.floodlight,
    shadowColor: T.floodlight,
    shadowOpacity: 1,
    shadowRadius: 22,
    zIndex: 2,
  },
  vignette: { ...StyleSheet.absoluteFillObject },

  hudWrap: { paddingHorizontal: 12, paddingTop: 44, zIndex: 20 },
  hudGlass: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: T.hudBorder,
    backgroundColor: Platform.OS === 'android' ? T.hudGlass : 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  hudTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hudLabel: { fontSize: 9, fontWeight: '800', color: T.subtitle, letterSpacing: 1.2 },
  hudRound: { fontSize: 28, fontWeight: '900', color: T.title },
  hudRoundTotal: { fontSize: 15, fontWeight: '700', color: T.subtitle },
  hudTitleBlock: { alignItems: 'center', flex: 1 },
  hudTitle: { fontSize: 14, fontWeight: '900', color: T.title, marginBottom: 5 },
  progressDots: { flexDirection: 'row', gap: 3, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 150 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(14,165,233,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.3)',
  },
  dotDone: { backgroundColor: T.success, borderColor: T.success },
  dotActive: { backgroundColor: T.accent, borderColor: T.accentDark, transform: [{ scale: 1.35 }] },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(250,204,21,0.28)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(234,179,8,0.5)',
  },
  scoreLabel: { fontSize: 8, fontWeight: '800', color: T.accentDark, letterSpacing: 1 },
  scoreValue: { fontSize: 26, fontWeight: '900', color: '#854D0E' },
  hintPill: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(20,83,45,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(20,83,45,0.2)',
  },
  hudHint: { fontSize: 13, fontWeight: '800', color: T.cue, letterSpacing: 0.5 },

  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.22)',
    zIndex: 30,
  },
  countdownRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: T.accentGlow,
  },
  countdownBubble: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: T.accent,
    shadowColor: T.accent,
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
  countdownGo: { backgroundColor: T.accent, borderColor: '#FFF', width: 148, height: 148, borderRadius: 74 },
  countdownText: { fontSize: 54, fontWeight: '900', color: T.title },
  countdownGoText: { fontSize: 22, fontWeight: '900', color: '#422006', letterSpacing: 0.5 },
  countdownSub: { fontSize: 28, marginTop: -4 },

  trailDot: { position: 'absolute', borderRadius: 999, backgroundColor: T.streak },
  speedStreak: { position: 'absolute', height: 3, borderRadius: 2, backgroundColor: T.streak },
  ballShadow: { position: 'absolute', backgroundColor: T.ballShadow, borderRadius: 999 },
  aimRing: { position: 'absolute', borderRadius: 999, borderWidth: 2.5, borderColor: T.accentGlow },
  ballOuter: { position: 'absolute', width: HALF * 2, height: HALF * 2, zIndex: 5 },
  ballPatch: { position: 'absolute', borderRadius: 3 },
  ballShineLarge: {
    position: 'absolute',
    top: 8,
    left: 12,
    width: 18,
    height: 12,
    borderRadius: 8,
    backgroundColor: T.ballHighlight,
    transform: [{ rotate: '-35deg' }],
  },
  ballShineSmall: {
    position: 'absolute',
    bottom: 14,
    right: 10,
    width: 8,
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },

  goalFlash: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: T.goalGlow,
  },
  goalBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '32%',
    zIndex: 45,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: T.accentDark,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  goalBannerGrad: { paddingHorizontal: 32, paddingVertical: 14 },
  goalBannerText: { fontSize: 32, fontWeight: '900', color: '#422006', letterSpacing: 1 },

  kickoffBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '44%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.82)',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: T.hudBorder,
  },
  kickoffEmoji: { fontSize: 18 },
  kickoffText: { fontSize: 16, fontWeight: '800', color: T.title, letterSpacing: 0.4 },

  nearMissToast: {
    position: 'absolute',
    alignSelf: 'center',
    top: '58%',
    backgroundColor: 'rgba(249,115,22,0.92)',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    zIndex: 25,
    shadowColor: T.nearMiss,
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  nearMissText: { fontSize: 16, fontWeight: '900', color: '#FFF' },
});

export const BALL_RADIUS = HALF;
