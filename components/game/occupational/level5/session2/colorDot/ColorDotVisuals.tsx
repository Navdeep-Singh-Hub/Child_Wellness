/** Paint Studio visuals — OT L5 S2 Game 2 */
import { COLORS, COLOR_DOT_THEME as T } from '@/components/game/occupational/level5/session2/colorDot/colorDotTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function PaintStudioBackdrop() {
  const splats = [
    { left: '6%', top: '68%', c: '#FCA5A5', s: 40 },
    { left: '82%', top: '58%', c: '#93C5FD', s: 34 },
    { left: '70%', top: '78%', c: '#C4B5FD', s: 28 },
    { left: '18%', top: '82%', c: '#FDE047', s: 22 },
  ];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...T.sky]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.easel}>
        <View style={styles.easelLegL} />
        <View style={styles.easelLegR} />
        <View style={styles.canvas}>
          <Text style={styles.canvasLabel}>Studio Canvas</Text>
        </View>
      </View>
      {splats.map((s, i) => (
        <View key={i} style={[styles.splat, { left: s.left, top: s.top, width: s.s, height: s.s, backgroundColor: s.c }]} />
      ))}
      <View style={styles.paletteTray}>
        {['#EF4444', '#3B82F6', '#10B981', '#EAB308', '#8B5CF6'].map((c) => (
          <View key={c} style={[styles.paletteBlob, { backgroundColor: c }]} />
        ))}
      </View>
    </View>
  );
}

export function TargetColorBanner({ colorIndex }: { colorIndex: number }) {
  const c = COLORS[colorIndex]!;
  return (
    <View style={[styles.banner, { backgroundColor: c.color, shadowColor: c.glow }]}>
      <Text style={styles.bannerEmoji}>{c.emoji}</Text>
      <View>
        <Text style={styles.bannerLbl}>TAP THIS COLOR</Text>
        <Text style={styles.bannerName}>{c.name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  easel: { position: 'absolute', top: '18%', alignSelf: 'center', alignItems: 'center' },
  easelLegL: { position: 'absolute', bottom: -30, left: -20, width: 4, height: 50, backgroundColor: '#A78BFA', transform: [{ rotate: '-18deg' }] },
  easelLegR: { position: 'absolute', bottom: -30, right: -20, width: 4, height: 50, backgroundColor: '#A78BFA', transform: [{ rotate: '18deg' }] },
  canvas: { width: 120, height: 90, backgroundColor: 'rgba(255,255,255,0.75)', borderWidth: 3, borderColor: '#C4B5FD', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  canvasLabel: { fontSize: 10, fontWeight: '700', color: '#7C3AED', opacity: 0.6 },
  splat: { position: 'absolute', borderRadius: 999, opacity: 0.35 },
  paletteTray: { position: 'absolute', bottom: 16, left: 16, flexDirection: 'row', gap: 6, backgroundColor: 'rgba(255,255,255,0.55)', padding: 8, borderRadius: 14 },
  paletteBlob: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, marginTop: 6, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  bannerEmoji: { fontSize: 26 },
  bannerLbl: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.85)', letterSpacing: 0.8 },
  bannerName: { fontSize: 17, fontWeight: '900', color: '#fff' },
});
