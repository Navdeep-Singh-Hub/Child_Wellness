/**
 * AdventureOverlay — expedition trail (beat markers + path), step chips for
 * multi-step beats, active mission cue, and accuracy / flow meters.
 */
import type { Anchor } from '@/components/game/occupational/level8/motorActions';
import type { ObstacleGate } from '@/components/game/occupational/level8/session6/obstacleNav';
import type { AdventureGameTheme } from '@/components/game/occupational/level8/session10/adventureTheme';
import { ADVENTURE_SHELL } from '@/components/game/occupational/level8/session10/adventureTheme';
import type { BeatStepChip } from '@/components/game/occupational/level8/session10/praxisAdventure';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const NODE = 58;
const CURSOR = 28;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const pct = (v: number) => `${clamp01(v) * 100}%` as const;

type Props = {
  theme: AdventureGameTheme;
  trail: ObstacleGate[];
  beatIndex: number;
  stepIndex: number;
  stepChips: BeatStepChip[];
  beatActive: boolean;
  cleared: boolean;
  progress: number;
  handPos: Anchor | null;
  beatAnchor: Anchor | null;
  accuracy: number;
  quality: number;
  completedBeats: number;
  totalBeats: number;
  banner: string;
};

const TrailNode: React.FC<{
  gate: ObstacleGate;
  state: 'done' | 'active' | 'pending';
  accent: string;
}> = ({ gate, state, accent }) => (
  <View
    style={[
      styles.node,
      state === 'active' && { borderColor: accent, backgroundColor: 'rgba(255,255,255,0.2)', transform: [{ scale: 1.1 }] },
      state === 'done' && { borderColor: '#34D399', backgroundColor: 'rgba(52,211,153,0.25)' },
      state === 'pending' && { borderColor: 'rgba(255,255,255,0.25)' },
    ]}
  >
    <Text style={styles.nodeIcon}>{state === 'done' ? '✓' : gate.icon}</Text>
  </View>
);

const StepChip: React.FC<{ chip: BeatStepChip; n: number; state: 'done' | 'active' | 'pending'; accent: string }> = ({
  chip,
  n,
  state,
  accent,
}) => (
  <View
    style={[
      styles.chip,
      state === 'active' && { borderColor: accent, backgroundColor: 'rgba(255,255,255,0.18)' },
      state === 'done' && { borderColor: '#34D399', backgroundColor: 'rgba(52,211,153,0.2)' },
      state === 'pending' && { borderColor: 'rgba(255,255,255,0.22)' },
    ]}
  >
    <Text style={styles.chipNum}>{state === 'done' ? '✓' : n}</Text>
    <Text style={styles.chipIcon}>{chip.icon}</Text>
  </View>
);

const BeatTarget: React.FC<{ anchor: Anchor; icon: string; accent: string; near: boolean; progress: number }> = ({
  anchor,
  icon,
  accent,
  near,
  progress,
}) => {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.12, { duration: 580, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse]);
  const core = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  return (
    <View style={[styles.targetWrap, { left: pct(anchor.x), top: pct(anchor.y), marginLeft: -NODE / 2, marginTop: -NODE / 2 }]}>
      <View style={[styles.targetRing, { borderColor: near ? '#34D399' : accent, opacity: 0.35 + progress * 0.5 }]} />
      <Animated.View style={[styles.targetCore, core, { borderColor: accent }]}>
        <Text style={styles.targetIcon}>{icon}</Text>
      </Animated.View>
    </View>
  );
};

