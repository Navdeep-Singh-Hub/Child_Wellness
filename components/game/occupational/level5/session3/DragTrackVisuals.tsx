/** Drag-to-Track visuals — OT L5 Session 3 */
import type { DragTrackGameConfig } from '@/components/game/occupational/level5/session3/dragTrackConfig';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function DragTrackBackdrop({ config }: { config: DragTrackGameConfig }) {
  const { motion, theme } = config;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...theme.sky]} style={StyleSheet.absoluteFillObject} />
      {motion === 'horizontal' && <StarsField />}
      {motion === 'orbit' && <RailLoop />}
      {motion === 'figure8' && <NebulaGlow />}
      {motion === 'vertical' && <RiverWaves />}
      {motion === 'zigzag' && <StormClouds />}
    </View>
  );
}

function StarsField() {
  const stars = Array.from({ length: 24 });
  return (
    <>
      {stars.map((_, i) => (
        <View key={i} style={[styles.star, { left: `${(i * 17) % 100}%`, top: `${(i * 23) % 85}%`, opacity: 0.3 + (i % 5) * 0.12 }]} />
      ))}
    </>
  );
}

function RailLoop() {
  return (
    <View style={styles.railOuter}>
      <View style={styles.railInner} />
    </View>
  );
}

function NebulaGlow() {
  return (
    <>
      <View style={[styles.nebula, { top: '30%', left: '20%' }]} />
      <View style={[styles.nebula, { top: '50%', right: '15%', width: 100, height: 100 }]} />
    </>
  );
}

function RiverWaves() {
  return (
    <View style={styles.river}>
      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} style={[styles.wave, { top: i * 28 }]} />
      ))}
    </View>
  );
}

function StormClouds() {
  return (
    <>
      <View style={[styles.cloud, { top: '12%', left: '10%' }]} />
      <View style={[styles.cloud, { top: '8%', right: '15%', width: 90 }]} />
      <View style={[styles.cloud, { top: '22%', alignSelf: 'center' }]} />
    </>
  );
}

export function TetherLine({
  x1, y1, x2, y2, color, visible,
}: {
  x1: number; y1: number; x2: number; y2: number; color: string; visible: boolean;
}) {
  if (!visible) return null;
  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x1,
        top: y1,
        width: length,
        height: 3,
        backgroundColor: color,
        borderRadius: 2,
        transform: [{ rotate: `${angle}deg` }],
        transformOrigin: 'left center',
        opacity: 0.7,
      }}
    />
  );
}

export function DragTrailDot({ x, y, color, opacity }: { x: number; y: number; color: string; opacity: number }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x - 5,
        top: y - 5,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: color,
        opacity: opacity * 0.4,
      }}
    />
  );
}

const styles = StyleSheet.create({
  star: { position: 'absolute', width: 3, height: 3, borderRadius: 2, backgroundColor: '#fff' },
  railOuter: {
    position: 'absolute',
    alignSelf: 'center',
    top: '32%',
    width: '72%',
    aspectRatio: 1.6,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: 'rgba(120,53,15,0.35)',
    borderStyle: 'dashed',
  },
  railInner: {
    ...StyleSheet.absoluteFillObject,
    margin: 12,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(180,83,9,0.25)',
  },
  nebula: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(139,92,246,0.15)',
  },
  river: { position: 'absolute', bottom: 0, left: '35%', width: '30%', height: '70%', opacity: 0.25 },
  wave: { height: 2, backgroundColor: '#0891B2', marginBottom: 8, borderRadius: 1 },
  cloud: { position: 'absolute', width: 70, height: 28, borderRadius: 14, backgroundColor: 'rgba(100,116,139,0.45)' },
});
