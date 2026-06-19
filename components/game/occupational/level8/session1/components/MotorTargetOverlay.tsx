/**
 * MotorTargetOverlay — draws the motor-planning targets, the live reach cursor
 * and the accuracy / movement-quality meters over the camera stage.
 *
 * All positions are normalized (0..1) screen coordinates so they line up with
 * the mirrored camera preview the child sees.
 */
import type { Anchor, MotorGameTheme, TargetKind } from '@/components/game/occupational/level8/session1/motorTheme';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const MARKER = 78;
const SOURCE = 64;
const CURSOR = 34;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const pctLeft = (x: number) => `${clamp01(x) * 100}%` as const;
const pctTop = (y: number) => `${clamp01(y) * 100}%` as const;

type Props = {
  theme: MotorGameTheme;
  kind: TargetKind;
  target: Anchor | null;
  source?: Anchor | null;
  stage?: 0 | 1; // twoStage: 0 = grab source, 1 = place target
  roundActive: boolean;
  handPos: Anchor | null;
  holdProgress: number; // 0..1 toward confirming the reach
  near: boolean;
  accuracy: number; // 0..1 live closeness to target
  quality: number; // 0..1 movement smoothness
  round: number;
  totalRounds: number;
  banner: string;
};

const TargetMarker: React.FC<{
  anchor: Anchor;
  emoji: string;
  accent: string;
  glow: string;
  active: boolean;
  near: boolean;
  holdProgress: number;
}> = ({ anchor, emoji, accent, glow, active, near, holdProgress }) => {
  const pulse = useSharedValue(1);
  const ring = useSharedValue(0);

  useEffect(() => {
    if (active) {
      pulse.value = withRepeat(withTiming(1.16, { duration: 620, easing: Easing.inOut(Easing.ease) }), -1, true);
      ring.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.out(Easing.ease) }), -1, false);
    } else {
      pulse.value = withTiming(1, { duration: 200 });
      ring.value = withTiming(0, { duration: 200 });
    }
  }, [active, pulse, ring]);

  const coreStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: active ? 0.55 * (1 - ring.value) : 0,
    transform: [{ scale: 1 + ring.value * 1.2 }],
  }));

  return (
    <View
      style={[
        styles.markerWrap,
        { left: pctLeft(anchor.x), top: pctTop(anchor.y), marginLeft: -MARKER / 2, marginTop: -MARKER / 2 },
      ]}
      pointerEvents="none"
    >
      <Animated.View style={[styles.halo, { borderColor: accent, shadowColor: glow }, haloStyle]} />
      <Animated.View
        style={[
          styles.marker,
          {
            borderColor: near ? '#34D399' : accent,
            backgroundColor: near ? 'rgba(52,211,153,0.22)' : 'rgba(15,23,42,0.45)',
            shadowColor: glow,
          },
          coreStyle,
        ]}
      >
        {near && holdProgress > 0 ? (
          <View style={[styles.holdRing, { width: MARKER * holdProgress, height: MARKER * holdProgress }]} />
        ) : null}
        <Text style={styles.markerEmoji}>{emoji}</Text>
      </Animated.View>
    </View>
  );
};

