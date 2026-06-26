import {
  SOLVER_SHELL,
  type ProblemSolverRound,
  type SolverPhaseKind,
} from '@/components/game/occupational/level10/session8/problemSolverTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  round: ProblemSolverRound;
  phase: SolverPhaseKind;
  holdProgress: number;
  tryOk: boolean;
  adaptOk: boolean;
  solveOk: boolean;
};

const Node: React.FC<{
  point: { x: number; y: number };
  emoji: string;
  label: string;
  color: string;
  visible: boolean;
  active: boolean;
  hit: boolean;
  holdProgress: number;
  showHold: boolean;
}> = ({ point, emoji, label, color, visible, active, hit, holdProgress, showHold }) => {
  if (!visible) return null;
  return (
    <View style={[styles.nodeWrap, { left: `${point.x * 100}%`, top: `${point.y * 100}%` }]}>
      {showHold && holdProgress > 0 && hit && (
        <Svg width={96} height={96} style={styles.ringSvg}>
          <Circle cx={48} cy={48} r={40} stroke="rgba(255,255,255,0.12)" strokeWidth={3} fill="none" />
          <Circle
            cx={48}
            cy={48}
            r={40}
            stroke={SOLVER_SHELL.good}
            strokeWidth={4}
            fill="none"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - holdProgress)}`}
            strokeLinecap="round"
            rotation={-90}
            origin="48, 48"
          />
        </Svg>
      )}
      <View style={[styles.node, { borderColor: color, shadowColor: color }, active && styles.nodeActive, hit && styles.nodeHit]}>
        <Text style={styles.nodeEmoji}>{emoji}</Text>
      </View>
      <Text style={[styles.nodeLabel, { color }]}>{label}</Text>
    </View>
  );
};

export const ProblemSolverOverlay: React.FC<Props> = ({
  round,
  phase,
  holdProgress,
  tryOk,
  adaptOk,
  solveOk,
}) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Node
      point={round.try}
      emoji={round.emoji}
      label="TRY"
      color={SOLVER_SHELL.try}
      visible={phase === 'try'}
      active={phase === 'try'}
      hit={tryOk}
      holdProgress={holdProgress}
      showHold={phase === 'try'}
    />
    <Node
      point={round.adapt}
      emoji="🔧"
      label="ADAPT"
      color={SOLVER_SHELL.adapt}
      visible={phase === 'adapt'}
      active={phase === 'adapt'}
      hit={adaptOk}
      holdProgress={holdProgress}
      showHold={phase === 'adapt'}
    />
    <Node
      point={round.solve}
      emoji="💡"
      label="SOLVE"
      color={SOLVER_SHELL.solve}
      visible={phase === 'solve'}
      active={phase === 'solve'}
      hit={solveOk}
      holdProgress={holdProgress}
      showHold={phase === 'solve'}
    />
  </View>
);

const styles = StyleSheet.create({
  nodeWrap: { position: 'absolute', alignItems: 'center', marginLeft: -40, marginTop: -40, width: 80 },
  ringSvg: { position: 'absolute', left: -8, top: -8 },
  node: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    backgroundColor: 'rgba(15,23,42,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  nodeActive: { borderWidth: 3 },
  nodeHit: { backgroundColor: 'rgba(255,255,255,0.12)' },
  nodeEmoji: { fontSize: 28 },
  nodeLabel: { marginTop: 5, fontSize: 7, fontWeight: '900', letterSpacing: 0.3 },
});
