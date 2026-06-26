/** Position Match overlay — OT L9 S3 Game 5 (precision joint grid) */
import type { PositionMatchTheme } from '@/components/game/occupational/level9/session3/jointTheme';
import { POSITION_SHELL } from '@/components/game/occupational/level9/session3/jointTheme';
import { FullBodyFigure } from '@/components/game/occupational/level9/session3/components/FullBodyFigure';
import type { AxisPositionScore, PositionMatchTarget } from '@/components/game/occupational/level9/session3/jointUtils';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Marker = { x: number; y: number } | null;

type Props = {
  theme: PositionMatchTheme;
  target: PositionMatchTarget;
  axes: AxisPositionScore[];
  matchScore: number;
  matched: boolean;
  holdProgress: number;
  lockProgress: number;
  locking: boolean;
  previewing: boolean;
  roundActive: boolean;
  round: number;
  totalRounds: number;
  lockedCount: number;
  markers: {
    leftElbow: Marker;
    rightElbow: Marker;
    leftWrist: Marker;
    rightWrist: Marker;
    leftKnee: Marker;
    rightKnee: Marker;
    leftAnkle: Marker;
    rightAnkle: Marker;
  };
  banner: string;
  quality: number;
};

function GridMeter({
  axis,
  accent,
  grid,
}: {
  axis: AxisPositionScore;
  accent: string;
  grid: string;
}) {
  const aPct = Math.round(axis.actual * 100);
  const tPct = Math.round(axis.target * 100);
  const good = axis.accuracy >= 0.84;
  return (
    <View style={[styles.meterBlock, axis.focused && styles.meterFocused]}>
      <Text style={[styles.meterLabel, axis.focused && styles.meterLabelFocus]}>
        {axis.focused ? '★ ' : ''}
        {axis.label} {aPct}% → {tPct}%
      </Text>
      <View style={styles.meterTrack}>
        <View
          style={[
            styles.meterFill,
            {
              width: `${aPct}%`,
              backgroundColor: good ? POSITION_SHELL.good : axis.focused ? accent : 'rgba(255,255,255,0.25)',
            },
          ]}
        />
        <View style={[styles.targetTick, { left: `${tPct}%`, backgroundColor: axis.focused ? grid : 'rgba(255,255,255,0.5)' }]} />
      </View>
    </View>
  );
}

