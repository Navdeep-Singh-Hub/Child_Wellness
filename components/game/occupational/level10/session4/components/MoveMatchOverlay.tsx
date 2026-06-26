import { MATCH_SHELL, type MoveMatchRound } from '@/components/game/occupational/level10/session4/moveMatchTheme';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  round: MoveMatchRound;
  phase: 'move' | 'match';
  holdProgress: number;
  onMove: boolean;
  onMatch: boolean;
  showMatch: boolean;
};

const PadNode: React.FC<{
  point: { x: number; y: number };
  emoji: string;
  label: string;
  color: string;
  variant: 'move' | 'match';
  active: boolean;
  hit: boolean;
  holdProgress: number;
  showHold: boolean;
}> = ({ point, emoji, label, color, variant, active, hit, holdProgress, showHold }) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 850, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 850, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const padStyle = useAnimatedStyle(() => ({
    transform: [{ scale: active ? 1 + pulse.value * 0.08 : 1 }],
  }));

  return (
    <View style={[styles.padWrap, { left: `${point.x * 100}%`, top: `${point.y * 100}%` }]}>
      {showHold && holdProgress > 0 && hit && (
        <Svg width={100} height={100} style={styles.ringSvg}>
          <Circle cx={50} cy={50} r={42} stroke="rgba(255,255,255,0.12)" strokeWidth={3} fill="none" />
          <Circle
            cx={50}
            cy={50}
            r={42}
            stroke={MATCH_SHELL.good}
            strokeWidth={4}
            fill="none"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - holdProgress)}`}
            strokeLinecap="round"
            rotation={-90}
            origin="50, 50"
          />
        </Svg>
      )}
      <Animated.View
        style={[
          styles.pad,
          padStyle,
          {
            borderColor: variant === 'move' ? MATCH_SHELL.move : color,
            shadowColor: variant === 'move' ? MATCH_SHELL.move : color,
          },
          active && styles.padActive,
          hit && styles.padHit,
        ]}
      >
        <Text style={styles.padEmoji}>{emoji}</Text>
      </Animated.View>
      <Text style={[styles.padLabel, { color: variant === 'move' ? MATCH_SHELL.move : color }]}>{label}</Text>
    </View>
  );
};

export const MoveMatchOverlay: React.FC<Props> = ({
  round,
  phase,
  holdProgress,
  onMove,
  onMatch,
  showMatch,
}) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <PadNode
      point={round.move}
      emoji={phase === 'move' ? '📍' : round.emoji}
      label="MOVE"
      color={round.color}
      variant="move"
      active={phase === 'move'}
      hit={onMove}
      holdProgress={holdProgress}
      showHold={phase === 'move'}
    />
    {showMatch && (
      <PadNode
        point={round.match}
        emoji={round.emoji}
        label="MATCH"
        color={round.color}
        variant="match"
        active={phase === 'match'}
        hit={onMatch}
        holdProgress={holdProgress}
        showHold={phase === 'match'}
      />
    )}
    {phase === 'match' && showMatch && (
      <View style={styles.twinHint}>
        <Text style={styles.twinText}>Match the twin {round.emoji}</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  padWrap: { position: 'absolute', alignItems: 'center', marginLeft: -42, marginTop: -42, width: 84 },
  ringSvg: { position: 'absolute', left: -8, top: -8 },
  pad: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    backgroundColor: 'rgba(30,27,75,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 6,
  },
  padActive: { borderWidth: 3 },
  padHit: { backgroundColor: 'rgba(255,255,255,0.12)' },
  padEmoji: { fontSize: 28 },
  padLabel: { marginTop: 5, fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
  twinHint: {
    position: 'absolute',
    top: 52,
    alignSelf: 'center',
    left: '18%',
    right: '18%',
    backgroundColor: 'rgba(30,27,75,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MATCH_SHELL.glassBorder,
  },
  twinText: { color: MATCH_SHELL.gold, fontSize: 12, fontWeight: '800', textAlign: 'center' },
});
