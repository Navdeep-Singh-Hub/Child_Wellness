/**
 * BodyPositionOverlay — shows the target body position (zone glow + marker or a
 * shape figure), a directional cue card, a live POSITION meter, FLOW meter and
 * round progress over the camera.
 */
import { PoseFigure } from '@/components/game/occupational/level8/session4/components/PoseFigure';
import type { ArmZone } from '@/components/game/occupational/level8/session4/poseMatch';
import { directionArrow, zoneAnchor, type PositionSpec } from '@/components/game/occupational/level8/session5/bodyPosition';
import type { BodyPositionGameTheme } from '@/components/game/occupational/level8/session5/bodyPositionTheme';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const MARKER = 92;

const shapeArms = (spec: PositionSpec): { left: ArmZone; right: ArmZone } => {
  if (spec.kind === 'reachHigh') return { left: 'up', right: spec.hands === 1 ? 'down' : 'up' };
  switch (spec.shape) {
    case 'tall':
      return { left: 'up', right: 'up' };
    case 'ball':
      return { left: 'down', right: 'down' };
    case 'star':
    case 'wide':
    default:
      return { left: 'out', right: 'out' };
  }
};

type Props = {
  theme: BodyPositionGameTheme;
  spec: PositionSpec | null;
  roundActive: boolean;
  matched: boolean;
  matchProgress: number;
  score: number;
  quality: number;
  round: number;
  totalRounds: number;
  banner: string;
};

export const BodyPositionOverlay: React.FC<Props> = ({
  theme,
  spec,
  roundActive,
  matched,
  matchProgress,
  score,
  quality,
  round,
  totalRounds,
  banner,
}) => {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse]);

  const markerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -MARKER / 2 }, { translateY: -MARKER / 2 }, { scale: 1 + pulse.value * 0.12 }],
    opacity: 0.9,
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.25 + pulse.value * 0.3 }));

  const accent = matched ? '#34D399' : theme.accent;
  const anchor = spec ? zoneAnchor(spec) : { x: 0.5, y: 0.4 };
  const isShape = spec ? spec.kind === 'shape' : false;
  const showFigure = spec ? spec.kind === 'shape' : false;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Zone glow band */}
      {spec && !isShape && (
        <Animated.View
          style={[
            styles.glow,
            glowStyle,
            { backgroundColor: theme.glow },
            spec.kind === 'reachHigh' && styles.glowTop,
            spec.kind === 'reachLow' && styles.glowBottom,
            spec.kind === 'reachSide' && (spec.side === 'left' ? styles.glowLeft : styles.glowRight),
            spec.kind === 'turn' && styles.glowCenter,
          ]}
        />
      )}

      {/* Target marker / shape figure */}
      {spec && (
        <View style={[styles.anchor, { left: `${anchor.x * 100}%`, top: `${anchor.y * 100}%` }]}>
          {showFigure ? (
            <View style={{ transform: [{ translateX: -75 }, { translateY: -84 }] }}>
              <PoseFigure
                pose={{ id: spec.id, name: spec.name, leftArm: shapeArms(spec).left, rightArm: shapeArms(spec).right }}
                accent={accent}
                size={0.9}
                animated={!matched}
              />
            </View>
          ) : (
            <Animated.View style={[styles.marker, markerStyle, { borderColor: accent, shadowColor: accent }]}>
              <Text style={styles.markerIcon}>{spec.icon}</Text>
            </Animated.View>
          )}
        </View>
      )}

      {/* Cue card */}
      {spec && (
        <View style={styles.cueWrap}>
          <View style={[styles.cueCard, { borderColor: accent }]}>
            <Text style={styles.cueArrow}>{directionArrow(spec)}</Text>
            <Text style={styles.cueName}>{spec.name}</Text>
          </View>
        </View>
      )}

      {/* Banner */}
      {!!banner && (
        <View style={styles.bannerWrap}>
          <View
            style={[
              styles.banner,
              { borderColor: theme.accent, backgroundColor: roundActive ? 'rgba(52,211,153,0.2)' : 'rgba(15,23,42,0.7)' },
            ]}
          >
            <Text style={styles.bannerText}>{banner}</Text>
          </View>
        </View>
      )}

      {matched && roundActive && (
        <View style={styles.matchWrap}>
          <Text style={styles.matchText}>✓ Perfect position!</Text>
        </View>
      )}

      {/* Meters + pips */}
      <View style={styles.meterPanel}>
        <View style={styles.pipRow}>
          {Array.from({ length: totalRounds }, (_, i) => (
            <View
              key={i}
              style={[styles.pip, i < round ? { backgroundColor: '#34D399', borderColor: '#34D399' } : { borderColor: theme.accent }]}
            />
          ))}
        </View>
        <View style={styles.meterRow}>
          <Text style={styles.meterLabel}>POSITION</Text>
          <View style={styles.meterTrack}>
            <View
              style={[
                styles.meterFill,
                {
                  width: `${Math.round(clamp01(matched ? Math.max(score, matchProgress) : score) * 100)}%`,
                  backgroundColor: matched ? '#34D399' : theme.accent,
                },
              ]}
            />
          </View>
        </View>
        <View style={styles.meterRow}>
          <Text style={styles.meterLabel}>FLOW</Text>
          <View style={styles.meterTrack}>
            <View style={[styles.meterFill, { width: `${Math.round(clamp01(quality) * 100)}%`, backgroundColor: '#34D399' }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  glow: { position: 'absolute' },
  glowTop: { top: 0, left: 0, right: 0, height: '24%', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  glowBottom: { bottom: 0, left: 0, right: 0, height: '24%', borderTopLeftRadius: 40, borderTopRightRadius: 40 },
  glowLeft: { top: '20%', bottom: '20%', left: 0, width: '22%', borderTopRightRadius: 40, borderBottomRightRadius: 40 },
  glowRight: { top: '20%', bottom: '20%', right: 0, width: '22%', borderTopLeftRadius: 40, borderBottomLeftRadius: 40 },
  glowCenter: { top: '28%', bottom: '28%', left: '30%', right: '30%', borderRadius: 200 },
  anchor: { position: 'absolute', width: 0, height: 0 },
  marker: {
    width: MARKER,
    height: MARKER,
    borderRadius: MARKER / 2,
    borderWidth: 4,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.8,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  markerIcon: { fontSize: 42 },
  cueWrap: { position: 'absolute', top: 12, alignSelf: 'center' },
  cueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 3,
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  cueArrow: { fontSize: 22 },
  cueName: { color: '#fff', fontSize: 18, fontWeight: '900' },
  bannerWrap: { position: 'absolute', top: '60%', alignSelf: 'center', width: '100%', alignItems: 'center' },
  banner: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 18, borderWidth: 2, maxWidth: '92%' },
  bannerText: { color: '#fff', fontSize: 15, fontWeight: '900', textAlign: 'center' },
  matchWrap: { position: 'absolute', top: '52%', alignSelf: 'center' },
  matchText: { color: '#34D399', fontSize: 22, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 6 },
  meterPanel: { position: 'absolute', bottom: 12, alignSelf: 'center', width: '88%', alignItems: 'center', gap: 6 },
  pipRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  pip: { width: 15, height: 15, borderRadius: 8, borderWidth: 2, backgroundColor: 'rgba(15,23,42,0.6)' },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  meterLabel: { color: '#BFDBFE', fontSize: 10, fontWeight: '900', letterSpacing: 1, width: 64 },
  meterTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(15,23,42,0.7)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(147,197,253,0.25)',
  },
  meterFill: { height: '100%', borderRadius: 5 },
});

export default BodyPositionOverlay;
