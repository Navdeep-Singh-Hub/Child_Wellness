/**
 * PuzzleOverlay — shows the movement puzzle clue, three answer options (with
 * live approach highlighting), solve progress and accuracy / flow meters.
 */
import type { PuzzleMove, PuzzleRound } from '@/components/game/occupational/level8/session8/puzzleSolve';
import type { PuzzleGameTheme } from '@/components/game/occupational/level8/session8/puzzleTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

type Props = {
  theme: PuzzleGameTheme;
  puzzle: PuzzleRound | null;
  roundActive: boolean;
  solved: boolean;
  wrongFlash: boolean;
  activeOptionId: string | null;
  optionScores: Record<string, number>;
  solveProgress: number;
  quality: number;
  round: number;
  totalRounds: number;
  banner: string;
};

const OptionChip: React.FC<{
  move: PuzzleMove;
  accent: string;
  active: boolean;
  solved: boolean;
  wrong: boolean;
  score: number;
  isCorrect: boolean;
}> = ({ move, accent, active, solved, wrong, score, isCorrect }) => {
  const border =
    solved && isCorrect ? '#34D399' : wrong && active ? '#FB7185' : active ? accent : 'rgba(255,255,255,0.28)';
  const bg =
    solved && isCorrect
      ? 'rgba(52,211,153,0.25)'
      : wrong && active
        ? 'rgba(251,113,133,0.2)'
        : active
          ? 'rgba(255,255,255,0.15)'
          : 'rgba(15,23,42,0.5)';

  return (
    <View style={[styles.option, { borderColor: border, backgroundColor: bg }]}>
      <Text style={styles.optionIcon}>{solved && isCorrect ? '✓' : move.icon}</Text>
      <Text style={styles.optionLabel}>{move.label}</Text>
      {active && !solved && (
        <View style={styles.optionBar}>
          <View style={[styles.optionFill, { width: `${Math.round(score * 100)}%`, backgroundColor: accent }]} />
        </View>
      )}
    </View>
  );
};

export const PuzzleOverlay: React.FC<Props> = ({
  theme,
  puzzle,
  roundActive,
  solved,
  wrongFlash,
  activeOptionId,
  optionScores,
  solveProgress,
  quality,
  round,
  totalRounds,
  banner,
}) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    {puzzle && (
      <View style={styles.clueWrap}>
        <View style={[styles.clueCard, { borderColor: solved ? '#34D399' : theme.accent }]}>
          <Text style={styles.clueLabel}>PUZZLE CLUE</Text>
          <Text style={styles.clueText}>{puzzle.clue}</Text>
          <Text style={styles.promptText}>{puzzle.prompt}</Text>
        </View>
      </View>
    )}

    {puzzle && (
      <View style={styles.optionsWrap}>
        {puzzle.options.map((opt) => (
          <OptionChip
            key={opt.id}
            move={opt}
            accent={theme.accent}
            active={activeOptionId === opt.id}
            solved={solved}
            wrong={wrongFlash}
            score={optionScores[opt.id] ?? 0}
            isCorrect={opt.id === puzzle.correct.id}
          />
        ))}
      </View>
    )}

    {!!banner && (
      <View style={styles.bannerWrap}>
        <View
          style={[
            styles.banner,
            {
              borderColor: wrongFlash ? '#FB7185' : theme.accent,
              backgroundColor: solved ? 'rgba(52,211,153,0.2)' : 'rgba(15,23,42,0.7)',
            },
          ]}
        >
          <Text style={styles.bannerText}>{banner}</Text>
        </View>
      </View>
    )}

    {solved && roundActive && (
      <View style={styles.solvedWrap}>
        <Text style={styles.solvedText}>✓ Puzzle solved!</Text>
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
        <Text style={styles.meterLabel}>SOLVE</Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              { width: `${Math.round(clamp01(solveProgress) * 100)}%`, backgroundColor: solved ? '#34D399' : theme.accent },
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

const styles = StyleSheet.create({
  clueWrap: { position: 'absolute', top: 8, alignSelf: 'center', width: '92%' },
  clueCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 3,
    backgroundColor: 'rgba(15,23,42,0.65)',
    alignItems: 'center',
  },
  clueLabel: { color: '#E9D5FF', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  clueText: { color: '#fff', fontSize: 17, fontWeight: '900', textAlign: 'center', marginTop: 4 },
  promptText: { color: '#DDD6FE', fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: 4 },
  optionsWrap: { position: 'absolute', top: '38%', alignSelf: 'center', flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', width: '94%' },
  option: {
    width: 100,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 2,
  },
  optionIcon: { fontSize: 26 },
  optionLabel: { color: '#fff', fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 2 },
  optionBar: {
    width: '90%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(15,23,42,0.6)',
    marginTop: 5,
    overflow: 'hidden',
  },
  optionFill: { height: '100%', borderRadius: 2 },
  bannerWrap: { position: 'absolute', top: '62%', alignSelf: 'center', width: '100%', alignItems: 'center' },
  banner: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 18, borderWidth: 2, maxWidth: '92%' },
  bannerText: { color: '#fff', fontSize: 14, fontWeight: '900', textAlign: 'center' },
  solvedWrap: { position: 'absolute', top: '56%', alignSelf: 'center' },
  solvedText: { color: '#34D399', fontSize: 22, fontWeight: '900' },
  meterPanel: { position: 'absolute', bottom: 12, alignSelf: 'center', width: '88%', alignItems: 'center', gap: 6 },
  pipRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  pip: { width: 15, height: 15, borderRadius: 8, borderWidth: 2, backgroundColor: 'rgba(15,23,42,0.6)' },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  meterLabel: { color: '#E9D5FF', fontSize: 10, fontWeight: '900', letterSpacing: 1, width: 44 },
  meterTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(15,23,42,0.7)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.25)',
  },
  meterFill: { height: '100%', borderRadius: 5 },
});

export default PuzzleOverlay;
