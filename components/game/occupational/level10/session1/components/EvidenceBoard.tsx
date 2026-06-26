import type { DetectiveCase, EvidenceClue } from '@/components/game/occupational/level10/session1/sensoryDetectiveTheme';
import { DETECTIVE_SHELL, MAGNIFIER_STATION } from '@/components/game/occupational/level10/session1/sensoryDetectiveTheme';
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
  detectiveCase: DetectiveCase;
  phase: 'briefing' | 'scan' | 'solve';
  scanned: boolean;
  holdProgress: number;
  activeClueId: EvidenceClue['id'] | null;
  wrongFlash: boolean;
};

const CluePin: React.FC<{
  clue: EvidenceClue;
  visible: boolean;
  holdProgress: number;
  active: boolean;
  wrong: boolean;
}> = ({ clue, visible, holdProgress, active, wrong }) => {
  const bounce = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      bounce.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    }
  }, [bounce, visible]);

  const pinStyle = useAnimatedStyle(() => ({
    opacity: visible ? 0.92 : 0.25,
    transform: [{ translateY: bounce.value * -4 }, { scale: active ? 1.08 : 1 }],
  }));

  if (!visible) return null;

  return (
    <View style={[styles.pinWrap, { left: `${clue.x * 100}%`, top: `${clue.y * 100}%` }]}>
      {holdProgress > 0 && active && (
        <Svg width={100} height={100} style={styles.ringSvg}>
          <Circle cx={50} cy={50} r={42} stroke="rgba(255,255,255,0.12)" strokeWidth={3} fill="none" />
          <Circle
            cx={50}
            cy={50}
            r={42}
            stroke={DETECTIVE_SHELL.good}
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
          styles.pin,
          pinStyle,
          { borderColor: clue.pinColor },
          active && styles.pinActive,
          wrong && styles.pinWrong,
        ]}
      >
        <Text style={styles.pinEmoji}>{clue.emoji}</Text>
      </Animated.View>
      <Text style={[styles.pinLabel, { color: clue.pinColor }]}>{clue.label}</Text>
    </View>
  );
};

export const EvidenceBoard: React.FC<Props> = ({
  detectiveCase,
  phase,
  scanned,
  holdProgress,
  activeClueId,
  wrongFlash,
}) => {
  const cluesVisible = phase === 'solve' || (phase === 'scan' && scanned);
  const showMagnifier = detectiveCase.needsScan && phase === 'scan' && !scanned;
  const magPulse = useSharedValue(0);

  useEffect(() => {
    if (showMagnifier) {
      magPulse.value = withRepeat(
        withSequence(withSpring(1.12), withSpring(1)),
        -1,
        false,
      );
    } else {
      magPulse.value = withSpring(1);
    }
  }, [magPulse, showMagnifier]);

  const magStyle = useAnimatedStyle(() => ({
    transform: [{ scale: magPulse.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {detectiveCase.clues.map((clue) => (
        <CluePin
          key={clue.id}
          clue={clue}
          visible={cluesVisible || phase === 'briefing'}
          holdProgress={holdProgress}
          active={activeClueId === clue.id}
          wrong={wrongFlash && activeClueId === clue.id}
        />
      ))}
      {showMagnifier && (
        <Animated.View
          style={[
            styles.magnifier,
            magStyle,
            {
              left: `${MAGNIFIER_STATION.x * 100}%`,
              top: `${MAGNIFIER_STATION.y * 100}%`,
            },
          ]}
        >
          <Text style={styles.magEmoji}>{MAGNIFIER_STATION.emoji}</Text>
          <Text style={styles.magLabel}>{MAGNIFIER_STATION.label}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pinWrap: { position: 'absolute', alignItems: 'center', marginLeft: -36, marginTop: -36, width: 72 },
  ringSvg: { position: 'absolute', left: -14, top: -14 },
  pin: {
    width: 58,
    height: 58,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(254,243,199,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  pinActive: { borderWidth: 3, backgroundColor: '#FFFBEB' },
  pinWrong: { borderColor: DETECTIVE_SHELL.warn, backgroundColor: 'rgba(254,226,226,0.9)' },
  pinEmoji: { fontSize: 26 },
  pinLabel: { marginTop: 6, fontSize: 9, fontWeight: '900', letterSpacing: 0.3 },
  magnifier: {
    position: 'absolute',
    alignItems: 'center',
    marginLeft: -40,
    marginTop: -40,
    width: 80,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderWidth: 2,
    borderColor: DETECTIVE_SHELL.gold,
  },
  magEmoji: { fontSize: 28 },
  magLabel: { color: DETECTIVE_SHELL.gold, fontSize: 9, fontWeight: '900', marginTop: 4 },
});
