/**
 * MultiStepOverlay — draws the ordered action chain (a row of step chips), the
 * active step prompt, any reach target + live cursor, and the accuracy / flow
 * meters over the camera stage. All positions are normalized (0..1) screen
 * coordinates.
 */
import type { Anchor, Step } from '@/components/game/occupational/level8/motorActions';
import type { SeqGameTheme } from '@/components/game/occupational/level8/session3/seqTheme';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const MARKER = 76;
const CURSOR = 34;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const pctLeft = (x: number) => `${clamp01(x) * 100}%` as const;
const pctTop = (y: number) => `${clamp01(y) * 100}%` as const;

type Props = {
  theme: SeqGameTheme;
  steps: Step[];
  currentIndex: number;
  roundActive: boolean;
  handPos: Anchor | null;
  progress: number;
  near: boolean;
  accuracy: number;
  quality: number;
  round: number;
  totalRounds: number;
  banner: string;
};

const ChainChip: React.FC<{ step: Step; n: number; state: 'done' | 'active' | 'pending'; accent: string }> = ({
  step,
  n,
  state,
  accent,
}) => {
  const color = step.color ?? accent;
  return (
    <View
      style={[
        styles.chip,
        state === 'active' && { borderColor: color, backgroundColor: 'rgba(255,255,255,0.18)' },
        state === 'done' && { borderColor: '#34D399', backgroundColor: 'rgba(52,211,153,0.2)' },
        state === 'pending' && { borderColor: 'rgba(255,255,255,0.22)' },
      ]}
    >
      <Text style={styles.chipNum}>{state === 'done' ? '✓' : n}</Text>
      <Text style={styles.chipIcon}>{step.icon}</Text>
    </View>
  );
};

const TargetMarker: React.FC<{
  anchor: Anchor;
  emoji: string;
  accent: string;
  glow: string;
  near: boolean;
  progress: number;
}> = ({ anchor, emoji, accent, glow, near, progress }) => {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.15, { duration: 620, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse]);
  const coreStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  return (
    <View
      style={[
        styles.markerWrap,
        { left: pctLeft(anchor.x), top: pctTop(anchor.y), marginLeft: -MARKER / 2, marginTop: -MARKER / 2 },
      ]}
      pointerEvents="none"
    >
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
        {near && progress > 0 ? (
          <View style={[styles.holdRing, { width: MARKER * progress, height: MARKER * progress }]} />
        ) : null}
        <Text style={styles.markerEmoji}>{emoji}</Text>
      </Animated.View>
    </View>
  );
};

export const MultiStepOverlay: React.FC<Props> = ({
  theme,
  steps,
  currentIndex,
  roundActive,
  handPos,
  progress,
  near,
  accuracy,
  quality,
  round,
  totalRounds,
  banner,
}) => {
  const pips = Array.from({ length: totalRounds }, (_, i) => i);
  const active = steps[currentIndex];
  const targeted = !!active?.targeted;
  const target = active?.anchor ?? null;
  const accent = active?.color ?? theme.accent;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Action chain chips */}
      <View style={styles.chainRow}>
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Text style={styles.arrow}>→</Text>}
            <ChainChip
              step={s}
              n={i + 1}
              state={i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'pending'}
              accent={theme.accent}
            />
          </React.Fragment>
        ))}
      </View>

      {/* Current action label */}
      {active && (
        <View style={styles.labelWrap}>
          <Text style={styles.stepLabel}>
            {currentIndex + 1}/{steps.length} · {active.label}
          </Text>
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

      {/* Active gesture prompt (non-targeted steps) */}
      {roundActive && active && !targeted && (
        <View style={styles.promptWrap} pointerEvents="none">
          <View style={[styles.promptCard, { borderColor: accent }]}>
            <Text style={styles.promptIcon}>{active.icon}</Text>
            <Text style={styles.promptLabel}>{active.label.toUpperCase()}!</Text>
            <View style={styles.promptTrack}>
              <View style={[styles.promptFill, { width: `${Math.round(clamp01(progress) * 100)}%`, backgroundColor: accent }]} />
            </View>
          </View>
        </View>
      )}

      {/* Reach target (targeted steps) */}
      {roundActive && targeted && target && (
        <TargetMarker anchor={target} emoji={active.icon} accent={accent} glow={theme.glow} near={near} progress={progress} />
      )}

      {/* Live reach cursor */}
      {roundActive && targeted && handPos && (
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
          <Text style={styles.cursorEmoji}>👆</Text>
        </View>
      )}

      {/* Bottom meters + round pips */}
      <View style={styles.meterPanel} pointerEvents="none">
        <View style={styles.pipRow}>
          {pips.map((i) => (
            <View
              key={i}
              style={[styles.pip, i < round ? { backgroundColor: '#34D399', borderColor: '#34D399' } : { borderColor: theme.accent }]}
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
  chainRow: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    maxWidth: '96%',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  chipNum: { color: '#fff', fontSize: 11, fontWeight: '900' },
  chipIcon: { fontSize: 15 },
  arrow: { color: '#fff', fontSize: 14, fontWeight: '900' },
  labelWrap: { position: 'absolute', top: 52, alignSelf: 'center' },
  stepLabel: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  bannerWrap: { position: 'absolute', top: 76, alignSelf: 'center', width: '100%', alignItems: 'center' },
  banner: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 18, borderWidth: 2, maxWidth: '94%' },
  bannerText: { color: '#fff', fontSize: 14, fontWeight: '900', textAlign: 'center', letterSpacing: 0.3 },
  promptWrap: { position: 'absolute', top: '36%', alignSelf: 'center', alignItems: 'center' },
  promptCard: {
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingVertical: 16,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: 'rgba(15,23,42,0.55)',
    minWidth: 180,
  },
  promptIcon: { fontSize: 50 },
  promptLabel: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 4, letterSpacing: 1 },
  promptTrack: {
    width: 150,
    height: 10,
    borderRadius: 5,
    marginTop: 10,
    backgroundColor: 'rgba(15,23,42,0.8)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  promptFill: { height: '100%', borderRadius: 5 },
  markerWrap: { position: 'absolute', width: MARKER, height: MARKER, alignItems: 'center', justifyContent: 'center' },
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
  markerEmoji: { fontSize: 32 },
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
  pip: { width: 15, height: 15, borderRadius: 8, borderWidth: 2, backgroundColor: 'rgba(15,23,42,0.6)' },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  meterLabel: { color: '#A7F3D0', fontSize: 10, fontWeight: '900', letterSpacing: 1, width: 40 },
  meterTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(15,23,42,0.7)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(110,231,183,0.25)',
  },
  meterFill: { height: '100%', borderRadius: 5 },
});

export default MultiStepOverlay;
