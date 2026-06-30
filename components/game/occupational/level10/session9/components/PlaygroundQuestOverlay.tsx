import { PLAY_SHELL, type PlaygroundQuestRound } from '@/components/game/occupational/level10/session9/playgroundQuestTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  round: PlaygroundQuestRound;
  phase: 'explore' | 'play';
  holdProgress: number;
  onExplore: boolean;
  onPlay: boolean;
  showPlay: boolean;
};

const StationPad: React.FC<{
  point: { x: number; y: number };
  emoji: string;
  label: string;
  color: string;
  variant: 'explore' | 'play';
  active: boolean;
  hit: boolean;
  holdProgress: number;
  showHold: boolean;
  visible: boolean;
}> = ({ point, emoji, label, color, variant, active, hit, holdProgress, showHold, visible }) => {
  if (!visible) return null;
  return (
    <View style={[styles.padWrap, { left: `${point.x * 100}%`, top: `${point.y * 100}%` }]}>
      {showHold && holdProgress > 0 && hit && (
        <Svg width={96} height={96} style={styles.ringSvg}>
          <Circle cx={48} cy={48} r={40} stroke="rgba(255,255,255,0.12)" strokeWidth={3} fill="none" />
          <Circle
            cx={48}
            cy={48}
            r={40}
            stroke={PLAY_SHELL.good}
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
      <View
        style={[
          styles.pad,
          { borderColor: variant === 'explore' ? PLAY_SHELL.explore : color, shadowColor: color },
          active && styles.padActive,
          hit && styles.padHit,
        ]}
      >
        <Text style={styles.padEmoji}>{emoji}</Text>
      </View>
      <Text style={[styles.padLabel, { color: variant === 'explore' ? PLAY_SHELL.explore : PLAY_SHELL.play }]}>
        {label}
      </Text>
    </View>
  );
};

export const PlaygroundQuestOverlay: React.FC<Props> = ({
  round,
  phase,
  holdProgress,
  onExplore,
  onPlay,
  showPlay,
}) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <StationPad
      point={round.explore}
      emoji={round.emoji}
      label="EXPLORE"
      color={round.color}
      variant="explore"
      active={phase === 'explore'}
      hit={onExplore}
      holdProgress={holdProgress}
      showHold={phase === 'explore'}
      visible={phase === 'explore'}
    />
    <StationPad
      point={round.play}
      emoji="⚽"
      label="PLAY"
      color={PLAY_SHELL.play}
      variant="play"
      active={phase === 'play'}
      hit={onPlay}
      holdProgress={holdProgress}
      showHold={phase === 'play'}
      visible={showPlay}
    />
  </View>
);

const styles = StyleSheet.create({
  padWrap: { position: 'absolute', alignItems: 'center', marginLeft: -40, marginTop: -40, width: 80 },
  ringSvg: { position: 'absolute', left: -8, top: -8 },
  pad: {
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
  padActive: { borderWidth: 3 },
  padHit: { backgroundColor: 'rgba(255,255,255,0.12)' },
  padEmoji: { fontSize: 28 },
  padLabel: { marginTop: 5, fontSize: 8, fontWeight: '900', letterSpacing: 0.4 },
});
