import { DOOR_SHELL, type DoorChallengeRound } from '@/components/game/occupational/level10/session5/doorChallengeTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  round: DoorChallengeRound;
  phase: 'prepare' | 'ready';
  holdProgress: number;
  onPrepare: boolean;
  onReady: boolean;
  showReady: boolean;
};

const DoorPad: React.FC<{
  point: { x: number; y: number };
  emoji: string;
  label: string;
  color: string;
  variant: 'prepare' | 'ready';
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
            stroke={DOOR_SHELL.good}
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
          { borderColor: variant === 'prepare' ? DOOR_SHELL.prepare : color, shadowColor: color },
          active && styles.padActive,
          hit && styles.padHit,
        ]}
      >
        <Text style={styles.padEmoji}>{emoji}</Text>
      </View>
      <Text style={[styles.padLabel, { color: variant === 'prepare' ? DOOR_SHELL.prepare : DOOR_SHELL.ready }]}>
        {label}
      </Text>
    </View>
  );
};

export const DoorChallengeOverlay: React.FC<Props> = ({
  round,
  phase,
  holdProgress,
  onPrepare,
  onReady,
  showReady,
}) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <DoorPad
      point={round.prepare}
      emoji={round.emoji}
      label="APPROACH"
      color={round.color}
      variant="prepare"
      active={phase === 'prepare'}
      hit={onPrepare}
      holdProgress={holdProgress}
      showHold={phase === 'prepare'}
      visible={phase === 'prepare'}
    />
    <DoorPad
      point={round.ready}
      emoji="🗝️"
      label="READY"
      color={DOOR_SHELL.ready}
      variant="ready"
      active={phase === 'ready'}
      hit={onReady}
      holdProgress={holdProgress}
      showHold={phase === 'ready'}
      visible={showReady}
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
