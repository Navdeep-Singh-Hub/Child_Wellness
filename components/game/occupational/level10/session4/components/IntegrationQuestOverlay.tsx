import type { QuestPhaseKind } from '@/components/game/occupational/level10/session4/integrationQuestTheme';
import { QUEST_SHELL, type IntegrationQuestRound } from '@/components/game/occupational/level10/session4/integrationQuestTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  round: IntegrationQuestRound;
  phase: QuestPhaseKind;
  holdProgress: number;
  gatherOk: boolean;
  integrateOk: boolean;
  completeOk: boolean;
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
            stroke={QUEST_SHELL.good}
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

export const IntegrationQuestOverlay: React.FC<Props> = ({
  round,
  phase,
  holdProgress,
  gatherOk,
  integrateOk,
  completeOk,
}) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Node
      point={round.gather}
      emoji="🧭"
      label="GATHER"
      color={QUEST_SHELL.gather}
      visible={phase === 'gather'}
      active={phase === 'gather'}
      hit={gatherOk}
      holdProgress={holdProgress}
      showHold={phase === 'gather'}
    />
    {phase !== 'gather' && (
      <>
        <Node
          point={round.balance}
          emoji="⚖️"
          label="BALANCE"
          color={QUEST_SHELL.integrate}
          visible={phase === 'integrate'}
          active={phase === 'integrate'}
          hit={integrateOk}
          holdProgress={holdProgress}
          showHold={false}
        />
        <Node
          point={round.integrate}
          emoji="🤲"
          label="REACH"
          color={round.color}
          visible={phase === 'integrate'}
          active={phase === 'integrate'}
          hit={integrateOk}
          holdProgress={holdProgress}
          showHold={phase === 'integrate'}
        />
      </>
    )}
    <Node
      point={round.complete}
      emoji={round.emoji}
      label="FINALE"
      color={QUEST_SHELL.complete}
      visible={phase === 'complete'}
      active={phase === 'complete'}
      hit={completeOk}
      holdProgress={holdProgress}
      showHold={phase === 'complete'}
    />
    {phase === 'integrate' && (
      <View style={styles.stepPill}>
        <Text style={styles.stepText}>Step 2: Balance + Reach together</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  nodeWrap: { position: 'absolute', alignItems: 'center', marginLeft: -40, marginTop: -40, width: 80 },
  ringSvg: { position: 'absolute', left: -8, top: -8 },
  node: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    backgroundColor: 'rgba(15,23,42,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 5,
  },
  nodeActive: { borderWidth: 3 },
  nodeHit: { backgroundColor: 'rgba(255,255,255,0.12)' },
  nodeEmoji: { fontSize: 26 },
  nodeLabel: { marginTop: 4, fontSize: 8, fontWeight: '900', letterSpacing: 0.4 },
  stepPill: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    left: '12%',
    right: '12%',
    backgroundColor: 'rgba(15,23,42,0.82)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: QUEST_SHELL.glassBorder,
  },
  stepText: { color: QUEST_SHELL.gold, fontSize: 11, fontWeight: '800', textAlign: 'center' },
});
