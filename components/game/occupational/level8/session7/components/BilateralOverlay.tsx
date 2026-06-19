/**
 * BilateralOverlay — shows the target L/R arm pattern (chips + PoseFigure demo),
 * live bilateral match meter, FLOW meter and round progress over the camera.
 */
import { PoseFigure } from '@/components/game/occupational/level8/session4/components/PoseFigure';
import type { ArmZone } from '@/components/game/occupational/level8/session4/poseMatch';
import { zoneLabel, type BilateralPattern } from '@/components/game/occupational/level8/session7/bilateralPlan';
import type { BilateralGameTheme } from '@/components/game/occupational/level8/session7/bilateralTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const figureArms = (p: BilateralPattern): { left: ArmZone; right: ArmZone } => {
  if (p.kind === 'bear') return { left: 'out', right: 'out' };
  if (p.kind === 'clap' || p.kind === 'crossClap') return { left: 'out', right: 'out' };
  return { left: p.leftArm ?? 'down', right: p.rightArm ?? 'down' };
};

type Props = {
  theme: BilateralGameTheme;
  pattern: BilateralPattern | null;
  roundActive: boolean;
  matched: boolean;
  matchProgress: number;
  score: number;
  quality: number;
  round: number;
  totalRounds: number;
  banner: string;
};

export const BilateralOverlay: React.FC<Props> = ({
  theme,
  pattern,
  roundActive,
  matched,
  matchProgress,
  score,
  quality,
  round,
  totalRounds,
  banner,
}) => {
  const accent = matched ? '#34D399' : theme.accent;
  const arms = pattern ? figureArms(pattern) : null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pattern && (
        <View style={styles.demoWrap}>
          <View style={[styles.demoCard, { borderColor: accent }]}>
            <Text style={styles.demoLabel}>BOTH HANDS</Text>
            {pattern.kind === 'crossClap' ? (
              <Text style={styles.crossEmoji}>✖️👏</Text>
            ) : pattern.kind === 'clap' ? (
              <Text style={styles.crossEmoji}>👏</Text>
            ) : pattern.kind === 'bear' ? (
              <Text style={styles.crossEmoji}>🐻</Text>
            ) : (
              <PoseFigure
                pose={{ id: pattern.id, name: pattern.name, leftArm: arms!.left, rightArm: arms!.right }}
                accent={accent}
                size={0.88}
                animated={!matched}
              />
            )}
            <View style={styles.chipRow}>
              {pattern.kind === 'zones' && pattern.leftArm && pattern.rightArm && (
                <>
                  <View style={[styles.armChip, { borderColor: accent }]}>
                    <Text style={styles.chipSide}>L</Text>
                    <Text style={styles.chipZone}>{zoneLabel(pattern.leftArm)}</Text>
                  </View>
                  <Text style={styles.plus}>+</Text>
                  <View style={[styles.armChip, { borderColor: accent }]}>
                    <Text style={styles.chipSide}>R</Text>
                    <Text style={styles.chipZone}>{zoneLabel(pattern.rightArm)}</Text>
                  </View>
                </>
              )}
              {(pattern.kind === 'clap' || pattern.kind === 'crossClap' || pattern.kind === 'bear') && (
                <Text style={styles.patternName}>{pattern.name}</Text>
              )}
            </View>
          </View>
        </View>
      )}

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

      {matched && roundActive && (
        <View style={styles.matchWrap}>
          <Text style={styles.matchText}>✓ Both sides matched!</Text>
        </View>
      )}

      <View style={styles.meterPanel}>
        <View style={styles.pipRow}>
          {Array.from({ length: totalRounds }, (_, i) => (
            <View
              key={i}
              style={[styles.pip, i < round ? { backgroundColor: '#34D399', borderColor: '#34D399' } : { borderColor: theme.accent }]}
            />
          ))}
        </View>
        <View style={styles.meterRow}>
          <Text style={styles.meterLabel}>BILATERAL</Text>
          <View style={styles.meterTrack}>
            <View
              style={[
                styles.meterFill,
                {
                  width: `${Math.round(clamp01(matched ? Math.max(score, matchProgress) : score) * 100)}%`,
                  backgroundColor: matched ? '#34D399' : theme.accent,
                },
              ]}
            />
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
  demoWrap: { position: 'absolute', top: 10, alignSelf: 'center', alignItems: 'center' },
  demoCard: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
    borderRadius: 22,
    borderWidth: 3,
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  demoLabel: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 2 },
  crossEmoji: { fontSize: 52, marginVertical: 8 },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  armChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: 'rgba(15,23,42,0.5)',
  },
  chipSide: { color: '#FDE68A', fontSize: 11, fontWeight: '900' },
  chipZone: { color: '#fff', fontSize: 13, fontWeight: '900' },
  plus: { color: '#fff', fontSize: 16, fontWeight: '900' },
  patternName: { color: '#fff', fontSize: 16, fontWeight: '900' },
  bannerWrap: { position: 'absolute', top: '54%', alignSelf: 'center', width: '100%', alignItems: 'center' },
  banner: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 18, borderWidth: 2, maxWidth: '92%' },
  bannerText: { color: '#fff', fontSize: 15, fontWeight: '900', textAlign: 'center' },
  matchWrap: { position: 'absolute', top: '46%', alignSelf: 'center' },
  matchText: { color: '#34D399', fontSize: 20, fontWeight: '900' },
  meterPanel: { position: 'absolute', bottom: 12, alignSelf: 'center', width: '88%', alignItems: 'center', gap: 6 },
  pipRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  pip: { width: 15, height: 15, borderRadius: 8, borderWidth: 2, backgroundColor: 'rgba(15,23,42,0.6)' },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  meterLabel: { color: '#FDE68A', fontSize: 10, fontWeight: '900', letterSpacing: 1, width: 64 },
  meterTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(15,23,42,0.7)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(252,211,77,0.25)',
  },
  meterFill: { height: '100%', borderRadius: 5 },
});

export default BilateralOverlay;
