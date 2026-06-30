import type { StagePattern } from '@/constants/stageThemes';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

type Props = {
  pattern: StagePattern;
  accent: string;
  width: number;
  height: number;
};

export function StageCardPattern({ pattern, accent, width, height }: Props) {
  const o = 0.2;

  switch (pattern) {
    case 'focus':
      return (
        <View style={styles.wrap} pointerEvents="none">
          <Svg width={width} height={height}>
            {[0.22, 0.16, 0.1].map((r, i) => (
              <Circle key={i} cx={width * 0.82} cy={height * 0.38} r={width * r} fill="none" stroke={accent} strokeWidth={1.5} opacity={o + i * 0.08} />
            ))}
            <Circle cx={width * 0.82} cy={height * 0.38} r={6} fill={accent} opacity={0.35} />
          </Svg>
        </View>
      );
    case 'mirror':
      return (
        <View style={styles.wrap} pointerEvents="none">
          <Svg width={width} height={height}>
            <Rect x={width * 0.68} y={height * 0.15} width={width * 0.08} height={height * 0.7} rx={4} fill={accent} opacity={0.12} />
            <Circle cx={width * 0.72} cy={height * 0.35} r={14} fill={accent} opacity={0.15} />
            <Circle cx={width * 0.88} cy={height * 0.35} r={14} fill={accent} opacity={0.15} />
          </Svg>
        </View>
      );
    case 'jaw':
      return (
        <View style={styles.wrap} pointerEvents="none">
          <Svg width={width} height={height}>
            <Path d={`M ${width * 0.62} ${height * 0.35} Q ${width * 0.78} ${height * 0.55} ${width * 0.62} ${height * 0.75}`} stroke={accent} strokeWidth={3} fill="none" opacity={0.35} />
            <Path d={`M ${width * 0.88} ${height * 0.35} Q ${width * 0.72} ${height * 0.55} ${width * 0.88} ${height * 0.75}`} stroke={accent} strokeWidth={3} fill="none" opacity={0.35} />
          </Svg>
        </View>
      );
    case 'voice':
      return (
        <View style={styles.wrap} pointerEvents="none">
          <Svg width={width} height={height}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Rect key={i} x={width * (0.62 + i * 0.05)} y={height * (0.45 - (i % 3) * 0.06)} width={4} height={height * (0.12 + (i % 4) * 0.05)} rx={2} fill={accent} opacity={o + (i % 3) * 0.06} />
            ))}
          </Svg>
        </View>
      );
    case 'oral':
      return (
        <View style={styles.wrap} pointerEvents="none">
          <Svg width={width} height={height}>
            <Path d={`M ${width * 0.65} ${height * 0.42} Q ${width * 0.78} ${height * 0.5} ${width * 0.92} ${height * 0.42}`} stroke={accent} strokeWidth={2.5} fill="none" opacity={0.35} />
            <Path d={`M ${width * 0.65} ${height * 0.58} Q ${width * 0.78} ${height * 0.66} ${width * 0.92} ${height * 0.58}`} stroke={accent} strokeWidth={2.5} fill="none" opacity={0.25} />
          </Svg>
        </View>
      );
    case 'motor':
      return (
        <View style={styles.wrap} pointerEvents="none">
          <Svg width={width} height={height}>
            {[0, 1, 2, 3].map((row) => [0, 1, 2, 3, 4].map((col) => (
              <Circle key={`${row}-${col}`} cx={width * (0.6 + col * 0.07)} cy={height * (0.2 + row * 0.12)} r={3} fill={accent} opacity={0.1 + ((row + col) % 3) * 0.06} />
            )))}
          </Svg>
        </View>
      );
    case 'coordination':
      return (
        <View style={styles.wrap} pointerEvents="none">
          <Svg width={width} height={height}>
            <Line x1={width * 0.62} y1={height * 0.25} x2={width * 0.78} y2={height * 0.45} stroke={accent} strokeWidth={1.5} opacity={0.25} />
            <Line x1={width * 0.78} y1={height * 0.45} x2={width * 0.92} y2={height * 0.3} stroke={accent} strokeWidth={1.5} opacity={0.25} />
            <Line x1={width * 0.78} y1={height * 0.45} x2={width * 0.72} y2={height * 0.72} stroke={accent} strokeWidth={1.5} opacity={0.25} />
            <Circle cx={width * 0.62} cy={height * 0.25} r={5} fill={accent} opacity={0.3} />
            <Circle cx={width * 0.78} cy={height * 0.45} r={5} fill={accent} opacity={0.35} />
            <Circle cx={width * 0.92} cy={height * 0.3} r={5} fill={accent} opacity={0.3} />
          </Svg>
        </View>
      );
    case 'spark':
      return (
        <View style={styles.wrap} pointerEvents="none">
          <Svg width={width} height={height}>
            {[0, 45, 90, 135].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const cx = width * 0.8;
              const cy = height * 0.4;
              const len = 22 + i * 6;
              return (
                <Line
                  key={deg}
                  x1={cx}
                  y1={cy}
                  x2={cx + Math.cos(rad) * len}
                  y2={cy + Math.sin(rad) * len}
                  stroke={accent}
                  strokeWidth={2}
                  opacity={0.25}
                />
              );
            })}
          </Svg>
        </View>
      );
    case 'bloom':
      return (
        <View style={styles.wrap} pointerEvents="none">
          <Svg width={width} height={height}>
            {[0, 1, 2, 3, 4].map((i) => {
              const a = (i / 5) * Math.PI * 2;
              return (
                <Circle
                  key={i}
                  cx={width * 0.8 + Math.cos(a) * 18}
                  cy={height * 0.42 + Math.sin(a) * 18}
                  r={10}
                  fill={accent}
                  opacity={0.12}
                />
              );
            })}
          </Svg>
        </View>
      );
    case 'peak':
      return (
        <View style={styles.wrap} pointerEvents="none">
          <Svg width={width} height={height}>
            <Path d={`M ${width * 0.6} ${height * 0.78} L ${width * 0.76} ${height * 0.28} L ${width * 0.92} ${height * 0.78} Z`} fill={accent} opacity={0.15} />
          </Svg>
        </View>
      );
    case 'pulse':
      return (
        <View style={styles.wrap} pointerEvents="none">
          <Svg width={width} height={height}>
            <Path
              d={`M ${width * 0.58} ${height * 0.5} L ${width * 0.64} ${height * 0.5} L ${width * 0.68} ${height * 0.35} L ${width * 0.72} ${height * 0.65} L ${width * 0.76} ${height * 0.42} L ${width * 0.8} ${height * 0.5} L ${width * 0.94} ${height * 0.5}`}
              stroke={accent}
              strokeWidth={2}
              fill="none"
              opacity={0.3}
            />
          </Svg>
        </View>
      );
    case 'orbit':
      return (
        <View style={styles.wrap} pointerEvents="none">
          <Svg width={width} height={height}>
            <Circle cx={width * 0.8} cy={height * 0.42} r={28} fill="none" stroke={accent} strokeWidth={1.5} opacity={0.2} />
            <Circle cx={width * 0.8} cy={height * 0.42} r={6} fill={accent} opacity={0.35} />
            <Circle cx={width * 0.92} cy={height * 0.35} r={4} fill={accent} opacity={0.25} />
          </Svg>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
});
