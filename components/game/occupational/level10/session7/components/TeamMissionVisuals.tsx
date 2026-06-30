/** Squad adventure backdrop — Team Mission */
import { TEAM_MISSION_THEME } from '@/components/game/occupational/level10/session7/teamMissionTheme';
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

type Props = { missionPhase?: boolean };

export const TeamMissionVisuals: React.FC<Props> = ({ missionPhase = false }) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: missionPhase ? 1000 : 2600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [pulse, missionPhase]);

  const bannerStyle = useAnimatedStyle(() => ({
    opacity: missionPhase ? 0.22 + pulse.value * 0.14 : 0.1 + pulse.value * 0.08,
    transform: [{ scaleX: 0.9 + pulse.value * 0.12 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={TEAM_MISSION_THEME.bgGradient} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.teamBanner, bannerStyle]} />
      {TEAM_MISSION_THEME.decor.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.decor,
            { left: `${5 + (i * 11) % 86}%`, top: `${9 + (i % 5) * 15}%`, opacity: 0.08 + (i % 2) * 0.05 },
          ]}
        >
          {d}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  teamBanner: {
    position: 'absolute',
    top: '12%',
    alignSelf: 'center',
    width: 120,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(59,130,246,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(147,197,253,0.25)',
  },
  decor: { position: 'absolute', fontSize: 16 },
});
