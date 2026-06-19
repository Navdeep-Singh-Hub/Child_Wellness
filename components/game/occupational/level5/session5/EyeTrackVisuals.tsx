/** Moving Eye Control visuals — OT L5 Session 5 */
import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import type { EyeTrackBackdropId } from '@/components/game/occupational/level5/session5/eyeTrackThemes';
import type { EyeTrackMode } from '@/components/game/occupational/level5/session5/eyeTrackConfig';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export function EyeTrackBackdrop({
  theme,
  backdrop,
  mode,
}: {
  theme: Session2ThemeTokens;
  backdrop: EyeTrackBackdropId;
  mode: EyeTrackMode;
}) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...theme.sky]} style={StyleSheet.absoluteFillObject} />
      {backdrop === 'reader' && <ReaderRail theme={theme} />}
      {backdrop === 'elevator' && <ElevatorShaft theme={theme} />}
      {backdrop === 'orbit' && <OrbitRing theme={theme} />}
      {backdrop === 'teleport' && <TeleportGrid theme={theme} />}
      {backdrop === 'dual' && <DualStage theme={theme} />}
      <TrackGuide mode={mode} accent={theme.accent} />
    </View>
  );
}

function ReaderRail({ theme }: { theme: Session2ThemeTokens }) {
  return (
    <>
      <View style={[styles.shelf, { top: '18%' }]} />
      <View style={[styles.shelf, { top: '72%' }]} />
      <View style={[styles.railLine, { top: '50%', backgroundColor: `${theme.accent}33` }]} />
    </>
  );
}

function ElevatorShaft({ theme }: { theme: Session2ThemeTokens }) {
  return (
    <>
      <View style={[styles.shaft, { borderColor: `${theme.accent}44` }]} />
      <View style={[styles.shaftLine, { left: '48%', backgroundColor: `${theme.accent}55` }]} />
      <View style={[styles.floorMark, { top: '20%' }]} />
      <View style={[styles.floorMark, { top: '50%' }]} />
      <View style={[styles.floorMark, { top: '80%' }]} />
    </>
  );
}

function OrbitRing({ theme }: { theme: Session2ThemeTokens }) {
  return (
    <>
      <View style={[styles.orbitRing, { borderColor: `${theme.accent}55` }]} />
      <View style={[styles.orbitGlow, { backgroundColor: `${theme.accent}18` }]} />
    </>
  );
}

function TeleportGrid({ theme }: { theme: Session2ThemeTokens }) {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.gridNode,
            {
              left: `${(i % 4) * 25 + 12}%`,
              top: `${Math.floor(i / 4) * 28 + 18}%`,
              borderColor: `${theme.accent}44`,
            },
          ]}
        />
      ))}
    </>
  );
}

function DualStage({ theme }: { theme: Session2ThemeTokens }) {
  return (
    <>
      <View style={[styles.dualSplit, { backgroundColor: `${theme.accent}22` }]} />
      <View style={[styles.dualZone, { left: '8%', top: '42%', borderColor: '#38BDF855' }]} />
      <View style={[styles.dualZone, { right: '8%', top: '42%', borderColor: '#F9731655' }]} />
    </>
  );
}

function TrackGuide({ mode, accent }: { mode: EyeTrackMode; accent: string }) {
  if (mode === 'horizontal') {
    return <View style={[styles.guideH, { top: '50%', backgroundColor: `${accent}40` }]} />;
  }
  if (mode === 'vertical') {
    return <View style={[styles.guideV, { left: '50%', backgroundColor: `${accent}40` }]} />;
  }
  if (mode === 'circular') {
    return <View style={[styles.orbitRing, { borderColor: `${accent}35`, width: '70%', height: undefined, aspectRatio: 1 }]} />;
  }
  return null;
}

export function GlowingTrackDot({
  size,
  color,
  secondary,
  emoji,
  pulse,
}: {
  size: number;
  color: string;
  secondary?: boolean;
  emoji?: string;
  pulse?: boolean;
}) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.6);

  useEffect(() => {
    if (pulse !== false) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 700, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.5, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    }
  }, [pulse, scale, glow]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: 0.3 + glow.value * 0.4,
  }));

  const gradColors = secondary
    ? (['#FB923C', '#EA580C', '#C2410C'] as const)
    : (['#67E8F9', color, '#0369A1'] as const);

  return (
    <Animated.View
      style={[
        styles.dotOuter,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          shadowColor: color,
        },
        animStyle,
      ]}
    >
      <LinearGradient colors={[...gradColors]} style={[styles.dotGrad, { borderRadius: size / 2 }]}>
        <View style={[styles.dotCore, { width: size * 0.45, height: size * 0.45, borderRadius: size * 0.225 }]} />
        {emoji ? <View style={styles.emojiWrap}><Text style={[styles.dotEmoji, { fontSize: size * 0.4 }]}>{emoji}</Text></View> : null}
      </LinearGradient>
      <View style={[styles.dotHalo, { width: size + 16, height: size + 16, borderRadius: (size + 16) / 2, borderColor: `${color}66` }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shelf: { position: 'absolute', left: 0, right: 0, height: 6, backgroundColor: 'rgba(255,255,255,0.08)' },
  railLine: { position: 'absolute', left: '5%', right: '5%', height: 3, borderRadius: 2 },
  shaft: {
    position: 'absolute',
    left: '38%',
    right: '38%',
    top: '10%',
    bottom: '10%',
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  shaftLine: { position: 'absolute', top: '10%', bottom: '10%', width: 4, borderRadius: 2 },
  floorMark: { position: 'absolute', left: '36%', right: '36%', height: 2, backgroundColor: 'rgba(255,255,255,0.12)' },
  orbitRing: {
    position: 'absolute',
    alignSelf: 'center',
    top: '15%',
    width: '70%',
    aspectRatio: 1,
    borderRadius: 9999,
    borderWidth: 2,
  },
  orbitGlow: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
    width: '40%',
    aspectRatio: 1,
    borderRadius: 9999,
  },
  gridNode: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dualSplit: { position: 'absolute', left: 0, right: 0, top: '48%', height: 2 },
  dualZone: {
    position: 'absolute',
    width: '38%',
    height: '16%',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  guideH: { position: 'absolute', left: '6%', right: '6%', height: 2, borderRadius: 1 },
  guideV: { position: 'absolute', top: '12%', bottom: '12%', width: 2, borderRadius: 1 },
  dotOuter: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  dotGrad: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  dotCore: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.85)' },
  dotEmoji: { zIndex: 2 },
  emojiWrap: { zIndex: 2 },
  dotHalo: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
});
