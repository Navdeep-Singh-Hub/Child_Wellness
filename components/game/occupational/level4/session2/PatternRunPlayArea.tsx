/**
 * Neon circuit-track backdrop for Pattern Run (OT L4 S2 Game 5).
 */
import {
  PATTERN_RUN_THEME as T,
  PATTERN_RUN_VARIANT_EMOJI,
} from '@/components/game/occupational/level4/session2/session2Theme';
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
  roundActive: boolean;
  variantLabel: string;
  finishKey: number;
};

const GRID_ROWS = 5;
const GRID_COLS = 8;

export const PatternRunPlayArea: React.FC<Props> = ({ roundActive, variantLabel, finishKey }) => {
  const neonPulse = useSharedValue(0.4);
  const finishGlow = useSharedValue(0.5);
  const scanY = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    neonPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.25, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    finishGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 650 }), withTiming(0.35, { duration: 650 })),
      -1,
      true,
    );
    scanY.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.linear }),
      -1,
      false,
    );
  }, [roundActive, neonPulse, finishGlow, scanY]);

  useEffect(() => {
    if (!finishKey) return;
    finishGlow.value = withSequence(
      withSpring(1.5, { damping: 5, stiffness: 200 }),
      withTiming(0.5, { duration: 500 }),
    );
  }, [finishKey, finishGlow]);

  const neonStyle = useAnimatedStyle(() => ({ opacity: 0.2 + neonPulse.value * 0.45 }));
  const finishStyle = useAnimatedStyle(() => ({ opacity: 0.3 + finishGlow.value * 0.55 }));
  const scanStyle = useAnimatedStyle(() => ({
    top: `${scanY.value * 88}%`,
    opacity: 0.06 + neonPulse.value * 0.04,
  }));

  const variantEmoji = PATTERN_RUN_VARIANT_EMOJI[variantLabel] ?? '📐';

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.circuitDark, '#1E0A3C', '#2E1065']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {Array.from({ length: GRID_ROWS }).map((_, r) => (
        <View
          key={`row-${r}`}
          style={[styles.gridH, { top: `${12 + r * (76 / GRID_ROWS)}%` }]}
        />
      ))}
      {Array.from({ length: GRID_COLS }).map((_, c) => (
        <View
          key={`col-${c}`}
          style={[styles.gridV, { left: `${6 + c * (88 / GRID_COLS)}%` }]}
        />
      ))}

      <Animated.View style={[styles.scanLine, scanStyle]} pointerEvents="none" />

      <View style={styles.startGate}>
        <Animated.View style={[styles.gateGlow, neonStyle]} />
        <Text style={styles.gateLabel}>START</Text>
        <Text style={styles.gateChevron}>▶▶</Text>
      </View>

      <View style={styles.finishArch}>
        <Animated.View style={[styles.finishGlow, finishStyle]} />
        <Text style={styles.finishFlag}>🏁</Text>
        <Text style={styles.finishLabel}>FINISH</Text>
        <View style={styles.checkerRow}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={`chk-${i}`}
              style={[styles.checker, { backgroundColor: i % 2 === 0 ? '#fff' : '#111' }]}
            />
          ))}
        </View>
      </View>

      {variantLabel ? (
        <View style={styles.variantBadge}>
          <Text style={styles.variantEmoji}>{variantEmoji}</Text>
          <Text style={styles.variantText}>{variantLabel} RUN</Text>
        </View>
      ) : null}

      <View style={styles.circuitDots}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Animated.View
            key={`dot-${i}`}
            style={[
              styles.circuitDot,
              neonStyle,
              { backgroundColor: i % 2 === 0 ? T.accent : T.accentPink },
            ]}
          />
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  gridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: T.gridLine,
  },
  gridV: {
    position: 'absolute',
    top: '10%',
    bottom: '10%',
    width: 1,
    backgroundColor: T.gridLine,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: T.accent,
  },
  startGate: {
    position: 'absolute',
    right: '5%',
    top: '22%',
    width: '22%',
    height: '56%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.accentPink,
    borderRadius: 12,
    backgroundColor: 'rgba(236,72,153,0.1)',
    overflow: 'hidden',
  },
  gateGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.accentPink,
  },
  gateLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.accent,
    zIndex: 2,
  },
  gateChevron: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '900',
    color: T.accentGold,
    zIndex: 2,
  },
  finishArch: {
    position: 'absolute',
    left: '4%',
    top: '20%',
    width: '24%',
    height: '60%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.finishGreen,
    borderRadius: 14,
    backgroundColor: 'rgba(74,222,128,0.08)',
    overflow: 'hidden',
  },
  finishGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.finishGreen,
  },
  finishFlag: { fontSize: 28, zIndex: 2 },
  finishLabel: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.finishGreen,
    zIndex: 2,
  },
  checkerRow: {
    flexDirection: 'row',
    marginTop: 8,
    zIndex: 2,
  },
  checker: {
    width: 8,
    height: 8,
  },
  variantBadge: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    left: '30%',
    right: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(34,211,238,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.35)',
  },
  variantEmoji: { fontSize: 14 },
  variantText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: T.accent,
  },
  circuitDots: {
    position: 'absolute',
    left: '28%',
    right: '28%',
    bottom: '12%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circuitDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    shadowColor: T.accent,
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
