import { RESCUE_SHELL, type RescueMissionRound } from '@/components/game/occupational/level10/session8/rescueMissionTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  round: RescueMissionRound;
  phase: 'spot' | 'rescue';
  holdProgress: number;
  onSpot: boolean;
  onRescue: boolean;
  showRescue: boolean;
};

const SignalPad: React.FC<{
  point: { x: number; y: number };
  emoji: string;
  label: string;
  color: string;
  variant: 'spot' | 'rescue';
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
            stroke={RESCUE_SHELL.good}
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
          { borderColor: variant === 'spot' ? RESCUE_SHELL.spot : color, shadowColor: color },
          active && styles.padActive,
          hit && styles.padHit,
        ]}
      >
        <Text style={styles.padEmoji}>{emoji}</Text>
      </View>
      <Text style={[styles.padLabel, { color: variant === 'spot' ? RESCUE_SHELL.spot : RESCUE_SHELL.rescue }]}>
        {label}
      </Text>
    </View>
  );
};

export const RescueMissionOverlay: React.FC<Props> = ({
  round,
  phase,
  holdProgress,
  onSpot,
  onRescue,
  showRescue,
}) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <SignalPad
      point={round.spot}
      emoji={round.emoji}
      label="SPOT"
      color={round.color}
      variant="spot"
      active={phase === 'spot'}
      hit={onSpot}
      holdProgress={holdProgress}
      showHold={phase === 'spot'}
      visible={phase === 'spot'}
    />
    <SignalPad
      point={round.rescue}
      emoji="🦸"
      label="RESCUE"
      color={RESCUE_SHELL.rescue}
      variant="rescue"
      active={phase === 'rescue'}
      hit={onRescue}
      holdProgress={holdProgress}
      showHold={phase === 'rescue'}
      visible={showRescue}
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
