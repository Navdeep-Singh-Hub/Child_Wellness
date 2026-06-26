import type { SoundChallenge } from '@/components/game/occupational/level10/session1/findTheSoundTheme';
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
  challenge: SoundChallenge;
  holdProgress: number;
  visible: boolean;
  listenActive: boolean;
  found: boolean;
};

export const SoundWavePortal: React.FC<Props> = ({
  challenge,
  holdProgress,
  visible,
  listenActive,
  found,
}) => {
  const pulse = useSharedValue(0);
  const reveal = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  useEffect(() => {
    reveal.value = withSpring(visible ? 1 : 0);
  }, [reveal, visible]);

  const portalStyle = useAnimatedStyle(() => ({
    opacity: reveal.value * (found ? 0.2 : 1),
    transform: [{ scale: 0.5 + reveal.value * 0.5 + pulse.value * 0.06 }],
  }));

  if (!visible && !listenActive) return null;

  const left = `${challenge.x * 100}%`;
  const top = `${challenge.y * 100}%`;
  const ringPct = Math.round(holdProgress * 100);

  return (
    <View style={[styles.wrap, { left, top }]} pointerEvents="none">
      {visible && (
        <>
          <Svg width={116} height={116} style={styles.ringSvg}>
            <Circle cx={58} cy={58} r={50} stroke="rgba(255,255,255,0.12)" strokeWidth={4} fill="none" />
            <Circle
              cx={58}
              cy={58}
              r={50}
              stroke={FIND_COLOR(challenge.direction)}
              strokeWidth={5}
              fill="none"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - holdProgress)}`}
              strokeLinecap="round"
              rotation={-90}
              origin="58, 58"
            />
          </Svg>

          <Animated.View style={[styles.portal, portalStyle, { shadowColor: FIND_COLOR(challenge.direction) }]}>
            <Text style={styles.emoji}>{challenge.emoji}</Text>
          </Animated.View>

          <View style={[styles.labelWrap, { borderColor: FIND_COLOR(challenge.direction) }]}>
            <Text style={[styles.label, { color: FIND_COLOR(challenge.direction) }]}>{challenge.label}</Text>
            {!listenActive && <Text style={styles.pct}>{ringPct}%</Text>}
          </View>
        </>
      )}

      {listenActive && !visible && (
        <Animated.View style={[styles.listenPing, portalStyle, { borderColor: FIND_COLOR(challenge.direction) }]}>
          <Text style={styles.listenEmoji}>👂</Text>
        </Animated.View>
      )}
    </View>
  );
};

function FIND_COLOR(dir: SoundChallenge['direction']): string {
  switch (dir) {
    case 'left':
      return '#A78BFA';
    case 'right':
      return '#FB923C';
    case 'up':
      return '#FDE68A';
    case 'down':
      return '#38BDF8';
    default:
      return '#F59E0B';
  }
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', width: 116, height: 116, marginLeft: -58, marginTop: -58 },
  ringSvg: { position: 'absolute', left: 0, top: 0 },
  portal: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignSelf: 'center',
    marginTop: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 8,
  },
  emoji: { fontSize: 28 },
  labelWrap: {
    position: 'absolute',
    top: 96,
    width: 140,
    left: -12,
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(20,10,35,0.75)',
  },
  label: { fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  pct: { color: '#fff', fontSize: 12, fontWeight: '900' },
  listenPing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  listenEmoji: { fontSize: 24 },
});
