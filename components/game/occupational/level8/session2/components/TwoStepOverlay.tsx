/**
 * TwoStepOverlay — draws the two-step plan (Step 1 → Step 2), the active step
 * prompt, any reach target + live cursor, and the accuracy / flow meters over
 * the camera stage. All positions are normalized (0..1) screen coordinates.
 */
import type { Anchor, Step, TwoStepGameTheme } from '@/components/game/occupational/level8/session2/twoStepTheme';
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
const CURSOR = 34;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const pctLeft = (x: number) => `${clamp01(x) * 100}%` as const;
const pctTop = (y: number) => `${clamp01(y) * 100}%` as const;

type Props = {
  theme: TwoStepGameTheme;
  step1: Step;
  step2: Step;
  stepIndex: 0 | 1;
  targeted: boolean;
  target: Anchor | null;
  roundActive: boolean;
  handPos: Anchor | null;
  progress: number; // 0..1 toward completing the active step
  near: boolean;
  accuracy: number;
  quality: number;
  round: number;
  totalRounds: number;
  banner: string;
};

const StepChip: React.FC<{ step: Step; n: number; state: 'done' | 'active' | 'pending'; accent: string }> = ({
  step,
  n,
  state,
  accent,
}) => (
  <View
    style={[
      styles.chip,
      state === 'active' && { borderColor: accent, backgroundColor: 'rgba(255,255,255,0.16)' },
      state === 'done' && { borderColor: '#34D399', backgroundColor: 'rgba(52,211,153,0.2)' },
      state === 'pending' && { borderColor: 'rgba(255,255,255,0.25)' },
    ]}
  >
    <Text style={styles.chipNum}>{state === 'done' ? '✓' : n}</Text>
    <Text style={styles.chipIcon}>{step.icon}</Text>
    <Text style={styles.chipLabel}>{step.label}</Text>
  </View>
);

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

export const TwoStepOverlay: React.FC<Props> = ({
  theme,
  step1,
  step2,
  stepIndex,
  targeted,
  target,
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
  const activeStep = stepIndex === 0 ? step1 : step2;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Step plan chips */}
      <View style={styles.planRow}>
        <StepChip step={step1} n={1} state={stepIndex === 0 ? 'active' : 'done'} accent={theme.accent} />
        <Text style={styles.arrow}>→</Text>
        <StepChip step={step2} n={2} state={stepIndex === 1 ? 'active' : 'pending'} accent={theme.accent} />
      </View>

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
      {roundActive && !targeted && (
        <View style={styles.promptWrap} pointerEvents="none">
          <View style={[styles.promptCard, { borderColor: theme.accent }]}>
            <Text style={styles.promptIcon}>{activeStep.icon}</Text>
            <Text style={styles.promptLabel}>{activeStep.label.toUpperCase()}!</Text>
            <View style={styles.promptTrack}>
              <View style={[styles.promptFill, { width: `${Math.round(clamp01(progress) * 100)}%`, backgroundColor: theme.accent }]} />
            </View>
          </View>
        </View>
      )}

      {/* Reach target (targeted steps) */}
      {roundActive && targeted && target && (
        <TargetMarker anchor={target} emoji={activeStep.icon} accent={theme.accent} glow={theme.glow} near={near} progress={progress} />
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
  planRow: { position: 'absolute', top: 12, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  chipNum: { color: '#fff', fontSize: 12, fontWeight: '900' },
  chipIcon: { fontSize: 16 },
  chipLabel: { color: '#fff', fontSize: 12, fontWeight: '800' },
  arrow: { color: '#fff', fontSize: 18, fontWeight: '900' },
  bannerWrap: { position: 'absolute', top: 58, alignSelf: 'center', width: '100%', alignItems: 'center' },
  banner: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 18, borderWidth: 2 },
  bannerText: { color: '#fff', fontSize: 15, fontWeight: '900', textAlign: 'center', letterSpacing: 0.3 },
  promptWrap: { position: 'absolute', top: '34%', alignSelf: 'center', alignItems: 'center' },
  promptCard: {
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingVertical: 16,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: 'rgba(15,23,42,0.55)',
    minWidth: 180,
  },
  promptIcon: { fontSize: 52 },
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
  markerEmoji: { fontSize: 34 },
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
  meterLabel: { color: '#FBCFE8', fontSize: 10, fontWeight: '900', letterSpacing: 1, width: 40 },
  meterTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(15,23,42,0.7)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(253,164,175,0.25)',
  },
  meterFill: { height: '100%', borderRadius: 5 },
});

export default TwoStepOverlay;
