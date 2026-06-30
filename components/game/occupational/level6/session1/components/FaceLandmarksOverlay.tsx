/**
 * FaceLandmarksOverlay — draws BlazePose face-region points on the camera preview.
 */
import {
  FACE_LANDMARK_EDGES,
  type FaceLandmarkKind,
  type FaceLandmarkPoint,
} from '@/components/game/occupational/level6/session1/poseUtils';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

type Props = {
  landmarks: FaceLandmarkPoint[];
  visible?: boolean;
};

const KIND_COLOR: Record<FaceLandmarkKind, string> = {
  nose: '#FDE047',
  eye: '#22D3EE',
  ear: '#C084FC',
  mouth: '#FB7185',
};

const KIND_RADIUS: Record<FaceLandmarkKind, number> = {
  nose: 0.014,
  eye: 0.01,
  ear: 0.011,
  mouth: 0.009,
};

export const FaceLandmarksOverlay: React.FC<Props> = ({ landmarks, visible = true }) => {
  const byId = useMemo(() => {
    const map = new Map<string, FaceLandmarkPoint>();
    for (const lm of landmarks) map.set(lm.id, lm);
    return map;
  }, [landmarks]);

  if (!visible || landmarks.length === 0) return null;

  const edges = FACE_LANDMARK_EDGES.flatMap(([a, b], i) => {
    const p1 = byId.get(a);
    const p2 = byId.get(b);
    if (!p1 || !p2) return [];
    return [{ key: `${a}-${b}-${i}`, p1, p2 }];
  });

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        {edges.map(({ key, p1, p2 }) => (
          <Line
            key={key}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="rgba(253,224,71,0.55)"
            strokeWidth={0.003}
            strokeLinecap="round"
          />
        ))}
        {landmarks.map((lm) => (
          <Circle
            key={lm.id}
            cx={lm.x}
            cy={lm.y}
            r={KIND_RADIUS[lm.kind]}
            fill={KIND_COLOR[lm.kind]}
            stroke="#FFFFFF"
            strokeWidth={0.003}
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject },
});
