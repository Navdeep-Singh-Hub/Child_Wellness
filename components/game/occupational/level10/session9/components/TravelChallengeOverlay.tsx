import { TRAVEL_SHELL, type TravelChallengeRound } from '@/components/game/occupational/level10/session9/travelChallengeTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  round: TravelChallengeRound;
  phase: 'pack' | 'travel';
  holdProgress: number;
  onPack: boolean;
  onTravel: boolean;
  showTravel: boolean;
};

const StopPad: React.FC<{
  point: { x: number; y: number };
  emoji: string;
  label: string;
  color: string;
  variant: 'pack' | 'travel';
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
            stroke={TRAVEL_SHELL.good}
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
          { borderColor: variant === 'pack' ? TRAVEL_SHELL.pack : color, shadowColor: color },
          active && styles.padActive,
          hit && styles.padHit,
        ]}
      >
        <Text style={styles.padEmoji}>{emoji}</Text>
      </View>
      <Text style={[styles.padLabel, { color: variant === 'pack' ? TRAVEL_SHELL.pack : TRAVEL_SHELL.travel }]}>
        {label}
      </Text>
    </View>
  );
};

export const TravelChallengeOverlay: React.FC<Props> = ({
  round,
  phase,
  holdProgress,
  onPack,
  onTravel,
  showTravel,
}) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <StopPad
      point={round.pack}
      emoji={round.emoji}
      label="PACK"
      color={round.color}
      variant="pack"
      active={phase === 'pack'}
      hit={onPack}
      holdProgress={holdProgress}
      showHold={phase === 'pack'}
      visible={phase === 'pack'}
    />
    <StopPad
      point={round.travel}
      emoji="🗺️"
      label="TRAVEL"
      color={TRAVEL_SHELL.travel}
      variant="travel"
      active={phase === 'travel'}
      hit={onTravel}
      holdProgress={holdProgress}
      showHold={phase === 'travel'}
      visible={showTravel}
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
