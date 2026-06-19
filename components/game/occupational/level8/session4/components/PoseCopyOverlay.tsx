/**
 * PoseCopyOverlay — shows the demonstrated pose (PoseFigure + name), a live
 * match meter, a "copied!" confirmation and the round progress over the camera.
 */
import type { ImitationGameTheme } from '@/components/game/occupational/level8/session4/imitationTheme';
import { PoseFigure } from '@/components/game/occupational/level8/session4/components/PoseFigure';
import type { PoseTemplate } from '@/components/game/occupational/level8/session4/poseMatch';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

type Props = {
  theme: ImitationGameTheme;
  pose: PoseTemplate | null;
  roundActive: boolean;
  matched: boolean;
  matchProgress: number; // 0..1 hold toward confirming
  score: number; // 0..1 live closeness
  quality: number;
  round: number;
  totalRounds: number;
  banner: string;
};

export const PoseCopyOverlay: React.FC<Props> = ({
  theme,
  pose,
  roundActive,
  matched,
  matchProgress,
  score,
  quality,
  round,
  totalRounds,
  banner,
}) => {
  const pips = Array.from({ length: totalRounds }, (_, i) => i);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Demonstration card */}
      {pose && (
        <View style={styles.demoWrap}>
          <View style={[styles.demoCard, { borderColor: matched ? '#34D399' : theme.accent }]}>
            <Text style={styles.demoLabel}>COPY THIS</Text>
            <PoseFigure pose={pose} accent={matched ? '#34D399' : theme.accent} size={0.92} animated={!matched} />
            <Text style={styles.demoName}>{pose.name}</Text>
          </View>
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

      {/* Matched flash */}
      {matched && roundActive && (
        <View style={styles.matchWrap} pointerEvents="none">
          <Text style={styles.matchText}>✓ Great copy!</Text>
        </View>
      )}

      {/* Meters + pips */}
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
          <Text style={styles.meterLabel}>MATCH</Text>
          <View style={styles.meterTrack}>
            <View
              style={[
                styles.meterFill,
                { width: `${Math.round(clamp01(matched ? Math.max(score, matchProgress) : score) * 100)}%`, backgroundColor: matched ? '#34D399' : theme.accent },
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
  demoName: { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 2 },
  bannerWrap: { position: 'absolute', top: '54%', alignSelf: 'center', width: '100%', alignItems: 'center' },
  banner: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 18, borderWidth: 2, maxWidth: '92%' },
  bannerText: { color: '#fff', fontSize: 15, fontWeight: '900', textAlign: 'center', letterSpacing: 0.3 },
  matchWrap: { position: 'absolute', top: '46%', alignSelf: 'center' },
  matchText: { color: '#34D399', fontSize: 22, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 6 },
  meterPanel: { position: 'absolute', bottom: 12, alignSelf: 'center', width: '88%', alignItems: 'center', gap: 6 },
  pipRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  pip: { width: 15, height: 15, borderRadius: 8, borderWidth: 2, backgroundColor: 'rgba(15,23,42,0.6)' },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  meterLabel: { color: '#BFDBFE', fontSize: 10, fontWeight: '900', letterSpacing: 1, width: 48 },
  meterTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(15,23,42,0.7)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(147,197,253,0.25)',
  },
  meterFill: { height: '100%', borderRadius: 5 },
});

export default PoseCopyOverlay;
