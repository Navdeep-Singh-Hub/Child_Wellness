import type { SafeStone } from '@/components/game/occupational/level10/session3/lavaShiftTheme';
import { LAVA_SHELL } from '@/components/game/occupational/level10/session3/lavaShiftTheme';
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
  stoneA: SafeStone;
  stoneB: SafeStone;
  activeStone: 'a' | 'b';
  showB: boolean;
  stoneASunk: boolean;
  shiftFlash: boolean;
  holdProgress: number;
  cursorOnActive: boolean;
};

const StoneNode: React.FC<{
  stone: SafeStone;
  active: boolean;
  sunk: boolean;
  holdProgress: number;
  cursorOn: boolean;
  flash: boolean;
}> = ({ stone, active, sunk, holdProgress, cursorOn, flash }) => {
  const shake = useSharedValue(0);

  useEffect(() => {
    if (flash || sunk) {
      shake.value = withRepeat(
        withSequence(withTiming(1, { duration: 120 }), withTiming(-1, { duration: 120 })),
        6,
        false,
      );
    } else if (active) {
      shake.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 700, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    } else {
      shake.value = withTiming(0);
    }
  }, [active, flash, shake, sunk]);

  const nodeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value * 4 }, { scale: sunk ? 0.85 : 1 }],
    opacity: sunk ? 0.35 : 1,
  }));

  return (
    <View style={[styles.node, { left: `${stone.x * 100}%`, top: `${stone.y * 100}%` }]}>
      {active && !sunk && holdProgress > 0 && cursorOn && (
        <Svg width={100} height={100} style={styles.ringSvg}>
          <Circle cx={50} cy={50} r={42} stroke="rgba(255,255,255,0.12)" strokeWidth={3} fill="none" />
          <Circle
            cx={50}
            cy={50}
            r={42}
            stroke={LAVA_SHELL.good}
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
          styles.stone,
          nodeStyle,
          {
            borderColor: sunk ? LAVA_SHELL.lava : active ? LAVA_SHELL.safeActive : LAVA_SHELL.safeStone,
          },
          active && !sunk && styles.stoneActive,
          cursorOn && active && styles.stoneCursor,
        ]}
      >
        <Text style={styles.emoji}>{sunk ? '🔥' : stone.emoji}</Text>
      </Animated.View>
      <Text style={[styles.label, sunk && styles.labelSunk]}>{sunk ? 'LAVA!' : stone.label}</Text>
    </View>
  );
};

export const LavaSafeStones: React.FC<Props> = ({
  stoneA,
  stoneB,
  activeStone,
  showB,
  stoneASunk,
  shiftFlash,
  holdProgress,
  cursorOnActive,
}) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <StoneNode
      stone={stoneA}
      active={activeStone === 'a'}
      sunk={stoneASunk}
      holdProgress={holdProgress}
      cursorOn={cursorOnActive && activeStone === 'a'}
      flash={shiftFlash && !stoneASunk}
    />
    {showB && (
      <StoneNode
        stone={stoneB}
        active={activeStone === 'b'}
        sunk={false}
        holdProgress={holdProgress}
        cursorOn={cursorOnActive && activeStone === 'b'}
        flash={shiftFlash}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  node: { position: 'absolute', alignItems: 'center', marginLeft: -40, marginTop: -40, width: 80 },
  ringSvg: { position: 'absolute', left: -10, top: -10 },
  stone: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 3,
    backgroundColor: 'rgba(28,25,27,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  stoneActive: { borderColor: LAVA_SHELL.gold },
  stoneCursor: { backgroundColor: 'rgba(255,255,255,0.1)' },
  emoji: { fontSize: 28 },
  label: { marginTop: 6, fontSize: 9, fontWeight: '900', color: LAVA_SHELL.safeActive, letterSpacing: 0.3 },
  labelSunk: { color: LAVA_SHELL.lava },
});
