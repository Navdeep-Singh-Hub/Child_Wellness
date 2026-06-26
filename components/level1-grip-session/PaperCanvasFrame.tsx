import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SCRIBBLE_STUDIO_THEME as T, GRIP_SESSION } from './gripSessionTheme';

interface PaperCanvasFrameProps {
  children: React.ReactNode;
}

/** Paper-textured frame with dot grid for the drawing surface */
export function PaperCanvasFrame({ children }: PaperCanvasFrameProps) {
  const dots = [];
  const cols = 12;
  const rows = 16;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(
        <Circle
          key={`${r}-${c}`}
          cx={`${(c + 0.5) * (100 / cols)}%`}
          cy={`${(r + 0.5) * (100 / rows)}%`}
          r={1.2}
          fill={T.canvasDots}
        />
      );
    }
  }

  return (
    <View style={[styles.frame, GRIP_SESSION.shadow.card]}>
      <View style={styles.inner}>
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          {dots}
        </Svg>
        <View style={styles.canvasSlot}>{children}</View>
      </View>
      <View style={styles.clip} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    minHeight: 300,
    borderRadius: GRIP_SESSION.radius.card,
    backgroundColor: T.canvasBorder,
    padding: 4,
    position: 'relative',
  },
  inner: {
    flex: 1,
    borderRadius: GRIP_SESSION.radius.card - 2,
    backgroundColor: T.canvas,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  canvasSlot: {
    flex: 1,
    zIndex: 1,
  },
  clip: {
    position: 'absolute',
    top: -6,
    left: '42%',
    width: 48,
    height: 18,
    backgroundColor: 'rgba(253, 186, 116, 0.55)',
    borderRadius: 4,
    transform: [{ rotate: '-2deg' }],
    zIndex: 2,
  },
});