export function PositionMatchOverlay({
  theme,
  target,
  axes,
  matchScore,
  matched,
  holdProgress,
  lockProgress,
  locking,
  previewing,
  roundActive,
  round,
  totalRounds,
  lockedCount,
  markers,
  banner,
  quality,
}: Props) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + pulse.value * 0.45,
  }));

  const figurePose = {
    ...target,
    leftRaise: axes.find((a) => a.axis === 'leftRaise')?.actual ?? target.leftRaise,
    rightRaise: axes.find((a) => a.axis === 'rightRaise')?.actual ?? target.rightRaise,
    leftElbow: axes.find((a) => a.axis === 'leftElbow')?.actual ?? target.leftElbow,
    rightElbow: axes.find((a) => a.axis === 'rightElbow')?.actual ?? target.rightElbow,
    leftLift: axes.find((a) => a.axis === 'leftLift')?.actual ?? target.leftLift,
    rightLift: axes.find((a) => a.axis === 'rightLift')?.actual ?? target.rightLift,
    leftKnee: axes.find((a) => a.axis === 'leftKnee')?.actual ?? target.leftKnee,
    rightKnee: axes.find((a) => a.axis === 'rightKnee')?.actual ?? target.rightKnee,
  };

  const jointDots = [
    markers.leftElbow,
    markers.rightElbow,
    markers.leftWrist,
    markers.rightWrist,
    markers.leftKnee,
    markers.rightKnee,
    markers.leftAnkle,
    markers.rightAnkle,
  ];

  const focusedCount = target.focus.length;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {theme.decor.map((d, i) => (
        <Animated.Text
          key={`grid-${i}`}
          style={[styles.decor, pulseStyle, { left: `${3 + (i * 15) % 90}%`, top: `${2 + (i % 4) * 7}%` }]}
        >
          {d}
        </Animated.Text>
      ))}

      {jointDots.map((m, i) =>
        m ? (
          <View
            key={`jd-${i}`}
            style={[
              styles.jointDot,
              { left: `${m.x * 100}%`, top: `${m.y * 100}%`, backgroundColor: i < 4 ? theme.grid : theme.accent },
            ]}
          />
        ) : null,
      )}

      <View style={styles.hudWrap}>
        <Text style={styles.hudTitle}>
          {target.name.toUpperCase()} · GRID {Math.round(matchScore * 100)}%
        </Text>
        <Text style={styles.focusLine}>
          🔒 Lock {focusedCount} joint{focusedCount > 1 ? 's' : ''}: {target.focus.map((f) => f.replace(/([A-Z])/g, ' $1').trim()).join(' · ')}
        </Text>
        <View style={styles.hudRow}>
          <Text style={styles.qualityText}>Quality {Math.round(quality * 100)}%</Text>
          <Text style={[styles.statusBadge, { color: matched ? POSITION_SHELL.good : theme.grid }]}>
            {matched ? 'LOCKED' : previewing ? 'PREVIEW' : 'MATCH'}
          </Text>
          <Text style={styles.roundText}>
            Grid {round + 1}/{totalRounds}
          </Text>
        </View>
      </View>

      <View style={styles.lockRow}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <Text key={i} style={[styles.lockDot, { opacity: i < lockedCount ? 1 : 0.25 }]}>
            {i < lockedCount ? theme.locks[i % theme.locks.length] : '·'}
          </Text>
        ))}
      </View>

      <View style={styles.gridPanel}>
        {axes.map((axis) => (
          <GridMeter key={axis.axis} axis={axis} accent={theme.accent} grid={theme.grid} />
        ))}
      </View>

      {!previewing && (
        <View style={styles.figureWrap}>
          <FullBodyFigure
            pose={figurePose}
            accent={matched ? POSITION_SHELL.good : theme.accentDeep}
            jointColor={theme.grid}
            label="YOU"
            compact
            matched={matched}
          />
        </View>
      )}

      {previewing && (
        <View style={styles.figureWrap}>
          <FullBodyFigure pose={target} accent={theme.accent} jointColor={theme.grid} label="TARGET" compact />
        </View>
      )}

      {roundActive && matched && !locking && (
        <View style={styles.holdRing}>
          <LinearGradient
            colors={[POSITION_SHELL.gold, POSITION_SHELL.good]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.holdFill, { width: `${holdProgress * 100}%` }]}
          />
        </View>
      )}
      {locking && (
        <Text style={styles.lockText}>CALIBRATING {Math.round(lockProgress * 100)}%</Text>
      )}

      {banner ? (
        <View style={[styles.banner, { backgroundColor: matched ? POSITION_SHELL.good : theme.accentDeep }]}>
          <Text style={styles.bannerText}>{banner}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  decor: { position: 'absolute', fontSize: 17 },
  jointDot: {
    position: 'absolute',
    width: 11,
    height: 11,
    marginLeft: -5,
    marginTop: -5,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
  },
  hudWrap: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(120,53,15,0.92)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.35)',
  },
  hudTitle: { color: '#FFFBEB', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  focusLine: { color: '#FDE68A', fontSize: 8, fontWeight: '700', marginTop: 4 },
  hudRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  qualityText: { color: '#FBBF24', fontSize: 11, fontWeight: '700' },
  statusBadge: { marginLeft: 'auto', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  roundText: { color: POSITION_SHELL.gold, fontSize: 11, fontWeight: '800' },
  lockRow: {
    position: 'absolute',
    top: 88,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(120,53,15,0.55)',
    borderRadius: 16,
  },
  lockDot: { fontSize: 14 },
  gridPanel: {
    position: 'absolute',
    top: '18%',
    left: 8,
    right: 8,
    backgroundColor: 'rgba(28,25,23,0.65)',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(253,230,138,0.25)',
    gap: 4,
  },
  meterBlock: { opacity: 0.55 },
  meterFocused: { opacity: 1 },
  meterLabel: { color: '#D6D3D1', fontSize: 7, fontWeight: '700' },
  meterLabelFocus: { color: '#FDE68A', fontWeight: '900' },
  meterTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginTop: 2,
    overflow: 'visible',
  },
  meterFill: { height: '100%', borderRadius: 3 },
  targetTick: {
    position: 'absolute',
    top: -2,
    width: 3,
    height: 10,
    marginLeft: -1,
    borderRadius: 1,
  },
  figureWrap: {
    position: 'absolute',
    bottom: '12%',
    alignSelf: 'center',
  },
  holdRing: {
    position: 'absolute',
    bottom: '8%',
    alignSelf: 'center',
    width: 120,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  holdFill: { height: '100%', borderRadius: 4 },
  lockText: {
    position: 'absolute',
    bottom: '5%',
    alignSelf: 'center',
    color: POSITION_SHELL.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  banner: {
    position: 'absolute',
    top: '52%',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bannerText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
