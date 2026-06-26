/** Neighborhood adventure backdrop — Community Explorer */
import { COMMUNITY_EXPLORER_THEME } from '@/components/game/occupational/level10/session9/communityExplorerTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = { joinPhase?: boolean };

export const CommunityExplorerVisuals: React.FC<Props> = ({ joinPhase = false }) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: joinPhase ? 850 : 2300, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [pulse, joinPhase]);

  const hubStyle = useAnimatedStyle(() => ({
    opacity: joinPhase ? 0.3 + pulse.value * 0.17 : 0.13 + pulse.value * 0.1,
    transform: [{ scale: joinPhase ? 1 + pulse.value * 0.06 : 1 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={COMMUNITY_EXPLORER_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.hubGlow, hubStyle]}>
        <Text style={styles.hub}>🏘️</Text>
      </Animated.View>
      {COMMUNITY_EXPLORER_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${5 + (i * 11) % 86}%`, top: `${8 + (i % 5) * 15}%`, opacity: 0.08 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  hubGlow: {
    position: 'absolute',
    top: '11%',
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(139,92,246,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(221,214,254,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hub: { fontSize: 28 },
  decor: { position: 'absolute', fontSize: 16 },
});
