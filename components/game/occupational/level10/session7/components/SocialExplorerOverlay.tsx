import {
  SOCIAL_EXPLORER_SHELL,
  type SocialExplorerRound,
  type SocialPhaseKind,
} from '@/components/game/occupational/level10/session7/socialExplorerTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  round: SocialExplorerRound;
  phase: SocialPhaseKind;
  holdProgress: number;
  exploreOk: boolean;
  connectOk: boolean;
  socialOk: boolean;
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
            stroke={SOCIAL_EXPLORER_SHELL.good}
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

export const SocialExplorerOverlay: React.FC<Props> = ({
  round,
  phase,
  holdProgress,
  exploreOk,
  connectOk,
  socialOk,
}) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Node
      point={round.explore}
      emoji={round.emoji}
      label="EXPLORE"
      color={SOCIAL_EXPLORER_SHELL.explore}
      visible={phase === 'explore'}
      active={phase === 'explore'}
      hit={exploreOk}
      holdProgress={holdProgress}
      showHold={phase === 'explore'}
    />
    <Node
      point={round.connect}
      emoji="🤗"
      label="CONNECT"
      color={SOCIAL_EXPLORER_SHELL.connect}
      visible={phase === 'connect'}
      active={phase === 'connect'}
      hit={connectOk}
      holdProgress={holdProgress}
      showHold={phase === 'connect'}
    />
    <Node
      point={round.social}
      emoji="🌟"
      label="SOCIAL"
      color={SOCIAL_EXPLORER_SHELL.social}
      visible={phase === 'social'}
      active={phase === 'social'}
      hit={socialOk}
      holdProgress={holdProgress}
      showHold={phase === 'social'}
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
