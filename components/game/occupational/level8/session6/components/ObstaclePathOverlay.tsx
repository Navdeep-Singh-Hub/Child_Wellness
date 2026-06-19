/**
 * ObstaclePathOverlay — draws the adventure trail (connecting line + gate markers),
 * the active obstacle prompt, a reach cursor when needed, and accuracy / flow
 * meters over the camera stage.
 */
import type { Anchor } from '@/components/game/occupational/level8/motorActions';
import { gateArrow, type ObstacleGate } from '@/components/game/occupational/level8/session6/obstacleNav';
import type { NavGameTheme } from '@/components/game/occupational/level8/session6/navTheme';
import { NAV_SHELL } from '@/components/game/occupational/level8/session6/navTheme';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const GATE = 64;
const CURSOR = 30;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const pct = (v: number) => `${clamp01(v) * 100}%` as const;

type Props = {
  theme: NavGameTheme;
  gates: ObstacleGate[];
  gateIndex: number;
  roundActive: boolean;
  cleared: boolean;
  progress: number;
  handPos: Anchor | null;
  accuracy: number;
  quality: number;
  round: number;
  totalRounds: number;
  banner: string;
};

const GateNode: React.FC<{
  gate: ObstacleGate;
  state: 'done' | 'active' | 'pending';
  accent: string;
}> = ({ gate, state, accent }) => (
  <View
    style={[
      styles.gate,
      state === 'active' && { borderColor: accent, backgroundColor: 'rgba(255,255,255,0.2)', transform: [{ scale: 1.12 }] },
      state === 'done' && { borderColor: '#34D399', backgroundColor: 'rgba(52,211,153,0.25)' },
      state === 'pending' && { borderColor: 'rgba(255,255,255,0.25)' },
    ]}
  >
    <Text style={styles.gateIcon}>{state === 'done' ? '✓' : gate.icon}</Text>
  </View>
);

const StepTarget: React.FC<{ anchor: Anchor; icon: string; accent: string; near: boolean; progress: number }> = ({
  anchor,
  icon,
  accent,
  near,
  progress,
}) => {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.14, { duration: 600, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse]);
  const core = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  return (
    <View style={[styles.targetWrap, { left: pct(anchor.x), top: pct(anchor.y), marginLeft: -GATE / 2, marginTop: -GATE / 2 }]}>
      <View style={[styles.targetRing, { borderColor: near ? '#34D399' : accent, opacity: 0.35 + progress * 0.5 }]} />
      <Animated.View style={[styles.targetCore, core, { borderColor: accent }]}>
        <Text style={styles.targetIcon}>{icon}</Text>
      </Animated.View>
    </View>
  );
};

export const ObstaclePathOverlay: React.FC<Props> = ({
  theme,
  gates,
  gateIndex,
  roundActive,
  cleared,
  progress,
  handPos,
  accuracy,
  quality,
  round,
  totalRounds,
  banner,
}) => {
  const active = gates[gateIndex] ?? null;
  const showTarget = active?.kind === 'step' && roundActive;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Trail segments */}
      {gates.map((g, i) => {
        if (i === 0) return null;
        const prev = gates[i - 1]!;
        const done = i <= gateIndex;
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
                borderColor: done ? '#34D399' : NAV_SHELL.pathLine,
              },
            ]}
          />
        );
      })}

      {/* Gate nodes on path */}
      {gates.map((g, i) => (
        <View
          key={g.id}
          style={[styles.gateWrap, { left: pct(g.anchor.x), top: pct(g.anchor.y), marginLeft: -GATE / 2, marginTop: -GATE / 2 }]}
        >
          <GateNode
            gate={g}
            accent={theme.accent}
            state={i < gateIndex ? 'done' : i === gateIndex ? 'active' : 'pending'}
          />
        </View>
      ))}

      {/* Active step target (larger) */}
      {showTarget && active && (
        <StepTarget anchor={active.anchor} icon={active.icon} accent={theme.accent} near={cleared} progress={progress} />
      )}

      {/* Hand cursor */}
      {handPos && roundActive && (
        <View style={[styles.cursor, { left: pct(handPos.x), top: pct(handPos.y), marginLeft: -CURSOR / 2, marginTop: -CURSOR / 2 }]}>
          <Text style={styles.cursorEmoji}>✋</Text>
        </View>
      )}

      {/* Active gate cue */}
      {active && (
        <View style={styles.cueWrap}>
          <View style={[styles.cueCard, { borderColor: cleared ? '#34D399' : theme.accent }]}>
            <Text style={styles.cueArrow}>{gateArrow(active.kind)}</Text>
            <Text style={styles.cueName}>{active.name}</Text>
          </View>
        </View>
      )}

      {!!banner && (
        <View style={styles.bannerWrap}>
          <View style={[styles.banner, { borderColor: theme.accent, backgroundColor: roundActive ? 'rgba(52,211,153,0.2)' : 'rgba(15,23,42,0.7)' }]}>
            <Text style={styles.bannerText}>{banner}</Text>
          </View>
        </View>
      )}

      {cleared && roundActive && (
        <View style={styles.clearWrap}>
          <Text style={styles.clearText}>✓ Gate cleared!</Text>
        </View>
      )}

      <View style={styles.meterPanel}>
        <View style={styles.pipRow}>
          {Array.from({ length: totalRounds }, (_, i) => (
            <View key={i} style={[styles.pip, i < round ? { backgroundColor: '#34D399', borderColor: '#34D399' } : { borderColor: theme.accent }]} />
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
  segment: { position: 'absolute', borderWidth: 3, borderStyle: 'dashed', borderRadius: 8, backgroundColor: 'transparent' },
  gateWrap: { position: 'absolute', width: GATE, height: GATE },
  gate: {
    width: GATE,
    height: GATE,
    borderRadius: GATE / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
  gateIcon: { fontSize: 28 },
  targetWrap: { position: 'absolute', width: GATE + 20, height: GATE + 20, alignItems: 'center', justifyContent: 'center' },
  targetRing: { position: 'absolute', width: GATE + 18, height: GATE + 18, borderRadius: (GATE + 18) / 2, borderWidth: 3 },
  targetCore: {
    width: GATE,
    height: GATE,
    borderRadius: GATE / 2,
    borderWidth: 4,
    backgroundColor: 'rgba(15,23,42,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetIcon: { fontSize: 32 },
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
  cursorEmoji: { fontSize: 16 },
  cueWrap: { position: 'absolute', top: 10, alignSelf: 'center' },
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
  cueArrow: { fontSize: 22 },
  cueName: { color: '#fff', fontSize: 17, fontWeight: '900' },
  bannerWrap: { position: 'absolute', top: '58%', alignSelf: 'center', width: '100%', alignItems: 'center' },
  banner: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 18, borderWidth: 2, maxWidth: '92%' },
  bannerText: { color: '#fff', fontSize: 15, fontWeight: '900', textAlign: 'center' },
  clearWrap: { position: 'absolute', top: '50%', alignSelf: 'center' },
  clearText: { color: '#34D399', fontSize: 20, fontWeight: '900' },
  meterPanel: { position: 'absolute', bottom: 12, alignSelf: 'center', width: '88%', alignItems: 'center', gap: 6 },
  pipRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  pip: { width: 15, height: 15, borderRadius: 8, borderWidth: 2, backgroundColor: 'rgba(15,23,42,0.6)' },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  meterLabel: { color: '#BBF7D0', fontSize: 10, fontWeight: '900', letterSpacing: 1, width: 40 },
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

export default ObstaclePathOverlay;
