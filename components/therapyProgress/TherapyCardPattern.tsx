/**
 * Decorative motifs — each therapy realm gets a unique visual language.
 */
import type { TherapyPattern } from '@/constants/therapyProgressDesign';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

type Props = {
  pattern: TherapyPattern;
  accent: string;
  width: number;
  height: number;
};

export function TherapyCardPattern({ pattern, accent, width, height }: Props) {
  const opacity = 0.22;

  switch (pattern) {
    case 'soundwave':
      return (
        <View style={styles.wrap} pointerEvents="none">
          <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {[0.15, 0.28, 0.42, 0.55, 0.68, 0.82].map((x, i) => {
              const barH = 28 + (i % 3) * 22 + (i % 2) * 14;
              const cx = width * x;
              return (
                <Rect
                  key={i}
                  x={cx}
                  y={height * 0.35 - barH / 2}
                  width={6}
                  height={barH}
                  rx={3}
                  fill={accent}
                  opacity={opacity + i * 0.04}
                />
              );
            })}
            <Path
              d={`M ${width * 0.08} ${height * 0.72} Q ${width * 0.35} ${height * 0.55} ${width * 0.55} ${height * 0.78} T ${width * 0.92} ${height * 0.62}`}
              stroke={accent}
              strokeWidth={2}
              fill="none"
              opacity={0.35}
            />
            <Circle cx={width * 0.88} cy={height * 0.22} r={28} fill={accent} opacity={0.08} />
          </Svg>
        </View>
      );

    case 'tactile':
      return (
        <View style={styles.wrap} pointerEvents="none">
          <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {[
              [0.72, 0.28, 36],
              [0.82, 0.48, 28],
              [0.65, 0.58, 44],
              [0.88, 0.72, 22],
            ].map(([x, y, r], i) => (
              <Circle
                key={i}
                cx={width * (x as number)}
                cy={height * (y as number)}
                r={r as number}
                fill="none"
                stroke={accent}
                strokeWidth={2}
                opacity={0.18 + i * 0.05}
              />
            ))}
            {[0, 1, 2, 3, 4].map((row) =>
              [0, 1, 2, 3, 4, 5].map((col) => (
                <Circle
                  key={`${row}-${col}`}
                  cx={width * (0.52 + col * 0.07)}
                  cy={height * (0.18 + row * 0.1)}
                  r={3}
                  fill={accent}
                  opacity={0.12 + ((row + col) % 3) * 0.06}
                />
              )),
            )}
            <Path
              d={`M ${width * 0.55} ${height * 0.75} C ${width * 0.62} ${height * 0.55} ${width * 0.78} ${height * 0.62} ${width * 0.85} ${height * 0.42}`}
              stroke={accent}
              strokeWidth={2.5}
              fill="none"
              opacity={0.28}
              strokeLinecap="round"
            />
          </Svg>
        </View>
      );

    case 'constellation':
      return (
        <View style={styles.wrap} pointerEvents="none">
          <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {[
              [0.62, 0.2],
              [0.78, 0.32],
              [0.7, 0.48],
              [0.88, 0.55],
              [0.74, 0.68],
              [0.92, 0.78],
            ].map(([x, y], i) => (
              <Circle key={i} cx={width * (x as number)} cy={height * (y as number)} r={i % 2 === 0 ? 4 : 2.5} fill={accent} opacity={0.35 + (i % 3) * 0.1} />
            ))}
            <Line x1={width * 0.62} y1={height * 0.2} x2={width * 0.78} y2={height * 0.32} stroke={accent} strokeWidth={1} opacity={0.2} />
            <Line x1={width * 0.78} y1={height * 0.32} x2={width * 0.7} y2={height * 0.48} stroke={accent} strokeWidth={1} opacity={0.2} />
            <Line x1={width * 0.7} y1={height * 0.48} x2={width * 0.88} y2={height * 0.55} stroke={accent} strokeWidth={1} opacity={0.2} />
            <Line x1={width * 0.88} y1={height * 0.55} x2={width * 0.74} y2={height * 0.68} stroke={accent} strokeWidth={1} opacity={0.2} />
            <Circle cx={width * 0.82} cy={height * 0.38} r={42} fill={accent} opacity={0.06} />
          </Svg>
        </View>
      );

    case 'storybook':
      return (
        <View style={styles.wrap} pointerEvents="none">
          <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <Path
              d={`M ${width * 0.58} ${height * 0.12} L ${width * 0.58} ${height * 0.88} Q ${width * 0.72} ${height * 0.5} ${width * 0.95} ${height * 0.15} L ${width * 0.95} ${height * 0.85} Q ${width * 0.78} ${height * 0.55} ${width * 0.58} ${height * 0.88}`}
              fill={accent}
              opacity={0.12}
            />
            <Path
              d={`M ${width * 0.58} ${height * 0.12} Q ${width * 0.72} ${height * 0.5} ${width * 0.58} ${height * 0.88}`}
              stroke={accent}
              strokeWidth={2}
              fill="none"
              opacity={0.35}
            />
            {[0.28, 0.38, 0.48, 0.58].map((y, i) => (
              <Line
                key={i}
                x1={width * 0.64}
                y1={height * y}
                x2={width * (0.88 - i * 0.04)}
                y2={height * y}
                stroke={accent}
                strokeWidth={1.5}
                opacity={0.15}
              />
            ))}
            <Circle cx={width * 0.9} cy={height * 0.22} r={6} fill={accent} opacity={0.25} />
          </Svg>
        </View>
      );

    case 'hologram':
      return (
        <View style={styles.wrap} pointerEvents="none">
          <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {[0, 1, 2, 3, 4, 5, 6].map((row) =>
              [0, 1, 2, 3, 4, 5, 6, 7].map((col) => (
                <Rect
                  key={`${row}-${col}`}
                  x={width * (0.55 + col * 0.055)}
                  y={height * (0.12 + row * 0.1)}
                  width={width * 0.035}
                  height={width * 0.035}
                  rx={2}
                  fill={accent}
                  opacity={((row + col) % 3 === 0 ? 0.22 : 0.08) + (row === 3 && col > 2 && col < 6 ? 0.12 : 0)}
                />
              )),
            )}
            <Circle cx={width * 0.78} cy={height * 0.48} r={38} fill="none" stroke={accent} strokeWidth={1.5} opacity={0.25} />
            <Circle cx={width * 0.78} cy={height * 0.48} r={24} fill="none" stroke={accent} strokeWidth={1} opacity={0.18} />
          </Svg>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
});
