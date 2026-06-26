/** Paint Pressure overlay — OT L9 S2 Game 2 */
import type { PaintPressureTheme } from '@/components/game/occupational/level9/session2/pressureTheme';
import { PAINT_SHELL } from '@/components/game/occupational/level9/session2/pressureTheme';
import { CANVAS_PAINT_CELLS } from '@/components/game/occupational/level9/session2/pressureUtils';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  theme: PaintPressureTheme;
  force: number;
  targetForce: number;
  holdProgress: number;
  strokeProgress: number;
  stroking: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  completedRounds: number;
  paintColor: string;
  paintHex: string;
  leftHand: { x: number; y: number } | null;
  rightHand: { x: number; y: number } | null;
  banner: string;
  quality: number;
};

export function PaintOverlay({
  theme,
  force,
  targetForce,
  holdProgress,
  strokeProgress,
  stroking,
  roundActive,
  round,
  totalRounds,
  completedRounds,
  paintColor,
  paintHex,
  leftHand,
  rightHand,
  banner,
  quality,
}: Props) {
  const paletteBob = useSharedValue(0);
  const brushWiggle = useSharedValue(0);

  useEffect(() => {
    paletteBob.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [paletteBob]);

  useEffect(() => {
    if (force > 0.12 && roundActive) {
      brushWiggle.value = withRepeat(
        withSequence(withTiming(1, { duration: 150 }), withTiming(-1, { duration: 150 })),
        -1,
        true,
      );
    } else {
      brushWiggle.value = withTiming(0, { duration: 200 });
    }
  }, [force, roundActive, brushWiggle]);

  const decorStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -3 + paletteBob.value * 6 }],
    opacity: 0.28 + paletteBob.value * 0.15,
  }));

  const brushStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${brushWiggle.value * 8}deg` }],
  }));

  const pressurePct = Math.round(force * 100);
  const targetPct = Math.round(targetForce * 100);
  const atTarget = force >= targetForce * 0.9;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`art-${i}`}
          style={[styles.decor, decorStyle, { left: `${5 + (i * 19) % 86}%`, top: `${4 + (i % 3) * 10}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      {leftHand && (
        <View
          style={[
            styles.handDot,
            { left: `${leftHand.x * 100}%`, top: `${leftHand.y * 100}%`, borderColor: theme.accent },
          ]}
        >
          <Text style={styles.handLabel}>L</Text>
        </View>
      )}
      {rightHand && (
        <View
          style={[
            styles.handDot,
            { left: `${rightHand.x * 100}%`, top: `${rightHand.y * 100}%`, borderColor: theme.brush },
          ]}
        >
          <Text style={styles.handLabel}>R</Text>
        </View>
      )}

      <View style={styles.gaugeWrap}>
        <Text style={styles.gaugeLabel}>
          BRUSH {pressurePct}% · GRADE {targetPct}%
        </Text>
        <View style={styles.gaugeTrack}>
          <LinearGradient
            colors={atTarget ? ['#34D399', '#10B981'] : [theme.accent, theme.accentDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gaugeFill, { width: `${Math.min(100, pressurePct)}%` }]}
          />
          <View style={[styles.targetMark, { left: `${targetPct}%` }]} />
        </View>
        <View style={styles.gaugeRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={styles.roundText}>
            Stroke {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      {/* Easel + canvas */}
      <View style={styles.studioWrap}>
        <View style={styles.easelLegL} />
        <View style={styles.easelLegR} />

        <View style={[styles.canvas, { backgroundColor: theme.canvas, borderColor: theme.brush }]}>
          <View style={styles.canvasGrid}>
            {CANVAS_PAINT_CELLS.map((c, i) => {
              const done = i < completedRounds;
              const active = i === round && roundActive;
              const hex = theme.paintHex[i % theme.paintHex.length]!;
              return (
                <View
                  key={i}
                  style={[
                    styles.paintCell,
                    {
                      borderColor: active ? (atTarget ? PAINT_SHELL.good : theme.accent) : 'rgba(0,0,0,0.08)',
                      borderWidth: active ? 3 : 1,
                      backgroundColor: done ? hex : active ? hex : '#F5F5F4',
                      opacity: done ? 1 : active && stroking ? 0.35 + strokeProgress * 0.65 : active ? 0.4 : 1,
                    },
                  ]}
                >
                  {done && <Text style={styles.cellEmoji}>{theme.paintColors[i % theme.paintColors.length]}</Text>}
                  {active && !done && !stroking && (
                    <Text style={styles.cellHint}>{paintColor}</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Brush */}
        <Animated.View style={[styles.brushWrap, brushStyle]}>
          <LinearGradient colors={[theme.brush, '#D97706']} style={styles.brushHandle}>
            <Text style={styles.brushEmoji}>🖌️</Text>
          </LinearGradient>
          {(roundActive || stroking) && atTarget && (
            <View style={[styles.paintTip, { backgroundColor: paintHex }]} />
          )}
        </Animated.View>

        {roundActive && atTarget && !stroking && (
          <View style={styles.holdRing}>
            <LinearGradient
              colors={[theme.accent, PAINT_SHELL.good]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.holdFill, { width: `${holdProgress * 100}%` }]}
            />
          </View>
        )}

        {stroking && (
          <Text style={styles.strokeText}>PAINTING… {Math.round(strokeProgress * 100)}%</Text>
        )}
      </View>

      {/* Palette strip */}
      <View style={styles.palette}>
        {theme.paintHex.slice(0, 5).map((hex, i) => (
          <View key={i} style={[styles.paletteDot, { backgroundColor: hex, opacity: i === round % 5 ? 1 : 0.5 }]} />
        ))}
      </View>

      {banner ? (
        <View style={[styles.banner, { backgroundColor: theme.accentDeep }]}>
          <Text style={styles.bannerText}>{banner}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  decor: { position: 'absolute', fontSize: 20 },
  handDot: {
    position: 'absolute',
    width: 30,
    height: 30,
    marginLeft: -15,
    marginTop: -15,
    borderRadius: 10,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  handLabel: { fontSize: 10, fontWeight: '900', color: '#1E3A5F' },
  gaugeWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(15,23,42,0.88)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.35)',
  },
  gaugeLabel: { color: '#F0F9FF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  gaugeTrack: {
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginTop: 6,
    overflow: 'visible',
  },
  gaugeFill: { height: '100%', borderRadius: 7 },
  targetMark: {
    position: 'absolute',
    top: -3,
    width: 3,
    height: 20,
    marginLeft: -1,
    backgroundColor: PAINT_SHELL.gold,
    borderRadius: 2,
  },
  gaugeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  qualityText: { color: '#BAE6FD', fontSize: 11, fontWeight: '700' },
  roundText: { color: PAINT_SHELL.gold, fontSize: 11, fontWeight: '800' },
  studioWrap: {
    position: 'absolute',
    bottom: '11%',
    alignSelf: 'center',
    alignItems: 'center',
    width: 220,
  },
  easelLegL: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    width: 4,
    height: 40,
    backgroundColor: '#92400E',
    transform: [{ rotate: '-12deg' }],
    borderRadius: 2,
  },
  easelLegR: {
    position: 'absolute',
    bottom: 0,
    right: 24,
    width: 4,
    height: 40,
    backgroundColor: '#92400E',
    transform: [{ rotate: '12deg' }],
    borderRadius: 2,
  },
  canvas: {
    width: 200,
    height: 110,
    borderRadius: 6,
    borderWidth: 3,
    padding: 6,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  canvasGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  paintCell: {
    width: '23%',
    height: '46%',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellEmoji: { fontSize: 16 },
  cellHint: { fontSize: 18, opacity: 0.7 },
  brushWrap: { position: 'absolute', top: -36, right: -8, alignItems: 'center' },
  brushHandle: {
    width: 40,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brushEmoji: { fontSize: 20 },
  paintTip: { width: 10, height: 14, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, marginTop: -2 },
  holdRing: {
    marginTop: 12,
    width: 150,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', borderRadius: 4 },
  strokeText: { color: PAINT_SHELL.gold, fontSize: 13, fontWeight: '900', marginTop: 8 },
  palette: {
    position: 'absolute',
    bottom: '4%',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(15,23,42,0.75)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  paletteDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#fff' },
  banner: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bannerText: { color: '#fff', fontSize: 18, fontWeight: '900' },
});