export const AdventureOverlay: React.FC<Props> = ({
  theme,
  trail,
  beatIndex,
  stepIndex,
  stepChips,
  beatActive,
  cleared,
  progress,
  handPos,
  beatAnchor,
  accuracy,
  quality,
  completedBeats,
  totalBeats,
  banner,
}) => {
  const active = trail[beatIndex] ?? null;
  const multiStep = stepChips.length > 1;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {trail.map((g, i) => {
        if (i === 0) return null;
        const prev = trail[i - 1]!;
        const done = i <= beatIndex;
        return (
          <View
            key={`seg-${i}`}
            style={[
              styles.segment,
              {
                left: pct(Math.min(prev.anchor.x, g.anchor.x)),
                top: pct(Math.min(prev.anchor.y, g.anchor.y)),
                width: `${Math.abs(g.anchor.x - prev.anchor.x) * 100 + 2}%`,
                height: `${Math.abs(g.anchor.y - prev.anchor.y) * 100 + 2}%`,
                borderColor: done ? '#34D399' : ADVENTURE_SHELL.pathLine,
              },
            ]}
          />
        );
      })}

      {trail.map((g, i) => (
        <View
          key={g.id}
          style={[styles.nodeWrap, { left: pct(g.anchor.x), top: pct(g.anchor.y), marginLeft: -NODE / 2, marginTop: -NODE / 2 }]}
        >
          <TrailNode gate={g} accent={theme.accent} state={i < beatIndex ? 'done' : i === beatIndex ? 'active' : 'pending'} />
        </View>
      ))}

      {beatActive && beatAnchor && (
        <BeatTarget anchor={beatAnchor} icon={active?.icon ?? theme.emoji} accent={theme.accent} near={cleared} progress={progress} />
      )}

      {handPos && beatActive && (
        <View style={[styles.cursor, { left: pct(handPos.x), top: pct(handPos.y), marginLeft: -CURSOR / 2, marginTop: -CURSOR / 2 }]}>
          <Text style={styles.cursorEmoji}>✋</Text>
        </View>
      )}

      {multiStep && (
        <View style={styles.chipRow}>
          {stepChips.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Text style={styles.arrow}>→</Text>}
              <StepChip chip={c} n={i + 1} accent={theme.accent} state={i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'pending'} />
            </React.Fragment>
          ))}
        </View>
      )}

      {active && (
        <View style={styles.cueWrap}>
          <View style={[styles.cueCard, { borderColor: cleared ? '#34D399' : theme.accent }]}>
            <Text style={styles.cueIcon}>{active.icon}</Text>
            <Text style={styles.cueName}>{active.name}</Text>
          </View>
        </View>
      )}

      {!!banner && (
        <View style={styles.bannerWrap}>
          <View style={[styles.banner, { borderColor: theme.accent, backgroundColor: beatActive ? 'rgba(52,211,153,0.2)' : 'rgba(15,23,42,0.7)' }]}>
            <Text style={styles.bannerText}>{banner}</Text>
          </View>
        </View>
      )}

      {cleared && beatActive && (
        <View style={styles.clearWrap}>
          <Text style={styles.clearText}>✓ Mission done!</Text>
        </View>
      )}

      <View style={styles.meterPanel}>
        <View style={styles.pipRow}>
          {Array.from({ length: totalBeats }, (_, i) => (
            <View
              key={i}
              style={[styles.pip, i < completedBeats ? { backgroundColor: '#34D399', borderColor: '#34D399' } : { borderColor: theme.accent }]}
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
  segment: { position: 'absolute', borderWidth: 3, borderStyle: 'dashed', borderRadius: 8 },
  nodeWrap: { position: 'absolute', width: NODE, height: NODE },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
  nodeIcon: { fontSize: 24 },
  targetWrap: { position: 'absolute', width: NODE + 16, height: NODE + 16, alignItems: 'center', justifyContent: 'center' },
  targetRing: { position: 'absolute', width: NODE + 14, height: NODE + 14, borderRadius: (NODE + 14) / 2, borderWidth: 3 },
  targetCore: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 4,
    backgroundColor: 'rgba(15,23,42,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetIcon: { fontSize: 28 },
  cursor: {
    position: 'absolute',
    width: CURSOR,
    height: CURSOR,
    borderRadius: CURSOR / 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#34D399',
  },
  cursorEmoji: { fontSize: 14 },
  chipRow: { position: 'absolute', top: 52, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6 },
  chip: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(15,23,42,0.55)',
    minWidth: 44,
  },
  chipNum: { color: '#FDE68A', fontSize: 9, fontWeight: '900' },
  chipIcon: { fontSize: 20 },
  arrow: { color: '#FDE68A', fontSize: 14, fontWeight: '900' },
  cueWrap: { position: 'absolute', top: 8, alignSelf: 'center' },
  cueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 3,
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  cueIcon: { fontSize: 22 },
  cueName: { color: '#fff', fontSize: 16, fontWeight: '900' },
  bannerWrap: { position: 'absolute', top: '56%', alignSelf: 'center', width: '100%', alignItems: 'center' },
  banner: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 18, borderWidth: 2, maxWidth: '92%' },
  bannerText: { color: '#fff', fontSize: 14, fontWeight: '900', textAlign: 'center' },
  clearWrap: { position: 'absolute', top: '48%', alignSelf: 'center' },
  clearText: { color: '#34D399', fontSize: 18, fontWeight: '900' },
  meterPanel: { position: 'absolute', bottom: 10, alignSelf: 'center', width: '88%', alignItems: 'center', gap: 5 },
  pipRow: { flexDirection: 'row', gap: 6, marginBottom: 2, flexWrap: 'wrap', justifyContent: 'center' },
  pip: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, backgroundColor: 'rgba(15,23,42,0.6)' },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  meterLabel: { color: '#FDE68A', fontSize: 10, fontWeight: '900', letterSpacing: 1, width: 40 },
  meterTrack: {
    flex: 1,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(15,23,42,0.7)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(252,211,77,0.25)',
  },
  meterFill: { height: '100%', borderRadius: 5 },
});

export default AdventureOverlay;
