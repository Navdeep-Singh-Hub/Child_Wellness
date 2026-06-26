import { FOCUS_SHELL, type FocusFinderRound } from '@/components/game/occupational/level10/session6/focusFinderTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  round: FocusFinderRound;
  phase: 'seek' | 'focus';
  holdProgress: number;
  onSeek: boolean;
  onFocus: boolean;
  showFocus: boolean;
};

const BeaconPad: React.FC<{
  point: { x: number; y: number };
  emoji: string;
  label: string;
  color: string;
  variant: 'seek' | 'focus';
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
            stroke={FOCUS_SHELL.good}
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
          { borderColor: variant === 'seek' ? FOCUS_SHELL.seek : color, shadowColor: color },
          active && styles.padActive,
          hit && styles.padHit,
        ]}
      >
        <Text style={styles.padEmoji}>{emoji}</Text>
      </View>
      <Text style={[styles.padLabel, { color: variant === 'seek' ? FOCUS_SHELL.seek : FOCUS_SHELL.focus }]}>
        {label}
      </Text>
    </View>
  );
};

export const FocusFinderOverlay: React.FC<Props> = ({
  round,
  phase,
  holdProgress,
  onSeek,
  onFocus,
  showFocus,
}) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <BeaconPad
      point={round.seek}
      emoji={round.emoji}
      label="SEEK"
      color={round.color}
      variant="seek"
      active={phase === 'seek'}
      hit={onSeek}
      holdProgress={holdProgress}
      showHold={phase === 'seek'}
      visible={phase === 'seek'}
    />
    <BeaconPad
      point={round.focus}
      emoji="✨"
      label="FOCUS"
      color={FOCUS_SHELL.focus}
      variant="focus"
      active={phase === 'focus'}
      hit={onFocus}
      holdProgress={holdProgress}
      showHold={phase === 'focus'}
      visible={showFocus}
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