export const MotorTargetOverlay: React.FC<Props> = ({
  theme,
  kind,
  target,
  source,
  stage = 0,
  roundActive,
  handPos,
  holdProgress,
  near,
  accuracy,
  quality,
  round,
  totalRounds,
  banner,
}) => {
  const pips = Array.from({ length: totalRounds }, (_, i) => i);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Plan / Go banner */}
      {!!banner && (
        <View style={styles.bannerWrap}>
          <View style={[styles.banner, { borderColor: theme.accent, backgroundColor: roundActive ? 'rgba(52,211,153,0.2)' : 'rgba(15,23,42,0.7)' }]}>
            <Text style={styles.bannerText}>{banner}</Text>
          </View>
        </View>
      )}

      {/* twoStage source ("grab") marker */}
      {kind === 'twoStage' && source && (
        <View
          style={[
            styles.markerWrap,
            { left: pctLeft(source.x), top: pctTop(source.y), marginLeft: -SOURCE / 2, marginTop: -SOURCE / 2 },
          ]}
          pointerEvents="none"
        >
          <View
            style={[
              styles.source,
              {
                borderColor: stage === 0 ? theme.accent : '#34D399',
                opacity: stage === 0 ? 1 : 0.45,
                backgroundColor: 'rgba(15,23,42,0.5)',
              },
            ]}
          >
            <Text style={styles.sourceEmoji}>{stage === 0 ? theme.sourceEmoji : '✅'}</Text>
          </View>
        </View>
      )}

      {/* Active target marker */}
      {target && (
        <TargetMarker
          anchor={target}
          emoji={kind === 'twoStage' ? (stage === 0 ? theme.sourceEmoji ?? theme.targetEmoji : theme.targetEmoji) : theme.targetEmoji}
          accent={theme.accent}
          glow={theme.glow}
          active={roundActive}
          near={near}
          holdProgress={holdProgress}
        />
      )}

      {/* Live reach cursor (where the child's hand/body is) */}
      {roundActive && handPos && (
        <View
          style={[
            styles.cursor,
            {
              left: pctLeft(handPos.x),
              top: pctTop(handPos.y),
              marginLeft: -CURSOR / 2,
              marginTop: -CURSOR / 2,
              borderColor: near ? '#34D399' : '#FBBF24',
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.cursorEmoji}>{kind === 'body' ? theme.hero : '👆'}</Text>
        </View>
      )}

      {/* Bottom meters + round pips */}
      <View style={styles.meterPanel} pointerEvents="none">
        <View style={styles.pipRow}>
          {pips.map((i) => (
            <View
              key={i}
              style={[
                styles.pip,
                i < round
                  ? { backgroundColor: '#34D399', borderColor: '#34D399' }
                  : { borderColor: theme.accent },
              ]}
            />
          ))}
        </View>
        <View style={styles.meterRow}>
          <Text style={styles.meterLabel}>AIM</Text>
          <View style={styles.meterTrack}>
            <View style={[styles.meterFill, { width: `${Math.round(clamp01(accuracy) * 100)}%`, backgroundColor: theme.accent }]} />
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
  bannerWrap: { position: 'absolute', top: 14, alignSelf: 'center', width: '100%', alignItems: 'center' },
  banner: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 18, borderWidth: 2 },
  bannerText: { color: '#fff', fontSize: 15, fontWeight: '900', textAlign: 'center', letterSpacing: 0.3 },
  markerWrap: { position: 'absolute', width: MARKER, height: MARKER, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: MARKER,
    height: MARKER,
    borderRadius: MARKER / 2,
    borderWidth: 3,
    shadowOpacity: 0.9,
    shadowRadius: 14,
  },
  marker: {
    width: MARKER,
    height: MARKER,
    borderRadius: MARKER / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 8,
  },
  holdRing: { position: 'absolute', borderRadius: MARKER / 2, backgroundColor: 'rgba(52,211,153,0.4)' },
  markerEmoji: { fontSize: 34 },
  source: {
    width: SOURCE,
    height: SOURCE,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceEmoji: { fontSize: 30 },
  cursor: {
    position: 'absolute',
    width: CURSOR,
    height: CURSOR,
    borderRadius: CURSOR / 2,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cursorEmoji: { fontSize: 18 },
  meterPanel: { position: 'absolute', bottom: 12, alignSelf: 'center', width: '88%', alignItems: 'center', gap: 6 },
  pipRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  pip: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, backgroundColor: 'rgba(15,23,42,0.6)' },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  meterLabel: { color: '#C4B5FD', fontSize: 10, fontWeight: '900', letterSpacing: 1, width: 40 },
  meterTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(15,23,42,0.7)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.25)',
  },
  meterFill: { height: '100%', borderRadius: 5 },
});

export default MotorTargetOverlay;
