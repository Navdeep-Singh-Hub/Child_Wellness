/**
 * Shared playfield renderer + countdown for Session 7 depth games.
 */
import {
  ANCHOR_SIZE,
  FAR_SIZE,
  type LayerTarget,
  type NearFarTarget,
  lineStyle,
  NEAR_SIZE,
} from '@/components/game/occupational/level5/session7/shared/useDepthDistanceGame';
import type { DepthMode } from '@/components/game/occupational/level5/session7/depthDistanceConfig';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

type SphereProps = { size: number; color: string; emoji: string; dimmed?: boolean; accent?: string };
export function DepthOrb({ size, color, emoji, dimmed, accent }: SphereProps) {
  return (
    <View style={[styles.orb, { width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: dimmed ? 0.7 : 1, borderColor: accent ?? 'rgba(255,255,255,0.6)' }]}>
      <Text style={{ fontSize: size * 0.42 }}>{emoji}</Text>
    </View>
  );
}

type TargetProps = { size: number; color: string; emoji: string; ready?: boolean; accent: string };
export function DepthTargetOrb({ size, color, emoji, ready, accent }: TargetProps) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (ready) {
      scale.value = withRepeat(withSequence(withTiming(1.08, { duration: 350 }), withTiming(1, { duration: 350 })), -1, false);
    } else {
      scale.value = withTiming(1, { duration: 120 });
    }
  }, [ready, scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.orb, { width: size, height: size, borderRadius: size / 2, backgroundColor: color, borderColor: ready ? accent : 'rgba(255,255,255,0.5)', borderWidth: ready ? 3 : 2 }, anim]}>
      <Text style={{ fontSize: size * 0.45 }}>{emoji}</Text>
    </Animated.View>
  );
}

export function ViewpointPin({ size }: { size: number }) {
  return (
    <View style={[styles.pin, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={{ fontSize: size * 0.32 }}>📍</Text>
      <Text style={styles.pinLabel}>You</Text>
    </View>
  );
}

function DepthLine({ style }: { style: object }) {
  return <View pointerEvents="none" style={[styles.depthLine, style]} />;
}

type PlayfieldProps = {
  mode: DepthMode;
  accent: string;
  nearFarTargets: NearFarTarget[];
  anchorPoint: { x: number; y: number };
  zoomPos: { x: number; y: number };
  zoomScale: number;
  zoomReady: boolean;
  fallPos: { x: number; y: number };
  fallActive: boolean;
  shrinkPos: { x: number; y: number };
  shrinkSize: number;
  shrinkActive: boolean;
  layers: LayerTarget[];
};

export function DepthPlayfield(props: PlayfieldProps) {
  const { mode, accent } = props;

  if (mode === 'near-far') {
    return (
      <>
        {props.nearFarTargets.map((t) => <DepthLine key={`l-${t.id}`} style={lineStyle(props.anchorPoint.x, props.anchorPoint.y, t.x, t.y)} />)}
        <View pointerEvents="none" style={{ position: 'absolute', left: props.anchorPoint.x - ANCHOR_SIZE / 2, top: props.anchorPoint.y - ANCHOR_SIZE / 2, zIndex: 5 }}>
          <ViewpointPin size={ANCHOR_SIZE} />
        </View>
        {props.nearFarTargets.map((t) => {
          const size = t.isNear ? NEAR_SIZE : FAR_SIZE;
          return (
            <View key={t.id} pointerEvents="none" style={{ position: 'absolute', left: t.x - size / 2, top: t.y - size / 2, zIndex: t.isNear ? 4 : 3 }}>
              <DepthOrb size={size} color={t.isNear ? '#10B981' : '#3B82F6'} emoji="🔵" dimmed={!t.isNear} accent={accent} />
            </View>
          );
        })}
      </>
    );
  }

  if (mode === 'zoom') {
    const size = 70 * props.zoomScale;
    return (
      <View pointerEvents="none" style={{ position: 'absolute', left: props.zoomPos.x - size / 2, top: props.zoomPos.y - size / 2, zIndex: 10 }}>
        <DepthTargetOrb size={size} color="#EC4899" emoji="🔍" ready={props.zoomReady} accent={accent} />
      </View>
    );
  }

  if (mode === 'falling') {
    if (!props.fallActive) return null;
    return (
      <View pointerEvents="none" style={{ position: 'absolute', left: props.fallPos.x - 28, top: props.fallPos.y - 28, zIndex: 10 }}>
        <DepthTargetOrb size={56} color="#F97316" emoji="🍎" accent={accent} />
      </View>
    );
  }

  if (mode === 'shrinking') {
    if (!props.shrinkActive) return null;
    return (
      <View pointerEvents="none" style={{ position: 'absolute', left: props.shrinkPos.x - props.shrinkSize / 2, top: props.shrinkPos.y - props.shrinkSize / 2, zIndex: 10 }}>
        <DepthTargetOrb size={props.shrinkSize} color="#EF4444" emoji="🎯" accent={accent} />
      </View>
    );
  }

  return props.layers.map((layer) => (
    <View key={layer.id} pointerEvents="none" style={{ position: 'absolute', left: layer.x - layer.size / 2, top: layer.y - layer.size / 2, zIndex: layer.isFront ? 3 : layer.id === 'mid' ? 2 : 1 }}>
      <DepthOrb size={layer.size} color={layer.color} emoji={layer.emoji} dimmed={!layer.isFront} accent={accent} />
    </View>
  ));
}

export function DepthCountdown({ accent, onDone }: { accent: string; onDone: () => void }) {
  const [display, setDisplay] = useState(3);
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    let cancelled = false;
    const seq = [3, 2, 1, 0];
    const tick = (i: number) => {
      if (cancelled) return;
      if (i >= seq.length) { onDone(); return; }
      const v = seq[i]!;
      setDisplay(v === 0 ? -1 : v);
      scale.value = withSequence(withTiming(1.2, { duration: 200, easing: Easing.out(Easing.back(1.5)) }), withSpring(1));
      opacity.value = withTiming(1, { duration: 150 });
      setTimeout(() => { opacity.value = withTiming(0, { duration: 200 }); setTimeout(() => tick(i + 1), 220); }, 650);
    };
    tick(0);
    return () => { cancelled = true; };
  }, [onDone, opacity, scale]);

  const numStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));
  return (
    <View style={styles.cdOverlay} pointerEvents="none">
      <View style={[styles.cdCard, { borderColor: `${accent}55` }]}>
        <Text style={[styles.cdLabel, { color: accent }]}>FOCUS</Text>
        <Animated.Text style={[styles.cdNum, { color: accent }, numStyle]}>{display === -1 ? 'GO!' : display}</Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  orb: { justifyContent: 'center', alignItems: 'center', borderWidth: 2, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  pin: { backgroundColor: '#FEF08A', borderWidth: 3, borderColor: '#EAB308', justifyContent: 'center', alignItems: 'center', elevation: 10 },
  pinLabel: { fontSize: 9, fontWeight: '800', color: '#713F12', marginTop: -2 },
  depthLine: { position: 'absolute', height: 2, backgroundColor: 'rgba(255,255,255,0.35)', transformOrigin: 'left center' },
  cdOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 30 },
  cdCard: { backgroundColor: 'rgba(15,23,42,0.85)', borderRadius: 24, paddingHorizontal: 36, paddingVertical: 28, alignItems: 'center', borderWidth: 2 },
  cdLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  cdNum: { fontSize: 64, fontWeight: '900' },
});
