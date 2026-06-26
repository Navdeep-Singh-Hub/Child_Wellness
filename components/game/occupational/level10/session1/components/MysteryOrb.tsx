import { MYSTERY_TOUCH_THEME } from '@/components/game/occupational/level10/session1/mysteryTouchTheme';
import type { MysteryTouchChallenge } from '@/components/game/occupational/level10/session1/mysteryTouchTheme';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  challenge: MysteryTouchChallenge;
  revealed: boolean;
  holdProgress: number;
  handOnPrimary: boolean;
  handOnSecondary: boolean;
};

const OrbNode: React.FC<{
  x: number;
 y: number;
  color: string;
  emoji: string;
  label: string;
  revealed: boolean;
  holdProgress: number;
  active: boolean;
}> = ({ x, y, color, emoji, label, revealed, holdProgress, active }) => {
  const shroud = useSharedValue(revealed ? 0 : 1);
  const pulse = useSharedValue(0);

  useEffect(() => {
    shroud.value = withSpring(revealed ? 0 : 1);
  }, [revealed, shroud]);

  useEffect(() => {
    if (revealed) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    }
  }, [pulse, revealed]);

  const orbStyle = useAnimatedStyle(() => ({
    opacity: 1 - shroud.value * 0.65,
    transform: [{ scale: (1 - shroud.value * 0.35) * (1 + pulse.value * 0.06) }],
  }));

  return (
    <View style={[styles.node, { left: `${x * 100}%`, top: `${y * 100}%` }]}>
      {revealed && (
        <Svg width={110} height={110} style={styles.ringSvg}>
          <Circle cx={55} cy={55} r={48} stroke="rgba(255,255,255,0.12)" strokeWidth={3} fill="none" />
          <Circle
            cx={55}
            cy={55}
            r={48}
            stroke={color}
            strokeWidth={4}
            fill="none"
            strokeDasharray={`${2 * Math.PI * 48}`}
            strokeDashoffset={`${2 * Math.PI * 48 * (1 - holdProgress)}`}
            strokeLinecap="round"
            rotation={-90}
            origin="55, 55"
          />
        </Svg>
      )}
      <Animated.View
        style={[
          styles.orb,
          orbStyle,
          { borderColor: color, shadowColor: color },
          active && styles.orbActive,
          !revealed && styles.orbHidden,
        ]}
      >
        <Text style={styles.emoji}>{revealed ? emoji : '❓'}</Text>
      </Animated.View>
      {revealed && <Text style={[styles.label, { color }]}>{label}</Text>}
    </View>
  );
};

export const MysteryOrb: React.FC<Props> = ({
  challenge,
  revealed,
  holdProgress,
  handOnPrimary,
  handOnSecondary,
}) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <OrbNode
      x={challenge.primary.x}
      y={challenge.primary.y}
      color={challenge.color}
      emoji={challenge.emoji}
      label={challenge.label}
      revealed={revealed}
      holdProgress={holdProgress}
      active={handOnPrimary}
    />
    {challenge.secondary && (
      <OrbNode
        x={challenge.secondary.x}
        y={challenge.secondary.y}
        color={MYSTERY_TOUCH_THEME.accentWarm}
        emoji="✨"
        label="Right Touch"
        revealed={revealed}
        holdProgress={holdProgress}
        active={handOnSecondary}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  node: { position: 'absolute', alignItems: 'center', marginLeft: -40, marginTop: -40, width: 80 },
  ringSvg: { position: 'absolute', left: -15, top: -15 },
  orb: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.65,
    shadowRadius: 14,
    elevation: 6,
  },
  orbHidden: { backgroundColor: 'rgba(30,10,40,0.55)' },
  orbActive: { borderWidth: 3, backgroundColor: 'rgba(255,255,255,0.22)' },
  emoji: { fontSize: 30 },
  label: { marginTop: 8, fontSize: 10, fontWeight: '900', letterSpacing: 0.3 },
});
