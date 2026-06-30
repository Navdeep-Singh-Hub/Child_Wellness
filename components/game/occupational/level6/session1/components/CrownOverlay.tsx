/**
 * CrownOverlay — face frame + crown anchored to detected head position.
 * `stability` 0..1 (1 = perfectly steady). Crown wobbles and can "fall" when low.
 */
import type { FaceLandmarkPoint, HeadBounds } from '@/components/game/occupational/level6/session1/poseUtils';
import { FaceLandmarksOverlay } from '@/components/game/occupational/level6/session1/components/FaceLandmarksOverlay';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

type Props = {
  stability: number;
  safePct: number;
  steadinessPct: number;
  headBounds: HeadBounds | null;
  faceLandmarks?: FaceLandmarkPoint[];
  headTiltDeg?: number;
  crownFallen?: boolean;
  tracking?: boolean;
};

const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;

export const CrownOverlay: React.FC<Props> = ({
  stability,
  safePct,
  steadinessPct,
  headBounds,
  faceLandmarks = [],
  headTiltDeg = 0,
  crownFallen = false,
  tracking = false,
}) => {
  const wobble = useSharedValue(0);
  React.useEffect(() => {
    wobble.value = withRepeat(withTiming(1, { duration: 600 }), -1, true);
  }, [wobble]);

  const instability = Math.max(0, 1 - stability);
  const crownSize = headBounds ? Math.max(36, Math.min(72, headBounds.width * 420)) : 64;

  const crownStyle = useAnimatedStyle(() => {
    const tilt = (wobble.value - 0.5) * 2 * instability * 22 + headTiltDeg * 0.35;
    const drop = crownFallen ? 48 : instability * 18;
    const scale = crownFallen ? 0.75 : 1 - instability * 0.12;
    return {
      transform: [
        { translateX: -crownSize / 2 },
        { translateY: drop },
        { rotateZ: `${tilt}deg` },
        { scale },
      ],
      opacity: crownFallen ? 0.35 : 1,
    };
  });

  const faceFrameStyle = headBounds
    ? {
        left: pct(headBounds.left),
        top: pct(headBounds.top),
        width: pct(headBounds.width),
        height: pct(headBounds.height),
      }
    : null;

  const crownPosStyle = headBounds
    ? {
        left: pct(headBounds.centerX),
        top: pct(headBounds.crownY),
      }
    : styles.crownCentered;

  const frameColor =
    steadinessPct >= 70 ? '#34D399' : steadinessPct >= 45 ? '#FBBF24' : '#F87171';

  return (
    <View style={styles.wrap} pointerEvents="none">
      <FaceLandmarksOverlay landmarks={faceLandmarks} visible={tracking} />

      {tracking && faceFrameStyle ? (
        <View
          style={[
            styles.faceFrame,
            faceFrameStyle,
            { borderColor: frameColor },
          ]}
        >
          <View style={[styles.corner, styles.cornerTL, { borderColor: frameColor }]} />
          <View style={[styles.corner, styles.cornerTR, { borderColor: frameColor }]} />
          <View style={[styles.corner, styles.cornerBL, { borderColor: frameColor }]} />
          <View style={[styles.corner, styles.cornerBR, { borderColor: frameColor }]} />
        </View>
      ) : null}

      <Animated.View style={[styles.crownAnchor, crownPosStyle]}>
        <Animated.Text style={[styles.crown, { fontSize: crownSize }, crownStyle]}>👑</Animated.Text>
      </Animated.View>

      <View style={styles.meterCard}>
        <Text style={styles.meterTitle}>HEAD STEADY</Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.round(steadinessPct)}%`,
                backgroundColor: frameColor,
              },
            ]}
          />
        </View>
        <Text style={styles.meterValue}>{Math.round(steadinessPct)}% steady</Text>
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeLabel}>CROWN SAFE</Text>
        <Text style={styles.badgeValue}>{Math.round(safePct)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject },
  faceFrame: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 18,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(15,12,41,0.08)',
  },
  corner: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderWidth: 3,
  },
  cornerTL: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  crownAnchor: { position: 'absolute' },
  crownCentered: { position: 'absolute', top: 16, alignSelf: 'center', left: '50%' },
  crown: { textAlign: 'center' },
  meterCard: {
    position: 'absolute',
    left: 12,
    bottom: 56,
    right: 12,
    backgroundColor: 'rgba(15,12,41,0.78)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(253,224,71,0.35)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  meterTitle: {
    color: '#FDE68A',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 6,
    textAlign: 'center',
  },
  meterTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  meterFill: { height: '100%', borderRadius: 999 },
  meterValue: { color: '#fff', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(190,24,93,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    alignItems: 'center',
  },
  badgeLabel: { color: '#FBCFE8', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  badgeValue: { color: '#fff', fontSize: 18, fontWeight: '900' },
});
