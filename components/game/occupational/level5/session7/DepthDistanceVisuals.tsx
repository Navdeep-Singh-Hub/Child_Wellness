/** Depth & Distance visuals — OT L5 Session 7 */
import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import type { DepthBackdropId } from '@/components/game/occupational/level5/session7/depthDistanceThemes';
import type { DepthMode } from '@/components/game/occupational/level5/session7/depthDistanceConfig';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export function DepthBackdrop({
  theme,
  backdrop,
  mode,
}: {
  theme: Session2ThemeTokens;
  backdrop: DepthBackdropId;
  mode: DepthMode;
}) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...theme.sky]} style={StyleSheet.absoluteFillObject} />
      {backdrop === 'horizon' && <HorizonPath accent={theme.accent} />}
      {backdrop === 'lens' && <LensLab accent={theme.accent} />}
      {backdrop === 'orchard' && <OrchardSky />}
      {backdrop === 'shrink' && <ShrinkPortal accent={theme.accent} />}
      {backdrop === 'stack' && <LayerStage accent={theme.accent} />}
      {mode === 'falling' && <GroundLine />}
    </View>
  );
}

function HorizonPath({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.horizonLine, { backgroundColor: `${accent}55` }]} />
      <View style={[styles.road, { borderColor: `${accent}44` }]} />
      <View style={[styles.vanishPoint, { backgroundColor: `${accent}33` }]} />
    </>
  );
}

function LensLab({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.lensRing, { borderColor: `${accent}66` }]} />
      <View style={[styles.lensCrossH, { backgroundColor: `${accent}44` }]} />
      <View style={[styles.lensCrossV, { backgroundColor: `${accent}44` }]} />
    </>
  );
}

function OrchardSky() {
  return (
    <>
      <View style={styles.orchardGround} />
      {['🌳', '🌲', '🌳'].map((t, i) => (
        <Text key={i} style={[styles.tree, { left: `${15 + i * 30}%` }]}>
          {t}
        </Text>
      ))}
    </>
  );
}

function ShrinkPortal({ accent }: { accent: string }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.portal, { borderColor: accent }, style]}>
      <View style={[styles.portalCore, { backgroundColor: `${accent}22` }]} />
    </Animated.View>
  );
}

function LayerStage({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.stackBack, { borderColor: `${accent}33` }]} />
      <View style={[styles.stackMid, { borderColor: `${accent}44` }]} />
      <View style={[styles.stackFront, { borderColor: `${accent}55` }]} />
    </>
  );
}

function GroundLine() {
  return <View style={styles.groundLine} />;
}

export function AnchorPin({ size }: { size: number }) {
  return (
    <View style={[styles.anchor, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={{ fontSize: size * 0.32 }}>📍</Text>
      <Text style={styles.anchorLabel}>You</Text>
    </View>
  );
}

export function DepthSphere({
  size,
  color,
  emoji,
  dimmed,
  highlight,
  accentColor,
}: {
  size: number;
  color: string;
  emoji: string;
  dimmed?: boolean;
  highlight?: boolean;
  accentColor?: string;
}) {
  const ringColor = accentColor ?? '#FBBF24';
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (highlight) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 550, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 550, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    } else {
      pulse.value = withTiming(1, { duration: 120 });
    }
  }, [highlight, pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.55 + (pulse.value - 1) * 2.5,
  }));

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {highlight ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glowRing,
            ringStyle,
            {
              width: size + 18,
              height: size + 18,
              borderRadius: (size + 18) / 2,
              borderColor: ringColor,
            },
          ]}
        />
      ) : null}
      <View
        style={[
          styles.sphere,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            opacity: dimmed ? 0.72 : 1,
            borderColor: highlight ? ringColor : 'rgba(255,255,255,0.6)',
            borderWidth: highlight ? 4 : 2,
            shadowColor: highlight ? ringColor : color,
            shadowOpacity: highlight ? 0.55 : 0.35,
            shadowRadius: highlight ? 14 : 10,
          },
        ]}
      >
        <Text style={{ fontSize: size * 0.42 }}>{emoji}</Text>
      </View>
    </View>
  );
}

export function DepthTarget({
  size,
  color,
  emoji,
  ready,
  accent,
}: {
  size: number;
  color: string;
  emoji: string;
  ready?: boolean;
  accent: string;
}) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (ready) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 350, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 350, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    } else {
      scale.value = withTiming(1, { duration: 120 });
    }
  }, [ready, scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={anim}>
      <LinearGradient
        colors={[`${color}EE`, color, `${color}CC`]}
        style={[styles.targetGrad, { width: size, height: size, borderRadius: size / 2, borderColor: ready ? accent : 'rgba(255,255,255,0.5)' }]}
      >
        <Text style={{ fontSize: size * 0.45 }}>{emoji}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

export function DepthLineBar({ style }: { style: object }) {
  return <View pointerEvents="none" style={[styles.depthLine, style]} />;
}

const styles = StyleSheet.create({
  horizonLine: { position: 'absolute', left: 0, right: 0, top: '42%', height: 2 },
  road: {
    position: 'absolute',
    bottom: '8%',
    left: '20%',
    right: '20%',
    height: '35%',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderStyle: 'dashed',
    opacity: 0.35,
  },
  vanishPoint: { position: 'absolute', alignSelf: 'center', top: '40%', width: 60, height: 60, borderRadius: 30 },
  lensRing: { position: 'absolute', alignSelf: 'center', top: '28%', width: 140, height: 140, borderRadius: 70, borderWidth: 3 },
  lensCrossH: { position: 'absolute', alignSelf: 'center', top: '35%', width: 160, height: 2 },
  lensCrossV: { position: 'absolute', alignSelf: 'center', top: '28%', width: 2, height: 160 },
  orchardGround: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '22%', backgroundColor: 'rgba(34,197,94,0.25)' },
  tree: { position: 'absolute', bottom: '18%', fontSize: 28 },
  portal: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portalCore: { width: 60, height: 60, borderRadius: 30 },
  stackBack: { position: 'absolute', left: '18%', top: '50%', width: '50%', height: '18%', borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', opacity: 0.4 },
  stackMid: { position: 'absolute', left: '28%', top: '42%', width: '50%', height: '18%', borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', opacity: 0.55 },
  stackFront: { position: 'absolute', left: '38%', top: '34%', width: '50%', height: '18%', borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', opacity: 0.7 },
  groundLine: { position: 'absolute', bottom: '12%', left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  anchor: {
    backgroundColor: '#FEF08A',
    borderWidth: 3,
    borderColor: '#EAB308',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10,
  },
  anchorLabel: { fontSize: 9, fontWeight: '800', color: '#713F12', marginTop: -2 },
  glowRing: {
    position: 'absolute',
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  sphere: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  targetGrad: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  depthLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    transformOrigin: 'left center',
  },
});
