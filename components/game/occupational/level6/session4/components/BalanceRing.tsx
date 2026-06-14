/**
 * BalanceRing — central hold indicator for the Static Balance games.
 * Shows the hero emoji inside a ring that pulses + recolors with balance
 * quality, plus a hold-progress bar and a status caption.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  hero: string;
  /** 0..1 balance quality. */
  quality: number;
  /** 0..1 hold progress toward the round goal. */
  progress: number;
  /** True while the child is currently balancing well. */
  balanced: boolean;
  caption: string;
  accent: string;
};

const qualityColor = (q: number) => {
  if (q >= 0.75) return '#34D399';
  if (q >= 0.5) return '#FBBF24';
  return '#FB7185';
};

export const BalanceRing: React.FC<Props> = ({ hero, quality, progress, balanced, caption, accent }) => {
  const pulse = useSharedValue(0);
  React.useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + (balanced ? pulse.value * 0.06 : 0) }],
    borderColor: qualityColor(quality),
    shadowOpacity: 0.4 + (balanced ? pulse.value * 0.4 : 0),
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.ring, { shadowColor: qualityColor(quality) }, ringStyle]}>
        <Text style={styles.hero}>{hero}</Text>
      </Animated.View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(progress * 100)}%`, backgroundColor: accent }]} />
      </View>
      <Text style={[styles.caption, { color: balanced ? '#CCFBF1' : '#FECDD3' }]}>{caption}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', alignSelf: 'center', top: '30%', alignItems: 'center', width: '80%' },
  ring: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,59,74,0.45)',
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  hero: { fontSize: 64 },
  track: {
    marginTop: 18,
    width: '76%',
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(5,59,74,0.65)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 7 },
  caption: { marginTop: 10, fontSize: 15, fontWeight: '800', textAlign: 'center' },
});
